'use strict';

var errors = require('./errors-d0192d62.cjs');
var relations = require('./relations-9f413b53.cjs');

/** @internal */
const InlineForeignKeys = Symbol('InlineForeignKeys');
class SQLiteTable extends relations.Table {
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
function sqliteTableBase(name, columns, extraConfig, schema, baseName = name) {
    const rawTable = new SQLiteTable(name, schema, baseName);
    const builtColumns = Object.fromEntries(Object.entries(columns).map(([name, colBuilder]) => {
        const column = colBuilder.build(rawTable);
        rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
        return [name, column];
    }));
    const table = Object.assign(rawTable, builtColumns);
    table[relations.Table.Symbol.Columns] = builtColumns;
    if (extraConfig) {
        table[SQLiteTable.Symbol.ExtraConfigBuilder] = extraConfig;
    }
    return table;
}
const sqliteTable = (name, columns, extraConfig) => {
    return sqliteTableBase(name, columns, extraConfig);
};
function sqliteTableCreator(customizeTableName) {
    return (name, columns, extraConfig) => {
        return sqliteTableBase(customizeTableName(name), columns, extraConfig, undefined, name);
    };
}

class SQLiteDelete {
    constructor(table, session, dialect) {
        this.table = table;
        this.session = session;
        this.dialect = dialect;
        this.run = (placeholderValues) => {
            return this.prepare(true).run(placeholderValues);
        };
        this.runInBatch = (placeholderValues) => {
            return this.prepare(true).runInBatch(placeholderValues);
        };
        this.all = (placeholderValues) => {
            return this.prepare(true).all(placeholderValues);
        };
        this.get = (placeholderValues) => {
            return this.prepare(true).get(placeholderValues);
        };
        this.values = (placeholderValues) => {
            return this.prepare(true).values(placeholderValues);
        };
        this.config = { table };
    }
    where(where) {
        this.config.where = where;
        return this;
    }
    returning(fields = this.table[SQLiteTable.Symbol.Columns]) {
        this.config.returning = relations.orderSelectedFields(fields);
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
    prepare(isOneTimeQuery) {
        return this.session[isOneTimeQuery ? 'prepareOneTimeQuery' : 'prepareQuery'](this.dialect.sqlToQuery(this.getSQL()), this.config.returning);
    }
}

class SQLiteInsertBuilder {
    table;
    session;
    dialect;
    constructor(table, session, dialect) {
        this.table = table;
        this.session = session;
        this.dialect = dialect;
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
        return new SQLiteInsert(this.table, mappedValues, this.session, this.dialect);
    }
}
class SQLiteInsert {
    session;
    dialect;
    config;
    constructor(table, values, session, dialect) {
        this.session = session;
        this.dialect = dialect;
        this.config = { table, values };
    }
    returning(fields = this.config.table[SQLiteTable.Symbol.Columns]) {
        this.config.returning = relations.orderSelectedFields(fields);
        return this;
    }
    onConflictDoNothing(config = {}) {
        if (config.target === undefined) {
            this.config.onConflict = relations.sql `do nothing`;
        }
        else {
            const targetSql = Array.isArray(config.target) ? relations.sql `${config.target}` : relations.sql `${[config.target]}`;
            const whereSql = config.where ? relations.sql ` where ${config.where}` : relations.sql ``;
            this.config.onConflict = relations.sql `${targetSql}${whereSql} do nothing`;
        }
        return this;
    }
    onConflictDoUpdate(config) {
        const targetSql = Array.isArray(config.target) ? relations.sql `${config.target}` : relations.sql `${[config.target]}`;
        const whereSql = config.where ? relations.sql ` where ${config.where}` : relations.sql ``;
        const setSql = this.dialect.buildUpdateSet(this.config.table, relations.mapUpdateSet(this.config.table, config.set));
        this.config.onConflict = relations.sql `${targetSql}${whereSql} do update set ${setSql}`;
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
    prepare(isOneTimeQuery) {
        return this.session[isOneTimeQuery ? 'prepareOneTimeQuery' : 'prepareQuery'](this.dialect.sqlToQuery(this.getSQL()), this.config.returning);
    }
    run = (placeholderValues) => {
        return this.prepare(true).run(placeholderValues);
    };
    runInBatch = (placeholderValues) => {
        return this.prepare(true).runInBatch(placeholderValues);
    };
    all = (placeholderValues) => {
        return this.prepare(true).all(placeholderValues);
    };
    get = (placeholderValues) => {
        return this.prepare(true).get(placeholderValues);
    };
    values = (placeholderValues) => {
        return this.prepare(true).values(placeholderValues);
    };
}

class ViewBuilderCore {
    name;
    constructor(name) {
        this.name = name;
    }
    config = {};
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
        // const aliasedSelectedFields = new Proxy(qb.getSelectedFields(), selectionProxy);
        const aliasedSelectedFields = qb.getSelectedFields();
        return new Proxy(new SQLiteView({
            sqliteConfig: this.config,
            config: {
                name: this.name,
                schema: undefined,
                selectedFields: aliasedSelectedFields,
                query: qb.getSQL().inlineParams(),
            },
        }), selectionProxy);
    }
}
class ManualViewBuilder extends ViewBuilderCore {
    columns;
    constructor(name, columns) {
        super(name);
        this.columns = relations.getTableColumns(sqliteTable(name, columns));
    }
    existing() {
        return new Proxy(new SQLiteView({
            sqliteConfig: undefined,
            config: {
                name: this.name,
                schema: undefined,
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
        return new Proxy(new SQLiteView({
            sqliteConfig: this.config,
            config: {
                name: this.name,
                schema: undefined,
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
class SQLiteViewBase extends relations.View {
}
const SQLiteViewConfig = Symbol('SQLiteViewConfig');
class SQLiteView extends SQLiteViewBase {
    /** @internal */
    [SQLiteViewConfig];
    constructor({ sqliteConfig, config }) {
        super(config);
        this[SQLiteViewConfig] = sqliteConfig;
    }
}
function sqliteView(name, selection) {
    if (selection) {
        return new ManualViewBuilder(name, selection);
    }
    return new ViewBuilder(name);
}
const view = sqliteView;

class SQLiteDialect {
    escapeName(name) {
        return `"${name}"`;
    }
    escapeParam(_num) {
        return '?';
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
                        if (c instanceof relations.Column) {
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
                const tableName = field.table[relations.Table.Symbol.Name];
                const columnName = field.name;
                if (isSingleTable) {
                    chunk.push(relations.name(columnName));
                }
                else {
                    chunk.push(relations.sql `${relations.name(tableName)}.${relations.name(columnName)}`);
                }
            }
            if (i < columnsLen - 1) {
                chunk.push(relations.sql `, `);
            }
            return chunk;
        });
        return relations.sql.fromList(chunks);
    }
    buildSelectQuery({ withList, fields, fieldsFlat, where, having, table, joins, orderBy, groupBy, limit, offset }) {
        const fieldsList = fieldsFlat ?? relations.orderSelectedFields(fields);
        for (const f of fieldsList) {
            if (f.field instanceof relations.Column
                && relations.getTableName(f.field.table)
                    !== (table instanceof relations.Subquery
                        ? table[relations.SubqueryConfig].alias
                        : table instanceof SQLiteViewBase
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
            if (table instanceof SQLiteTable) {
                const tableName = table[SQLiteTable.Symbol.Name];
                const tableSchema = table[SQLiteTable.Symbol.Schema];
                const origTableName = table[SQLiteTable.Symbol.OriginalName];
                const alias = tableName === origTableName ? undefined : joinMeta.alias;
                joinsArray.push(relations.sql `${relations.sql.raw(joinMeta.joinType)} join ${tableSchema ? relations.sql `${relations.sql.identifier(tableSchema)}.` : undefined}${relations.name(origTableName)}${alias && relations.sql ` ${relations.name(alias)}`} on ${joinMeta.on}`);
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
        const groupByList = [];
        for (const [index, groupByValue] of groupBy.entries()) {
            groupByList.push(groupByValue);
            if (index < groupBy.length - 1) {
                groupByList.push(relations.sql `, `);
            }
        }
        const groupBySql = groupByList.length > 0 ? relations.sql ` group by ${relations.sql.fromList(groupByList)}` : undefined;
        const orderBySql = orderByList.length > 0 ? relations.sql ` order by ${relations.sql.fromList(orderByList)}` : undefined;
        const limitSql = limit ? relations.sql ` limit ${limit}` : undefined;
        const offsetSql = offset ? relations.sql ` offset ${offset}` : undefined;
        return relations.sql `${withSql}select ${selection} from ${tableSql}${joinsSql}${whereSql}${groupBySql}${havingSql}${orderBySql}${limitSql}${offsetSql}`;
    }
    buildInsertQuery({ table, values, onConflict, returning }) {
        const isSingleValue = values.length === 1;
        const valuesSqlList = [];
        const columns = table[relations.Table.Symbol.Columns];
        const colEntries = isSingleValue
            ? Object.keys(values[0]).map((fieldName) => [fieldName, columns[fieldName]])
            : Object.entries(columns);
        const insertOrder = colEntries.map(([, column]) => relations.name(column.name));
        for (const [valueIndex, value] of values.entries()) {
            const valueList = [];
            for (const [fieldName, col] of colEntries) {
                const colValue = value[fieldName];
                if (colValue === undefined || (colValue instanceof relations.Param && colValue.value === undefined)) {
                    let defaultValue;
                    if (col.default !== null && col.default !== undefined) {
                        defaultValue = col.default instanceof relations.SQL ? col.default : relations.param(col.default, col);
                    }
                    else {
                        defaultValue = relations.sql `null`;
                    }
                    valueList.push(defaultValue);
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
        const returningSql = returning
            ? relations.sql ` returning ${this.buildSelection(returning, { isSingleTable: true })}`
            : undefined;
        const onConflictSql = onConflict ? relations.sql ` on conflict ${onConflict}` : undefined;
        return relations.sql `insert into ${table} ${insertOrder} values ${valuesSql}${onConflictSql}${returningSql}`;
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
            const elseField = relations.sql `json_group_array(json_array(${relations.sql.join(builtRelation.selection.map(({ dbKey: key, isJson }) => {
                const field = relations.sql `${relations.sql.identifier(relationAlias)}.${relations.sql.identifier(key)}`;
                return isJson ? relations.sql `json(${field})` : field;
            }), relations.sql `, `)}))`;
            const countSql = normalizedRelation.references.length === 1
                ? relations.aliasedTableColumn(normalizedRelation.references[0], relationAlias)
                : relations.sql.fromList([
                    relations.sql `coalesce(`,
                    relations.sql.join(normalizedRelation.references.map((c) => relations.aliasedTableColumn(c, relationAlias)), relations.sql.raw(', ')),
                    relations.sql.raw(')'),
                ]);
            const field = relations.sql `case when count(${countSql}) = 0 then '[]' else ${elseField} end`.as(selectedRelationKey);
            const builtRelationField = {
                path: [selectedRelationKey],
                field,
            };
            result = this.buildSelectQuery({
                table: result ? new relations.Subquery(result, {}, tableAlias) : relations.aliasedTable(table, tableAlias),
                fields: {},
                fieldsFlat: [
                    {
                        path: [],
                        field: relations.sql `${relations.sql.identifier(tableAlias)}.*`,
                    },
                    ...(selectedRelationIndex === selectedRelations.length - 1
                        ? selectedExtras.map(({ key, value }) => ({
                            path: [key],
                            field: value,
                        }))
                        : []),
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
                    field: relations.sql `json(${relations.sql.identifier(field.fieldAlias)})`,
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
class SQLiteSyncDialect extends SQLiteDialect {
    migrate(migrations, session) {
        const migrationTableCreate = relations.sql `
			CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at numeric
			)
		`;
        session.run(migrationTableCreate);
        const dbMigrations = session.values(relations.sql `SELECT id, hash, created_at FROM "__drizzle_migrations" ORDER BY created_at DESC LIMIT 1`);
        const lastDbMigration = dbMigrations[0] ?? undefined;
        session.run(relations.sql `BEGIN`);
        try {
            for (const migration of migrations) {
                if (!lastDbMigration || Number(lastDbMigration[2]) < migration.folderMillis) {
                    for (const stmt of migration.sql) {
                        session.run(relations.sql.raw(stmt));
                    }
                    session.run(relations.sql `INSERT INTO "__drizzle_migrations" ("hash", "created_at") VALUES(${migration.hash}, ${migration.folderMillis})`);
                }
            }
            session.run(relations.sql `COMMIT`);
        }
        catch (e) {
            session.run(relations.sql `ROLLBACK`);
            throw e;
        }
    }
}
class SQLiteAsyncDialect extends SQLiteDialect {
    async migrate(migrations, session) {
        const migrationTableCreate = relations.sql `
			CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at numeric
			)
		`;
        await session.run(migrationTableCreate);
        const dbMigrations = await session.values(relations.sql `SELECT id, hash, created_at FROM "__drizzle_migrations" ORDER BY created_at DESC LIMIT 1`);
        const lastDbMigration = dbMigrations[0] ?? undefined;
        await session.transaction(async (tx) => {
            for (const migration of migrations) {
                if (!lastDbMigration || Number(lastDbMigration[2]) < migration.folderMillis) {
                    for (const stmt of migration.sql) {
                        await tx.run(relations.sql.raw(stmt));
                    }
                    await tx.run(relations.sql `INSERT INTO "__drizzle_migrations" ("hash", "created_at") VALUES(${migration.hash}, ${migration.folderMillis})`);
                }
            }
        });
    }
}

class SQLiteSelectBuilder {
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
        else if (source instanceof SQLiteViewBase) {
            fields = source[relations.ViewBaseConfig].selectedFields;
        }
        else if (source instanceof relations.SQL) {
            fields = {};
        }
        else {
            fields = relations.getTableColumns(source);
        }
        return new SQLiteSelect(source, fields, isPartialSelect, this.session, this.dialect, this.withList);
    }
}
class SQLiteSelectQueryBuilder extends relations.TypedQueryBuilder {
    isPartialSelect;
    session;
    dialect;
    _;
    config;
    joinsNotNullableMap;
    tableName;
    constructor(table, fields, isPartialSelect, session, dialect, withList) {
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
    getSelectedFields() {
        return new Proxy(this.config.fields, new relations.SelectionProxyHandler({ alias: this.tableName, sqlAliasedBehavior: 'alias', sqlBehavior: 'error' }));
    }
}
class SQLiteSelect extends SQLiteSelectQueryBuilder {
    prepare(isOneTimeQuery) {
        if (!this.session) {
            throw new Error('Cannot execute a query on a query builder. Please use a database instance instead.');
        }
        const fieldsList = relations.orderSelectedFields(this.config.fields);
        const query = this.session[isOneTimeQuery ? 'prepareOneTimeQuery' : 'prepareQuery'](this.dialect.sqlToQuery(this.getSQL()), fieldsList);
        query.joinsNotNullableMap = this.joinsNotNullableMap;
        return query;
    }
    run = (placeholderValues) => {
        return this.prepare(true).run(placeholderValues);
    };
    runInBatch = (placeholderValues) => {
        return this.prepare(true).runInBatch(placeholderValues);
    };
    all = (placeholderValues) => {
        return this.prepare(true).all(placeholderValues);
    };
    get = (placeholderValues) => {
        return this.prepare(true).get(placeholderValues);
    };
    values = (placeholderValues) => {
        return this.prepare(true).values(placeholderValues);
    };
}

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
            return new SQLiteSelectBuilder(fields ?? undefined, undefined, self.getDialect(), queries);
        }
        return { select };
    }
    select(fields) {
        return new SQLiteSelectBuilder(fields ?? undefined, undefined, this.getDialect());
    }
    // Lazy load dialect to avoid circular dependency
    getDialect() {
        if (!this.dialect) {
            this.dialect = new SQLiteSyncDialect();
        }
        return this.dialect;
    }
}

class SQLiteUpdateBuilder {
    table;
    session;
    dialect;
    constructor(table, session, dialect) {
        this.table = table;
        this.session = session;
        this.dialect = dialect;
    }
    set(values) {
        return new SQLiteUpdate(this.table, relations.mapUpdateSet(this.table, values), this.session, this.dialect);
    }
}
class SQLiteUpdate {
    session;
    dialect;
    config;
    constructor(table, set, session, dialect) {
        this.session = session;
        this.dialect = dialect;
        this.config = { set, table };
    }
    where(where) {
        this.config.where = where;
        return this;
    }
    returning(fields = this.config.table[SQLiteTable.Symbol.Columns]) {
        this.config.returning = relations.orderSelectedFields(fields);
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
    prepare(isOneTimeQuery) {
        return this.session[isOneTimeQuery ? 'prepareOneTimeQuery' : 'prepareQuery'](this.dialect.sqlToQuery(this.getSQL()), this.config.returning);
    }
    run = (placeholderValues) => {
        return this.prepare(true).run(placeholderValues);
    };
    runInBatch = (placeholderValues) => {
        return this.prepare(true).runInBatch(placeholderValues);
    };
    all = (placeholderValues) => {
        return this.prepare(true).all(placeholderValues);
    };
    get = (placeholderValues) => {
        return this.prepare(true).get(placeholderValues);
    };
    values = (placeholderValues) => {
        return this.prepare(true).values(placeholderValues);
    };
}

class AsyncRelationalQueryBuilder {
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
        return new SQLiteRelationalQuery(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, config ? config : {}, 'many');
    }
    findFirst(config) {
        return new SQLiteRelationalQuery(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, config ? { ...config, limit: 1 } : { limit: 1 }, 'first');
    }
}
class SyncRelationalQueryBuilder {
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
    prepareFindMany(config) {
        const query = new SQLiteRelationalQuery(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, config ? config : {}, 'many').prepare();
        return {
            execute: query.all.bind(query),
        };
    }
    findMany(config) {
        return this.prepareFindMany(config).execute();
    }
    prepareFindFirst(config) {
        const query = new SQLiteRelationalQuery(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, config ? { ...config, limit: 1 } : { limit: 1 }, 'first').prepare();
        return {
            execute: query.get.bind(query),
        };
    }
    findFirst(config) {
        return this.prepareFindFirst(config).execute();
    }
}
class SQLiteRelationalQuery {
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
        return this.session.prepareQuery(builtQuery, undefined, (rawRows, mapColumnValue) => {
            const rows = rawRows.map((row) => relations.mapRelationalRow(this.schema, this.tableConfig, row, query.selection, mapColumnValue));
            if (this.mode === 'first') {
                return rows[0];
            }
            return rows;
        });
    }
    execute() {
        if (this.mode === 'first') {
            return this.prepare().get();
        }
        return this.prepare().all();
    }
}
relations.applyMixins(SQLiteRelationalQuery, [relations.QueryPromise]);

class BaseSQLiteDatabase {
    dialect;
    session;
    query;
    constructor(resultKind, 
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
                this.query[tableName] =
                    new (resultKind === 'async' ? AsyncRelationalQueryBuilder : SyncRelationalQueryBuilder)(schema.fullSchema, this._.schema, this._.tableNamesMap, schema.fullSchema[tableName], columns, dialect, session);
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
            return new SQLiteSelectBuilder(fields ?? undefined, self.session, self.dialect, queries);
        }
        return { select };
    }
    select(fields) {
        return new SQLiteSelectBuilder(fields ?? undefined, this.session, this.dialect);
    }
    update(table) {
        return new SQLiteUpdateBuilder(table, this.session, this.dialect);
    }
    insert(into) {
        return new SQLiteInsertBuilder(into, this.session, this.dialect);
    }
    delete(from) {
        return new SQLiteDelete(from, this.session, this.dialect);
    }
    run(query) {
        return this.session.run(query.getSQL());
    }
    all(query) {
        return this.session.all(query.getSQL());
    }
    get(query) {
        return this.session.get(query.getSQL());
    }
    values(query) {
        return this.session.values(query.getSQL());
    }
    transaction(transaction, config) {
        return this.session.transaction(transaction, config);
    }
}

class Batch {
}
let PreparedQuery$1 = class PreparedQuery {
    runInBatch(_batch, _placeholderValues) {
        throw new Error('`runInBatch()` not supported');
    }
};
class SQLiteSession {
    constructor(
    /** @internal */
    dialect) {
        this.dialect = dialect;
    }
    prepareOneTimeQuery(query, fields) {
        return this.prepareQuery(query, fields);
    }
    run(query) {
        const staticQuery = this.dialect.sqlToQuery(query);
        try {
            return this.prepareOneTimeQuery(staticQuery, undefined).run();
        }
        catch (err) {
            throw errors.DrizzleError.wrap(err, `Failed to run the query '${staticQuery.sql}'`);
        }
    }
    all(query) {
        return this.prepareOneTimeQuery(this.dialect.sqlToQuery(query), undefined).all();
    }
    get(query) {
        return this.prepareOneTimeQuery(this.dialect.sqlToQuery(query), undefined).get();
    }
    values(query) {
        return this.prepareOneTimeQuery(this.dialect.sqlToQuery(query), undefined).values();
    }
}
class SQLiteTransaction extends BaseSQLiteDatabase {
    constructor(resultType, dialect, session, schema, nestedIndex = 0) {
        super(resultType, dialect, session, schema);
        this.schema = schema;
        this.nestedIndex = nestedIndex;
    }
    rollback() {
        throw new errors.TransactionRollbackError();
    }
}

exports.BaseSQLiteDatabase = BaseSQLiteDatabase;
exports.Batch = Batch;
exports.InlineForeignKeys = InlineForeignKeys;
exports.ManualViewBuilder = ManualViewBuilder;
exports.PreparedQuery = PreparedQuery$1;
exports.QueryBuilder = QueryBuilder;
exports.SQLiteAsyncDialect = SQLiteAsyncDialect;
exports.SQLiteDelete = SQLiteDelete;
exports.SQLiteDialect = SQLiteDialect;
exports.SQLiteInsert = SQLiteInsert;
exports.SQLiteInsertBuilder = SQLiteInsertBuilder;
exports.SQLiteSelect = SQLiteSelect;
exports.SQLiteSelectBuilder = SQLiteSelectBuilder;
exports.SQLiteSelectQueryBuilder = SQLiteSelectQueryBuilder;
exports.SQLiteSession = SQLiteSession;
exports.SQLiteSyncDialect = SQLiteSyncDialect;
exports.SQLiteTable = SQLiteTable;
exports.SQLiteTransaction = SQLiteTransaction;
exports.SQLiteUpdate = SQLiteUpdate;
exports.SQLiteUpdateBuilder = SQLiteUpdateBuilder;
exports.SQLiteView = SQLiteView;
exports.SQLiteViewBase = SQLiteViewBase;
exports.SQLiteViewConfig = SQLiteViewConfig;
exports.ViewBuilder = ViewBuilder;
exports.ViewBuilderCore = ViewBuilderCore;
exports.sqliteTable = sqliteTable;
exports.sqliteTableCreator = sqliteTableCreator;
exports.sqliteView = sqliteView;
exports.view = view;
//# sourceMappingURL=session-276be7a3.cjs.map
