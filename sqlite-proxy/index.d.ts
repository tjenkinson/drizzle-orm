import { S as SqliteRemoteResult, R as RemoteCallback } from '../driver.d-00dad961.js';
export { A as AsyncRemoteCallback, a as SqliteRemoteDatabase, d as drizzle } from '../driver.d-00dad961.js';
import { L as Logger, Q as Query } from '../column.d-66a08b85.js';
import { T as TablesRelationalConfig, R as RelationalSchemaConfig } from '../query-promise.d-d7b61248.js';
import { S as SQLiteSession, g as SQLiteAsyncDialect, b as SelectedFieldsOrdered, c as SQLiteTransactionConfig, d as SQLiteTransaction, P as PreparedQuery$1, e as PreparedQueryConfig$1 } from '../db.d-88f5988e.js';
import '../select.types.d-1bd49d37.js';
import '../migrator.js';

interface SQLiteRemoteSessionOptions {
    logger?: Logger;
}
type PreparedQueryConfig = Omit<PreparedQueryConfig$1, 'statement' | 'run'>;
declare class SQLiteRemoteSession<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends SQLiteSession<'async', SqliteRemoteResult, TFullSchema, TSchema> {
    private client;
    private schema;
    private logger;
    constructor(client: RemoteCallback, dialect: SQLiteAsyncDialect, schema: RelationalSchemaConfig<TSchema> | undefined, options?: SQLiteRemoteSessionOptions);
    prepareQuery<T extends Omit<PreparedQueryConfig, 'run'>>(query: Query, fields?: SelectedFieldsOrdered): PreparedQuery<T>;
    transaction<T>(transaction: (tx: SQLiteProxyTransaction<TFullSchema, TSchema>) => Promise<T>, config?: SQLiteTransactionConfig): Promise<T>;
}
declare class SQLiteProxyTransaction<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends SQLiteTransaction<'async', SqliteRemoteResult, TFullSchema, TSchema> {
    transaction<T>(transaction: (tx: SQLiteProxyTransaction<TFullSchema, TSchema>) => Promise<T>): Promise<T>;
}
declare class PreparedQuery<T extends PreparedQueryConfig = PreparedQueryConfig> extends PreparedQuery$1<{
    type: 'async';
    run: SqliteRemoteResult;
    runBatch: T['runBatch'];
    all: T['all'];
    get: T['get'];
    values: T['values'];
}> {
    private client;
    private queryString;
    private params;
    private logger;
    private fields;
    constructor(client: RemoteCallback, queryString: string, params: unknown[], logger: Logger, fields: SelectedFieldsOrdered | undefined);
    run(placeholderValues?: Record<string, unknown>): Promise<SqliteRemoteResult>;
    all(placeholderValues?: Record<string, unknown>): Promise<T['all']>;
    get(placeholderValues?: Record<string, unknown>): Promise<T['get']>;
    values<T extends any[] = unknown[]>(placeholderValues?: Record<string, unknown>): Promise<T[]>;
}

export { PreparedQuery, RemoteCallback, SQLiteProxyTransaction, SQLiteRemoteSession, SQLiteRemoteSessionOptions, SqliteRemoteResult };
