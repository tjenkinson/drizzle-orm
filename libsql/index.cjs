'use strict';

var index = require('../index.cjs');
var relations = require('../relations-9f413b53.cjs');
var session = require('../session-276be7a3.cjs');
require('../errors-d0192d62.cjs');

class LibSQLSession extends session.SQLiteSession {
    client;
    schema;
    options;
    tx;
    logger;
    constructor(client, dialect, schema, options, tx) {
        super(dialect);
        this.client = client;
        this.schema = schema;
        this.options = options;
        this.tx = tx;
        this.logger = options.logger ?? new index.NoopLogger();
    }
    prepareQuery(query, fields, customResultMapper) {
        return new PreparedQuery(this.client, query.sql, query.params, this.logger, fields, this.tx, customResultMapper);
    }
    /*override */ batch(queries) {
        const builtQueries = queries.map((query) => {
            const builtQuery = this.dialect.sqlToQuery(query);
            return { sql: builtQuery.sql, args: builtQuery.params };
        });
        return this.client.batch(builtQueries);
    }
    async transaction(transaction, _config) {
        // TODO: support transaction behavior
        const libsqlTx = await this.client.transaction();
        const session = new LibSQLSession(this.client, this.dialect, this.schema, this.options, libsqlTx);
        const tx = new LibSQLTransaction('async', this.dialect, session, this.schema);
        try {
            const result = await transaction(tx);
            await libsqlTx.commit();
            return result;
        }
        catch (err) {
            await libsqlTx.rollback();
            throw err;
        }
    }
}
class LibSQLTransaction extends session.SQLiteTransaction {
    async transaction(transaction) {
        const savepointName = `sp${this.nestedIndex}`;
        const tx = new LibSQLTransaction('async', this.dialect, this.session, this.schema, this.nestedIndex + 1);
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
    tx;
    customResultMapper;
    constructor(client, queryString, params, logger, fields, tx, customResultMapper) {
        super();
        this.client = client;
        this.queryString = queryString;
        this.params = params;
        this.logger = logger;
        this.fields = fields;
        this.tx = tx;
        this.customResultMapper = customResultMapper;
    }
    run(placeholderValues) {
        const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
        this.logger.logQuery(this.queryString, params);
        const stmt = { sql: this.queryString, args: params };
        return this.tx ? this.tx.execute(stmt) : this.client.execute(stmt);
    }
    async all(placeholderValues) {
        const { fields, joinsNotNullableMap, logger, queryString, tx, client, customResultMapper } = this;
        if (!fields && !customResultMapper) {
            const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
            logger.logQuery(queryString, params);
            const stmt = { sql: queryString, args: params };
            return (tx ? tx.execute(stmt) : client.execute(stmt)).then(({ rows }) => rows.map((row) => normalizeRow(row)));
        }
        const rows = await this.values(placeholderValues);
        if (customResultMapper) {
            return customResultMapper(rows, normalizeFieldValue);
        }
        return rows.map((row) => {
            return relations.mapResultRow(fields, Array.prototype.slice.call(row).map((v) => normalizeFieldValue(v)), joinsNotNullableMap);
        });
    }
    async get(placeholderValues) {
        const { fields, joinsNotNullableMap, logger, queryString, tx, client, customResultMapper } = this;
        if (!fields && !customResultMapper) {
            const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
            logger.logQuery(queryString, params);
            const stmt = { sql: queryString, args: params };
            return (tx ? tx.execute(stmt) : client.execute(stmt)).then(({ rows }) => normalizeRow(rows[0]));
        }
        const rows = await this.values(placeholderValues);
        if (!rows[0]) {
            return undefined;
        }
        if (customResultMapper) {
            return customResultMapper(rows, normalizeFieldValue);
        }
        return relations.mapResultRow(fields, Array.prototype.slice.call(rows[0]).map((v) => normalizeFieldValue(v)), joinsNotNullableMap);
    }
    values(placeholderValues) {
        const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
        this.logger.logQuery(this.queryString, params);
        const stmt = { sql: this.queryString, args: params };
        return (this.tx ? this.tx.execute(stmt) : this.client.execute(stmt)).then(({ rows }) => rows);
    }
}
function normalizeRow(obj) {
    // The libSQL node-sqlite3 compatibility wrapper returns rows
    // that can be accessed both as objects and arrays. Let's
    // turn them into objects what's what other SQLite drivers
    // do.
    return Object.keys(obj).reduce((acc, key) => {
        if (Object.prototype.propertyIsEnumerable.call(obj, key)) {
            acc[key] = obj[key];
        }
        return acc;
    }, {});
}
function normalizeFieldValue(value) {
    if (value instanceof ArrayBuffer) {
        if (typeof Buffer !== 'undefined') {
            if (!(value instanceof Buffer)) {
                return Buffer.from(value);
            }
            return value;
        }
        if (typeof TextDecoder !== 'undefined') {
            return new TextDecoder().decode(value);
        }
        throw new Error('TextDecoder is not available. Please provide either Buffer or TextDecoder polyfill.');
    }
    return value;
}

function drizzle(client, config = {}) {
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
    const session$1 = new LibSQLSession(client, dialect, schema, { logger }, undefined);
    return new session.BaseSQLiteDatabase('async', dialect, session$1, schema);
}

exports.LibSQLSession = LibSQLSession;
exports.LibSQLTransaction = LibSQLTransaction;
exports.PreparedQuery = PreparedQuery;
exports.drizzle = drizzle;
//# sourceMappingURL=index.cjs.map
