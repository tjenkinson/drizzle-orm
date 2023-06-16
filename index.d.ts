import { A as AnyColumn, T as Table, V as View, a as SQL } from './column.d-66a08b85.js';
export { s as AnyColumnBuilder, g as AnyColumnHKT, h as AnyColumnHKTBase, i as AnyColumnKind, an as AnyTable, ao as AnyTableHKT, ap as AnyTableHKTBase, aq as AnyTableKind, ay as Assume, B as BuildColumn, u as BuildColumns, P as BuildQueryConfig, v as ChangeColumnTableName, K as Chunk, f as Column, C as ColumnBaseConfig, r as ColumnBuilder, k as ColumnBuilderBaseConfig, l as ColumnBuilderConfig, p as ColumnBuilderHKT, n as ColumnBuilderHKTBase, o as ColumnBuilderKind, q as ColumnBuilderRuntimeConfig, b as ColumnConfig, e as ColumnHKT, c as ColumnHKTBase, d as ColumnKind, aL as ColumnsSelection, aH as ColumnsWithTable, x as ConsoleLogWriter, y as DefaultLogger, a2 as DriverValueDecoder, a3 as DriverValueEncoder, a7 as DriverValueMapper, D as DrizzleConfig, aA as DrizzleTypeError, az as Equal, J as FakePrimitiveParam, G as GetColumnData, $ as GetDecoderResult, aD as IfThenElse, j as InferColumnsDataTypes, I as InferModel, as as InferModelFromColumns, aI as KnownKeysOnly, w as LogWriter, L as Logger, m as MakeColumnConfig, M as MapColumnName, a0 as Name, N as NoopLogger, au as OneOrMany, O as OptionalKeyOnly, aC as Or, a9 as Param, ad as Placeholder, aE as PromiseOf, Q as Query, X as QueryTypingsValue, R as RequiredKeyOnly, ab as SQLChunk, Y as SQLWrapper, F as SelectedFields, z as SelectedFieldsFlat, E as SelectedFieldsFlatFull, H as SelectedFieldsOrdered, aj as SelectionProxyHandler, S as Simplify, aw as SimplifyOptions, ax as SimplifyShallow, _ as StringChunk, ah as Subquery, ag as SubqueryConfig, ak as TableConfig, av as Update, t as UpdateCBConfig, U as UpdateColConfig, at as UpdateSet, al as UpdateTableConfig, aB as ValueOrArray, aK as ViewBaseConfig, W as WithEnum, ai as WithSubquery, aF as Writable, af as fillPlaceholders, aG as getTableColumns, ar as getTableName, aJ as iife, a4 as isDriverValueEncoder, Z as isSQLWrapper, am as isTable, a1 as name, a5 as noopDecoder, a6 as noopEncoder, a8 as noopMapper, aa as param, ae as placeholder, ac as sql } from './column.d-66a08b85.js';
import { a as Relation } from './query-promise.d-d7b61248.js';
export { U as BuildQueryResult, P as BuildRelationResult, a2 as BuildRelationalQueryResult, J as DBQueryConfig, B as ExtractObjectValues, C as ExtractRelationsFromTableExtraConfigSchema, E as ExtractTableRelationsFromSchema, L as ExtractTablesWithRelations, I as FindTableByDBName, M as Many, S as NonUndefinedKeysOnly, _ as NormalizedRelation, O as One, F as Operators, H as OrderByOperators, Q as QueryPromise, V as RelationConfig, R as RelationalSchemaConfig, z as Relations, N as ReturnTypeOrValue, K as TableRelationalConfig, a1 as TableRelationsHelpers, A as TableRelationsKeysOnly, T as TablesRelationalConfig, c as and, x as asc, r as between, b as bindIfParam, Z as createMany, Y as createOne, a0 as createTableRelationsHelpers, y as desc, e as eq, p as exists, W as extractTablesRelationalConfig, g as gt, f as gte, v as ilike, i as inArray, m as isNotNull, k as isNull, t as like, l as lt, h as lte, a3 as mapRelationalRow, n as ne, $ as normalizeRelation, d as not, s as notBetween, q as notExists, w as notIlike, j as notInArray, u as notLike, D as operators, o as or, G as orderByOperators, X as relations } from './query-promise.d-d7b61248.js';

declare class ColumnAliasProxyHandler<TColumn extends AnyColumn> implements ProxyHandler<TColumn> {
    private table;
    constructor(table: Table | View);
    get(columnObj: TColumn, prop: string | symbol): any;
}
declare class TableAliasProxyHandler<T extends Table | View> implements ProxyHandler<T> {
    private alias;
    private replaceOriginalName;
    constructor(alias: string, replaceOriginalName: boolean);
    get(target: T, prop: string | symbol): any;
}
declare class RelationTableAliasProxyHandler<T extends Relation> implements ProxyHandler<T> {
    private alias;
    constructor(alias: string);
    get(target: T, prop: string | symbol): any;
}
declare function aliasedTable<T extends Table>(table: T, tableAlias: string): T;
declare function aliasedRelation<T extends Relation>(relation: T, tableAlias: string): T;
declare function aliasedTableColumn<T extends AnyColumn>(column: T, tableAlias: string): T;
declare function mapColumnsInAliasedSQLToAlias(query: SQL.Aliased, alias: string): SQL.Aliased;
declare function mapColumnsInSQLToAlias(query: SQL, alias: string): SQL;

declare class DrizzleError extends Error {
    constructor(message: string);
    static wrap(error: unknown, message?: string): DrizzleError;
}
declare class TransactionRollbackError extends DrizzleError {
    constructor();
}

export { AnyColumn, ColumnAliasProxyHandler, DrizzleError, Relation, RelationTableAliasProxyHandler, SQL, Table, TableAliasProxyHandler, TransactionRollbackError, View, aliasedRelation, aliasedTable, aliasedTableColumn, mapColumnsInAliasedSQLToAlias, mapColumnsInSQLToAlias };
