import { T as TransactionRollbackError } from './errors-bb636d84.mjs';
import { T as Table, J as ColumnBuilder, C as Column, Q as QueryPromise, S as SQL, a as Param, b as mapUpdateSet, s as sql, h as SelectionProxyHandler, j as getTableColumns, V as View, n as name, o as orderSelectedFields, k as getTableName, l as Subquery, p as SubqueryConfig, q as ViewBaseConfig, u as aliasedTableColumn, v as aliasedRelation, w as mapColumnsInAliasedSQLToAlias, x as operators, y as mapColumnsInSQLToAlias, z as orderByOperators, R as Relation, A as normalizeRelation, B as and, D as or, E as aliasedTable, F as eq, I as applyMixins, G as TypedQueryBuilder, H as getTableLikeName, W as WithSubquery, d as mapRelationalRow } from './relations-3eb6fe55.mjs';

/** @internal */
const InlineForeignKeys = Symbol('InlineForeignKeys');
class MySqlTable extends Table {
    /** @internal */
    static Symbol = Object.assign({}, Table.Symbol, {
        InlineForeignKeys: InlineForeignKeys,
    });
    /** @internal */
    [Table.Symbol.Columns];
    /** @internal */
    [InlineForeignKeys] = [];
    /** @internal */
    [Table.Symbol.ExtraConfigBuilder] = undefined;
}
function mysqlTableWithSchema(name, columns, extraConfig, schema, baseName = name) {
    const rawTable = new MySqlTable(name, schema, baseName);
    const builtColumns = Object.fromEntries(Object.entries(columns).map(([name, colBuilder]) => {
        const column = colBuilder.build(rawTable);
        rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
        return [name, column];
    }));
    const table = Object.assign(rawTable, builtColumns);
    table[Table.Symbol.Columns] = builtColumns;
    if (extraConfig) {
        table[MySqlTable.Symbol.ExtraConfigBuilder] = extraConfig;
    }
    return table;
}
const mysqlTable = (name, columns, extraConfig) => {
    return mysqlTableWithSchema(name, columns, extraConfig, undefined, name);
};
function mysqlTableCreator(customizeTableName) {
    return (name, columns, extraConfig) => {
        return mysqlTableWithSchema(customizeTableName(name), columns, extraConfig, undefined, name);
    };
}

class ForeignKeyBuilder {
    /** @internal */
    reference;
    /** @internal */
    _onUpdate;
    /** @internal */
    _onDelete;
    constructor(config, actions) {
        this.reference = () => {
            const { columns, foreignColumns } = config();
            return { columns, foreignTable: foreignColumns[0].table, foreignColumns };
        };
        if (actions) {
            this._onUpdate = actions.onUpdate;
            this._onDelete = actions.onDelete;
        }
    }
    onUpdate(action) {
        this._onUpdate = action;
        return this;
    }
    onDelete(action) {
        this._onDelete = action;
        return this;
    }
    /** @internal */
    build(table) {
        return new ForeignKey(table, this);
    }
}
class ForeignKey {
    table;
    reference;
    onUpdate;
    onDelete;
    constructor(table, builder) {
        this.table = table;
        this.reference = builder.reference;
        this.onUpdate = builder._onUpdate;
        this.onDelete = builder._onDelete;
    }
    getName() {
        const { columns, foreignColumns } = this.reference();
        const columnNames = columns.map((column) => column.name);
        const foreignColumnNames = foreignColumns.map((column) => column.name);
        const chunks = [
            this.table[MySqlTable.Symbol.Name],
            ...columnNames,
            foreignColumns[0].table[MySqlTable.Symbol.Name],
            ...foreignColumnNames,
        ];
        return `${chunks.join('_')}_fk`;
    }
}
function foreignKey(config) {
    function mappedConfig() {
        const { columns, foreignColumns } = config;
        return {
            columns,
            foreignColumns,
        };
    }
    return new ForeignKeyBuilder(mappedConfig);
}

class MySqlColumnBuilder extends ColumnBuilder {
    foreignKeyConfigs = [];
    references(ref, actions = {}) {
        this.foreignKeyConfigs.push({ ref, actions });
        return this;
    }
    /** @internal */
    buildForeignKeys(column, table) {
        return this.foreignKeyConfigs.map(({ ref, actions }) => {
            return ((ref, actions) => {
                const builder = new ForeignKeyBuilder(() => {
                    const foreignColumn = ref();
                    return { columns: [column], foreignColumns: [foreignColumn] };
                });
                if (actions.onUpdate) {
                    builder.onUpdate(actions.onUpdate);
                }
                if (actions.onDelete) {
                    builder.onDelete(actions.onDelete);
                }
                return builder.build(table);
            })(ref, actions);
        });
    }
}
// To understand how to use `MySqlColumn` and `AnyMySqlColumn`, see `Column` and `AnyColumn` documentation.
class MySqlColumn extends Column {
}
class MySqlColumnBuilderWithAutoIncrement extends MySqlColumnBuilder {
    constructor(name) {
        super(name);
        this.config.autoIncrement = false;
    }
    autoincrement() {
        this.config.autoIncrement = true;
        this.config.hasDefault = true;
        return this;
    }
}
class MySqlColumnWithAutoIncrement extends MySqlColumn {
    autoIncrement = this.config.autoIncrement;
}

class MySqlDelete extends QueryPromise {
    table;
    session;
    dialect;
    config;
    constructor(table, session, dialect) {
        super();
        this.table = table;
        this.session = session;
        this.dialect = dialect;
        this.config = { table };
    }
    where(where) {
        this.config.where = where;
        return this;
    }
    /** @internal */
    getSQL() {
        return this.dialect.buildDeleteQuery(this.config);
    }
    toSQL() {
        const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
        return rest;
    }
    prepare() {
        return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning);
    }
    execute = (placeholderValues) => {
        return this.prepare().execute(placeholderValues);
    };
    createIterator = () => {
        const self = this;
        return async function* (placeholderValues) {
            yield* self.prepare().iterator(placeholderValues);
        };
    };
    iterator = this.createIterator();
}

class MySqlInsertBuilder {
    table;
    session;
    dialect;
    shouldIgnore = false;
    constructor(table, session, dialect) {
        this.table = table;
        this.session = session;
        this.dialect = dialect;
    }
    ignore() {
        this.shouldIgnore = true;
        return this;
    }
    values(values) {
        values = Array.isArray(values) ? values : [values];
        if (values.length === 0) {
            throw new Error('values() must be called with at least one value');
        }
        const mappedValues = values.map((entry) => {
            const result = {};
            const cols = this.table[Table.Symbol.Columns];
            for (const colKey of Object.keys(entry)) {
                const colValue = entry[colKey];
                result[colKey] = colValue instanceof SQL ? colValue : new Param(colValue, cols[colKey]);
            }
            return result;
        });
        return new MySqlInsert(this.table, mappedValues, this.shouldIgnore, this.session, this.dialect);
    }
}
class MySqlInsert extends QueryPromise {
    session;
    dialect;
    config;
    constructor(table, values, ignore, session, dialect) {
        super();
        this.session = session;
        this.dialect = dialect;
        this.config = { table, values, ignore };
    }
    onDuplicateKeyUpdate(config) {
        const setSql = this.dialect.buildUpdateSet(this.config.table, mapUpdateSet(this.config.table, config.set));
        this.config.onConflict = sql `update ${setSql}`;
        return this;
    }
    /** @internal */
    getSQL() {
        return this.dialect.buildInsertQuery(this.config);
    }
    toSQL() {
        const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
        return rest;
    }
    prepare() {
        return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), undefined);
    }
    execute = (placeholderValues) => {
        return this.prepare().execute(placeholderValues);
    };
    createIterator = () => {
        const self = this;
        return async function* (placeholderValues) {
            yield* self.prepare().iterator(placeholderValues);
        };
    };
    iterator = this.createIterator();
}

class ViewBuilderCore {
    name;
    schema;
    constructor(name, schema) {
        this.name = name;
        this.schema = schema;
    }
    config = {};
    algorithm(algorithm) {
        this.config.algorithm = algorithm;
        return this;
    }
    definer(definer) {
        this.config.definer = definer;
        return this;
    }
    sqlSecurity(sqlSecurity) {
        this.config.sqlSecurity = sqlSecurity;
        return this;
    }
    withCheckOption(withCheckOption) {
        this.config.withCheckOption = withCheckOption ?? 'cascaded';
        return this;
    }
}
class ViewBuilder extends ViewBuilderCore {
    as(qb) {
        if (typeof qb === 'function') {
            qb = qb(new QueryBuilder());
        }
        const selectionProxy = new SelectionProxyHandler({
            alias: this.name,
            sqlBehavior: 'error',
            sqlAliasedBehavior: 'alias',
            replaceOriginalName: true,
        });
        const aliasedSelection = new Proxy(qb.getSelectedFields(), selectionProxy);
        return new Proxy(new MySqlView({
            mysqlConfig: this.config,
            config: {
                name: this.name,
                schema: this.schema,
                selectedFields: aliasedSelection,
                query: qb.getSQL().inlineParams(),
            },
        }), selectionProxy);
    }
}
class ManualViewBuilder extends ViewBuilderCore {
    columns;
    constructor(name, columns, schema) {
        super(name, schema);
        this.columns = getTableColumns(mysqlTable(name, columns));
    }
    existing() {
        return new Proxy(new MySqlView({
            mysqlConfig: undefined,
            config: {
                name: this.name,
                schema: this.schema,
                selectedFields: this.columns,
                query: undefined,
            },
        }), new SelectionProxyHandler({
            alias: this.name,
            sqlBehavior: 'error',
            sqlAliasedBehavior: 'alias',
            replaceOriginalName: true,
        }));
    }
    as(query) {
        return new Proxy(new MySqlView({
            mysqlConfig: this.config,
            config: {
                name: this.name,
                schema: this.schema,
                selectedFields: this.columns,
                query: query.inlineParams(),
            },
        }), new SelectionProxyHandler({
            alias: this.name,
            sqlBehavior: 'error',
            sqlAliasedBehavior: 'alias',
            replaceOriginalName: true,
        }));
    }
}
class MySqlViewBase extends View {
}
const MySqlViewConfig = Symbol('MySqlViewConfig');
class MySqlView extends MySqlViewBase {
    [MySqlViewConfig];
    constructor({ mysqlConfig, config }) {
        super(config);
        this[MySqlViewConfig] = mysqlConfig;
    }
}
/** @internal */
function mysqlViewWithSchema(name, selection, schema) {
    if (selection) {
        return new ManualViewBuilder(name, selection, schema);
    }
    return new ViewBuilder(name, schema);
}
function mysqlView(name, selection) {
    return mysqlViewWithSchema(name, selection, undefined);
}

// TODO find out how to use all/values. Seems like I need those functions
// Build project
// copy runtime tests to be sure it's working
// Add mysql to drizzle-kit
// Add Planetscale Driver and create example repo
class MySqlDialect {
    async migrate(migrations, session, config) {
        const migrationsTable = config.migrationsTable ?? '__drizzle_migrations';
        const migrationTableCreate = sql `
			create table if not exists ${name(migrationsTable)} (
				id serial primary key,
				hash text not null,
				created_at bigint
			)
		`;
        await session.execute(migrationTableCreate);
        const dbMigrations = await session.all(sql `select id, hash, created_at from ${name(migrationsTable)} order by created_at desc limit 1`);
        const lastDbMigration = dbMigrations[0];
        await session.transaction(async (tx) => {
            for (const migration of migrations) {
                if (!lastDbMigration
                    || Number(lastDbMigration.created_at) < migration.folderMillis) {
                    for (const stmt of migration.sql) {
                        await tx.execute(sql.raw(stmt));
                    }
                    await tx.execute(sql `insert into ${name(migrationsTable)} (\`hash\`, \`created_at\`) values(${migration.hash}, ${migration.folderMillis})`);
                }
            }
        });
    }
    escapeName(name) {
        return `\`${name}\``;
    }
    escapeParam(_num) {
        return `?`;
    }
    escapeString(str) {
        return `'${str.replace(/'/g, "''")}'`;
    }
    buildDeleteQuery({ table, where, returning }) {
        const returningSql = returning
            ? sql ` returning ${this.buildSelection(returning, { isSingleTable: true })}`
            : undefined;
        const whereSql = where ? sql ` where ${where}` : undefined;
        return sql `delete from ${table}${whereSql}${returningSql}`;
    }
    buildUpdateSet(table, set) {
        const setEntries = Object.entries(set);
        const setSize = setEntries.length;
        return sql.fromList(setEntries
            .flatMap(([colName, value], i) => {
            const col = table[Table.Symbol.Columns][colName];
            const res = sql `${name(col.name)} = ${value}`;
            if (i < setSize - 1) {
                return [res, sql.raw(', ')];
            }
            return [res];
        }));
    }
    buildUpdateQuery({ table, set, where, returning }) {
        const setSql = this.buildUpdateSet(table, set);
        const returningSql = returning
            ? sql ` returning ${this.buildSelection(returning, { isSingleTable: true })}`
            : undefined;
        const whereSql = where ? sql ` where ${where}` : undefined;
        return sql `update ${table} set ${setSql}${whereSql}${returningSql}`;
    }
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
    buildSelection(fields, { isSingleTable = false } = {}) {
        const columnsLen = fields.length;
        const chunks = fields
            .flatMap(({ field }, i) => {
            const chunk = [];
            if (field instanceof SQL.Aliased && field.isSelectionField) {
                chunk.push(name(field.fieldAlias));
            }
            else if (field instanceof SQL.Aliased || field instanceof SQL) {
                const query = field instanceof SQL.Aliased ? field.sql : field;
                if (isSingleTable) {
                    chunk.push(new SQL(query.queryChunks.map((c) => {
                        if (c instanceof MySqlColumn) {
                            return name(c.name);
                        }
                        return c;
                    })));
                }
                else {
                    chunk.push(query);
                }
                if (field instanceof SQL.Aliased) {
                    chunk.push(sql ` as ${name(field.fieldAlias)}`);
                }
            }
            else if (field instanceof Column) {
                if (isSingleTable) {
                    chunk.push(name(field.name));
                }
                else {
                    chunk.push(field);
                }
            }
            if (i < columnsLen - 1) {
                chunk.push(sql `, `);
            }
            return chunk;
        });
        return sql.fromList(chunks);
    }
    buildSelectQuery({ withList, fields, fieldsFlat, where, having, table, joins, orderBy, groupBy, limit, offset, lockingClause }) {
        const fieldsList = fieldsFlat ?? orderSelectedFields(fields);
        for (const f of fieldsList) {
            if (f.field instanceof Column
                && getTableName(f.field.table)
                    !== (table instanceof Subquery
                        ? table[SubqueryConfig].alias
                        : table instanceof MySqlViewBase
                            ? table[ViewBaseConfig].name
                            : table instanceof SQL
                                ? undefined
                                : getTableName(table))
                && !((table) => joins.some(({ alias }) => alias === (table[Table.Symbol.IsAlias] ? getTableName(table) : table[Table.Symbol.BaseName])))(f.field.table)) {
                const tableName = getTableName(f.field.table);
                throw new Error(`Your "${f.path.join('->')}" field references a column "${tableName}"."${f.field.name}", but the table "${tableName}" is not part of the query! Did you forget to join it?`);
            }
        }
        const isSingleTable = joins.length === 0;
        let withSql;
        if (withList.length) {
            const withSqlChunks = [sql `with `];
            for (const [i, w] of withList.entries()) {
                withSqlChunks.push(sql `${name(w[SubqueryConfig].alias)} as (${w[SubqueryConfig].sql})`);
                if (i < withList.length - 1) {
                    withSqlChunks.push(sql `, `);
                }
            }
            withSqlChunks.push(sql ` `);
            withSql = sql.fromList(withSqlChunks);
        }
        const selection = this.buildSelection(fieldsList, { isSingleTable });
        const tableSql = (() => {
            if (table instanceof Table && table[Table.Symbol.OriginalName] !== table[Table.Symbol.Name]) {
                return sql `${name(table[Table.Symbol.OriginalName])} ${name(table[Table.Symbol.Name])}`;
            }
            return table;
        })();
        const joinsArray = [];
        for (const [index, joinMeta] of joins.entries()) {
            if (index === 0) {
                joinsArray.push(sql ` `);
            }
            const table = joinMeta.table;
            if (table instanceof MySqlTable) {
                const tableName = table[MySqlTable.Symbol.Name];
                const tableSchema = table[MySqlTable.Symbol.Schema];
                const origTableName = table[MySqlTable.Symbol.OriginalName];
                const alias = tableName === origTableName ? undefined : joinMeta.alias;
                joinsArray.push(sql `${sql.raw(joinMeta.joinType)} join ${tableSchema ? sql `${name(tableSchema)}.` : undefined}${name(origTableName)}${alias && sql ` ${name(alias)}`} on ${joinMeta.on}`);
            }
            else if (table instanceof View) {
                const viewName = table[ViewBaseConfig].name;
                const viewSchema = table[ViewBaseConfig].schema;
                const origViewName = table[ViewBaseConfig].originalName;
                const alias = viewName === origViewName ? undefined : joinMeta.alias;
                joinsArray.push(sql `${sql.raw(joinMeta.joinType)} join ${viewSchema ? sql `${name(viewSchema)}.` : undefined}${name(origViewName)}${alias && sql ` ${name(alias)}`} on ${joinMeta.on}`);
            }
            else {
                joinsArray.push(sql `${sql.raw(joinMeta.joinType)} join ${table} on ${joinMeta.on}`);
            }
            if (index < joins.length - 1) {
                joinsArray.push(sql ` `);
            }
        }
        const joinsSql = sql.fromList(joinsArray);
        const whereSql = where ? sql ` where ${where}` : undefined;
        const havingSql = having ? sql ` having ${having}` : undefined;
        const orderByList = [];
        for (const [index, orderByValue] of orderBy.entries()) {
            orderByList.push(orderByValue);
            if (index < orderBy.length - 1) {
                orderByList.push(sql `, `);
            }
        }
        const orderBySql = orderByList.length > 0 ? sql ` order by ${sql.fromList(orderByList)}` : undefined;
        const groupByList = [];
        for (const [index, groupByValue] of groupBy.entries()) {
            groupByList.push(groupByValue);
            if (index < groupBy.length - 1) {
                groupByList.push(sql `, `);
            }
        }
        const groupBySql = groupByList.length > 0 ? sql ` group by ${sql.fromList(groupByList)}` : undefined;
        const limitSql = limit ? sql ` limit ${limit}` : undefined;
        const offsetSql = offset ? sql ` offset ${offset}` : undefined;
        let lockingClausesSql;
        if (lockingClause) {
            const { config, strength } = lockingClause;
            lockingClausesSql = sql ` for ${sql.raw(strength)}`;
            if (config.noWait) {
                lockingClausesSql.append(sql ` no wait`);
            }
            else if (config.skipLocked) {
                lockingClausesSql.append(sql ` skip locked`);
            }
        }
        return sql `${withSql}select ${selection} from ${tableSql}${joinsSql}${whereSql}${groupBySql}${havingSql}${orderBySql}${limitSql}${offsetSql}${lockingClausesSql}`;
    }
    buildInsertQuery({ table, values, ignore, onConflict }) {
        const isSingleValue = values.length === 1;
        const valuesSqlList = [];
        const columns = table[Table.Symbol.Columns];
        const colEntries = isSingleValue
            ? Object.keys(values[0]).map((fieldName) => [fieldName, columns[fieldName]])
            : Object.entries(columns);
        const insertOrder = colEntries.map(([, column]) => name(column.name));
        for (const [valueIndex, value] of values.entries()) {
            const valueList = [];
            for (const [fieldName] of colEntries) {
                const colValue = value[fieldName];
                if (colValue === undefined || (colValue instanceof Param && colValue.value === undefined)) {
                    valueList.push(sql `default`);
                }
                else {
                    valueList.push(colValue);
                }
            }
            valuesSqlList.push(valueList);
            if (valueIndex < values.length - 1) {
                valuesSqlList.push(sql `, `);
            }
        }
        const valuesSql = sql.fromList(valuesSqlList);
        const ignoreSql = ignore ? sql ` ignore` : undefined;
        const onConflictSql = onConflict ? sql ` on duplicate key ${onConflict}` : undefined;
        return sql `insert${ignoreSql} into ${table} ${insertOrder} values ${valuesSql}${onConflictSql}`;
    }
    sqlToQuery(sql) {
        return sql.toQuery({
            escapeName: this.escapeName,
            escapeParam: this.escapeParam,
            escapeString: this.escapeString,
        });
    }
    buildRelationalQuery(fullSchema, schema, tableNamesMap, table, tableConfig, config, tableAlias, relationColumns, isRoot = false) {
        if (config === true) {
            const selectionEntries = Object.entries(tableConfig.columns);
            const selection = selectionEntries.map(([key, value]) => ({
                dbKey: value.name,
                tsKey: key,
                field: value,
                tableTsKey: undefined,
                isJson: false,
                selection: [],
            }));
            return {
                tableTsKey: tableConfig.tsName,
                sql: table,
                selection,
            };
        }
        const aliasedColumns = Object.fromEntries(Object.entries(tableConfig.columns).map(([key, value]) => [key, aliasedTableColumn(value, tableAlias)]));
        const aliasedRelations = Object.fromEntries(Object.entries(tableConfig.relations).map(([key, value]) => [key, aliasedRelation(value, tableAlias)]));
        const aliasedFields = Object.assign({}, aliasedColumns, aliasedRelations);
        const fieldsSelection = {};
        let selectedColumns = [];
        let selectedExtras = [];
        let selectedRelations = [];
        if (config.columns) {
            let isIncludeMode = false;
            for (const [field, value] of Object.entries(config.columns)) {
                if (value === undefined) {
                    continue;
                }
                if (field in tableConfig.columns) {
                    if (!isIncludeMode && value === true) {
                        isIncludeMode = true;
                    }
                    selectedColumns.push(field);
                }
            }
            if (selectedColumns.length > 0) {
                selectedColumns = isIncludeMode
                    ? selectedColumns.filter((c) => config.columns?.[c] === true)
                    : Object.keys(tableConfig.columns).filter((key) => !selectedColumns.includes(key));
            }
        }
        if (config.with) {
            selectedRelations = Object.entries(config.with)
                .filter((entry) => !!entry[1])
                .map(([key, value]) => ({ key, value }));
        }
        if (!config.columns) {
            selectedColumns = Object.keys(tableConfig.columns);
        }
        if (config.extras) {
            const extrasOrig = typeof config.extras === 'function'
                ? config.extras(aliasedFields, { sql })
                : config.extras;
            selectedExtras = Object.entries(extrasOrig).map(([key, value]) => ({
                key,
                value: mapColumnsInAliasedSQLToAlias(value, tableAlias),
            }));
        }
        for (const field of selectedColumns) {
            const column = tableConfig.columns[field];
            fieldsSelection[field] = column;
        }
        for (const { key, value } of selectedExtras) {
            fieldsSelection[key] = value;
        }
        let where;
        if (config.where) {
            const whereSql = typeof config.where === 'function' ? config.where(aliasedFields, operators) : config.where;
            where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
        }
        const groupBy = (tableConfig.primaryKey.length ? tableConfig.primaryKey : Object.values(tableConfig.columns)).map((c) => aliasedTableColumn(c, tableAlias));
        let orderByOrig = typeof config.orderBy === 'function'
            ? config.orderBy(aliasedFields, orderByOperators)
            : config.orderBy ?? [];
        if (!Array.isArray(orderByOrig)) {
            orderByOrig = [orderByOrig];
        }
        const orderBy = orderByOrig.map((orderByValue) => {
            if (orderByValue instanceof Column) {
                return aliasedTableColumn(orderByValue, tableAlias);
            }
            return mapColumnsInSQLToAlias(orderByValue, tableAlias);
        });
        const builtRelations = [];
        const builtRelationFields = [];
        let result;
        let selectedRelationIndex = 0;
        for (const { key: selectedRelationKey, value: selectedRelationValue } of selectedRelations) {
            let relation;
            for (const [relationKey, relationValue] of Object.entries(tableConfig.relations)) {
                if (relationValue instanceof Relation && relationKey === selectedRelationKey) {
                    relation = relationValue;
                    break;
                }
            }
            if (!relation) {
                throw new Error(`Relation ${selectedRelationKey} not found`);
            }
            const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
            const relationAlias = `${tableAlias}_${selectedRelationKey}`;
            const builtRelation = this.buildRelationalQuery(fullSchema, schema, tableNamesMap, fullSchema[tableNamesMap[relation.referencedTable[Table.Symbol.Name]]], schema[tableNamesMap[relation.referencedTable[Table.Symbol.Name]]], selectedRelationValue, relationAlias, normalizedRelation.references);
            builtRelations.push({ key: selectedRelationKey, value: builtRelation });
            let relationWhere;
            if (typeof selectedRelationValue === 'object' && selectedRelationValue.limit) {
                const field = sql `${sql.identifier(relationAlias)}.${sql.identifier('__drizzle_row_number')}`;
                relationWhere = and(relationWhere, or(and(sql `${field} <= ${selectedRelationValue.limit}`), sql `(${field} is null)`));
            }
            const join = {
                table: builtRelation.sql instanceof Table
                    ? aliasedTable(builtRelation.sql, relationAlias)
                    : new Subquery(builtRelation.sql, {}, relationAlias),
                alias: relationAlias,
                on: and(...normalizedRelation.fields.map((field, i) => eq(aliasedTableColumn(field, tableAlias), aliasedTableColumn(normalizedRelation.references[i], relationAlias)))),
                joinType: 'left',
            };
            const elseField = sql `json_arrayagg(json_array(${sql.join(builtRelation.selection.map(({ dbKey: key, isJson }) => {
                const field = sql `${sql.identifier(relationAlias)}.${sql.identifier(key)}`;
                return isJson ? sql `cast(${field} as json)` : field;
            }), sql `, `)}))`;
            const countSql = normalizedRelation.references.length === 1
                ? aliasedTableColumn(normalizedRelation.references[0], relationAlias)
                : sql.fromList([
                    sql `coalesce(`,
                    sql.join(normalizedRelation.references.map((c) => aliasedTableColumn(c, relationAlias)), sql.raw(', ')),
                    sql.raw(')'),
                ]);
            const field = sql `if(count(${countSql}) = 0, '[]', ${elseField})`.as(selectedRelationKey);
            const builtRelationField = {
                path: [selectedRelationKey],
                field,
            };
            result = this.buildSelectQuery({
                table: result ? new Subquery(result, {}, tableAlias) : aliasedTable(table, tableAlias),
                fields: {},
                fieldsFlat: [
                    ...Object.entries(tableConfig.columns).map(([tsKey, column]) => ({
                        path: [tsKey],
                        field: aliasedTableColumn(column, tableAlias),
                    })),
                    ...(selectedRelationIndex === selectedRelations.length - 1
                        ? selectedExtras.map(({ key, value }) => ({
                            path: [key],
                            field: value,
                        }))
                        : []),
                    ...builtRelationFields.map(({ path, field }) => ({
                        path,
                        field: sql `${sql.identifier(tableAlias)}.${sql.identifier(field.fieldAlias)}`,
                    })),
                    builtRelationField,
                ],
                where: relationWhere,
                groupBy,
                orderBy: selectedRelationIndex === selectedRelations.length - 1 ? orderBy : [],
                joins: [join],
                withList: [],
            });
            builtRelationFields.push(builtRelationField);
            selectedRelationIndex++;
        }
        const finalFieldsSelection = Object.entries(fieldsSelection).map(([key, value]) => {
            return {
                path: [key],
                field: value instanceof Column ? aliasedTableColumn(value, tableAlias) : value,
            };
        });
        const finalFieldsFlat = isRoot
            ? [
                ...finalFieldsSelection.map(({ path, field }) => ({
                    path,
                    field: field instanceof SQL.Aliased ? sql `${sql.identifier(field.fieldAlias)}` : field,
                })),
                ...builtRelationFields.map(({ path, field }) => ({
                    path,
                    field: sql `cast(${sql.identifier(field.fieldAlias)} as json)`,
                })),
            ]
            : [
                ...Object.entries(tableConfig.columns).map(([tsKey, column]) => ({
                    path: [tsKey],
                    field: aliasedTableColumn(column, tableAlias),
                })),
                ...selectedExtras.map(({ key, value }) => ({
                    path: [key],
                    field: value,
                })),
                ...builtRelationFields.map(({ path, field }) => ({
                    path,
                    field: sql `${sql.identifier(tableAlias)}.${sql.identifier(field.fieldAlias)}`,
                })),
            ];
        if (finalFieldsFlat.length === 0) {
            finalFieldsFlat.push({
                path: [],
                field: sql.raw('1'),
            });
        }
        if (!isRoot && !config.limit && orderBy.length > 0) {
            finalFieldsFlat.push({
                path: ['__drizzle_row_number'],
                field: sql `row_number() over(order by ${sql.join(orderBy, sql `, `)})`,
            });
        }
        let limit, offset;
        if (config.limit !== undefined || config.offset !== undefined) {
            if (isRoot) {
                limit = config.limit;
                offset = config.offset;
            }
            else {
                finalFieldsFlat.push({
                    path: ['__drizzle_row_number'],
                    field: sql `row_number() over(partition by ${relationColumns.map((c) => aliasedTableColumn(c, tableAlias))}${(orderBy.length > 0 && !isRoot) ? sql ` order by ${sql.join(orderBy, sql `, `)}` : undefined})`
                        .as('__drizzle_row_number'),
                });
            }
        }
        result = this.buildSelectQuery({
            table: result ? new Subquery(result, {}, tableAlias) : aliasedTable(table, tableAlias),
            fields: {},
            fieldsFlat: finalFieldsFlat,
            where,
            groupBy: [],
            orderBy: isRoot ? orderBy : [],
            joins: [],
            withList: [],
            limit,
            offset: offset,
        });
        return {
            tableTsKey: tableConfig.tsName,
            sql: result,
            selection: [
                ...finalFieldsSelection.map(({ path, field }) => ({
                    dbKey: field instanceof SQL.Aliased ? field.fieldAlias : tableConfig.columns[path[0]].name,
                    tsKey: path[0],
                    field,
                    tableTsKey: undefined,
                    isJson: false,
                    selection: [],
                })),
                ...builtRelations.map(({ key, value }) => ({
                    dbKey: key,
                    tsKey: key,
                    field: undefined,
                    tableTsKey: value.tableTsKey,
                    isJson: true,
                    selection: value.selection,
                })),
            ],
        };
    }
}

class MySqlSelectBuilder {
    fields;
    session;
    dialect;
    withList;
    constructor(fields, session, dialect, withList = []) {
        this.fields = fields;
        this.session = session;
        this.dialect = dialect;
        this.withList = withList;
    }
    from(source) {
        const isPartialSelect = !!this.fields;
        let fields;
        if (this.fields) {
            fields = this.fields;
        }
        else if (source instanceof Subquery) {
            // This is required to use the proxy handler to get the correct field values from the subquery
            fields = Object.fromEntries(Object.keys(source[SubqueryConfig].selection).map((key) => [key, source[key]]));
        }
        else if (source instanceof MySqlViewBase) {
            fields = source[ViewBaseConfig].selectedFields;
        }
        else if (source instanceof SQL) {
            fields = {};
        }
        else {
            fields = getTableColumns(source);
        }
        return new MySqlSelect(source, fields, isPartialSelect, this.session, this.dialect, this.withList);
    }
}
class MySqlSelectQueryBuilder extends TypedQueryBuilder {
    isPartialSelect;
    session;
    dialect;
    _;
    config;
    joinsNotNullableMap;
    tableName;
    constructor(table, fields, isPartialSelect, 
    /** @internal */
    session, dialect, withList) {
        super();
        this.isPartialSelect = isPartialSelect;
        this.session = session;
        this.dialect = dialect;
        this.config = {
            withList,
            table,
            fields: { ...fields },
            joins: [],
            orderBy: [],
            groupBy: [],
        };
        this._ = {
            selectedFields: fields,
        };
        this.tableName = getTableLikeName(table);
        this.joinsNotNullableMap = typeof this.tableName === 'string' ? { [this.tableName]: true } : {};
    }
    createJoin(joinType) {
        return (table, on) => {
            const baseTableName = this.tableName;
            const tableName = getTableLikeName(table);
            if (typeof tableName === 'string' && this.config.joins.some((join) => join.alias === tableName)) {
                throw new Error(`Alias "${tableName}" is already used in this query`);
            }
            if (!this.isPartialSelect) {
                // If this is the first join and this is not a partial select and we're not selecting from raw SQL, "move" the fields from the main table to the nested object
                if (Object.keys(this.joinsNotNullableMap).length === 1 && typeof baseTableName === 'string') {
                    this.config.fields = {
                        [baseTableName]: this.config.fields,
                    };
                }
                if (typeof tableName === 'string' && !(table instanceof SQL)) {
                    const selection = table instanceof Subquery
                        ? table[SubqueryConfig].selection
                        : table instanceof View
                            ? table[ViewBaseConfig].selectedFields
                            : table[Table.Symbol.Columns];
                    this.config.fields[tableName] = selection;
                }
            }
            if (typeof on === 'function') {
                on = on(new Proxy(this.config.fields, new SelectionProxyHandler({ sqlAliasedBehavior: 'sql', sqlBehavior: 'sql' })));
            }
            this.config.joins.push({ on, table, joinType, alias: tableName });
            if (typeof tableName === 'string') {
                switch (joinType) {
                    case 'left': {
                        this.joinsNotNullableMap[tableName] = false;
                        break;
                    }
                    case 'right': {
                        this.joinsNotNullableMap = Object.fromEntries(Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false]));
                        this.joinsNotNullableMap[tableName] = true;
                        break;
                    }
                    case 'inner': {
                        this.joinsNotNullableMap[tableName] = true;
                        break;
                    }
                    case 'full': {
                        this.joinsNotNullableMap = Object.fromEntries(Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false]));
                        this.joinsNotNullableMap[tableName] = false;
                        break;
                    }
                }
            }
            return this;
        };
    }
    leftJoin = this.createJoin('left');
    rightJoin = this.createJoin('right');
    innerJoin = this.createJoin('inner');
    fullJoin = this.createJoin('full');
    where(where) {
        if (typeof where === 'function') {
            where = where(new Proxy(this.config.fields, new SelectionProxyHandler({ sqlAliasedBehavior: 'sql', sqlBehavior: 'sql' })));
        }
        this.config.where = where;
        return this;
    }
    having(having) {
        if (typeof having === 'function') {
            having = having(new Proxy(this.config.fields, new SelectionProxyHandler({ sqlAliasedBehavior: 'sql', sqlBehavior: 'sql' })));
        }
        this.config.having = having;
        return this;
    }
    groupBy(...columns) {
        if (typeof columns[0] === 'function') {
            const groupBy = columns[0](new Proxy(this.config.fields, new SelectionProxyHandler({ sqlAliasedBehavior: 'alias', sqlBehavior: 'sql' })));
            this.config.groupBy = Array.isArray(groupBy) ? groupBy : [groupBy];
        }
        else {
            this.config.groupBy = columns;
        }
        return this;
    }
    orderBy(...columns) {
        if (typeof columns[0] === 'function') {
            const orderBy = columns[0](new Proxy(this.config.fields, new SelectionProxyHandler({ sqlAliasedBehavior: 'alias', sqlBehavior: 'sql' })));
            this.config.orderBy = Array.isArray(orderBy) ? orderBy : [orderBy];
        }
        else {
            this.config.orderBy = columns;
        }
        return this;
    }
    limit(limit) {
        this.config.limit = limit;
        return this;
    }
    offset(offset) {
        this.config.offset = offset;
        return this;
    }
    for(strength, config = {}) {
        this.config.lockingClause = { strength, config };
        return this;
    }
    /** @internal */
    getSQL() {
        return this.dialect.buildSelectQuery(this.config);
    }
    toSQL() {
        const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
        return rest;
    }
    as(alias) {
        return new Proxy(new Subquery(this.getSQL(), this.config.fields, alias), new SelectionProxyHandler({ alias, sqlAliasedBehavior: 'alias', sqlBehavior: 'error' }));
    }
}
class MySqlSelect extends MySqlSelectQueryBuilder {
    prepare() {
        if (!this.session) {
            throw new Error('Cannot execute a query on a query builder. Please use a database instance instead.');
        }
        const fieldsList = orderSelectedFields(this.config.fields);
        const query = this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), fieldsList);
        query.joinsNotNullableMap = this.joinsNotNullableMap;
        return query;
    }
    execute = ((placeholderValues) => {
        return this.prepare().execute(placeholderValues);
    });
    createIterator = () => {
        const self = this;
        return async function* (placeholderValues) {
            yield* self.prepare().iterator(placeholderValues);
        };
    };
    iterator = this.createIterator();
}
applyMixins(MySqlSelect, [QueryPromise]);

class QueryBuilder {
    dialect;
    $with(alias) {
        const queryBuilder = this;
        return {
            as(qb) {
                if (typeof qb === 'function') {
                    qb = qb(queryBuilder);
                }
                return new Proxy(new WithSubquery(qb.getSQL(), qb.getSelectedFields(), alias, true), new SelectionProxyHandler({ alias, sqlAliasedBehavior: 'alias', sqlBehavior: 'error' }));
            },
        };
    }
    with(...queries) {
        const self = this;
        function select(fields) {
            return new MySqlSelectBuilder(fields ?? undefined, undefined, self.getDialect(), queries);
        }
        return { select };
    }
    select(fields) {
        return new MySqlSelectBuilder(fields ?? undefined, undefined, this.getDialect());
    }
    // Lazy load dialect to avoid circular dependency
    getDialect() {
        if (!this.dialect) {
            this.dialect = new MySqlDialect();
        }
        return this.dialect;
    }
}

class MySqlUpdateBuilder {
    table;
    session;
    dialect;
    constructor(table, session, dialect) {
        this.table = table;
        this.session = session;
        this.dialect = dialect;
    }
    set(values) {
        return new MySqlUpdate(this.table, mapUpdateSet(this.table, values), this.session, this.dialect);
    }
}
class MySqlUpdate extends QueryPromise {
    session;
    dialect;
    config;
    constructor(table, set, session, dialect) {
        super();
        this.session = session;
        this.dialect = dialect;
        this.config = { set, table };
    }
    where(where) {
        this.config.where = where;
        return this;
    }
    /** @internal */
    getSQL() {
        return this.dialect.buildUpdateQuery(this.config);
    }
    toSQL() {
        const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
        return rest;
    }
    prepare() {
        return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning);
    }
    execute = (placeholderValues) => {
        return this.prepare().execute(placeholderValues);
    };
    createIterator = () => {
        const self = this;
        return async function* (placeholderValues) {
            yield* self.prepare().iterator(placeholderValues);
        };
    };
    iterator = this.createIterator();
}

class RelationalQueryBuilder {
    fullSchema;
    schema;
    tableNamesMap;
    table;
    tableConfig;
    dialect;
    session;
    constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session) {
        this.fullSchema = fullSchema;
        this.schema = schema;
        this.tableNamesMap = tableNamesMap;
        this.table = table;
        this.tableConfig = tableConfig;
        this.dialect = dialect;
        this.session = session;
    }
    findMany(config) {
        return new MySqlRelationalQuery(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, config ? config : {}, 'many');
    }
    findFirst(config) {
        return new MySqlRelationalQuery(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, config ? { ...config, limit: 1 } : { limit: 1 }, 'first');
    }
}
class MySqlRelationalQuery extends QueryPromise {
    fullSchema;
    schema;
    tableNamesMap;
    table;
    tableConfig;
    dialect;
    session;
    config;
    mode;
    constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session, config, mode) {
        super();
        this.fullSchema = fullSchema;
        this.schema = schema;
        this.tableNamesMap = tableNamesMap;
        this.table = table;
        this.tableConfig = tableConfig;
        this.dialect = dialect;
        this.session = session;
        this.config = config;
        this.mode = mode;
    }
    prepare() {
        const query = this.dialect.buildRelationalQuery(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.config, this.tableConfig.tsName, [], true);
        const builtQuery = this.dialect.sqlToQuery(query.sql);
        return this.session.prepareQuery(builtQuery, undefined, (rawRows) => {
            const rows = rawRows.map((row) => mapRelationalRow(this.schema, this.tableConfig, row, query.selection));
            if (this.mode === 'first') {
                return rows[0];
            }
            return rows;
        });
    }
    execute() {
        return this.prepare().execute();
    }
}

class MySqlDatabase {
    dialect;
    session;
    query;
    constructor(
    /** @internal */
    dialect, 
    /** @internal */
    session, schema) {
        this.dialect = dialect;
        this.session = session;
        this._ = schema
            ? { schema: schema.schema, tableNamesMap: schema.tableNamesMap }
            : { schema: undefined, tableNamesMap: {} };
        this.query = {};
        if (this._.schema) {
            for (const [tableName, columns] of Object.entries(this._.schema)) {
                this.query[tableName] = new RelationalQueryBuilder(schema.fullSchema, this._.schema, this._.tableNamesMap, schema.fullSchema[tableName], columns, dialect, session);
            }
        }
    }
    $with(alias) {
        return {
            as(qb) {
                if (typeof qb === 'function') {
                    qb = qb(new QueryBuilder());
                }
                return new Proxy(new WithSubquery(qb.getSQL(), qb.getSelectedFields(), alias, true), new SelectionProxyHandler({ alias, sqlAliasedBehavior: 'alias', sqlBehavior: 'error' }));
            },
        };
    }
    with(...queries) {
        const self = this;
        function select(fields) {
            return new MySqlSelectBuilder(fields ?? undefined, self.session, self.dialect, queries);
        }
        return { select };
    }
    select(fields) {
        return new MySqlSelectBuilder(fields ?? undefined, this.session, this.dialect);
    }
    update(table) {
        return new MySqlUpdateBuilder(table, this.session, this.dialect);
    }
    insert(table) {
        return new MySqlInsertBuilder(table, this.session, this.dialect);
    }
    delete(table) {
        return new MySqlDelete(table, this.session, this.dialect);
    }
    execute(query) {
        return this.session.execute(query.getSQL());
    }
    transaction(transaction, config) {
        return this.session.transaction(transaction, config);
    }
}

class PreparedQuery {
    /** @internal */
    joinsNotNullableMap;
}
class MySqlSession {
    dialect;
    constructor(dialect) {
        this.dialect = dialect;
    }
    execute(query) {
        return this.prepareQuery(this.dialect.sqlToQuery(query), undefined).execute();
    }
    getSetTransactionSQL(config) {
        const parts = [];
        if (config.isolationLevel) {
            parts.push(`isolation level ${config.isolationLevel}`);
        }
        return parts.length ? sql.fromList(['set transaction ', parts.join(' ')]) : undefined;
    }
    getStartTransactionSQL(config) {
        const parts = [];
        if (config.withConsistentSnapshot) {
            parts.push('with consistent snapshot');
        }
        if (config.accessMode) {
            parts.push(config.accessMode);
        }
        return parts.length ? sql.fromList(['start transaction ', parts.join(' ')]) : undefined;
    }
}
class MySqlTransaction extends MySqlDatabase {
    schema;
    nestedIndex;
    constructor(dialect, session, schema, nestedIndex = 0) {
        super(dialect, session, schema);
        this.schema = schema;
        this.nestedIndex = nestedIndex;
    }
    rollback() {
        throw new TransactionRollbackError();
    }
}

export { MySqlView as A, mysqlView as B, ForeignKeyBuilder as F, InlineForeignKeys as I, MySqlSession as M, PreparedQuery as P, QueryBuilder as Q, ViewBuilderCore as V, MySqlTransaction as a, MySqlDatabase as b, MySqlDialect as c, MySqlColumnBuilderWithAutoIncrement as d, MySqlColumnWithAutoIncrement as e, MySqlColumnBuilder as f, MySqlColumn as g, MySqlTable as h, mysqlViewWithSchema as i, MySqlViewConfig as j, ForeignKey as k, foreignKey as l, mysqlTableWithSchema as m, MySqlDelete as n, MySqlInsertBuilder as o, MySqlInsert as p, MySqlSelectBuilder as q, MySqlSelectQueryBuilder as r, MySqlSelect as s, MySqlUpdateBuilder as t, MySqlUpdate as u, mysqlTable as v, mysqlTableCreator as w, ViewBuilder as x, ManualViewBuilder as y, MySqlViewBase as z };
//# sourceMappingURL=session-2b625be5.mjs.map
