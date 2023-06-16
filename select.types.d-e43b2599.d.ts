import { a as SQL, ak as TableConfig$1, T as Table, al as UpdateTableConfig, u as BuildColumns, n as ColumnBuilderHKTBase, ay as Assume, k as ColumnBuilderBaseConfig, c as ColumnHKTBase, C as ColumnBaseConfig, r as ColumnBuilder, av as Update, f as Column, t as UpdateCBConfig, at as UpdateSet, S as Simplify, G as GetColumnData, Y as SQLWrapper, Q as Query, a9 as Param, I as InferModel, ad as Placeholder, A as AnyColumn, aI as KnownKeysOnly, aL as ColumnsSelection, ah as Subquery, ai as WithSubquery, az as Equal, aB as ValueOrArray, V as View, an as AnyTable, z as SelectedFieldsFlat$1, F as SelectedFields$1, H as SelectedFieldsOrdered$1 } from './column.d-66a08b85.js';
import { A as AddAliasToSelection, T as TypedQueryBuilder, G as GetSelectTableName, a as GetSelectTableSelection, S as SelectMode, J as JoinNullability, B as BuildSubquerySelection, b as SelectResult, c as JoinType, M as MapColumnsToTableAlias, d as AppendToResult, e as AppendToNullabilityMap } from './select.types.d-1bd49d37.js';
import { Q as QueryPromise, T as TablesRelationalConfig, K as TableRelationalConfig, J as DBQueryConfig, a2 as BuildRelationalQueryResult, U as BuildQueryResult, L as ExtractTablesWithRelations, R as RelationalSchemaConfig } from './query-promise.d-d7b61248.js';
import { ResultSetHeader } from 'mysql2/promise';
import { MigrationMeta, MigrationConfig } from './migrator.js';

declare class CheckBuilder {
    name: string;
    value: SQL;
    protected brand: 'MySqlConstraintBuilder';
    constructor(name: string, value: SQL);
}
declare class Check {
    table: AnyMySqlTable;
    readonly name: string;
    readonly value: SQL;
    constructor(table: AnyMySqlTable, builder: CheckBuilder);
}
declare function check(name: string, value: SQL): CheckBuilder;

interface IndexConfig {
    name: string;
    columns: IndexColumn[];
    /**
     * If true, the index will be created as `create unique index` instead of `create index`.
     */
    unique?: boolean;
    /**
     * If set, the index will be created as `create index ... using { 'btree' | 'hash' }`.
     */
    using?: 'btree' | 'hash';
    /**
     * If set, the index will be created as `create index ... algorythm { 'default' | 'inplace' | 'copy' }`.
     */
    algorythm?: 'default' | 'inplace' | 'copy';
    /**
     * If set, adds locks to the index creation.
     */
    lock?: 'default' | 'none' | 'shared' | 'exclusive';
}
type IndexColumn = AnyMySqlColumn | SQL;
declare class IndexBuilderOn {
    private name;
    private unique;
    constructor(name: string, unique: boolean);
    on(...columns: [IndexColumn, ...IndexColumn[]]): IndexBuilder;
}
interface AnyIndexBuilder {
    build(table: AnyMySqlTable): Index;
}
interface IndexBuilder extends AnyIndexBuilder {
}
declare class IndexBuilder implements AnyIndexBuilder {
    constructor(name: string, columns: IndexColumn[], unique: boolean);
    using(using: IndexConfig['using']): Omit<this, 'using'>;
    algorythm(algorythm: IndexConfig['algorythm']): Omit<this, 'algorythm'>;
    lock(lock: IndexConfig['lock']): Omit<this, 'lock'>;
}
declare class Index {
    readonly config: IndexConfig & {
        table: AnyMySqlTable;
    };
    constructor(config: IndexConfig, table: AnyMySqlTable);
}
type GetColumnsTableName<TColumns> = TColumns extends AnyMySqlColumn<{
    tableName: infer TTableName extends string;
}> | AnyMySqlColumn<{
    tableName: infer TTableName extends string;
}>[] ? TTableName : never;
declare function index(name: string): IndexBuilderOn;
declare function uniqueIndex(name: string): IndexBuilderOn;

declare function primaryKey<TTableName extends string, TColumns extends AnyMySqlColumn<{
    tableName: TTableName;
}>[]>(...columns: TColumns): PrimaryKeyBuilder;
declare class PrimaryKeyBuilder {
    constructor(columns: AnyMySqlColumn[]);
}
declare class PrimaryKey {
    readonly table: AnyMySqlTable;
    readonly columns: AnyMySqlColumn<{}>[];
    constructor(table: AnyMySqlTable, columns: AnyMySqlColumn<{}>[]);
    getName(): string;
}

type MySqlTableExtraConfig = Record<string, AnyIndexBuilder | CheckBuilder | ForeignKeyBuilder | PrimaryKeyBuilder>;
type TableConfig = TableConfig$1<AnyMySqlColumn>;
declare class MySqlTable<T extends TableConfig> extends Table<T> {
    protected $columns: T['columns'];
}
type AnyMySqlTable<TPartial extends Partial<TableConfig> = {}> = MySqlTable<UpdateTableConfig<TableConfig, TPartial>>;
type MySqlTableWithColumns<T extends TableConfig> = MySqlTable<T> & {
    [Key in keyof T['columns']]: T['columns'][Key];
};
declare function mysqlTableWithSchema<TTableName extends string, TSchemaName extends string | undefined, TColumnsMap extends Record<string, AnyMySqlColumnBuilder>>(name: TTableName, columns: TColumnsMap, extraConfig: ((self: BuildColumns<TTableName, TColumnsMap>) => MySqlTableExtraConfig) | undefined, schema: TSchemaName, baseName?: TTableName): MySqlTableWithColumns<{
    name: TTableName;
    schema: TSchemaName;
    columns: BuildColumns<TTableName, TColumnsMap>;
}>;
interface MySqlTableFn<TSchemaName extends string | undefined = undefined> {
    <TTableName extends string, TColumnsMap extends Record<string, AnyMySqlColumnBuilder>>(name: TTableName, columns: TColumnsMap, extraConfig?: (self: BuildColumns<TTableName, TColumnsMap>) => MySqlTableExtraConfig): MySqlTableWithColumns<{
        name: TTableName;
        schema: TSchemaName;
        columns: BuildColumns<TTableName, TColumnsMap>;
    }>;
}
declare const mysqlTable: MySqlTableFn;
declare function mysqlTableCreator(customizeTableName: (name: string) => string): MySqlTableFn;

type UpdateDeleteAction = 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
type Reference = () => {
    readonly columns: AnyMySqlColumn[];
    readonly foreignTable: AnyMySqlTable;
    readonly foreignColumns: AnyMySqlColumn[];
};
declare class ForeignKeyBuilder {
    constructor(config: () => {
        columns: AnyMySqlColumn[];
        foreignColumns: AnyMySqlColumn[];
    }, actions?: {
        onUpdate?: UpdateDeleteAction;
        onDelete?: UpdateDeleteAction;
    } | undefined);
    onUpdate(action: UpdateDeleteAction): this;
    onDelete(action: UpdateDeleteAction): this;
}
type AnyForeignKeyBuilder = ForeignKeyBuilder;
declare class ForeignKey {
    readonly table: AnyMySqlTable;
    readonly reference: Reference;
    readonly onUpdate: UpdateDeleteAction | undefined;
    readonly onDelete: UpdateDeleteAction | undefined;
    constructor(table: AnyMySqlTable, builder: ForeignKeyBuilder);
    getName(): string;
}
type ColumnsWithTable<TTableName extends string, TColumns extends AnyMySqlColumn[]> = {
    [Key in keyof TColumns]: AnyMySqlColumn<{
        tableName: TTableName;
    }>;
};
type GetColumnsTable<TColumns extends AnyMySqlColumn | AnyMySqlColumn[]> = (TColumns extends AnyMySqlColumn ? TColumns : TColumns extends AnyMySqlColumn[] ? TColumns[number] : never) extends AnyMySqlColumn<{
    tableName: infer TTableName extends string;
}> ? TTableName : never;
declare function foreignKey<TTableName extends string, TForeignTableName extends string, TColumns extends [AnyMySqlColumn<{
    tableName: TTableName;
}>, ...AnyMySqlColumn<{
    tableName: TTableName;
}>[]]>(config: {
    columns: TColumns;
    foreignColumns: ColumnsWithTable<TForeignTableName, TColumns>;
}): ForeignKeyBuilder;

interface ReferenceConfig {
    ref: () => AnyMySqlColumn;
    actions: {
        onUpdate?: UpdateDeleteAction;
        onDelete?: UpdateDeleteAction;
    };
}
interface MySqlColumnBuilderHKT extends ColumnBuilderHKTBase {
    _type: MySqlColumnBuilder<MySqlColumnBuilderHKT, Assume<this['config'], ColumnBuilderBaseConfig>>;
    _columnHKT: MySqlColumnHKT;
}
interface MySqlColumnHKT extends ColumnHKTBase {
    _type: MySqlColumn<MySqlColumnHKT, Assume<this['config'], ColumnBaseConfig>>;
}
declare abstract class MySqlColumnBuilder<THKT extends ColumnBuilderHKTBase, T extends ColumnBuilderBaseConfig, TRuntimeConfig extends object = {}, TTypeConfig extends object = {}> extends ColumnBuilder<THKT, T, TRuntimeConfig, TTypeConfig & {
    mysqlBrand: 'MySqlColumnBuilder';
}> {
    private foreignKeyConfigs;
    references(ref: ReferenceConfig['ref'], actions?: ReferenceConfig['actions']): this;
}
type AnyMySqlColumnBuilder<TPartial extends Partial<ColumnBuilderBaseConfig> = {}> = MySqlColumnBuilder<MySqlColumnBuilderHKT, Required<Update<ColumnBuilderBaseConfig, TPartial>>>;
declare abstract class MySqlColumn<THKT extends ColumnHKTBase, T extends ColumnBaseConfig, TRuntimeConfig extends object = {}> extends Column<THKT, T, TRuntimeConfig, {
    mysqlBrand: 'MySqlColumn';
}> {
}
type AnyMySqlColumn<TPartial extends Partial<ColumnBaseConfig> = {}> = MySqlColumn<MySqlColumnHKT, Required<Update<ColumnBaseConfig, TPartial>>>;
interface MySqlColumnWithAutoIncrementConfig {
    autoIncrement: boolean;
}
declare abstract class MySqlColumnBuilderWithAutoIncrement<THKT extends ColumnBuilderHKTBase, T extends ColumnBuilderBaseConfig, TRuntimeConfig extends object = {}> extends MySqlColumnBuilder<THKT, T, TRuntimeConfig & MySqlColumnWithAutoIncrementConfig> {
    constructor(name: NonNullable<T['name']>);
    autoincrement(): MySqlColumnBuilderWithAutoIncrement<THKT, UpdateCBConfig<T, {
        hasDefault: true;
    }>, TRuntimeConfig>;
}
declare abstract class MySqlColumnWithAutoIncrement<THKT extends ColumnHKTBase, T extends ColumnBaseConfig, TRuntimeConfig extends object = {}> extends MySqlColumn<THKT, T, MySqlColumnWithAutoIncrementConfig & TRuntimeConfig> {
    readonly autoIncrement: boolean;
}

interface MySqlUpdateConfig {
    where?: SQL | undefined;
    set: UpdateSet;
    table: AnyMySqlTable;
    returning?: SelectedFieldsOrdered;
}
type MySqlUpdateSetSource<TTable extends AnyMySqlTable> = Simplify<{
    [Key in keyof TTable['_']['columns']]?: GetColumnData<TTable['_']['columns'][Key], 'query'> | SQL;
}>;
declare class MySqlUpdateBuilder<TTable extends AnyMySqlTable, TQueryResult extends QueryResultHKT, TPreparedQueryHKT extends PreparedQueryHKTBase> {
    private table;
    private session;
    private dialect;
    protected $table: TTable;
    constructor(table: TTable, session: MySqlSession, dialect: MySqlDialect);
    set(values: MySqlUpdateSetSource<TTable>): MySqlUpdate<TTable, TQueryResult, TPreparedQueryHKT>;
}
interface MySqlUpdate<TTable extends AnyMySqlTable, TQueryResult extends QueryResultHKT, TPreparedQueryHKT extends PreparedQueryHKTBase> extends QueryPromise<QueryResultKind<TQueryResult, never>>, SQLWrapper {
}
declare class MySqlUpdate<TTable extends AnyMySqlTable, TQueryResult extends QueryResultHKT, TPreparedQueryHKT extends PreparedQueryHKTBase> extends QueryPromise<QueryResultKind<TQueryResult, never>> implements SQLWrapper {
    private session;
    private dialect;
    protected $table: TTable;
    private config;
    constructor(table: TTable, set: UpdateSet, session: MySqlSession, dialect: MySqlDialect);
    where(where: SQL | undefined): Omit<this, 'where'>;
    toSQL(): Omit<Query, 'typings'>;
    prepare(): Assume<(TPreparedQueryHKT & {
        readonly config: PreparedQueryConfig & {
            execute: QueryResultKind<TQueryResult, never>;
            iterator: never;
        };
    })["type"], PreparedQuery<PreparedQueryConfig & {
        execute: QueryResultKind<TQueryResult, never>;
        iterator: never;
    }>>;
    execute: ReturnType<this['prepare']>['execute'];
    private createIterator;
    iterator: ReturnType<this["prepare"]>["iterator"];
}

interface MySqlInsertConfig<TTable extends AnyMySqlTable = AnyMySqlTable> {
    table: TTable;
    values: Record<string, Param | SQL>[];
    ignore: boolean;
    onConflict?: SQL;
}
type AnyMySqlInsertConfig = MySqlInsertConfig<AnyMySqlTable>;
type MySqlInsertValue<TTable extends AnyMySqlTable> = Simplify<{
    [Key in keyof InferModel<TTable, 'insert'>]: InferModel<TTable, 'insert'>[Key] | SQL | Placeholder;
}>;
declare class MySqlInsertBuilder<TTable extends AnyMySqlTable, TQueryResult extends QueryResultHKT, TPreparedQueryHKT extends PreparedQueryHKTBase> {
    private table;
    private session;
    private dialect;
    private shouldIgnore;
    constructor(table: TTable, session: MySqlSession, dialect: MySqlDialect);
    ignore(): this;
    values(value: MySqlInsertValue<TTable>): MySqlInsert<TTable, TQueryResult, TPreparedQueryHKT>;
    values(values: MySqlInsertValue<TTable>[]): MySqlInsert<TTable, TQueryResult, TPreparedQueryHKT>;
}
interface MySqlInsert<TTable extends AnyMySqlTable, TQueryResult extends QueryResultHKT, TPreparedQueryHKT extends PreparedQueryHKTBase> extends QueryPromise<QueryResultKind<TQueryResult, never>>, SQLWrapper {
}
declare class MySqlInsert<TTable extends AnyMySqlTable, TQueryResult extends QueryResultHKT, TPreparedQueryHKT extends PreparedQueryHKTBase> extends QueryPromise<QueryResultKind<TQueryResult, never>> implements SQLWrapper {
    private session;
    private dialect;
    protected $table: TTable;
    private config;
    constructor(table: TTable, values: MySqlInsertConfig['values'], ignore: boolean, session: MySqlSession, dialect: MySqlDialect);
    onDuplicateKeyUpdate(config: {
        set: MySqlUpdateSetSource<TTable>;
    }): this;
    toSQL(): Simplify<Omit<Query, 'typings'>>;
    prepare(): Assume<(TPreparedQueryHKT & {
        readonly config: PreparedQueryConfig & {
            execute: QueryResultKind<TQueryResult, never>;
            iterator: never;
        };
    })["type"], PreparedQuery<PreparedQueryConfig & {
        execute: QueryResultKind<TQueryResult, never>;
        iterator: never;
    }>>;
    execute: ReturnType<this['prepare']>['execute'];
    private createIterator;
    iterator: ReturnType<this["prepare"]>["iterator"];
}

declare class MySqlDialect {
    migrate(migrations: MigrationMeta[], session: MySqlSession, config: MigrationConfig): Promise<void>;
    escapeName(name: string): string;
    escapeParam(_num: number): string;
    escapeString(str: string): string;
    buildDeleteQuery({ table, where, returning }: MySqlDeleteConfig): SQL;
    buildUpdateSet(table: AnyMySqlTable, set: UpdateSet): SQL;
    buildUpdateQuery({ table, set, where, returning }: MySqlUpdateConfig): SQL;
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
    buildSelectQuery({ withList, fields, fieldsFlat, where, having, table, joins, orderBy, groupBy, limit, offset, lockingClause }: MySqlSelectConfig): SQL;
    buildInsertQuery({ table, values, ignore, onConflict }: MySqlInsertConfig): SQL;
    sqlToQuery(sql: SQL): Query;
    buildRelationalQuery(fullSchema: Record<string, unknown>, schema: TablesRelationalConfig, tableNamesMap: Record<string, string>, table: AnyMySqlTable, tableConfig: TableRelationalConfig, config: true | DBQueryConfig<'many', true>, tableAlias: string, relationColumns: AnyColumn[], isRoot?: boolean): BuildRelationalQueryResult;
}

declare class RelationalQueryBuilder<TPreparedQueryHKT extends PreparedQueryHKTBase, TSchema extends TablesRelationalConfig, TFields extends TableRelationalConfig> {
    private fullSchema;
    private schema;
    private tableNamesMap;
    private table;
    private tableConfig;
    private dialect;
    private session;
    constructor(fullSchema: Record<string, unknown>, schema: TSchema, tableNamesMap: Record<string, string>, table: AnyMySqlTable, tableConfig: TableRelationalConfig, dialect: MySqlDialect, session: MySqlSession);
    findMany<TConfig extends DBQueryConfig<'many', true, TSchema, TFields>>(config?: KnownKeysOnly<TConfig, DBQueryConfig<'many', true, TSchema, TFields>>): MySqlRelationalQuery<TPreparedQueryHKT, BuildQueryResult<TSchema, TFields, TConfig>[]>;
    findFirst<TSelection extends Omit<DBQueryConfig<'many', true, TSchema, TFields>, 'limit'>>(config?: KnownKeysOnly<TSelection, Omit<DBQueryConfig<'many', true, TSchema, TFields>, 'limit'>>): MySqlRelationalQuery<TPreparedQueryHKT, BuildQueryResult<TSchema, TFields, TSelection> | undefined>;
}
declare class MySqlRelationalQuery<TPreparedQueryHKT extends PreparedQueryHKTBase, TResult> extends QueryPromise<TResult> {
    private fullSchema;
    private schema;
    private tableNamesMap;
    private table;
    private tableConfig;
    private dialect;
    private session;
    private config;
    private mode;
    protected $brand: 'MySqlRelationalQuery';
    constructor(fullSchema: Record<string, unknown>, schema: TablesRelationalConfig, tableNamesMap: Record<string, string>, table: AnyMySqlTable, tableConfig: TableRelationalConfig, dialect: MySqlDialect, session: MySqlSession, config: DBQueryConfig<'many', true> | true, mode: 'many' | 'first');
    prepare(): Assume<(TPreparedQueryHKT & {
        readonly config: PreparedQueryConfig & {
            execute: TResult;
        };
    })["type"], PreparedQuery<PreparedQueryConfig & {
        execute: TResult;
    }>>;
    execute(): Promise<TResult>;
}

type SubqueryWithSelection<TSelection extends ColumnsSelection, TAlias extends string> = Subquery<TAlias, AddAliasToSelection<TSelection, TAlias>> & AddAliasToSelection<TSelection, TAlias>;
type WithSubqueryWithSelection<TSelection extends ColumnsSelection, TAlias extends string> = WithSubquery<TAlias, AddAliasToSelection<TSelection, TAlias>> & AddAliasToSelection<TSelection, TAlias>;

declare class MySqlDatabase<TQueryResult extends QueryResultHKT, TPreparedQueryHKT extends PreparedQueryHKTBase, TFullSchema extends Record<string, unknown> = {}, TSchema extends TablesRelationalConfig = ExtractTablesWithRelations<TFullSchema>> {
    readonly _: {
        readonly schema: TSchema | undefined;
        readonly tableNamesMap: Record<string, string>;
    };
    query: {
        [K in keyof TSchema]: RelationalQueryBuilder<TPreparedQueryHKT, TSchema, TSchema[K]>;
    };
    constructor(
    /** @internal */
    dialect: MySqlDialect, 
    /** @internal */
    session: MySqlSession<any, any, any, any>, schema: RelationalSchemaConfig<TSchema> | undefined);
    $with<TAlias extends string>(alias: TAlias): {
        as<TSelection extends ColumnsSelection>(qb: TypedQueryBuilder<TSelection, unknown> | ((qb: QueryBuilder) => TypedQueryBuilder<TSelection, unknown>)): WithSubqueryWithSelection<TSelection, TAlias>;
    };
    with(...queries: WithSubquery[]): {
        select: {
            (): MySqlSelectBuilder<undefined, TPreparedQueryHKT>;
            <TSelection extends SelectedFields>(fields: TSelection): MySqlSelectBuilder<TSelection, TPreparedQueryHKT, "db">;
        };
    };
    select(): MySqlSelectBuilder<undefined, TPreparedQueryHKT>;
    select<TSelection extends SelectedFields>(fields: TSelection): MySqlSelectBuilder<TSelection, TPreparedQueryHKT>;
    update<TTable extends AnyMySqlTable>(table: TTable): MySqlUpdateBuilder<TTable, TQueryResult, TPreparedQueryHKT>;
    insert<TTable extends AnyMySqlTable>(table: TTable): MySqlInsertBuilder<TTable, TQueryResult, TPreparedQueryHKT>;
    delete<TTable extends AnyMySqlTable>(table: TTable): MySqlDelete<TTable, TQueryResult, TPreparedQueryHKT>;
    execute<T extends {
        [column: string]: any;
    } = ResultSetHeader>(query: SQLWrapper): Promise<QueryResultKind<TQueryResult, T>>;
    transaction<T>(transaction: (tx: MySqlTransaction<TQueryResult, TPreparedQueryHKT, TFullSchema, TSchema>, config?: MySqlTransactionConfig) => Promise<T>, config?: MySqlTransactionConfig): Promise<T>;
}

interface QueryResultHKT {
    readonly $brand: 'MySqlQueryRowHKT';
    readonly row: unknown;
    readonly type: unknown;
}
type QueryResultKind<TKind extends QueryResultHKT, TRow> = (TKind & {
    readonly row: TRow;
})['type'];
interface PreparedQueryConfig {
    execute: unknown;
    iterator: unknown;
}
interface PreparedQueryHKT {
    readonly $brand: 'MySqlPreparedQueryHKT';
    readonly config: unknown;
    readonly type: unknown;
}
type PreparedQueryKind<TKind extends PreparedQueryHKT, TConfig extends PreparedQueryConfig, TAssume extends boolean = false> = Equal<TAssume, true> extends true ? Assume<(TKind & {
    readonly config: TConfig;
})['type'], PreparedQuery<TConfig>> : (TKind & {
    readonly config: TConfig;
})['type'];
declare abstract class PreparedQuery<T extends PreparedQueryConfig> {
    abstract execute(placeholderValues?: Record<string, unknown>): Promise<T['execute']>;
    abstract iterator(placeholderValues?: Record<string, unknown>): AsyncGenerator<T['iterator']>;
}
interface MySqlTransactionConfig {
    withConsistentSnapshot?: boolean;
    accessMode?: 'read only' | 'read write';
    isolationLevel: 'read uncommitted' | 'read committed' | 'repeatable read' | 'serializable';
}
declare abstract class MySqlSession<TQueryResult extends QueryResultHKT = QueryResultHKT, TPreparedQueryHKT extends PreparedQueryHKTBase = PreparedQueryHKTBase, TFullSchema extends Record<string, unknown> = Record<string, never>, TSchema extends TablesRelationalConfig = Record<string, never>> {
    protected dialect: MySqlDialect;
    constructor(dialect: MySqlDialect);
    abstract prepareQuery<T extends PreparedQueryConfig, TPreparedQueryHKT extends PreparedQueryHKT>(query: Query, fields: SelectedFieldsOrdered | undefined, customResultMapper?: (rows: unknown[][]) => T['execute']): PreparedQueryKind<TPreparedQueryHKT, T>;
    execute<T>(query: SQL): Promise<T>;
    abstract all<T = unknown>(query: SQL): Promise<T[]>;
    abstract transaction<T>(transaction: (tx: MySqlTransaction<TQueryResult, TPreparedQueryHKT, TFullSchema, TSchema>) => Promise<T>, config?: MySqlTransactionConfig): Promise<T>;
    protected getSetTransactionSQL(config: MySqlTransactionConfig): SQL | undefined;
    protected getStartTransactionSQL(config: MySqlTransactionConfig): SQL | undefined;
}
declare abstract class MySqlTransaction<TQueryResult extends QueryResultHKT, TPreparedQueryHKT extends PreparedQueryHKTBase, TFullSchema extends Record<string, unknown> = Record<string, never>, TSchema extends TablesRelationalConfig = Record<string, never>> extends MySqlDatabase<TQueryResult, TPreparedQueryHKT, TFullSchema, TSchema> {
    protected schema: RelationalSchemaConfig<TSchema> | undefined;
    protected readonly nestedIndex: number;
    constructor(dialect: MySqlDialect, session: MySqlSession, schema: RelationalSchemaConfig<TSchema> | undefined, nestedIndex?: number);
    rollback(): never;
    /** Nested transactions (aka savepoints) only work with InnoDB engine. */
    abstract transaction<T>(transaction: (tx: MySqlTransaction<TQueryResult, TPreparedQueryHKT, TFullSchema, TSchema>) => Promise<T>): Promise<T>;
}
interface PreparedQueryHKTBase extends PreparedQueryHKT {
    type: PreparedQuery<Assume<this['config'], PreparedQueryConfig>>;
}

interface MySqlDeleteConfig {
    where?: SQL | undefined;
    table: AnyMySqlTable;
    returning?: SelectedFieldsOrdered;
}
interface MySqlDelete<TTable extends AnyMySqlTable, TQueryResult extends QueryResultHKT, TPreparedQueryHKT extends PreparedQueryHKTBase> extends QueryPromise<QueryResultKind<TQueryResult, never>> {
}
declare class MySqlDelete<TTable extends AnyMySqlTable, TQueryResult extends QueryResultHKT, TPreparedQueryHKT extends PreparedQueryHKTBase> extends QueryPromise<QueryResultKind<TQueryResult, never>> implements SQLWrapper {
    private table;
    private session;
    private dialect;
    private config;
    constructor(table: TTable, session: MySqlSession, dialect: MySqlDialect);
    where(where: SQL | undefined): Omit<this, 'where'>;
    toSQL(): Omit<Query, 'typings'>;
    prepare(): Assume<(TPreparedQueryHKT & {
        readonly config: PreparedQueryConfig & {
            execute: QueryResultKind<TQueryResult, never>;
            iterator: never;
        };
    })["type"], PreparedQuery<PreparedQueryConfig & {
        execute: QueryResultKind<TQueryResult, never>;
        iterator: never;
    }>>;
    execute: ReturnType<this['prepare']>['execute'];
    private createIterator;
    iterator: ReturnType<this["prepare"]>["iterator"];
}

type CreateMySqlSelectFromBuilderMode<TBuilderMode extends 'db' | 'qb', TTableName extends string | undefined, TSelection extends ColumnsSelection, TSelectMode extends SelectMode, TPreparedQueryHKT extends PreparedQueryHKTBase> = TBuilderMode extends 'db' ? MySqlSelect<TTableName, TSelection, TSelectMode, TPreparedQueryHKT> : MySqlSelectQueryBuilder<MySqlSelectQueryBuilderHKT, TTableName, TSelection, TSelectMode>;
declare class MySqlSelectBuilder<TSelection extends SelectedFields | undefined, TPreparedQueryHKT extends PreparedQueryHKTBase, TBuilderMode extends 'db' | 'qb' = 'db'> {
    private fields;
    private session;
    private dialect;
    private withList;
    constructor(fields: TSelection, session: MySqlSession | undefined, dialect: MySqlDialect, withList?: Subquery[]);
    from<TFrom extends AnyMySqlTable | Subquery | MySqlViewBase | SQL>(source: TFrom): CreateMySqlSelectFromBuilderMode<TBuilderMode, GetSelectTableName<TFrom>, TSelection extends undefined ? GetSelectTableSelection<TFrom> : TSelection, TSelection extends undefined ? 'single' : 'partial', TPreparedQueryHKT>;
}
declare abstract class MySqlSelectQueryBuilder<THKT extends MySqlSelectHKTBase, TTableName extends string | undefined, TSelection extends ColumnsSelection, TSelectMode extends SelectMode, TNullabilityMap extends Record<string, JoinNullability> = TTableName extends string ? Record<TTableName, 'not-null'> : {}> extends TypedQueryBuilder<BuildSubquerySelection<TSelection, TNullabilityMap>, SelectResult<TSelection, TSelectMode, TNullabilityMap>[]> {
    private isPartialSelect;
    protected dialect: MySqlDialect;
    readonly _: {
        selectMode: TSelectMode;
        selection: TSelection;
        result: SelectResult<TSelection, TSelectMode, TNullabilityMap>[];
        selectedFields: BuildSubquerySelection<TSelection, TNullabilityMap>;
    };
    protected config: MySqlSelectConfig;
    protected joinsNotNullableMap: Record<string, boolean>;
    private tableName;
    constructor(table: MySqlSelectConfig['table'], fields: MySqlSelectConfig['fields'], isPartialSelect: boolean, 
    /** @internal */
    session: MySqlSession | undefined, dialect: MySqlDialect, withList: Subquery[]);
    private createJoin;
    leftJoin: JoinFn<THKT, TTableName, TSelectMode, "left", TSelection, TNullabilityMap>;
    rightJoin: JoinFn<THKT, TTableName, TSelectMode, "right", TSelection, TNullabilityMap>;
    innerJoin: JoinFn<THKT, TTableName, TSelectMode, "inner", TSelection, TNullabilityMap>;
    fullJoin: JoinFn<THKT, TTableName, TSelectMode, "full", TSelection, TNullabilityMap>;
    where(where: ((aliases: TSelection) => SQL | undefined) | SQL | undefined): this;
    having(having: ((aliases: TSelection) => SQL | undefined) | SQL | undefined): this;
    groupBy(builder: (aliases: TSelection) => ValueOrArray<AnyMySqlColumn | SQL | SQL.Aliased>): this;
    groupBy(...columns: (AnyMySqlColumn | SQL | SQL.Aliased)[]): this;
    orderBy(builder: (aliases: TSelection) => ValueOrArray<AnyMySqlColumn | SQL | SQL.Aliased>): this;
    orderBy(...columns: (AnyMySqlColumn | SQL | SQL.Aliased)[]): this;
    limit(limit: number): this;
    offset(offset: number): this;
    for(strength: LockStrength, config?: LockConfig): this;
    toSQL(): Simplify<Omit<Query, 'typings'>>;
    as<TAlias extends string>(alias: TAlias): SubqueryWithSelection<BuildSubquerySelection<TSelection, TNullabilityMap>, TAlias>;
}
interface MySqlSelect<TTableName extends string | undefined, TSelection extends ColumnsSelection, TSelectMode extends SelectMode, TPreparedQueryHKT extends PreparedQueryHKTBase, TNullabilityMap extends Record<string, JoinNullability> = TTableName extends string ? Record<TTableName, 'not-null'> : {}> extends MySqlSelectQueryBuilder<MySqlSelectHKT, TTableName, TSelection, TSelectMode, TNullabilityMap>, QueryPromise<SelectResult<TSelection, TSelectMode, TNullabilityMap>[]> {
}
declare class MySqlSelect<TTableName extends string | undefined, TSelection, TSelectMode extends SelectMode, TPreparedQueryHKT extends PreparedQueryHKTBase, TNullabilityMap extends Record<string, JoinNullability> = TTableName extends string ? Record<TTableName, 'not-null'> : {}> extends MySqlSelectQueryBuilder<MySqlSelectHKT, TTableName, TSelection, TSelectMode, TNullabilityMap> {
    prepare(): Assume<(TPreparedQueryHKT & {
        readonly config: PreparedQueryConfig & {
            execute: SelectResult<TSelection, TSelectMode, TNullabilityMap>[];
            iterator: SelectResult<TSelection, TSelectMode, TNullabilityMap>;
        };
    })["type"], PreparedQuery<PreparedQueryConfig & {
        execute: SelectResult<TSelection, TSelectMode, TNullabilityMap>[];
        iterator: SelectResult<TSelection, TSelectMode, TNullabilityMap>;
    }>>;
    execute: ReturnType<this["prepare"]>["execute"];
    private createIterator;
    iterator: ReturnType<this["prepare"]>["iterator"];
}

declare class QueryBuilder {
    private dialect;
    $with<TAlias extends string>(alias: TAlias): {
        as<TSelection extends ColumnsSelection>(qb: TypedQueryBuilder<TSelection, unknown> | ((qb: QueryBuilder) => TypedQueryBuilder<TSelection, unknown>)): WithSubqueryWithSelection<TSelection, TAlias>;
    };
    with(...queries: WithSubquery[]): {
        select: {
            (): MySqlSelectBuilder<undefined, never, 'qb'>;
            <TSelection extends SelectedFields>(fields: TSelection): MySqlSelectBuilder<TSelection, never, "qb">;
        };
    };
    select(): MySqlSelectBuilder<undefined, never, 'qb'>;
    select<TSelection extends SelectedFields>(fields: TSelection): MySqlSelectBuilder<TSelection, never, 'qb'>;
    private getDialect;
}

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
    protected schema: string | undefined;
    readonly _: {
        readonly name: TConfig['name'];
        readonly columns: TConfig['columns'];
    };
    constructor(name: TConfig['name'], schema: string | undefined);
    protected config: ViewBuilderConfig;
    algorithm(algorithm: Exclude<ViewBuilderConfig['algorithm'], undefined>): this;
    definer(definer: Exclude<ViewBuilderConfig['definer'], undefined>): this;
    sqlSecurity(sqlSecurity: Exclude<ViewBuilderConfig['sqlSecurity'], undefined>): this;
    withCheckOption(withCheckOption?: Exclude<ViewBuilderConfig['withCheckOption'], undefined>): this;
}
declare class ViewBuilder<TName extends string = string> extends ViewBuilderCore<{
    name: TName;
}> {
    as<TSelectedFields extends SelectedFields>(qb: TypedQueryBuilder<TSelectedFields> | ((qb: QueryBuilder) => TypedQueryBuilder<TSelectedFields>)): MySqlViewWithSelection<TName, false, AddAliasToSelection<TSelectedFields, TName>>;
}
declare class ManualViewBuilder<TName extends string = string, TColumns extends Record<string, AnyMySqlColumnBuilder> = Record<string, AnyMySqlColumnBuilder>> extends ViewBuilderCore<{
    name: TName;
    columns: TColumns;
}> {
    private columns;
    constructor(name: TName, columns: TColumns, schema: string | undefined);
    existing(): MySqlViewWithSelection<TName, true, BuildColumns<TName, TColumns>>;
    as(query: SQL): MySqlViewWithSelection<TName, false, BuildColumns<TName, TColumns>>;
}
declare abstract class MySqlViewBase<TName extends string = string, TExisting extends boolean = boolean, TSelectedFields extends ColumnsSelection = ColumnsSelection> extends View<TName, TExisting, TSelectedFields> {
    readonly _: View<TName, TExisting, TSelectedFields>['_'] & {
        readonly viewBrand: 'MySqlViewBase';
    };
}
declare const MySqlViewConfig: unique symbol;
declare class MySqlView<TName extends string = string, TExisting extends boolean = boolean, TSelectedFields extends ColumnsSelection = ColumnsSelection> extends MySqlViewBase<TName, TExisting, TSelectedFields> {
    protected $MySqlViewBrand: 'MySqlView';
    [MySqlViewConfig]: ViewBuilderConfig | undefined;
    constructor({ mysqlConfig, config }: {
        mysqlConfig: ViewBuilderConfig | undefined;
        config: {
            name: TName;
            schema: string | undefined;
            selectedFields: SelectedFields;
            query: SQL | undefined;
        };
    });
}
type MySqlViewWithSelection<TName extends string, TExisting extends boolean, TSelectedFields extends ColumnsSelection> = MySqlView<TName, TExisting, TSelectedFields> & TSelectedFields;
declare function mysqlView<TName extends string>(name: TName): ViewBuilder<TName>;
declare function mysqlView<TName extends string, TColumns extends Record<string, AnyMySqlColumnBuilder>>(name: TName, columns: TColumns): ManualViewBuilder<TName, TColumns>;

interface JoinsValue {
    on: SQL | undefined;
    table: AnyMySqlTable | Subquery | MySqlViewBase | SQL;
    alias: string | undefined;
    joinType: JoinType;
}
type AnyMySqlSelect = MySqlSelect<any, any, any, any>;
type BuildAliasTable<TTable extends AnyTable, TAlias extends string> = MySqlTableWithColumns<Assume<UpdateTableConfig<TTable['_']['config'], {
    name: TAlias;
    columns: MapColumnsToTableAlias<TTable['_']['columns'], TAlias>;
}>, TableConfig>>;
interface MySqlSelectConfig {
    withList: Subquery[];
    fields: Record<string, unknown>;
    fieldsFlat?: SelectedFieldsOrdered;
    where?: SQL;
    having?: SQL;
    table: AnyMySqlTable | Subquery | MySqlViewBase | SQL;
    limit?: number | Placeholder;
    offset?: number | Placeholder;
    joins: JoinsValue[];
    orderBy: (AnyMySqlColumn | SQL | SQL.Aliased)[];
    groupBy: (AnyMySqlColumn | SQL | SQL.Aliased)[];
    lockingClause?: {
        strength: LockStrength;
        config: LockConfig;
    };
}
type JoinFn<THKT extends MySqlSelectHKTBase, TTableName extends string | undefined, TSelectMode extends SelectMode, TJoinType extends JoinType, TSelection, TNullabilityMap extends Record<string, JoinNullability>> = <TJoinedTable extends AnyMySqlTable | Subquery | MySqlViewBase | SQL, TJoinedName extends GetSelectTableName<TJoinedTable> = GetSelectTableName<TJoinedTable>>(table: TJoinedTable, on: ((aliases: TSelection) => SQL | undefined) | SQL | undefined) => MySqlSelectKind<THKT, TTableName, AppendToResult<TTableName, TSelection, TJoinedName, TJoinedTable extends AnyMySqlTable ? TJoinedTable['_']['columns'] : TJoinedTable extends Subquery ? Assume<TJoinedTable['_']['selectedFields'], SelectedFields> : never, TSelectMode>, TSelectMode extends 'partial' ? TSelectMode : 'multiple', AppendToNullabilityMap<TNullabilityMap, TJoinedName, TJoinType>>;
type SelectedFieldsFlat = SelectedFieldsFlat$1<AnyMySqlColumn>;
type SelectedFields = SelectedFields$1<AnyMySqlColumn, AnyMySqlTable>;
type SelectedFieldsOrdered = SelectedFieldsOrdered$1<AnyMySqlColumn>;
type LockStrength = 'update' | 'share';
type LockConfig = {
    noWait: true;
    skipLocked?: undefined;
} | {
    noWait?: undefined;
    skipLocked: true;
} | {
    noWait?: undefined;
    skipLocked?: undefined;
};
interface MySqlSelectHKTBase {
    tableName: string | undefined;
    selection: unknown;
    selectMode: SelectMode;
    preparedQueryHKT: unknown;
    nullabilityMap: unknown;
    _type: unknown;
}
type MySqlSelectKind<T extends MySqlSelectHKTBase, TTableName extends string | undefined, TSelection, TSelectMode extends SelectMode, TNullabilityMap extends Record<string, JoinNullability>> = (T & {
    tableName: TTableName;
    selection: TSelection;
    selectMode: TSelectMode;
    nullabilityMap: TNullabilityMap;
})['_type'];
interface MySqlSelectQueryBuilderHKT extends MySqlSelectHKTBase {
    _type: MySqlSelectQueryBuilder<this, this['tableName'], Assume<this['selection'], ColumnsSelection>, this['selectMode'], Assume<this['nullabilityMap'], Record<string, JoinNullability>>>;
}
interface MySqlSelectHKT extends MySqlSelectHKTBase {
    _type: MySqlSelect<this['tableName'], Assume<this['selection'], ColumnsSelection>, this['selectMode'], Assume<this['preparedQueryHKT'], PreparedQueryHKTBase>, Assume<this['nullabilityMap'], Record<string, JoinNullability>>>;
}

export { SelectedFieldsFlat as $, AnyMySqlTable as A, BuildAliasTable as B, Check as C, primaryKey as D, PrimaryKeyBuilder as E, ForeignKey as F, GetColumnsTable as G, MySqlDeleteConfig as H, Index as I, MySqlDelete as J, MySqlInsertConfig as K, AnyMySqlInsertConfig as L, MySqlColumnBuilderWithAutoIncrement as M, MySqlInsertValue as N, MySqlInsertBuilder as O, PrimaryKey as P, MySqlInsert as Q, ReferenceConfig as R, QueryBuilder as S, MySqlSelectBuilder as T, UpdateDeleteAction as U, MySqlSelectQueryBuilder as V, MySqlSelect as W, JoinsValue as X, AnyMySqlSelect as Y, MySqlSelectConfig as Z, JoinFn as _, MySqlColumnWithAutoIncrement as a, SelectedFields as a0, SelectedFieldsOrdered as a1, LockStrength as a2, LockConfig as a3, MySqlSelectHKTBase as a4, MySqlSelectKind as a5, MySqlSelectQueryBuilderHKT as a6, MySqlSelectHKT as a7, MySqlUpdateConfig as a8, MySqlUpdateSetSource as a9, MySqlViewConfig as aA, MySqlViewWithSelection as aB, MySqlUpdateBuilder as aa, MySqlUpdate as ab, QueryResultHKT as ac, QueryResultKind as ad, PreparedQueryConfig as ae, PreparedQueryHKT as af, PreparedQueryKind as ag, PreparedQuery as ah, MySqlTransactionConfig as ai, MySqlSession as aj, MySqlTransaction as ak, PreparedQueryHKTBase as al, SubqueryWithSelection as am, WithSubqueryWithSelection as an, MySqlTableExtraConfig as ao, TableConfig as ap, MySqlTable as aq, MySqlTableWithColumns as ar, mysqlTableWithSchema as as, mysqlTable as at, mysqlTableCreator as au, ViewBuilderConfig as av, ViewBuilderCore as aw, ViewBuilder as ax, ManualViewBuilder as ay, MySqlViewBase as az, MySqlColumnBuilder as b, MySqlColumn as c, MySqlTableFn as d, AnyMySqlColumn as e, MySqlView as f, CheckBuilder as g, check as h, MySqlColumnBuilderHKT as i, MySqlColumnHKT as j, AnyMySqlColumnBuilder as k, MySqlColumnWithAutoIncrementConfig as l, mysqlView as m, MySqlDatabase as n, MySqlDialect as o, Reference as p, ForeignKeyBuilder as q, AnyForeignKeyBuilder as r, foreignKey as s, IndexColumn as t, IndexBuilderOn as u, AnyIndexBuilder as v, IndexBuilder as w, GetColumnsTableName as x, index as y, uniqueIndex as z };
