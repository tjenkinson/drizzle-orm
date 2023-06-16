'use strict';

var index = require('../index.cjs');
var session = require('../session-95978d5c.cjs');
var relations = require('../relations-9f413b53.cjs');
require('../errors-d0192d62.cjs');

class PostgresJsPreparedQuery extends session.PreparedQuery {
    client;
    query;
    params;
    logger;
    fields;
    customResultMapper;
    constructor(client, query, params, logger, fields, customResultMapper) {
        super();
        this.client = client;
        this.query = query;
        this.params = params;
        this.logger = logger;
        this.fields = fields;
        this.customResultMapper = customResultMapper;
    }
    async execute(placeholderValues = {}) {
        return relations.tracer.startActiveSpan('drizzle.execute', async (span) => {
            const params = relations.fillPlaceholders(this.params, placeholderValues);
            span?.setAttributes({
                'drizzle.query.text': this.query,
                'drizzle.query.params': JSON.stringify(params),
            });
            this.logger.logQuery(this.query, params);
            const { fields, query, client, joinsNotNullableMap, customResultMapper } = this;
            if (!fields && !customResultMapper) {
                return relations.tracer.startActiveSpan('drizzle.driver.execute', () => {
                    return client.unsafe(query, params);
                });
            }
            const rows = await relations.tracer.startActiveSpan('drizzle.driver.execute', () => {
                span?.setAttributes({
                    'drizzle.query.text': query,
                    'drizzle.query.params': JSON.stringify(params),
                });
                return client.unsafe(query, params).values();
            });
            return relations.tracer.startActiveSpan('drizzle.mapResponse', () => {
                return customResultMapper
                    ? customResultMapper(rows)
                    : rows.map((row) => relations.mapResultRow(fields, row, joinsNotNullableMap));
            });
        });
    }
    all(placeholderValues = {}) {
        return relations.tracer.startActiveSpan('drizzle.execute', async (span) => {
            const params = relations.fillPlaceholders(this.params, placeholderValues);
            span?.setAttributes({
                'drizzle.query.text': this.query,
                'drizzle.query.params': JSON.stringify(params),
            });
            this.logger.logQuery(this.query, params);
            return relations.tracer.startActiveSpan('drizzle.driver.execute', () => {
                span?.setAttributes({
                    'drizzle.query.text': this.query,
                    'drizzle.query.params': JSON.stringify(params),
                });
                return this.client.unsafe(this.query, params);
            });
        });
    }
}
class PostgresJsSession extends session.PgSession {
    client;
    schema;
    options;
    logger;
    constructor(client, dialect, schema, 
    /** @internal */
    options = {}) {
        super(dialect);
        this.client = client;
        this.schema = schema;
        this.options = options;
        this.logger = options.logger ?? new index.NoopLogger();
    }
    prepareQuery(query, fields, name, customResultMapper) {
        return new PostgresJsPreparedQuery(this.client, query.sql, query.params, this.logger, fields, customResultMapper);
    }
    query(query, params) {
        this.logger.logQuery(query, params);
        return this.client.unsafe(query, params).values();
    }
    queryObjects(query, params) {
        return this.client.unsafe(query, params);
    }
    transaction(transaction, config) {
        return this.client.begin(async (client) => {
            const session = new PostgresJsSession(client, this.dialect, this.schema, this.options);
            const tx = new PostgresJsTransaction(this.dialect, session, this.schema);
            if (config) {
                await tx.setTransaction(config);
            }
            return transaction(tx);
        });
    }
}
class PostgresJsTransaction extends session.PgTransaction {
    session;
    constructor(dialect, 
    /** @internal */
    session, schema, nestedIndex = 0) {
        super(dialect, session, schema, nestedIndex);
        this.session = session;
    }
    transaction(transaction) {
        return this.session.client.savepoint((client) => {
            const session = new PostgresJsSession(client, this.dialect, this.schema, this.session.options);
            const tx = new PostgresJsTransaction(this.dialect, session, this.schema);
            return transaction(tx);
        });
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
    const session$1 = new PostgresJsSession(client, dialect, schema, { logger });
    return new session.PgDatabase(dialect, session$1, schema);
}

exports.PostgresJsPreparedQuery = PostgresJsPreparedQuery;
exports.PostgresJsSession = PostgresJsSession;
exports.PostgresJsTransaction = PostgresJsTransaction;
exports.drizzle = drizzle;
//# sourceMappingURL=index.cjs.map
