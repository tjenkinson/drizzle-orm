import { NoopLogger, DefaultLogger } from '../index.mjs';
import { f as fillPlaceholders, m as mapResultRow, s as sql, e as extractTablesRelationalConfig, c as createTableRelationsHelpers, P as PgDialect } from '../relations-3eb6fe55.mjs';
import { P as PreparedQuery, a as PgSession, b as PgTransaction, c as PgDatabase } from '../session-deaaed1f.mjs';
import { VercelPool } from '@vercel/postgres';
import '../errors-bb636d84.mjs';

class VercelPgPreparedQuery extends PreparedQuery {
    client;
    params;
    logger;
    fields;
    customResultMapper;
    rawQuery;
    query;
    constructor(client, queryString, params, logger, fields, name, customResultMapper) {
        super();
        this.client = client;
        this.params = params;
        this.logger = logger;
        this.fields = fields;
        this.customResultMapper = customResultMapper;
        this.rawQuery = {
            name,
            text: queryString,
        };
        this.query = {
            name,
            text: queryString,
            rowMode: 'array',
        };
    }
    async execute(placeholderValues = {}) {
        const params = fillPlaceholders(this.params, placeholderValues);
        this.logger.logQuery(this.rawQuery.text, params);
        const { fields, rawQuery, client, query, joinsNotNullableMap, customResultMapper } = this;
        if (!fields && !customResultMapper) {
            return client.query(rawQuery, params);
        }
        const { rows } = await client.query(query, params);
        if (customResultMapper) {
            return customResultMapper(rows);
        }
        return rows.map((row) => mapResultRow(fields, row, joinsNotNullableMap));
    }
    all(placeholderValues = {}) {
        const params = fillPlaceholders(this.params, placeholderValues);
        this.logger.logQuery(this.rawQuery.text, params);
        return this.client.query(this.rawQuery, params).then((result) => result.rows);
    }
    values(placeholderValues = {}) {
        const params = fillPlaceholders(this.params, placeholderValues);
        this.logger.logQuery(this.rawQuery.text, params);
        return this.client.query(this.query, params).then((result) => result.rows);
    }
}
class VercelPgSession extends PgSession {
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
    prepareQuery(query, fields, name, customResultMapper) {
        return new VercelPgPreparedQuery(this.client, query.sql, query.params, this.logger, fields, name, customResultMapper);
    }
    async query(query, params) {
        this.logger.logQuery(query, params);
        const result = await this.client.query({
            rowMode: 'array',
            text: query,
            values: params,
        });
        return result;
    }
    async queryObjects(query, params) {
        return this.client.query(query, params);
    }
    async transaction(transaction, config) {
        const session = this.client instanceof VercelPool
            ? new VercelPgSession(await this.client.connect(), this.dialect, this.schema, this.options)
            : this;
        const tx = new VercelPgTransaction(this.dialect, session, this.schema);
        await tx.execute(sql `begin${config ? sql ` ${tx.getTransactionConfigSQL(config)}` : undefined}`);
        try {
            const result = await transaction(tx);
            await tx.execute(sql `commit`);
            return result;
        }
        catch (error) {
            await tx.execute(sql `rollback`);
            throw error;
        }
        finally {
            if (this.client instanceof VercelPool) {
                session.client.release();
            }
        }
    }
}
class VercelPgTransaction extends PgTransaction {
    async transaction(transaction) {
        const savepointName = `sp${this.nestedIndex + 1}`;
        const tx = new VercelPgTransaction(this.dialect, this.session, this.schema, this.nestedIndex + 1);
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

class VercelPgDriver {
    client;
    dialect;
    options;
    constructor(client, dialect, options = {}) {
        this.client = client;
        this.dialect = dialect;
        this.options = options;
        this.initMappers();
    }
    createSession(schema) {
        return new VercelPgSession(this.client, this.dialect, schema, { logger: this.options.logger });
    }
    initMappers() {
        // types.setTypeParser(types.builtins.TIMESTAMPTZ, (val) => val);
        // types.setTypeParser(types.builtins.TIMESTAMP, (val) => val);
        // types.setTypeParser(types.builtins.DATE, (val) => val);
    }
}
function drizzle(client, config = {}) {
    const dialect = new PgDialect();
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
    const driver = new VercelPgDriver(client, dialect, { logger });
    const session = driver.createSession(schema);
    return new PgDatabase(dialect, session, schema);
}

export { VercelPgDriver, VercelPgPreparedQuery, VercelPgSession, VercelPgTransaction, drizzle };
//# sourceMappingURL=index.mjs.map