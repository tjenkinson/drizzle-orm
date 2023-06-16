import { A as AnyColumn, a as SQL, ab as SQLChunk, ad as Placeholder, Y as SQLWrapper, G as GetColumnData, T as Table, an as AnyTable, ac as sql, ax as SimplifyShallow, aB as ValueOrArray, ay as Assume, az as Equal, as as InferModelFromColumns, aH as ColumnsWithTable, ak as TableConfig } from './column.d-66a08b85.js';

declare function bindIfParam(value: unknown, column: AnyColumn | SQL.Aliased): SQLChunk;
/**
 * Test that two values are equal.
 *
 * Remember that the SQL standard dictates that
 * two NULL values are not equal, so if you want to test
 * whether a value is null, you may want to use
 * `isNull` instead.
 *
 * ## Examples
 *
 * ```ts
 * // Select cars made by Ford
 * db.select().from(cars)
 *   .where(eq(cars.make, 'Ford'))
 * ```
 *
 * @see isNull for a way to test equality to NULL.
 */
declare function eq<T>(left: SQL.Aliased<T>, right: T | Placeholder | SQLWrapper | AnyColumn): SQL;
declare function eq<TColumn extends AnyColumn>(left: TColumn, right: GetColumnData<TColumn, 'raw'> | Placeholder | SQLWrapper | AnyColumn): SQL;
/**
 * Test that two values are not equal.
 *
 * Remember that the SQL standard dictates that
 * two NULL values are not equal, so if you want to test
 * whether a value is not null, you may want to use
 * `isNotNull` instead.
 *
 * ## Examples
 *
 * ```ts
 * // Select cars not made by Ford
 * db.select().from(cars)
 *   .where(ne(cars.make, 'Ford'))
 * ```
 *
 * @see isNotNull for a way to test whether a value is not null.
 */
declare function ne<T>(left: SQL.Aliased<T>, right: T | Placeholder | SQLWrapper | AnyColumn): SQL;
declare function ne<TColumn extends AnyColumn>(left: TColumn, right: GetColumnData<TColumn, 'raw'> | Placeholder | SQLWrapper | AnyColumn): SQL;
/**
 * Combine a list of conditions with the `and` operator. Conditions
 * that are equal `undefined` are automatically ignored.
 *
 * ## Examples
 *
 * ```ts
 * db.select().from(cars)
 *   .where(
 *     and(
 *       eq(cars.make, 'Volvo'),
 *       eq(cars.year, 1950),
 *     )
 *   )
 * ```
 */
declare function and(...conditions: (SQL | undefined)[]): SQL | undefined;
/**
 * Combine a list of conditions with the `or` operator. Conditions
 * that are equal `undefined` are automatically ignored.
 *
 * ## Examples
 *
 * ```ts
 * db.select().from(cars)
 *   .where(
 *     or(
 *       eq(cars.make, 'GM'),
 *       eq(cars.make, 'Ford'),
 *     )
 *   )
 * ```
 */
declare function or(...conditions: (SQL | undefined)[]): SQL | undefined;
/**
 * Negate the meaning of an expression using the `not` keyword.
 *
 * ## Examples
 *
 * ```ts
 * // Select cars _not_ made by GM or Ford.
 * db.select().from(cars)
 *   .where(not(inArray(cars.make, ['GM', 'Ford'])))
 * ```
 */
declare function not(condition: SQL): SQL;
/**
 * Test that the first expression passed is greater than
 * the second expression.
 *
 * ## Examples
 *
 * ```ts
 * // Select cars made after 2000.
 * db.select().from(cars)
 *   .where(gt(cars.year, 2000))
 * ```
 *
 * @see gte for greater-than-or-equal
 */
declare function gt<T>(left: SQL.Aliased<T>, right: T | Placeholder | SQLWrapper | AnyColumn): SQL;
declare function gt<TColumn extends AnyColumn>(left: TColumn, right: GetColumnData<TColumn, 'raw'> | Placeholder | SQLWrapper | AnyColumn): SQL;
/**
 * Test that the first expression passed is greater than
 * or equal to the second expression. Use `gt` to
 * test whether an expression is strictly greater
 * than another.
 *
 * ## Examples
 *
 * ```ts
 * // Select cars made on or after 2000.
 * db.select().from(cars)
 *   .where(gte(cars.year, 2000))
 * ```
 *
 * @see gt for a strictly greater-than condition
 */
declare function gte<T>(left: SQL.Aliased<T>, right: T | Placeholder | SQLWrapper | AnyColumn): SQL;
declare function gte<TColumn extends AnyColumn>(left: TColumn, right: GetColumnData<TColumn, 'raw'> | Placeholder | SQLWrapper | AnyColumn): SQL;
/**
 * Test that the first expression passed is less than
 * the second expression.
 *
 * ## Examples
 *
 * ```ts
 * // Select cars made before 2000.
 * db.select().from(cars)
 *   .where(lt(cars.year, 2000))
 * ```
 *
 * @see lte for greater-than-or-equal
 */
declare function lt<T>(left: SQL.Aliased<T>, right: T | Placeholder | SQLWrapper | AnyColumn): SQL;
declare function lt<TColumn extends AnyColumn>(left: TColumn, right: GetColumnData<TColumn, 'raw'> | Placeholder | SQLWrapper | AnyColumn): SQL;
/**
 * Test that the first expression passed is less than
 * or equal to the second expression.
 *
 * ## Examples
 *
 * ```ts
 * // Select cars made before 2000.
 * db.select().from(cars)
 *   .where(lte(cars.year, 2000))
 * ```
 *
 * @see lt for a strictly less-than condition
 */
declare function lte<T>(left: SQL.Aliased<T>, right: T | Placeholder | SQLWrapper | AnyColumn): SQL;
declare function lte<TColumn extends AnyColumn>(left: TColumn, right: GetColumnData<TColumn, 'raw'> | Placeholder | SQLWrapper | AnyColumn): SQL;
/**
 * Test whether the first parameter, a column or expression,
 * has a value from a list passed as the second argument.
 *
 * ## Throws
 *
 * The argument passed in the second array can’t be empty:
 * if an empty is provided, this method will throw.
 *
 * ## Examples
 *
 * ```ts
 * // Select cars made by Ford or GM.
 * db.select().from(cars)
 *   .where(inArray(cars.make, ['Ford', 'GM']))
 * ```
 *
 * @see notInArray for the inverse of this test
 */
declare function inArray<T>(column: SQL.Aliased<T>, values: (T | Placeholder)[] | Placeholder | SQLWrapper): SQL;
declare function inArray<TColumn extends AnyColumn>(column: TColumn, values: (GetColumnData<TColumn, 'raw'> | Placeholder)[] | Placeholder | SQLWrapper): SQL;
/**
 * Test whether the first parameter, a column or expression,
 * has a value that is not present in a list passed as the
 * second argument.
 *
 * ## Throws
 *
 * The argument passed in the second array can’t be empty:
 * if an empty is provided, this method will throw.
 *
 * ## Examples
 *
 * ```ts
 * // Select cars made by any company except Ford or GM.
 * db.select().from(cars)
 *   .where(notInArray(cars.make, ['Ford', 'GM']))
 * ```
 *
 * @see inArray for the inverse of this test
 */
declare function notInArray<T>(column: SQL.Aliased<T>, values: (T | Placeholder)[] | Placeholder | SQLWrapper): SQL;
declare function notInArray<TColumn extends AnyColumn>(column: TColumn, values: (GetColumnData<TColumn, 'raw'> | Placeholder)[] | Placeholder | SQLWrapper): SQL;
/**
 * Test whether an expression is NULL. By the SQL standard,
 * NULL is neither equal nor not equal to itself, so
 * it's recommended to use `isNull` and `notIsNull` for
 * comparisons to NULL.
 *
 * ## Examples
 *
 * ```ts
 * // Select cars that have no discontinuedAt date.
 * db.select().from(cars)
 *   .where(isNull(cars.discontinuedAt))
 * ```
 *
 * @see isNotNull for the inverse of this test
 */
declare function isNull(column: AnyColumn | Placeholder | SQLWrapper): SQL;
/**
 * Test whether an expression is not NULL. By the SQL standard,
 * NULL is neither equal nor not equal to itself, so
 * it's recommended to use `isNull` and `notIsNull` for
 * comparisons to NULL.
 *
 * ## Examples
 *
 * ```ts
 * // Select cars that have been discontinued.
 * db.select().from(cars)
 *   .where(isNotNull(cars.discontinuedAt))
 * ```
 *
 * @see isNull for the inverse of this test
 */
declare function isNotNull(column: AnyColumn | Placeholder | SQLWrapper): SQL;
/**
 * Test whether a subquery evaluates to have any rows.
 *
 * ## Examples
 *
 * ```ts
 * // Users whose `homeCity` column has a match in a cities
 * // table.
 * db
 *   .select()
 *   .from(users)
 *   .where(
 *     exists(db.select()
 *       .from(cities)
 *       .where(eq(users.homeCity, cities.id))),
 *   );
 * ```
 *
 * @see notExists for the inverse of this test
 */
declare function exists(subquery: SQLWrapper): SQL;
/**
 * Test whether a subquery doesn't include any result
 * rows.
 *
 * ## Examples
 *
 * ```ts
 * // Users whose `homeCity` column doesn't match
 * // a row in the cities table.
 * db
 *   .select()
 *   .from(users)
 *   .where(
 *     notExists(db.select()
 *       .from(cities)
 *       .where(eq(users.homeCity, cities.id))),
 *   );
 * ```
 *
 * @see exists for the inverse of this test
 */
declare function notExists(subquery: SQLWrapper): SQL;
/**
 * Test whether an expression is between two values. This
 * is an easier way to express range tests, which would be
 * expressed mathematically as `x <= a <= y` but in SQL
 * would have to be like `a >= x AND a <= y`.
 *
 * Between is inclusive of the endpoints: if `column`
 * is equal to `min` or `max`, it will be TRUE.
 *
 * ## Examples
 *
 * ```ts
 * // Select cars made between 1990 and 2000
 * db.select().from(cars)
 *   .where(between(cars.year, 1990, 2000))
 * ```
 *
 * @see notBetween for the inverse of this test
 */
declare function between<T>(column: SQL.Aliased, min: T | Placeholder | SQLWrapper, max: T | Placeholder | SQLWrapper): SQL;
declare function between<TColumn extends AnyColumn>(column: TColumn, min: GetColumnData<TColumn, 'raw'> | Placeholder | SQLWrapper, max: GetColumnData<TColumn, 'raw'> | Placeholder | SQLWrapper): SQL;
/**
 * Test whether an expression is not between two values.
 *
 * This, like `between`, includes its endpoints, so if
 * the `column` is equal to `min` or `max`, in this case
 * it will evaluate to FALSE.
 *
 * ## Examples
 *
 * ```ts
 * // Exclude cars made in the 1970s
 * db.select().from(cars)
 *   .where(notBetween(cars.year, 1970, 1979))
 * ```
 *
 * @see between for the inverse of this test
 */
declare function notBetween<T>(column: SQL.Aliased, min: T | Placeholder | SQLWrapper, max: T | Placeholder | SQLWrapper): SQL;
declare function notBetween<TColumn extends AnyColumn>(column: TColumn, min: GetColumnData<TColumn, 'raw'> | Placeholder | SQLWrapper, max: GetColumnData<TColumn, 'raw'> | Placeholder | SQLWrapper): SQL;
/**
 * Compare a column to a pattern, which can include `%` and `_`
 * characters to match multiple variations. Including `%`
 * in the pattern matches zero or more characters, and including
 * `_` will match a single character.
 *
 * ## Examples
 *
 * ```ts
 * // Select all cars with 'Turbo' in their names.
 * db.select().from(cars)
 *   .where(like(cars.name, '%Turbo%'))
 * ```
 *
 * @see ilike for a case-insensitive version of this condition
 */
declare function like(column: AnyColumn, value: string | Placeholder | SQLWrapper): SQL;
/**
 * The inverse of like - this tests that a given column
 * does not match a pattern, which can include `%` and `_`
 * characters to match multiple variations. Including `%`
 * in the pattern matches zero or more characters, and including
 * `_` will match a single character.
 *
 * ## Examples
 *
 * ```ts
 * // Select all cars that don't have "ROver" in their name.
 * db.select().from(cars)
 *   .where(notLike(cars.name, '%Rover%'))
 * ```
 *
 * @see like for the inverse condition
 * @see notIlike for a case-insensitive version of this condition
 */
declare function notLike(column: AnyColumn, value: string | Placeholder | SQLWrapper): SQL;
/**
 * Case-insensitively compare a column to a pattern,
 * which can include `%` and `_`
 * characters to match multiple variations. Including `%`
 * in the pattern matches zero or more characters, and including
 * `_` will match a single character.
 *
 * Unlike like, this performs a case-insensitive comparison.
 *
 * ## Examples
 *
 * ```ts
 * // Select all cars with 'Turbo' in their names.
 * db.select().from(cars)
 *   .where(ilike(cars.name, '%Turbo%'))
 * ```
 *
 * @see like for a case-sensitive version of this condition
 */
declare function ilike(column: AnyColumn, value: string | Placeholder | SQLWrapper): SQL;
/**
 * The inverse of ilike - this case-insensitively tests that a given column
 * does not match a pattern, which can include `%` and `_`
 * characters to match multiple variations. Including `%`
 * in the pattern matches zero or more characters, and including
 * `_` will match a single character.
 *
 * ## Examples
 *
 * ```ts
 * // Select all cars that don't have "Rover" in their name.
 * db.select().from(cars)
 *   .where(notLike(cars.name, '%Rover%'))
 * ```
 *
 * @see ilike for the inverse condition
 * @see notLike for a case-sensitive version of this condition
 */
declare function notIlike(column: AnyColumn, value: string | Placeholder | SQLWrapper): SQL;

/**
 * Used in sorting, this specifies that the given
 * column or expression should be sorted in ascending
 * order. By the SQL standard, ascending order is the
 * default, so it is not usually necessary to specify
 * ascending sort order.
 *
 * ## Examples
 *
 * ```ts
 * // Return cars, starting with the oldest models
 * // and going in ascending order to the newest.
 * db.select().from(cars)
 *   .orderBy(asc(cars.year));
 * ```
 *
 * @see desc to sort in descending order
 */
declare function asc(column: AnyColumn | SQLWrapper): SQL;
/**
 * Used in sorting, this specifies that the given
 * column or expression should be sorted in descending
 * order.
 *
 * ## Examples
 *
 * ```ts
 * // Select users, with the most recently created
 * // records coming first.
 * db.select().from(users)
 *   .orderBy(desc(users.createdAt));
 * ```
 *
 * @see asc to sort in ascending order
 */
declare function desc(column: AnyColumn | SQLWrapper): SQL;

declare abstract class Relation<TTableName extends string = string> {
    readonly sourceTable: Table;
    readonly referencedTable: AnyTable<{
        name: TTableName;
    }>;
    readonly relationName: string | undefined;
    readonly $brand: 'Relation';
    readonly referencedTableName: TTableName;
    fieldName: string;
    constructor(sourceTable: Table, referencedTable: AnyTable<{
        name: TTableName;
    }>, relationName: string | undefined);
    abstract withFieldName(fieldName: string): Relation<TTableName>;
}
declare class Relations<TTableName extends string = string, TConfig extends Record<string, Relation> = Record<string, Relation>> {
    readonly table: AnyTable<{
        name: TTableName;
    }>;
    readonly config: (helpers: TableRelationsHelpers<TTableName>) => TConfig;
    readonly $brand: 'Relations';
    constructor(table: AnyTable<{
        name: TTableName;
    }>, config: (helpers: TableRelationsHelpers<TTableName>) => TConfig);
}
declare class One<TTableName extends string = string, TIsNullable extends boolean = boolean> extends Relation<TTableName> {
    readonly config: RelationConfig<TTableName, string, AnyColumn<{
        tableName: TTableName;
    }>[]> | undefined;
    readonly isNullable: TIsNullable;
    protected $relationBrand: 'One';
    constructor(sourceTable: Table, referencedTable: AnyTable<{
        name: TTableName;
    }>, config: RelationConfig<TTableName, string, AnyColumn<{
        tableName: TTableName;
    }>[]> | undefined, isNullable: TIsNullable);
    withFieldName(fieldName: string): One<TTableName>;
}
declare class Many<TTableName extends string> extends Relation<TTableName> {
    readonly config: {
        relationName: string;
    } | undefined;
    protected $relationBrand: 'Many';
    constructor(sourceTable: Table, referencedTable: AnyTable<{
        name: TTableName;
    }>, config: {
        relationName: string;
    } | undefined);
    withFieldName(fieldName: string): Many<TTableName>;
}
type TableRelationsKeysOnly<TSchema extends Record<string, unknown>, TTableName extends string, K extends keyof TSchema> = TSchema[K] extends Relations<TTableName> ? K : never;
type ExtractTableRelationsFromSchema<TSchema extends Record<string, unknown>, TTableName extends string> = ExtractObjectValues<{
    [K in keyof TSchema as TableRelationsKeysOnly<TSchema, TTableName, K>]: TSchema[K] extends Relations<TTableName, infer TConfig> ? TConfig : never;
}>;
type ExtractObjectValues<T> = T[keyof T];
type ExtractRelationsFromTableExtraConfigSchema<TConfig extends unknown[]> = ExtractObjectValues<{
    [K in keyof TConfig as TConfig[K] extends Relations<any> ? K : never]: TConfig[K] extends Relations<infer TRelationConfig> ? TRelationConfig : never;
}>;
declare const operators: {
    sql: typeof sql;
    eq: typeof eq;
    and: typeof and;
    or: typeof or;
};
type Operators = typeof operators;
declare const orderByOperators: {
    sql: typeof sql;
    asc: typeof asc;
    desc: typeof desc;
};
type OrderByOperators = typeof orderByOperators;
type FindTableByDBName<TSchema extends TablesRelationalConfig, TTableName extends string> = ExtractObjectValues<{
    [K in keyof TSchema as TSchema[K]['dbName'] extends TTableName ? K : never]: TSchema[K];
}>;
type DBQueryConfig<TRelationType extends 'one' | 'many' = 'one' | 'many', TIsRoot extends boolean = boolean, TSchema extends TablesRelationalConfig = TablesRelationalConfig, TTableConfig extends TableRelationalConfig = TableRelationalConfig> = {
    columns?: {
        [K in keyof TTableConfig['columns']]?: boolean;
    };
    with?: {
        [K in keyof TTableConfig['relations']]?: true | DBQueryConfig<TTableConfig['relations'][K] extends One ? 'one' : 'many', false, TSchema, FindTableByDBName<TSchema, TTableConfig['relations'][K]['referencedTableName']>>;
    };
    extras?: Record<string, SQL.Aliased> | ((fields: SimplifyShallow<TTableConfig['columns'] & TTableConfig['relations']>, operators: {
        sql: Operators['sql'];
    }) => Record<string, SQL.Aliased>);
} & (TRelationType extends 'many' ? {
    where?: SQL | undefined | ((fields: SimplifyShallow<TTableConfig['columns'] & TTableConfig['relations']>, operators: Operators) => SQL | undefined);
    orderBy?: ValueOrArray<AnyColumn | SQL> | ((fields: SimplifyShallow<TTableConfig['columns'] & TTableConfig['relations']>, operators: OrderByOperators) => ValueOrArray<AnyColumn | SQL>);
    limit?: number | Placeholder;
} & (TIsRoot extends true ? {
    offset?: number | Placeholder;
} : {}) : {});
interface TableRelationalConfig {
    tsName: string;
    dbName: string;
    columns: Record<string, AnyColumn>;
    relations: Record<string, Relation>;
    primaryKey: AnyColumn[];
}
type TablesRelationalConfig = Record<string, TableRelationalConfig>;
interface RelationalSchemaConfig<TSchema extends TablesRelationalConfig> {
    fullSchema: Record<string, unknown>;
    schema: TSchema;
    tableNamesMap: Record<string, string>;
}
type ExtractTablesWithRelations<TSchema extends Record<string, unknown>> = {
    [K in keyof TSchema as TSchema[K] extends Table ? K : never]: TSchema[K] extends Table ? {
        tsName: K & string;
        dbName: TSchema[K]['_']['name'];
        columns: TSchema[K]['_']['columns'];
        relations: ExtractTableRelationsFromSchema<TSchema, TSchema[K]['_']['name']>;
        primaryKey: AnyColumn[];
    } : never;
};
type ReturnTypeOrValue<T> = T extends (...args: any[]) => infer R ? R : T;
type BuildRelationResult<TSchema extends TablesRelationalConfig, TInclude, TRelations extends Record<string, Relation>> = {
    [K in NonUndefinedKeysOnly<TInclude> & keyof TRelations]: TRelations[K] extends infer TRel extends Relation ? BuildQueryResult<TSchema, FindTableByDBName<TSchema, TRel['referencedTableName']>, Assume<TInclude[K], true | Record<string, unknown>>> extends infer TResult ? TRel extends One ? (TResult | (Equal<TRel['isNullable'], false> extends true ? null : never)) : TResult[] : never : never;
};
type NonUndefinedKeysOnly<T> = ExtractObjectValues<{
    [K in keyof T as T[K] extends undefined ? never : K]: K;
}> & keyof T;
type BuildQueryResult<TSchema extends TablesRelationalConfig, TTableConfig extends TableRelationalConfig, TFullSelection extends true | Record<string, unknown>> = Equal<TFullSelection, true> extends true ? InferModelFromColumns<TTableConfig['columns']> : TFullSelection extends Record<string, unknown> ? (SimplifyShallow<(TFullSelection['columns'] extends Record<string, unknown> ? InferModelFromColumns<{
    [K in (Equal<Exclude<TFullSelection['columns'][keyof TFullSelection['columns'] & keyof TTableConfig['columns']], undefined>, false> extends true ? Exclude<keyof TTableConfig['columns'], NonUndefinedKeysOnly<TFullSelection['columns']>> : {
        [K in keyof TFullSelection['columns']]: Equal<TFullSelection['columns'][K], true> extends true ? K : never;
    }[keyof TFullSelection['columns']] & keyof TTableConfig['columns'])]: TTableConfig['columns'][K];
}> : InferModelFromColumns<TTableConfig['columns']>) & (TFullSelection['extras'] extends Record<string, unknown> | ((...args: any[]) => Record<string, unknown>) ? {
    [K in NonUndefinedKeysOnly<ReturnTypeOrValue<TFullSelection['extras']>>]: Assume<ReturnTypeOrValue<TFullSelection['extras']>[K], SQL.Aliased>['_']['type'];
} : {}) & (TFullSelection['with'] extends Record<string, unknown> ? BuildRelationResult<TSchema, TFullSelection['with'], TTableConfig['relations']> : {})>) : never;
interface RelationConfig<TTableName extends string, TForeignTableName extends string, TColumns extends AnyColumn<{
    tableName: TTableName;
}>[]> {
    relationName?: string;
    fields: TColumns;
    references: ColumnsWithTable<TTableName, TForeignTableName, TColumns>;
}
declare function extractTablesRelationalConfig<TTables extends TablesRelationalConfig>(schema: Record<string, unknown>, configHelpers: (table: Table) => any): {
    tables: TTables;
    tableNamesMap: Record<string, string>;
};
declare function relations<TTableName extends string, TRelations extends Record<string, Relation<any>>>(table: AnyTable<{
    name: TTableName;
}>, relations: (helpers: TableRelationsHelpers<TTableName>) => TRelations): Relations<TTableName, TRelations>;
declare function createOne<TTableName extends string>(sourceTable: Table): <TForeignTable extends Table<TableConfig<AnyColumn>>, TColumns extends [AnyColumn<{
    tableName: TTableName;
}>, ...AnyColumn<{
    tableName: TTableName;
}>[]]>(table: TForeignTable, config?: RelationConfig<TTableName, TForeignTable["_"]["name"], TColumns> | undefined) => One<TForeignTable["_"]["name"], Equal<TColumns[number]["_"]["notNull"], true>>;
declare function createMany(sourceTable: Table): <TForeignTable extends Table<TableConfig<AnyColumn>>>(referencedTable: TForeignTable, config?: {
    relationName: string;
}) => Many<TForeignTable["_"]["name"]>;
interface NormalizedRelation {
    fields: AnyColumn[];
    references: AnyColumn[];
}
declare function normalizeRelation(schema: TablesRelationalConfig, tableNamesMap: Record<string, string>, relation: Relation): NormalizedRelation;
declare function createTableRelationsHelpers<TTableName extends string>(sourceTable: AnyTable<{
    name: TTableName;
}>): {
    one: <TForeignTable extends Table<TableConfig<AnyColumn>>, TColumns extends [AnyColumn<{
        tableName: TTableName;
    }>, ...AnyColumn<{
        tableName: TTableName;
    }>[]]>(table: TForeignTable, config?: RelationConfig<TTableName, TForeignTable["_"]["name"], TColumns> | undefined) => One<TForeignTable["_"]["name"], Equal<TColumns[number]["_"]["notNull"], true>>;
    many: <TForeignTable_1 extends Table<TableConfig<AnyColumn>>>(referencedTable: TForeignTable_1, config?: {
        relationName: string;
    } | undefined) => Many<TForeignTable_1["_"]["name"]>;
};
type TableRelationsHelpers<TTableName extends string> = ReturnType<typeof createTableRelationsHelpers<TTableName>>;
interface BuildRelationalQueryResult {
    tableTsKey: string;
    selection: {
        dbKey: string;
        tsKey: string;
        field: AnyColumn | SQL | SQL.Aliased | undefined;
        tableTsKey: string | undefined;
        isJson: boolean;
        selection: BuildRelationalQueryResult['selection'];
    }[];
    sql: Table | SQL;
}
declare function mapRelationalRow(tablesConfig: TablesRelationalConfig, tableConfig: TableRelationalConfig, row: unknown[], buildQueryResultSelection: BuildRelationalQueryResult['selection'], mapColumnValue?: (value: unknown) => unknown): Record<string, unknown>;

declare abstract class QueryPromise<T> implements Promise<T> {
    [Symbol.toStringTag]: string;
    catch<TResult = never>(onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<T | TResult>;
    finally(onFinally?: (() => void) | null | undefined): Promise<T>;
    then<TResult1 = T, TResult2 = never>(onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    abstract execute(): Promise<T>;
}

export { normalizeRelation as $, TableRelationsKeysOnly as A, ExtractObjectValues as B, ExtractRelationsFromTableExtraConfigSchema as C, operators as D, ExtractTableRelationsFromSchema as E, Operators as F, orderByOperators as G, OrderByOperators as H, FindTableByDBName as I, DBQueryConfig as J, TableRelationalConfig as K, ExtractTablesWithRelations as L, Many as M, ReturnTypeOrValue as N, One as O, BuildRelationResult as P, QueryPromise as Q, RelationalSchemaConfig as R, NonUndefinedKeysOnly as S, TablesRelationalConfig as T, BuildQueryResult as U, RelationConfig as V, extractTablesRelationalConfig as W, relations as X, createOne as Y, createMany as Z, NormalizedRelation as _, Relation as a, createTableRelationsHelpers as a0, TableRelationsHelpers as a1, BuildRelationalQueryResult as a2, mapRelationalRow as a3, bindIfParam as b, and as c, not as d, eq as e, gte as f, gt as g, lte as h, inArray as i, notInArray as j, isNull as k, lt as l, isNotNull as m, ne as n, or as o, exists as p, notExists as q, between as r, notBetween as s, like as t, notLike as u, ilike as v, notIlike as w, asc as x, desc as y, Relations as z };