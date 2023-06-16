import { NoopLogger, DefaultLogger } from '../index.mjs';
import { s as sql, f as fillPlaceholders, m as mapResultRow, e as extractTablesRelationalConfig, c as createTableRelationsHelpers } from '../relations-3eb6fe55.mjs';
import { S as SQLiteSession, a as SQLiteTransaction, P as PreparedQuery$1, B as BaseSQLiteDatabase, b as SQLiteSyncDialect } from '../session-b53b3ab7.mjs';
import '../errors-bb636d84.mjs';

class BetterSQLiteSession extends SQLiteSession {
    client;
    schema;
    logger;
    constructor(client, dialect, schema, options = {}) {
        super(dialect);
        this.client = client;
        this.schema = schema;
        this.logger = options.logger ?? new NoopLogger();
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
class BetterSQLiteTransaction extends SQLiteTransaction {
    transaction(transaction) {
        const savepointName = `sp${this.nestedIndex}`;
        const tx = new BetterSQLiteTransaction('sync', this.dialect, this.session, this.schema, this.nestedIndex + 1);
        this.session.run(sql.raw(`savepoint ${savepointName}`));
        try {
            const result = transaction(tx);
            this.session.run(sql.raw(`release savepoint ${savepointName}`));
            return result;
        }
        catch (err) {
            this.session.run(sql.raw(`rollback to savepoint ${savepointName}`));
            throw err;
        }
    }
}
class PreparedQuery extends PreparedQuery$1 {
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
        const params = fillPlaceholders(this.params, placeholderValues ?? {});
        this.logger.logQuery(this.queryString, params);
        return this.stmt.run(...params);
    }
    all(placeholderValues) {
        const { fields, joinsNotNullableMap, queryString, logger, stmt, customResultMapper } = this;
        if (!fields && !customResultMapper) {
            const params = fillPlaceholders(this.params, placeholderValues ?? {});
            logger.logQuery(queryString, params);
            return stmt.all(...params);
        }
        const rows = this.values(placeholderValues);
        if (customResultMapper) {
            return customResultMapper(rows);
        }
        return rows.map((row) => mapResultRow(fields, row, joinsNotNullableMap));
    }
    get(placeholderValues) {
        const params = fillPlaceholders(this.params, placeholderValues ?? {});
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
        return mapResultRow(fields, row, joinsNotNullableMap);
    }
    values(placeholderValues) {
        const params = fillPlaceholders(this.params, placeholderValues ?? {});
        this.logger.logQuery(this.queryString, params);
        return this.stmt.raw().all(...params);
    }
}

function drizzle(client, config = {}) {
    const dialect = new SQLiteSyncDialect();
    let logger;
    if (config.logger === true) {
        logger = new DefaultLogger();
    }
    else if (config.logger !== false) {
        logger = config.logger;
    }
    let schema;
    if (config.schema) {
        const tablesConfig = extractTablesRelationalConfig(config.schema, createTableRelationsHelpers);
        schema = {
            fullSchema: config.schema,
            schema: tablesConfig.tables,
            tableNamesMap: tablesConfig.tableNamesMap,
        };
    }
    const session = new BetterSQLiteSession(client, dialect, schema, { logger });
    return new BaseSQLiteDatabase('sync', dialect, session, schema);
}

export { BetterSQLiteSession, BetterSQLiteTransaction, PreparedQuery, drizzle };
//# sourceMappingURL=index.mjs.map
