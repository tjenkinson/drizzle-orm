'use strict';

var index = require('../index.cjs');
var relations = require('../relations-9f413b53.cjs');
var session = require('../session-276be7a3.cjs');
require('../errors-d0192d62.cjs');

/// <reference types="@cloudflare/workers-types" />
class D1Batch extends session.Batch {
    constructor() {
        super(...arguments);
        this.client = null;
        this.statements = [];
        this.ran = false;
    }
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
class SQLiteD1Session extends session.SQLiteSession {
    constructor(client, dialect, schema, options = {}) {
        super(dialect);
        this.client = client;
        this.schema = schema;
        this.options = options;
        this.logger = options.logger ?? new index.NoopLogger();
    }
    prepareQuery(query, fields, customResultMapper) {
        const stmt = this.client.prepare(query.sql);
        return new PreparedQuery(this.client, stmt, query.sql, query.params, this.logger, fields, customResultMapper);
    }
    async transaction() {
        throw new Error('Native transactions are not supported on D1. See the `batch` api.');
    }
}
class PreparedQuery extends session.PreparedQuery {
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
        const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
        this.logger.logQuery(this.queryString, params);
        return this.stmt.bind(...params);
    }
    async all(placeholderValues) {
        const { fields, joinsNotNullableMap, queryString, logger, stmt, customResultMapper } = this;
        if (!fields && !customResultMapper) {
            const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
            logger.logQuery(queryString, params);
            return stmt.bind(...params).all().then(({ results }) => results);
        }
        const rows = await this.values(placeholderValues);
        if (customResultMapper) {
            return customResultMapper(rows);
        }
        return rows.map((row) => relations.mapResultRow(fields, row, joinsNotNullableMap));
    }
    async get(placeholderValues) {
        const { fields, joinsNotNullableMap, queryString, logger, stmt, customResultMapper } = this;
        if (!fields && !customResultMapper) {
            const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
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
        return relations.mapResultRow(fields, rows[0], joinsNotNullableMap);
    }
    values(placeholderValues) {
        const params = relations.fillPlaceholders(this.params, placeholderValues ?? {});
        this.logger.logQuery(this.queryString, params);
        return this.stmt.bind(...params).raw();
    }
}

/// <reference types="@cloudflare/workers-types" />
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
    const session$1 = new SQLiteD1Session(client, dialect, schema, { logger });
    return new session.BaseSQLiteDatabase('async', dialect, session$1, schema);
}

exports.D1Batch = D1Batch;
exports.PreparedQuery = PreparedQuery;
exports.SQLiteD1Session = SQLiteD1Session;
exports.drizzle = drizzle;
//# sourceMappingURL=index.cjs.map
