'use strict';

var index = require('../index.cjs');
var session = require('../session-ff20ca01.cjs');
var relations = require('../relations-9f413b53.cjs');
var node_events = require('node:events');
require('../errors-d0192d62.cjs');

class MySql2PreparedQuery extends session.PreparedQuery {
    client;
    params;
    logger;
    fields;
    customResultMapper;
    rawQuery;
    query;
    constructor(client, queryString, params, logger, fields, customResultMapper) {
        super();
        this.client = client;
        this.params = params;
        this.logger = logger;
        this.fields = fields;
        this.customResultMapper = customResultMapper;
        this.rawQuery = {
            sql: queryString,
            // rowsAsArray: true,
            typeCast: function (field, next) {
                if (field.type === 'TIMESTAMP' || field.type === 'DATETIME' || field.type === 'DATE') {
                    return field.string();
                }
                return next();
            },
        };
        this.query = {
            sql: queryString,
            rowsAsArray: true,
            typeCast: function (field, next) {
                if (field.type === 'TIMESTAMP' || field.type === 'DATETIME' || field.type === 'DATE') {
                    return field.string();
                }
                return next();
            },
        };
    }
    async execute(placeholderValues = {}) {
        const params = relations.fillPlaceholders(this.params, placeholderValues);
        this.logger.logQuery(this.rawQuery.sql, params);
        const { fields, client, rawQuery, query, joinsNotNullableMap, customResultMapper } = this;
        if (!fields && !customResultMapper) {
            return client.query(rawQuery, params);
        }
        const result = await client.query(query, params);
        const rows = result[0];
        if (customResultMapper) {
            return customResultMapper(rows);
        }
        return rows.map((row) => relations.mapResultRow(fields, row, joinsNotNullableMap));
    }
    async *iterator(placeholderValues = {}) {
        const params = relations.fillPlaceholders(this.params, placeholderValues);
        const conn = (isPool(this.client) ? await this.client.getConnection() : this.client).connection;
        const { fields, query, rawQuery, joinsNotNullableMap, client, customResultMapper } = this;
        const hasRowsMapper = Boolean(fields || customResultMapper);
        const driverQuery = hasRowsMapper ? conn.query(query, params) : conn.query(rawQuery, params);
        const stream = driverQuery.stream();
        function dataListener() {
            stream.pause();
        }
        stream.on('data', dataListener);
        try {
            const onEnd = node_events.once(stream, 'end');
            const onError = node_events.once(stream, 'error');
            while (true) {
                stream.resume();
                const row = await Promise.race([onEnd, onError, new Promise((resolve) => stream.once('data', resolve))]);
                if (row === undefined || (Array.isArray(row) && row.length === 0)) {
                    break;
                }
                else if (row instanceof Error) {
                    throw row;
                }
                else {
                    if (hasRowsMapper) {
                        if (customResultMapper) {
                            const mappedRow = customResultMapper([row]);
                            yield (Array.isArray(mappedRow) ? mappedRow[0] : mappedRow);
                        }
                        else {
                            yield relations.mapResultRow(fields, row, joinsNotNullableMap);
                        }
                    }
                    else {
                        yield row;
                    }
                }
            }
        }
        finally {
            stream.off('data', dataListener);
            if (isPool(client)) {
                conn.end();
            }
        }
    }
}
class MySql2Session extends session.MySqlSession {
    client;
    schema;
    options;
    logger;
    constructor(client, dialect, schema, options = {}) {
        super(dialect);
        this.client = client;
        this.schema = schema;
        this.options = options;
        this.logger = options.logger ?? new index.NoopLogger();
    }
    prepareQuery(query, fields, customResultMapper) {
        return new MySql2PreparedQuery(this.client, query.sql, query.params, this.logger, fields, customResultMapper);
    }
    /**
     * @internal
     * What is its purpose?
     */
    async query(query, params) {
        this.logger.logQuery(query, params);
        const result = await this.client.query({
            sql: query,
            values: params,
            rowsAsArray: true,
            typeCast: function (field, next) {
                if (field.type === 'TIMESTAMP' || field.type === 'DATETIME' || field.type === 'DATE') {
                    return field.string();
                }
                return next();
            },
        });
        return result;
    }
    all(query) {
        const querySql = this.dialect.sqlToQuery(query);
        this.logger.logQuery(querySql.sql, querySql.params);
        return this.client.execute(querySql.sql, querySql.params).then((result) => result[0]);
    }
    async transaction(transaction, config) {
        const session = isPool(this.client)
            ? new MySql2Session(await this.client.getConnection(), this.dialect, this.schema, this.options)
            : this;
        const tx = new MySql2Transaction(this.dialect, session, this.schema);
        if (config) {
            const setTransactionConfigSql = this.getSetTransactionSQL(config);
            if (setTransactionConfigSql) {
                await tx.execute(setTransactionConfigSql);
            }
            const startTransactionSql = this.getStartTransactionSQL(config);
            await (startTransactionSql ? tx.execute(startTransactionSql) : tx.execute(relations.sql `begin`));
        }
        else {
            await tx.execute(relations.sql `begin`);
        }
        try {
            const result = await transaction(tx);
            await tx.execute(relations.sql `commit`);
            return result;
        }
        catch (err) {
            await tx.execute(relations.sql `rollback`);
            throw err;
        }
        finally {
            if (isPool(this.client)) {
                session.client.release();
            }
        }
    }
}
class MySql2Transaction extends session.MySqlTransaction {
    async transaction(transaction) {
        const savepointName = `sp${this.nestedIndex + 1}`;
        const tx = new MySql2Transaction(this.dialect, this.session, this.schema, this.nestedIndex + 1);
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
function isPool(client) {
    return 'getConnection' in client;
}

class MySql2Driver {
    client;
    dialect;
    options;
    constructor(client, dialect, options = {}) {
        this.client = client;
        this.dialect = dialect;
        this.options = options;
    }
    createSession(schema) {
        return new MySql2Session(this.client, this.dialect, schema, { logger: this.options.logger });
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
    if (isCallbackClient(client)) {
        client = client.promise();
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
    const driver = new MySql2Driver(client, dialect, { logger });
    const session$1 = driver.createSession(schema);
    return new session.MySqlDatabase(dialect, session$1, schema);
}
function isCallbackClient(client) {
    return typeof client.promise === 'function';
}

exports.MySqlDatabase = session.MySqlDatabase;
exports.MySql2Driver = MySql2Driver;
exports.MySql2PreparedQuery = MySql2PreparedQuery;
exports.MySql2Session = MySql2Session;
exports.MySql2Transaction = MySql2Transaction;
exports.drizzle = drizzle;
//# sourceMappingURL=index.cjs.map
