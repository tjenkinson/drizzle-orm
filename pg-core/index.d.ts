import { P as PgColumnBuilder, a as PgColumn, A as AnyPgTable, B as BuildAliasTable, b as PgTableFn, p as pgView, c as pgMaterializedView, d as AnyPgColumn, I as Index, F as ForeignKey, C as Check, e as PrimaryKey, f as PgView, V as ViewWithConfig, g as PgMaterializedView, h as PgMaterializedViewWithConfig } from '../db.d-a6fe1b19.js';
export { x as AnyForeignKeyBuilder, E as AnyIndexBuilder, r as AnyPgColumnBuilder, s as AnyPgColumnHKT, a1 as AnyPgSelect, at as AnyPgTableHKT, i as CheckBuilder, ax as DefaultViewBuilderCore, w as ForeignKeyBuilder, H as GetColumnsTableName, G as IndexBuilder, D as IndexBuilderOn, z as IndexColumn, a3 as JoinFn, a0 as JoinsValue, a8 as LockConfig, a7 as LockStrength, aC as ManualMaterializedViewBuilder, az as ManualViewBuilder, aB as MaterializedViewBuilder, aA as MaterializedViewBuilderCore, n as PgArray, m as PgArrayBuilder, k as PgArrayBuilderHKT, l as PgArrayHKT, o as PgColumnBuilderHKT, q as PgColumnHKT, t as PgDatabase, O as PgDelete, N as PgDeleteConfig, u as PgDialect, W as PgInsert, T as PgInsertBuilder, Q as PgInsertConfig, S as PgInsertValue, aG as PgMaterializedViewConfig, aH as PgMaterializedViewWithSelection, Y as PgRefreshMaterializedView, $ as PgSelect, Z as PgSelectBuilder, a2 as PgSelectConfig, ac as PgSelectHKT, a9 as PgSelectHKTBase, aa as PgSelectKind, _ as PgSelectQueryBuilder, ab as PgSelectQueryBuilderHKT, ak as PgSession, as as PgTable, aq as PgTableExtraConfig, au as PgTableWithColumns, al as PgTransaction, aj as PgTransactionConfig, ag as PgUpdate, af as PgUpdateBuilder, ad as PgUpdateConfig, ae as PgUpdateSetSource, aD as PgViewBase, aE as PgViewConfig, aF as PgViewWithSelection, ai as PreparedQuery, ah as PreparedQueryConfig, M as PrimaryKeyBuilder, X as QueryBuilder, am as QueryResultHKT, an as QueryResultKind, v as Reference, R as ReferenceConfig, a5 as SelectedFields, a4 as SelectedFieldsFlat, a6 as SelectedFieldsOrdered, ao as SubqueryWithSelection, ar as TableConfig, U as UpdateDeleteAction, ay as ViewBuilder, ap as WithSubqueryWithSelection, j as check, y as foreignKey, J as index, av as pgTable, aw as pgTableCreator, L as primaryKey, K as uniqueIndex } from '../db.d-a6fe1b19.js';
import { n as ColumnBuilderHKTBase, ay as Assume, k as ColumnBuilderBaseConfig, c as ColumnHKTBase, C as ColumnBaseConfig, W as WithEnum, aF as Writable, S as Simplify, az as Equal, a as SQL, o as ColumnBuilderKind, F as SelectedFields, A as AnyColumn, T as Table, ak as TableConfig } from '../column.d-66a08b85.js';
import '../migrator.js';
import '../query-promise.d-d7b61248.js';
import '../select.types.d-1bd49d37.js';

interface PgBigInt53BuilderHKT extends ColumnBuilderHKTBase {
    _type: PgBigInt53Builder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgBigInt53HKT;
}
interface PgBigInt53HKT extends ColumnHKTBase {
    _type: PgBigInt53<Assume<this['config'], ColumnBaseConfig>>;
}
type PgBigInt53BuilderInitial<TName extends string> = PgBigInt53Builder<{
    name: TName;
    data: number;
    driverParam: number | string;
    notNull: false;
    hasDefault: false;
}>;
declare class PgBigInt53Builder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgBigInt53BuilderHKT, T> {
}
declare class PgBigInt53<T extends ColumnBaseConfig> extends PgColumn<PgBigInt53HKT, T> {
    getSQLType(): string;
    mapFromDriverValue(value: number | string): number;
}
interface PgBigInt64BuilderHKT extends ColumnBuilderHKTBase {
    _type: PgBigInt64Builder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgBigInt64HKT;
}
interface PgBigInt64HKT extends ColumnHKTBase {
    _type: PgBigInt64<Assume<this['config'], ColumnBaseConfig>>;
}
type PgBigInt64BuilderInitial<TName extends string> = PgBigInt64Builder<{
    name: TName;
    data: bigint;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class PgBigInt64Builder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgBigInt64BuilderHKT, T> {
}
declare class PgBigInt64<T extends ColumnBaseConfig> extends PgColumn<PgBigInt64HKT, T> {
    getSQLType(): string;
    mapFromDriverValue(value: string): bigint;
}
interface PgBigIntConfig<T extends 'number' | 'bigint' = 'number' | 'bigint'> {
    mode: T;
}
declare function bigint<TName extends string, TMode extends PgBigIntConfig['mode']>(name: TName, config: PgBigIntConfig<TMode>): TMode extends 'number' ? PgBigInt53BuilderInitial<TName> : PgBigInt64BuilderInitial<TName>;

interface PgBigSerial53BuilderHKT extends ColumnBuilderHKTBase {
    _type: PgBigSerial53Builder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgBigSerial53HKT;
}
interface PgBigSerial53HKT extends ColumnHKTBase {
    _type: PgBigSerial53<Assume<this['config'], ColumnBaseConfig>>;
}
type PgBigSerial53BuilderInitial<TName extends string> = PgBigSerial53Builder<{
    name: TName;
    data: number;
    driverParam: number;
    notNull: true;
    hasDefault: true;
}>;
declare class PgBigSerial53Builder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgBigSerial53BuilderHKT, T> {
    constructor(name: string);
}
declare class PgBigSerial53<T extends ColumnBaseConfig> extends PgColumn<PgBigSerial53HKT, T> {
    getSQLType(): string;
    mapFromDriverValue(value: number): number;
}
interface PgBigSerial64BuilderHKT extends ColumnBuilderHKTBase {
    _type: PgBigSerial64Builder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgBigSerial64HKT;
}
interface PgBigSerial64HKT extends ColumnHKTBase {
    _type: PgBigSerial64<Assume<this['config'], ColumnBaseConfig>>;
}
type PgBigSerial64BuilderInitial<TName extends string> = PgBigSerial64Builder<{
    name: TName;
    data: bigint;
    driverParam: string;
    notNull: true;
    hasDefault: true;
}>;
declare class PgBigSerial64Builder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgBigSerial64BuilderHKT, T> {
    constructor(name: string);
}
declare class PgBigSerial64<T extends ColumnBaseConfig> extends PgColumn<PgBigSerial64HKT, T> {
    getSQLType(): string;
    mapFromDriverValue(value: string): bigint;
}
interface PgBigSerialConfig<T extends 'number' | 'bigint' = 'number' | 'bigint'> {
    mode: T;
}
declare function bigserial<TName extends string, TMode extends PgBigSerialConfig['mode']>(name: TName, config: PgBigSerialConfig<TMode>): TMode extends 'number' ? PgBigSerial53BuilderInitial<TName> : PgBigSerial64BuilderInitial<TName>;

interface PgBooleanBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgBooleanBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgBooleanHKT;
}
interface PgBooleanHKT extends ColumnHKTBase {
    _type: PgBoolean<Assume<this['config'], ColumnBaseConfig>>;
}
type PgBooleanBuilderInitial<TName extends string> = PgBooleanBuilder<{
    name: TName;
    data: boolean;
    driverParam: boolean;
    notNull: false;
    hasDefault: false;
}>;
declare class PgBooleanBuilder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgBooleanBuilderHKT, T> {
}
declare class PgBoolean<T extends ColumnBaseConfig> extends PgColumn<PgBooleanHKT, T> {
    getSQLType(): string;
}
declare function boolean<TName extends string>(name: TName): PgBooleanBuilderInitial<TName>;

interface PgCharBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgCharBuilder<Assume<this['config'], ColumnBuilderBaseConfig & WithEnum>>;
    _columnHKT: PgCharHKT;
}
interface PgCharHKT extends ColumnHKTBase {
    _type: PgChar<Assume<this['config'], ColumnBaseConfig & WithEnum>>;
}
type PgCharBuilderInitial<TName extends string, TEnum extends [string, ...string[]]> = PgCharBuilder<{
    name: TName;
    data: TEnum[number];
    enumValues: TEnum;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class PgCharBuilder<T extends ColumnBuilderBaseConfig & WithEnum> extends PgColumnBuilder<PgCharBuilderHKT, T, {
    length: number | undefined;
} & WithEnum<T['enumValues']>> {
    constructor(name: string, config: PgCharConfig<T['enumValues']>);
}
declare class PgChar<T extends ColumnBaseConfig & WithEnum> extends PgColumn<PgCharHKT, T, {
    length: number | undefined;
} & WithEnum<T['enumValues']>> {
    readonly length: number | undefined;
    readonly enumValues: T["enumValues"];
    getSQLType(): string;
}
interface PgCharConfig<TEnum extends readonly string[] | string[]> {
    length?: number;
    enum?: TEnum;
}
declare function char<TName extends string, U extends string, T extends Readonly<[U, ...U[]]>>(name: TName, config?: PgCharConfig<T | Writable<T>>): PgCharBuilderInitial<TName, Writable<T>>;

interface PgCidrBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgCidrBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgCidrHKT;
}
interface PgCidrHKT extends ColumnHKTBase {
    _type: PgCidr<Assume<this['config'], ColumnBaseConfig>>;
}
type PgCidrBuilderInitial<TName extends string> = PgCidrBuilder<{
    name: TName;
    data: string;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class PgCidrBuilder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgCidrBuilderHKT, T> {
}
declare class PgCidr<T extends ColumnBaseConfig> extends PgColumn<PgCidrHKT, T> {
    getSQLType(): string;
}
declare function cidr<TName extends string>(name: TName): PgCidrBuilderInitial<TName>;

type ConvertCustomConfig<TName extends string, T extends Partial<CustomTypeValues>> = Simplify<{
    name: TName;
    data: T['data'];
    driverParam: T['driverData'];
    notNull: T['notNull'] extends true ? true : false;
    hasDefault: T['default'] extends true ? true : false;
}>;
interface PgCustomColumnInnerConfig {
    customTypeValues: CustomTypeValues;
}
interface PgCustomColumnBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgCustomColumnBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgCustomColumnHKT;
}
interface PgCustomColumnHKT extends ColumnHKTBase {
    _type: PgCustomColumn<Assume<this['config'], ColumnBaseConfig>>;
}
declare class PgCustomColumnBuilder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgCustomColumnBuilderHKT, T, {
    fieldConfig: CustomTypeValues['config'];
    customTypeParams: CustomTypeParams<any>;
}, {
    pgColumnBuilderBrand: 'PgCustomColumnBuilderBrand';
}> {
    constructor(name: T['name'], fieldConfig: CustomTypeValues['config'], customTypeParams: CustomTypeParams<any>);
}
declare class PgCustomColumn<T extends ColumnBaseConfig> extends PgColumn<PgCustomColumnHKT, T> {
    protected $pgColumnBrand: 'PgCustomColumn';
    private sqlName;
    private mapTo?;
    private mapFrom?;
    constructor(table: AnyPgTable<{
        name: T['tableName'];
    }>, config: PgCustomColumnBuilder<T>['config']);
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
 * Custom pg database data type generator
 */
declare function customType<T extends CustomTypeValues = CustomTypeValues>(customTypeParams: CustomTypeParams<T>): Equal<T['configRequired'], true> extends true ? <TName extends string>(dbName: TName, fieldConfig: T['config']) => PgCustomColumnBuilder<ConvertCustomConfig<TName, T>> : <TName extends string>(dbName: TName, fieldConfig?: T['config']) => PgCustomColumnBuilder<ConvertCustomConfig<TName, T>>;

declare abstract class PgDateColumnBaseBuilder<THKT extends ColumnBuilderHKTBase, T extends ColumnBuilderBaseConfig, TRuntimeConfig extends object = {}> extends PgColumnBuilder<THKT, T, TRuntimeConfig> {
    defaultNow(): ColumnBuilderKind<THKT, Simplify<Omit<T, "hasDefault"> & {
        hasDefault: true;
    }, {}>>;
}

interface PgDateBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgDateBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgDateHKT;
}
interface PgDateHKT extends ColumnHKTBase {
    _type: PgDate<Assume<this['config'], ColumnBaseConfig>>;
}
type PgDateBuilderInitial<TName extends string> = PgDateBuilder<{
    name: TName;
    data: Date;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class PgDateBuilder<T extends ColumnBuilderBaseConfig> extends PgDateColumnBaseBuilder<PgDateBuilderHKT, T> {
}
declare class PgDate<T extends ColumnBaseConfig> extends PgColumn<PgDateHKT, T> {
    getSQLType(): string;
    mapFromDriverValue(value: string): Date;
    mapToDriverValue(value: Date): string;
}
interface PgDateStringBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgDateStringBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgDateStringHKT;
}
interface PgDateStringHKT extends ColumnHKTBase {
    _type: PgDateString<Assume<this['config'], ColumnBaseConfig>>;
}
type PgDateStringBuilderInitial<TName extends string> = PgDateStringBuilder<{
    name: TName;
    data: string;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class PgDateStringBuilder<T extends ColumnBuilderBaseConfig> extends PgDateColumnBaseBuilder<PgDateStringBuilderHKT, T> {
}
declare class PgDateString<T extends ColumnBaseConfig> extends PgColumn<PgDateStringHKT, T> {
    getSQLType(): string;
}
declare function date<TName extends string>(name: TName, config?: {
    mode: 'string';
}): PgDateStringBuilderInitial<TName>;
declare function date<TName extends string>(TName: TName, config?: {
    mode: 'date';
}): PgDateBuilderInitial<TName>;

interface PgDoublePrecisionBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgDoublePrecisionBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgDoublePrecisionHKT;
}
interface PgDoublePrecisionHKT extends ColumnHKTBase {
    _type: PgDoublePrecision<Assume<this['config'], ColumnBaseConfig>>;
}
type PgDoublePrecisionBuilderInitial<TName extends string> = PgDoublePrecisionBuilder<{
    name: TName;
    data: number;
    driverParam: string | number;
    notNull: false;
    hasDefault: false;
}>;
declare class PgDoublePrecisionBuilder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgDoublePrecisionBuilderHKT, T> {
}
declare class PgDoublePrecision<T extends ColumnBaseConfig> extends PgColumn<PgDoublePrecisionHKT, T> {
    getSQLType(): string;
    mapFromDriverValue(value: string | number): number;
}
declare function doublePrecision<TName extends string>(name: TName): PgDoublePrecisionBuilderInitial<TName>;

interface PgEnumColumnBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgEnumColumnBuilder<Assume<this['config'], ColumnBuilderBaseConfig & WithEnum>>;
    _columnHKT: PgEnumColumnHKT;
}
interface PgEnumColumnHKT extends ColumnHKTBase {
    _type: PgEnumColumn<Assume<this['config'], ColumnBaseConfig & WithEnum>>;
}
type PgEnumColumnBuilderInitial<TName extends string, TValues extends [string, ...string[]]> = PgEnumColumnBuilder<{
    name: TName;
    data: TValues[number];
    enumValues: TValues;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
interface PgEnum<TValues extends [string, ...string[]]> extends WithEnum<TValues> {
    <TName extends string>(name: TName): PgEnumColumnBuilderInitial<TName, TValues>;
    readonly enumName: string;
    readonly enumValues: TValues;
}
declare function isPgEnum(obj: unknown): obj is PgEnum<[string, ...string[]]>;
declare class PgEnumColumnBuilder<T extends ColumnBuilderBaseConfig & WithEnum> extends PgColumnBuilder<PgEnumColumnBuilderHKT, T, {
    enum: PgEnum<T['enumValues']>;
}> {
    constructor(name: string, enumInstance: PgEnum<T['enumValues']>);
}
declare class PgEnumColumn<T extends ColumnBaseConfig & WithEnum> extends PgColumn<PgEnumColumnHKT, T, {
    enum: PgEnum<T['enumValues']>;
}> implements WithEnum<T['enumValues']> {
    readonly enum: PgEnum<T["enumValues"]>;
    readonly enumValues: T["enumValues"];
    constructor(table: AnyPgTable<{
        name: T['tableName'];
    }>, config: PgEnumColumnBuilder<T>['config']);
    getSQLType(): string;
}
declare function pgEnum<U extends string, T extends Readonly<[U, ...U[]]>>(enumName: string, values: T | Writable<T>): PgEnum<Writable<T>>;

interface PgInetBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgInetBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgInetHKT;
}
interface PgInetHKT extends ColumnHKTBase {
    _type: PgInet<Assume<this['config'], ColumnBaseConfig>>;
}
type PgInetBuilderInitial<TName extends string> = PgInetBuilder<{
    name: TName;
    data: string;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class PgInetBuilder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgInetBuilderHKT, T> {
}
declare class PgInet<T extends ColumnBaseConfig> extends PgColumn<PgInetHKT, T> {
    getSQLType(): string;
}
declare function inet<TName extends string>(name: TName): PgInetBuilderInitial<TName>;

interface PgIntegerBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgIntegerBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgIntegerHKT;
}
interface PgIntegerHKT extends ColumnHKTBase {
    _type: PgInteger<Assume<this['config'], ColumnBaseConfig>>;
}
type PgIntegerBuilderInitial<TName extends string> = PgIntegerBuilder<{
    name: TName;
    data: number;
    driverParam: number | string;
    hasDefault: false;
    notNull: false;
}>;
declare class PgIntegerBuilder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgIntegerBuilderHKT, T> {
}
declare class PgInteger<T extends ColumnBaseConfig> extends PgColumn<PgIntegerHKT, T> {
    getSQLType(): string;
    mapFromDriverValue(value: number | string): number;
}
declare function integer<TName extends string>(name: TName): PgIntegerBuilderInitial<TName>;

interface PgTimestampBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgTimestampBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgTimestampHKT;
}
interface PgTimestampHKT extends ColumnHKTBase {
    _type: PgTimestamp<Assume<this['config'], ColumnBaseConfig>>;
}
type PgTimestampBuilderInitial<TName extends string> = PgTimestampBuilder<{
    name: TName;
    data: Date;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class PgTimestampBuilder<T extends ColumnBuilderBaseConfig> extends PgDateColumnBaseBuilder<PgTimestampBuilderHKT, T, {
    withTimezone: boolean;
    precision: number | undefined;
}> {
    constructor(name: string, withTimezone: boolean, precision: number | undefined);
}
declare class PgTimestamp<T extends ColumnBaseConfig> extends PgColumn<PgTimestampHKT, T> {
    readonly withTimezone: boolean;
    readonly precision: number | undefined;
    constructor(table: AnyPgTable<{
        name: T['tableName'];
    }>, config: PgTimestampBuilder<T>['config']);
    getSQLType(): string;
    mapFromDriverValue: (value: string) => Date;
    mapToDriverValue: (value: Date) => string;
}
interface PgTimestampStringBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgTimestampStringBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgTimestampStringHKT;
}
interface PgTimestampStringHKT extends ColumnHKTBase {
    _type: PgTimestampString<Assume<this['config'], ColumnBaseConfig>>;
}
type PgTimestampStringBuilderInitial<TName extends string> = PgTimestampStringBuilder<{
    name: TName;
    data: string;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class PgTimestampStringBuilder<T extends ColumnBuilderBaseConfig> extends PgDateColumnBaseBuilder<PgTimestampStringBuilderHKT, T, {
    withTimezone: boolean;
    precision: number | undefined;
}> {
    constructor(name: string, withTimezone: boolean, precision: number | undefined);
}
declare class PgTimestampString<T extends ColumnBaseConfig> extends PgColumn<PgTimestampStringHKT, T> {
    readonly withTimezone: boolean;
    readonly precision: number | undefined;
    constructor(table: AnyPgTable<{
        name: T['tableName'];
    }>, config: PgTimestampStringBuilder<T>['config']);
    getSQLType(): string;
}
type Precision = 0 | 1 | 2 | 3 | 4 | 5 | 6;
interface PgTimestampConfig<TMode extends 'date' | 'string' = 'date' | 'string'> {
    mode?: TMode;
    precision?: Precision;
    withTimezone?: boolean;
}
declare function timestamp<TName extends string, TMode extends PgTimestampConfig['mode'] & {}>(name: TName, config?: PgTimestampConfig<TMode>): Equal<TMode, 'string'> extends true ? PgTimestampStringBuilderInitial<TName> : PgTimestampBuilderInitial<TName>;

interface PgIntervalBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgIntervalBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgIntervalHKT;
}
interface PgIntervalHKT extends ColumnHKTBase {
    _type: PgInterval<Assume<this['config'], ColumnBaseConfig>>;
}
type PgIntervalBuilderInitial<TName extends string> = PgIntervalBuilder<{
    name: TName;
    data: string;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class PgIntervalBuilder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgIntervalBuilderHKT, T, {
    intervalConfig: IntervalConfig;
}> {
    constructor(name: T['name'], intervalConfig: IntervalConfig);
}
declare class PgInterval<T extends ColumnBaseConfig> extends PgColumn<PgIntervalHKT, T, {
    intervalConfig: IntervalConfig;
}> {
    readonly fields: IntervalConfig['fields'];
    readonly precision: IntervalConfig['precision'];
    getSQLType(): string;
}
interface IntervalConfig {
    fields?: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'year to month' | 'day to hour' | 'day to minute' | 'day to second' | 'hour to minute' | 'hour to second' | 'minute to second';
    precision?: Precision;
}
declare function interval<TName extends string>(name: TName, config?: IntervalConfig): PgIntervalBuilderInitial<TName>;

interface PgJsonBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgJsonBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgJsonHKT;
}
interface PgJsonHKT extends ColumnHKTBase {
    _type: PgJson<Assume<this['config'], ColumnBaseConfig>>;
}
type PgJsonBuilderInitial<TName extends string> = PgJsonBuilder<{
    name: TName;
    data: unknown;
    driverParam: unknown;
    notNull: false;
    hasDefault: false;
}>;
declare class PgJsonBuilder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgJsonBuilderHKT, T> {
}
declare class PgJson<T extends ColumnBaseConfig> extends PgColumn<PgJsonHKT, T> {
    protected $pgColumnBrand: 'PgJson';
    constructor(table: AnyPgTable<{
        name: T['tableName'];
    }>, config: PgJsonBuilder<T>['config']);
    getSQLType(): string;
    mapToDriverValue(value: T['data']): string;
    mapFromDriverValue(value: T['data'] | string): T['data'];
}
declare function json<TName extends string>(name: TName): PgJsonBuilderInitial<TName>;

interface PgJsonbBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgJsonbBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgJsonbHKT;
}
interface PgJsonbHKT extends ColumnHKTBase {
    _type: PgJsonb<Assume<this['config'], ColumnBaseConfig>>;
}
type PgJsonbBuilderInitial<TName extends string> = PgJsonbBuilder<{
    name: TName;
    data: unknown;
    driverParam: unknown;
    notNull: false;
    hasDefault: false;
}>;
declare class PgJsonbBuilder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgJsonbBuilderHKT, T> {
}
declare class PgJsonb<T extends ColumnBaseConfig> extends PgColumn<PgJsonbHKT, T> {
    protected $pgColumnBrand: 'PgJsonb';
    constructor(table: AnyPgTable<{
        name: T['tableName'];
    }>, config: PgJsonbBuilder<T>['config']);
    getSQLType(): string;
    mapToDriverValue(value: T['data']): string;
    mapFromDriverValue(value: T['data'] | string): T['data'];
}
declare function jsonb<TName extends string>(name: TName): PgJsonbBuilderInitial<TName>;

interface PgMacaddrBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgMacaddrBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgMacaddrHKT;
}
interface PgMacaddrHKT extends ColumnHKTBase {
    _type: PgMacaddr<Assume<this['config'], ColumnBaseConfig>>;
}
type PgMacaddrBuilderInitial<TName extends string> = PgMacaddrBuilder<{
    name: TName;
    data: string;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class PgMacaddrBuilder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgMacaddrBuilderHKT, T> {
}
declare class PgMacaddr<T extends ColumnBaseConfig> extends PgColumn<PgMacaddrHKT, T> {
    getSQLType(): string;
}
declare function macaddr<TName extends string>(name: TName): PgMacaddrBuilderInitial<TName>;

interface PgMacaddr8BuilderHKT extends ColumnBuilderHKTBase {
    _type: PgMacaddr8Builder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgMacaddr8HKT;
}
interface PgMacaddr8HKT extends ColumnHKTBase {
    _type: PgMacaddr8<Assume<this['config'], ColumnBaseConfig>>;
}
type PgMacaddr8BuilderInitial<TName extends string> = PgMacaddr8Builder<{
    name: TName;
    data: string;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class PgMacaddr8Builder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgMacaddr8BuilderHKT, T> {
}
declare class PgMacaddr8<T extends ColumnBaseConfig> extends PgColumn<PgMacaddr8HKT, T> {
    getSQLType(): string;
}
declare function macaddr8<TName extends string>(name: TName): PgMacaddr8BuilderInitial<TName>;

interface PgNumericBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgNumericBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgNumericHKT;
}
interface PgNumericHKT extends ColumnHKTBase {
    _type: PgNumeric<Assume<this['config'], ColumnBaseConfig>>;
}
type PgNumericBuilderInitial<TName extends string> = PgNumericBuilder<{
    name: TName;
    data: string;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class PgNumericBuilder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgNumericBuilderHKT, T, {
    precision: number | undefined;
    scale: number | undefined;
}> {
    constructor(name: string, precision?: number, scale?: number);
}
declare class PgNumeric<T extends ColumnBaseConfig> extends PgColumn<PgNumericHKT, T> {
    readonly precision: number | undefined;
    readonly scale: number | undefined;
    constructor(table: AnyPgTable<{
        name: T['tableName'];
    }>, config: PgNumericBuilder<T>['config']);
    getSQLType(): string;
}
declare function numeric<TName extends string>(name: TName, config?: {
    precision: number;
    scale?: number;
} | {
    precision?: number;
    scale: number;
} | {
    precision: number;
    scale: number;
}): PgNumericBuilderInitial<TName>;
declare const decimal: typeof numeric;

interface PgRealBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgRealBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgRealHKT;
}
interface PgRealHKT extends ColumnHKTBase {
    _type: PgReal<Assume<this['config'], ColumnBaseConfig>>;
}
type PgRealBuilderInitial<TName extends string> = PgRealBuilder<{
    name: TName;
    data: number;
    driverParam: string | number;
    notNull: false;
    hasDefault: false;
}>;
declare class PgRealBuilder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgRealBuilderHKT, T, {
    length: number | undefined;
}> {
    constructor(name: string, length?: number);
}
declare class PgReal<T extends ColumnBaseConfig> extends PgColumn<PgRealHKT, T> {
    constructor(table: AnyPgTable<{
        name: T['tableName'];
    }>, config: PgRealBuilder<T>['config']);
    getSQLType(): string;
    mapFromDriverValue: (value: string | number) => number;
}
declare function real<TName extends string>(name: TName): PgRealBuilderInitial<TName>;

type PgSerialBuilderInitial<TName extends string> = PgSerialBuilder<{
    name: TName;
    data: number;
    driverParam: number;
    notNull: true;
    hasDefault: true;
}>;
interface PgSerialBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgSerialBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgSerialHKT;
}
interface PgSerialBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgSerialBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgSerialHKT;
}
interface PgSerialHKT extends ColumnHKTBase {
    _type: PgSerial<Assume<this['config'], ColumnBaseConfig>>;
}
interface PgSerialHKT extends ColumnHKTBase {
    _type: PgSerial<Assume<this['config'], ColumnBaseConfig>>;
}
declare class PgSerialBuilder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgSerialBuilderHKT, T> {
    constructor(name: string);
}
declare class PgSerial<T extends ColumnBaseConfig> extends PgColumn<PgSerialHKT, T> {
    getSQLType(): string;
}
declare function serial<TName extends string>(name: TName): PgSerialBuilderInitial<TName>;

interface PgSmallIntBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgSmallIntBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgSmallIntHKT;
}
interface PgSmallIntHKT extends ColumnHKTBase {
    _type: PgSmallInt<Assume<this['config'], ColumnBaseConfig>>;
}
type PgSmallIntBuilderInitial<TName extends string> = PgSmallIntBuilder<{
    name: TName;
    data: number;
    driverParam: number | string;
    notNull: false;
    hasDefault: false;
}>;
declare class PgSmallIntBuilder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgSmallIntBuilderHKT, T> {
}
declare class PgSmallInt<T extends ColumnBaseConfig> extends PgColumn<PgSmallIntHKT, T> {
    getSQLType(): string;
    mapFromDriverValue: (value: number | string) => number;
}
declare function smallint<TName extends string>(name: TName): PgSmallIntBuilderInitial<TName>;

interface PgSmallSerialBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgSmallSerialBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgSmallSerialHKT;
}
interface PgSmallSerialHKT extends ColumnHKTBase {
    _type: PgSmallSerial<Assume<this['config'], ColumnBaseConfig>>;
}
type PgSmallSerialBuilderInitial<TName extends string> = PgSmallSerialBuilder<{
    name: TName;
    data: number;
    driverParam: number;
    notNull: false;
    hasDefault: false;
}>;
declare class PgSmallSerialBuilder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgSmallSerialBuilderHKT, T> {
    constructor(name: string);
}
declare class PgSmallSerial<T extends ColumnBaseConfig> extends PgColumn<PgSmallSerialHKT, T> {
    getSQLType(): string;
}
declare function smallserial<TName extends string>(name: TName): PgSmallSerialBuilderInitial<TName>;

interface PgTextBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgTextBuilder<Assume<this['config'], ColumnBuilderBaseConfig & WithEnum>>;
    _columnHKT: PgTextHKT;
}
interface PgTextHKT extends ColumnHKTBase {
    _type: PgText<Assume<this['config'], ColumnBaseConfig & WithEnum>>;
}
type PgTextBuilderInitial<TName extends string, TEnum extends [string, ...string[]]> = PgTextBuilder<{
    name: TName;
    data: TEnum[number];
    enumValues: TEnum;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class PgTextBuilder<T extends ColumnBuilderBaseConfig & WithEnum> extends PgColumnBuilder<PgTextBuilderHKT, T, WithEnum<T['enumValues']>> {
    constructor(name: T['name'], config: PgTextConfig<T['enumValues']>);
}
declare class PgText<T extends ColumnBaseConfig & WithEnum> extends PgColumn<PgTextHKT, T, WithEnum<T['enumValues']>> implements WithEnum<T['enumValues']> {
    readonly enumValues: T["enumValues"];
    getSQLType(): string;
}
interface PgTextConfig<TEnum extends readonly string[] | string[]> {
    enum?: TEnum;
}
declare function text<TName extends string, U extends string, T extends Readonly<[U, ...U[]]>>(name: TName, config?: PgTextConfig<T | Writable<T>>): PgTextBuilderInitial<TName, Writable<T>>;

interface PgTimeBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgTimeBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgTimeHKT;
}
interface PgTimeHKT extends ColumnHKTBase {
    _type: PgTime<Assume<this['config'], ColumnBaseConfig>>;
}
type PgTimeBuilderInitial<TName extends string> = PgTimeBuilder<{
    name: TName;
    data: string;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class PgTimeBuilder<T extends ColumnBuilderBaseConfig> extends PgDateColumnBaseBuilder<PgTimeBuilderHKT, T, {
    withTimezone: boolean;
    precision: number | undefined;
}> {
    readonly withTimezone: boolean;
    readonly precision: number | undefined;
    constructor(name: T['name'], withTimezone: boolean, precision: number | undefined);
}
declare class PgTime<T extends ColumnBaseConfig> extends PgColumn<PgTimeHKT, T> {
    readonly withTimezone: boolean;
    readonly precision: number | undefined;
    constructor(table: AnyPgTable<{
        name: T['tableName'];
    }>, config: PgTimeBuilder<T>['config']);
    getSQLType(): string;
}
interface TimeConfig {
    precision?: Precision;
    withTimezone?: boolean;
}
declare function time<TName extends string>(name: TName, config?: TimeConfig): PgTimeBuilderInitial<TName>;

interface PgUUIDBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgUUIDBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgUUIDHKT;
}
interface PgUUIDHKT extends ColumnHKTBase {
    _type: PgUUID<Assume<this['config'], ColumnBaseConfig>>;
}
type PgUUIDBuilderInitial<TName extends string> = PgUUIDBuilder<{
    name: TName;
    data: string;
    driverParam: string;
    notNull: false;
    hasDefault: false;
}>;
declare class PgUUIDBuilder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgUUIDBuilderHKT, T> {
    /**
     * Adds `default gen_random_uuid()` to the column definition.
     */
    defaultRandom(): ReturnType<this['default']>;
}
declare class PgUUID<T extends ColumnBaseConfig> extends PgColumn<PgUUIDHKT, T> {
    getSQLType(): string;
}
declare function uuid<TName extends string>(name: TName): PgUUIDBuilderInitial<TName>;

interface PgVarcharBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgVarcharBuilder<Assume<this['config'], ColumnBuilderBaseConfig & WithEnum>>;
    _columnHKT: PgVarcharHKT;
}
interface PgVarcharHKT extends ColumnHKTBase {
    _type: PgVarchar<Assume<this['config'], ColumnBaseConfig & WithEnum>>;
}
type PgVarcharBuilderInitial<TName extends string, TEnum extends [string, ...string[]]> = PgVarcharBuilder<{
    name: TName;
    data: TEnum[number];
    driverParam: string;
    enumValues: TEnum;
    notNull: false;
    hasDefault: false;
}>;
declare class PgVarcharBuilder<T extends ColumnBuilderBaseConfig & WithEnum> extends PgColumnBuilder<PgVarcharBuilderHKT, T, {
    length: number | undefined;
} & WithEnum<T['enumValues']>> {
    constructor(name: string, config: PgVarcharConfig<T['enumValues']>);
}
declare class PgVarchar<T extends ColumnBaseConfig & WithEnum> extends PgColumn<PgVarcharHKT, T, {
    length: number | undefined;
} & WithEnum<T['enumValues']>> implements WithEnum<T['enumValues']> {
    readonly length: number | undefined;
    readonly enumValues: T["enumValues"];
    getSQLType(): string;
}
interface PgVarcharConfig<TEnum extends readonly string[] | string[]> {
    length?: number;
    enum?: TEnum;
}
declare function varchar<TName extends string, U extends string, T extends Readonly<[U, ...U[]]>>(name: TName, config?: PgVarcharConfig<T | Writable<T>>): PgVarcharBuilderInitial<TName, Writable<T>>;

declare function alias<TTable extends AnyPgTable, TAlias extends string>(table: TTable, alias: TAlias): BuildAliasTable<TTable, TAlias>;

declare class PgSchema<TName extends string = string> {
    readonly schemaName: TName;
    constructor(schemaName: TName);
    table: PgTableFn<TName>;
    view: typeof pgView;
    materializedView: typeof pgMaterializedView;
}
declare function isPgSchema(obj: unknown): obj is PgSchema;
declare function pgSchema<T extends string>(name: T): PgSchema<T>;

declare function getTableConfig<TTable extends AnyPgTable>(table: TTable): {
    columns: AnyPgColumn[];
    indexes: Index[];
    foreignKeys: ForeignKey[];
    checks: Check[];
    primaryKeys: PrimaryKey[];
    name: string;
    schema: string | undefined;
};
declare function getViewConfig<TName extends string = string, TExisting extends boolean = boolean>(view: PgView<TName, TExisting>): {
    with?: ViewWithConfig | undefined;
    name: TName;
    originalName: TName;
    schema: string | undefined;
    selectedFields: SelectedFields<AnyColumn, Table<TableConfig<AnyColumn>>>;
    isExisting: TExisting;
    query: TExisting extends true ? undefined : SQL<unknown>;
    isAlias: boolean;
};
declare function getMaterializedViewConfig<TName extends string = string, TExisting extends boolean = boolean>(view: PgMaterializedView<TName, TExisting>): {
    with?: PgMaterializedViewWithConfig | undefined;
    using?: string | undefined;
    tablespace?: string | undefined;
    withNoData?: boolean | undefined;
    name: TName;
    originalName: TName;
    schema: string | undefined;
    selectedFields: SelectedFields<AnyColumn, Table<TableConfig<AnyColumn>>>;
    isExisting: TExisting;
    query: TExisting extends true ? undefined : SQL<unknown>;
    isAlias: boolean;
};
declare function parsePgNestedArray(arrayString: string, startFrom?: number): [any[], number];
declare function parsePgArray(arrayString: string): any[];
declare function makePgArray(array: any[]): string;
type ColumnsWithTable<TTableName extends string, TForeignTableName extends string, TColumns extends AnyPgColumn<{
    tableName: TTableName;
}>[]> = {
    [Key in keyof TColumns]: AnyPgColumn<{
        tableName: TForeignTableName;
    }>;
};

export { AnyPgColumn, AnyPgTable, BuildAliasTable, Check, ColumnsWithTable, ConvertCustomConfig, CustomTypeParams, CustomTypeValues, ForeignKey, Index, IntervalConfig, PgBigInt53, PgBigInt53Builder, PgBigInt53BuilderHKT, PgBigInt53BuilderInitial, PgBigInt53HKT, PgBigInt64, PgBigInt64Builder, PgBigInt64BuilderHKT, PgBigInt64BuilderInitial, PgBigInt64HKT, PgBigSerial53, PgBigSerial53Builder, PgBigSerial53BuilderHKT, PgBigSerial53BuilderInitial, PgBigSerial53HKT, PgBigSerial64, PgBigSerial64Builder, PgBigSerial64BuilderHKT, PgBigSerial64BuilderInitial, PgBigSerial64HKT, PgBoolean, PgBooleanBuilder, PgBooleanBuilderHKT, PgBooleanBuilderInitial, PgBooleanHKT, PgChar, PgCharBuilder, PgCharBuilderHKT, PgCharBuilderInitial, PgCharConfig, PgCharHKT, PgCidr, PgCidrBuilder, PgCidrBuilderHKT, PgCidrBuilderInitial, PgCidrHKT, PgColumn, PgColumnBuilder, PgCustomColumn, PgCustomColumnBuilder, PgCustomColumnBuilderHKT, PgCustomColumnHKT, PgCustomColumnInnerConfig, PgDate, PgDateBuilder, PgDateBuilderHKT, PgDateBuilderInitial, PgDateHKT, PgDateString, PgDateStringBuilder, PgDateStringBuilderHKT, PgDateStringBuilderInitial, PgDateStringHKT, PgDoublePrecision, PgDoublePrecisionBuilder, PgDoublePrecisionBuilderHKT, PgDoublePrecisionBuilderInitial, PgDoublePrecisionHKT, PgEnum, PgEnumColumn, PgEnumColumnBuilder, PgEnumColumnBuilderHKT, PgEnumColumnBuilderInitial, PgEnumColumnHKT, PgInet, PgInetBuilder, PgInetBuilderHKT, PgInetBuilderInitial, PgInetHKT, PgInteger, PgIntegerBuilder, PgIntegerBuilderHKT, PgIntegerHKT, PgInterval, PgIntervalBuilder, PgIntervalBuilderHKT, PgIntervalBuilderInitial, PgIntervalHKT, PgJson, PgJsonBuilder, PgJsonBuilderHKT, PgJsonBuilderInitial, PgJsonHKT, PgJsonb, PgJsonbBuilder, PgJsonbBuilderHKT, PgJsonbBuilderInitial, PgJsonbHKT, PgMacaddr, PgMacaddr8, PgMacaddr8Builder, PgMacaddr8BuilderHKT, PgMacaddr8BuilderInitial, PgMacaddr8HKT, PgMacaddrBuilder, PgMacaddrBuilderHKT, PgMacaddrBuilderInitial, PgMacaddrHKT, PgMaterializedView, PgMaterializedViewWithConfig, PgNumeric, PgNumericBuilder, PgNumericBuilderHKT, PgNumericBuilderInitial, PgNumericHKT, PgReal, PgRealBuilder, PgRealBuilderHKT, PgRealBuilderInitial, PgRealHKT, PgSchema, PgSerial, PgSerialBuilder, PgSerialBuilderHKT, PgSerialBuilderInitial, PgSerialHKT, PgSmallInt, PgSmallIntBuilder, PgSmallIntBuilderHKT, PgSmallIntBuilderInitial, PgSmallIntHKT, PgSmallSerial, PgSmallSerialBuilder, PgSmallSerialBuilderHKT, PgSmallSerialBuilderInitial, PgSmallSerialHKT, PgTableFn, PgText, PgTextBuilder, PgTextBuilderHKT, PgTextConfig, PgTextHKT, PgTime, PgTimeBuilder, PgTimeBuilderHKT, PgTimeBuilderInitial, PgTimeHKT, PgTimestamp, PgTimestampBuilder, PgTimestampBuilderHKT, PgTimestampBuilderInitial, PgTimestampConfig, PgTimestampHKT, PgTimestampString, PgTimestampStringBuilder, PgTimestampStringBuilderHKT, PgTimestampStringBuilderInitial, PgTimestampStringHKT, PgUUID, PgUUIDBuilder, PgUUIDBuilderHKT, PgUUIDBuilderInitial, PgUUIDHKT, PgVarchar, PgVarcharBuilder, PgVarcharBuilderHKT, PgVarcharBuilderInitial, PgVarcharConfig, PgVarcharHKT, PgView, Precision, PrimaryKey, TimeConfig, ViewWithConfig, alias, bigint, bigserial, boolean, char, cidr, customType, date, decimal, doublePrecision, getMaterializedViewConfig, getTableConfig, getViewConfig, inet, integer, interval, isPgEnum, isPgSchema, json, jsonb, macaddr, macaddr8, makePgArray, numeric, parsePgArray, parsePgNestedArray, pgEnum, pgMaterializedView, pgSchema, pgView, real, serial, smallint, smallserial, text, time, timestamp, uuid, varchar };