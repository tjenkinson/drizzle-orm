import { NoopLogger, DefaultLogger } from '../index.mjs';
import { f as fillPlaceholders, m as mapResultRow, e as extractTablesRelationalConfig, c as createTableRelationsHelpers } from '../relations-3eb6fe55.mjs';
import { c as Batch, S as SQLiteSession, P as PreparedQuery$1, B as BaseSQLiteDatabase, d as SQLiteAsyncDialect } from '../session-b53b3ab7.mjs';
import '../errors-bb636d84.mjs';

/// <reference types="@cloudflare/workers-types" />
class D1Batch extends Batch {
    client = null;
    statements = [];
    ran = false;
    async registerQuery(client, preparedStatement) {
        if (this.ran)
            throw new Error('Cannot register a query after `run()` has been called.');
        if (!this.client) {
            this.client = client;
        }
        else if (this.client !== client) {
            throw new Error('All statements in a batch must use the same client.');
        }
        let resolve;
        let reject;
        const promise = new Promise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        });
        this.statements.push({ statement: preparedStatement, resolve, reject });
        return promise;
    }
    async run() {
        if (this.ran)
            return;
        this.ran = true;
        if (!this.client)
            return;
        try {
            const d1Results = await this.client.batch(this.statements.map(({ statement }) => statement));
            for (let i = 0; i < this.statements.length; i++) {
                const statement = this.statements[i];
                const d1Result = d1Results[i];
                statement.resolve(d1Result.results);
            }
        }
        catch (e) {
            for (const { reject } of this.statements) {
                reject(e);
            }
        }
    }
}
class SQLiteD1Session extends SQLiteSession {
    client;
    schema;
    options;
    logger;
    constructor(client, dialect, schema, options = {}) {
        super(dialect);
        this.client = client;
        this.schema = schema;
        this.options = options;
        this.logger = options.logger ?? new NoopLogger();
    }
    prepareQuery(query, fields, customResultMapper) {
        const stmt = this.client.prepare(query.sql);
        return new PreparedQuery(this.client, stmt, query.sql, query.params, this.logger, fields, customResultMapper);
    }
    async transaction() {
        throw new Error('Native transactions are not supported on D1. See the `batch` api.');
    }
}
class PreparedQuery extends PreparedQuery$1 {
    client;
    stmt;
    queryString;
    params;
    logger;
    fields;
    customResultMapper;
    constructor(client, stmt, queryString, params, logger, fields, customResultMapper) {
        super();
        this.client = client;
        this.stmt = stmt;
        this.queryString = queryString;
        this.params = params;
        this.logger = logger;
        this.fields = fields;
        this.customResultMapper = customResultMapper;
    }
    run(placeholderValues) {
        return this.getPreparedStatement(placeholderValues).run();
    }
    runInBatch(batch, placeholderValues) {
        return batch.registerQuery(this.client, this.getPreparedStatement(placeholderValues));
    }
    getPreparedStatement(placeholderValues) {
        const params = fillPlaceholders(this.params, placeholderValues ?? {});
        this.logger.logQuery(this.queryString, params);
        return this.stmt.bind(...params);
    }
    async all(placeholderValues) {
        const { fields, joinsNotNullableMap, queryString, logger, stmt, customResultMapper } = this;
        if (!fields && !customResultMapper) {
            const params = fillPlaceholders(this.params, placeholderValues ?? {});
            logger.logQuery(queryString, params);
            return stmt.bind(...params).all().then(({ results }) => results);
        }
        const rows = await this.values(placeholderValues);
        if (customResultMapper) {
            return customResultMapper(rows);
        }
        return rows.map((row) => mapResultRow(fields, row, joinsNotNullableMap));
    }
    async get(placeholderValues) {
        const { fields, joinsNotNullableMap, queryString, logger, stmt, customResultMapper } = this;
        if (!fields && !customResultMapper) {
            const params = fillPlaceholders(this.params, placeholderValues ?? {});
            logger.logQuery(queryString, params);
            return stmt.bind(...params).all().then(({ results }) => results[0]);
        }
        const rows = await this.values(placeholderValues);
        if (!rows[0]) {
            return undefined;
        }
        if (customResultMapper) {
            return customResultMapper(rows);
        }
        return mapResultRow(fields, rows[0], joinsNotNullableMap);
    }
    values(placeholderValues) {
        const params = fillPlaceholders(this.params, placeholderValues ?? {});
        this.logger.logQuery(this.queryString, params);
        return this.stmt.bind(...params).raw();
    }
}

/// <reference types="@cloudflare/workers-types" />
function drizzle(client, config = {}) {
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
    const session = new SQLiteD1Session(client, dialect, schema, { logger });
    return new BaseSQLiteDatabase('async', dialect, session, schema);
}

export { D1Batch, PreparedQuery, SQLiteD1Session, drizzle };
//# sourceMappingURL=index.mjs.map
