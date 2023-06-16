import { M as MySqlColumnBuilderWithAutoIncrement, a as MySqlColumnWithAutoIncrement, b as MySqlColumnBuilder, c as MySqlColumn, A as AnyMySqlTable, B as BuildAliasTable, d as MySqlTableFn, m as mysqlView, e as AnyMySqlColumn, I as Index, F as ForeignKey, C as Check, P as PrimaryKey, f as MySqlView } from '../select.types.d-e43b2599.js';
export { r as AnyForeignKeyBuilder, v as AnyIndexBuilder, k as AnyMySqlColumnBuilder, L as AnyMySqlInsertConfig, Y as AnyMySqlSelect, g as CheckBuilder, q as ForeignKeyBuilder, G as GetColumnsTable, x as GetColumnsTableName, w as IndexBuilder, u as IndexBuilderOn, t as IndexColumn, _ as JoinFn, X as JoinsValue, a3 as LockConfig, a2 as LockStrength, ay as ManualViewBuilder, i as MySqlColumnBuilderHKT, j as MySqlColumnHKT, l as MySqlColumnWithAutoIncrementConfig, n as MySqlDatabase, J as MySqlDelete, H as MySqlDeleteConfig, o as MySqlDialect, Q as MySqlInsert, O as MySqlInsertBuilder, K as MySqlInsertConfig, N as MySqlInsertValue, W as MySqlSelect, T as MySqlSelectBuilder, Z as MySqlSelectConfig, a7 as MySqlSelectHKT, a4 as MySqlSelectHKTBase, a5 as MySqlSelectKind, V as MySqlSelectQueryBuilder, a6 as MySqlSelectQueryBuilderHKT, aj as MySqlSession, aq as MySqlTable, ao as MySqlTableExtraConfig, ar as MySqlTableWithColumns, ak as MySqlTransaction, ai as MySqlTransactionConfig, ab as MySqlUpdate, aa as MySqlUpdateBuilder, a8 as MySqlUpdateConfig, a9 as MySqlUpdateSetSource, az as MySqlViewBase, aA as MySqlViewConfig, aB as MySqlViewWithSelection, ah as PreparedQuery, ae as PreparedQueryConfig, af as PreparedQueryHKT, al as PreparedQueryHKTBase, ag as PreparedQueryKind, E as PrimaryKeyBuilder, S as QueryBuilder, ac as QueryResultHKT, ad as QueryResultKind, p as Reference, R as ReferenceConfig, a0 as SelectedFields, $ as SelectedFieldsFlat, a1 as SelectedFieldsOrdered, am as SubqueryWithSelection, ap as TableConfig, U as UpdateDeleteAction, ax as ViewBuilder, av as ViewBuilderConfig, aw as ViewBuilderCore, an as WithSubqueryWithSelection, h as check, s as foreignKey, y as index, at as mysqlTable, au as mysqlTableCreator, as as mysqlTableWithSchema, D as primaryKey, z as uniqueIndex } from '../select.types.d-e43b2599.js';
import { n as ColumnBuilderHKTBase, ay as Assume, k as ColumnBuilderBaseConfig, c as ColumnHKTBase, C as ColumnBaseConfig, W as WithEnum, aF as Writable, S as Simplify, az as Equal, a as SQL, o as ColumnBuilderKind, t as UpdateCBConfig, F as SelectedFields, A as AnyColumn, T as Table, ak as TableConfig } from '../column.d-66a08b85.js';
import '../select.types.d-1bd49d37.js';
import '../query-promise.d-d7b61248.js';
import 'mysql2/promise';
import '../migrator.js';

interface MySqlBigInt53BuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlBigInt53Builder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlBigInt53HKT;
}
interface MySqlBigInt53HKT extends ColumnHKTBase {
    _type: MySqlBigInt53<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlBigInt53BuilderInitial<TName extends string> = MySqlBigInt53Builder<{
    name: TName;
    data: number;
    driverParam: number | string;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlBigInt53Builder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilderWithAutoIncrement<MySqlBigInt53BuilderHKT, T> {
}
declare class MySqlBigInt53<T extends ColumnBaseConfig> extends MySqlColumnWithAutoIncrement<MySqlBigInt53HKT, T> {
    protected $mysqlColumnBrand: 'MySqlBigInt53';
    getSQLType(): string;
    mapFromDriverValue(value: number | string): number;
}
interface MySqlBigInt64BuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlBigInt64Builder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlBigInt64HKT;
}
interface MySqlBigInt64HKT extends ColumnHKTBase {
    _type: MySqlBigInt64<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlBigInt64BuilderInitial<TName extends string> = MySqlBigInt64Builder<{
    name: TName;
    data: bigint;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlBigInt64Builder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilderWithAutoIncrement<MySqlBigInt64BuilderHKT, T> {
}
declare class MySqlBigInt64<T extends ColumnBaseConfig> extends MySqlColumnWithAutoIncrement<MySqlBigInt64HKT, T> {
    getSQLType(): string;
    mapFromDriverValue(value: string): bigint;
}
interface MySqlBigIntConfig<T extends 'number' | 'bigint' = 'number' | 'bigint'> {
    mode: T;
}
declare function bigint<TName extends string, TMode extends MySqlBigIntConfig['mode']>(name: TName, config: MySqlBigIntConfig<TMode>): TMode extends 'number' ? MySqlBigInt53BuilderInitial<TName> : MySqlBigInt64BuilderInitial<TName>;

interface MySqlBinaryBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlBinaryBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlBinaryHKT;
}
interface MySqlBinaryHKT extends ColumnHKTBase {
    _type: MySqlBinary<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlBinaryBuilderInitial<TName extends string> = MySqlBinaryBuilder<{
    name: TName;
    data: string;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlBinaryBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilder<MySqlBinaryBuilderHKT, T, MySqlBinaryConfig> {
    constructor(name: T['name'], length: number | undefined);
}
declare class MySqlBinary<T extends ColumnBaseConfig> extends MySqlColumn<MySqlBinaryHKT, T, MySqlBinaryConfig> {
    length: number | undefined;
    getSQLType(): string;
}
interface MySqlBinaryConfig {
    length?: number;
}
declare function binary<TName extends string>(name: TName, config?: MySqlBinaryConfig): MySqlBinaryBuilderInitial<TName>;

interface MySqlBooleanBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlBooleanBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlBooleanHKT;
}
interface MySqlBooleanHKT extends ColumnHKTBase {
    _type: MySqlBoolean<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlBooleanBuilderInitial<TName extends string> = MySqlBooleanBuilder<{
    name: TName;
    data: boolean;
    driverParam: number | boolean;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlBooleanBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilder<MySqlBooleanBuilderHKT, T> {
}
declare class MySqlBoolean<T extends ColumnBaseConfig> extends MySqlColumn<MySqlBooleanHKT, T> {
    getSQLType(): string;
    mapFromDriverValue(value: number | boolean): boolean;
}
declare function boolean<TName extends string>(name: TName): MySqlBooleanBuilderInitial<TName>;

interface MySqlCharBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlCharBuilder<Assume<this['config'], ColumnBuilderBaseConfig & WithEnum>>;
    _columnHKT: MySqlCharHKT;
}
interface MySqlCharHKT extends ColumnHKTBase {
    _type: MySqlChar<Assume<this['config'], ColumnBaseConfig & WithEnum>>;
}
type MySqlCharBuilderInitial<TName extends string, TEnum extends [string, ...string[]]> = MySqlCharBuilder<{
    name: TName;
    data: TEnum[number];
    driverParam: number | string;
    enumValues: TEnum;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlCharBuilder<T extends ColumnBuilderBaseConfig & WithEnum> extends MySqlColumnBuilder<MySqlCharBuilderHKT, T, MySqlCharConfig<T['enumValues']>> {
    constructor(name: T['name'], config: MySqlCharConfig<T['enumValues']>);
}
declare class MySqlChar<T extends ColumnBaseConfig & WithEnum> extends MySqlColumn<MySqlCharHKT, T, MySqlCharConfig<T['enumValues']>> implements WithEnum<T['enumValues']> {
    readonly length: number | undefined;
    readonly enumValues: T['enumValues'];
    getSQLType(): string;
}
interface MySqlCharConfig<TEnum extends readonly string[] | string[]> {
    length?: number;
    enum?: TEnum;
}
declare function char<TName extends string, U extends string, T extends Readonly<[U, ...U[]]>>(name: TName, config?: MySqlCharConfig<T | Writable<T>>): MySqlCharBuilderInitial<TName, Writable<T>>;

type ConvertCustomConfig<TName extends string, T extends Partial<CustomTypeValues>> = Simplify<{
    name: TName;
    data: T['data'];
    driverParam: T['driverData'];
    notNull: T['notNull'] extends true ? true : false;
    hasDefault: T['default'] extends true ? true : false;
}>;
interface MySqlCustomColumnInnerConfig {
    customTypeValues: CustomTypeValues;
}
interface MySqlCustomColumnBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlCustomColumnBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlCustomColumnHKT;
}
interface MySqlCustomColumnHKT extends ColumnHKTBase {
    _type: MySqlCustomColumn<Assume<this['config'], ColumnBaseConfig>>;
}
declare class MySqlCustomColumnBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilder<MySqlCustomColumnBuilderHKT, T, {
    fieldConfig: CustomTypeValues['config'];
    customTypeParams: CustomTypeParams<any>;
}, {
    mysqlColumnBuilderBrand: 'MySqlCustomColumnBuilderBrand';
}> {
    constructor(name: T['name'], fieldConfig: CustomTypeValues['config'], customTypeParams: CustomTypeParams<any>);
}
declare class MySqlCustomColumn<T extends ColumnBaseConfig> extends MySqlColumn<MySqlCustomColumnHKT, T> {
    protected $mysqlColumnBrand: 'MySqlCustomColumn';
    private sqlName;
    private mapTo?;
    private mapFrom?;
    constructor(table: AnyMySqlTable<{
        name: T['tableName'];
    }>, config: MySqlCustomColumnBuilder<T>['config']);
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
 * Custom mysql database data type generator
 */
declare function customType<T extends CustomTypeValues = CustomTypeValues>(customTypeParams: CustomTypeParams<T>): Equal<T['configRequired'], true> extends true ? <TName extends string>(dbName: TName, fieldConfig: T['config']) => MySqlCustomColumnBuilder<ConvertCustomConfig<TName, T>> : <TName extends string>(dbName: TName, fieldConfig?: T['config']) => MySqlCustomColumnBuilder<ConvertCustomConfig<TName, T>>;

interface MySqlDateBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlDateBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlDateHKT;
}
interface MySqlDateHKT extends ColumnHKTBase {
    _type: MySqlDate<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlDateBuilderInitial<TName extends string> = MySqlDateBuilder<{
    name: TName;
    data: Date;
    driverParam: string | number;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlDateBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilder<MySqlDateBuilderHKT, T> {
}
declare class MySqlDate<T extends ColumnBaseConfig> extends MySqlColumn<MySqlDateHKT, T> {
    constructor(table: AnyMySqlTable<{
        name: T['tableName'];
    }>, config: MySqlDateBuilder<T>['config']);
    getSQLType(): string;
    mapFromDriverValue(value: string): Date;
}
interface MySqlDateStringBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlDateStringBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlDateStringHKT;
}
interface MySqlDateStringHKT extends ColumnHKTBase {
    _type: MySqlDateString<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlDateStringBuilderInitial<TName extends string> = MySqlDateStringBuilder<{
    name: TName;
    data: string;
    driverParam: string | number;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlDateStringBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilder<MySqlDateStringBuilderHKT, T> {
}
declare class MySqlDateString<T extends ColumnBaseConfig> extends MySqlColumn<MySqlDateStringHKT, T> {
    constructor(table: AnyMySqlTable<{
        name: T['tableName'];
    }>, config: MySqlDateStringBuilder<T>['config']);
    getSQLType(): string;
}
interface MySqlDateConfig<TMode extends 'date' | 'string' = 'date' | 'string'> {
    mode?: TMode;
}
declare function date<TName extends string, TMode extends MySqlDateConfig['mode'] & {}>(name: TName, config?: MySqlDateConfig<TMode>): Equal<TMode, 'string'> extends true ? MySqlDateStringBuilderInitial<TName> : MySqlDateBuilderInitial<TName>;

interface MySqlDateTimeBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlDateTimeBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlDateTimeHKT;
}
interface MySqlDateTimeHKT extends ColumnHKTBase {
    _type: MySqlDateTime<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlDateTimeBuilderInitial<TName extends string> = MySqlDateTimeBuilder<{
    name: TName;
    data: Date;
    driverParam: string | number;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlDateTimeBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilder<MySqlDateTimeBuilderHKT, T, MySqlDatetimeConfig> {
    constructor(name: T['name'], config: MySqlDatetimeConfig | undefined);
}
declare class MySqlDateTime<T extends ColumnBaseConfig> extends MySqlColumn<MySqlDateTimeHKT, T> {
    readonly fsp: number | undefined;
    constructor(table: AnyMySqlTable<{
        name: T['tableName'];
    }>, config: MySqlDateTimeBuilder<T>['config']);
    getSQLType(): string;
    mapFromDriverValue(value: string): Date;
}
interface MySqlDateTimeStringBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlDateTimeStringBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlDateTimeStringHKT;
}
interface MySqlDateTimeStringHKT extends ColumnHKTBase {
    _type: MySqlDateTimeString<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlDateTimeStringBuilderInitial<TName extends string> = MySqlDateTimeStringBuilder<{
    name: TName;
    data: string;
    driverParam: string | number;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlDateTimeStringBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilder<MySqlDateTimeStringBuilderHKT, T, MySqlDatetimeConfig> {
    constructor(name: T['name'], config: MySqlDatetimeConfig | undefined);
}
declare class MySqlDateTimeString<T extends ColumnBaseConfig> extends MySqlColumn<MySqlDateTimeStringHKT, T> {
    readonly fsp: number | undefined;
    constructor(table: AnyMySqlTable<{
        name: T['tableName'];
    }>, config: MySqlDateTimeStringBuilder<T>['config']);
    getSQLType(): string;
}
type DatetimeFsp = 0 | 1 | 2 | 3 | 4 | 5 | 6;
interface MySqlDatetimeConfig<TMode extends 'date' | 'string' = 'date' | 'string'> {
    mode?: TMode;
    fsp?: DatetimeFsp;
}
declare function datetime<TName extends string, TMode extends MySqlDatetimeConfig['mode'] & {}>(name: TName, config?: MySqlDatetimeConfig<TMode>): Equal<TMode, 'string'> extends true ? MySqlDateTimeStringBuilderInitial<TName> : MySqlDateTimeBuilderInitial<TName>;

interface MySqlDecimalBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlDecimalBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlDecimalHKT;
}
interface MySqlDecimalHKT extends ColumnHKTBase {
    _type: MySqlDecimal<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlDecimalBuilderInitial<TName extends string> = MySqlDecimalBuilder<{
    name: TName;
    data: string;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlDecimalBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilderWithAutoIncrement<MySqlDecimalBuilderHKT, T, MySqlDecimalConfig> {
    constructor(name: T['name'], precision?: number, scale?: number);
}
declare class MySqlDecimal<T extends ColumnBaseConfig> extends MySqlColumnWithAutoIncrement<MySqlDecimalHKT, T, MySqlDecimalConfig> {
    readonly precision: number | undefined;
    readonly scale: number | undefined;
    getSQLType(): string;
}
interface MySqlDecimalConfig {
    precision?: number;
    scale?: number;
}
declare function decimal<TName extends string>(name: TName, config?: MySqlDecimalConfig): MySqlDecimalBuilderInitial<TName>;

interface MySqlDoubleBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlDoubleBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlDoubleHKT;
}
interface MySqlDoubleHKT extends ColumnHKTBase {
    _type: MySqlDouble<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlDoubleBuilderInitial<TName extends string> = MySqlDoubleBuilder<{
    name: TName;
    data: number;
    driverParam: number | string;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlDoubleBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilderWithAutoIncrement<MySqlDoubleBuilderHKT, T, MySqlDoubleConfig> {
    constructor(name: T['name'], config: MySqlDoubleConfig | undefined);
}
declare class MySqlDouble<T extends ColumnBaseConfig> extends MySqlColumnWithAutoIncrement<MySqlDoubleHKT, T, MySqlDoubleConfig> {
    precision: number | undefined;
    scale: number | undefined;
    getSQLType(): string;
}
interface MySqlDoubleConfig {
    precision?: number;
    scale?: number;
}
declare function double<TName extends string>(name: TName, config?: MySqlDoubleConfig): MySqlDoubleBuilderInitial<TName>;

interface MySqlEnumColumnBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlEnumColumnBuilder<Assume<this['config'], ColumnBuilderBaseConfig & WithEnum>>;
    _columnHKT: MySqlEnumColumnHKT;
}
interface MySqlEnumColumnHKT extends ColumnHKTBase {
    _type: MySqlEnumColumn<Assume<this['config'], ColumnBaseConfig & WithEnum>>;
}
type MySqlEnumColumnBuilderInitial<TName extends string, TEnum extends [string, ...string[]]> = MySqlEnumColumnBuilder<{
    name: TName;
    data: TEnum[number];
    driverParam: string;
    enumValues: TEnum;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlEnumColumnBuilder<T extends ColumnBuilderBaseConfig & WithEnum> extends MySqlColumnBuilder<MySqlEnumColumnBuilderHKT, T, Pick<T, 'enumValues'>> {
    constructor(name: T['name'], values: T['enumValues']);
}
declare class MySqlEnumColumn<T extends ColumnBaseConfig & WithEnum> extends MySqlColumn<MySqlEnumColumnHKT, T, Pick<T, 'enumValues'>> implements WithEnum<T['enumValues']> {
    readonly enumValues: T['enumValues'];
    getSQLType(): string;
}
declare function mysqlEnum<TName extends string, U extends string, T extends Readonly<[U, ...U[]]>>(name: TName, values: T | Writable<T>): MySqlEnumColumnBuilderInitial<TName, Writable<T>>;

interface MySqlFloatBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlFloatBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlFloatHKT;
}
interface MySqlFloatHKT extends ColumnHKTBase {
    _type: MySqlFloat<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlFloatBuilderInitial<TName extends string> = MySqlFloatBuilder<{
    name: TName;
    data: number;
    driverParam: number | string;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlFloatBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilderWithAutoIncrement<MySqlFloatBuilderHKT, T> {
}
declare class MySqlFloat<T extends ColumnBaseConfig> extends MySqlColumnWithAutoIncrement<MySqlFloatHKT, T> {
    getSQLType(): string;
}
declare function float<TName extends string>(name: TName): MySqlFloatBuilderInitial<TName>;

interface MySqlIntBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlIntBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlIntHKT;
}
interface MySqlIntHKT extends ColumnHKTBase {
    _type: MySqlInt<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlIntBuilderInitial<TName extends string> = MySqlIntBuilder<{
    name: TName;
    data: number;
    driverParam: number | string;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlIntBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilderWithAutoIncrement<MySqlIntBuilderHKT, T> {
}
declare class MySqlInt<T extends ColumnBaseConfig> extends MySqlColumnWithAutoIncrement<MySqlIntHKT, T> {
    getSQLType(): string;
    mapFromDriverValue(value: number | string): number;
}
declare function int<TName extends string>(name: TName): MySqlIntBuilderInitial<TName>;

interface MySqlJsonBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlJsonBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlJsonHKT;
}
interface MySqlJsonHKT extends ColumnHKTBase {
    _type: MySqlJson<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlJsonBuilderInitial<TName extends string> = MySqlJsonBuilder<{
    name: TName;
    data: unknown;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlJsonBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilder<MySqlJsonBuilderHKT, T> {
}
declare class MySqlJson<T extends ColumnBaseConfig> extends MySqlColumn<MySqlJsonHKT, T> {
    protected $mysqlColumnBrand: 'MySqlJson';
    getSQLType(): string;
    mapToDriverValue(value: T['data']): string;
}
declare function json<TName extends string>(name: TName): MySqlJsonBuilderInitial<TName>;

interface MySqlMediumIntBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlMediumIntBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlMediumIntHKT;
}
interface MySqlMediumIntHKT extends ColumnHKTBase {
    _type: MySqlMediumInt<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlMediumIntBuilderInitial<TName extends string> = MySqlMediumIntBuilder<{
    name: TName;
    data: number;
    driverParam: number | string;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlMediumIntBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilderWithAutoIncrement<MySqlMediumIntBuilderHKT, T> {
}
declare class MySqlMediumInt<T extends ColumnBaseConfig> extends MySqlColumnWithAutoIncrement<MySqlMediumIntHKT, T> {
    getSQLType(): string;
    mapFromDriverValue(value: number | string): number;
}
declare function mediumint<TName extends string>(name: TName): MySqlMediumIntBuilderInitial<TName>;

interface MySqlRealBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlRealBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlRealHKT;
}
interface MySqlRealHKT extends ColumnHKTBase {
    _type: MySqlReal<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlRealBuilderInitial<TName extends string> = MySqlRealBuilder<{
    name: TName;
    data: number;
    driverParam: number | string;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlRealBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilderWithAutoIncrement<MySqlRealBuilderHKT, T, MySqlRealConfig> {
    constructor(name: T['name'], config: MySqlRealConfig | undefined);
}
declare class MySqlReal<T extends ColumnBaseConfig> extends MySqlColumnWithAutoIncrement<MySqlRealHKT, T, MySqlRealConfig> {
    precision: number | undefined;
    scale: number | undefined;
    getSQLType(): string;
}
interface MySqlRealConfig {
    precision?: number;
    scale?: number;
}
declare function real<TName extends string>(name: TName, config?: MySqlRealConfig): MySqlRealBuilderInitial<TName>;

interface MySqlSerialBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlSerialBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlSerialHKT;
}
interface MySqlSerialHKT extends ColumnHKTBase {
    _type: MySqlSerial<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlSerialBuilderInitial<TName extends string> = MySqlSerialBuilder<{
    name: TName;
    data: number;
    driverParam: number;
    notNull: true;
    hasDefault: true;
}>;
declare class MySqlSerialBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilderWithAutoIncrement<MySqlSerialBuilderHKT, T> {
    constructor(name: T['name']);
}
declare class MySqlSerial<T extends ColumnBaseConfig> extends MySqlColumnWithAutoIncrement<MySqlSerialHKT, T> {
    getSQLType(): string;
    mapFromDriverValue(value: number | string): number;
}
declare function serial<TName extends string>(name: TName): MySqlSerialBuilderInitial<TName>;

interface MySqlSmallIntBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlSmallIntBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlSmallIntHKT;
}
interface MySqlSmallIntHKT extends ColumnHKTBase {
    _type: MySqlSmallInt<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlSmallIntBuilderInitial<TName extends string> = MySqlSmallIntBuilder<{
    name: TName;
    data: number;
    driverParam: number | string;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlSmallIntBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilderWithAutoIncrement<MySqlSmallIntBuilderHKT, T> {
}
declare class MySqlSmallInt<T extends ColumnBaseConfig> extends MySqlColumnWithAutoIncrement<MySqlSmallIntHKT, T> {
    getSQLType(): string;
    mapFromDriverValue(value: number | string): number;
}
declare function smallint<TName extends string>(name: TName): MySqlSmallIntBuilderInitial<TName>;

type MySqlTextColumnType = 'tinytext' | 'text' | 'mediumtext' | 'longtext';
interface MySqlTextBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlTextBuilder<Assume<this['config'], ColumnBuilderBaseConfig & WithEnum>>;
    _columnHKT: MySqlTextHKT;
}
interface MySqlTextHKT extends ColumnHKTBase {
    _type: MySqlText<Assume<this['config'], ColumnBaseConfig & WithEnum>>;
}
type MySqlTextBuilderInitial<TName extends string, TEnum extends [string, ...string[]]> = MySqlTextBuilder<{
    name: TName;
    data: TEnum[number];
    driverParam: string;
    enumValues: TEnum;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlTextBuilder<T extends ColumnBuilderBaseConfig & WithEnum> extends MySqlColumnBuilder<MySqlTextBuilderHKT, T, {
    textType: MySqlTextColumnType;
    enumValues: T['enumValues'] | undefined;
}> {
    constructor(name: T['name'], textType: MySqlTextColumnType, config: MySqlTextConfig<T['enumValues']>);
}
declare class MySqlText<T extends ColumnBaseConfig & WithEnum> extends MySqlColumn<MySqlTextHKT, T, {
    textType: MySqlTextColumnType;
    enumValues: T['enumValues'] | undefined;
}> implements WithEnum<T['enumValues']> {
    private textType;
    readonly enumValues: T['enumValues'];
    getSQLType(): string;
}
interface MySqlTextConfig<TEnum extends readonly string[] | string[]> {
    enum?: TEnum;
}
declare function text<TName extends string, U extends string, T extends Readonly<[U, ...U[]]>>(name: TName, config?: MySqlTextConfig<T | Writable<T>>): MySqlTextBuilderInitial<TName, Writable<T>>;
declare function tinytext<TName extends string, U extends string, T extends Readonly<[U, ...U[]]>>(name: TName, config?: MySqlTextConfig<T | Writable<T>>): MySqlTextBuilderInitial<TName, Writable<T>>;
declare function mediumtext<TName extends string, U extends string, T extends Readonly<[U, ...U[]]>>(name: TName, config?: MySqlTextConfig<T | Writable<T>>): MySqlTextBuilderInitial<TName, Writable<T>>;
declare function longtext<TName extends string, U extends string, T extends Readonly<[U, ...U[]]>>(name: TName, config?: MySqlTextConfig<T | Writable<T>>): MySqlTextBuilderInitial<TName, Writable<T>>;

interface MySqlTimeBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlTimeBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlTimeHKT;
}
interface MySqlTimeHKT extends ColumnHKTBase {
    _type: MySqlTime<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlTimeBuilderInitial<TName extends string> = MySqlTimeBuilder<{
    name: TName;
    data: string;
    driverParam: string | number;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlTimeBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilder<MySqlTimeBuilderHKT, T, TimeConfig> {
    constructor(name: T['name'], config: TimeConfig | undefined);
}
declare class MySqlTime<T extends ColumnBaseConfig> extends MySqlColumn<MySqlTimeHKT, T, TimeConfig> {
    readonly fsp: number | undefined;
    getSQLType(): string;
}
type TimeConfig = {
    fsp?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};
declare function time<TName extends string>(name: TName, config?: TimeConfig): MySqlTimeBuilderInitial<TName>;

interface MySqlDateColumnBaseConfig {
    hasOnUpdateNow: boolean;
}
declare abstract class MySqlDateColumnBaseBuilder<THKT extends ColumnBuilderHKTBase, T extends ColumnBuilderBaseConfig, TRuntimeConfig extends object = {}> extends MySqlColumnBuilder<THKT, T, TRuntimeConfig & MySqlDateColumnBaseConfig> {
    defaultNow(): ColumnBuilderKind<THKT, Simplify<Omit<T, "hasDefault"> & {
        hasDefault: true;
    }, {}>>;
    onUpdateNow(): ColumnBuilderKind<THKT, UpdateCBConfig<T, {
        hasDefault: true;
    }>>;
}
declare abstract class MySqlDateBaseColumn<THKT extends ColumnHKTBase, T extends ColumnBaseConfig, TRuntimeConfig extends object = {}> extends MySqlColumn<THKT, T, MySqlDateColumnBaseConfig & TRuntimeConfig> {
    readonly hasOnUpdateNow: boolean;
}

interface MySqlTimestampBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlTimestampBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlTimestampHKT;
}
interface MySqlTimestampHKT extends ColumnHKTBase {
    _type: MySqlTimestamp<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlTimestampBuilderInitial<TName extends string> = MySqlTimestampBuilder<{
    name: TName;
    data: Date;
    driverParam: string | number;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlTimestampBuilder<T extends ColumnBuilderBaseConfig> extends MySqlDateColumnBaseBuilder<MySqlTimestampBuilderHKT, T, MySqlTimestampConfig> {
    constructor(name: T['name'], config: MySqlTimestampConfig | undefined);
}
declare class MySqlTimestamp<T extends ColumnBaseConfig> extends MySqlDateBaseColumn<MySqlTimestampHKT, T, MySqlTimestampConfig> {
    readonly fsp: number | undefined;
    getSQLType(): string;
    mapFromDriverValue(value: string): Date;
    mapToDriverValue(value: Date): string;
}
interface MySqlTimestampStringBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlTimestampStringBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlTimestampStringHKT;
}
interface MySqlTimestampStringHKT extends ColumnHKTBase {
    _type: MySqlTimestampString<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlTimestampStringBuilderInitial<TName extends string> = MySqlTimestampStringBuilder<{
    name: TName;
    data: string;
    driverParam: string | number;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlTimestampStringBuilder<T extends ColumnBuilderBaseConfig> extends MySqlDateColumnBaseBuilder<MySqlTimestampStringBuilderHKT, T, MySqlTimestampConfig> {
    constructor(name: T['name'], config: MySqlTimestampConfig | undefined);
}
declare class MySqlTimestampString<T extends ColumnBaseConfig> extends MySqlDateBaseColumn<MySqlTimestampStringHKT, T, MySqlTimestampConfig> {
    readonly fsp: number | undefined;
    getSQLType(): string;
}
type TimestampFsp = 0 | 1 | 2 | 3 | 4 | 5 | 6;
interface MySqlTimestampConfig<TMode extends 'string' | 'date' = 'string' | 'date'> {
    mode?: TMode;
    fsp?: TimestampFsp;
}
declare function timestamp<TName extends string, TMode extends MySqlTimestampConfig['mode'] & {}>(name: TName, config?: MySqlTimestampConfig<TMode>): Equal<TMode, 'string'> extends true ? MySqlTimestampStringBuilderInitial<TName> : MySqlTimestampBuilderInitial<TName>;

interface MySqlTinyIntBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlTinyIntBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlTinyIntHKT;
}
interface MySqlTinyIntHKT extends ColumnHKTBase {
    _type: MySqlTinyInt<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlTinyIntBuilderInitial<TName extends string> = MySqlTinyIntBuilder<{
    name: TName;
    data: number;
    driverParam: number | string;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlTinyIntBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilderWithAutoIncrement<MySqlTinyIntBuilderHKT, T> {
}
declare class MySqlTinyInt<T extends ColumnBaseConfig> extends MySqlColumnWithAutoIncrement<MySqlTinyIntHKT, T> {
    getSQLType(): string;
    mapFromDriverValue(value: number | string): number;
}
declare function tinyint<TName extends string>(name: TName): MySqlTinyIntBuilderInitial<TName>;

interface MySqlVarBinaryBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlVarBinaryBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlVarBinaryHKT;
}
interface MySqlVarBinaryHKT extends ColumnHKTBase {
    _type: MySqlVarBinary<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlVarBinaryBuilderInitial<TName extends string> = MySqlVarBinaryBuilder<{
    name: TName;
    data: string;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlVarBinaryBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilder<MySqlVarBinaryBuilderHKT, T, MySqlVarbinaryOptions> {
}
declare class MySqlVarBinary<T extends ColumnBaseConfig> extends MySqlColumn<MySqlVarBinaryHKT, T, MySqlVarbinaryOptions> {
    length: number | undefined;
    getSQLType(): string;
}
interface MySqlVarbinaryOptions {
    length: number;
}
declare function varbinary<TName extends string>(name: TName, options: MySqlVarbinaryOptions): MySqlVarBinaryBuilderInitial<TName>;

interface MySqlVarCharBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlVarCharBuilder<Assume<this['config'], ColumnBuilderBaseConfig & WithEnum>>;
    _columnHKT: MySqlVarCharHKT;
}
interface MySqlVarCharHKT extends ColumnHKTBase {
    _type: MySqlVarChar<Assume<this['config'], ColumnBaseConfig & WithEnum>>;
}
type MySqlVarCharBuilderInitial<TName extends string, TEnum extends [string, ...string[]]> = MySqlVarCharBuilder<{
    name: TName;
    data: TEnum[number];
    driverParam: number | string;
    enumValues: TEnum;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlVarCharBuilder<T extends ColumnBuilderBaseConfig & WithEnum> extends MySqlColumnBuilder<MySqlVarCharBuilderHKT, T, MySqlVarCharConfig<T['enumValues']>> {
}
declare class MySqlVarChar<T extends ColumnBaseConfig & WithEnum> extends MySqlColumn<MySqlVarCharHKT, T, MySqlVarCharConfig<T['enumValues']>> implements WithEnum {
    readonly length: number | undefined;
    readonly enumValues: T['enumValues'];
    getSQLType(): string;
}
interface MySqlVarCharConfig<TEnum extends string[] | readonly string[]> {
    length: number;
    enum?: TEnum;
}
declare function varchar<TName extends string, U extends string, T extends Readonly<[U, ...U[]]>>(name: TName, config: MySqlVarCharConfig<T | Writable<T>>): MySqlVarCharBuilderInitial<TName, Writable<T>>;

interface MySqlYearBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlYearBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlYearHKT;
}
interface MySqlYearHKT extends ColumnHKTBase {
    _type: MySqlYear<Assume<this['config'], ColumnBaseConfig>>;
}
type MySqlYearBuilderInitial<TName extends string> = MySqlYearBuilder<{
    name: TName;
    data: number;
    driverParam: number;
    notNull: false;
    hasDefault: false;
}>;
declare class MySqlYearBuilder<T extends ColumnBuilderBaseConfig> extends MySqlColumnBuilder<MySqlYearBuilderHKT, T> {
}
declare class MySqlYear<T extends ColumnBaseConfig> extends MySqlColumn<MySqlYearHKT, T> {
    getSQLType(): string;
}
declare function year<TName extends string>(name: TName): MySqlYearBuilderInitial<TName>;

declare function alias<TTable extends AnyMySqlTable, TAlias extends string>(table: TTable, alias: TAlias): BuildAliasTable<TTable, TAlias>;

declare class MySqlSchema<TName extends string = string> {
    readonly schemaName: TName;
    constructor(schemaName: TName);
    table: MySqlTableFn<TName>;
    view: typeof mysqlView;
}
/** @deprecated - use `instanceof MySqlSchema` */
declare function isMySqlSchema(obj: unknown): obj is MySqlSchema;
/**
 * Create a MySQL schema.
 * https://dev.mysql.com/doc/refman/8.0/en/create-database.html
 *
 * @param name mysql use schema name
 * @returns MySQL schema
 */
declare function mysqlDatabase<TName extends string>(name: TName): MySqlSchema<TName>;
/**
 * @see mysqlDatabase
 */
declare const mysqlSchema: typeof mysqlDatabase;

declare function getTableConfig(table: AnyMySqlTable): {
    columns: AnyMySqlColumn[];
    indexes: Index[];
    foreignKeys: ForeignKey[];
    checks: Check[];
    primaryKeys: PrimaryKey[];
    name: string;
    schema: string | undefined;
    baseName: string;
};
declare function getViewConfig<TName extends string = string, TExisting extends boolean = boolean>(view: MySqlView<TName, TExisting>): {
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

export { AnyMySqlColumn, AnyMySqlTable, BuildAliasTable, Check, ConvertCustomConfig, CustomTypeParams, CustomTypeValues, DatetimeFsp, ForeignKey, Index, MySqlBigInt53, MySqlBigInt53Builder, MySqlBigInt53BuilderHKT, MySqlBigInt53BuilderInitial, MySqlBigInt53HKT, MySqlBigInt64, MySqlBigInt64Builder, MySqlBigInt64BuilderHKT, MySqlBigInt64BuilderInitial, MySqlBigInt64HKT, MySqlBinary, MySqlBinaryBuilder, MySqlBinaryBuilderHKT, MySqlBinaryBuilderInitial, MySqlBinaryConfig, MySqlBinaryHKT, MySqlBoolean, MySqlBooleanBuilder, MySqlBooleanBuilderHKT, MySqlBooleanBuilderInitial, MySqlBooleanHKT, MySqlChar, MySqlCharBuilder, MySqlCharBuilderHKT, MySqlCharBuilderInitial, MySqlCharConfig, MySqlCharHKT, MySqlColumn, MySqlColumnBuilder, MySqlColumnBuilderWithAutoIncrement, MySqlColumnWithAutoIncrement, MySqlCustomColumn, MySqlCustomColumnBuilder, MySqlCustomColumnBuilderHKT, MySqlCustomColumnHKT, MySqlCustomColumnInnerConfig, MySqlDate, MySqlDateBuilder, MySqlDateBuilderHKT, MySqlDateBuilderInitial, MySqlDateConfig, MySqlDateHKT, MySqlDateString, MySqlDateStringBuilder, MySqlDateStringBuilderHKT, MySqlDateStringBuilderInitial, MySqlDateStringHKT, MySqlDateTime, MySqlDateTimeBuilder, MySqlDateTimeBuilderHKT, MySqlDateTimeBuilderInitial, MySqlDateTimeHKT, MySqlDateTimeString, MySqlDateTimeStringBuilder, MySqlDateTimeStringBuilderHKT, MySqlDateTimeStringBuilderInitial, MySqlDateTimeStringHKT, MySqlDatetimeConfig, MySqlDecimal, MySqlDecimalBuilder, MySqlDecimalBuilderHKT, MySqlDecimalBuilderInitial, MySqlDecimalConfig, MySqlDecimalHKT, MySqlDouble, MySqlDoubleBuilder, MySqlDoubleBuilderHKT, MySqlDoubleBuilderInitial, MySqlDoubleConfig, MySqlDoubleHKT, MySqlEnumColumn, MySqlEnumColumnBuilder, MySqlEnumColumnBuilderHKT, MySqlEnumColumnBuilderInitial, MySqlEnumColumnHKT, MySqlFloat, MySqlFloatBuilder, MySqlFloatBuilderHKT, MySqlFloatBuilderInitial, MySqlFloatHKT, MySqlInt, MySqlIntBuilder, MySqlIntBuilderHKT, MySqlIntBuilderInitial, MySqlIntHKT, MySqlJson, MySqlJsonBuilder, MySqlJsonBuilderHKT, MySqlJsonBuilderInitial, MySqlJsonHKT, MySqlMediumInt, MySqlMediumIntBuilder, MySqlMediumIntBuilderHKT, MySqlMediumIntBuilderInitial, MySqlMediumIntHKT, MySqlReal, MySqlRealBuilder, MySqlRealBuilderHKT, MySqlRealBuilderInitial, MySqlRealConfig, MySqlRealHKT, MySqlSchema, MySqlSerial, MySqlSerialBuilder, MySqlSerialBuilderHKT, MySqlSerialBuilderInitial, MySqlSerialHKT, MySqlSmallInt, MySqlSmallIntBuilder, MySqlSmallIntBuilderHKT, MySqlSmallIntBuilderInitial, MySqlSmallIntHKT, MySqlTableFn, MySqlText, MySqlTextBuilder, MySqlTextBuilderHKT, MySqlTextBuilderInitial, MySqlTextColumnType, MySqlTextConfig, MySqlTextHKT, MySqlTime, MySqlTimeBuilder, MySqlTimeBuilderHKT, MySqlTimeBuilderInitial, MySqlTimeHKT, MySqlTimestamp, MySqlTimestampBuilder, MySqlTimestampBuilderHKT, MySqlTimestampBuilderInitial, MySqlTimestampConfig, MySqlTimestampHKT, MySqlTimestampString, MySqlTimestampStringBuilder, MySqlTimestampStringBuilderHKT, MySqlTimestampStringBuilderInitial, MySqlTimestampStringHKT, MySqlTinyInt, MySqlTinyIntBuilder, MySqlTinyIntBuilderHKT, MySqlTinyIntBuilderInitial, MySqlTinyIntHKT, MySqlVarBinary, MySqlVarBinaryBuilder, MySqlVarBinaryBuilderHKT, MySqlVarBinaryBuilderInitial, MySqlVarBinaryHKT, MySqlVarChar, MySqlVarCharBuilder, MySqlVarCharBuilderHKT, MySqlVarCharBuilderInitial, MySqlVarCharConfig, MySqlVarCharHKT, MySqlVarbinaryOptions, MySqlView, MySqlYear, MySqlYearBuilder, MySqlYearBuilderHKT, MySqlYearBuilderInitial, MySqlYearHKT, PrimaryKey, TimeConfig, TimestampFsp, alias, bigint, binary, boolean, char, customType, date, datetime, decimal, double, float, getTableConfig, getViewConfig, int, isMySqlSchema, json, longtext, mediumint, mediumtext, mysqlDatabase, mysqlEnum, mysqlSchema, mysqlView, real, serial, smallint, text, time, timestamp, tinyint, tinytext, varbinary, varchar, year };
