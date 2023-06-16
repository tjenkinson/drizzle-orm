import { NoopLogger, DefaultLogger } from '../index.mjs';
import { P as PreparedQuery, M as MySqlSession, a as MySqlTransaction, b as MySqlDatabase, c as MySqlDialect } from '../session-2b625be5.mjs';
import { f as fillPlaceholders, m as mapResultRow, s as sql, e as extractTablesRelationalConfig, c as createTableRelationsHelpers } from '../relations-3eb6fe55.mjs';
import '../errors-bb636d84.mjs';

class PlanetScalePreparedQuery extends PreparedQuery {
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
        const params = fillPlaceholders(this.params, placeholderValues);
        this.logger.logQuery(this.queryString, params);
        const { fields, client, queryString, rawQuery, query, joinsNotNullableMap, customResultMapper } = this;
        if (!fields && !customResultMapper) {
            return client.execute(queryString, params, rawQuery);
        }
        const { rows } = await client.execute(queryString, params, query);
        if (customResultMapper) {
            return customResultMapper(rows);
        }
        return rows.map((row) => mapResultRow(fields, row, joinsNotNullableMap));
    }
    iterator(_placeholderValues) {
        throw new Error('Streaming is not supported by the PlanetScale Serverless driver');
    }
}
class PlanetscaleSession extends MySqlSession {
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
        this.logger = options.logger ?? new NoopLogger();
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
class PlanetScaleTransaction extends MySqlTransaction {
    async transaction(transaction) {
        const savepointName = `sp${this.nestedIndex + 1}`;
        const tx = new PlanetScaleTransaction(this.dialect, this.session, this.schema, this.nestedIndex + 1);
        await tx.execute(sql.raw(`savepoint ${savepointName}`));
        try {
            const result = await transaction(tx);
            await tx.execute(sql.raw(`release savepoint ${savepointName}`));
            return result;
        }
        catch (err) {
            await tx.execute(sql.raw(`rollback to savepoint ${savepointName}`));
            throw err;
        }
    }
}

function drizzle(client, config = {}) {
    const dialect = new MySqlDialect();
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
    const session = new PlanetscaleSession(client, dialect, undefined, schema, { logger });
    return new MySqlDatabase(dialect, session, schema);
}

export { PlanetScalePreparedQuery, PlanetScaleTransaction, PlanetscaleSession, drizzle };
//# sourceMappingURL=index.mjs.map