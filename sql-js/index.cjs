'use strict';

var index = require('../index.cjs');
var relations = require('../relations-9f413b53.cjs');
var session = require('../session-276be7a3.cjs');
require('../errors-d0192d62.cjs');

class SQLJsSession extends session.SQLiteSession {
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
        const stmt = this.client.prepare(query.sql);
        return new PreparedQuery(stmt, query.sql, query.params, this.logger, fields);
    }
    prepareOneTimeQuery(query, fields, customResultMapper) {
        const stmt = this.client.prepare(query.sql);
        return new PreparedQuery(stmt, query.sql, query.params, this.logger, fields, customResultMapper, true);
    }
    transaction(transaction, config = {}) {
        const tx = new SQLJsTransaction('sync', this.dialect, this, this.schema);
        this.run(relations.sql.raw(`begin${config.behavior ? ` ${config.behavior}` : ''}`));
        try {
            const result = transaction(tx);
            this.run(relations.sql `commit`);
            return result;
        }
        catch (err) {
            this.run(relations.sql `rollback`);
            throw err;
        }
    }
}
class SQLJsTransaction extends session.SQLiteTransaction {
    transaction(transaction) {
        const savepointName = `sp${this.nestedIndex + 1}`;
        const tx = new SQLJsTransaction('sync', this.dialect, this.session, this.schema, this.nestedIndex + 1);
        tx.run(relations.sql.raw(`savepoint ${savepointName}`));
        try {
            const result = transaction(tx);
            tx.run(relations.sql.raw(`release savepoint ${savepointName}`));
            return result;
        }
        catch (err) {
            tx.run(relations.sql.raw(`rollback to savepoint ${savepointName}`));
            throw err;
        }
    }
}
class PreparedQuery extends session.PreparedQuery {
    stmt;
    queryString;
    params;
    logger;
    fields;
    customResultMapper;
    isOneTimeQuery;
    constructor(stmt, queryString, params, logger, fields, customResultMapper, isOneTimeQuery = false) {
        super();
        this.stmt = stmt;
        this.queryString = queryString;
        this.params = params;
        this.logger = logger;
        this.fields = fields;
        this.customResultMapper = customResultMapper;
        this.isOneTimeQuery = isOneTimeQuery;
    }
    run(placeholderValues) {
        const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
        this.logger.logQuery(this.queryString, params);
        const result = this.stmt.run(params);
        if (this.isOneTimeQuery) {
            this.free();
        }
        return result;
    }
    all(placeholderValues) {
        const { fields, joinsNotNullableMap, logger, queryString, stmt, isOneTimeQuery, customResultMapper } = this;
        if (!fields && !customResultMapper) {
            const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
            logger.logQuery(queryString, params);
            stmt.bind(params);
            const rows = [];
            while (stmt.step()) {
                rows.push(stmt.getAsObject());
            }
            if (isOneTimeQuery) {
                this.free();
            }
            return rows;
        }
        const rows = this.values(placeholderValues);
        if (customResultMapper) {
            return customResultMapper(rows, normalizeFieldValue);
        }
        return rows.map((row) => relations.mapResultRow(fields, row.map((v) => normalizeFieldValue(v)), joinsNotNullableMap));
    }
    get(placeholderValues) {
        const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
        this.logger.logQuery(this.queryString, params);
        const { fields, stmt, isOneTimeQuery, joinsNotNullableMap, customResultMapper } = this;
        if (!fields && !customResultMapper) {
            const result = stmt.getAsObject(params);
            if (isOneTimeQuery) {
                this.free();
            }
            return result;
        }
        const row = stmt.get(params);
        if (isOneTimeQuery) {
            this.free();
        }
        if (!row) {
            return undefined;
        }
        if (customResultMapper) {
            return customResultMapper([row], normalizeFieldValue);
        }
        return relations.mapResultRow(fields, row.map((v) => normalizeFieldValue(v)), joinsNotNullableMap);
    }
    values(placeholderValues) {
        const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
        this.logger.logQuery(this.queryString, params);
        this.stmt.bind(params);
        const rows = [];
        while (this.stmt.step()) {
            rows.push(this.stmt.get());
        }
        if (this.isOneTimeQuery) {
            this.free();
        }
        return rows;
    }
    free() {
        return this.stmt.free();
    }
}
function normalizeFieldValue(value) {
    if (value instanceof Uint8Array) {
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
    const dialect = new session.SQLiteSyncDialect();
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
    const session$1 = new SQLJsSession(client, dialect, schema, { logger });
    return new session.BaseSQLiteDatabase('sync', dialect, session$1, schema);
}

exports.PreparedQuery = PreparedQuery;
exports.SQLJsSession = SQLJsSession;
exports.SQLJsTransaction = SQLJsTransaction;
exports.drizzle = drizzle;
//# sourceMappingURL=index.cjs.map
