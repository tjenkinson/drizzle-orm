/// <reference types="@cloudflare/workers-types" />
export { D as DrizzleD1Database, d as drizzle } from '../driver.d-24c7a029.js';
import { L as Logger, Q as Query } from '../column.d-66a08b85.js';
import { T as TablesRelationalConfig, R as RelationalSchemaConfig } from '../query-promise.d-d7b61248.js';
import { f as Batch, S as SQLiteSession, g as SQLiteAsyncDialect, b as SelectedFieldsOrdered, P as PreparedQuery$1, e as PreparedQueryConfig$1 } from '../db.d-88f5988e.js';
import '../select.types.d-1bd49d37.js';
import '../migrator.js';

interface SQLiteD1SessionOptions {
    logger?: Logger;
}
type PreparedQueryConfig = Omit<PreparedQueryConfig$1, 'statement' | 'run'>;
declare class D1Batch extends Batch<D1Database, D1PreparedStatement> {
    private client;
    private statements;
    private ran;
    registerQuery(client: D1Database, preparedStatement: D1PreparedStatement): Promise<unknown>;
    run(): Promise<void>;
}
declare class SQLiteD1Session<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends SQLiteSession<'async', D1Result, TFullSchema, TSchema> {
    private client;
    private schema;
    private options;
    private logger;
    constructor(client: D1Database, dialect: SQLiteAsyncDialect, schema: RelationalSchemaConfig<TSchema> | undefined, options?: SQLiteD1SessionOptions);
    prepareQuery(query: Query, fields?: SelectedFieldsOrdered, customResultMapper?: (rows: unknown[][]) => unknown): PreparedQuery;
    transaction(): Promise<never>;
}
declare class PreparedQuery<T extends PreparedQueryConfig = PreparedQueryConfig> extends PreparedQuery$1<{
    type: 'async';
    run: D1Result;
    runBatch: T['runBatch'];
    all: T['all'];
    get: T['get'];
    values: T['values'];
}> {
    private client;
    private stmt;
    private queryString;
    private params;
    private logger;
    private fields;
    private customResultMapper?;
    constructor(client: D1Database, stmt: D1PreparedStatement, queryString: string, params: unknown[], logger: Logger, fields: SelectedFieldsOrdered | undefined, customResultMapper?: ((rows: unknown[][]) => unknown) | undefined);
    run(placeholderValues?: Record<string, unknown>): Promise<D1Result>;
    runInBatch(batch: D1Batch, placeholderValues?: Record<string, unknown>): Promise<T['runBatch']>;
    private getPreparedStatement;
    all(placeholderValues?: Record<string, unknown>): Promise<T['all']>;
    get(placeholderValues?: Record<string, unknown>): Promise<T['get']>;
    values<T extends any[] = unknown[]>(placeholderValues?: Record<string, unknown>): Promise<T[]>;
}

export { D1Batch, PreparedQuery, SQLiteD1Session, SQLiteD1SessionOptions };
