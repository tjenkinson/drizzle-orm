import { a as SQL, n as ColumnBuilderHKTBase, ay as Assume, k as ColumnBuilderBaseConfig, c as ColumnHKTBase, C as ColumnBaseConfig, r as ColumnBuilder, av as Update, f as Column, g as AnyColumnHKT, ak as TableConfig$1, T as Table, al as UpdateTableConfig, ao as AnyTableHKT, u as BuildColumns, B as BuildColumn, s as AnyColumnBuilder, aL as ColumnsSelection, V as View, ah as Subquery, ai as WithSubquery, aB as ValueOrArray, ad as Placeholder, S as Simplify, Q as Query, an as AnyTable, z as SelectedFieldsFlat$1, F as SelectedFields$1, H as SelectedFieldsOrdered$1, Y as SQLWrapper, I as InferModel, at as UpdateSet, G as GetColumnData, a9 as Param, a3 as DriverValueEncoder, X as QueryTypingsValue, A as AnyColumn, aI as KnownKeysOnly } from './column.d-66a08b85.js';
import { MigrationMeta } from './migrator.js';
import { Q as QueryPromise, T as TablesRelationalConfig, K as TableRelationalConfig, J as DBQueryConfig, a2 as BuildRelationalQueryResult, U as BuildQueryResult, L as ExtractTablesWithRelations, R as RelationalSchemaConfig } from './query-promise.d-d7b61248.js';
import { T as TypedQueryBuilder, A as AddAliasToSelection, G as GetSelectTableName, a as GetSelectTableSelection, S as SelectMode, J as JoinNullability, B as BuildSubquerySelection, b as SelectResult, c as JoinType, M as MapColumnsToTableAlias, d as AppendToResult, e as AppendToNullabilityMap, f as SelectResultFields } from './select.types.d-1bd49d37.js';

declare class CheckBuilder {
    name: string;
    value: SQL;
    protected brand: 'PgConstraintBuilder';
    constructor(name: string, value: SQL);
}
declare class Check {
    table: AnyPgTable;
    readonly name: string;
    readonly value: SQL;
    constructor(table: AnyPgTable, builder: CheckBuilder);
}
declare function check(name: string, value: SQL): CheckBuilder;

type UpdateDeleteAction = 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
type Reference = () => {
    readonly columns: AnyPgColumn[];
    readonly foreignTable: AnyPgTable;
    readonly foreignColumns: AnyPgColumn[];
};
declare class ForeignKeyBuilder {
    constructor(config: () => {
        columns: AnyPgColumn[];
        foreignColumns: AnyPgColumn[];
    }, actions?: {
        onUpdate?: UpdateDeleteAction;
        onDelete?: UpdateDeleteAction;
    } | undefined);
    onUpdate(action: UpdateDeleteAction): this;
    onDelete(action: UpdateDeleteAction): this;
}
type AnyForeignKeyBuilder = ForeignKeyBuilder;
declare class ForeignKey {
    readonly table: AnyPgTable;
    readonly reference: Reference;
    readonly onUpdate: UpdateDeleteAction | undefined;
    readonly onDelete: UpdateDeleteAction | undefined;
    constructor(table: AnyPgTable, builder: ForeignKeyBuilder);
    getName(): string;
}
type ColumnsWithTable<TTableName extends string, TColumns extends AnyPgColumn[]> = {
    [Key in keyof TColumns]: AnyPgColumn<{
        tableName: TTableName;
    }>;
};
declare function foreignKey<TTableName extends string, TForeignTableName extends string, TColumns extends [AnyPgColumn<{
    tableName: TTableName;
}>, ...AnyPgColumn<{
    tableName: TTableName;
}>[]]>(config: {
    columns: TColumns;
    foreignColumns: ColumnsWithTable<TForeignTableName, TColumns>;
}): ForeignKeyBuilder;

interface ReferenceConfig {
    ref: () => AnyPgColumn;
    actions: {
        onUpdate?: UpdateDeleteAction;
        onDelete?: UpdateDeleteAction;
    };
}
interface PgColumnBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgColumnBuilder<PgColumnBuilderHKT, Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgColumnHKT;
}
interface PgColumnHKT extends ColumnHKTBase {
    _type: PgColumn<PgColumnHKT, Assume<this['config'], ColumnBaseConfig>>;
}
declare abstract class PgColumnBuilder<THKT extends ColumnBuilderHKTBase, T extends ColumnBuilderBaseConfig, TRuntimeConfig extends object = {}, TTypeConfig extends object = {}> extends ColumnBuilder<THKT, T, TRuntimeConfig, TTypeConfig & {
    pgBrand: 'PgColumnBuilder';
}> {
    private foreignKeyConfigs;
    array(size?: number): PgArrayBuilder<{
        name: NonNullable<T['name']>;
        notNull: NonNullable<T['notNull']>;
        hasDefault: NonNullable<T['hasDefault']>;
        data: T['data'][];
        driverParam: T['driverParam'][] | string;
    }>;
    references(ref: ReferenceConfig['ref'], actions?: ReferenceConfig['actions']): this;
}
type AnyPgColumnBuilder<TPartial extends Partial<ColumnBuilderBaseConfig> = {}> = PgColumnBuilder<PgColumnBuilderHKT, Required<Update<ColumnBuilderBaseConfig, TPartial>>>;
declare abstract class PgColumn<THKT extends ColumnHKTBase, T extends ColumnBaseConfig, TRuntimeConfig extends object = {}, TTypeConfig extends object = {}> extends Column<THKT, T, TRuntimeConfig, TTypeConfig & {
    pgBrand: 'PgColumn';
}> {
}
type AnyPgColumn<TPartial extends Partial<ColumnBaseConfig> = {}> = PgColumn<PgColumnHKT, Required<Update<ColumnBaseConfig, TPartial>>>;
interface AnyPgColumnHKT extends AnyColumnHKT {
    type: AnyPgColumn<Assume<this['config'], Partial<ColumnBaseConfig>>>;
}

interface IndexConfig {
    name?: string;
    columns: IndexColumn[];
    /**
     * If true, the index will be created as `create unique index` instead of `create index`.
     */
    unique: boolean;
    /**
     * If true, the index will be created as `create index concurrently` instead of `create index`.
     */
    concurrently?: boolean;
    /**
     * If true, the index will be created as `create index ... on only <table>` instead of `create index ... on <table>`.
     */
    only: boolean;
    /**
     * If set, the index will be created as `create index ... using <method>`.
     */
    using?: SQL;
    /**
     * If set, the index will be created as `create index ... asc | desc`.
     */
    order?: 'asc' | 'desc';
    /**
     * If set, adds `nulls first` or `nulls last` to the index.
     */
    nulls?: 'first' | 'last';
    /**
     * Condition for partial index.
     */
    where?: SQL;
}
type IndexColumn = AnyPgColumn;
declare class IndexBuilderOn {
    private unique;
    private name?;
    constructor(unique: boolean, name?: string | undefined);
    on(...columns: [IndexColumn, ...IndexColumn[]]): IndexBuilder;
    onOnly(...columns: [IndexColumn, ...IndexColumn[]]): IndexBuilder;
}
interface AnyIndexBuilder {
    build(table: AnyPgTable): Index;
}
interface IndexBuilder extends AnyIndexBuilder {
}
declare class IndexBuilder implements AnyIndexBuilder {
    constructor(columns: IndexColumn[], unique: boolean, only: boolean, name?: string);
    concurrently(): this;
    using(method: SQL): this;
    asc(): Omit<this, 'asc' | 'desc'>;
    desc(): Omit<this, 'asc' | 'desc'>;
    nullsFirst(): Omit<this, 'nullsFirst' | 'nullsLast'>;
    nullsLast(): Omit<this, 'nullsFirst' | 'nullsLast'>;
    where(condition: SQL): Omit<this, 'where'>;
}
declare class Index {
    readonly config: IndexConfig & {
        table: AnyPgTable;
    };
    constructor(config: IndexConfig, table: AnyPgTable);
}
type GetColumnsTableName<TColumns> = TColumns extends AnyPgColumn ? TColumns['_']['name'] : TColumns extends AnyPgColumn[] ? TColumns[number]['_']['name'] : never;
declare function index(name?: string): IndexBuilderOn;
declare function uniqueIndex(name?: string): IndexBuilderOn;

declare function primaryKey<TTableName extends string, TColumns extends AnyPgColumn<{
    tableName: TTableName;
}>[]>(...columns: TColumns): PrimaryKeyBuilder;
declare class PrimaryKeyBuilder {
    constructor(columns: AnyPgColumn[]);
}
declare class PrimaryKey {
    readonly table: AnyPgTable;
    readonly columns: AnyPgColumn<{}>[];
    constructor(table: AnyPgTable, columns: AnyPgColumn<{}>[]);
    getName(): string;
}

type PgTableExtraConfig = Record<string, AnyIndexBuilder | CheckBuilder | ForeignKeyBuilder | PrimaryKeyBuilder>;
type TableConfig = TableConfig$1<AnyPgColumn>;
declare class PgTable<T extends TableConfig> extends Table<T> {
}
type AnyPgTable<TPartial extends Partial<TableConfig> = {}> = PgTable<UpdateTableConfig<TableConfig, TPartial>>;
interface AnyPgTableHKT extends AnyTableHKT {
    type: AnyPgTable<Assume<this['config'], Partial<TableConfig>>>;
}
type PgTableWithColumns<T extends TableConfig> = PgTable<T> & {
    [Key in keyof T['columns']]: T['columns'][Key];
};
interface PgTableFn<TSchema extends string | undefined = undefined> {
    <TTableName extends string, TColumnsMap extends Record<string, AnyPgColumnBuilder>>(name: TTableName, columns: TColumnsMap, extraConfig?: (self: BuildColumns<TTableName, TColumnsMap>) => PgTableExtraConfig): PgTableWithColumns<{
        name: TTableName;
        schema: TSchema;
        columns: BuildColumns<TTableName, TColumnsMap>;
    }>;
}
declare const pgTable: PgTableFn;
declare function pgTableCreator(customizeTableName: (name: string) => string): PgTableFn;

interface PgArrayBuilderHKT extends ColumnBuilderHKTBase {
    _type: PgArrayBuilder<Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: PgArrayHKT;
}
interface PgArrayHKT extends ColumnHKTBase {
    _type: PgArray<Assume<this['config'], ColumnBaseConfig>>;
}
declare class PgArrayBuilder<T extends ColumnBuilderBaseConfig> extends PgColumnBuilder<PgArrayBuilderHKT, T, {
    baseBuilder: PgColumnBuilder<PgColumnBuilderHKT, {
        name: T['name'];
        notNull: T['notNull'];
        hasDefault: T['hasDefault'];
        data: Assume<T['data'], unknown[]>[number];
        driverParam: string | Assume<T['driverParam'], unknown[]>[number];
    }>;
    size: number | undefined;
}> {
    constructor(name: string, baseBuilder: PgArrayBuilder<T>['config']['baseBuilder'], size: number | undefined);
}
declare class PgArray<T extends ColumnBaseConfig> extends PgColumn<PgArrayHKT, T, {}, {
    baseColumn: BuildColumn<string, Assume<PgColumnBuilder<PgColumnBuilderHKT, {
        name: T['name'];
        notNull: T['notNull'];
        hasDefault: T['hasDefault'];
        data: Assume<T['data'], unknown[]>[number];
        driverParam: string | Assume<T['driverParam'], unknown[]>[number];
    }>, AnyColumnBuilder>>;
}> {
    readonly baseColumn: AnyPgColumn;
    readonly range?: [number | undefined, number | undefined] | undefined;
    protected $pgColumnBrand: 'PgArray';
    readonly size: number | undefined;
    constructor(table: AnyPgTable<{
        name: T['tableName'];
    }>, config: PgArrayBuilder<T>['config'], baseColumn: AnyPgColumn, range?: [number | undefined, number | undefined] | undefined);
    getSQLType(): string;
    mapFromDriverValue(value: unknown[] | string): T['data'];
    mapToDriverValue(value: unknown[], isNestedArray?: boolean): unknown[] | string;
}

interface ViewWithConfig {
    checkOption: 'local' | 'cascaded';
    securityBarrier: boolean;
    securityInvoker: boolean;
}
declare class DefaultViewBuilderCore<TConfig extends {
    name: string;
    columns?: unknown;
}> {
    protected name: TConfig['name'];
    protected schema: string | undefined;
    readonly _: {
        readonly name: TConfig['name'];
        readonly columns: TConfig['columns'];
    };
    constructor(name: TConfig['name'], schema: string | undefined);
    protected config: {
        with?: ViewWithConfig;
    };
    with(config: ViewWithConfig): this;
}
declare class ViewBuilder<TName extends string = string> extends DefaultViewBuilderCore<{
    name: TName;
}> {
    as<TSelectedFields extends SelectedFields>(qb: TypedQueryBuilder<TSelectedFields> | ((qb: QueryBuilder) => TypedQueryBuilder<TSelectedFields>)): PgViewWithSelection<TName, false, AddAliasToSelection<TSelectedFields, TName>>;
}
declare class ManualViewBuilder<TName extends string = string, TColumns extends Record<string, AnyPgColumnBuilder> = Record<string, AnyPgColumnBuilder>> extends DefaultViewBuilderCore<{
    name: TName;
    columns: TColumns;
}> {
    private columns;
    constructor(name: TName, columns: TColumns, schema: string | undefined);
    existing(): PgViewWithSelection<TName, true, BuildColumns<TName, TColumns>>;
    as(query: SQL): PgViewWithSelection<TName, false, BuildColumns<TName, TColumns>>;
}
interface PgMaterializedViewWithConfig {
    [Key: string]: string | number | boolean | SQL;
}
declare class MaterializedViewBuilderCore<TConfig extends {
    name: string;
    columns?: unknown;
}> {
    protected name: TConfig['name'];
    protected schema: string | undefined;
    _: {
        readonly name: TConfig['name'];
        readonly columns: TConfig['columns'];
    };
    constructor(name: TConfig['name'], schema: string | undefined);
    protected config: {
        with?: PgMaterializedViewWithConfig;
        using?: string;
        tablespace?: string;
        withNoData?: boolean;
    };
    using(using: string): this;
    with(config: PgMaterializedViewWithConfig): this;
    tablespace(tablespace: string): this;
    withNoData(): this;
}
declare class MaterializedViewBuilder<TName extends string = string> extends MaterializedViewBuilderCore<{
    name: TName;
}> {
    as<TSelectedFields extends SelectedFields>(qb: TypedQueryBuilder<TSelectedFields> | ((qb: QueryBuilder) => TypedQueryBuilder<TSelectedFields>)): PgMaterializedViewWithSelection<TName, false, AddAliasToSelection<TSelectedFields, TName>>;
}
declare class ManualMaterializedViewBuilder<TName extends string = string, TColumns extends Record<string, AnyPgColumnBuilder> = Record<string, AnyPgColumnBuilder>> extends MaterializedViewBuilderCore<{
    name: TName;
    columns: TColumns;
}> {
    private columns;
    constructor(name: TName, columns: TColumns, schema: string | undefined);
    existing(): PgMaterializedViewWithSelection<TName, true, BuildColumns<TName, TColumns>>;
    as(query: SQL): PgMaterializedViewWithSelection<TName, false, BuildColumns<TName, TColumns>>;
}
declare abstract class PgViewBase<TName extends string = string, TExisting extends boolean = boolean, TSelectedFields extends ColumnsSelection = ColumnsSelection> extends View<TName, TExisting, TSelectedFields> {
    readonly _: View<TName, TExisting, TSelectedFields>['_'] & {
        readonly viewBrand: 'PgViewBase';
    };
}
declare const PgViewConfig: unique symbol;
declare class PgView<TName extends string = string, TExisting extends boolean = boolean, TSelectedFields extends ColumnsSelection = ColumnsSelection> extends PgViewBase<TName, TExisting, TSelectedFields> {
    [PgViewConfig]: {
        with?: ViewWithConfig;
    } | undefined;
    constructor({ pgConfig, config }: {
        pgConfig: {
            with?: ViewWithConfig;
        } | undefined;
        config: {
            name: TName;
            schema: string | undefined;
            selectedFields: SelectedFields;
            query: SQL | undefined;
        };
    });
}
type PgViewWithSelection<TName extends string = string, TExisting extends boolean = boolean, TSelectedFields extends ColumnsSelection = ColumnsSelection> = PgView<TName, TExisting, TSelectedFields> & TSelectedFields;
declare const PgMaterializedViewConfig: unique symbol;
declare class PgMaterializedView<TName extends string = string, TExisting extends boolean = boolean, TSelectedFields extends ColumnsSelection = ColumnsSelection> extends PgViewBase<TName, TExisting, TSelectedFields> {
    readonly [PgMaterializedViewConfig]: {
        readonly with?: PgMaterializedViewWithConfig;
        readonly using?: string;
        readonly tablespace?: string;
        readonly withNoData?: boolean;
    } | undefined;
    constructor({ pgConfig, config }: {
        pgConfig: {
            with: PgMaterializedViewWithConfig | undefined;
            using: string | undefined;
            tablespace: string | undefined;
            withNoData: boolean | undefined;
        } | undefined;
        config: {
            name: TName;
            schema: string | undefined;
            selectedFields: SelectedFields;
            query: SQL | undefined;
        };
    });
}
type PgMaterializedViewWithSelection<TName extends string = string, TExisting extends boolean = boolean, TSelectedFields extends ColumnsSelection = ColumnsSelection> = PgMaterializedView<TName, TExisting, TSelectedFields> & TSelectedFields;
declare function pgView<TName extends string>(name: TName): ViewBuilder<TName>;
declare function pgView<TName extends string, TColumns extends Record<string, AnyPgColumnBuilder>>(name: TName, columns: TColumns): ManualViewBuilder<TName, TColumns>;
declare function pgMaterializedView<TName extends string>(name: TName): MaterializedViewBuilder<TName>;
declare function pgMaterializedView<TName extends string, TColumns extends Record<string, AnyPgColumnBuilder>>(name: TName, columns: TColumns): ManualMaterializedViewBuilder<TName, TColumns>;

type SubqueryWithSelection<TSelection extends ColumnsSelection, TAlias extends string> = Subquery<TAlias, AddAliasToSelection<TSelection, TAlias>> & AddAliasToSelection<TSelection, TAlias>;
type WithSubqueryWithSelection<TSelection extends ColumnsSelection, TAlias extends string> = WithSubquery<TAlias, AddAliasToSelection<TSelection, TAlias>> & AddAliasToSelection<TSelection, TAlias>;

type CreatePgSelectFromBuilderMode<TBuilderMode extends 'db' | 'qb', TTableName extends string | undefined, TSelection extends ColumnsSelection, TSelectMode extends SelectMode> = TBuilderMode extends 'db' ? PgSelect<TTableName, TSelection, TSelectMode> : PgSelectQueryBuilder<PgSelectQueryBuilderHKT, TTableName, TSelection, TSelectMode>;
declare class PgSelectBuilder<TSelection extends SelectedFields | undefined, TBuilderMode extends 'db' | 'qb' = 'db'> {
    private fields;
    private session;
    private dialect;
    private withList;
    constructor(fields: TSelection, session: PgSession | undefined, dialect: PgDialect, withList?: Subquery[]);
    /**
     * Specify the table, subquery, or other target that you’re
     * building a select query against.
     *
     * {@link https://www.postgresql.org/docs/current/sql-select.html#SQL-FROM|Postgres from documentation}
     */
    from<TFrom extends AnyPgTable | Subquery | PgViewBase | SQL>(source: TFrom): CreatePgSelectFromBuilderMode<TBuilderMode, GetSelectTableName<TFrom>, TSelection extends undefined ? GetSelectTableSelection<TFrom> : TSelection, TSelection extends undefined ? 'single' : 'partial'>;
}
declare abstract class PgSelectQueryBuilder<THKT extends PgSelectHKTBase, TTableName extends string | undefined, TSelection extends ColumnsSelection, TSelectMode extends SelectMode, TNullabilityMap extends Record<string, JoinNullability> = TTableName extends string ? Record<TTableName, 'not-null'> : {}> extends TypedQueryBuilder<BuildSubquerySelection<TSelection, TNullabilityMap>, SelectResult<TSelection, TSelectMode, TNullabilityMap>[]> {
    private isPartialSelect;
    protected session: PgSession | undefined;
    protected dialect: PgDialect;
    readonly _: {
        readonly selectMode: TSelectMode;
        readonly selection: TSelection;
        readonly result: SelectResult<TSelection, TSelectMode, TNullabilityMap>[];
        readonly selectedFields: BuildSubquerySelection<TSelection, TNullabilityMap>;
    };
    protected config: PgSelectConfig;
    protected joinsNotNullableMap: Record<string, boolean>;
    private tableName;
    constructor(table: PgSelectConfig['table'], fields: PgSelectConfig['fields'], isPartialSelect: boolean, session: PgSession | undefined, dialect: PgDialect, withList: Subquery[]);
    private createJoin;
    /**
     * For each row of the table, include
     * values from a matching row of the joined
     * table, if there is a matching row. If not,
     * all of the columns of the joined table
     * will be set to null.
     */
    leftJoin: JoinFn<THKT, TTableName, TSelectMode, "left", TSelection, TNullabilityMap>;
    /**
     * Includes all of the rows of the joined table.
     * If there is no matching row in the main table,
     * all the columns of the main table will be
     * set to null.
     */
    rightJoin: JoinFn<THKT, TTableName, TSelectMode, "right", TSelection, TNullabilityMap>;
    /**
     * This is the default type of join.
     *
     * For each row of the table, the joined table
     * needs to have a matching row, or it will
     * be excluded from results.
     */
    innerJoin: JoinFn<THKT, TTableName, TSelectMode, "inner", TSelection, TNullabilityMap>;
    /**
     * Rows from both the main & joined are included,
     * regardless of whether or not they have matching
     * rows in the other table.
     */
    fullJoin: JoinFn<THKT, TTableName, TSelectMode, "full", TSelection, TNullabilityMap>;
    /**
     * Specify a condition to narrow the result set. Multiple
     * conditions can be combined with the `and` and `or`
     * functions.
     *
     * ## Examples
     *
     * ```ts
     * // Find cars made in the year 2000
     * db.select().from(cars).where(eq(cars.year, 2000));
     * ```
     */
    where(where: ((aliases: TSelection) => SQL | undefined) | SQL | undefined): this;
    /**
     * Sets the HAVING clause of this query, which often
     * used with GROUP BY and filters rows after they've been
     * grouped together and combined.
     *
     * {@link https://www.postgresql.org/docs/current/sql-select.html#SQL-HAVING|Postgres having clause documentation}
     */
    having(having: ((aliases: TSelection) => SQL | undefined) | SQL | undefined): this;
    /**
     * Specify the GROUP BY of this query: given
     * a list of columns or SQL expressions, Postgres will
     * combine all rows with the same values in those columns
     * into a single row.
     *
     * ## Examples
     *
     * ```ts
     * // Group and count people by their last names
     * db.select({
     *    lastName: people.lastName,
     *    count: sql<number>`count(*)::integer`
     * }).from(people).groupBy(people.lastName);
     * ```
     *
     * {@link https://www.postgresql.org/docs/current/sql-select.html#SQL-GROUPBY|Postgres GROUP BY documentation}
     */
    groupBy(builder: (aliases: TSelection) => ValueOrArray<AnyPgColumn | SQL | SQL.Aliased>): this;
    groupBy(...columns: (AnyPgColumn | SQL | SQL.Aliased)[]): this;
    /**
     * Specify the ORDER BY clause of this query: a number of
     * columns or SQL expressions that will control sorting
     * of results. You can specify whether results are in ascending
     * or descending order with the `asc()` and `desc()` operators.
     *
     * ## Examples
     *
     * ```
     * // Select cars by year released
     * db.select().from(cars).orderBy(cars.year);
     * ```
     *
     * {@link https://www.postgresql.org/docs/current/sql-select.html#SQL-ORDERBY|Postgres ORDER BY documentation}
     */
    orderBy(builder: (aliases: TSelection) => ValueOrArray<AnyPgColumn | SQL | SQL.Aliased>): this;
    orderBy(...columns: (AnyPgColumn | SQL | SQL.Aliased)[]): this;
    /**
     * Set the maximum number of rows that will be
     * returned by this query.
     *
     * ## Examples
     *
     * ```ts
     * // Get the first 10 people from this query.
     * db.select().from(people).limit(10);
     * ```
     *
     * {@link https://www.postgresql.org/docs/current/sql-select.html#SQL-LIMIT|Postgres LIMIT documentation}
     */
    limit(limit: number | Placeholder): this;
    /**
     * Skip a number of rows when returning results
     * from this query.
     *
     * ## Examples
     *
     * ```ts
     * // Get the 10th-20th people from this query.
     * db.select().from(people).offset(10).limit(10);
     * ```
     */
    offset(offset: number | Placeholder): this;
    /**
     * The FOR clause specifies a lock strength for this query
     * that controls how strictly it acquires exclusive access to
     * the rows being queried.
     *
     * {@link https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE|Postgres locking clause documentation}
     */
    for(strength: LockStrength, config?: LockConfig): this;
    toSQL(): Simplify<Omit<Query, 'typings'>>;
    as<TAlias extends string>(alias: TAlias): SubqueryWithSelection<BuildSubquerySelection<TSelection, TNullabilityMap>, TAlias>;
}
interface PgSelect<TTableName extends string | undefined, TSelection extends ColumnsSelection, TSelectMode extends SelectMode, TNullabilityMap extends Record<string, JoinNullability> = TTableName extends string ? Record<TTableName, 'not-null'> : {}> extends PgSelectQueryBuilder<PgSelectHKT, TTableName, TSelection, TSelectMode, TNullabilityMap>, QueryPromise<SelectResult<TSelection, TSelectMode, TNullabilityMap>[]> {
}
declare class PgSelect<TTableName extends string | undefined, TSelection, TSelectMode extends SelectMode, TNullabilityMap extends Record<string, JoinNullability> = TTableName extends string ? Record<TTableName, 'not-null'> : {}> extends PgSelectQueryBuilder<PgSelectHKT, TTableName, TSelection, TSelectMode, TNullabilityMap> {
    private _prepare;
    /**
     * Create a prepared statement for this query. This allows
     * the database to remember this query for the given session
     * and call it by name, rather than specifying the full query.
     *
     * {@link https://www.postgresql.org/docs/current/sql-prepare.html|Postgres prepare documentation}
     */
    prepare(name: string): PreparedQuery<PreparedQueryConfig & {
        execute: SelectResult<TSelection, TSelectMode, TNullabilityMap>[];
    }>;
    execute: ReturnType<this['prepare']>['execute'];
}

interface JoinsValue {
    on: SQL | undefined;
    table: AnyPgTable | Subquery | PgViewBase | SQL;
    alias: string | undefined;
    joinType: JoinType;
}
type AnyPgSelect = PgSelect<any, any, any, any>;
type BuildAliasTable<TTable extends AnyTable, TAlias extends string> = PgTableWithColumns<Assume<UpdateTableConfig<TTable['_']['config'], {
    name: TAlias;
    columns: MapColumnsToTableAlias<TTable['_']['columns'], TAlias>;
}>, TableConfig>>;
interface PgSelectConfig {
    withList: Subquery[];
    fields: Record<string, unknown>;
    fieldsFlat?: SelectedFieldsOrdered;
    where?: SQL;
    having?: SQL;
    table: AnyPgTable | Subquery | PgViewBase | SQL;
    limit?: number | Placeholder;
    offset?: number | Placeholder;
    joins: JoinsValue[];
    orderBy: (AnyPgColumn | SQL | SQL.Aliased)[];
    groupBy: (AnyPgColumn | SQL | SQL.Aliased)[];
    lockingClauses: {
        strength: LockStrength;
        config: LockConfig;
    }[];
}
type JoinFn<THKT extends PgSelectHKTBase, TTableName extends string | undefined, TSelectMode extends SelectMode, TJoinType extends JoinType, TSelection, TNullabilityMap extends Record<string, JoinNullability>> = <TJoinedTable extends AnyPgTable | Subquery | PgViewBase | SQL, TJoinedName extends GetSelectTableName<TJoinedTable> = GetSelectTableName<TJoinedTable>>(table: TJoinedTable, on: ((aliases: TSelection) => SQL | undefined) | SQL | undefined) => PgSelectKind<THKT, TTableName, AppendToResult<TTableName, TSelection, TJoinedName, TJoinedTable extends Table ? TJoinedTable['_']['columns'] : TJoinedTable extends Subquery ? Assume<TJoinedTable['_']['selectedFields'], SelectedFields> : never, TSelectMode>, TSelectMode extends 'partial' ? TSelectMode : 'multiple', AppendToNullabilityMap<TNullabilityMap, TJoinedName, TJoinType>>;
type SelectedFieldsFlat = SelectedFieldsFlat$1<AnyPgColumn>;
type SelectedFields = SelectedFields$1<AnyPgColumn, AnyPgTable>;
type SelectedFieldsOrdered = SelectedFieldsOrdered$1<AnyPgColumn>;
type LockStrength = 'update' | 'no key update' | 'share' | 'key share';
type LockConfig = {
    of?: AnyPgTable;
} & ({
    noWait: true;
    skipLocked?: undefined;
} | {
    noWait?: undefined;
    skipLocked: true;
} | {
    noWait?: undefined;
    skipLocked?: undefined;
});
interface PgSelectHKTBase {
    tableName: string | undefined;
    selection: unknown;
    selectMode: SelectMode;
    nullabilityMap: unknown;
    _type: unknown;
}
type PgSelectKind<T extends PgSelectHKTBase, TTableName extends string | undefined, TSelection, TSelectMode extends SelectMode, TNullabilityMap extends Record<string, JoinNullability>> = (T & {
    tableName: TTableName;
    selection: TSelection;
    selectMode: TSelectMode;
    nullabilityMap: TNullabilityMap;
})['_type'];
interface PgSelectQueryBuilderHKT extends PgSelectHKTBase {
    _type: PgSelectQueryBuilder<this, this['tableName'], Assume<this['selection'], ColumnsSelection>, this['selectMode'], Assume<this['nullabilityMap'], Record<string, JoinNullability>>>;
}
interface PgSelectHKT extends PgSelectHKTBase {
    _type: PgSelect<this['tableName'], Assume<this['selection'], ColumnsSelection>, this['selectMode'], Assume<this['nullabilityMap'], Record<string, JoinNullability>>>;
}

interface PreparedQueryConfig {
    execute: unknown;
    all: unknown;
    values: unknown;
}
declare abstract class PreparedQuery<T extends PreparedQueryConfig> {
    abstract execute(placeholderValues?: Record<string, unknown>): Promise<T['execute']>;
}
interface PgTransactionConfig {
    isolationLevel?: 'read uncommitted' | 'read committed' | 'repeatable read' | 'serializable';
    accessMode?: 'read only' | 'read write';
    deferrable?: boolean;
}
declare abstract class PgSession<TQueryResult extends QueryResultHKT = QueryResultHKT, TFullSchema extends Record<string, unknown> = Record<string, never>, TSchema extends TablesRelationalConfig = Record<string, never>> {
    protected dialect: PgDialect;
    constructor(dialect: PgDialect);
    abstract prepareQuery<T extends PreparedQueryConfig = PreparedQueryConfig>(query: Query, fields: SelectedFieldsOrdered | undefined, name: string | undefined, customResultMapper?: (rows: unknown[][], mapColumnValue?: (value: unknown) => unknown) => T['execute']): PreparedQuery<T>;
    execute<T>(query: SQL): Promise<T>;
    all<T = unknown>(query: SQL): Promise<T[]>;
    abstract transaction<T>(transaction: (tx: PgTransaction<TQueryResult, TFullSchema, TSchema>) => Promise<T>, config?: PgTransactionConfig): Promise<T>;
}
declare abstract class PgTransaction<TQueryResult extends QueryResultHKT, TFullSchema extends Record<string, unknown> = Record<string, never>, TSchema extends TablesRelationalConfig = Record<string, never>> extends PgDatabase<TQueryResult, TFullSchema, TSchema> {
    protected schema: {
        fullSchema: Record<string, unknown>;
        schema: TSchema;
        tableNamesMap: Record<string, string>;
    } | undefined;
    protected readonly nestedIndex: number;
    constructor(dialect: PgDialect, session: PgSession<any, any, any>, schema: {
        fullSchema: Record<string, unknown>;
        schema: TSchema;
        tableNamesMap: Record<string, string>;
    } | undefined, nestedIndex?: number);
    rollback(): never;
    setTransaction(config: PgTransactionConfig): Promise<void>;
    abstract transaction<T>(transaction: (tx: PgTransaction<TQueryResult, TFullSchema, TSchema>) => Promise<T>): Promise<T>;
}
interface QueryResultHKT {
    readonly $brand: 'QueryRowHKT';
    readonly row: unknown;
    readonly type: unknown;
}
type QueryResultKind<TKind extends QueryResultHKT, TRow> = (TKind & {
    readonly row: TRow;
})['type'];

interface PgDeleteConfig {
    where?: SQL | undefined;
    table: AnyPgTable;
    returning?: SelectedFieldsOrdered;
}
interface PgDelete<TTable extends AnyPgTable, TQueryResult extends QueryResultHKT, TReturning extends Record<string, unknown> | undefined = undefined> extends QueryPromise<TReturning extends undefined ? QueryResultKind<TQueryResult, never> : TReturning[]> {
}
declare class PgDelete<TTable extends AnyPgTable, TQueryResult extends QueryResultHKT, TReturning extends Record<string, unknown> | undefined = undefined> extends QueryPromise<TReturning extends undefined ? QueryResultKind<TQueryResult, never> : TReturning[]> implements SQLWrapper {
    private session;
    private dialect;
    private config;
    constructor(table: TTable, session: PgSession, dialect: PgDialect);
    where(where: SQL | undefined): Omit<this, 'where'>;
    returning(): PgDelete<TTable, TQueryResult, InferModel<TTable>>;
    returning<TSelectedFields extends SelectedFieldsFlat>(fields: TSelectedFields): PgDelete<TTable, TQueryResult, SelectResultFields<TSelectedFields>>;
    toSQL(): Simplify<Omit<Query, 'typings'>>;
    private _prepare;
    prepare(name: string): PreparedQuery<PreparedQueryConfig & {
        execute: TReturning extends undefined ? QueryResultKind<TQueryResult, never> : TReturning[];
    }>;
    execute: ReturnType<this['prepare']>['execute'];
}

interface PgUpdateConfig {
    where?: SQL | undefined;
    set: UpdateSet;
    table: AnyPgTable;
    returning?: SelectedFieldsOrdered;
}
type PgUpdateSetSource<TTable extends AnyPgTable> = Simplify<{
    [Key in keyof TTable['_']['columns']]?: GetColumnData<TTable['_']['columns'][Key]> | SQL;
}>;
declare class PgUpdateBuilder<TTable extends AnyPgTable, TQueryResult extends QueryResultHKT> {
    private table;
    private session;
    private dialect;
    readonly _: {
        readonly table: TTable;
    };
    constructor(table: TTable, session: PgSession, dialect: PgDialect);
    set(values: PgUpdateSetSource<TTable>): PgUpdate<TTable, TQueryResult>;
}
interface PgUpdate<TTable extends AnyPgTable, TQueryResult extends QueryResultHKT, TReturning extends Record<string, unknown> | undefined = undefined> extends QueryPromise<TReturning extends undefined ? QueryResultKind<TQueryResult, never> : TReturning[]>, SQLWrapper {
}
declare class PgUpdate<TTable extends AnyPgTable, TQueryResult extends QueryResultHKT, TReturning extends Record<string, unknown> | undefined = undefined> extends QueryPromise<TReturning extends undefined ? QueryResultKind<TQueryResult, never> : TReturning[]> implements SQLWrapper {
    private session;
    private dialect;
    readonly _: {
        readonly table: TTable;
        readonly return: TReturning;
    };
    private config;
    constructor(table: TTable, set: UpdateSet, session: PgSession, dialect: PgDialect);
    where(where: SQL | undefined): this;
    returning(): PgUpdate<TTable, TQueryResult, InferModel<TTable>>;
    returning<TSelectedFields extends SelectedFields>(fields: TSelectedFields): PgUpdate<TTable, TQueryResult, SelectResultFields<TSelectedFields>>;
    toSQL(): Omit<Query, 'typings'>;
    private _prepare;
    prepare(name: string): PreparedQuery<PreparedQueryConfig & {
        execute: TReturning extends undefined ? QueryResultKind<TQueryResult, never> : TReturning[];
    }>;
    execute: ReturnType<this['prepare']>['execute'];
}

interface PgInsertConfig<TTable extends AnyPgTable = AnyPgTable> {
    table: TTable;
    values: Record<string, Param | SQL>[];
    onConflict?: SQL;
    returning?: SelectedFieldsOrdered;
}
type PgInsertValue<TTable extends AnyPgTable> = Simplify<{
    [Key in keyof InferModel<TTable, 'insert'>]: InferModel<TTable, 'insert'>[Key] | SQL | Placeholder;
}>;
declare class PgInsertBuilder<TTable extends AnyPgTable, TQueryResult extends QueryResultHKT> {
    private table;
    private session;
    private dialect;
    constructor(table: TTable, session: PgSession, dialect: PgDialect);
    values(value: PgInsertValue<TTable>): PgInsert<TTable, TQueryResult>;
    values(values: PgInsertValue<TTable>[]): PgInsert<TTable, TQueryResult>;
}
interface PgInsert<TTable extends AnyPgTable, TQueryResult extends QueryResultHKT, TReturning extends Record<string, unknown> | undefined = undefined> extends QueryPromise<TReturning extends undefined ? QueryResultKind<TQueryResult, never> : TReturning[]>, SQLWrapper {
}
declare class PgInsert<TTable extends AnyPgTable, TQueryResult extends QueryResultHKT, TReturning extends Record<string, unknown> | undefined = undefined> extends QueryPromise<TReturning extends undefined ? QueryResultKind<TQueryResult, never> : TReturning[]> implements SQLWrapper {
    private session;
    private dialect;
    _: {
        table: TTable;
        return: TReturning;
    };
    private config;
    constructor(table: TTable, values: PgInsertConfig['values'], session: PgSession, dialect: PgDialect);
    returning(): PgInsert<TTable, TQueryResult, InferModel<TTable>>;
    returning<TSelectedFields extends SelectedFieldsFlat>(fields: TSelectedFields): PgInsert<TTable, TQueryResult, SelectResultFields<TSelectedFields>>;
    onConflictDoNothing(config?: {
        target?: IndexColumn | IndexColumn[];
        where?: SQL;
    }): this;
    onConflictDoUpdate(config: {
        target: IndexColumn | IndexColumn[];
        where?: SQL;
        set: PgUpdateSetSource<TTable>;
    }): this;
    toSQL(): Simplify<Omit<Query, 'typings'>>;
    private _prepare;
    prepare(name: string): PreparedQuery<PreparedQueryConfig & {
        execute: TReturning extends undefined ? QueryResultKind<TQueryResult, never> : TReturning[];
    }>;
    execute: ReturnType<this['prepare']>['execute'];
}

declare class QueryBuilder {
    private dialect;
    $with<TAlias extends string>(alias: TAlias): {
        as<TSelection extends ColumnsSelection>(qb: TypedQueryBuilder<TSelection, unknown> | ((qb: QueryBuilder) => TypedQueryBuilder<TSelection, unknown>)): WithSubqueryWithSelection<TSelection, TAlias>;
    };
    with(...queries: WithSubquery[]): {
        select: {
            (): PgSelectBuilder<undefined, 'qb'>;
            <TSelection extends SelectedFields>(fields: TSelection): PgSelectBuilder<TSelection, "qb">;
        };
    };
    select(): PgSelectBuilder<undefined, 'qb'>;
    select<TSelection extends SelectedFields>(fields: TSelection): PgSelectBuilder<TSelection, 'qb'>;
    private getDialect;
}

interface PgRefreshMaterializedView<TQueryResult extends QueryResultHKT> extends QueryPromise<QueryResultKind<TQueryResult, never>> {
}
declare class PgRefreshMaterializedView<TQueryResult extends QueryResultHKT> extends QueryPromise<QueryResultKind<TQueryResult, never>> {
    private session;
    private dialect;
    private config;
    constructor(view: PgMaterializedView, session: PgSession, dialect: PgDialect);
    concurrently(): this;
    withNoData(): this;
    toSQL(): Simplify<Omit<Query, 'typings'>>;
    private _prepare;
    prepare(name: string): PreparedQuery<PreparedQueryConfig & {
        execute: QueryResultKind<TQueryResult, never>;
    }>;
    execute: ReturnType<this['prepare']>['execute'];
}

declare class PgDialect {
    migrate(migrations: MigrationMeta[], session: PgSession): Promise<void>;
    escapeName(name: string): string;
    escapeParam(num: number): string;
    escapeString(str: string): string;
    buildDeleteQuery({ table, where, returning }: PgDeleteConfig): SQL;
    buildUpdateSet(table: AnyPgTable, set: UpdateSet): SQL;
    buildUpdateQuery({ table, set, where, returning }: PgUpdateConfig): SQL;
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
    buildSelectQuery({ withList, fields, fieldsFlat, where, having, table, joins, orderBy, groupBy, limit, offset, lockingClauses }: PgSelectConfig): SQL;
    buildInsertQuery({ table, values, onConflict, returning }: PgInsertConfig): SQL;
    buildRefreshMaterializedViewQuery({ view, concurrently, withNoData }: {
        view: PgMaterializedView;
        concurrently?: boolean;
        withNoData?: boolean;
    }): SQL;
    prepareTyping(encoder: DriverValueEncoder<unknown, unknown>): QueryTypingsValue;
    sqlToQuery(sql: SQL): Query;
    buildRelationalQuery(fullSchema: Record<string, unknown>, schema: TablesRelationalConfig, tableNamesMap: Record<string, string>, table: AnyPgTable, tableConfig: TableRelationalConfig, config: true | DBQueryConfig<'many', true>, tableAlias: string, relationColumns: AnyColumn[], isRoot?: boolean): BuildRelationalQueryResult;
}

declare class RelationalQueryBuilder<TSchema extends TablesRelationalConfig, TFields extends TableRelationalConfig> {
    private fullSchema;
    private schema;
    private tableNamesMap;
    private table;
    private tableConfig;
    private dialect;
    private session;
    constructor(fullSchema: Record<string, unknown>, schema: TSchema, tableNamesMap: Record<string, string>, table: AnyPgTable, tableConfig: TableRelationalConfig, dialect: PgDialect, session: PgSession);
    findMany<TConfig extends DBQueryConfig<'many', true, TSchema, TFields>>(config?: KnownKeysOnly<TConfig, DBQueryConfig<'many', true, TSchema, TFields>>): PgRelationalQuery<BuildQueryResult<TSchema, TFields, TConfig>[]>;
    findFirst<TSelection extends Omit<DBQueryConfig<'many', true, TSchema, TFields>, 'limit'>>(config?: KnownKeysOnly<TSelection, Omit<DBQueryConfig<'many', true, TSchema, TFields>, 'limit'>>): PgRelationalQuery<BuildQueryResult<TSchema, TFields, TSelection> | undefined>;
}
declare class PgRelationalQuery<TResult> extends QueryPromise<TResult> {
    private fullSchema;
    private schema;
    private tableNamesMap;
    private table;
    private tableConfig;
    private dialect;
    private session;
    private config;
    private mode;
    protected $brand: 'PgRelationalQuery';
    constructor(fullSchema: Record<string, unknown>, schema: TablesRelationalConfig, tableNamesMap: Record<string, string>, table: AnyPgTable, tableConfig: TableRelationalConfig, dialect: PgDialect, session: PgSession, config: DBQueryConfig<'many', true> | true, mode: 'many' | 'first');
    private _prepare;
    prepare(name: string): PreparedQuery<PreparedQueryConfig & {
        execute: TResult;
    }>;
    execute(): Promise<TResult>;
}

declare class PgDatabase<TQueryResult extends QueryResultHKT, TFullSchema extends Record<string, unknown> = Record<string, never>, TSchema extends TablesRelationalConfig = ExtractTablesWithRelations<TFullSchema>> {
    readonly _: {
        readonly schema: TSchema | undefined;
        readonly tableNamesMap: Record<string, string>;
    };
    query: {
        [K in keyof TSchema]: RelationalQueryBuilder<TSchema, TSchema[K]>;
    };
    constructor(
    /** @internal */
    dialect: PgDialect, 
    /** @internal */
    session: PgSession<any, any, any>, schema: RelationalSchemaConfig<TSchema> | undefined);
    $with<TAlias extends string>(alias: TAlias): {
        as<TSelection extends ColumnsSelection>(qb: TypedQueryBuilder<TSelection, unknown> | ((qb: QueryBuilder) => TypedQueryBuilder<TSelection, unknown>)): WithSubqueryWithSelection<TSelection, TAlias>;
    };
    with(...queries: WithSubquery[]): {
        select: {
            (): PgSelectBuilder<undefined>;
            <TSelection extends SelectedFields>(fields: TSelection): PgSelectBuilder<TSelection, "db">;
        };
    };
    select(): PgSelectBuilder<undefined>;
    select<TSelection extends SelectedFields>(fields: TSelection): PgSelectBuilder<TSelection>;
    update<TTable extends AnyPgTable>(table: TTable): PgUpdateBuilder<TTable, TQueryResult>;
    insert<TTable extends AnyPgTable>(table: TTable): PgInsertBuilder<TTable, TQueryResult>;
    delete<TTable extends AnyPgTable>(table: TTable): PgDelete<TTable, TQueryResult>;
    refreshMaterializedView<TView extends PgMaterializedView>(view: TView): PgRefreshMaterializedView<TQueryResult>;
    execute<TRow extends Record<string, unknown> = Record<string, unknown>>(query: SQLWrapper): Promise<QueryResultKind<TQueryResult, TRow>>;
    transaction<T>(transaction: (tx: PgTransaction<TQueryResult, TFullSchema, TSchema>) => Promise<T>, config?: PgTransactionConfig): Promise<T>;
}

export { PgSelect as $, AnyPgTable as A, BuildAliasTable as B, Check as C, IndexBuilderOn as D, AnyIndexBuilder as E, ForeignKey as F, IndexBuilder as G, GetColumnsTableName as H, Index as I, index as J, uniqueIndex as K, primaryKey as L, PrimaryKeyBuilder as M, PgDeleteConfig as N, PgDelete as O, PgColumnBuilder as P, PgInsertConfig as Q, ReferenceConfig as R, PgInsertValue as S, PgInsertBuilder as T, UpdateDeleteAction as U, ViewWithConfig as V, PgInsert as W, QueryBuilder as X, PgRefreshMaterializedView as Y, PgSelectBuilder as Z, PgSelectQueryBuilder as _, PgColumn as a, JoinsValue as a0, AnyPgSelect as a1, PgSelectConfig as a2, JoinFn as a3, SelectedFieldsFlat as a4, SelectedFields as a5, SelectedFieldsOrdered as a6, LockStrength as a7, LockConfig as a8, PgSelectHKTBase as a9, MaterializedViewBuilderCore as aA, MaterializedViewBuilder as aB, ManualMaterializedViewBuilder as aC, PgViewBase as aD, PgViewConfig as aE, PgViewWithSelection as aF, PgMaterializedViewConfig as aG, PgMaterializedViewWithSelection as aH, PgSelectKind as aa, PgSelectQueryBuilderHKT as ab, PgSelectHKT as ac, PgUpdateConfig as ad, PgUpdateSetSource as ae, PgUpdateBuilder as af, PgUpdate as ag, PreparedQueryConfig as ah, PreparedQuery as ai, PgTransactionConfig as aj, PgSession as ak, PgTransaction as al, QueryResultHKT as am, QueryResultKind as an, SubqueryWithSelection as ao, WithSubqueryWithSelection as ap, PgTableExtraConfig as aq, TableConfig as ar, PgTable as as, AnyPgTableHKT as at, PgTableWithColumns as au, pgTable as av, pgTableCreator as aw, DefaultViewBuilderCore as ax, ViewBuilder as ay, ManualViewBuilder as az, PgTableFn as b, pgMaterializedView as c, AnyPgColumn as d, PrimaryKey as e, PgView as f, PgMaterializedView as g, PgMaterializedViewWithConfig as h, CheckBuilder as i, check as j, PgArrayBuilderHKT as k, PgArrayHKT as l, PgArrayBuilder as m, PgArray as n, PgColumnBuilderHKT as o, pgView as p, PgColumnHKT as q, AnyPgColumnBuilder as r, AnyPgColumnHKT as s, PgDatabase as t, PgDialect as u, Reference as v, ForeignKeyBuilder as w, AnyForeignKeyBuilder as x, foreignKey as y, IndexColumn as z };