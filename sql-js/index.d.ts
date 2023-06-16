export { S as SQLJsDatabase, d as drizzle } from '../driver.d-207f5e76.js';
import { Database, Statement } from 'sql.js';
import { L as Logger, Q as Query } from '../column.d-66a08b85.js';
import { T as TablesRelationalConfig, R as RelationalSchemaConfig } from '../query-promise.d-d7b61248.js';
import { S as SQLiteSession, a as SQLiteSyncDialect, b as SelectedFieldsOrdered, c as SQLiteTransactionConfig, d as SQLiteTransaction, P as PreparedQuery$1, e as PreparedQueryConfig$1 } from '../db.d-88f5988e.js';
import '../select.types.d-1bd49d37.js';
import '../migrator.js';

interface SQLJsSessionOptions {
    logger?: Logger;
}
type PreparedQueryConfig = Omit<PreparedQueryConfig$1, 'statement' | 'run'>;
declare class SQLJsSession<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends SQLiteSession<'sync', void, TFullSchema, TSchema> {
    private client;
    private schema;
    private logger;
    constructor(client: Database, dialect: SQLiteSyncDialect, schema: RelationalSchemaConfig<TSchema> | undefined, options?: SQLJsSessionOptions);
    prepareQuery<T extends Omit<PreparedQueryConfig, 'run'>>(query: Query, fields?: SelectedFieldsOrdered): PreparedQuery<T>;
    prepareOneTimeQuery<T extends Omit<PreparedQueryConfig, 'run'>>(query: Query, fields?: SelectedFieldsOrdered, customResultMapper?: (rows: unknown[][]) => unknown): PreparedQuery<T>;
    transaction<T>(transaction: (tx: SQLJsTransaction<TFullSchema, TSchema>) => T, config?: SQLiteTransactionConfig): T;
}
declare class SQLJsTransaction<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends SQLiteTransaction<'sync', void, TFullSchema, TSchema> {
    transaction<T>(transaction: (tx: SQLJsTransaction<TFullSchema, TSchema>) => T): T;
}
declare class PreparedQuery<T extends PreparedQueryConfig = PreparedQueryConfig> extends PreparedQuery$1<{
    type: 'sync';
    run: void;
    runBatch: T['runBatch'];
    all: T['all'];
    get: T['get'];
    values: T['values'];
}> {
    private stmt;
    private queryString;
    private params;
    private logger;
    private fields;
    private customResultMapper?;
    private isOneTimeQuery;
    constructor(stmt: Statement, queryString: string, params: unknown[], logger: Logger, fields: SelectedFieldsOrdered | undefined, customResultMapper?: ((rows: unknown[][], mapColumnValue?: ((value: unknown) => unknown) | undefined) => unknown) | undefined, isOneTimeQuery?: boolean);
    run(placeholderValues?: Record<string, unknown>): void;
    all(placeholderValues?: Record<string, unknown>): T['all'];
    get(placeholderValues?: Record<string, unknown>): T['get'];
    values(placeholderValues?: Record<string, unknown>): T['values'];
    free(): boolean;
}

export { PreparedQuery, SQLJsSession, SQLJsSessionOptions, SQLJsTransaction };
