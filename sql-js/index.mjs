import { NoopLogger, DefaultLogger } from '../index.mjs';
import { s as sql, f as fillPlaceholders, m as mapResultRow, e as extractTablesRelationalConfig, c as createTableRelationsHelpers } from '../relations-3eb6fe55.mjs';
import { S as SQLiteSession, a as SQLiteTransaction, P as PreparedQuery$1, B as BaseSQLiteDatabase, b as SQLiteSyncDialect } from '../session-b53b3ab7.mjs';
import '../errors-bb636d84.mjs';

class SQLJsSession extends SQLiteSession {
    client;
    schema;
    logger;
    constructor(client, dialect, schema, options = {}) {
        super(dialect);
        this.client = client;
        this.schema = schema;
        this.logger = options.logger ?? new NoopLogger();
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
        this.run(sql.raw(`begin${config.behavior ? ` ${config.behavior}` : ''}`));
        try {
            const result = transaction(tx);
            this.run(sql `commit`);
            return result;
        }
        catch (err) {
            this.run(sql `rollback`);
            throw err;
        }
    }
}
class SQLJsTransaction extends SQLiteTransaction {
    transaction(transaction) {
        const savepointName = `sp${this.nestedIndex + 1}`;
        const tx = new SQLJsTransaction('sync', this.dialect, this.session, this.schema, this.nestedIndex + 1);
        tx.run(sql.raw(`savepoint ${savepointName}`));
        try {
            const result = transaction(tx);
            tx.run(sql.raw(`release savepoint ${savepointName}`));
            return result;
        }
        catch (err) {
            tx.run(sql.raw(`rollback to savepoint ${savepointName}`));
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
        const params = fillPlaceholders(this.params, placeholderValues ?? {});
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
            const params = fillPlaceholders(this.params, placeholderValues ?? {});
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
        return rows.map((row) => mapResultRow(fields, row.map((v) => normalizeFieldValue(v)), joinsNotNullableMap));
    }
    get(placeholderValues) {
        const params = fillPlaceholders(this.params, placeholderValues ?? {});
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
        return mapResultRow(fields, row.map((v) => normalizeFieldValue(v)), joinsNotNullableMap);
    }
    values(placeholderValues) {
        const params = fillPlaceholders(this.params, placeholderValues ?? {});
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
    const session = new SQLJsSession(client, dialect, schema, { logger });
    return new BaseSQLiteDatabase('sync', dialect, session, schema);
}

export { PreparedQuery, SQLJsSession, SQLJsTransaction, drizzle };
//# sourceMappingURL=index.mjs.map