export { L as LibSQLDatabase, d as drizzle } from '../driver.d-091c7513.js';
import { ResultSet, Client, Transaction } from '@libsql/client';
import { L as Logger, Q as Query, a as SQL } from '../column.d-66a08b85.js';
import { T as TablesRelationalConfig, R as RelationalSchemaConfig } from '../query-promise.d-d7b61248.js';
import { S as SQLiteSession, g as SQLiteAsyncDialect, b as SelectedFieldsOrdered, c as SQLiteTransactionConfig, d as SQLiteTransaction, P as PreparedQuery$1, e as PreparedQueryConfig$1 } from '../db.d-88f5988e.js';
import '../select.types.d-1bd49d37.js';
import '../migrator.js';

interface LibSQLSessionOptions {
    logger?: Logger;
}
type PreparedQueryConfig = Omit<PreparedQueryConfig$1, 'statement' | 'run'>;
declare class LibSQLSession<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends SQLiteSession<'async', ResultSet, TFullSchema, TSchema> {
    private client;
    private schema;
    private options;
    private tx;
    private logger;
    constructor(client: Client, dialect: SQLiteAsyncDialect, schema: RelationalSchemaConfig<TSchema> | undefined, options: LibSQLSessionOptions, tx: Transaction | undefined);
    prepareQuery<T extends Omit<PreparedQueryConfig, 'run'>>(query: Query, fields: SelectedFieldsOrdered, customResultMapper?: (rows: unknown[][]) => unknown): PreparedQuery<T>;
    batch(queries: SQL[]): Promise<ResultSet[]>;
    transaction<T>(transaction: (db: LibSQLTransaction<TFullSchema, TSchema>) => T | Promise<T>, _config?: SQLiteTransactionConfig): Promise<T>;
}
declare class LibSQLTransaction<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends SQLiteTransaction<'async', ResultSet, TFullSchema, TSchema> {
    transaction<T>(transaction: (tx: LibSQLTransaction<TFullSchema, TSchema>) => Promise<T>): Promise<T>;
}
declare class PreparedQuery<T extends PreparedQueryConfig = PreparedQueryConfig> extends PreparedQuery$1<{
    type: 'async';
    run: ResultSet;
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
    private tx;
    private customResultMapper?;
    constructor(client: Client, queryString: string, params: unknown[], logger: Logger, fields: SelectedFieldsOrdered | undefined, tx: Transaction | undefined, customResultMapper?: ((rows: unknown[][], mapColumnValue?: ((value: unknown) => unknown) | undefined) => unknown) | undefined);
    run(placeholderValues?: Record<string, unknown>): Promise<ResultSet>;
    all(placeholderValues?: Record<string, unknown>): Promise<T['all']>;
    get(placeholderValues?: Record<string, unknown>): Promise<T['get']>;
    values(placeholderValues?: Record<string, unknown>): Promise<T['values']>;
}

export { LibSQLSession, LibSQLSessionOptions, LibSQLTransaction, PreparedQuery };
