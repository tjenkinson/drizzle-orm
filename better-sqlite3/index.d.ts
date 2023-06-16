export { B as BetterSQLite3Database, d as drizzle } from '../driver.d-21fd7f12.js';
import { RunResult, Database, Statement } from 'better-sqlite3';
import { L as Logger, Q as Query } from '../column.d-66a08b85.js';
import { T as TablesRelationalConfig, R as RelationalSchemaConfig } from '../query-promise.d-d7b61248.js';
import { S as SQLiteSession, a as SQLiteSyncDialect, b as SelectedFieldsOrdered, c as SQLiteTransactionConfig, d as SQLiteTransaction, P as PreparedQuery$1, e as PreparedQueryConfig$1 } from '../db.d-88f5988e.js';
import '../select.types.d-1bd49d37.js';
import '../migrator.js';

interface BetterSQLiteSessionOptions {
    logger?: Logger;
}
type PreparedQueryConfig = Omit<PreparedQueryConfig$1, 'statement' | 'run'>;
declare class BetterSQLiteSession<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends SQLiteSession<'sync', RunResult, TFullSchema, TSchema> {
    private client;
    private schema;
    private logger;
    constructor(client: Database, dialect: SQLiteSyncDialect, schema: RelationalSchemaConfig<TSchema> | undefined, options?: BetterSQLiteSessionOptions);
    prepareQuery<T extends Omit<PreparedQueryConfig, 'run'>>(query: Query, fields: SelectedFieldsOrdered | undefined, customResultMapper?: (rows: unknown[][]) => unknown): PreparedQuery<T>;
    transaction<T>(transaction: (tx: BetterSQLiteTransaction<TFullSchema, TSchema>) => T, config?: SQLiteTransactionConfig): T;
}
declare class BetterSQLiteTransaction<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends SQLiteTransaction<'sync', RunResult, TFullSchema, TSchema> {
    transaction<T>(transaction: (tx: BetterSQLiteTransaction<TFullSchema, TSchema>) => T): T;
}
declare class PreparedQuery<T extends PreparedQueryConfig = PreparedQueryConfig> extends PreparedQuery$1<{
    type: 'sync';
    run: RunResult;
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
    constructor(stmt: Statement, queryString: string, params: unknown[], logger: Logger, fields: SelectedFieldsOrdered | undefined, customResultMapper?: ((rows: unknown[][]) => unknown) | undefined);
    run(placeholderValues?: Record<string, unknown>): RunResult;
    all(placeholderValues?: Record<string, unknown>): T['all'];
    get(placeholderValues?: Record<string, unknown>): T['get'];
    values(placeholderValues?: Record<string, unknown>): T['values'];
}

export { BetterSQLiteSession, BetterSQLiteSessionOptions, BetterSQLiteTransaction, PreparedQuery };
