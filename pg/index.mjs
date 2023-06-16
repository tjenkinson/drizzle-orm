import { DefaultLogger } from '../../index.mjs';
import { P as PreparedQuery, a as PgSession, b as PgTransaction, c as PgDatabase } from '../../session-deaaed1f.mjs';
import { m as mapResultRow, f as fillPlaceholders, s as sql, P as PgDialect, e as extractTablesRelationalConfig, c as createTableRelationsHelpers } from '../../relations-3eb6fe55.mjs';
import { TypeHint, ExecuteStatementCommand, BeginTransactionCommand, CommitTransactionCommand, RollbackTransactionCommand } from '@aws-sdk/client-rds-data';
import '../../errors-bb636d84.mjs';

function getValueFromDataApi(field) {
    if (field.stringValue !== undefined) {
        return field.stringValue;
    }
    else if (field.booleanValue !== undefined) {
        return field.booleanValue;
    }
    else if (field.doubleValue !== undefined) {
        return field.doubleValue;
    }
    else if (field.isNull !== undefined) {
        return null;
    }
    else if (field.longValue !== undefined) {
        return field.longValue;
    }
    else if (field.blobValue !== undefined) {
        return field.blobValue;
        // eslint-disable-next-line unicorn/no-negated-condition
    }
    else if (field.arrayValue !== undefined) {
        if (field.arrayValue.stringValues !== undefined) {
            return field.arrayValue.stringValues;
        }
        throw new Error('Unknown array type');
    }
    else {
        throw new Error('Unknown type');
    }
}
function typingsToAwsTypeHint(typings) {
    if (typings === 'date') {
        return TypeHint.DATE;
    }
    else if (typings === 'decimal') {
        return TypeHint.DECIMAL;
    }
    else if (typings === 'json') {
        return TypeHint.JSON;
    }
    else if (typings === 'time') {
        return TypeHint.TIME;
    }
    else if (typings === 'timestamp') {
        return TypeHint.TIMESTAMP;
    }
    else if (typings === 'uuid') {
        return TypeHint.UUID;
    }
    else {
        return undefined;
    }
}
function toValueParam(value, typings) {
    const response = {
        value: {},
        typeHint: typingsToAwsTypeHint(typings),
    };
    if (value === null) {
        response.value = { isNull: true };
    }
    else if (typeof value === 'string') {
        response.value = response.typeHint === 'DATE'
            ? { stringValue: value.split('T')[0] }
            : { stringValue: value };
    }
    else if (typeof value === 'number' && Number.isInteger(value)) {
        response.value = { longValue: value };
    }
    else if (typeof value === 'number' && !Number.isInteger(value)) {
        response.value = { doubleValue: value };
    }
    else if (typeof value === 'boolean') {
        response.value = { booleanValue: value };
    }
    else if (value instanceof Date) {
        response.value = { stringValue: value.toISOString().replace('T', ' ').replace('Z', '') };
    }
    else {
        throw new Error(`Unknown type for ${value}`);
    }
    return response;
}

class AwsDataApiPreparedQuery extends PreparedQuery {
    client;
    params;
    typings;
    options;
    fields;
    transactionId;
    customResultMapper;
    rawQuery;
    constructor(client, queryString, params, typings, options, fields, 
    /** @internal */
    transactionId, customResultMapper) {
        super();
        this.client = client;
        this.params = params;
        this.typings = typings;
        this.options = options;
        this.fields = fields;
        this.transactionId = transactionId;
        this.customResultMapper = customResultMapper;
        this.rawQuery = new ExecuteStatementCommand({
            sql: queryString,
            parameters: [],
            secretArn: options.secretArn,
            resourceArn: options.resourceArn,
            database: options.database,
            transactionId,
        });
    }
    async execute(placeholderValues = {}) {
        const { fields, joinsNotNullableMap, customResultMapper } = this;
        const rows = await this.values(placeholderValues);
        if (!fields && !customResultMapper) {
            return rows;
        }
        return customResultMapper
            ? customResultMapper(rows)
            : rows.map((row) => mapResultRow(fields, row, joinsNotNullableMap));
    }
    all(placeholderValues) {
        return this.execute(placeholderValues);
    }
    async values(placeholderValues = {}) {
        const params = fillPlaceholders(this.params, placeholderValues ?? {});
        this.rawQuery.input.parameters = params.map((param, index) => ({
            name: `${index + 1}`,
            ...toValueParam(param, this.typings[index]),
        }));
        this.options.logger?.logQuery(this.rawQuery.input.sql, this.rawQuery.input.parameters);
        const { fields, rawQuery, client, customResultMapper } = this;
        if (!fields && !customResultMapper) {
            const result = await client.send(rawQuery);
            return result.records ?? [];
        }
        const result = await client.send(rawQuery);
        return result.records?.map((row) => {
            return row.map((field) => getValueFromDataApi(field));
        });
    }
}
class AwsDataApiSession extends PgSession {
    client;
    schema;
    options;
    transactionId;
    /** @internal */
    rawQuery;
    constructor(
    /** @internal */
    client, dialect, schema, options, 
    /** @internal */
    transactionId) {
        super(dialect);
        this.client = client;
        this.schema = schema;
        this.options = options;
        this.transactionId = transactionId;
        this.rawQuery = {
            secretArn: options.secretArn,
            resourceArn: options.resourceArn,
            database: options.database,
        };
    }
    prepareQuery(query, fields, transactionId, customResultMapper) {
        return new AwsDataApiPreparedQuery(this.client, query.sql, query.params, query.typings ?? [], this.options, fields, transactionId, customResultMapper);
    }
    execute(query) {
        return this.prepareQuery(this.dialect.sqlToQuery(query), undefined, this.transactionId).execute();
    }
    async transaction(transaction, config) {
        const { transactionId } = await this.client.send(new BeginTransactionCommand(this.rawQuery));
        const session = new AwsDataApiSession(this.client, this.dialect, this.schema, this.options, transactionId);
        const tx = new AwsDataApiTransaction(this.dialect, session, this.schema);
        if (config) {
            await tx.setTransaction(config);
        }
        try {
            const result = await transaction(tx);
            await this.client.send(new CommitTransactionCommand({ ...this.rawQuery, transactionId }));
            return result;
        }
        catch (e) {
            await this.client.send(new RollbackTransactionCommand({ ...this.rawQuery, transactionId }));
            throw e;
        }
    }
}
class AwsDataApiTransaction extends PgTransaction {
    transaction(transaction) {
        const savepointName = `sp${this.nestedIndex + 1}`;
        const tx = new AwsDataApiTransaction(this.dialect, this.session, this.schema, this.nestedIndex + 1);
        this.session.execute(sql `savepoint ${savepointName}`);
        try {
            const result = transaction(tx);
            this.session.execute(sql `release savepoint ${savepointName}`);
            return result;
        }
        catch (e) {
            this.session.execute(sql `rollback to savepoint ${savepointName}`);
            throw e;
        }
    }
}

class AwsPgDialect extends PgDialect {
    escapeParam(num) {
        return `:${num + 1}`;
    }
}
function drizzle(client, config) {
    const dialect = new AwsPgDialect();
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
    const session = new AwsDataApiSession(client, dialect, schema, { ...config, logger }, undefined);
    return new PgDatabase(dialect, session, schema);
}

export { AwsDataApiPreparedQuery, AwsDataApiSession, AwsDataApiTransaction, AwsPgDialect, drizzle };
//# sourceMappingURL=index.mjs.map
