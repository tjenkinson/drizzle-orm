/// <reference types="node" />
/// <reference types="bun-types" />
import { h as SQLiteColumnBuilder, i as SQLiteColumn, A as AnySQLiteTable, j as AnySQLiteColumn, I as Index, F as ForeignKey, C as Check, k as PrimaryKey, l as SQLiteView, m as SQLiteViewBase, n as BuildAliasTable } from '../db.d-88f5988e.js';
export { s as AnySQLiteColumnBuilder, Z as AnySQLiteSelect, B as BaseSQLiteDatabase, f as Batch, o as CheckBuilder, v as ForeignKeyBuilder, D as IndexBuilder, z as IndexBuilderOn, y as IndexColumn, x as IndexConfig, $ as JoinFn, Y as JoinsValue, an as ManualViewBuilder, P as PreparedQuery, e as PreparedQueryConfig, J as PrimaryKeyBuilder, T as QueryBuilder, u as Reference, R as ReferenceConfig, aa as Result, g as SQLiteAsyncDialect, q as SQLiteColumnBuilderHKT, r as SQLiteColumnHKT, L as SQLiteDelete, K as SQLiteDeleteConfig, t as SQLiteDialect, Q as SQLiteInsert, O as SQLiteInsertBuilder, M as SQLiteInsertConfig, N as SQLiteInsertValue, X as SQLiteSelect, V as SQLiteSelectBuilder, _ as SQLiteSelectConfig, a5 as SQLiteSelectHKT, a2 as SQLiteSelectHKTBase, a3 as SQLiteSelectKind, W as SQLiteSelectQueryBuilder, a4 as SQLiteSelectQueryBuilderHKT, S as SQLiteSession, a as SQLiteSyncDialect, af as SQLiteTable, ad as SQLiteTableExtraConfig, ah as SQLiteTableFn, ag as SQLiteTableWithColumns, d as SQLiteTransaction, c as SQLiteTransactionConfig, a9 as SQLiteUpdate, a8 as SQLiteUpdateBuilder, a6 as SQLiteUpdateConfig, a7 as SQLiteUpdateSetSource, ao as SQLiteViewConfig, ap as SQLiteViewWithSelection, a1 as SelectedFields, a0 as SelectedFieldsFlat, b as SelectedFieldsOrdered, ab as SubqueryWithSelection, ae as TableConfig, U as UpdateDeleteAction, am as ViewBuilder, ak as ViewBuilderConfig, al as ViewBuilderCore, ac as WithSubqueryWithSelection, p as check, w as foreignKey, E as index, H as primaryKey, ai as sqliteTable, aj as sqliteTableCreator, aq as sqliteView, G as uniqueIndex, ar as view } from '../db.d-88f5988e.js';
import { n as ColumnBuilderHKTBase, ay as Assume, k as ColumnBuilderBaseConfig, c as ColumnHKTBase, C as ColumnBaseConfig, az as Equal, S as Simplify, a as SQL, F as SelectedFields, A as AnyColumn, T as Table, ak as TableConfig, o as ColumnBuilderKind, t as UpdateCBConfig, m as MakeColumnConfig, aC as Or, W as WithEnum, aF as Writable } from '../column.d-66a08b85.js';
import '../select.types.d-1bd49d37.js';
import '../query-promise.d-d7b61248.js';
import '../migrator.js';

type BlobMode = 'buffer' | 'json' | 'bigint';
interface SQLiteBigIntBuilderHKT extends ColumnBuilderHKTBase {
    _type: SQLiteBigIntBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: SQLiteBigIntHKT;
}
interface SQLiteBigIntHKT extends ColumnHKTBase {
    _type: SQLiteBigInt<Assume<this['config'], ColumnBaseConfig>>;
}
type SQLiteBigIntBuilderInitial<TName extends string> = SQLiteBigIntBuilder<{
    name: TName;
    data: bigint;
    driverParam: Buffer;
    notNull: false;
    hasDefault: false;
}>;
declare class SQLiteBigIntBuilder<T extends ColumnBuilderBaseConfig> extends SQLiteColumnBuilder<SQLiteBigIntBuilderHKT, T> {
}
declare class SQLiteBigInt<T extends ColumnBaseConfig> extends SQLiteColumn<SQLiteBigIntHKT, T> {
    protected $sqliteColumnBrand: 'SQLiteBigInt';
    getSQLType(): string;
    mapFromDriverValue(value: Buffer): bigint;
    mapToDriverValue(value: bigint): Buffer;
}
interface SQLiteBlobJsonBuilderHKT extends ColumnBuilderHKTBase {
    _type: SQLiteBlobJsonBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: SQLiteBlobJsonHKT;
}
interface SQLiteBlobJsonHKT extends ColumnHKTBase {
    _type: SQLiteBlobJson<Assume<this['config'], ColumnBaseConfig>>;
}
type SQLiteBlobJsonBuilderInitial<TName extends string> = SQLiteBlobJsonBuilder<{
    name: TName;
    data: unknown;
    driverParam: Buffer;
    notNull: false;
    hasDefault: false;
}>;
declare class SQLiteBlobJsonBuilder<T extends ColumnBuilderBaseConfig> extends SQLiteColumnBuilder<SQLiteBlobJsonBuilderHKT, T> {
}
declare class SQLiteBlobJson<T extends ColumnBaseConfig> extends SQLiteColumn<SQLiteBlobJsonHKT, T> {
    protected $sqliteColumnBrand: 'SQLiteBlobJson';
    getSQLType(): string;
    mapFromDriverValue(value: Buffer): T['data'];
    mapToDriverValue(value: T['data']): Buffer;
}
interface SQLiteBlobBufferBuilderHKT extends ColumnBuilderHKTBase {
    _type: SQLiteBlobBufferBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: SQLiteBlobBufferHKT;
}
interface SQLiteBlobBufferHKT extends ColumnHKTBase {
    _type: SQLiteBlobBuffer<Assume<this['config'], ColumnBaseConfig>>;
}
type SQLiteBlobBufferBuilderInitial<TName extends string> = SQLiteBlobBufferBuilder<{
    name: TName;
    data: Buffer;
    driverParam: Buffer;
    notNull: false;
    hasDefault: false;
}>;
declare class SQLiteBlobBufferBuilder<T extends ColumnBuilderBaseConfig> extends SQLiteColumnBuilder<SQLiteBlobBufferBuilderHKT, T> {
}
declare class SQLiteBlobBuffer<T extends ColumnBaseConfig> extends SQLiteColumn<SQLiteBlobBufferHKT, T> {
    getSQLType(): string;
}
interface BlobConfig<TMode extends BlobMode = BlobMode> {
    mode: TMode;
}
declare function blob<TName extends string, TMode extends BlobMode = BlobMode>(name: TName, config?: BlobConfig<TMode>): Equal<TMode, 'bigint'> extends true ? SQLiteBigIntBuilderInitial<TName> : Equal<TMode, 'buffer'> extends true ? SQLiteBlobBufferBuilderInitial<TName> : SQLiteBlobJsonBuilderInitial<TName>;

type ConvertCustomConfig<TName extends string, T extends Partial<CustomTypeValues>> = Simplify<{
    name: TName;
    data: T['data'];
    driverParam: T['driverData'];
    notNull: T['notNull'] extends true ? true : false;
    hasDefault: T['default'] extends true ? true : false;
}>;
interface SQLiteCustomColumnInnerConfig {
    customTypeValues: CustomTypeValues;
}
interface SQLiteCustomColumnBuilderHKT extends ColumnBuilderHKTBase {
    _type: SQLiteCustomColumnBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: SQLiteCustomColumnHKT;
}
interface SQLiteCustomColumnHKT extends ColumnHKTBase {
    _type: SQLiteCustomColumn<Assume<this['config'], ColumnBaseConfig>>;
}
declare class SQLiteCustomColumnBuilder<T extends ColumnBuilderBaseConfig> extends SQLiteColumnBuilder<SQLiteCustomColumnBuilderHKT, T, {
    fieldConfig: CustomTypeValues['config'];
    customTypeParams: CustomTypeParams<any>;
}, {
    sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand';
}> {
    constructor(name: T['name'], fieldConfig: CustomTypeValues['config'], customTypeParams: CustomTypeParams<any>);
}
declare class SQLiteCustomColumn<T extends ColumnBaseConfig> extends SQLiteColumn<SQLiteCustomColumnHKT, T> {
    protected $sqliteColumnBrand: 'SQLiteCustomColumn';
    private sqlName;
    private mapTo?;
    private mapFrom?;
    constructor(table: AnySQLiteTable<{
        name: T['tableName'];
    }>, config: SQLiteCustomColumnBuilder<T>['config']);
    getSQLType(): string;
    mapFromDriverValue(value: T['driverParam']): T['data'];
    mapToDriverValue(value: T['data']): T['driverParam'];
}
type CustomTypeValues = {
    /**
     * Required type for custom column, that will infer proper type model
     *
     * Examples:
     *
     * If you want your column to be `string` type after selecting/or on inserting - use `data: string`. Like `text`, `varchar`
     *
     * If you want your column to be `number` type after selecting/or on inserting - use `data: number`. Like `integer`
     */
    data: unknown;
    /**
     * Type helper, that represents what type database driver is accepting for specific database data type
     */
    driverData?: unknown;
    /**
     * What config type should be used for {@link CustomTypeParams} `dataType` generation
     */
    config?: unknown;
    /**
     * Whether the config argument should be required or not
     * @default false
     */
    configRequired?: boolean;
    /**
     * If your custom data type should be notNull by default you can use `notNull: true`
     *
     * @example
     * const customSerial = customType<{ data: number, notNull: true, default: true }>({
     * 	  dataType() {
     * 	    return 'serial';
     *    },
     * });
     */
    notNull?: boolean;
    /**
     * If your custom data type has default you can use `default: true`
     *
     * @example
     * const customSerial = customType<{ data: number, notNull: true, default: true }>({
     * 	  dataType() {
     * 	    return 'serial';
     *    },
     * });
     */
    default?: boolean;
};
interface CustomTypeParams<T extends CustomTypeValues> {
    /**
     * Database data type string representation, that is used for migrations
     * @example
     * ```
     * `jsonb`, `text`
     * ```
     *
     * If database data type needs additional params you can use them from `config` param
     * @example
     * ```
     * `varchar(256)`, `numeric(2,3)`
     * ```
     *
     * To make `config` be of specific type please use config generic in {@link CustomTypeValues}
     *
     * @example
     * Usage example
     * ```
     *   dataType() {
     *     return 'boolean';
     *   },
     * ```
     * Or
     * ```
     *   dataType(config) {
     * 	   return typeof config.length !== 'undefined' ? `varchar(${config.length})` : `varchar`;
     * 	 }
     * ```
     */
    dataType: (config: T['config'] | (Equal<T['configRequired'], true> extends true ? never : undefined)) => string;
    /**
     * Optional mapping function, between user input and driver
     * @example
     * For example, when using jsonb we need to map JS/TS object to string before writing to database
     * ```
     * toDriver(value: TData): string {
     * 	 return JSON.stringify(value);
     * }
     * ```
     */
    toDriver?: (value: T['data']) => T['driverData'] | SQL;
    /**
     * Optional mapping function, that is responsible for data mapping from database to JS/TS code
     * @example
     * For example, when using timestamp we need to map string Date representation to JS Date
     * ```
     * fromDriver(value: string): Date {
     * 	return new Date(value);
     * },
     * ```
     */
    fromDriver?: (value: T['driverData']) => T['data'];
}
/**
 * Custom sqlite database data type generator
 */
declare function customType<T extends CustomTypeValues = CustomTypeValues>(customTypeParams: CustomTypeParams<T>): Equal<T['configRequired'], true> extends true ? <TName extends string>(dbName: TName, fieldConfig: T['config']) => SQLiteCustomColumnBuilder<ConvertCustomConfig<TName, T>> : <TName extends string>(dbName: TName, fieldConfig?: T['config']) => SQLiteCustomColumnBuilder<ConvertCustomConfig<TName, T>>;

declare function getTableConfig<TTable extends AnySQLiteTable>(table: TTable): {
    columns: AnySQLiteColumn[];
    indexes: Index[];
    foreignKeys: ForeignKey[];
    checks: Check[];
    primaryKeys: PrimaryKey[];
    name: string;
};
type OnConflict = 'rollback' | 'abort' | 'fail' | 'ignore' | 'replace';
declare function getViewConfig<TName extends string = string, TExisting extends boolean = boolean>(view: SQLiteView<TName, TExisting>): {
    algorithm?: "undefined" | "merge" | "temptable" | undefined;
    definer?: string | undefined;
    sqlSecurity?: "definer" | "invoker" | undefined;
    withCheckOption?: "local" | "cascaded" | undefined;
    name: TName;
    originalName: TName;
    schema: string | undefined;
    selectedFields: SelectedFields<AnyColumn, Table<TableConfig<AnyColumn>>>;
    isExisting: TExisting;
    query: TExisting extends true ? undefined : SQL<unknown>;
    isAlias: boolean;
};

interface PrimaryKeyConfig {
    autoIncrement?: boolean;
    onConflict?: OnConflict;
}
declare abstract class SQLiteBaseIntegerBuilder<THKT extends ColumnBuilderHKTBase, T extends ColumnBuilderBaseConfig, TRuntimeConfig extends object = {}> extends SQLiteColumnBuilder<THKT, T, TRuntimeConfig & {
    autoIncrement: boolean;
}> {
    constructor(name: T['name']);
    primaryKey(config?: PrimaryKeyConfig): ColumnBuilderKind<THKT, UpdateCBConfig<T, {
        notNull: true;
        hasDefault: true;
    }>>;
}
declare abstract class SQLiteBaseInteger<THKT extends ColumnHKTBase, T extends ColumnBaseConfig, TRuntimeConfig extends object = {}> extends SQLiteColumn<THKT, T, TRuntimeConfig & {
    autoIncrement: boolean;
}> {
    readonly autoIncrement: boolean;
    getSQLType(): string;
}
interface SQLiteIntegerBuilderHKT extends ColumnBuilderHKTBase {
    _type: SQLiteIntegerBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: SQLiteIntegerHKT;
}
interface SQLiteIntegerHKT extends ColumnHKTBase {
    _type: SQLiteInteger<Assume<this['config'], ColumnBaseConfig>>;
}
type SQLiteIntegerBuilderInitial<TName extends string> = SQLiteIntegerBuilder<{
    name: TName;
    data: number;
    driverParam: number;
    notNull: false;
    hasDefault: false;
}>;
declare class SQLiteIntegerBuilder<T extends ColumnBuilderBaseConfig> extends SQLiteBaseIntegerBuilder<SQLiteIntegerBuilderHKT, T> {
    build<TTableName extends string>(table: AnySQLiteTable<{
        name: TTableName;
    }>): SQLiteInteger<MakeColumnConfig<T, TTableName>>;
}
declare class SQLiteInteger<T extends ColumnBaseConfig> extends SQLiteBaseInteger<SQLiteIntegerHKT, T> {
}
interface SQLiteTimestampBuilderHKT extends ColumnBuilderHKTBase {
    _type: SQLiteTimestampBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: SQLiteTimestampHKT;
}
interface SQLiteTimestampHKT extends ColumnHKTBase {
    _type: SQLiteTimestamp<Assume<this['config'], ColumnBaseConfig>>;
}
type SQLiteTimestampBuilderInitial<TName extends string> = SQLiteTimestampBuilder<{
    name: TName;
    data: Date;
    driverParam: number;
    notNull: false;
    hasDefault: false;
}>;
declare class SQLiteTimestampBuilder<T extends ColumnBuilderBaseConfig> extends SQLiteBaseIntegerBuilder<SQLiteTimestampBuilderHKT, T, {
    mode: 'timestamp' | 'timestamp_ms';
}> {
    constructor(name: T['name'], mode: 'timestamp' | 'timestamp_ms');
    /**
     * @deprecated Use `default()` with your own expression instead.
     *
     * Adds `DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))` to the column, which is the current epoch timestamp in milliseconds.
     */
    defaultNow(): ColumnBuilderKind<this['_']['hkt'], UpdateCBConfig<T, {
        hasDefault: true;
    }>>;
    build<TTableName extends string>(table: AnySQLiteTable<{
        name: TTableName;
    }>): SQLiteTimestamp<MakeColumnConfig<T, TTableName>>;
}
declare class SQLiteTimestamp<T extends ColumnBaseConfig> extends SQLiteBaseInteger<SQLiteTimestampHKT, T, {
    mode: 'timestamp' | 'timestamp_ms';
}> {
    readonly mode: 'timestamp' | 'timestamp_ms';
    mapFromDriverValue(value: number): Date;
    mapToDriverValue(value: Date): number;
}
interface IntegerConfig<TMode extends 'number' | 'timestamp' | 'timestamp_ms' = 'number' | 'timestamp' | 'timestamp_ms'> {
    mode: TMode;
}
declare function integer<TName extends string, TMode extends IntegerConfig['mode']>(name: TName, config?: IntegerConfig<TMode>): Or<Equal<TMode, 'timestamp'>, Equal<TMode, 'timestamp_ms'>> extends true ? SQLiteTimestampBuilderInitial<TName> : SQLiteIntegerBuilderInitial<TName>;
declare const int: typeof integer;

interface SQLiteNumericBuilderHKT extends ColumnBuilderHKTBase {
    _type: SQLiteNumericBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: SQLiteNumericHKT;
}
interface SQLiteNumericHKT extends ColumnHKTBase {
    _type: SQLiteNumeric<Assume<this['config'], ColumnBaseConfig>>;
}
type SQLiteNumericBuilderInitial<TName extends string> = SQLiteNumericBuilder<{
    name: TName;
    data: string;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class SQLiteNumericBuilder<T extends ColumnBuilderBaseConfig> extends SQLiteColumnBuilder<SQLiteNumericBuilderHKT, T> {
}
declare class SQLiteNumeric<T extends ColumnBaseConfig> extends SQLiteColumn<SQLiteNumericHKT, T> {
    getSQLType(): string;
}
declare function numeric<TName extends string>(name: TName): SQLiteNumericBuilderInitial<TName>;

interface SQLiteRealBuilderHKT extends ColumnBuilderHKTBase {
    _type: SQLiteRealBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: SQLiteRealHKT;
}
interface SQLiteRealHKT extends ColumnHKTBase {
    _type: SQLiteReal<Assume<this['config'], ColumnBaseConfig>>;
}
type SQLiteRealBuilderInitial<TName extends string> = SQLiteRealBuilder<{
    name: TName;
    data: number;
    driverParam: number;
    notNull: false;
    hasDefault: false;
}>;
declare class SQLiteRealBuilder<T extends ColumnBuilderBaseConfig> extends SQLiteColumnBuilder<SQLiteRealBuilderHKT, T> {
}
declare class SQLiteReal<T extends ColumnBaseConfig> extends SQLiteColumn<SQLiteRealHKT, T> {
    getSQLType(): string;
}
declare function real<TName extends string>(name: TName): SQLiteRealBuilderInitial<TName>;

interface SQLiteTextBuilderHKT extends ColumnBuilderHKTBase {
    _type: SQLiteTextBuilder<Assume<this['config'], ColumnBuilderBaseConfig & WithEnum>>;
    _columnHKT: SQLiteTextHKT;
}
interface SQLiteTextHKT extends ColumnHKTBase {
    _type: SQLiteText<Assume<this['config'], ColumnBaseConfig & WithEnum>>;
}
type SQLiteTextBuilderInitial<TName extends string, TEnum extends [string, ...string[]]> = SQLiteTextBuilder<{
    name: TName;
    data: TEnum[number];
    driverParam: string;
    enumValues: TEnum;
    notNull: false;
    hasDefault: false;
}>;
declare class SQLiteTextBuilder<T extends ColumnBuilderBaseConfig & WithEnum> extends SQLiteColumnBuilder<SQLiteTextBuilderHKT, T, {
    length: number | undefined;
} & WithEnum<T['enumValues']>> {
    constructor(name: T['name'], config: SQLiteTextConfig<T['enumValues']>);
}
declare class SQLiteText<T extends ColumnBaseConfig & WithEnum> extends SQLiteColumn<SQLiteTextHKT, T, {
    length: number | undefined;
} & WithEnum<T['enumValues']>> implements WithEnum<T['enumValues']> {
    readonly enumValues: T["enumValues"];
    readonly length: number | undefined;
    constructor(table: AnySQLiteTable<{
        name: T['tableName'];
    }>, config: SQLiteTextBuilder<T>['config']);
    getSQLType(): string;
}
interface SQLiteTextConfig<TEnum extends readonly string[] | string[]> {
    length?: number;
    enum?: TEnum;
}
declare function text<TName extends string, U extends string, T extends Readonly<[U, ...U[]]>>(name: TName, config?: SQLiteTextConfig<T | Writable<T>>): SQLiteTextBuilderInitial<TName, Writable<T>>;

declare function alias<TTable extends AnySQLiteTable | SQLiteViewBase, TAlias extends string>(table: TTable, alias: TAlias): BuildAliasTable<TTable, TAlias>;

declare class UniqueBuilder<TTableName extends string> {
    name: string;
    column: AnySQLiteColumn;
    _: {
        brand: 'SQLiteUniqueBuilder';
        tableName: TTableName;
    };
    constructor(name: string, column: AnySQLiteColumn);
}
type AnyUniqueBuilder<TTableName extends string = string> = UniqueBuilder<TTableName>;
declare class Unique<TTableName extends string> {
    table: AnySQLiteTable<{
        name: TTableName;
    }>;
    readonly name: string;
    readonly column: AnySQLiteColumn;
    constructor(table: AnySQLiteTable<{
        name: TTableName;
    }>, builder: UniqueBuilder<TTableName>);
}
type BuildUnique<T extends AnyUniqueBuilder> = Unique<T['_']['tableName']>;
type AnyUnique = Unique<string>;
declare function unique<TTableName extends string>(name: string, column: AnySQLiteColumn<{
    tableName: TTableName;
}>): UniqueBuilder<TTableName>;

export { AnySQLiteColumn, AnySQLiteTable, AnyUnique, AnyUniqueBuilder, BlobConfig, BuildAliasTable, BuildUnique, Check, ConvertCustomConfig, CustomTypeParams, CustomTypeValues, ForeignKey, Index, IntegerConfig, OnConflict, PrimaryKey, PrimaryKeyConfig, SQLiteBaseInteger, SQLiteBaseIntegerBuilder, SQLiteBigInt, SQLiteBigIntBuilder, SQLiteBigIntBuilderHKT, SQLiteBigIntBuilderInitial, SQLiteBigIntHKT, SQLiteBlobBuffer, SQLiteBlobBufferBuilder, SQLiteBlobBufferBuilderHKT, SQLiteBlobBufferBuilderInitial, SQLiteBlobBufferHKT, SQLiteBlobJson, SQLiteBlobJsonBuilder, SQLiteBlobJsonBuilderHKT, SQLiteBlobJsonBuilderInitial, SQLiteBlobJsonHKT, SQLiteColumn, SQLiteColumnBuilder, SQLiteCustomColumn, SQLiteCustomColumnBuilder, SQLiteCustomColumnBuilderHKT, SQLiteCustomColumnHKT, SQLiteCustomColumnInnerConfig, SQLiteInteger, SQLiteIntegerBuilder, SQLiteIntegerBuilderHKT, SQLiteIntegerBuilderInitial, SQLiteIntegerHKT, SQLiteNumeric, SQLiteNumericBuilder, SQLiteNumericBuilderHKT, SQLiteNumericBuilderInitial, SQLiteNumericHKT, SQLiteReal, SQLiteRealBuilder, SQLiteRealBuilderHKT, SQLiteRealBuilderInitial, SQLiteRealHKT, SQLiteText, SQLiteTextBuilder, SQLiteTextBuilderHKT, SQLiteTextBuilderInitial, SQLiteTextConfig, SQLiteTextHKT, SQLiteTimestamp, SQLiteTimestampBuilder, SQLiteTimestampBuilderHKT, SQLiteTimestampBuilderInitial, SQLiteTimestampHKT, SQLiteView, SQLiteViewBase, Unique, UniqueBuilder, alias, blob, customType, getTableConfig, getViewConfig, int, integer, numeric, real, text, unique };
