import { NoopLogger, DefaultLogger } from '../index.mjs';
import { s as sql, f as fillPlaceholders, m as mapResultRow, e as extractTablesRelationalConfig, c as createTableRelationsHelpers } from '../relations-3eb6fe55.mjs';
import { S as SQLiteSession, a as SQLiteTransaction, P as PreparedQuery$1, B as BaseSQLiteDatabase, d as SQLiteAsyncDialect } from '../session-b53b3ab7.mjs';
import '../errors-bb636d84.mjs';

class SQLiteRemoteSession extends SQLiteSession {
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
        return new PreparedQuery(this.client, query.sql, query.params, this.logger, fields);
    }
    async transaction(transaction, config) {
        const tx = new SQLiteProxyTransaction('async', this.dialect, this, this.schema);
        await this.run(sql.raw(`begin${config?.behavior ? ' ' + config.behavior : ''}`));
        try {
            const result = await transaction(tx);
            await this.run(sql `commit`);
            return result;
        }
        catch (err) {
            await this.run(sql `rollback`);
            throw err;
        }
    }
}
class SQLiteProxyTransaction extends SQLiteTransaction {
    async transaction(transaction) {
        const savepointName = `sp${this.nestedIndex}`;
        const tx = new SQLiteProxyTransaction('async', this.dialect, this.session, this.schema, this.nestedIndex + 1);
        await this.session.run(sql.raw(`savepoint ${savepointName}`));
        try {
            const result = await transaction(tx);
            await this.session.run(sql.raw(`release savepoint ${savepointName}`));
            return result;
        }
        catch (err) {
            await this.session.run(sql.raw(`rollback to savepoint ${savepointName}`));
            throw err;
        }
    }
}
class PreparedQuery extends PreparedQuery$1 {
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
        const params = fillPlaceholders(this.params, placeholderValues ?? {});
        this.logger.logQuery(this.queryString, params);
        return this.client(this.queryString, params, 'run');
    }
    async all(placeholderValues) {
        const { fields, queryString, logger, joinsNotNullableMap } = this;
        const params = fillPlaceholders(this.params, placeholderValues ?? {});
        logger.logQuery(queryString, params);
        const { rows } = await this.client(queryString, params, 'all');
        if (fields) {
            return rows.map((row) => mapResultRow(fields, row, joinsNotNullableMap));
        }
        return this.client(queryString, params, 'all').then(({ rows }) => rows);
    }
    async get(placeholderValues) {
        const { fields, queryString, logger, joinsNotNullableMap } = this;
        const params = fillPlaceholders(this.params, placeholderValues ?? {});
        logger.logQuery(queryString, params);
        const clientResult = await this.client(queryString, params, 'get');
        if (fields) {
            if (clientResult.rows === undefined) {
                return mapResultRow(fields, [], joinsNotNullableMap);
            }
            return mapResultRow(fields, clientResult.rows, joinsNotNullableMap);
        }
        return clientResult.rows;
    }
    async values(placeholderValues) {
        const params = fillPlaceholders(this.params, placeholderValues ?? {});
        this.logger.logQuery(this.queryString, params);
        const clientResult = await this.client(this.queryString, params, 'values');
        return clientResult.rows;
    }
}

function drizzle(callback, config = {}) {
    const dialect = new SQLiteAsyncDialect();
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
    const session = new SQLiteRemoteSession(callback, dialect, schema, { logger });
    return new BaseSQLiteDatabase('async', dialect, session, schema);
}

export { PreparedQuery, SQLiteProxyTransaction, SQLiteRemoteSession, drizzle };
//# sourceMappingURL=index.mjs.map
