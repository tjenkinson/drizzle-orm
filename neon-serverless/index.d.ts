import { L as Logger, Q as Query, ay as Assume, D as DrizzleConfig } from '../column.d-66a08b85.js';
import { ah as PreparedQueryConfig, ai as PreparedQuery, a6 as SelectedFieldsOrdered, ak as PgSession, u as PgDialect, aj as PgTransactionConfig, al as PgTransaction, am as QueryResultHKT, t as PgDatabase } from '../db.d-a6fe1b19.js';
import { T as TablesRelationalConfig, R as RelationalSchemaConfig } from '../query-promise.d-d7b61248.js';
import { Pool, PoolClient, Client, QueryResult, QueryResultRow } from '@neondatabase/serverless';
import '../migrator.js';
import '../select.types.d-1bd49d37.js';

type NeonClient = Pool | PoolClient | Client;
declare class NeonPreparedQuery<T extends PreparedQueryConfig> extends PreparedQuery<T> {
    private client;
    private params;
    private logger;
    private fields;
    private customResultMapper?;
    private rawQuery;
    private query;
    constructor(client: NeonClient, queryString: string, params: unknown[], logger: Logger, fields: SelectedFieldsOrdered | undefined, name: string | undefined, customResultMapper?: ((rows: unknown[][]) => T['execute']) | undefined);
    execute(placeholderValues?: Record<string, unknown> | undefined): Promise<T['execute']>;
    all(placeholderValues?: Record<string, unknown> | undefined): Promise<T['all']>;
    values(placeholderValues?: Record<string, unknown> | undefined): Promise<T['values']>;
}
interface NeonSessionOptions {
    logger?: Logger;
}
declare class NeonSession<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends PgSession<NeonQueryResultHKT, TFullSchema, TSchema> {
    private client;
    private schema;
    private options;
    private logger;
    constructor(client: NeonClient, dialect: PgDialect, schema: RelationalSchemaConfig<TSchema> | undefined, options?: NeonSessionOptions);
    prepareQuery<T extends PreparedQueryConfig = PreparedQueryConfig>(query: Query, fields: SelectedFieldsOrdered | undefined, name: string | undefined, customResultMapper?: (rows: unknown[][]) => T['execute']): PreparedQuery<T>;
    query(query: string, params: unknown[]): Promise<QueryResult>;
    queryObjects<T extends QueryResultRow>(query: string, params: unknown[]): Promise<QueryResult<T>>;
    transaction<T>(transaction: (tx: NeonTransaction<TFullSchema, TSchema>) => Promise<T>, config?: PgTransactionConfig): Promise<T>;
}
declare class NeonTransaction<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends PgTransaction<NeonQueryResultHKT, TFullSchema, TSchema> {
    transaction<T>(transaction: (tx: NeonTransaction<TFullSchema, TSchema>) => Promise<T>): Promise<T>;
}
interface NeonQueryResultHKT extends QueryResultHKT {
    type: QueryResult<Assume<this['row'], QueryResultRow>>;
}

interface NeonDriverOptions {
    logger?: Logger;
}
declare class NeonDriver {
    private client;
    private dialect;
    private options;
    constructor(client: NeonClient, dialect: PgDialect, options?: NeonDriverOptions);
    createSession(schema: RelationalSchemaConfig<TablesRelationalConfig> | undefined): NeonSession<Record<string, unknown>, TablesRelationalConfig>;
    initMappers(): void;
}
type NeonDatabase<TSchema extends Record<string, unknown> = Record<string, never>> = PgDatabase<NeonQueryResultHKT, TSchema>;
declare function drizzle<TSchema extends Record<string, unknown> = Record<string, never>>(client: NeonClient, config?: DrizzleConfig<TSchema>): NeonDatabase<TSchema>;

export { NeonClient, NeonDatabase, NeonDriver, NeonDriverOptions, NeonPreparedQuery, NeonQueryResultHKT, NeonSession, NeonSessionOptions, NeonTransaction, drizzle };
