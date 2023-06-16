'use strict';

var errors = require('./errors-d0192d62.cjs');
var relations = require('./relations-9f413b53.cjs');

/** @internal */
const InlineForeignKeys = Symbol('InlineForeignKeys');
class MySqlTable extends relations.Table {
    /** @internal */
    static Symbol = Object.assign({}, relations.Table.Symbol, {
        InlineForeignKeys: InlineForeignKeys,
    });
    /** @internal */
    [relations.Table.Symbol.Columns];
    /** @internal */
    [InlineForeignKeys] = [];
    /** @internal */
    [relations.Table.Symbol.ExtraConfigBuilder] = undefined;
}
function mysqlTableWithSchema(name, columns, extraConfig, schema, baseName = name) {
    const rawTable = new MySqlTable(name, schema, baseName);
    const builtColumns = Object.fromEntries(Object.entries(columns).map(([name, colBuilder]) => {
        const column = colBuilder.build(rawTable);
        rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
        return [name, column];
    }));
    const table = Object.assign(rawTable, builtColumns);
    table[relations.Table.Symbol.Columns] = builtColumns;
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

class MySqlColumnBuilder extends relations.ColumnBuilder {
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
class MySqlColumn extends relations.Column {
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

class MySqlDelete extends relations.QueryPromise {
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
            const cols = this.table[relations.Table.Symbol.Columns];
            for (const colKey of Object.keys(entry)) {
                const colValue = entry[colKey];
                result[colKey] = colValue instanceof relations.SQL ? colValue : new relations.Param(colValue, cols[colKey]);
            }
            return result;
        });
        return new MySqlInsert(this.table, mappedValues, this.shouldIgnore, this.session, this.dialect);
    }
}
class MySqlInsert extends relations.QueryPromise {
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
        const setSql = this.dialect.buildUpdateSet(this.config.table, relations.mapUpdateSet(this.config.table, config.set));
        this.config.onConflict = relations.sql `update ${setSql}`;
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
        const selectionProxy = new relations.SelectionProxyHandler({
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
        this.columns = relations.getTableColumns(mysqlTable(name, columns));
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
        }), new relations.SelectionProxyHandler({
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
        }), new relations.SelectionProxyHandler({
            alias: this.name,
            sqlBehavior: 'error',
            sqlAliasedBehavior: 'alias',
            replaceOriginalName: true,
        }));
    }
}
class MySqlViewBase extends relations.View {
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
        const migrationTableCreate = relations.sql `
			create table if not exists ${relations.name(migrationsTable)} (
				id serial primary key,
				hash text not null,
				created_at bigint
			)
		`;
        await session.execute(migrationTableCreate);
        const dbMigrations = await session.all(relations.sql `select id, hash, created_at from ${relations.name(migrationsTable)} order by created_at desc limit 1`);
        const lastDbMigration = dbMigrations[0];
        await session.transaction(async (tx) => {
            for (const migration of migrations) {
                if (!lastDbMigration
                    || Number(lastDbMigration.created_at) < migration.folderMillis) {
                    for (const stmt of migration.sql) {
                        await tx.execute(relations.sql.raw(stmt));
                    }
                    await tx.execute(relations.sql `insert into ${relations.name(migrationsTable)} (\`hash\`, \`created_at\`) values(${migration.hash}, ${migration.folderMillis})`);
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
            ? relations.sql ` returning ${this.buildSelection(returning, { isSingleTable: true })}`
            : undefined;
        const whereSql = where ? relations.sql ` where ${where}` : undefined;
        return relations.sql `delete from ${table}${whereSql}${returningSql}`;
    }
    buildUpdateSet(table, set) {
        const setEntries = Object.entries(set);
        const setSize = setEntries.length;
        return relations.sql.fromList(setEntries
            .flatMap(([colName, value], i) => {
            const col = table[relations.Table.Symbol.Columns][colName];
            const res = relations.sql `${relations.name(col.name)} = ${value}`;
            if (i < setSize - 1) {
                return [res, relations.sql.raw(', ')];
            }
            return [res];
        }));
    }
    buildUpdateQuery({ table, set, where, returning }) {
        const setSql = this.buildUpdateSet(table, set);
        const returningSql = returning
            ? relations.sql ` returning ${this.buildSelection(returning, { isSingleTable: true })}`
            : undefined;
        const whereSql = where ? relations.sql ` where ${where}` : undefined;
        return relations.sql `update ${table} set ${setSql}${whereSql}${returningSql}`;
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
            if (field instanceof relations.SQL.Aliased && field.isSelectionField) {
                chunk.push(relations.name(field.fieldAlias));
            }
            else if (field instanceof relations.SQL.Aliased || field instanceof relations.SQL) {
                const query = field instanceof relations.SQL.Aliased ? field.sql : field;
                if (isSingleTable) {
                    chunk.push(new relations.SQL(query.queryChunks.map((c) => {
                        if (c instanceof MySqlColumn) {
                            return relations.name(c.name);
                        }
                        return c;
                    })));
                }
                else {
                    chunk.push(query);
                }
                if (field instanceof relations.SQL.Aliased) {
                    chunk.push(relations.sql ` as ${relations.name(field.fieldAlias)}`);
                }
            }
            else if (field instanceof relations.Column) {
                if (isSingleTable) {
                    chunk.push(relations.name(field.name));
                }
                else {
                    chunk.push(field);
                }
            }
            if (i < columnsLen - 1) {
                chunk.push(relations.sql `, `);
            }
            return chunk;
        });
        return relations.sql.fromList(chunks);
    }
    buildSelectQuery({ withList, fields, fieldsFlat, where, having, table, joins, orderBy, groupBy, limit, offset, lockingClause }) {
        const fieldsList = fieldsFlat ?? relations.orderSelectedFields(fields);
        for (const f of fieldsList) {
            if (f.field instanceof relations.Column
                && relations.getTableName(f.field.table)
                    !== (table instanceof relations.Subquery
                        ? table[relations.SubqueryConfig].alias
                        : table instanceof MySqlViewBase
                            ? table[relations.ViewBaseConfig].name
                            : table instanceof relations.SQL
                                ? undefined
                                : relations.getTableName(table))
                && !((table) => joins.some(({ alias }) => alias === (table[relations.Table.Symbol.IsAlias] ? relations.getTableName(table) : table[relations.Table.Symbol.BaseName])))(f.field.table)) {
                const tableName = relations.getTableName(f.field.table);
                throw new Error(`Your "${f.path.join('->')}" field references a column "${tableName}"."${f.field.name}", but the table "${tableName}" is not part of the query! Did you forget to join it?`);
            }
        }
        const isSingleTable = joins.length === 0;
        let withSql;
        if (withList.length) {
            const withSqlChunks = [relations.sql `with `];
            for (const [i, w] of withList.entries()) {
                withSqlChunks.push(relations.sql `${relations.name(w[relations.SubqueryConfig].alias)} as (${w[relations.SubqueryConfig].sql})`);
                if (i < withList.length - 1) {
                    withSqlChunks.push(relations.sql `, `);
                }
            }
            withSqlChunks.push(relations.sql ` `);
            withSql = relations.sql.fromList(withSqlChunks);
        }
        const selection = this.buildSelection(fieldsList, { isSingleTable });
        const tableSql = (() => {
            if (table instanceof relations.Table && table[relations.Table.Symbol.OriginalName] !== table[relations.Table.Symbol.Name]) {
                return relations.sql `${relations.name(table[relations.Table.Symbol.OriginalName])} ${relations.name(table[relations.Table.Symbol.Name])}`;
            }
            return table;
        })();
        const joinsArray = [];
        for (const [index, joinMeta] of joins.entries()) {
            if (index === 0) {
                joinsArray.push(relations.sql ` `);
            }
            const table = joinMeta.table;
            if (table instanceof MySqlTable) {
                const tableName = table[MySqlTable.Symbol.Name];
                const tableSchema = table[MySqlTable.Symbol.Schema];
                const origTableName = table[MySqlTable.Symbol.OriginalName];
                const alias = tableName === origTableName ? undefined : joinMeta.alias;
                joinsArray.push(relations.sql `${relations.sql.raw(joinMeta.joinType)} join ${tableSchema ? relations.sql `${relations.name(tableSchema)}.` : undefined}${relations.name(origTableName)}${alias && relations.sql ` ${relations.name(alias)}`} on ${joinMeta.on}`);
            }
            else if (table instanceof relations.View) {
                const viewName = table[relations.ViewBaseConfig].name;
                const viewSchema = table[relations.ViewBaseConfig].schema;
                const origViewName = table[relations.ViewBaseConfig].originalName;
                const alias = viewName === origViewName ? undefined : joinMeta.alias;
                joinsArray.push(relations.sql `${relations.sql.raw(joinMeta.joinType)} join ${viewSchema ? relations.sql `${relations.name(viewSchema)}.` : undefined}${relations.name(origViewName)}${alias && relations.sql ` ${relations.name(alias)}`} on ${joinMeta.on}`);
            }
            else {
                joinsArray.push(relations.sql `${relations.sql.raw(joinMeta.joinType)} join ${table} on ${joinMeta.on}`);
            }
            if (index < joins.length - 1) {
                joinsArray.push(relations.sql ` `);
            }
        }
        const joinsSql = relations.sql.fromList(joinsArray);
        const whereSql = where ? relations.sql ` where ${where}` : undefined;
        const havingSql = having ? relations.sql ` having ${having}` : undefined;
        const orderByList = [];
        for (const [index, orderByValue] of orderBy.entries()) {
            orderByList.push(orderByValue);
            if (index < orderBy.length - 1) {
                orderByList.push(relations.sql `, `);
            }
        }
        const orderBySql = orderByList.length > 0 ? relations.sql ` order by ${relations.sql.fromList(orderByList)}` : undefined;
        const groupByList = [];
        for (const [index, groupByValue] of groupBy.entries()) {
            groupByList.push(groupByValue);
            if (index < groupBy.length - 1) {
                groupByList.push(relations.sql `, `);
            }
        }
        const groupBySql = groupByList.length > 0 ? relations.sql ` group by ${relations.sql.fromList(groupByList)}` : undefined;
        const limitSql = limit ? relations.sql ` limit ${limit}` : undefined;
        const offsetSql = offset ? relations.sql ` offset ${offset}` : undefined;
        let lockingClausesSql;
        if (lockingClause) {
            const { config, strength } = lockingClause;
            lockingClausesSql = relations.sql ` for ${relations.sql.raw(strength)}`;
            if (config.noWait) {
                lockingClausesSql.append(relations.sql ` no wait`);
            }
            else if (config.skipLocked) {
                lockingClausesSql.append(relations.sql ` skip locked`);
            }
        }
        return relations.sql `${withSql}select ${selection} from ${tableSql}${joinsSql}${whereSql}${groupBySql}${havingSql}${orderBySql}${limitSql}${offsetSql}${lockingClausesSql}`;
    }
    buildInsertQuery({ table, values, ignore, onConflict }) {
        const isSingleValue = values.length === 1;
        const valuesSqlList = [];
        const columns = table[relations.Table.Symbol.Columns];
        const colEntries = isSingleValue
            ? Object.keys(values[0]).map((fieldName) => [fieldName, columns[fieldName]])
            : Object.entries(columns);
        const insertOrder = colEntries.map(([, column]) => relations.name(column.name));
        for (const [valueIndex, value] of values.entries()) {
            const valueList = [];
            for (const [fieldName] of colEntries) {
                const colValue = value[fieldName];
                if (colValue === undefined || (colValue instanceof relations.Param && colValue.value === undefined)) {
                    valueList.push(relations.sql `default`);
                }
                else {
                    valueList.push(colValue);
                }
            }
            valuesSqlList.push(valueList);
            if (valueIndex < values.length - 1) {
                valuesSqlList.push(relations.sql `, `);
            }
        }
        const valuesSql = relations.sql.fromList(valuesSqlList);
        const ignoreSql = ignore ? relations.sql ` ignore` : undefined;
        const onConflictSql = onConflict ? relations.sql ` on duplicate key ${onConflict}` : undefined;
        return relations.sql `insert${ignoreSql} into ${table} ${insertOrder} values ${valuesSql}${onConflictSql}`;
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
        const aliasedColumns = Object.fromEntries(Object.entries(tableConfig.columns).map(([key, value]) => [key, relations.aliasedTableColumn(value, tableAlias)]));
        const aliasedRelations = Object.fromEntries(Object.entries(tableConfig.relations).map(([key, value]) => [key, relations.aliasedRelation(value, tableAlias)]));
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
                ? config.extras(aliasedFields, { sql: relations.sql })
                : config.extras;
            selectedExtras = Object.entries(extrasOrig).map(([key, value]) => ({
                key,
                value: relations.mapColumnsInAliasedSQLToAlias(value, tableAlias),
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
            const whereSql = typeof config.where === 'function' ? config.where(aliasedFields, relations.operators) : config.where;
            where = whereSql && relations.mapColumnsInSQLToAlias(whereSql, tableAlias);
        }
        const groupBy = (tableConfig.primaryKey.length ? tableConfig.primaryKey : Object.values(tableConfig.columns)).map((c) => relations.aliasedTableColumn(c, tableAlias));
        let orderByOrig = typeof config.orderBy === 'function'
            ? config.orderBy(aliasedFields, relations.orderByOperators)
            : config.orderBy ?? [];
        if (!Array.isArray(orderByOrig)) {
            orderByOrig = [orderByOrig];
        }
        const orderBy = orderByOrig.map((orderByValue) => {
            if (orderByValue instanceof relations.Column) {
                return relations.aliasedTableColumn(orderByValue, tableAlias);
            }
            return relations.mapColumnsInSQLToAlias(orderByValue, tableAlias);
        });
        const builtRelations = [];
        const builtRelationFields = [];
        let result;
        let selectedRelationIndex = 0;
        for (const { key: selectedRelationKey, value: selectedRelationValue } of selectedRelations) {
            let relation;
            for (const [relationKey, relationValue] of Object.entries(tableConfig.relations)) {
                if (relationValue instanceof relations.Relation && relationKey === selectedRelationKey) {
                    relation = relationValue;
                    break;
                }
            }
            if (!relation) {
                throw new Error(`Relation ${selectedRelationKey} not found`);
            }
            const normalizedRelation = relations.normalizeRelation(schema, tableNamesMap, relation);
            const relationAlias = `${tableAlias}_${selectedRelationKey}`;
            const builtRelation = this.buildRelationalQuery(fullSchema, schema, tableNamesMap, fullSchema[tableNamesMap[relation.referencedTable[relations.Table.Symbol.Name]]], schema[tableNamesMap[relation.referencedTable[relations.Table.Symbol.Name]]], selectedRelationValue, relationAlias, normalizedRelation.references);
            builtRelations.push({ key: selectedRelationKey, value: builtRelation });
            let relationWhere;
            if (typeof selectedRelationValue === 'object' && selectedRelationValue.limit) {
                const field = relations.sql `${relations.sql.identifier(relationAlias)}.${relations.sql.identifier('__drizzle_row_number')}`;
                relationWhere = relations.and(relationWhere, relations.or(relations.and(relations.sql `${field} <= ${selectedRelationValue.limit}`), relations.sql `(${field} is null)`));
            }
            const join = {
                table: builtRelation.sql instanceof relations.Table
                    ? relations.aliasedTable(builtRelation.sql, relationAlias)
                    : new relations.Subquery(builtRelation.sql, {}, relationAlias),
                alias: relationAlias,
                on: relations.and(...normalizedRelation.fields.map((field, i) => relations.eq(relations.aliasedTableColumn(field, tableAlias), relations.aliasedTableColumn(normalizedRelation.references[i], relationAlias)))),
                joinType: 'left',
            };
            const elseField = relations.sql `json_arrayagg(json_array(${relations.sql.join(builtRelation.selection.map(({ dbKey: key, isJson }) => {
                const field = relations.sql `${relations.sql.identifier(relationAlias)}.${relations.sql.identifier(key)}`;
                return isJson ? relations.sql `cast(${field} as json)` : field;
            }), relations.sql `, `)}))`;
            const countSql = normalizedRelation.references.length === 1
                ? relations.aliasedTableColumn(normalizedRelation.references[0], relationAlias)
                : relations.sql.fromList([
                    relations.sql `coalesce(`,
                    relations.sql.join(normalizedRelation.references.map((c) => relations.aliasedTableColumn(c, relationAlias)), relations.sql.raw(', ')),
                    relations.sql.raw(')'),
                ]);
            const field = relations.sql `if(count(${countSql}) = 0, '[]', ${elseField})`.as(selectedRelationKey);
            const builtRelationField = {
                path: [selectedRelationKey],
                field,
            };
            result = this.buildSelectQuery({
                table: result ? new relations.Subquery(result, {}, tableAlias) : relations.aliasedTable(table, tableAlias),
                fields: {},
                fieldsFlat: [
                    ...Object.entries(tableConfig.columns).map(([tsKey, column]) => ({
                        path: [tsKey],
                        field: relations.aliasedTableColumn(column, tableAlias),
                    })),
                    ...(selectedRelationIndex === selectedRelations.length - 1
                        ? selectedExtras.map(({ key, value }) => ({
                            path: [key],
                            field: value,
                        }))
                        : []),
                    ...builtRelationFields.map(({ path, field }) => ({
                        path,
                        field: relations.sql `${relations.sql.identifier(tableAlias)}.${relations.sql.identifier(field.fieldAlias)}`,
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
                field: value instanceof relations.Column ? relations.aliasedTableColumn(value, tableAlias) : value,
            };
        });
        const finalFieldsFlat = isRoot
            ? [
                ...finalFieldsSelection.map(({ path, field }) => ({
                    path,
                    field: field instanceof relations.SQL.Aliased ? relations.sql `${relations.sql.identifier(field.fieldAlias)}` : field,
                })),
                ...builtRelationFields.map(({ path, field }) => ({
                    path,
                    field: relations.sql `cast(${relations.sql.identifier(field.fieldAlias)} as json)`,
                })),
            ]
            : [
                ...Object.entries(tableConfig.columns).map(([tsKey, column]) => ({
                    path: [tsKey],
                    field: relations.aliasedTableColumn(column, tableAlias),
                })),
                ...selectedExtras.map(({ key, value }) => ({
                    path: [key],
                    field: value,
                })),
                ...builtRelationFields.map(({ path, field }) => ({
                    path,
                    field: relations.sql `${relations.sql.identifier(tableAlias)}.${relations.sql.identifier(field.fieldAlias)}`,
                })),
            ];
        if (finalFieldsFlat.length === 0) {
            finalFieldsFlat.push({
                path: [],
                field: relations.sql.raw('1'),
            });
        }
        if (!isRoot && !config.limit && orderBy.length > 0) {
            finalFieldsFlat.push({
                path: ['__drizzle_row_number'],
                field: relations.sql `row_number() over(order by ${relations.sql.join(orderBy, relations.sql `, `)})`,
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
                    field: relations.sql `row_number() over(partition by ${relationColumns.map((c) => relations.aliasedTableColumn(c, tableAlias))}${(orderBy.length > 0 && !isRoot) ? relations.sql ` order by ${relations.sql.join(orderBy, relations.sql `, `)}` : undefined})`
                        .as('__drizzle_row_number'),
                });
            }
        }
        result = this.buildSelectQuery({
            table: result ? new relations.Subquery(result, {}, tableAlias) : relations.aliasedTable(table, tableAlias),
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
                    dbKey: field instanceof relations.SQL.Aliased ? field.fieldAlias : tableConfig.columns[path[0]].name,
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
        else if (source instanceof relations.Subquery) {
            // This is required to use the proxy handler to get the correct field values from the subquery
            fields = Object.fromEntries(Object.keys(source[relations.SubqueryConfig].selection).map((key) => [key, source[key]]));
        }
        else if (source instanceof MySqlViewBase) {
            fields = source[relations.ViewBaseConfig].selectedFields;
        }
        else if (source instanceof relations.SQL) {
            fields = {};
        }
        else {
            fields = relations.getTableColumns(source);
        }
        return new MySqlSelect(source, fields, isPartialSelect, this.session, this.dialect, this.withList);
    }
}
class MySqlSelectQueryBuilder extends relations.TypedQueryBuilder {
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
        this.tableName = relations.getTableLikeName(table);
        this.joinsNotNullableMap = typeof this.tableName === 'string' ? { [this.tableName]: true } : {};
    }
    createJoin(joinType) {
        return (table, on) => {
            const baseTableName = this.tableName;
            const tableName = relations.getTableLikeName(table);
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
                if (typeof tableName === 'string' && !(table instanceof relations.SQL)) {
                    const selection = table instanceof relations.Subquery
                        ? table[relations.SubqueryConfig].selection
                        : table instanceof relations.View
                            ? table[relations.ViewBaseConfig].selectedFields
                            : table[relations.Table.Symbol.Columns];
                    this.config.fields[tableName] = selection;
                }
            }
            if (typeof on === 'function') {
                on = on(new Proxy(this.config.fields, new relations.SelectionProxyHandler({ sqlAliasedBehavior: 'sql', sqlBehavior: 'sql' })));
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
            where = where(new Proxy(this.config.fields, new relations.SelectionProxyHandler({ sqlAliasedBehavior: 'sql', sqlBehavior: 'sql' })));
        }
        this.config.where = where;
        return this;
    }
    having(having) {
        if (typeof having === 'function') {
            having = having(new Proxy(this.config.fields, new relations.SelectionProxyHandler({ sqlAliasedBehavior: 'sql', sqlBehavior: 'sql' })));
        }
        this.config.having = having;
        return this;
    }
    groupBy(...columns) {
        if (typeof columns[0] === 'function') {
            const groupBy = columns[0](new Proxy(this.config.fields, new relations.SelectionProxyHandler({ sqlAliasedBehavior: 'alias', sqlBehavior: 'sql' })));
            this.config.groupBy = Array.isArray(groupBy) ? groupBy : [groupBy];
        }
        else {
            this.config.groupBy = columns;
        }
        return this;
    }
    orderBy(...columns) {
        if (typeof columns[0] === 'function') {
            const orderBy = columns[0](new Proxy(this.config.fields, new relations.SelectionProxyHandler({ sqlAliasedBehavior: 'alias', sqlBehavior: 'sql' })));
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
        return new Proxy(new relations.Subquery(this.getSQL(), this.config.fields, alias), new relations.SelectionProxyHandler({ alias, sqlAliasedBehavior: 'alias', sqlBehavior: 'error' }));
    }
}
class MySqlSelect extends MySqlSelectQueryBuilder {
    prepare() {
        if (!this.session) {
            throw new Error('Cannot execute a query on a query builder. Please use a database instance instead.');
        }
        const fieldsList = relations.orderSelectedFields(this.config.fields);
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
relations.applyMixins(MySqlSelect, [relations.QueryPromise]);

class QueryBuilder {
    dialect;
    $with(alias) {
        const queryBuilder = this;
        return {
            as(qb) {
                if (typeof qb === 'function') {
                    qb = qb(queryBuilder);
                }
                return new Proxy(new relations.WithSubquery(qb.getSQL(), qb.getSelectedFields(), alias, true), new relations.SelectionProxyHandler({ alias, sqlAliasedBehavior: 'alias', sqlBehavior: 'error' }));
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
        return new MySqlUpdate(this.table, relations.mapUpdateSet(this.table, values), this.session, this.dialect);
    }
}
class MySqlUpdate extends relations.QueryPromise {
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
class MySqlRelationalQuery extends relations.QueryPromise {
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
            const rows = rawRows.map((row) => relations.mapRelationalRow(this.schema, this.tableConfig, row, query.selection));
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
                return new Proxy(new relations.WithSubquery(qb.getSQL(), qb.getSelectedFields(), alias, true), new relations.SelectionProxyHandler({ alias, sqlAliasedBehavior: 'alias', sqlBehavior: 'error' }));
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
        return parts.length ? relations.sql.fromList(['set transaction ', parts.join(' ')]) : undefined;
    }
    getStartTransactionSQL(config) {
        const parts = [];
        if (config.withConsistentSnapshot) {
            parts.push('with consistent snapshot');
        }
        if (config.accessMode) {
            parts.push(config.accessMode);
        }
        return parts.length ? relations.sql.fromList(['start transaction ', parts.join(' ')]) : undefined;
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
        throw new errors.TransactionRollbackError();
    }
}

exports.ForeignKey = ForeignKey;
exports.ForeignKeyBuilder = ForeignKeyBuilder;
exports.InlineForeignKeys = InlineForeignKeys;
exports.ManualViewBuilder = ManualViewBuilder;
exports.MySqlColumn = MySqlColumn;
exports.MySqlColumnBuilder = MySqlColumnBuilder;
exports.MySqlColumnBuilderWithAutoIncrement = MySqlColumnBuilderWithAutoIncrement;
exports.MySqlColumnWithAutoIncrement = MySqlColumnWithAutoIncrement;
exports.MySqlDatabase = MySqlDatabase;
exports.MySqlDelete = MySqlDelete;
exports.MySqlDialect = MySqlDialect;
exports.MySqlInsert = MySqlInsert;
exports.MySqlInsertBuilder = MySqlInsertBuilder;
exports.MySqlSelect = MySqlSelect;
exports.MySqlSelectBuilder = MySqlSelectBuilder;
exports.MySqlSelectQueryBuilder = MySqlSelectQueryBuilder;
exports.MySqlSession = MySqlSession;
exports.MySqlTable = MySqlTable;
exports.MySqlTransaction = MySqlTransaction;
exports.MySqlUpdate = MySqlUpdate;
exports.MySqlUpdateBuilder = MySqlUpdateBuilder;
exports.MySqlView = MySqlView;
exports.MySqlViewBase = MySqlViewBase;
exports.MySqlViewConfig = MySqlViewConfig;
exports.PreparedQuery = PreparedQuery;
exports.QueryBuilder = QueryBuilder;
exports.ViewBuilder = ViewBuilder;
exports.ViewBuilderCore = ViewBuilderCore;
exports.foreignKey = foreignKey;
exports.mysqlTable = mysqlTable;
exports.mysqlTableCreator = mysqlTableCreator;
exports.mysqlTableWithSchema = mysqlTableWithSchema;
exports.mysqlView = mysqlView;
exports.mysqlViewWithSchema = mysqlViewWithSchema;
//# sourceMappingURL=session-ff20ca01.cjs.map
