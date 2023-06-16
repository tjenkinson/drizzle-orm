import { Connection as Connection$1, Pool as Pool$1 } from 'mysql2';
import { L as Logger, Q as Query, a as SQL, ay as Assume, D as DrizzleConfig } from '../column.d-66a08b85.js';
import { ae as PreparedQueryConfig, ah as PreparedQuery, a1 as SelectedFieldsOrdered, aj as MySqlSession, o as MySqlDialect, ag as PreparedQueryKind, ai as MySqlTransactionConfig, ak as MySqlTransaction, ac as QueryResultHKT, af as PreparedQueryHKT, n as MySqlDatabase } from '../select.types.d-e43b2599.js';
import { T as TablesRelationalConfig, R as RelationalSchemaConfig } from '../query-promise.d-d7b61248.js';
import { Pool, Connection, ResultSetHeader, FieldPacket, RowDataPacket, OkPacket } from 'mysql2/promise';
import '../select.types.d-1bd49d37.js';
import '../migrator.js';

type MySql2Client = Pool | Connection;
type MySqlRawQueryResult = [ResultSetHeader, FieldPacket[]];
type MySqlQueryResultType = RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader;
type MySqlQueryResult<T = any> = [T extends ResultSetHeader ? T : T[], FieldPacket[]];
declare class MySql2PreparedQuery<T extends PreparedQueryConfig> extends PreparedQuery<T> {
    private client;
    private params;
    private logger;
    private fields;
    private customResultMapper?;
    private rawQuery;
    private query;
    constructor(client: MySql2Client, queryString: string, params: unknown[], logger: Logger, fields: SelectedFieldsOrdered | undefined, customResultMapper?: ((rows: unknown[][]) => T['execute']) | undefined);
    execute(placeholderValues?: Record<string, unknown>): Promise<T['execute']>;
    iterator(placeholderValues?: Record<string, unknown>): AsyncGenerator<T['execute'] extends any[] ? T['execute'][number] : T['execute']>;
}
interface MySql2SessionOptions {
    logger?: Logger;
}
declare class MySql2Session<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends MySqlSession<MySql2QueryResultHKT, MySql2PreparedQueryHKT, TFullSchema, TSchema> {
    private client;
    private schema;
    private options;
    private logger;
    constructor(client: MySql2Client, dialect: MySqlDialect, schema: RelationalSchemaConfig<TSchema> | undefined, options?: MySql2SessionOptions);
    prepareQuery<T extends PreparedQueryConfig>(query: Query, fields: SelectedFieldsOrdered | undefined, customResultMapper?: (rows: unknown[][]) => T['execute']): PreparedQueryKind<MySql2PreparedQueryHKT, T>;
    all<T = unknown>(query: SQL<unknown>): Promise<T[]>;
    transaction<T>(transaction: (tx: MySql2Transaction<TFullSchema, TSchema>) => Promise<T>, config?: MySqlTransactionConfig): Promise<T>;
}
declare class MySql2Transaction<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends MySqlTransaction<MySql2QueryResultHKT, MySql2PreparedQueryHKT, TFullSchema, TSchema> {
    transaction<T>(transaction: (tx: MySql2Transaction<TFullSchema, TSchema>) => Promise<T>): Promise<T>;
}
interface MySql2QueryResultHKT extends QueryResultHKT {
    type: MySqlRawQueryResult;
}
interface MySql2PreparedQueryHKT extends PreparedQueryHKT {
    type: MySql2PreparedQuery<Assume<this['config'], PreparedQueryConfig>>;
}

interface MySqlDriverOptions {
    logger?: Logger;
}
declare class MySql2Driver {
    private client;
    private dialect;
    private options;
    constructor(client: MySql2Client, dialect: MySqlDialect, options?: MySqlDriverOptions);
    createSession(schema: RelationalSchemaConfig<TablesRelationalConfig> | undefined): MySql2Session<Record<string, unknown>, TablesRelationalConfig>;
}

type MySql2Database<TSchema extends Record<string, unknown> = Record<string, never>> = MySqlDatabase<MySql2QueryResultHKT, MySql2PreparedQueryHKT, TSchema>;
declare function drizzle<TSchema extends Record<string, unknown> = Record<string, never>>(client: MySql2Client | Connection$1 | Pool$1, config?: DrizzleConfig<TSchema>): MySql2Database<TSchema>;

export { MySql2Client, MySql2Database, MySql2Driver, MySql2PreparedQuery, MySql2PreparedQueryHKT, MySql2QueryResultHKT, MySql2Session, MySql2SessionOptions, MySql2Transaction, MySqlDatabase, MySqlDriverOptions, MySqlQueryResult, MySqlQueryResultType, MySqlRawQueryResult, drizzle };