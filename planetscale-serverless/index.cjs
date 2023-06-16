'use strict';

var index = require('../index.cjs');
var session = require('../session-ff20ca01.cjs');
var relations = require('../relations-9f413b53.cjs');
require('../errors-d0192d62.cjs');

class PlanetScalePreparedQuery extends session.PreparedQuery {
    client;
    queryString;
    params;
    logger;
    fields;
    customResultMapper;
    rawQuery = { as: 'object' };
    query = { as: 'array' };
    constructor(client, queryString, params, logger, fields, customResultMapper) {
        super();
        this.client = client;
        this.queryString = queryString;
        this.params = params;
        this.logger = logger;
        this.fields = fields;
        this.customResultMapper = customResultMapper;
    }
    async execute(placeholderValues = {}) {
        const params = relations.fillPlaceholders(this.params, placeholderValues);
        this.logger.logQuery(this.queryString, params);
        const { fields, client, queryString, rawQuery, query, joinsNotNullableMap, customResultMapper } = this;
        if (!fields && !customResultMapper) {
            return client.execute(queryString, params, rawQuery);
        }
        const { rows } = await client.execute(queryString, params, query);
        if (customResultMapper) {
            return customResultMapper(rows);
        }
        return rows.map((row) => relations.mapResultRow(fields, row, joinsNotNullableMap));
    }
    iterator(_placeholderValues) {
        throw new Error('Streaming is not supported by the PlanetScale Serverless driver');
    }
}
class PlanetscaleSession extends session.MySqlSession {
    baseClient;
    schema;
    options;
    logger;
    client;
    constructor(baseClient, dialect, tx, schema, options = {}) {
        super(dialect);
        this.baseClient = baseClient;
        this.schema = schema;
        this.options = options;
        this.client = tx ?? baseClient;
        this.logger = options.logger ?? new index.NoopLogger();
    }
    prepareQuery(query, fields, customResultMapper) {
        return new PlanetScalePreparedQuery(this.client, query.sql, query.params, this.logger, fields, customResultMapper);
    }
    async query(query, params) {
        this.logger.logQuery(query, params);
        return await this.client.execute(query, params, { as: 'array' });
    }
    async queryObjects(query, params) {
        return this.client.execute(query, params, { as: 'object' });
    }
    all(query) {
        const querySql = this.dialect.sqlToQuery(query);
        this.logger.logQuery(querySql.sql, querySql.params);
        return this.client.execute(querySql.sql, querySql.params, { as: 'object' }).then((eQuery) => eQuery.rows);
    }
    transaction(transaction) {
        return this.baseClient.transaction((pstx) => {
            const session = new PlanetscaleSession(this.baseClient, this.dialect, pstx, this.schema, this.options);
            const tx = new PlanetScaleTransaction(this.dialect, session, this.schema);
            return transaction(tx);
        });
    }
}
class PlanetScaleTransaction extends session.MySqlTransaction {
    async transaction(transaction) {
        const savepointName = `sp${this.nestedIndex + 1}`;
        const tx = new PlanetScaleTransaction(this.dialect, this.session, this.schema, this.nestedIndex + 1);
        await tx.execute(relations.sql.raw(`savepoint ${savepointName}`));
        try {
            const result = await transaction(tx);
            await tx.execute(relations.sql.raw(`release savepoint ${savepointName}`));
            return result;
        }
        catch (err) {
            await tx.execute(relations.sql.raw(`rollback to savepoint ${savepointName}`));
            throw err;
        }
    }
}

function drizzle(client, config = {}) {
    const dialect = new session.MySqlDialect();
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
    const session$1 = new PlanetscaleSession(client, dialect, undefined, schema, { logger });
    return new session.MySqlDatabase(dialect, session$1, schema);
}

exports.PlanetScalePreparedQuery = PlanetScalePreparedQuery;
exports.PlanetScaleTransaction = PlanetScaleTransaction;
exports.PlanetscaleSession = PlanetscaleSession;
exports.drizzle = drizzle;
//# sourceMappingURL=index.cjs.map
