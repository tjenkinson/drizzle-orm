import { X as QueryTypingsValue, L as Logger, Q as Query, a as SQL, D as DrizzleConfig } from '../../column.d-66a08b85.js';
import { ah as PreparedQueryConfig, ai as PreparedQuery, a6 as SelectedFieldsOrdered, ak as PgSession, u as PgDialect, aj as PgTransactionConfig, al as PgTransaction, am as QueryResultHKT, t as PgDatabase } from '../../db.d-a6fe1b19.js';
import { RDSDataClient, ExecuteStatementCommandOutput } from '@aws-sdk/client-rds-data';
import { T as TablesRelationalConfig, R as RelationalSchemaConfig } from '../../query-promise.d-d7b61248.js';
import '../../migrator.js';
import '../../select.types.d-1bd49d37.js';

type AwsDataApiClient = RDSDataClient;
declare class AwsDataApiPreparedQuery<T extends PreparedQueryConfig> extends PreparedQuery<T> {
    private client;
    private params;
    private typings;
    private options;
    private fields;
    private customResultMapper?;
    private rawQuery;
    constructor(client: AwsDataApiClient, queryString: string, params: unknown[], typings: QueryTypingsValue[], options: AwsDataApiSessionOptions, fields: SelectedFieldsOrdered | undefined, 
    /** @internal */
    transactionId: string | undefined, customResultMapper?: ((rows: unknown[][]) => T['execute']) | undefined);
    execute(placeholderValues?: Record<string, unknown> | undefined): Promise<T['execute']>;
    all(placeholderValues?: Record<string, unknown> | undefined): Promise<T['all']>;
    values(placeholderValues?: Record<string, unknown>): Promise<T['values']>;
}
interface AwsDataApiSessionOptions {
    logger?: Logger;
    database: string;
    resourceArn: string;
    secretArn: string;
}
declare class AwsDataApiSession<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends PgSession<AwsDataApiPgQueryResultHKT, TFullSchema, TSchema> {
    private schema;
    private options;
    constructor(
    /** @internal */
    client: AwsDataApiClient, dialect: PgDialect, schema: RelationalSchemaConfig<TSchema> | undefined, options: AwsDataApiSessionOptions, 
    /** @internal */
    transactionId: string | undefined);
    prepareQuery<T extends PreparedQueryConfig = PreparedQueryConfig>(query: Query, fields: SelectedFieldsOrdered | undefined, transactionId?: string, customResultMapper?: (rows: unknown[][]) => T['execute']): PreparedQuery<T>;
    execute<T>(query: SQL): Promise<T>;
    transaction<T>(transaction: (tx: AwsDataApiTransaction<TFullSchema, TSchema>) => Promise<T>, config?: PgTransactionConfig | undefined): Promise<T>;
}
declare class AwsDataApiTransaction<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends PgTransaction<AwsDataApiPgQueryResultHKT, TFullSchema, TSchema> {
    transaction<T>(transaction: (tx: AwsDataApiTransaction<TFullSchema, TSchema>) => Promise<T>): Promise<T>;
}
interface AwsDataApiPgQueryResultHKT extends QueryResultHKT {
    type: ExecuteStatementCommandOutput;
}

interface PgDriverOptions {
    logger?: Logger;
    database: string;
    resourceArn: string;
    secretArn: string;
}
interface DrizzleAwsDataApiPgConfig<TSchema extends Record<string, unknown> = Record<string, never>> extends DrizzleConfig<TSchema> {
    database: string;
    resourceArn: string;
    secretArn: string;
}
type AwsDataApiPgDatabase<TSchema extends Record<string, unknown> = Record<string, never>> = PgDatabase<AwsDataApiPgQueryResultHKT, TSchema>;
declare class AwsPgDialect extends PgDialect {
    escapeParam(num: number): string;
}
declare function drizzle<TSchema extends Record<string, unknown> = Record<string, never>>(client: AwsDataApiClient, config: DrizzleAwsDataApiPgConfig<TSchema>): AwsDataApiPgDatabase<TSchema>;

export { AwsDataApiClient, AwsDataApiPgDatabase, AwsDataApiPgQueryResultHKT, AwsDataApiPreparedQuery, AwsDataApiSession, AwsDataApiSessionOptions, AwsDataApiTransaction, AwsPgDialect, DrizzleAwsDataApiPgConfig, PgDriverOptions, drizzle };
