'use strict';

var serverless = require('@neondatabase/serverless');
var index = require('../index.cjs');
var session = require('../session-95978d5c.cjs');
var relations = require('../relations-9f413b53.cjs');
require('../errors-d0192d62.cjs');

class NeonPreparedQuery extends session.PreparedQuery {
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
        const params = relations.fillPlaceholders(this.params, placeholderValues);
        this.logger.logQuery(this.rawQuery.text, params);
        const { fields, client, rawQuery, query, joinsNotNullableMap, customResultMapper } = this;
        if (!fields && !customResultMapper) {
            return client.query(rawQuery, params);
        }
        const result = await client.query(query, params);
        return customResultMapper
            ? customResultMapper(result.rows)
            : result.rows.map((row) => relations.mapResultRow(fields, row, joinsNotNullableMap));
    }
    all(placeholderValues = {}) {
        const params = relations.fillPlaceholders(this.params, placeholderValues);
        this.logger.logQuery(this.rawQuery.text, params);
        return this.client.query(this.rawQuery, params).then((result) => result.rows);
    }
    values(placeholderValues = {}) {
        const params = relations.fillPlaceholders(this.params, placeholderValues);
        this.logger.logQuery(this.rawQuery.text, params);
        return this.client.query(this.query, params).then((result) => result.rows);
    }
}
class NeonSession extends session.PgSession {
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
        return new NeonPreparedQuery(this.client, query.sql, query.params, this.logger, fields, name, customResultMapper);
    }
    async query(query, params) {
        this.logger.logQuery(query, params);
        const result = await this.client.query({
            rowMode: 'array',
            text: query,
            values: params,
        });
        return result;
    }
    async queryObjects(query, params) {
        return this.client.query(query, params);
    }
    async transaction(transaction, config = {}) {
        const session = this.client instanceof serverless.Pool
            ? new NeonSession(await this.client.connect(), this.dialect, this.schema, this.options)
            : this;
        const tx = new NeonTransaction(this.dialect, session, this.schema);
        await tx.execute(relations.sql `begin ${tx.getTransactionConfigSQL(config)}`);
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
            if (this.client instanceof serverless.Pool) {
                session.client.release();
            }
        }
    }
}
class NeonTransaction extends session.PgTransaction {
    async transaction(transaction) {
        const savepointName = `sp${this.nestedIndex + 1}`;
        const tx = new NeonTransaction(this.dialect, this.session, this.schema, this.nestedIndex + 1);
        await tx.execute(relations.sql.raw(`savepoint ${savepointName}`));
        try {
            const result = await transaction(tx);
            await tx.execute(relations.sql.raw(`release savepoint ${savepointName}`));
            return result;
        }
        catch (e) {
            await tx.execute(relations.sql.raw(`rollback to savepoint ${savepointName}`));
            throw e;
        }
    }
}

class NeonDriver {
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
        return new NeonSession(this.client, this.dialect, schema, { logger: this.options.logger });
    }
    initMappers() {
        serverless.types.setTypeParser(serverless.types.builtins.TIMESTAMPTZ, (val) => val);
        serverless.types.setTypeParser(serverless.types.builtins.TIMESTAMP, (val) => val);
        serverless.types.setTypeParser(serverless.types.builtins.DATE, (val) => val);
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
    const driver = new NeonDriver(client, dialect, { logger });
    const session$1 = driver.createSession(schema);
    return new session.PgDatabase(dialect, session$1, schema);
}

exports.NeonDriver = NeonDriver;
exports.NeonPreparedQuery = NeonPreparedQuery;
exports.NeonSession = NeonSession;
exports.NeonTransaction = NeonTransaction;
exports.drizzle = drizzle;
//# sourceMappingURL=index.cjs.map
