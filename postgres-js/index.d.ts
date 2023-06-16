import { Sql, RowList, Row, TransactionSql } from 'postgres';
import { ah as PreparedQueryConfig, ai as PreparedQuery, a6 as SelectedFieldsOrdered, ak as PgSession, u as PgDialect, aj as PgTransactionConfig, al as PgTransaction, am as QueryResultHKT, t as PgDatabase } from '../db.d-a6fe1b19.js';
import { L as Logger, Q as Query, ay as Assume, D as DrizzleConfig } from '../column.d-66a08b85.js';
import { T as TablesRelationalConfig, R as RelationalSchemaConfig } from '../query-promise.d-d7b61248.js';
import '../migrator.js';
import '../select.types.d-1bd49d37.js';

declare class PostgresJsPreparedQuery<T extends PreparedQueryConfig> extends PreparedQuery<T> {
    private client;
    private query;
    private params;
    private logger;
    private fields;
    private customResultMapper?;
    constructor(client: Sql, query: string, params: unknown[], logger: Logger, fields: SelectedFieldsOrdered | undefined, customResultMapper?: ((rows: unknown[][]) => T['execute']) | undefined);
    execute(placeholderValues?: Record<string, unknown> | undefined): Promise<T['execute']>;
    all(placeholderValues?: Record<string, unknown> | undefined): Promise<T['all']>;
}
interface PostgresJsSessionOptions {
    logger?: Logger;
}
declare class PostgresJsSession<TSQL extends Sql, TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends PgSession<PostgresJsQueryResultHKT, TFullSchema, TSchema> {
    client: TSQL;
    private schema;
    logger: Logger;
    constructor(client: TSQL, dialect: PgDialect, schema: RelationalSchemaConfig<TSchema> | undefined, 
    /** @internal */
    options?: PostgresJsSessionOptions);
    prepareQuery<T extends PreparedQueryConfig = PreparedQueryConfig>(query: Query, fields: SelectedFieldsOrdered | undefined, name: string | undefined, customResultMapper?: (rows: unknown[][]) => T['execute']): PreparedQuery<T>;
    query(query: string, params: unknown[]): Promise<RowList<Row[]>>;
    queryObjects<T extends Row>(query: string, params: unknown[]): Promise<RowList<T[]>>;
    transaction<T>(transaction: (tx: PostgresJsTransaction<TFullSchema, TSchema>) => Promise<T>, config?: PgTransactionConfig): Promise<T>;
}
declare class PostgresJsTransaction<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends PgTransaction<PostgresJsQueryResultHKT, TFullSchema, TSchema> {
    constructor(dialect: PgDialect, 
    /** @internal */
    session: PostgresJsSession<TransactionSql, TFullSchema, TSchema>, schema: RelationalSchemaConfig<TSchema> | undefined, nestedIndex?: number);
    transaction<T>(transaction: (tx: PostgresJsTransaction<TFullSchema, TSchema>) => Promise<T>): Promise<T>;
}
interface PostgresJsQueryResultHKT extends QueryResultHKT {
    type: RowList<Assume<this['row'], Row>[]>;
}

type PostgresJsDatabase<TSchema extends Record<string, unknown> = Record<string, never>> = PgDatabase<PostgresJsQueryResultHKT, TSchema>;
declare function drizzle<TSchema extends Record<string, unknown> = Record<string, never>>(client: Sql, config?: DrizzleConfig<TSchema>): PostgresJsDatabase<TSchema>;

export { PostgresJsDatabase, PostgresJsPreparedQuery, PostgresJsQueryResultHKT, PostgresJsSession, PostgresJsSessionOptions, PostgresJsTransaction, drizzle };
