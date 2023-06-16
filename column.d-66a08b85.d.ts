interface Logger {
    logQuery(query: string, params: unknown[]): void;
}
interface LogWriter {
    write(message: string): void;
}
declare class ConsoleLogWriter implements LogWriter {
    write(message: string): void;
}
declare class DefaultLogger implements Logger {
    readonly writer: LogWriter;
    constructor(config?: {
        writer: LogWriter;
    });
    logQuery(query: string, params: unknown[]): void;
}
declare class NoopLogger implements Logger {
    logQuery(): void;
}

type UpdateSet = Record<string, SQL | Param | null | undefined>;
type OneOrMany<T> = T | T[];
type Update<T, TUpdate> = Simplify<Omit<T, keyof TUpdate> & TUpdate>;
/**
@see Simplify
*/
interface SimplifyOptions {
    /**
    Do the simplification recursively.

    @default false
    */
    deep?: boolean;
}
type Flatten<AnyType, Options extends SimplifyOptions = {}> = Options['deep'] extends true ? {
    [KeyType in keyof AnyType]: Simplify<AnyType[KeyType], Options>;
} : {
    [KeyType in keyof AnyType]: AnyType[KeyType];
};
/**
Useful to flatten the type output to improve type hints shown in editors. And also to transform an interface into a type to aide with assignability.

@example
```
import type {Simplify} from 'type-fest';

type PositionProps = {
    top: number;
    left: number;
};

type SizeProps = {
    width: number;
    height: number;
};

// In your editor, hovering over `Props` will show a flattened object with all the properties.
type Props = Simplify<PositionProps & SizeProps>;
```

Sometimes it is desired to pass a value as a function argument that has a different type. At first inspection it may seem assignable, and then you discover it is not because the `value`'s type definition was defined as an interface. In the following example, `fn` requires an argument of type `Record<string, unknown>`. If the value is defined as a literal, then it is assignable. And if the `value` is defined as type using the `Simplify` utility the value is assignable.  But if the `value` is defined as an interface, it is not assignable because the interface is not sealed and elsewhere a non-string property could be added to the interface.

If the type definition must be an interface (perhaps it was defined in a third-party npm package), then the `value` can be defined as `const value: Simplify<SomeInterface> = ...`. Then `value` will be assignable to the `fn` argument.  Or the `value` can be cast as `Simplify<SomeInterface>` if you can't re-declare the `value`.

@example
```
import type {Simplify} from 'type-fest';

interface SomeInterface {
    foo: number;
    bar?: string;
    baz: number | undefined;
}

type SomeType = {
    foo: number;
    bar?: string;
    baz: number | undefined;
};

const literal = {foo: 123, bar: 'hello', baz: 456};
const someType: SomeType = literal;
const someInterface: SomeInterface = literal;

function fn(object: Record<string, unknown>): void {}

fn(literal); // Good: literal object type is sealed
fn(someType); // Good: type is sealed
fn(someInterface); // Error: Index signature for type 'string' is missing in type 'someInterface'. Because `interface` can be re-opened
fn(someInterface as Simplify<SomeInterface>); // Good: transform an `interface` into a `type`
```

@link https://github.com/microsoft/TypeScript/issues/15300

@category Object
*/
type Simplify<AnyType, Options extends SimplifyOptions = {}> = Flatten<AnyType> extends AnyType ? Flatten<AnyType, Options> : AnyType;
type SimplifyShallow<T> = {
    [K in keyof T]: T[K];
} & {};
type Assume<T, U> = T extends U ? T : U;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;
interface DrizzleTypeError<T> {
    $brand: 'DrizzleTypeError';
    message: T;
}
type ValueOrArray<T> = T | T[];
type Or<T1, T2> = T1 extends true ? true : T2 extends true ? true : false;
type IfThenElse<If, Then, Else> = If extends true ? Then : Else;
type PromiseOf<T> = T extends Promise<infer U> ? U : T;
type Writable<T> = {
    -readonly [P in keyof T]: T[P];
};
declare function getTableColumns<T extends AnyTable>(table: T): T['_']['columns'];
type ColumnsWithTable<TTableName extends string, TForeignTableName extends string, TColumns extends AnyColumn<{
    tableName: TTableName;
}>[]> = {
    [Key in keyof TColumns]: AnyColumn<{
        tableName: TForeignTableName;
    }>;
};
interface DrizzleConfig<TSchema extends Record<string, unknown> = Record<string, never>> {
    logger?: boolean | Logger;
    schema?: TSchema;
}
type KnownKeysOnly<T, U> = {
    [K in keyof T]: K extends keyof U ? T[K] : never;
};
declare function iife<T extends unknown[], U>(fn: (...args: T) => U, ...args: T): U;

interface TableConfig<TColumn extends AnyColumn = AnyColumn> {
    name: string;
    schema: string | undefined;
    columns: Record<string, TColumn>;
}
type UpdateTableConfig<T extends TableConfig, TUpdate extends Partial<TableConfig>> = Required<Update<T, TUpdate>>;
declare const IsDrizzleTable: unique symbol;
declare class Table<T extends TableConfig = TableConfig> {
    readonly _: {
        readonly brand: 'Table';
        readonly config: T;
        readonly name: T['name'];
        readonly schema: T['schema'];
        readonly columns: T['columns'];
        readonly model: {
            select: InferModel<Table<T>>;
            insert: InferModel<Table<T>, 'insert'>;
        };
    };
    [IsDrizzleTable]: boolean;
    constructor(name: string, schema: string | undefined, baseName: string);
}
declare function isTable(table: unknown): table is Table;
type AnyTable<TPartial extends Partial<TableConfig> = {}> = Table<UpdateTableConfig<TableConfig, TPartial>>;
interface AnyTableHKT {
    readonly brand: 'TableHKT';
    config: unknown;
    type: unknown;
}
interface AnyTableHKTBase extends AnyTableHKT {
    type: AnyTable<Assume<this['config'], Partial<TableConfig>>>;
}
type AnyTableKind<THKT extends AnyTableHKT, TConfig extends Partial<TableConfig>> = (THKT & {
    config: TConfig;
})['type'];
declare function getTableName<T extends Table>(table: T): T['_']['name'];
type MapColumnName<TName extends string, TColumn extends AnyColumn, TDBColumNames extends boolean> = TDBColumNames extends true ? TColumn['_']['name'] : TName;
type InferModelFromColumns<TColumns extends Record<string, AnyColumn>, TInferMode extends 'select' | 'insert' = 'select', TConfig extends {
    dbColumnNames: boolean;
} = {
    dbColumnNames: false;
}> = TInferMode extends 'insert' ? SimplifyShallow<{
    [Key in keyof TColumns & string as RequiredKeyOnly<MapColumnName<Key, TColumns[Key], TConfig['dbColumnNames']>, TColumns[Key]>]: GetColumnData<TColumns[Key], 'query'>;
} & {
    [Key in keyof TColumns & string as OptionalKeyOnly<MapColumnName<Key, TColumns[Key], TConfig['dbColumnNames']>, TColumns[Key]>]?: GetColumnData<TColumns[Key], 'query'>;
}> : {
    [Key in keyof TColumns & string as MapColumnName<Key, TColumns[Key], TConfig['dbColumnNames']>]: GetColumnData<TColumns[Key], 'query'>;
};
type InferModel<TTable extends AnyTable, TInferMode extends 'select' | 'insert' = 'select', TConfig extends {
    dbColumnNames: boolean;
} = {
    dbColumnNames: false;
}> = InferModelFromColumns<TTable['_']['columns'], TInferMode, TConfig>;

type RequiredKeyOnly<TKey extends string, T extends AnyColumn> = T extends AnyColumn<{
    notNull: true;
    hasDefault: false;
}> ? TKey : never;
type OptionalKeyOnly<TKey extends string, T extends AnyColumn> = TKey extends RequiredKeyOnly<TKey, T> ? never : TKey;
type SelectedFieldsFlat<TColumn extends AnyColumn> = Record<string, TColumn | SQL | SQL.Aliased>;
type SelectedFieldsFlatFull<TColumn extends AnyColumn> = Record<string, TColumn | SQL | SQL.Aliased>;
type SelectedFields<TColumn extends AnyColumn, TTable extends Table> = Record<string, SelectedFieldsFlat<TColumn>[string] | TTable | SelectedFieldsFlat<TColumn>>;
type SelectedFieldsOrdered<TColumn extends AnyColumn> = {
    path: string[];
    field: TColumn | SQL | SQL.Aliased;
}[];

declare const ViewBaseConfig: unique symbol;
type ColumnsSelection = Record<string, unknown>;
declare abstract class View<TName extends string = string, TExisting extends boolean = boolean, TSelection extends ColumnsSelection = ColumnsSelection> {
    _: {
        brand: 'View';
        viewBrand: string;
        name: TName;
        existing: TExisting;
        selectedFields: TSelection;
    };
    constructor({ name, schema, selectedFields, query }: {
        name: TName;
        schema: string | undefined;
        selectedFields: SelectedFields<AnyColumn, Table>;
        query: SQL | undefined;
    });
}

declare const SubqueryConfig: unique symbol;
declare class Subquery<TAlias extends string = string, TSelectedFields = unknown> {
    _: {
        brand: 'Subquery';
        selectedFields: TSelectedFields;
        alias: TAlias;
    };
    constructor(sql: SQL, selection: Record<string, unknown>, alias: string, isWith?: boolean);
}
declare class WithSubquery<TAlias extends string = string, TSelection = unknown> extends Subquery<TAlias, TSelection> {
}
declare class SelectionProxyHandler<T extends Subquery | Record<string, unknown> | View> implements ProxyHandler<Subquery | Record<string, unknown> | View> {
    private config;
    constructor(config: SelectionProxyHandler<T>['config']);
    get(subquery: T, prop: string | symbol): any;
}

/**
 * This class is used to indicate a primitive param value that is used in `sql` tag.
 * It is only used on type level and is never instantiated at runtime.
 * If you see a value of this type in the code, its runtime value is actually the primitive param value.
 */
declare class FakePrimitiveParam {
}
type Chunk = string | Table | View | AnyColumn | Name | Param | Placeholder | SQL;
interface BuildQueryConfig {
    escapeName(name: string): string;
    escapeParam(num: number, value: unknown): string;
    escapeString(str: string): string;
    prepareTyping?: (encoder: DriverValueEncoder<unknown, unknown>) => QueryTypingsValue;
    paramStartIndex?: {
        value: number;
    };
    inlineParams?: boolean;
}
type QueryTypingsValue = 'json' | 'decimal' | 'time' | 'timestamp' | 'uuid' | 'date' | 'none';
interface Query {
    sql: string;
    params: unknown[];
    typings?: QueryTypingsValue[];
}
interface SQLWrapper {
    getSQL(): SQL;
}
declare function isSQLWrapper(value: unknown): value is SQLWrapper;
declare class StringChunk {
    readonly value: string[];
    constructor(value: string | string[]);
}
type GetDecoderResult<T> = T extends DriverValueDecoder<infer TData, any> | DriverValueDecoder<infer TData, any>['mapFromDriverValue'] ? TData : never;
/**
 * Any DB name (table, column, index etc.)
 */
declare class Name {
    readonly value: string;
    protected brand: 'Name';
    constructor(value: string);
}
/**
 * Any DB name (table, column, index etc.)
 * @deprecated Use `sql.identifier` instead.
 */
declare function name(value: string): Name;
interface DriverValueDecoder<TData, TDriverParam> {
    mapFromDriverValue(value: TDriverParam): TData;
}
interface DriverValueEncoder<TData, TDriverParam> {
    mapToDriverValue(value: TData): TDriverParam | SQL;
}
declare function isDriverValueEncoder(value: unknown): value is DriverValueEncoder<any, any>;
declare const noopDecoder: DriverValueDecoder<any, any>;
declare const noopEncoder: DriverValueEncoder<any, any>;
interface DriverValueMapper<TData, TDriverParam> extends DriverValueDecoder<TData, TDriverParam>, DriverValueEncoder<TData, TDriverParam> {
}
declare const noopMapper: DriverValueMapper<any, any>;
/** Parameter value that is optionally bound to an encoder (for example, a column). */
declare class Param<TDataType = unknown, TDriverParamType = TDataType> {
    readonly value: TDataType;
    readonly encoder: DriverValueEncoder<TDataType, TDriverParamType>;
    protected brand: 'BoundParamValue';
    /**
     * @param value - Parameter value
     * @param encoder - Encoder to convert the value to a driver parameter
     */
    constructor(value: TDataType, encoder?: DriverValueEncoder<TDataType, TDriverParamType>);
}
declare function param<TData, TDriver>(value: TData, encoder?: DriverValueEncoder<TData, TDriver>): Param<TData, TDriver>;
type SQLChunk = StringChunk | SQLChunk[] | SQLWrapper | SQL | Table | View | Subquery | AnyColumn | Param | Name | undefined | FakePrimitiveParam | Placeholder;
declare function sql<T>(strings: TemplateStringsArray, ...params: any[]): SQL<T>;
declare namespace sql {
    function empty(): SQL;
    function fromList(list: SQLChunk[]): SQL;
    /**
     * Convenience function to create an SQL query from a raw string.
     * @param str The raw SQL query string.
     */
    function raw(str: string): SQL;
    /**
     * Convenience function to join a list of SQL chunks with a separator.
     */
    function join(chunks: SQLChunk[], separator: SQLChunk): SQL;
    /**
     *  Any DB identifier (table name, column name, index name etc.)
     */
    function identifier(value: string): Name;
}
declare class SQL<T = unknown> implements SQLWrapper {
    readonly queryChunks: SQLChunk[];
    _: {
        brand: 'SQL';
        type: T;
    };
    private shouldInlineParams;
    constructor(queryChunks: SQLChunk[]);
    append(query: SQL): this;
    toQuery(config: BuildQueryConfig): Query;
    buildQueryFromSourceParams(chunks: SQLChunk[], _config: BuildQueryConfig): Query;
    private mapInlineParam;
    getSQL(): SQL;
    as(alias: string): SQL.Aliased<T>;
    /**
     * @deprecated
     * Use ``sql<DataType>`query`.as(alias)`` instead.
     */
    as<TData>(): SQL<TData>;
    /**
     * @deprecated
     * Use ``sql<DataType>`query`.as(alias)`` instead.
     */
    as<TData>(alias: string): SQL.Aliased<TData>;
    mapWith<TDecoder extends DriverValueDecoder<any, any> | DriverValueDecoder<any, any>['mapFromDriverValue']>(decoder: TDecoder): SQL<GetDecoderResult<TDecoder>>;
    inlineParams(): this;
}
declare namespace SQL {
    class Aliased<T = unknown> implements SQLWrapper {
        readonly sql: SQL;
        readonly fieldAlias: string;
        _: {
            brand: 'SQL.Aliased';
            type: T;
        };
        constructor(sql: SQL, fieldAlias: string);
        getSQL(): SQL;
    }
}
declare class Placeholder<TName extends string = string, TValue = any> {
    readonly name: TName;
    protected: TValue;
    constructor(name: TName);
}
declare function placeholder<TName extends string>(name: TName): Placeholder<TName>;
declare function fillPlaceholders(params: unknown[], values: Record<string, unknown>): unknown[];

interface ColumnBuilderBaseConfig {
    name: string;
    data: unknown;
    driverParam: unknown;
    notNull: boolean;
    hasDefault: boolean;
}
type ColumnBuilderConfig<TInitial extends Partial<ColumnBuilderBaseConfig> = {}, TDefaults extends Partial<ColumnBuilderBaseConfig> = {}> = Simplify<Required<Update<ColumnBuilderBaseConfig & {
    notNull: false;
    hasDefault: false;
}, {
    [K in keyof TInitial]: TInitial[K];
} & {
    [K in Exclude<keyof TDefaults, keyof TInitial> & string]: TDefaults[K];
}>>>;
type MakeColumnConfig<T extends ColumnBuilderBaseConfig, TTableName extends string> = Simplify<Pick<T, keyof ColumnBuilderBaseConfig> & {
    tableName: TTableName;
}>;
interface ColumnBuilderHKTBase {
    config: unknown;
    _type: unknown;
    _columnHKT: unknown;
}
type ColumnBuilderKind<THKT extends ColumnBuilderHKTBase, TConfig extends ColumnBuilderBaseConfig> = (THKT & {
    config: TConfig;
})['_type'];
interface ColumnBuilderHKT extends ColumnBuilderHKTBase {
    _type: ColumnBuilder<ColumnBuilderHKT, Assume<this['config'], ColumnBuilderBaseConfig>>;
}
interface ColumnBuilderRuntimeConfig<TData> {
    name: string;
    notNull: boolean;
    default: TData | SQL | undefined;
    hasDefault: boolean;
    primaryKey: boolean;
}
declare abstract class ColumnBuilder<THKT extends ColumnBuilderHKTBase, T extends ColumnBuilderBaseConfig, TRuntimeConfig extends object = {}, TTypeConfig extends object = {}> {
    _: {
        brand: 'ColumnBuilder';
        config: T;
        hkt: THKT;
        columnHKT: THKT['_columnHKT'];
        name: T['name'];
        data: T['data'];
        driverParam: T['driverParam'];
        notNull: T['notNull'];
        hasDefault: T['hasDefault'];
    } & TTypeConfig;
    protected config: ColumnBuilderRuntimeConfig<T['data']> & TRuntimeConfig;
    constructor(name: T['name']);
    $type<TType extends T['data']>(): ColumnBuilderKind<THKT, Update<T, {
        data: TType;
    }>>;
    notNull(): ColumnBuilderKind<THKT, UpdateCBConfig<T, {
        notNull: true;
    }>>;
    default(value: T['data'] | SQL): ColumnBuilderKind<THKT, UpdateCBConfig<T, {
        hasDefault: true;
    }>>;
    primaryKey(): ColumnBuilderKind<THKT, UpdateCBConfig<T, {
        notNull: true;
    }>>;
}
type AnyColumnBuilder = ColumnBuilder<ColumnBuilderHKT, ColumnBuilderBaseConfig>;
type UpdateCBConfig<T extends ColumnBuilderBaseConfig, TUpdate extends Partial<ColumnBuilderBaseConfig>> = Update<T, TUpdate>;
type BuildColumn<TTableName extends string, TBuilder extends AnyColumnBuilder> = Assume<ColumnKind<Assume<TBuilder['_']['columnHKT'], ColumnHKTBase>, Simplify<{
    tableName: TTableName;
} & TBuilder['_']['config']>>, AnyColumn>;
type BuildColumns<TTableName extends string, TConfigMap extends Record<string, AnyColumnBuilder>> = Simplify<{
    [Key in keyof TConfigMap]: BuildColumn<TTableName, TConfigMap[Key]>;
}>;
type ChangeColumnTableName<TColumn extends AnyColumn, TAlias extends string> = ColumnKind<TColumn['_']['hkt'], Simplify<Update<TColumn['_']['config'], {
    tableName: TAlias;
}>>>;

interface ColumnBaseConfig extends ColumnBuilderBaseConfig {
    tableName: string;
}
type ColumnConfig<TPartial extends Partial<ColumnBaseConfig> = {}> = Update<ColumnBuilderConfig & {
    tableName: string;
}, TPartial>;
interface ColumnHKTBase {
    config: unknown;
    _type: unknown;
}
type ColumnKind<T extends ColumnHKTBase, TConfig extends ColumnBaseConfig> = (T & {
    config: TConfig;
})['_type'];
interface ColumnHKT extends ColumnHKTBase {
    _type: Column<ColumnHKT, Assume<this['config'], ColumnBaseConfig>>;
}
declare abstract class Column<THKT extends ColumnHKTBase, T extends ColumnBaseConfig, TRuntimeConfig extends object = {}, TTypeConfig extends object = {}> implements DriverValueMapper<T['data'], T['driverParam']> {
    readonly table: Table;
    _: {
        hkt: THKT;
        brand: 'Column';
        config: T;
        tableName: T['tableName'];
        name: T['name'];
        data: T['data'];
        driverParam: T['driverParam'];
        notNull: T['notNull'];
        hasDefault: T['hasDefault'];
    } & TTypeConfig;
    readonly name: string;
    readonly primary: boolean;
    readonly notNull: boolean;
    readonly default: T['data'] | SQL | undefined;
    readonly hasDefault: boolean;
    protected config: ColumnBuilderRuntimeConfig<T['data']> & TRuntimeConfig;
    constructor(table: Table, config: ColumnBuilderRuntimeConfig<T['data']> & TRuntimeConfig);
    abstract getSQLType(): string;
    mapFromDriverValue(value: T['driverParam']): T['data'];
    mapToDriverValue(value: T['data']): T['driverParam'];
}
type UpdateColConfig<T extends ColumnBaseConfig, TUpdate extends Partial<ColumnBaseConfig>> = Update<T, TUpdate>;
type AnyColumn<TPartial extends Partial<ColumnBaseConfig> = {}> = Column<ColumnHKT, Required<Update<ColumnBaseConfig, TPartial>>>;
interface AnyColumnHKT {
    config: unknown;
    type: unknown;
}
interface AnyColumnHKTBase extends AnyColumnHKT {
    type: AnyColumn<Assume<this['config'], Partial<ColumnBaseConfig>>>;
}
type AnyColumnKind<THKT extends AnyColumnHKT, TConfig extends Partial<ColumnBaseConfig>> = (THKT & {
    config: TConfig;
})['type'];
type GetColumnData<TColumn extends AnyColumn, TInferMode extends 'query' | 'raw' = 'query'> = TInferMode extends 'raw' ? TColumn['_']['data'] : TColumn['_']['notNull'] extends true ? TColumn['_']['data'] : TColumn['_']['data'] | null;
type InferColumnsDataTypes<TColumns extends Record<string, AnyColumn>> = {
    [Key in keyof TColumns]: GetColumnData<TColumns[Key], 'query'>;
};
interface WithEnum<T extends [string, ...string[]] = [string, ...string[]]> {
    enumValues: T;
}

export { GetDecoderResult as $, AnyColumn as A, BuildColumn as B, ColumnBaseConfig as C, DrizzleConfig as D, SelectedFieldsFlatFull as E, SelectedFields as F, GetColumnData as G, SelectedFieldsOrdered as H, InferModel as I, FakePrimitiveParam as J, Chunk as K, Logger as L, MapColumnName as M, NoopLogger as N, OptionalKeyOnly as O, BuildQueryConfig as P, Query as Q, RequiredKeyOnly as R, Simplify as S, Table as T, UpdateColConfig as U, View as V, WithEnum as W, QueryTypingsValue as X, SQLWrapper as Y, isSQLWrapper as Z, StringChunk as _, SQL as a, Name as a0, name as a1, DriverValueDecoder as a2, DriverValueEncoder as a3, isDriverValueEncoder as a4, noopDecoder as a5, noopEncoder as a6, DriverValueMapper as a7, noopMapper as a8, Param as a9, DrizzleTypeError as aA, ValueOrArray as aB, Or as aC, IfThenElse as aD, PromiseOf as aE, Writable as aF, getTableColumns as aG, ColumnsWithTable as aH, KnownKeysOnly as aI, iife as aJ, ViewBaseConfig as aK, ColumnsSelection as aL, param as aa, SQLChunk as ab, sql as ac, Placeholder as ad, placeholder as ae, fillPlaceholders as af, SubqueryConfig as ag, Subquery as ah, WithSubquery as ai, SelectionProxyHandler as aj, TableConfig as ak, UpdateTableConfig as al, isTable as am, AnyTable as an, AnyTableHKT as ao, AnyTableHKTBase as ap, AnyTableKind as aq, getTableName as ar, InferModelFromColumns as as, UpdateSet as at, OneOrMany as au, Update as av, SimplifyOptions as aw, SimplifyShallow as ax, Assume as ay, Equal as az, ColumnConfig as b, ColumnHKTBase as c, ColumnKind as d, ColumnHKT as e, Column as f, AnyColumnHKT as g, AnyColumnHKTBase as h, AnyColumnKind as i, InferColumnsDataTypes as j, ColumnBuilderBaseConfig as k, ColumnBuilderConfig as l, MakeColumnConfig as m, ColumnBuilderHKTBase as n, ColumnBuilderKind as o, ColumnBuilderHKT as p, ColumnBuilderRuntimeConfig as q, ColumnBuilder as r, AnyColumnBuilder as s, UpdateCBConfig as t, BuildColumns as u, ChangeColumnTableName as v, LogWriter as w, ConsoleLogWriter as x, DefaultLogger as y, SelectedFieldsFlat as z };