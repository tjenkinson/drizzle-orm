'use strict';

var index = require('../index.cjs');
var relations = require('../relations-9f413b53.cjs');
var session = require('../session-276be7a3.cjs');
require('../errors-d0192d62.cjs');

class BetterSQLiteSession extends session.SQLiteSession {
    client;
    schema;
    logger;
    constructor(client, dialect, schema, options = {}) {
        super(dialect);
        this.client = client;
        this.schema = schema;
        this.logger = options.logger ?? new index.NoopLogger();
    }
    prepareQuery(query, fields, customResultMapper) {
        const stmt = this.client.prepare(query.sql);
        return new PreparedQuery(stmt, query.sql, query.params, this.logger, fields, customResultMapper);
    }
    transaction(transaction, config = {}) {
        const tx = new BetterSQLiteTransaction('sync', this.dialect, this, this.schema);
        const nativeTx = this.client.transaction(transaction);
        return nativeTx[config.behavior ?? 'deferred'](tx);
    }
}
class BetterSQLiteTransaction extends session.SQLiteTransaction {
    transaction(transaction) {
        const savepointName = `sp${this.nestedIndex}`;
        const tx = new BetterSQLiteTransaction('sync', this.dialect, this.session, this.schema, this.nestedIndex + 1);
        this.session.run(relations.sql.raw(`savepoint ${savepointName}`));
        try {
            const result = transaction(tx);
            this.session.run(relations.sql.raw(`release savepoint ${savepointName}`));
            return result;
        }
        catch (err) {
            this.session.run(relations.sql.raw(`rollback to savepoint ${savepointName}`));
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
    constructor(stmt, queryString, params, logger, fields, customResultMapper) {
        super();
        this.stmt = stmt;
        this.queryString = queryString;
        this.params = params;
        this.logger = logger;
        this.fields = fields;
        this.customResultMapper = customResultMapper;
    }
    run(placeholderValues) {
        const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
        this.logger.logQuery(this.queryString, params);
        return this.stmt.run(...params);
    }
    all(placeholderValues) {
        const { fields, joinsNotNullableMap, queryString, logger, stmt, customResultMapper } = this;
        if (!fields && !customResultMapper) {
            const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
            logger.logQuery(queryString, params);
            return stmt.all(...params);
        }
        const rows = this.values(placeholderValues);
        if (customResultMapper) {
            return customResultMapper(rows);
        }
        return rows.map((row) => relations.mapResultRow(fields, row, joinsNotNullableMap));
    }
    get(placeholderValues) {
        const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
        this.logger.logQuery(this.queryString, params);
        const { fields, stmt, joinsNotNullableMap, customResultMapper } = this;
        if (!fields && !customResultMapper) {
            return stmt.get(...params);
        }
        const row = stmt.raw().get(...params);
        if (!row) {
            return undefined;
        }
        if (customResultMapper) {
            return customResultMapper([row]);
        }
        return relations.mapResultRow(fields, row, joinsNotNullableMap);
    }
    values(placeholderValues) {
        const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
        this.logger.logQuery(this.queryString, params);
        return this.stmt.raw().all(...params);
    }
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
    const session$1 = new BetterSQLiteSession(client, dialect, schema, { logger });
    return new session.BaseSQLiteDatabase('sync', dialect, session$1, schema);
}

exports.BetterSQLiteSession = BetterSQLiteSession;
exports.BetterSQLiteTransaction = BetterSQLiteTransaction;
exports.PreparedQuery = PreparedQuery;
exports.drizzle = drizzle;
//# sourceMappingURL=index.cjs.map
