'use strict';

var index = require('../index.cjs');
var relations = require('../relations-9f413b53.cjs');
var session = require('../session-276be7a3.cjs');
require('../errors-d0192d62.cjs');

class SQLiteRemoteSession extends session.SQLiteSession {
    client;
    schema;
    logger;
    constructor(client, dialect, schema, options = {}) {
        super(dialect);
        this.client = client;
        this.schema = schema;
        this.logger = options.logger ?? new index.NoopLogger();
    }
    prepareQuery(query, fields) {
        return new PreparedQuery(this.client, query.sql, query.params, this.logger, fields);
    }
    async transaction(transaction, config) {
        const tx = new SQLiteProxyTransaction('async', this.dialect, this, this.schema);
        await this.run(relations.sql.raw(`begin${config?.behavior ? ' ' + config.behavior : ''}`));
        try {
            const result = await transaction(tx);
            await this.run(relations.sql `commit`);
            return result;
        }
        catch (err) {
            await this.run(relations.sql `rollback`);
            throw err;
        }
    }
}
class SQLiteProxyTransaction extends session.SQLiteTransaction {
    async transaction(transaction) {
        const savepointName = `sp${this.nestedIndex}`;
        const tx = new SQLiteProxyTransaction('async', this.dialect, this.session, this.schema, this.nestedIndex + 1);
        await this.session.run(relations.sql.raw(`savepoint ${savepointName}`));
        try {
            const result = await transaction(tx);
            await this.session.run(relations.sql.raw(`release savepoint ${savepointName}`));
            return result;
        }
        catch (err) {
            await this.session.run(relations.sql.raw(`rollback to savepoint ${savepointName}`));
            throw err;
        }
    }
}
class PreparedQuery extends session.PreparedQuery {
    client;
    queryString;
    params;
    logger;
    fields;
    constructor(client, queryString, params, logger, fields) {
        super();
        this.client = client;
        this.queryString = queryString;
        this.params = params;
        this.logger = logger;
        this.fields = fields;
    }
    run(placeholderValues) {
        const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
        this.logger.logQuery(this.queryString, params);
        return this.client(this.queryString, params, 'run');
    }
    async all(placeholderValues) {
        const { fields, queryString, logger, joinsNotNullableMap } = this;
        const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
        logger.logQuery(queryString, params);
        const { rows } = await this.client(queryString, params, 'all');
        if (fields) {
            return rows.map((row) => relations.mapResultRow(fields, row, joinsNotNullableMap));
        }
        return this.client(queryString, params, 'all').then(({ rows }) => rows);
    }
    async get(placeholderValues) {
        const { fields, queryString, logger, joinsNotNullableMap } = this;
        const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
        logger.logQuery(queryString, params);
        const clientResult = await this.client(queryString, params, 'get');
        if (fields) {
            if (clientResult.rows === undefined) {
                return relations.mapResultRow(fields, [], joinsNotNullableMap);
            }
            return relations.mapResultRow(fields, clientResult.rows, joinsNotNullableMap);
        }
        return clientResult.rows;
    }
    async values(placeholderValues) {
        const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
        this.logger.logQuery(this.queryString, params);
        const clientResult = await this.client(this.queryString, params, 'values');
        return clientResult.rows;
    }
}

function drizzle(callback, config = {}) {
    const dialect = new session.SQLiteAsyncDialect();
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
    const session$1 = new SQLiteRemoteSession(callback, dialect, schema, { logger });
    return new session.BaseSQLiteDatabase('async', dialect, session$1, schema);
}

exports.PreparedQuery = PreparedQuery;
exports.SQLiteProxyTransaction = SQLiteProxyTransaction;
exports.SQLiteRemoteSession = SQLiteRemoteSession;
exports.drizzle = drizzle;
//# sourceMappingURL=index.cjs.map
