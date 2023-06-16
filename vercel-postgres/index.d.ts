import { L as Logger, Q as Query, ay as Assume, D as DrizzleConfig } from '../column.d-66a08b85.js';
import { T as TablesRelationalConfig, R as RelationalSchemaConfig } from '../query-promise.d-d7b61248.js';
import { ah as PreparedQueryConfig, ai as PreparedQuery, a6 as SelectedFieldsOrdered, ak as PgSession, u as PgDialect, aj as PgTransactionConfig, al as PgTransaction, am as QueryResultHKT, t as PgDatabase } from '../db.d-a6fe1b19.js';
import { VercelPool, VercelClient, VercelPoolClient, QueryResult, QueryResultRow } from '@vercel/postgres';
import '../migrator.js';
import '../select.types.d-1bd49d37.js';

type VercelPgClient = VercelPool | VercelClient | VercelPoolClient;
declare class VercelPgPreparedQuery<T extends PreparedQueryConfig> extends PreparedQuery<T> {
    private client;
    private params;
    private logger;
    private fields;
    private customResultMapper?;
    private rawQuery;
    private query;
    constructor(client: VercelPgClient, queryString: string, params: unknown[], logger: Logger, fields: SelectedFieldsOrdered | undefined, name: string | undefined, customResultMapper?: ((rows: unknown[][]) => T['execute']) | undefined);
    execute(placeholderValues?: Record<string, unknown> | undefined): Promise<T['execute']>;
    all(placeholderValues?: Record<string, unknown> | undefined): Promise<T['all']>;
    values(placeholderValues?: Record<string, unknown> | undefined): Promise<T['values']>;
}
interface VercelPgSessionOptions {
    logger?: Logger;
}
declare class VercelPgSession<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends PgSession<VercelPgQueryResultHKT, TFullSchema, TSchema> {
    private client;
    private schema;
    private options;
    private logger;
    constructor(client: VercelPgClient, dialect: PgDialect, schema: RelationalSchemaConfig<TSchema> | undefined, options?: VercelPgSessionOptions);
    prepareQuery<T extends PreparedQueryConfig = PreparedQueryConfig>(query: Query, fields: SelectedFieldsOrdered | undefined, name: string | undefined, customResultMapper?: (rows: unknown[][]) => T['execute']): PreparedQuery<T>;
    query(query: string, params: unknown[]): Promise<QueryResult>;
    queryObjects<T extends QueryResultRow>(query: string, params: unknown[]): Promise<QueryResult<T>>;
    transaction<T>(transaction: (tx: VercelPgTransaction<TFullSchema, TSchema>) => Promise<T>, config?: PgTransactionConfig | undefined): Promise<T>;
}
declare class VercelPgTransaction<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends PgTransaction<VercelPgQueryResultHKT, TFullSchema, TSchema> {
    transaction<T>(transaction: (tx: VercelPgTransaction<TFullSchema, TSchema>) => Promise<T>): Promise<T>;
}
interface VercelPgQueryResultHKT extends QueryResultHKT {
    type: QueryResult<Assume<this['row'], QueryResultRow>>;
}

interface VercelPgDriverOptions {
    logger?: Logger;
}
declare class VercelPgDriver {
    private client;
    private dialect;
    private options;
    constructor(client: VercelPgClient, dialect: PgDialect, options?: VercelPgDriverOptions);
    createSession(schema: RelationalSchemaConfig<TablesRelationalConfig> | undefined): VercelPgSession<Record<string, unknown>, TablesRelationalConfig>;
    initMappers(): void;
}
type VercelPgDatabase<TSchema extends Record<string, unknown> = Record<string, never>> = PgDatabase<VercelPgQueryResultHKT, TSchema>;
declare function drizzle<TSchema extends Record<string, unknown> = Record<string, never>>(client: VercelPgClient, config?: DrizzleConfig<TSchema>): VercelPgDatabase<TSchema>;

export { VercelPgClient, VercelPgDatabase, VercelPgDriver, VercelPgDriverOptions, VercelPgPreparedQuery, VercelPgQueryResultHKT, VercelPgSession, VercelPgSessionOptions, VercelPgTransaction, drizzle };
