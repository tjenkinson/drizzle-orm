import { T as TypedQueryBuilder, A as AddAliasToSelection, G as GetSelectTableName, a as GetSelectTableSelection, S as SelectMode, J as JoinNullability, B as BuildSubquerySelection, b as SelectResult, c as JoinType, M as MapColumnsToTableAlias, d as AppendToResult, e as AppendToNullabilityMap, f as SelectResultFields } from './select.types.d-1bd49d37.js';
import { T as TablesRelationalConfig, K as TableRelationalConfig, J as DBQueryConfig, a2 as BuildRelationalQueryResult, U as BuildQueryResult, Q as QueryPromise, L as ExtractTablesWithRelations, R as RelationalSchemaConfig } from './query-promise.d-d7b61248.js';
import { a as SQL, ak as TableConfig$1, T as Table, al as UpdateTableConfig, u as BuildColumns, n as ColumnBuilderHKTBase, ay as Assume, k as ColumnBuilderBaseConfig, c as ColumnHKTBase, C as ColumnBaseConfig, r as ColumnBuilder, av as Update, f as Column, aL as ColumnsSelection, V as View, ah as Subquery, ai as WithSubquery, aB as ValueOrArray, ad as Placeholder, S as Simplify, Q as Query, z as SelectedFieldsFlat$1, F as SelectedFields$1, H as SelectedFieldsOrdered$1, Y as SQLWrapper, I as InferModel, at as UpdateSet, G as GetColumnData, a9 as Param, A as AnyColumn, aI as KnownKeysOnly } from './column.d-66a08b85.js';
import { MigrationMeta } from './migrator.js';

declare class CheckBuilder {
    name: string;
    value: SQL;
    protected brand: 'SQLiteConstraintBuilder';
    constructor(name: string, value: SQL);
    build(table: AnySQLiteTable): Check;
}
declare class Check {
    table: AnySQLiteTable;
    _: {
        brand: 'SQLiteCheck';
    };
    readonly name: string;
    readonly value: SQL;
    constructor(table: AnySQLiteTable, builder: CheckBuilder);
}
declare function check(name: string, value: SQL): CheckBuilder;

interface IndexConfig {
    name: string;
    columns: IndexColumn[];
    unique: boolean;
    where: SQL | undefined;
}
type IndexColumn = AnySQLiteColumn | SQL;
declare class IndexBuilderOn {
    private name;
    private unique;
    constructor(name: string, unique: boolean);
    on(...columns: [IndexColumn, ...IndexColumn[]]): IndexBuilder;
}
declare class IndexBuilder {
    _: {
        brand: 'SQLiteIndexBuilder';
    };
    constructor(name: string, columns: IndexColumn[], unique: boolean);
    /**
     * Condition for partial index.
     */
    where(condition: SQL): this;
}
declare class Index {
    _: {
        brand: 'SQLiteIndex';
    };
    readonly config: IndexConfig & {
        table: AnySQLiteTable;
    };
    constructor(config: IndexConfig, table: AnySQLiteTable);
}
declare function index(name: string): IndexBuilderOn;
declare function uniqueIndex(name: string): IndexBuilderOn;

declare function primaryKey<TTableName extends string, TColumns extends AnySQLiteColumn<{
    tableName: TTableName;
}>[]>(...columns: TColumns): PrimaryKeyBuilder;
declare class PrimaryKeyBuilder {
    _: {
        brand: 'SQLitePrimaryKeyBuilder';
    };
    constructor(columns: AnySQLiteColumn[]);
}
declare class PrimaryKey {
    readonly table: AnySQLiteTable;
    readonly columns: AnySQLiteColumn<{}>[];
    constructor(table: AnySQLiteTable, columns: AnySQLiteColumn<{}>[]);
    getName(): string;
}

type SQLiteTableExtraConfig = Record<string, IndexBuilder | CheckBuilder | ForeignKeyBuilder | PrimaryKeyBuilder>;
type TableConfig = TableConfig$1<AnySQLiteColumn>;
declare class SQLiteTable<T extends TableConfig> extends Table<T> {
}
type AnySQLiteTable<TPartial extends Partial<TableConfig> = {}> = SQLiteTable<UpdateTableConfig<TableConfig, TPartial>>;
type SQLiteTableWithColumns<T extends TableConfig> = SQLiteTable<T> & {
    [Key in keyof T['columns']]: T['columns'][Key];
};
interface SQLiteTableFn<TSchema extends string | undefined = undefined> {
    <TTableName extends string, TColumnsMap extends Record<string, AnySQLiteColumnBuilder>>(name: TTableName, columns: TColumnsMap, extraConfig?: (self: BuildColumns<TTableName, TColumnsMap>) => SQLiteTableExtraConfig): SQLiteTableWithColumns<{
        name: TTableName;
        schema: TSchema;
        columns: BuildColumns<TTableName, TColumnsMap>;
    }>;
}
declare const sqliteTable: SQLiteTableFn;
declare function sqliteTableCreator(customizeTableName: (name: string) => string): SQLiteTableFn;

type UpdateDeleteAction = 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
type Reference = () => {
    readonly columns: AnySQLiteColumn[];
    readonly foreignTable: AnySQLiteTable;
    readonly foreignColumns: AnySQLiteColumn[];
};
declare class ForeignKeyBuilder {
    _: {
        brand: 'SQLiteForeignKeyBuilder';
        foreignTableName: 'TForeignTableName';
    };
    constructor(config: () => {
        columns: AnySQLiteColumn[];
        foreignColumns: AnySQLiteColumn[];
    }, actions?: {
        onUpdate?: UpdateDeleteAction;
        onDelete?: UpdateDeleteAction;
    } | undefined);
    onUpdate(action: UpdateDeleteAction): this;
    onDelete(action: UpdateDeleteAction): this;
}
declare class ForeignKey {
    readonly table: AnySQLiteTable;
    readonly reference: Reference;
    readonly onUpdate: UpdateDeleteAction | undefined;
    readonly onDelete: UpdateDeleteAction | undefined;
    constructor(table: AnySQLiteTable, builder: ForeignKeyBuilder);
    getName(): string;
}
type ColumnsWithTable<TTableName extends string, TColumns extends AnySQLiteColumn[]> = {
    [Key in keyof TColumns]: AnySQLiteColumn<{
        tableName: TTableName;
    }>;
};
declare function foreignKey<TTableName extends string, TForeignTableName extends string, TColumns extends [AnySQLiteColumn<{
    tableName: TTableName;
}>, ...AnySQLiteColumn<{
    tableName: TTableName;
}>[]]>(config: () => {
    columns: TColumns;
    foreignColumns: ColumnsWithTable<TForeignTableName, TColumns>;
}): ForeignKeyBuilder;

interface ReferenceConfig {
    ref: () => AnySQLiteColumn;
    actions: {
        onUpdate?: UpdateDeleteAction;
        onDelete?: UpdateDeleteAction;
    };
}
interface SQLiteColumnBuilderHKT extends ColumnBuilderHKTBase {
    _type: SQLiteColumnBuilder<SQLiteColumnBuilderHKT, Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: SQLiteColumnHKT;
}
interface SQLiteColumnHKT extends ColumnHKTBase {
    _type: SQLiteColumn<SQLiteColumnHKT, Assume<this['config'], ColumnBaseConfig>>;
}
declare abstract class SQLiteColumnBuilder<THKT extends ColumnBuilderHKTBase, T extends ColumnBuilderBaseConfig, TRuntimeConfig extends object = {}, TTypeConfig extends object = {}> extends ColumnBuilder<THKT, T, TRuntimeConfig, TTypeConfig & {
    sqliteBrand: 'SQLiteColumnBuilder';
}> {
    private foreignKeyConfigs;
    references(ref: ReferenceConfig['ref'], actions?: ReferenceConfig['actions']): this;
}
type AnySQLiteColumnBuilder<TPartial extends Partial<ColumnBuilderBaseConfig> = {}> = SQLiteColumnBuilder<SQLiteColumnBuilderHKT, Required<Update<ColumnBuilderBaseConfig, TPartial>>>;
declare abstract class SQLiteColumn<THKT extends ColumnHKTBase, T extends ColumnBaseConfig, TRuntimeConfig extends object = {}> extends Column<THKT, T, TRuntimeConfig, {
    sqliteBrand: 'SQLiteColumn';
}> {
}
type AnySQLiteColumn<TPartial extends Partial<ColumnBaseConfig> = {}> = SQLiteColumn<SQLiteColumnHKT, Required<Update<ColumnBaseConfig, TPartial>>>;

interface ViewBuilderConfig {
    algorithm?: 'undefined' | 'merge' | 'temptable';
    definer?: string;
    sqlSecurity?: 'definer' | 'invoker';
    withCheckOption?: 'cascaded' | 'local';
}
declare class ViewBuilderCore<TConfig extends {
    name: string;
    columns?: unknown;
}> {
    protected name: TConfig['name'];
    readonly _: {
        readonly name: TConfig['name'];
        readonly columns: TConfig['columns'];
    };
    constructor(name: TConfig['name']);
    protected config: ViewBuilderConfig;
}
declare class ViewBuilder<TName extends string = string> extends ViewBuilderCore<{
    name: TName;
}> {
    as<TSelection extends SelectedFields>(qb: TypedQueryBuilder<TSelection> | ((qb: QueryBuilder) => TypedQueryBuilder<TSelection>)): SQLiteViewWithSelection<TName, false, AddAliasToSelection<TSelection, TName>>;
}
declare class ManualViewBuilder<TName extends string = string, TColumns extends Record<string, AnySQLiteColumnBuilder> = Record<string, AnySQLiteColumnBuilder>> extends ViewBuilderCore<{
    name: TName;
    columns: TColumns;
}> {
    private columns;
    constructor(name: TName, columns: TColumns);
    existing(): SQLiteViewWithSelection<TName, true, BuildColumns<TName, TColumns>>;
    as(query: SQL): SQLiteViewWithSelection<TName, false, BuildColumns<TName, TColumns>>;
}
declare abstract class SQLiteViewBase<TName extends string = string, TExisting extends boolean = boolean, TSelection extends ColumnsSelection = ColumnsSelection> extends View<TName, TExisting, TSelection> {
    _: View<TName, TExisting, TSelection>['_'] & {
        viewBrand: 'SQLiteView';
    };
}
declare const SQLiteViewConfig: unique symbol;
declare class SQLiteView<TName extends string = string, TExisting extends boolean = boolean, TSelection extends ColumnsSelection = ColumnsSelection> extends SQLiteViewBase<TName, TExisting, TSelection> {
    constructor({ sqliteConfig, config }: {
        sqliteConfig: ViewBuilderConfig | undefined;
        config: {
            name: TName;
            schema: string | undefined;
            selectedFields: SelectedFields;
            query: SQL | undefined;
        };
    });
}
type SQLiteViewWithSelection<TName extends string, TExisting extends boolean, TSelection extends ColumnsSelection> = SQLiteView<TName, TExisting, TSelection> & TSelection;
declare function sqliteView<TName extends string>(name: TName): ViewBuilder<TName>;
declare function sqliteView<TName extends string, TColumns extends Record<string, AnySQLiteColumnBuilder>>(name: TName, columns: TColumns): ManualViewBuilder<TName, TColumns>;
declare const view: typeof sqliteView;

type SubqueryWithSelection<TSelection extends ColumnsSelection, TAlias extends string> = Subquery<TAlias, AddAliasToSelection<TSelection, TAlias>> & AddAliasToSelection<TSelection, TAlias>;
type WithSubqueryWithSelection<TSelection extends ColumnsSelection, TAlias extends string> = WithSubquery<TAlias, AddAliasToSelection<TSelection, TAlias>> & AddAliasToSelection<TSelection, TAlias>;

type CreateSQLiteSelectFromBuilderMode<TBuilderMode extends 'db' | 'qb', TTableName extends string | undefined, TResultType extends 'sync' | 'async', TRunResult, TSelection extends ColumnsSelection, TSelectMode extends SelectMode> = TBuilderMode extends 'db' ? SQLiteSelect<TTableName, TResultType, TRunResult, TSelection, TSelectMode> : SQLiteSelectQueryBuilder<SQLiteSelectQueryBuilderHKT, TTableName, TResultType, TRunResult, TSelection, TSelectMode>;
declare class SQLiteSelectBuilder<TSelection extends SelectedFields | undefined, TResultType extends 'sync' | 'async', TRunResult, TBuilderMode extends 'db' | 'qb' = 'db'> {
    private fields;
    private session;
    private dialect;
    private withList;
    constructor(fields: TSelection, session: SQLiteSession<any, any, any, any> | undefined, dialect: SQLiteDialect, withList?: Subquery[]);
    from<TFrom extends AnySQLiteTable | Subquery | SQLiteViewBase | SQL>(source: TFrom): CreateSQLiteSelectFromBuilderMode<TBuilderMode, GetSelectTableName<TFrom>, TResultType, TRunResult, TSelection extends undefined ? GetSelectTableSelection<TFrom> : TSelection, TSelection extends undefined ? 'single' : 'partial'>;
}
declare abstract class SQLiteSelectQueryBuilder<THKT extends SQLiteSelectHKTBase, TTableName extends string | undefined, TResultType extends 'sync' | 'async', TRunResult, TSelection extends ColumnsSelection, TSelectMode extends SelectMode, TNullabilityMap extends Record<string, JoinNullability> = TTableName extends string ? Record<TTableName, 'not-null'> : {}> extends TypedQueryBuilder<BuildSubquerySelection<TSelection, TNullabilityMap>, SelectResult<TSelection, TSelectMode, TNullabilityMap>[]> {
    private isPartialSelect;
    protected session: SQLiteSession<any, any, any, any> | undefined;
    protected dialect: SQLiteDialect;
    readonly _: {
        readonly selectMode: TSelectMode;
        readonly selection: TSelection;
        readonly result: SelectResult<TSelection, TSelectMode, TNullabilityMap>[];
        readonly selectedFields: BuildSubquerySelection<TSelection, TNullabilityMap>;
    };
    protected config: SQLiteSelectConfig;
    protected joinsNotNullableMap: Record<string, boolean>;
    private tableName;
    constructor(table: SQLiteSelectConfig['table'], fields: SQLiteSelectConfig['fields'], isPartialSelect: boolean, session: SQLiteSession<any, any, any, any> | undefined, dialect: SQLiteDialect, withList: Subquery[]);
    private createJoin;
    leftJoin: JoinFn<THKT, TTableName, TResultType, TRunResult, TSelectMode, "left", TSelection, TNullabilityMap>;
    rightJoin: JoinFn<THKT, TTableName, TResultType, TRunResult, TSelectMode, "right", TSelection, TNullabilityMap>;
    innerJoin: JoinFn<THKT, TTableName, TResultType, TRunResult, TSelectMode, "inner", TSelection, TNullabilityMap>;
    fullJoin: JoinFn<THKT, TTableName, TResultType, TRunResult, TSelectMode, "full", TSelection, TNullabilityMap>;
    where(where: ((aliases: TSelection) => SQL | undefined) | SQL | undefined): this;
    having(having: ((aliases: TSelection) => SQL | undefined) | SQL | undefined): this;
    groupBy(builder: (aliases: TSelection) => ValueOrArray<AnySQLiteColumn | SQL | SQL.Aliased>): this;
    groupBy(...columns: (AnySQLiteColumn | SQL)[]): this;
    orderBy(builder: (aliases: TSelection) => ValueOrArray<AnySQLiteColumn | SQL | SQL.Aliased>): this;
    orderBy(...columns: (AnySQLiteColumn | SQL)[]): this;
    limit(limit: number | Placeholder): this;
    offset(offset: number | Placeholder): this;
    toSQL(): Simplify<Omit<Query, 'typings'>>;
    as<TAlias extends string>(alias: TAlias): SubqueryWithSelection<BuildSubquerySelection<TSelection, TNullabilityMap>, TAlias>;
    getSelectedFields(): BuildSubquerySelection<TSelection, TNullabilityMap>;
}
interface SQLiteSelect<TTableName extends string | undefined, TResultType extends 'sync' | 'async', TRunResult, TSelection extends ColumnsSelection, TSelectMode extends SelectMode = 'single', TNullabilityMap extends Record<string, JoinNullability> = TTableName extends string ? Record<TTableName, 'not-null'> : {}> extends SQLiteSelectQueryBuilder<SQLiteSelectHKT, TTableName | undefined, TResultType, TRunResult, TSelection, TSelectMode, TNullabilityMap> {
}
declare class SQLiteSelect<TTableName extends string | undefined, TResultType extends 'sync' | 'async', TRunResult, TSelection, TSelectMode extends SelectMode = 'single', TNullabilityMap extends Record<string, JoinNullability> = TTableName extends string ? Record<TTableName, 'not-null'> : {}> extends SQLiteSelectQueryBuilder<SQLiteSelectHKT, TTableName, TResultType, TRunResult, TSelection, TSelectMode, TNullabilityMap> {
    prepare(isOneTimeQuery?: boolean): PreparedQuery<{
        type: TResultType;
        run: TRunResult;
        runBatch: SelectResult<TSelection, TSelectMode, TNullabilityMap>[];
        all: SelectResult<TSelection, TSelectMode, TNullabilityMap>[];
        get: SelectResult<TSelection, TSelectMode, TNullabilityMap>;
        values: any[][];
    }>;
    run: ReturnType<this['prepare']>['run'];
    runInBatch: ReturnType<this['prepare']>['runInBatch'];
    all: ReturnType<this['prepare']>['all'];
    get: ReturnType<this['prepare']>['get'];
    values: ReturnType<this['prepare']>['values'];
}

interface JoinsValue {
    on: SQL | undefined;
    table: AnySQLiteTable | Subquery | SQLiteViewBase | SQL;
    alias: string | undefined;
    joinType: JoinType;
}
type AnySQLiteSelect = SQLiteSelect<any, any, any, any, any, any>;
type BuildAliasTable<TTable extends Table | View, TAlias extends string> = TTable extends Table ? SQLiteTableWithColumns<Assume<UpdateTableConfig<TTable['_']['config'], {
    name: TAlias;
    columns: MapColumnsToTableAlias<TTable['_']['columns'], TAlias>;
}>, TableConfig>> : TTable extends View ? SQLiteViewWithSelection<TAlias, TTable['_']['existing'], MapColumnsToTableAlias<TTable['_']['selectedFields'], TAlias>> : never;
interface SQLiteSelectConfig {
    withList: Subquery[];
    fields: Record<string, unknown>;
    fieldsFlat?: SelectedFieldsOrdered;
    where?: SQL;
    having?: SQL;
    table: AnySQLiteTable | Subquery | SQLiteViewBase | SQL;
    limit?: number | Placeholder;
    offset?: number | Placeholder;
    joins: JoinsValue[];
    orderBy: (AnySQLiteColumn | SQL | SQL.Aliased)[];
    groupBy: (AnySQLiteColumn | SQL | SQL.Aliased)[];
}
type JoinFn<THKT extends SQLiteSelectHKTBase, TTableName extends string | undefined, TResultType extends 'sync' | 'async', TRunResult, TSelectMode extends SelectMode, TJoinType extends JoinType, TSelection, TNullabilityMap extends Record<string, JoinNullability>> = <TJoinedTable extends AnySQLiteTable | Subquery | SQLiteViewBase | SQL, TJoinedName extends GetSelectTableName<TJoinedTable> = GetSelectTableName<TJoinedTable>>(table: TJoinedTable, on: ((aliases: TSelection) => SQL | undefined) | SQL | undefined) => SQLiteSelectKind<THKT, TTableName, TResultType, TRunResult, AppendToResult<TTableName, TSelection, TJoinedName, TJoinedTable extends AnySQLiteTable ? TJoinedTable['_']['columns'] : TJoinedTable extends Subquery | View ? Assume<TJoinedTable['_']['selectedFields'], SelectedFields> : never, TSelectMode>, TSelectMode extends 'partial' ? TSelectMode : 'multiple', AppendToNullabilityMap<TNullabilityMap, TJoinedName, TJoinType>>;
type SelectedFieldsFlat = SelectedFieldsFlat$1<AnySQLiteColumn>;
type SelectedFields = SelectedFields$1<AnySQLiteColumn, AnySQLiteTable>;
type SelectedFieldsOrdered = SelectedFieldsOrdered$1<AnySQLiteColumn>;
interface SQLiteSelectHKTBase {
    tableName: string | undefined;
    resultType: 'sync' | 'async';
    runResult: unknown;
    selection: unknown;
    selectMode: SelectMode;
    nullabilityMap: unknown;
    _type: unknown;
}
type SQLiteSelectKind<T extends SQLiteSelectHKTBase, TTableName extends string | undefined, TResultType extends 'sync' | 'async', TRunResult, TSelection, TSelectMode extends SelectMode, TNullabilityMap extends Record<string, JoinNullability>> = (T & {
    tableName: TTableName;
    resultType: TResultType;
    runResult: TRunResult;
    selection: TSelection;
    selectMode: TSelectMode;
    nullabilityMap: TNullabilityMap;
})['_type'];
interface SQLiteSelectQueryBuilderHKT extends SQLiteSelectHKTBase {
    _type: SQLiteSelectQueryBuilder<this, this['tableName'], this['resultType'], this['runResult'], Assume<this['selection'], ColumnsSelection>, this['selectMode'], Assume<this['nullabilityMap'], Record<string, JoinNullability>>>;
}
interface SQLiteSelectHKT extends SQLiteSelectHKTBase {
    _type: SQLiteSelect<this['tableName'], this['resultType'], this['runResult'], Assume<this['selection'], ColumnsSelection>, this['selectMode'], Assume<this['nullabilityMap'], Record<string, JoinNullability>>>;
}

declare abstract class Batch<TDatabase, TStatement> {
    abstract registerQuery(client: TDatabase, preparedStatement: TStatement): Promise<unknown>;
    abstract run(): Promise<void>;
}
interface PreparedQueryConfig {
    type: 'sync' | 'async';
    run: unknown;
    runBatch: unknown[];
    all: unknown[];
    get: unknown;
    values: unknown[][];
}
declare abstract class PreparedQuery<T extends PreparedQueryConfig> {
    abstract run(placeholderValues?: Record<string, unknown>): Result<T['type'], T['run']>;
    runInBatch(_batch: Batch<unknown, unknown>, _placeholderValues?: Record<string, unknown>): Result<T['type'], T['runBatch']>;
    abstract all(placeholderValues?: Record<string, unknown>): Result<T['type'], T['all']>;
    abstract get(placeholderValues?: Record<string, unknown>): Result<T['type'], T['get']>;
    abstract values(placeholderValues?: Record<string, unknown>): Result<T['type'], T['values']>;
}
interface SQLiteTransactionConfig {
    behavior?: 'deferred' | 'immediate' | 'exclusive';
}
declare abstract class SQLiteSession<TResultKind extends 'sync' | 'async', TRunResult, TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> {
    constructor(
    /** @internal */
    dialect: {
        sync: SQLiteSyncDialect;
        async: SQLiteAsyncDialect;
    }[TResultKind]);
    abstract prepareQuery(query: Query, fields: SelectedFieldsOrdered | undefined, customResultMapper?: (rows: unknown[][], mapColumnValue?: (value: unknown) => unknown) => unknown): PreparedQuery<PreparedQueryConfig & {
        type: TResultKind;
    }>;
    prepareOneTimeQuery(query: Query, fields: SelectedFieldsOrdered | undefined): PreparedQuery<PreparedQueryConfig & {
        type: TResultKind;
    }>;
    abstract transaction<T>(transaction: (tx: SQLiteTransaction<TResultKind, TRunResult, TFullSchema, TSchema>) => Result<TResultKind, T>, config?: SQLiteTransactionConfig): Result<TResultKind, T>;
    run(query: SQL): Result<TResultKind, TRunResult>;
    all<T = unknown>(query: SQL): Result<TResultKind, T[]>;
    get<T = unknown>(query: SQL): Result<TResultKind, T>;
    values<T extends any[] = unknown[]>(query: SQL): Result<TResultKind, T[]>;
}
interface ResultHKT {
    readonly $brand: 'SQLiteResultHKT';
    readonly config: unknown;
    readonly type: unknown;
}
interface SyncResultHKT extends ResultHKT {
    readonly type: this['config'];
}
interface AsyncResultHKT extends ResultHKT {
    readonly type: Promise<this['config']>;
}
type Result<TKind extends 'sync' | 'async', TResult> = (('sync' extends TKind ? SyncResultHKT : AsyncResultHKT) & {
    readonly config: TResult;
})['type'];
declare abstract class SQLiteTransaction<TResultType extends 'sync' | 'async', TRunResult, TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig> extends BaseSQLiteDatabase<TResultType, TRunResult, TFullSchema, TSchema> {
    protected schema: {
        fullSchema: Record<string, unknown>;
        schema: TSchema;
        tableNamesMap: Record<string, string>;
    } | undefined;
    protected readonly nestedIndex: number;
    constructor(resultType: TResultType, dialect: {
        sync: SQLiteSyncDialect;
        async: SQLiteAsyncDialect;
    }[TResultType], session: SQLiteSession<TResultType, TRunResult, TFullSchema, TSchema>, schema: {
        fullSchema: Record<string, unknown>;
        schema: TSchema;
        tableNamesMap: Record<string, string>;
    } | undefined, nestedIndex?: number);
    rollback(): never;
}

interface SQLiteDeleteConfig {
    where?: SQL | undefined;
    table: AnySQLiteTable;
    returning?: SelectedFieldsOrdered;
}
interface SQLiteDelete<TTable extends AnySQLiteTable, TResultType extends 'sync' | 'async', TRunResult, TReturning = undefined> extends SQLWrapper {
}
declare class SQLiteDelete<TTable extends AnySQLiteTable, TResultType extends 'sync' | 'async', TRunResult, TReturning = undefined> implements SQLWrapper {
    private table;
    private session;
    private dialect;
    private config;
    constructor(table: TTable, session: SQLiteSession<any, any, any, any>, dialect: SQLiteDialect);
    where(where: SQL | undefined): Omit<this, 'where'>;
    returning(): Omit<SQLiteDelete<TTable, TResultType, TRunResult, InferModel<TTable>>, 'where' | 'returning'>;
    returning<TSelectedFields extends SelectedFieldsFlat>(fields: TSelectedFields): Omit<SQLiteDelete<TTable, TResultType, TRunResult, SelectResultFields<TSelectedFields>>, 'where' | 'returning'>;
    toSQL(): Omit<Query, 'typings'>;
    prepare(isOneTimeQuery?: boolean): PreparedQuery<{
        type: TResultType;
        run: TRunResult;
        runBatch: TReturning[];
        all: TReturning extends undefined ? never : TReturning[];
        get: TReturning extends undefined ? never : TReturning | undefined;
        values: TReturning extends undefined ? never : any[][];
    }>;
    run: ReturnType<this['prepare']>['run'];
    runInBatch: ReturnType<this['prepare']>['runInBatch'];
    all: ReturnType<this['prepare']>['all'];
    get: ReturnType<this['prepare']>['get'];
    values: ReturnType<this['prepare']>['values'];
}

interface SQLiteUpdateConfig {
    where?: SQL | undefined;
    set: UpdateSet;
    table: AnySQLiteTable;
    returning?: SelectedFieldsOrdered;
}
type SQLiteUpdateSetSource<TTable extends AnySQLiteTable> = Simplify<{
    [Key in keyof TTable['_']['columns']]?: GetColumnData<TTable['_']['columns'][Key], 'query'> | SQL;
}>;
declare class SQLiteUpdateBuilder<TTable extends AnySQLiteTable, TResultType extends 'sync' | 'async', TRunResult> {
    protected table: TTable;
    protected session: SQLiteSession<any, any, any, any>;
    protected dialect: SQLiteDialect;
    readonly _: {
        readonly table: TTable;
    };
    constructor(table: TTable, session: SQLiteSession<any, any, any, any>, dialect: SQLiteDialect);
    set(values: SQLiteUpdateSetSource<TTable>): SQLiteUpdate<TTable, TResultType, TRunResult>;
}
interface SQLiteUpdate<TTable extends AnySQLiteTable, TResultType extends 'sync' | 'async', TRunResult, TReturning = undefined> extends SQLWrapper {
}
declare class SQLiteUpdate<TTable extends AnySQLiteTable, TResultType extends 'sync' | 'async', TRunResult, TReturning = undefined> implements SQLWrapper {
    private session;
    private dialect;
    readonly _: {
        readonly table: TTable;
    };
    private config;
    constructor(table: TTable, set: UpdateSet, session: SQLiteSession<any, any, any, any>, dialect: SQLiteDialect);
    where(where: SQL | undefined): Omit<this, 'where'>;
    returning(): Omit<SQLiteUpdate<TTable, TResultType, TRunResult, InferModel<TTable>>, 'where' | 'returning'>;
    returning<TSelectedFields extends SelectedFields>(fields: TSelectedFields): Omit<SQLiteUpdate<TTable, TResultType, TRunResult, SelectResultFields<TSelectedFields>>, 'where' | 'returning'>;
    toSQL(): Omit<Query, 'typings'>;
    prepare(isOneTimeQuery?: boolean): PreparedQuery<{
        type: TResultType;
        run: TRunResult;
        runBatch: TReturning[];
        all: TReturning extends undefined ? never : TReturning[];
        get: TReturning extends undefined ? never : TReturning;
        values: TReturning extends undefined ? never : any[][];
    }>;
    run: ReturnType<this['prepare']>['run'];
    runInBatch: ReturnType<this['prepare']>['runInBatch'];
    all: ReturnType<this['prepare']>['all'];
    get: ReturnType<this['prepare']>['get'];
    values: ReturnType<this['prepare']>['values'];
}

interface SQLiteInsertConfig<TTable extends AnySQLiteTable = AnySQLiteTable> {
    table: TTable;
    values: Record<string, Param | SQL>[];
    onConflict?: SQL;
    returning?: SelectedFieldsOrdered;
}
type SQLiteInsertValue<TTable extends AnySQLiteTable> = Simplify<{
    [Key in keyof InferModel<TTable, 'insert'>]: InferModel<TTable, 'insert'>[Key] | SQL | Placeholder;
}>;
declare class SQLiteInsertBuilder<TTable extends AnySQLiteTable, TResultType extends 'sync' | 'async', TRunResult> {
    protected table: TTable;
    protected session: SQLiteSession<any, any, any, any>;
    protected dialect: SQLiteDialect;
    constructor(table: TTable, session: SQLiteSession<any, any, any, any>, dialect: SQLiteDialect);
    values(value: SQLiteInsertValue<TTable>): SQLiteInsert<TTable, TResultType, TRunResult>;
    values(values: SQLiteInsertValue<TTable>[]): SQLiteInsert<TTable, TResultType, TRunResult>;
}
interface SQLiteInsert<TTable extends AnySQLiteTable, TResultType extends 'sync' | 'async', TRunResult, TReturning = undefined> extends SQLWrapper {
}
declare class SQLiteInsert<TTable extends AnySQLiteTable, TResultType extends 'sync' | 'async', TRunResult, TReturning = undefined> implements SQLWrapper {
    private session;
    private dialect;
    readonly _: {
        readonly table: TTable;
        readonly resultType: TResultType;
        readonly runResult: TRunResult;
        readonly returning: TReturning;
    };
    private config;
    constructor(table: TTable, values: SQLiteInsertConfig['values'], session: SQLiteSession<any, any, any, any>, dialect: SQLiteDialect);
    returning(): Omit<SQLiteInsert<TTable, TResultType, TRunResult, InferModel<TTable>>, 'returning' | `onConflict${string}`>;
    returning<TSelectedFields extends SelectedFieldsFlat>(fields: TSelectedFields): Omit<SQLiteInsert<TTable, TResultType, TRunResult, SelectResultFields<TSelectedFields>>, 'returning' | `onConflict${string}`>;
    onConflictDoNothing(config?: {
        target?: IndexColumn | IndexColumn[];
        where?: SQL;
    }): this;
    onConflictDoUpdate(config: {
        target: IndexColumn | IndexColumn[];
        where?: SQL;
        set: SQLiteUpdateSetSource<TTable>;
    }): this;
    toSQL(): Simplify<Omit<Query, 'typings'>>;
    prepare(isOneTimeQuery?: boolean): PreparedQuery<{
        type: TResultType;
        run: TRunResult;
        runBatch: TReturning[];
        all: TReturning extends undefined ? never : TReturning[];
        get: TReturning extends undefined ? never : TReturning;
        values: TReturning extends undefined ? never : any[][];
    }>;
    run: ReturnType<this['prepare']>['run'];
    runInBatch: ReturnType<this['prepare']>['runInBatch'];
    all: ReturnType<this['prepare']>['all'];
    get: ReturnType<this['prepare']>['get'];
    values: ReturnType<this['prepare']>['values'];
}

declare class QueryBuilder {
    private dialect;
    $with<TAlias extends string>(alias: TAlias): {
        as<TSelection extends ColumnsSelection>(qb: TypedQueryBuilder<TSelection, unknown> | ((qb: QueryBuilder) => TypedQueryBuilder<TSelection, unknown>)): WithSubqueryWithSelection<TSelection, TAlias>;
    };
    with(...queries: WithSubquery[]): {
        select: {
            (): SQLiteSelectBuilder<undefined, 'sync', void, 'qb'>;
            <TSelection extends SelectedFields>(fields: TSelection): SQLiteSelectBuilder<TSelection, "sync", void, "qb">;
        };
    };
    select(): SQLiteSelectBuilder<undefined, 'sync', void, 'qb'>;
    select<TSelection extends SelectedFields>(fields: TSelection): SQLiteSelectBuilder<TSelection, 'sync', void, 'qb'>;
    private getDialect;
}

declare abstract class SQLiteDialect {
    escapeName(name: string): string;
    escapeParam(_num: number): string;
    escapeString(str: string): string;
    buildDeleteQuery({ table, where, returning }: SQLiteDeleteConfig): SQL;
    buildUpdateSet(table: AnySQLiteTable, set: UpdateSet): SQL;
    buildUpdateQuery({ table, set, where, returning }: SQLiteUpdateConfig): SQL;
    /**
     * Builds selection SQL with provided fields/expressions
     *
     * Examples:
     *
     * `select <selection> from`
     *
     * `insert ... returning <selection>`
     *
     * If `isSingleTable` is true, then columns won't be prefixed with table name
     */
    private buildSelection;
    buildSelectQuery({ withList, fields, fieldsFlat, where, having, table, joins, orderBy, groupBy, limit, offset }: SQLiteSelectConfig): SQL;
    buildInsertQuery({ table, values, onConflict, returning }: SQLiteInsertConfig): SQL;
    sqlToQuery(sql: SQL): Query;
    buildRelationalQuery(fullSchema: Record<string, unknown>, schema: TablesRelationalConfig, tableNamesMap: Record<string, string>, table: AnySQLiteTable, tableConfig: TableRelationalConfig, config: true | DBQueryConfig<'many', true>, tableAlias: string, relationColumns: AnyColumn[], isRoot?: boolean): BuildRelationalQueryResult;
}
declare class SQLiteSyncDialect extends SQLiteDialect {
    migrate(migrations: MigrationMeta[], session: SQLiteSession<'sync', unknown, Record<string, unknown>, TablesRelationalConfig>): void;
}
declare class SQLiteAsyncDialect extends SQLiteDialect {
    migrate(migrations: MigrationMeta[], session: SQLiteSession<'async', unknown, Record<string, unknown>, TablesRelationalConfig>): Promise<void>;
}

declare class AsyncRelationalQueryBuilder<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig, TFields extends TableRelationalConfig> {
    private fullSchema;
    private schema;
    private tableNamesMap;
    private table;
    private tableConfig;
    private dialect;
    private session;
    constructor(fullSchema: Record<string, unknown>, schema: TSchema, tableNamesMap: Record<string, string>, table: AnySQLiteTable, tableConfig: TableRelationalConfig, dialect: SQLiteDialect, session: SQLiteSession<'async', unknown, TFullSchema, TSchema>);
    findMany<TConfig extends DBQueryConfig<'many', true, TSchema, TFields>>(config?: KnownKeysOnly<TConfig, DBQueryConfig<'many', true, TSchema, TFields>>): SQLiteAsyncRelationalQuery<BuildQueryResult<TSchema, TFields, TConfig>[]>;
    findFirst<TSelection extends Omit<DBQueryConfig<'many', true, TSchema, TFields>, 'limit'>>(config?: KnownKeysOnly<TSelection, Omit<DBQueryConfig<'many', true, TSchema, TFields>, 'limit'>>): SQLiteAsyncRelationalQuery<BuildQueryResult<TSchema, TFields, TSelection> | undefined>;
}
declare class SyncRelationalQueryBuilder<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig, TFields extends TableRelationalConfig> {
    private fullSchema;
    private schema;
    private tableNamesMap;
    private table;
    private tableConfig;
    private dialect;
    private session;
    constructor(fullSchema: Record<string, unknown>, schema: TSchema, tableNamesMap: Record<string, string>, table: AnySQLiteTable, tableConfig: TableRelationalConfig, dialect: SQLiteDialect, session: SQLiteSession<'sync', unknown, TFullSchema, TSchema>);
    prepareFindMany<TConfig extends DBQueryConfig<'many', true, TSchema, TFields>>(config?: KnownKeysOnly<TConfig, DBQueryConfig<'many', true, TSchema, TFields>>): {
        execute: PreparedQuery<PreparedQueryConfig & {
            type: 'sync';
            all: BuildQueryResult<TSchema, TFields, TConfig>[];
        }>['all'];
    };
    findMany<TConfig extends DBQueryConfig<'many', true, TSchema, TFields>>(config?: KnownKeysOnly<TConfig, DBQueryConfig<'many', true, TSchema, TFields>>): BuildQueryResult<TSchema, TFields, TConfig>[];
    prepareFindFirst<TConfig extends DBQueryConfig<'many', true, TSchema, TFields>>(config?: KnownKeysOnly<TConfig, DBQueryConfig<'many', true, TSchema, TFields>>): {
        execute: PreparedQuery<PreparedQueryConfig & {
            type: 'sync';
            get: BuildQueryResult<TSchema, TFields, TConfig> | undefined;
        }>['get'];
    };
    findFirst<TSelection extends Omit<DBQueryConfig<'many', true, TSchema, TFields>, 'limit'>>(config?: KnownKeysOnly<TSelection, Omit<DBQueryConfig<'many', true, TSchema, TFields>, 'limit'>>): BuildQueryResult<TSchema, TFields, TSelection> | undefined;
}
declare class SQLiteRelationalQuery<TResultKind extends 'sync' | 'async', TResult> {
    private fullSchema;
    private schema;
    private tableNamesMap;
    private table;
    private tableConfig;
    private dialect;
    private session;
    private config;
    private mode;
    protected $brand: 'SQLiteRelationalQuery';
    constructor(fullSchema: Record<string, unknown>, schema: TablesRelationalConfig, tableNamesMap: Record<string, string>, table: AnySQLiteTable, tableConfig: TableRelationalConfig, dialect: SQLiteDialect, session: SQLiteSession<TResultKind, unknown, Record<string, unknown>, TablesRelationalConfig>, config: DBQueryConfig<'many', true> | true, mode: 'many' | 'first');
    prepare(): PreparedQuery<PreparedQueryConfig & {
        type: TResultKind;
        all: TResult;
        get: TResult;
    }>;
    execute(): Result<TResultKind, TResult>;
}
interface SQLiteAsyncRelationalQuery<TResult> extends SQLiteRelationalQuery<'async', TResult>, QueryPromise<TResult> {
}

declare class BaseSQLiteDatabase<TResultKind extends 'sync' | 'async', TRunResult, TFullSchema extends Record<string, unknown> = Record<string, never>, TSchema extends TablesRelationalConfig = ExtractTablesWithRelations<TFullSchema>> {
    readonly _: {
        readonly schema: TSchema | undefined;
        readonly tableNamesMap: Record<string, string>;
    };
    query: {
        [K in keyof TSchema]: TResultKind extends 'async' ? AsyncRelationalQueryBuilder<TFullSchema, TSchema, TSchema[K]> : SyncRelationalQueryBuilder<TFullSchema, TSchema, TSchema[K]>;
    };
    constructor(resultKind: TResultKind, 
    /** @internal */
    dialect: {
        sync: SQLiteSyncDialect;
        async: SQLiteAsyncDialect;
    }[TResultKind], 
    /** @internal */
    session: SQLiteSession<TResultKind, TRunResult, TFullSchema, TSchema>, schema: RelationalSchemaConfig<TSchema> | undefined);
    $with<TAlias extends string>(alias: TAlias): {
        as<TSelection extends ColumnsSelection>(qb: TypedQueryBuilder<TSelection, unknown> | ((qb: QueryBuilder) => TypedQueryBuilder<TSelection, unknown>)): WithSubqueryWithSelection<TSelection, TAlias>;
    };
    with(...queries: WithSubquery[]): {
        select: {
            (): SQLiteSelectBuilder<undefined, TResultKind, TRunResult>;
            <TSelection extends SelectedFields>(fields: TSelection): SQLiteSelectBuilder<TSelection, TResultKind, TRunResult, "db">;
        };
    };
    select(): SQLiteSelectBuilder<undefined, TResultKind, TRunResult>;
    select<TSelection extends SelectedFields>(fields: TSelection): SQLiteSelectBuilder<TSelection, TResultKind, TRunResult>;
    update<TTable extends AnySQLiteTable>(table: TTable): SQLiteUpdateBuilder<TTable, TResultKind, TRunResult>;
    insert<TTable extends AnySQLiteTable>(into: TTable): SQLiteInsertBuilder<TTable, TResultKind, TRunResult>;
    delete<TTable extends AnySQLiteTable>(from: TTable): SQLiteDelete<TTable, TResultKind, TRunResult>;
    run(query: SQLWrapper): Result<TResultKind, TRunResult>;
    all<T = unknown>(query: SQLWrapper): Result<TResultKind, T[]>;
    get<T = unknown>(query: SQLWrapper): Result<TResultKind, T>;
    values<T extends unknown[] = unknown[]>(query: SQLWrapper): Result<TResultKind, T[]>;
    transaction<T>(transaction: (tx: SQLiteTransaction<TResultKind, TRunResult, TFullSchema, TSchema>) => Result<TResultKind, T>, config?: SQLiteTransactionConfig): Result<TResultKind, T>;
}

export { JoinFn as $, AnySQLiteTable as A, BaseSQLiteDatabase as B, Check as C, IndexBuilder as D, index as E, ForeignKey as F, uniqueIndex as G, primaryKey as H, Index as I, PrimaryKeyBuilder as J, SQLiteDeleteConfig as K, SQLiteDelete as L, SQLiteInsertConfig as M, SQLiteInsertValue as N, SQLiteInsertBuilder as O, PreparedQuery as P, SQLiteInsert as Q, ReferenceConfig as R, SQLiteSession as S, QueryBuilder as T, UpdateDeleteAction as U, SQLiteSelectBuilder as V, SQLiteSelectQueryBuilder as W, SQLiteSelect as X, JoinsValue as Y, AnySQLiteSelect as Z, SQLiteSelectConfig as _, SQLiteSyncDialect as a, SelectedFieldsFlat as a0, SelectedFields as a1, SQLiteSelectHKTBase as a2, SQLiteSelectKind as a3, SQLiteSelectQueryBuilderHKT as a4, SQLiteSelectHKT as a5, SQLiteUpdateConfig as a6, SQLiteUpdateSetSource as a7, SQLiteUpdateBuilder as a8, SQLiteUpdate as a9, Result as aa, SubqueryWithSelection as ab, WithSubqueryWithSelection as ac, SQLiteTableExtraConfig as ad, TableConfig as ae, SQLiteTable as af, SQLiteTableWithColumns as ag, SQLiteTableFn as ah, sqliteTable as ai, sqliteTableCreator as aj, ViewBuilderConfig as ak, ViewBuilderCore as al, ViewBuilder as am, ManualViewBuilder as an, SQLiteViewConfig as ao, SQLiteViewWithSelection as ap, sqliteView as aq, view as ar, SelectedFieldsOrdered as b, SQLiteTransactionConfig as c, SQLiteTransaction as d, PreparedQueryConfig as e, Batch as f, SQLiteAsyncDialect as g, SQLiteColumnBuilder as h, SQLiteColumn as i, AnySQLiteColumn as j, PrimaryKey as k, SQLiteView as l, SQLiteViewBase as m, BuildAliasTable as n, CheckBuilder as o, check as p, SQLiteColumnBuilderHKT as q, SQLiteColumnHKT as r, AnySQLiteColumnBuilder as s, SQLiteDialect as t, Reference as u, ForeignKeyBuilder as v, foreignKey as w, IndexConfig as x, IndexColumn as y, IndexBuilderOn as z };
