import { NoopLogger, DefaultLogger } from '../index.mjs';
import { P as PreparedQuery, a as PgSession, b as PgTransaction, c as PgDatabase } from '../session-deaaed1f.mjs';
import { t as tracer, f as fillPlaceholders, m as mapResultRow, e as extractTablesRelationalConfig, c as createTableRelationsHelpers, P as PgDialect } from '../relations-3eb6fe55.mjs';
import '../errors-bb636d84.mjs';

class PostgresJsPreparedQuery extends PreparedQuery {
    client;
    query;
    params;
    logger;
    fields;
    customResultMapper;
    constructor(client, query, params, logger, fields, customResultMapper) {
        super();
        this.client = client;
        this.query = query;
        this.params = params;
        this.logger = logger;
        this.fields = fields;
        this.customResultMapper = customResultMapper;
    }
    async execute(placeholderValues = {}) {
        return tracer.startActiveSpan('drizzle.execute', async (span) => {
            const params = fillPlaceholders(this.params, placeholderValues);
            span?.setAttributes({
                'drizzle.query.text': this.query,
                'drizzle.query.params': JSON.stringify(params),
            });
            this.logger.logQuery(this.query, params);
            const { fields, query, client, joinsNotNullableMap, customResultMapper } = this;
            if (!fields && !customResultMapper) {
                return tracer.startActiveSpan('drizzle.driver.execute', () => {
                    return client.unsafe(query, params);
                });
            }
            const rows = await tracer.startActiveSpan('drizzle.driver.execute', () => {
                span?.setAttributes({
                    'drizzle.query.text': query,
                    'drizzle.query.params': JSON.stringify(params),
                });
                return client.unsafe(query, params).values();
            });
            return tracer.startActiveSpan('drizzle.mapResponse', () => {
                return customResultMapper
                    ? customResultMapper(rows)
                    : rows.map((row) => mapResultRow(fields, row, joinsNotNullableMap));
            });
        });
    }
    all(placeholderValues = {}) {
        return tracer.startActiveSpan('drizzle.execute', async (span) => {
            const params = fillPlaceholders(this.params, placeholderValues);
            span?.setAttributes({
                'drizzle.query.text': this.query,
                'drizzle.query.params': JSON.stringify(params),
            });
            this.logger.logQuery(this.query, params);
            return tracer.startActiveSpan('drizzle.driver.execute', () => {
                span?.setAttributes({
                    'drizzle.query.text': this.query,
                    'drizzle.query.params': JSON.stringify(params),
                });
                return this.client.unsafe(this.query, params);
            });
        });
    }
}
class PostgresJsSession extends PgSession {
    client;
    schema;
    options;
    logger;
    constructor(client, dialect, schema, 
    /** @internal */
    options = {}) {
        super(dialect);
        this.client = client;
        this.schema = schema;
        this.options = options;
        this.logger = options.logger ?? new NoopLogger();
    }
    prepareQuery(query, fields, name, customResultMapper) {
        return new PostgresJsPreparedQuery(this.client, query.sql, query.params, this.logger, fields, customResultMapper);
    }
    query(query, params) {
        this.logger.logQuery(query, params);
        return this.client.unsafe(query, params).values();
    }
    queryObjects(query, params) {
        return this.client.unsafe(query, params);
    }
    transaction(transaction, config) {
        return this.client.begin(async (client) => {
            const session = new PostgresJsSession(client, this.dialect, this.schema, this.options);
            const tx = new PostgresJsTransaction(this.dialect, session, this.schema);
            if (config) {
                await tx.setTransaction(config);
            }
            return transaction(tx);
        });
    }
}
class PostgresJsTransaction extends PgTransaction {
    session;
    constructor(dialect, 
    /** @internal */
    session, schema, nestedIndex = 0) {
        super(dialect, session, schema, nestedIndex);
        this.session = session;
    }
    transaction(transaction) {
        return this.session.client.savepoint((client) => {
            const session = new PostgresJsSession(client, this.dialect, this.schema, this.session.options);
            const tx = new PostgresJsTransaction(this.dialect, session, this.schema);
            return transaction(tx);
        });
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
    const session = new PostgresJsSession(client, dialect, schema, { logger });
    return new PgDatabase(dialect, session, schema);
}

export { PostgresJsPreparedQuery, PostgresJsSession, PostgresJsTransaction, drizzle };
//# sourceMappingURL=index.mjs.map
