import { Connection, Transaction, ExecutedQuery } from '@planetscale/database';
import { L as Logger, Q as Query, a as SQL, ay as Assume, D as DrizzleConfig } from '../column.d-66a08b85.js';
import { ae as PreparedQueryConfig, ah as PreparedQuery, a1 as SelectedFieldsOrdered, aj as MySqlSession, o as MySqlDialect, ak as MySqlTransaction, ac as QueryResultHKT, af as PreparedQueryHKT, n as MySqlDatabase } from '../select.types.d-e43b2599.js';
import { T as TablesRelationalConfig, R as RelationalSchemaConfig } from '../query-promise.d-d7b61248.js';
import '../select.types.d-1bd49d37.js';
import 'mysql2/promise';
import '../migrator.js';

type PlanetScaleConnection = Connection;
declare class PlanetScalePreparedQuery<T extends PreparedQueryConfig> extends PreparedQuery<T> {
    private client;
    private queryString;
    private params;
    private logger;
    private fields;
    private customResultMapper?;
    private rawQuery;
    private query;
    constructor(client: PlanetScaleConnection | Transaction, queryString: string, params: unknown[], logger: Logger, fields: SelectedFieldsOrdered | undefined, customResultMapper?: ((rows: unknown[][]) => T['execute']) | undefined);
    execute(placeholderValues?: Record<string, unknown> | undefined): Promise<T['execute']>;
    iterator(_placeholderValues?: Record<string, unknown>): AsyncGenerator<T['iterator']>;
}
interface PlanetscaleSessionOptions {
    logger?: Logger;
}
declare class PlanetscaleSession<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends MySqlSession<PlanetscaleQueryResultHKT, PlanetScalePreparedQueryHKT, TFullSchema, TSchema> {
    private baseClient;
    private schema;
    private options;
    private logger;
    private client;
    constructor(baseClient: PlanetScaleConnection, dialect: MySqlDialect, tx: Transaction | undefined, schema: RelationalSchemaConfig<TSchema> | undefined, options?: PlanetscaleSessionOptions);
    prepareQuery<T extends PreparedQueryConfig = PreparedQueryConfig>(query: Query, fields: SelectedFieldsOrdered | undefined, customResultMapper?: (rows: unknown[][]) => T['execute']): PreparedQuery<T>;
    query(query: string, params: unknown[]): Promise<ExecutedQuery>;
    queryObjects(query: string, params: unknown[]): Promise<ExecutedQuery>;
    all<T = unknown>(query: SQL<unknown>): Promise<T[]>;
    transaction<T>(transaction: (tx: PlanetScaleTransaction<TFullSchema, TSchema>) => Promise<T>): Promise<T>;
}
declare class PlanetScaleTransaction<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends MySqlTransaction<PlanetscaleQueryResultHKT, PlanetScalePreparedQueryHKT, TFullSchema, TSchema> {
    transaction<T>(transaction: (tx: PlanetScaleTransaction<TFullSchema, TSchema>) => Promise<T>): Promise<T>;
}
interface PlanetscaleQueryResultHKT extends QueryResultHKT {
    type: ExecutedQuery;
}
interface PlanetScalePreparedQueryHKT extends PreparedQueryHKT {
    type: PlanetScalePreparedQuery<Assume<this['config'], PreparedQueryConfig>>;
}

interface PlanetscaleSDriverOptions {
    logger?: Logger;
}
type PlanetScaleDatabase<TSchema extends Record<string, unknown> = Record<string, never>> = MySqlDatabase<PlanetscaleQueryResultHKT, PlanetScalePreparedQueryHKT, TSchema>;
declare function drizzle<TSchema extends Record<string, unknown> = Record<string, never>>(client: Connection, config?: DrizzleConfig<TSchema>): PlanetScaleDatabase<TSchema>;

export { PlanetScaleConnection, PlanetScaleDatabase, PlanetScalePreparedQuery, PlanetScalePreparedQueryHKT, PlanetScaleTransaction, PlanetscaleQueryResultHKT, PlanetscaleSDriverOptions, PlanetscaleSession, PlanetscaleSessionOptions, drizzle };
