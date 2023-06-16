'use strict';

var pg = require('pg');
var index = require('../index.cjs');
var session = require('../session-95978d5c.cjs');
var relations = require('../relations-9f413b53.cjs');
require('../errors-d0192d62.cjs');

const { Pool } = pg;
class NodePgPreparedQuery extends session.PreparedQuery {
    client;
    params;
    logger;
    fields;
    customResultMapper;
    rawQuery;
    query;
    constructor(client, queryString, params, logger, fields, name, customResultMapper) {
        super();
        this.client = client;
        this.params = params;
        this.logger = logger;
        this.fields = fields;
        this.customResultMapper = customResultMapper;
        this.rawQuery = {
            name,
            text: queryString,
        };
        this.query = {
            name,
            text: queryString,
            rowMode: 'array',
        };
    }
    async execute(placeholderValues = {}) {
        return relations.tracer.startActiveSpan('drizzle.execute', async () => {
            const params = relations.fillPlaceholders(this.params, placeholderValues);
            this.logger.logQuery(this.rawQuery.text, params);
            const { fields, rawQuery, client, query, joinsNotNullableMap, customResultMapper } = this;
            if (!fields && !customResultMapper) {
                return relations.tracer.startActiveSpan('drizzle.driver.execute', async (span) => {
                    span?.setAttributes({
                        'drizzle.query.name': rawQuery.name,
                        'drizzle.query.text': rawQuery.text,
                        'drizzle.query.params': JSON.stringify(params),
                    });
                    return client.query(rawQuery, params);
                });
            }
            const result = await relations.tracer.startActiveSpan('drizzle.driver.execute', (span) => {
                span?.setAttributes({
                    'drizzle.query.name': query.name,
                    'drizzle.query.text': query.text,
                    'drizzle.query.params': JSON.stringify(params),
                });
                return client.query(query, params);
            });
            return relations.tracer.startActiveSpan('drizzle.mapResponse', () => {
                return customResultMapper
                    ? customResultMapper(result.rows)
                    : result.rows.map((row) => relations.mapResultRow(fields, row, joinsNotNullableMap));
            });
        });
    }
    all(placeholderValues = {}) {
        return relations.tracer.startActiveSpan('drizzle.execute', () => {
            const params = relations.fillPlaceholders(this.params, placeholderValues);
            this.logger.logQuery(this.rawQuery.text, params);
            return relations.tracer.startActiveSpan('drizzle.driver.execute', (span) => {
                span?.setAttributes({
                    'drizzle.query.name': this.rawQuery.name,
                    'drizzle.query.text': this.rawQuery.text,
                    'drizzle.query.params': JSON.stringify(params),
                });
                return this.client.query(this.rawQuery, params).then((result) => result.rows);
            });
        });
    }
}
class NodePgSession extends session.PgSession {
    client;
    schema;
    options;
    logger;
    constructor(client, dialect, schema, options = {}) {
        super(dialect);
        this.client = client;
        this.schema = schema;
        this.options = options;
        this.logger = options.logger ?? new index.NoopLogger();
    }
    prepareQuery(query, fields, name, customResultMapper) {
        return new NodePgPreparedQuery(this.client, query.sql, query.params, this.logger, fields, name, customResultMapper);
    }
    async transaction(transaction, config) {
        const session = this.client instanceof Pool
            ? new NodePgSession(await this.client.connect(), this.dialect, this.schema, this.options)
            : this;
        const tx = new NodePgTransaction(this.dialect, session, this.schema);
        await tx.execute(relations.sql `begin${config ? relations.sql ` ${tx.getTransactionConfigSQL(config)}` : undefined}`);
        try {
            const result = await transaction(tx);
            await tx.execute(relations.sql `commit`);
            return result;
        }
        catch (error) {
            await tx.execute(relations.sql `rollback`);
            throw error;
        }
        finally {
            if (this.client instanceof Pool) {
                session.client.release();
            }
        }
    }
}
class NodePgTransaction extends session.PgTransaction {
    async transaction(transaction) {
        const savepointName = `sp${this.nestedIndex + 1}`;
        const tx = new NodePgTransaction(this.dialect, this.session, this.schema, this.nestedIndex + 1);
        await tx.execute(relations.sql.raw(`savepoint ${savepointName}`));
        try {
            const result = await transaction(tx);
            await tx.execute(relations.sql.raw(`release savepoint ${savepointName}`));
            return result;
        }
        catch (err) {
            await tx.execute(relations.sql.raw(`rollback to savepoint ${savepointName}`));
            throw err;
        }
    }
}

const { types } = pg;
class NodePgDriver {
    client;
    dialect;
    options;
    constructor(client, dialect, options = {}) {
        this.client = client;
        this.dialect = dialect;
        this.options = options;
        this.initMappers();
    }
    createSession(schema) {
        return new NodePgSession(this.client, this.dialect, schema, { logger: this.options.logger });
    }
    initMappers() {
        types.setTypeParser(types.builtins.TIMESTAMPTZ, (val) => val);
        types.setTypeParser(types.builtins.TIMESTAMP, (val) => val);
        types.setTypeParser(types.builtins.DATE, (val) => val);
    }
}
function drizzle(client, config = {}) {
    const dialect = new relations.PgDialect();
    let logger;
    if (config.logger === true) {
        logger = new index.DefaultLogger();
    }
    else if (config.logger !== false) {
        logger = config.logger;
    }
    let schema;
    if (config.schema) {
        const tablesConfig = relations.extractTablesRelationalConfig(config.schema, relations.createTableRelationsHelpers);
        schema = {
            fullSchema: config.schema,
            schema: tablesConfig.tables,
            tableNamesMap: tablesConfig.tableNamesMap,
        };
    }
    const driver = new NodePgDriver(client, dialect, { logger });
    const session$1 = driver.createSession(schema);
    return new session.PgDatabase(dialect, session$1, schema);
}

exports.NodePgDriver = NodePgDriver;
exports.NodePgPreparedQuery = NodePgPreparedQuery;
exports.NodePgSession = NodePgSession;
exports.NodePgTransaction = NodePgTransaction;
exports.drizzle = drizzle;
//# sourceMappingURL=index.cjs.map
