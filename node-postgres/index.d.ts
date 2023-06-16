import { L as Logger, Q as Query, ay as Assume, D as DrizzleConfig } from '../column.d-66a08b85.js';
import { ah as PreparedQueryConfig, ai as PreparedQuery, a6 as SelectedFieldsOrdered, ak as PgSession, u as PgDialect, aj as PgTransactionConfig, al as PgTransaction, am as QueryResultHKT, t as PgDatabase } from '../db.d-a6fe1b19.js';
import { T as TablesRelationalConfig, R as RelationalSchemaConfig } from '../query-promise.d-d7b61248.js';
import pg, { PoolClient, Client, QueryResult, QueryResultRow } from 'pg';
import '../migrator.js';
import '../select.types.d-1bd49d37.js';

type NodePgClient = pg.Pool | PoolClient | Client;
declare class NodePgPreparedQuery<T extends PreparedQueryConfig> extends PreparedQuery<T> {
    private client;
    private params;
    private logger;
    private fields;
    private customResultMapper?;
    private rawQuery;
    private query;
    constructor(client: NodePgClient, queryString: string, params: unknown[], logger: Logger, fields: SelectedFieldsOrdered | undefined, name: string | undefined, customResultMapper?: ((rows: unknown[][]) => T['execute']) | undefined);
    execute(placeholderValues?: Record<string, unknown> | undefined): Promise<T['execute']>;
    all(placeholderValues?: Record<string, unknown> | undefined): Promise<T['all']>;
}
interface NodePgSessionOptions {
    logger?: Logger;
}
declare class NodePgSession<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends PgSession<NodePgQueryResultHKT, TFullSchema, TSchema> {
    private client;
    private schema;
    private options;
    private logger;
    constructor(client: NodePgClient, dialect: PgDialect, schema: RelationalSchemaConfig<TSchema> | undefined, options?: NodePgSessionOptions);
    prepareQuery<T extends PreparedQueryConfig = PreparedQueryConfig>(query: Query, fields: SelectedFieldsOrdered | undefined, name: string | undefined, customResultMapper?: (rows: unknown[][]) => T['execute']): PreparedQuery<T>;
    transaction<T>(transaction: (tx: NodePgTransaction<TFullSchema, TSchema>) => Promise<T>, config?: PgTransactionConfig | undefined): Promise<T>;
}
declare class NodePgTransaction<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends PgTransaction<NodePgQueryResultHKT, TFullSchema, TSchema> {
    transaction<T>(transaction: (tx: NodePgTransaction<TFullSchema, TSchema>) => Promise<T>): Promise<T>;
}
interface NodePgQueryResultHKT extends QueryResultHKT {
    type: QueryResult<Assume<this['row'], QueryResultRow>>;
}

interface PgDriverOptions {
    logger?: Logger;
}
declare class NodePgDriver {
    private client;
    private dialect;
    private options;
    constructor(client: NodePgClient, dialect: PgDialect, options?: PgDriverOptions);
    createSession(schema: RelationalSchemaConfig<TablesRelationalConfig> | undefined): NodePgSession<Record<string, unknown>, TablesRelationalConfig>;
    initMappers(): void;
}
type NodePgDatabase<TSchema extends Record<string, unknown> = Record<string, never>> = PgDatabase<NodePgQueryResultHKT, TSchema>;
declare function drizzle<TSchema extends Record<string, unknown> = Record<string, never>>(client: NodePgClient, config?: DrizzleConfig<TSchema>): NodePgDatabase<TSchema>;

export { NodePgClient, NodePgDatabase, NodePgDriver, NodePgPreparedQuery, NodePgQueryResultHKT, NodePgSession, NodePgSessionOptions, NodePgTransaction, PgDriverOptions, drizzle };
