/*
    `Column` only accepts a full `ColumnConfig` as its generic.
    To infer parts of the config, use `AnyColumn` that accepts a partial config.
    See `GetColumnData` for example usage of inferring.
*/
class Column {
    table;
    name;
    primary;
    notNull;
    default;
    hasDefault;
    config;
    constructor(table, config) {
        this.table = table;
        this.config = config;
        this.name = config.name;
        this.notNull = config.notNull;
        this.default = config.default;
        this.hasDefault = config.hasDefault;
        this.primary = config.primaryKey;
    }
    mapFromDriverValue(value) {
        return value;
    }
    mapToDriverValue(value) {
        return value;
    }
}

const ViewBaseConfig = Symbol('ViewBaseConfig');
class View {
    /** @internal */
    [ViewBaseConfig];
    constructor({ name, schema, selectedFields, query }) {
        this[ViewBaseConfig] = {
            name,
            originalName: name,
            schema,
            selectedFields,
            query: query,
            isExisting: !query,
            isAlias: false,
        };
    }
}

const SubqueryConfig = Symbol('SubqueryConfig');
class Subquery {
    /** @internal */
    [SubqueryConfig];
    constructor(sql, selection, alias, isWith = false) {
        this[SubqueryConfig] = {
            sql,
            selection,
            alias,
            isWith,
        };
    }
}
class WithSubquery extends Subquery {
}
class SelectionProxyHandler {
    config;
    constructor(config) {
        this.config = { ...config };
    }
    get(subquery, prop) {
        if (prop === SubqueryConfig) {
            return {
                ...subquery[SubqueryConfig],
                selection: new Proxy(subquery[SubqueryConfig].selection, this),
            };
        }
        if (prop === ViewBaseConfig) {
            return {
                ...subquery[ViewBaseConfig],
                selectedFields: new Proxy(subquery[ViewBaseConfig].selectedFields, this),
            };
        }
        if (typeof prop === 'symbol') {
            return subquery[prop];
        }
        const columns = subquery instanceof Subquery
            ? subquery[SubqueryConfig].selection
            : subquery instanceof View
                ? subquery[ViewBaseConfig].selectedFields
                : subquery;
        const value = columns[prop];
        if (value instanceof SQL.Aliased) {
            // Never return the underlying SQL expression for a field previously selected in a subquery
            if (this.config.sqlAliasedBehavior === 'sql' && !value.isSelectionField) {
                return value.sql;
            }
            const newValue = value.clone();
            newValue.isSelectionField = true;
            return newValue;
        }
        if (value instanceof SQL) {
            if (this.config.sqlBehavior === 'sql') {
                return value;
            }
            throw new Error(`You tried to reference "${prop}" field from a subquery, which is a raw SQL field, but it doesn't have an alias declared. Please add an alias to the field using ".as('alias')" method.`);
        }
        if (value instanceof Column) {
            if (this.config.alias) {
                return new Proxy(value, new ColumnAliasProxyHandler(new Proxy(value.table, new TableAliasProxyHandler(this.config.alias, this.config.replaceOriginalName ?? false))));
            }
            return value;
        }
        if (typeof value !== 'object' || value === null) {
            return value;
        }
        return new Proxy(value, new SelectionProxyHandler(this.config));
    }
}

/** @internal */
const TableName = Symbol('Name');
/** @internal */
const Schema = Symbol('Schema');
/** @internal */
const Columns = Symbol('Columns');
/** @internal */
const OriginalName = Symbol('OriginalName');
/** @internal */
const BaseName = Symbol('BaseName');
/** @internal */
const IsAlias = Symbol('IsAlias');
/** @internal */
const ExtraConfigBuilder = Symbol('ExtraConfigBuilder');
const IsDrizzleTable = Symbol.for('IsDrizzleTable');
class Table {
    /** @internal */
    static Symbol = {
        Name: TableName,
        Schema: Schema,
        OriginalName: OriginalName,
        Columns: Columns,
        BaseName: BaseName,
        IsAlias: IsAlias,
        ExtraConfigBuilder: ExtraConfigBuilder,
    };
    /**
     * @internal
     * Can be changed if the table is aliased.
     */
    [TableName];
    /**
     * @internal
     * Used to store the original name of the table, before any aliasing.
     */
    [OriginalName];
    /** @internal */
    [Schema];
    /** @internal */
    [Columns];
    /**
     *  @internal
     * Used to store the table name before the transformation via the `tableCreator` functions.
     */
    [BaseName];
    /** @internal */
    [IsAlias] = false;
    /** @internal */
    [ExtraConfigBuilder] = undefined;
    [IsDrizzleTable] = true;
    constructor(name, schema, baseName) {
        this[TableName] = this[OriginalName] = name;
        this[Schema] = schema;
        this[BaseName] = baseName;
    }
}
function isTable(table) {
    return typeof table === 'object' && table !== null && IsDrizzleTable in table;
}
function getTableName(table) {
    return table[TableName];
}

/** @internal */
function mapResultRow(columns, row, joinsNotNullableMap) {
    // Key -> nested object key, value -> table name if all fields in the nested object are from the same table, false otherwise
    const nullifyMap = {};
    const result = columns.reduce((result, { path, field }, columnIndex) => {
        let decoder;
        if (field instanceof Column) {
            decoder = field;
        }
        else if (field instanceof SQL) {
            decoder = field.decoder;
        }
        else {
            decoder = field.sql.decoder;
        }
        let node = result;
        for (const [pathChunkIndex, pathChunk] of path.entries()) {
            if (pathChunkIndex < path.length - 1) {
                if (!(pathChunk in node)) {
                    node[pathChunk] = {};
                }
                node = node[pathChunk];
            }
            else {
                const rawValue = row[columnIndex];
                const value = node[pathChunk] = rawValue === null ? null : decoder.mapFromDriverValue(rawValue);
                if (joinsNotNullableMap && field instanceof Column && path.length === 2) {
                    const objectName = path[0];
                    if (!(objectName in nullifyMap)) {
                        nullifyMap[objectName] = value === null ? getTableName(field.table) : false;
                    }
                    else if (typeof nullifyMap[objectName] === 'string' && nullifyMap[objectName] !== getTableName(field.table)) {
                        nullifyMap[objectName] = false;
                    }
                }
            }
        }
        return result;
    }, {});
    // Nullify all nested objects from nullifyMap that are nullable
    if (joinsNotNullableMap && Object.keys(nullifyMap).length > 0) {
        for (const [objectName, tableName] of Object.entries(nullifyMap)) {
            if (typeof tableName === 'string' && !joinsNotNullableMap[tableName]) {
                result[objectName] = null;
            }
        }
    }
    return result;
}
/** @internal */
function orderSelectedFields(fields, pathPrefix) {
    return Object.entries(fields).reduce((result, [name, field]) => {
        if (typeof name !== 'string') {
            return result;
        }
        const newPath = pathPrefix ? [...pathPrefix, name] : [name];
        if (field instanceof Column
            || field instanceof SQL
            || field instanceof SQL.Aliased) {
            result.push({ path: newPath, field });
        }
        else if (field instanceof Table) {
            result.push(...orderSelectedFields(field[Table.Symbol.Columns], newPath));
        }
        else {
            result.push(...orderSelectedFields(field, newPath));
        }
        return result;
    }, []);
}
/** @internal */
function mapUpdateSet(table, values) {
    const entries = Object.entries(values)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => {
        // eslint-disable-next-line unicorn/prefer-ternary
        if (value instanceof SQL) {
            return [key, value];
        }
        else {
            return [key, new Param(value, table[Table.Symbol.Columns][key])];
        }
    });
    if (entries.length === 0) {
        throw new Error('No values to set');
    }
    return Object.fromEntries(entries);
}
/** @internal */
function applyMixins(baseClass, extendedClasses) {
    for (const extendedClass of extendedClasses) {
        for (const name of Object.getOwnPropertyNames(extendedClass.prototype)) {
            Object.defineProperty(baseClass.prototype, name, Object.getOwnPropertyDescriptor(extendedClass.prototype, name) || Object.create(null));
        }
    }
}
function getTableColumns(table) {
    return table[Table.Symbol.Columns];
}
/** @internal */
function getTableLikeName(table) {
    return table instanceof Subquery
        ? table[SubqueryConfig].alias
        : table instanceof View
            ? table[ViewBaseConfig].name
            : table instanceof SQL
                ? undefined
                : table[Table.Symbol.IsAlias]
                    ? table[Table.Symbol.Name]
                    : table[Table.Symbol.BaseName];
}
function iife(fn, ...args) {
    return fn(...args);
}

/** @internal */
const tracer = {
    startActiveSpan(name, fn) {
        {
            return fn();
        }
    },
};

function bindIfParam(value, column) {
    if (isDriverValueEncoder(column) && !isSQLWrapper(value) && !(value instanceof Param) && !(value instanceof Placeholder)
        && !(value instanceof Column) && !(value instanceof Table) && !(value instanceof View)) {
        return new Param(value, column);
    }
    return value;
}
function eq(left, right) {
    return sql `${left} = ${bindIfParam(right, left)}`;
}
function ne(left, right) {
    return sql `${left} <> ${bindIfParam(right, left)}`;
}
function and(...unfilteredConditions) {
    const conditions = unfilteredConditions.filter((c) => c !== undefined);
    if (conditions.length === 0) {
        return undefined;
    }
    if (conditions.length === 1) {
        return conditions[0];
    }
    const chunks = [sql.raw('(')];
    for (const [index, condition] of conditions.entries()) {
        if (index === 0) {
            chunks.push(condition);
        }
        else {
            chunks.push(sql ` and `, condition);
        }
    }
    chunks.push(sql `)`);
    return sql.fromList(chunks);
}
function or(...unfilteredConditions) {
    const conditions = unfilteredConditions.filter((c) => c !== undefined);
    if (conditions.length === 0) {
        return undefined;
    }
    if (conditions.length === 1) {
        return conditions[0];
    }
    const chunks = [sql.raw('(')];
    for (const [index, condition] of conditions.entries()) {
        if (index === 0) {
            chunks.push(condition);
        }
        else {
            chunks.push(sql ` or `, condition);
        }
    }
    chunks.push(sql `)`);
    return sql.fromList(chunks);
}
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
function not(condition) {
    return sql `not ${condition}`;
}
function gt(left, right) {
    return sql `${left} > ${bindIfParam(right, left)}`;
}
function gte(left, right) {
    return sql `${left} >= ${bindIfParam(right, left)}`;
}
function lt(left, right) {
    return sql `${left} < ${bindIfParam(right, left)}`;
}
function lte(left, right) {
    return sql `${left} <= ${bindIfParam(right, left)}`;
}
function inArray(column, values) {
    if (Array.isArray(values)) {
        if (values.length === 0) {
            throw new Error('inArray requires at least one value');
        }
        return sql `${column} in ${values.map((v) => bindIfParam(v, column))}`;
    }
    return sql `${column} in ${bindIfParam(values, column)}`;
}
function notInArray(column, values) {
    if (isSQLWrapper(values)) {
        return sql `${column} not in ${values}`;
    }
    if (Array.isArray(values)) {
        if (values.length === 0) {
            throw new Error('inArray requires at least one value');
        }
        return sql `${column} not in ${values.map((v) => bindIfParam(v, column))}`;
    }
    return sql `${column} not in ${bindIfParam(values, column)}`;
}
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
function isNull(column) {
    return sql `${column} is null`;
}
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
function isNotNull(column) {
    return sql `${column} is not null`;
}
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
function exists(subquery) {
    return sql `exists (${subquery})`;
}
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
function notExists(subquery) {
    return sql `not exists (${subquery})`;
}
function between(column, min, max) {
    return sql `${column} between ${bindIfParam(min, column)} and ${bindIfParam(max, column)}`;
}
function notBetween(column, min, max) {
    return sql `${column} not between ${bindIfParam(min, column)} and ${bindIfParam(max, column)}`;
}
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
function like(column, value) {
    return sql `${column} like ${value}`;
}
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
function notLike(column, value) {
    return sql `${column} not like ${value}`;
}
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
function ilike(column, value) {
    return sql `${column} ilike ${value}`;
}
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
function notIlike(column, value) {
    return sql `${column} not ilike ${value}`;
}

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
function asc(column) {
    return sql `${column} asc`;
}
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
function desc(column) {
    return sql `${column} desc`;
}

/**
 * This class is used to indicate a primitive param value that is used in `sql` tag.
 * It is only used on type level and is never instantiated at runtime.
 * If you see a value of this type in the code, its runtime value is actually the primitive param value.
 */
class FakePrimitiveParam {
}
function isSQLWrapper(value) {
    return typeof value === 'object' && value !== null && 'getSQL' in value
        && typeof value.getSQL === 'function';
}
function mergeQueries(queries) {
    const result = { sql: '', params: [] };
    for (const query of queries) {
        result.sql += query.sql;
        result.params.push(...query.params);
        if (query.typings?.length) {
            result.typings = result.typings || [];
            result.typings.push(...query.typings);
        }
    }
    return result;
}
class StringChunk {
    value;
    constructor(value) {
        this.value = Array.isArray(value) ? value : [value];
    }
}
class SQL {
    queryChunks;
    /** @internal */
    decoder = noopDecoder;
    shouldInlineParams = false;
    constructor(queryChunks) {
        this.queryChunks = queryChunks;
    }
    append(query) {
        this.queryChunks.push(...query.queryChunks);
        return this;
    }
    toQuery(config) {
        return tracer.startActiveSpan('drizzle.buildSQL', (span) => {
            const query = this.buildQueryFromSourceParams(this.queryChunks, config);
            span?.setAttributes({
                'drizzle.query.text': query.sql,
                'drizzle.query.params': JSON.stringify(query.params),
            });
            return query;
        });
    }
    buildQueryFromSourceParams(chunks, _config) {
        const config = Object.assign({}, _config, {
            inlineParams: _config.inlineParams || this.shouldInlineParams,
            paramStartIndex: _config.paramStartIndex || { value: 0 },
        });
        const { escapeName, escapeParam, prepareTyping, inlineParams, paramStartIndex, } = config;
        return mergeQueries(chunks.map((chunk) => {
            if (chunk instanceof StringChunk) {
                return { sql: chunk.value.join(''), params: [] };
            }
            if (chunk instanceof Name) {
                return { sql: escapeName(chunk.value), params: [] };
            }
            if (chunk === undefined) {
                return { sql: '', params: [] };
            }
            if (Array.isArray(chunk)) {
                const result = [new StringChunk('(')];
                for (const [i, p] of chunk.entries()) {
                    result.push(p);
                    if (i < chunk.length - 1) {
                        result.push(new StringChunk(', '));
                    }
                }
                result.push(new StringChunk(')'));
                return this.buildQueryFromSourceParams(result, config);
            }
            if (chunk instanceof SQL) {
                return this.buildQueryFromSourceParams(chunk.queryChunks, {
                    ...config,
                    inlineParams: inlineParams || chunk.shouldInlineParams,
                });
            }
            if (chunk instanceof Table) {
                const schemaName = chunk[Table.Symbol.Schema];
                const tableName = chunk[Table.Symbol.Name];
                return {
                    sql: schemaName === undefined
                        ? escapeName(tableName)
                        : escapeName(schemaName) + '.' + escapeName(tableName),
                    params: [],
                };
            }
            if (chunk instanceof Column) {
                return { sql: escapeName(chunk.table[Table.Symbol.Name]) + '.' + escapeName(chunk.name), params: [] };
            }
            if (chunk instanceof View) {
                const schemaName = chunk[ViewBaseConfig].schema;
                const viewName = chunk[ViewBaseConfig].name;
                return {
                    sql: schemaName === undefined
                        ? escapeName(viewName)
                        : escapeName(schemaName) + '.' + escapeName(viewName),
                    params: [],
                };
            }
            if (chunk instanceof Param) {
                const mappedValue = (chunk.value === null) ? null : chunk.encoder.mapToDriverValue(chunk.value);
                if (mappedValue instanceof SQL) {
                    return this.buildQueryFromSourceParams([mappedValue], config);
                }
                if (inlineParams) {
                    return { sql: this.mapInlineParam(mappedValue, config), params: [] };
                }
                let typings;
                if (prepareTyping !== undefined) {
                    typings = [prepareTyping(chunk.encoder)];
                }
                return { sql: escapeParam(paramStartIndex.value++, mappedValue), params: [mappedValue], typings };
            }
            if (chunk instanceof SQL.Aliased && chunk.fieldAlias !== undefined) {
                return { sql: escapeName(chunk.fieldAlias), params: [] };
            }
            if (chunk instanceof Subquery) {
                if (chunk[SubqueryConfig].isWith) {
                    return { sql: escapeName(chunk[SubqueryConfig].alias), params: [] };
                }
                return this.buildQueryFromSourceParams([
                    new StringChunk('('),
                    chunk[SubqueryConfig].sql,
                    new StringChunk(') '),
                    new Name(chunk[SubqueryConfig].alias),
                ], config);
            }
            if (isSQLWrapper(chunk)) {
                return this.buildQueryFromSourceParams([
                    new StringChunk('('),
                    chunk.getSQL(),
                    new StringChunk(')'),
                ], config);
            }
            if (chunk instanceof Relation) {
                return this.buildQueryFromSourceParams([
                    chunk.sourceTable,
                    new StringChunk('.'),
                    sql.identifier(chunk.fieldName),
                ], config);
            }
            if (inlineParams) {
                return { sql: this.mapInlineParam(chunk, config), params: [] };
            }
            return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk] };
        }));
    }
    mapInlineParam(chunk, { escapeString }) {
        if (chunk === null) {
            return 'null';
        }
        if (typeof chunk === 'number' || typeof chunk === 'boolean') {
            return chunk.toString();
        }
        if (typeof chunk === 'string') {
            return escapeString(chunk);
        }
        if (typeof chunk === 'object') {
            const mappedValueAsString = chunk.toString();
            if (mappedValueAsString === '[object Object]') {
                return escapeString(JSON.stringify(chunk));
            }
            return escapeString(mappedValueAsString);
        }
        throw new Error('Unexpected param value: ' + chunk);
    }
    getSQL() {
        return this;
    }
    as(alias) {
        // TODO: remove with deprecated overloads
        if (alias === undefined) {
            return this;
        }
        return new SQL.Aliased(this, alias);
    }
    mapWith(decoder) {
        this.decoder = typeof decoder === 'function' ? { mapFromDriverValue: decoder } : decoder;
        return this;
    }
    inlineParams() {
        this.shouldInlineParams = true;
        return this;
    }
}
/**
 * Any DB name (table, column, index etc.)
 */
class Name {
    value;
    brand;
    constructor(value) {
        this.value = value;
    }
}
/**
 * Any DB name (table, column, index etc.)
 * @deprecated Use `sql.identifier` instead.
 */
function name(value) {
    return new Name(value);
}
function isDriverValueEncoder(value) {
    return typeof value === 'object' && value !== null && 'mapToDriverValue' in value
        && typeof value.mapToDriverValue === 'function';
}
const noopDecoder = {
    mapFromDriverValue: (value) => value,
};
const noopEncoder = {
    mapToDriverValue: (value) => value,
};
const noopMapper = {
    ...noopDecoder,
    ...noopEncoder,
};
/** Parameter value that is optionally bound to an encoder (for example, a column). */
class Param {
    value;
    encoder;
    brand;
    /**
     * @param value - Parameter value
     * @param encoder - Encoder to convert the value to a driver parameter
     */
    constructor(value, encoder = noopEncoder) {
        this.value = value;
        this.encoder = encoder;
    }
}
function param(value, encoder) {
    return new Param(value, encoder);
}
/*
    The type of `params` is specified as `SQLSourceParam[]`, but that's slightly incorrect -
    in runtime, users won't pass `FakePrimitiveParam` instances as `params` - they will pass primitive values
    which will be wrapped in `Param` using `buildChunksFromParam(...)`. That's why the overload
    specify `params` as `any[]` and not as `SQLSourceParam[]`. This type is used to make our lives easier and
    the type checker happy.
*/
function sql(strings, ...params) {
    const queryChunks = [];
    if (params.length > 0 || (strings.length > 0 && strings[0] !== '')) {
        queryChunks.push(new StringChunk(strings[0]));
    }
    for (const [paramIndex, param] of params.entries()) {
        queryChunks.push(param, new StringChunk(strings[paramIndex + 1]));
    }
    return new SQL(queryChunks);
}
(function (sql) {
    function empty() {
        return new SQL([]);
    }
    sql.empty = empty;
    function fromList(list) {
        return new SQL(list);
    }
    sql.fromList = fromList;
    /**
     * Convenience function to create an SQL query from a raw string.
     * @param str The raw SQL query string.
     */
    function raw(str) {
        return new SQL([new StringChunk(str)]);
    }
    sql.raw = raw;
    /**
     * Convenience function to join a list of SQL chunks with a separator.
     */
    function join(chunks, separator) {
        const result = [];
        for (const [i, chunk] of chunks.entries()) {
            if (i > 0) {
                result.push(separator);
            }
            result.push(chunk);
        }
        return sql.fromList(result);
    }
    sql.join = join;
    /**
     *  Any DB identifier (table name, column name, index name etc.)
     */
    function identifier(value) {
        return name(value);
    }
    sql.identifier = identifier;
})(sql || (sql = {}));
(function (SQL) {
    class Aliased {
        sql;
        fieldAlias;
        /** @internal */
        isSelectionField = false;
        constructor(sql, fieldAlias) {
            this.sql = sql;
            this.fieldAlias = fieldAlias;
        }
        getSQL() {
            return this.sql;
        }
        /** @internal */
        clone() {
            return new Aliased(this.sql, this.fieldAlias);
        }
    }
    SQL.Aliased = Aliased;
})(SQL || (SQL = {}));
class Placeholder {
    name;
    constructor(name) {
        this.name = name;
    }
}
function placeholder(name) {
    return new Placeholder(name);
}
function fillPlaceholders(params, values) {
    return params.map((p) => {
        if (p instanceof Placeholder) {
            if (!(p.name in values)) {
                throw new Error(`No value for placeholder "${p.name}" was provided`);
            }
            return values[p.name];
        }
        return p;
    });
}

class ColumnAliasProxyHandler {
    table;
    constructor(table) {
        this.table = table;
    }
    get(columnObj, prop) {
        if (prop === 'table') {
            return this.table;
        }
        return columnObj[prop];
    }
}
class TableAliasProxyHandler {
    alias;
    replaceOriginalName;
    constructor(alias, replaceOriginalName) {
        this.alias = alias;
        this.replaceOriginalName = replaceOriginalName;
    }
    get(target, prop) {
        if (prop === Table.Symbol.IsAlias) {
            return true;
        }
        if (prop === Table.Symbol.Name) {
            return this.alias;
        }
        if (this.replaceOriginalName && prop === Table.Symbol.OriginalName) {
            return this.alias;
        }
        if (prop === ViewBaseConfig) {
            return {
                ...target[ViewBaseConfig],
                name: this.alias,
                isAlias: true,
            };
        }
        if (prop === Table.Symbol.Columns) {
            const columns = target[Table.Symbol.Columns];
            if (!columns) {
                return columns;
            }
            const proxiedColumns = {};
            Object.keys(columns).map((key) => {
                proxiedColumns[key] = new Proxy(columns[key], new ColumnAliasProxyHandler(new Proxy(target, this)));
            });
            return proxiedColumns;
        }
        const value = target[prop];
        if (value instanceof Column) {
            return new Proxy(value, new ColumnAliasProxyHandler(new Proxy(target, this)));
        }
        return value;
    }
}
class RelationTableAliasProxyHandler {
    alias;
    constructor(alias) {
        this.alias = alias;
    }
    get(target, prop) {
        if (prop === 'sourceTable') {
            return aliasedTable(target.sourceTable, this.alias);
        }
        return target[prop];
    }
}
function aliasedTable(table, tableAlias) {
    return new Proxy(table, new TableAliasProxyHandler(tableAlias, false));
}
function aliasedRelation(relation, tableAlias) {
    return new Proxy(relation, new RelationTableAliasProxyHandler(tableAlias));
}
function aliasedTableColumn(column, tableAlias) {
    return new Proxy(column, new ColumnAliasProxyHandler(new Proxy(column.table, new TableAliasProxyHandler(tableAlias, false))));
}
function mapColumnsInAliasedSQLToAlias(query, alias) {
    return new SQL.Aliased(mapColumnsInSQLToAlias(query.sql, alias), query.fieldAlias);
}
function mapColumnsInSQLToAlias(query, alias) {
    return sql.fromList(query.queryChunks.map((c) => {
        if (c instanceof Column) {
            return aliasedTableColumn(c, alias);
        }
        if (c instanceof SQL) {
            return mapColumnsInSQLToAlias(c, alias);
        }
        if (c instanceof SQL.Aliased) {
            return mapColumnsInAliasedSQLToAlias(c, alias);
        }
        return c;
    }));
}

// To understand how to use `ColumnBuilder` and `AnyColumnBuilder`, see `Column` and `AnyColumn` documentation.
class ColumnBuilder {
    config;
    constructor(name) {
        this.config = {
            name,
            notNull: false,
            default: undefined,
            primaryKey: false,
        };
    }
    $type() {
        return this;
    }
    notNull() {
        this.config.notNull = true;
        return this;
    }
    default(value) {
        this.config.default = value;
        this.config.hasDefault = true;
        return this;
    }
    primaryKey() {
        this.config.primaryKey = true;
        this.config.notNull = true;
        return this;
    }
}

class QueryPromise {
    [Symbol.toStringTag] = 'QueryPromise';
    catch(onRejected) {
        return this.then(undefined, onRejected);
    }
    finally(onFinally) {
        return this.then((value) => {
            onFinally?.();
            return value;
        }, (reason) => {
            onFinally?.();
            throw reason;
        });
    }
    then(onFulfilled, onRejected) {
        return this.execute().then(onFulfilled, onRejected);
    }
}

class CheckBuilder {
    name;
    value;
    brand;
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
    /** @internal */
    build(table) {
        return new Check(table, this);
    }
}
class Check {
    table;
    name;
    value;
    constructor(table, builder) {
        this.table = table;
        this.name = builder.name;
        this.value = builder.value;
    }
}
function check(name, value) {
    return new CheckBuilder(name, value);
}

/** @internal */
const InlineForeignKeys = Symbol('InlineForeignKeys');
class PgTable extends Table {
    /** @internal */
    static Symbol = Object.assign({}, Table.Symbol, {
        InlineForeignKeys: InlineForeignKeys,
    });
    /**@internal */
    [InlineForeignKeys] = [];
    /** @internal */
    [Table.Symbol.ExtraConfigBuilder] = undefined;
}
/** @internal */
function pgTableWithSchema(name, columns, extraConfig, schema, baseName = name) {
    const rawTable = new PgTable(name, schema, baseName);
    const builtColumns = Object.fromEntries(Object.entries(columns).map(([name, colBuilder]) => {
        const column = colBuilder.build(rawTable);
        rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
        return [name, column];
    }));
    const table = Object.assign(rawTable, builtColumns);
    table[Table.Symbol.Columns] = builtColumns;
    if (extraConfig) {
        table[PgTable.Symbol.ExtraConfigBuilder] = extraConfig;
    }
    return table;
}
const pgTable = (name, columns, extraConfig) => {
    return pgTableWithSchema(name, columns, extraConfig, undefined);
};
function pgTableCreator(customizeTableName) {
    return (name, columns, extraConfig) => {
        return pgTableWithSchema(customizeTableName(name), columns, extraConfig, undefined, name);
    };
}

class ForeignKeyBuilder {
    /** @internal */
    reference;
    /** @internal */
    _onUpdate = 'no action';
    /** @internal */
    _onDelete = 'no action';
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
        this._onUpdate = action === undefined ? 'no action' : action;
        return this;
    }
    onDelete(action) {
        this._onDelete = action === undefined ? 'no action' : action;
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
            this.table[PgTable.Symbol.Name],
            ...columnNames,
            foreignColumns[0].table[PgTable.Symbol.Name],
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

class IndexBuilderOn {
    unique;
    name;
    constructor(unique, name) {
        this.unique = unique;
        this.name = name;
    }
    on(...columns) {
        return new IndexBuilder(columns, this.unique, false, this.name);
    }
    onOnly(...columns) {
        return new IndexBuilder(columns, this.unique, true, this.name);
    }
}
class IndexBuilder {
    /** @internal */
    config;
    constructor(columns, unique, only, name) {
        this.config = {
            name,
            columns,
            unique,
            only,
        };
    }
    concurrently() {
        this.config.concurrently = true;
        return this;
    }
    using(method) {
        this.config.using = method;
        return this;
    }
    asc() {
        this.config.order = 'asc';
        return this;
    }
    desc() {
        this.config.order = 'desc';
        return this;
    }
    nullsFirst() {
        this.config.nulls = 'first';
        return this;
    }
    nullsLast() {
        this.config.nulls = 'last';
        return this;
    }
    where(condition) {
        this.config.where = condition;
        return this;
    }
    /** @internal */
    build(table) {
        return new Index(this.config, table);
    }
}
class Index {
    config;
    constructor(config, table) {
        this.config = { ...config, table };
    }
}
function index(name) {
    return new IndexBuilderOn(false, name);
}
function uniqueIndex(name) {
    return new IndexBuilderOn(true, name);
}

function primaryKey(...columns) {
    return new PrimaryKeyBuilder(columns);
}
class PrimaryKeyBuilder {
    /** @internal */
    columns;
    constructor(columns) {
        this.columns = columns;
    }
    /** @internal */
    build(table) {
        return new PrimaryKey(table, this.columns);
    }
}
class PrimaryKey {
    table;
    columns;
    constructor(table, columns) {
        this.table = table;
        this.columns = columns;
    }
    getName() {
        return `${this.table[PgTable.Symbol.Name]}_${this.columns.map((column) => column.name).join('_')}_pk`;
    }
}

class PgDialect {
    async migrate(migrations, session) {
        const migrationTableCreate = sql `
			CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at bigint
			)
		`;
        await session.execute(sql `CREATE SCHEMA IF NOT EXISTS "drizzle"`);
        await session.execute(migrationTableCreate);
        const dbMigrations = await session.all(sql `select id, hash, created_at from "drizzle"."__drizzle_migrations" order by created_at desc limit 1`);
        const lastDbMigration = dbMigrations[0];
        await session.transaction(async (tx) => {
            for await (const migration of migrations) {
                if (!lastDbMigration
                    || Number(lastDbMigration.created_at) < migration.folderMillis) {
                    for (const stmt of migration.sql) {
                        await tx.execute(sql.raw(stmt));
                    }
                    await tx.execute(sql `insert into "drizzle"."__drizzle_migrations" ("hash", "created_at") values(${migration.hash}, ${migration.folderMillis})`);
                }
            }
        });
    }
    escapeName(name) {
        return `"${name}"`;
    }
    escapeParam(num) {
        return `$${num + 1}`;
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
                        if (c instanceof PgColumn) {
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
    buildSelectQuery({ withList, fields, fieldsFlat, where, having, table, joins, orderBy, groupBy, limit, offset, lockingClauses }) {
        const fieldsList = fieldsFlat ?? orderSelectedFields(fields);
        for (const f of fieldsList) {
            if (f.field instanceof Column
                && getTableName(f.field.table)
                    !== (table instanceof Subquery
                        ? table[SubqueryConfig].alias
                        : table instanceof PgViewBase
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
                let fullName = sql `${sql.identifier(table[Table.Symbol.OriginalName])}`;
                if (table[Table.Symbol.Schema]) {
                    fullName = sql `${sql.identifier(table[Table.Symbol.Schema])}.${fullName}`;
                }
                return sql `${fullName} ${sql.identifier(table[Table.Symbol.Name])}`;
            }
            return table;
        })();
        const joinsArray = [];
        for (const [index, joinMeta] of joins.entries()) {
            if (index === 0) {
                joinsArray.push(sql ` `);
            }
            const table = joinMeta.table;
            if (table instanceof PgTable) {
                const tableName = table[PgTable.Symbol.Name];
                const tableSchema = table[PgTable.Symbol.Schema];
                const origTableName = table[PgTable.Symbol.OriginalName];
                const alias = tableName === origTableName ? undefined : joinMeta.alias;
                joinsArray.push(sql `${sql.raw(joinMeta.joinType)} join ${tableSchema ? sql `${name(tableSchema)}.` : undefined}${name(origTableName)}${alias && sql ` ${name(alias)}`} on ${joinMeta.on}`);
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
        const lockingClausesSql = sql.empty();
        for (const { strength, config } of lockingClauses) {
            const clauseSql = sql ` for ${sql.raw(strength)}`;
            if (config.of) {
                clauseSql.append(sql ` of ${config.of}`);
            }
            if (config.noWait) {
                clauseSql.append(sql ` no wait`);
            }
            else if (config.skipLocked) {
                clauseSql.append(sql ` skip locked`);
            }
            lockingClausesSql.append(clauseSql);
        }
        return sql `${withSql}select ${selection} from ${tableSql}${joinsSql}${whereSql}${groupBySql}${havingSql}${orderBySql}${limitSql}${offsetSql}${lockingClausesSql}`;
    }
    buildInsertQuery({ table, values, onConflict, returning }) {
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
        const returningSql = returning
            ? sql ` returning ${this.buildSelection(returning, { isSingleTable: true })}`
            : undefined;
        const onConflictSql = onConflict ? sql ` on conflict ${onConflict}` : undefined;
        return sql `insert into ${table} ${insertOrder} values ${valuesSql}${onConflictSql}${returningSql}`;
    }
    buildRefreshMaterializedViewQuery({ view, concurrently, withNoData }) {
        const concurrentlySql = concurrently ? sql ` concurrently` : undefined;
        const withNoDataSql = withNoData ? sql ` with no data` : undefined;
        return sql `refresh materialized view${concurrentlySql} ${view}${withNoDataSql}`;
    }
    prepareTyping(encoder) {
        if (encoder instanceof PgJsonb || encoder instanceof PgJson) {
            return 'json';
        }
        else if (encoder instanceof PgNumeric) {
            return 'decimal';
        }
        else if (encoder instanceof PgTime) {
            return 'time';
        }
        else if (encoder instanceof PgTimestamp) {
            return 'timestamp';
        }
        else if (encoder instanceof PgDate) {
            return 'date';
        }
        else if (encoder instanceof PgUUID) {
            return 'uuid';
        }
        else {
            return 'none';
        }
    }
    sqlToQuery(sql) {
        return sql.toQuery({
            escapeName: this.escapeName,
            escapeParam: this.escapeParam,
            escapeString: this.escapeString,
            prepareTyping: this.prepareTyping,
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
        const groupBy = ((tableConfig.primaryKey.length > 0 && selectedRelations.length < 2)
            ? tableConfig.primaryKey
            : Object.values(tableConfig.columns)).map((c) => aliasedTableColumn(c, tableAlias));
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
            const relationConfig = schema[tableNamesMap[relation.referencedTable[Table.Symbol.Name]]];
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
            const relationAliasedColumns = Object.fromEntries(Object.entries(relationConfig.columns).map(([key, value]) => [key, aliasedTableColumn(value, tableAlias)]));
            const relationAliasedRelations = Object.fromEntries(Object.entries(relationConfig.relations).map(([key, value]) => [key, aliasedRelation(value, tableAlias)]));
            const relationAliasedFields = Object.assign({}, relationAliasedColumns, relationAliasedRelations);
            let relationOrderBy;
            if (typeof selectedRelationValue === 'object') {
                let orderByOrig = typeof selectedRelationValue.orderBy === 'function'
                    ? selectedRelationValue.orderBy(relationAliasedFields, orderByOperators)
                    : selectedRelationValue.orderBy ?? [];
                if (!Array.isArray(orderByOrig)) {
                    orderByOrig = [orderByOrig];
                }
                relationOrderBy = orderByOrig.map((orderByValue) => {
                    if (orderByValue instanceof Column) {
                        return aliasedTableColumn(orderByValue, relationAlias);
                    }
                    return mapColumnsInSQLToAlias(orderByValue, relationAlias);
                });
            }
            const relationOrderBySql = relationOrderBy?.length
                ? sql ` order by ${sql.join(relationOrderBy, sql `, `)}`
                : undefined;
            const elseField = sql `json_agg(json_build_array(${sql.join(builtRelation.selection.map(({ dbKey: key, isJson }) => {
                let field = sql `${sql.identifier(relationAlias)}.${sql.identifier(key)}`;
                if (isJson) {
                    field = sql `${field}::json`;
                }
                return field;
            }), sql `, `)})${relationOrderBySql})`;
            if (selectedRelations.length > 1) {
                elseField.append(sql.raw('::text'));
            }
            const countSql = normalizedRelation.references.length === 1
                ? aliasedTableColumn(normalizedRelation.references[0], relationAlias)
                : sql.fromList([
                    sql `coalesce(`,
                    sql.join(normalizedRelation.references.map((c) => aliasedTableColumn(c, relationAlias)), sql.raw(', ')),
                    sql.raw(')'),
                ]);
            const field = sql `case when count(${countSql}) = 0 then '[]' else ${elseField} end`.as(selectedRelationKey);
            const builtRelationField = {
                path: [selectedRelationKey],
                field,
            };
            result = this.buildSelectQuery({
                table: result ? new Subquery(result, {}, tableAlias) : aliasedTable(table, tableAlias),
                fields: {},
                fieldsFlat: [
                    {
                        path: [],
                        field: sql `${sql.identifier(tableAlias)}.*`,
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
                groupBy: [
                    ...groupBy,
                    ...builtRelationFields.map(({ field }) => sql `${sql.identifier(tableAlias)}.${sql.identifier(field.fieldAlias)}`),
                ],
                orderBy: selectedRelationIndex === selectedRelations.length - 1 ? orderBy : [],
                joins: [join],
                withList: [],
                lockingClauses: [],
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
                    field: sql `${sql.identifier(field.fieldAlias)}${selectedRelations.length > 1 ? sql.raw('::json') : undefined}`,
                })),
            ]
            : [
                {
                    path: [],
                    field: sql `${sql.identifier(tableAlias)}.*`,
                },
                ...(builtRelationFields.length === 0
                    ? selectedExtras.map(({ key, value }) => ({
                        path: [key],
                        field: value,
                    }))
                    : []),
            ];
        let limit, offset;
        if (config.limit !== undefined || config.offset !== undefined) {
            if (isRoot) {
                limit = config.limit;
                offset = config.offset;
            }
            else {
                finalFieldsFlat.push({
                    path: ['__drizzle_row_number'],
                    field: sql `row_number() over(partition by ${relationColumns.map((c) => aliasedTableColumn(c, tableAlias))}${orderBy.length ? sql ` order by ${sql.join(orderBy, sql `, `)}` : undefined})`
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
            orderBy: orderBy ?? [],
            joins: [],
            lockingClauses: [],
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

class TypedQueryBuilder {
    /** @internal */
    getSelectedFields() {
        return this._.selectedFields;
    }
}

class PgSelectBuilder {
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
    /**
     * Specify the table, subquery, or other target that you’re
     * building a select query against.
     *
     * {@link https://www.postgresql.org/docs/current/sql-select.html#SQL-FROM|Postgres from documentation}
     */
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
        else if (source instanceof PgViewBase) {
            fields = source[ViewBaseConfig].selectedFields;
        }
        else if (source instanceof SQL) {
            fields = {};
        }
        else {
            fields = getTableColumns(source);
        }
        return new PgSelect(source, fields, isPartialSelect, this.session, this.dialect, this.withList);
    }
}
class PgSelectQueryBuilder extends TypedQueryBuilder {
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
            lockingClauses: [],
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
    /**
     * For each row of the table, include
     * values from a matching row of the joined
     * table, if there is a matching row. If not,
     * all of the columns of the joined table
     * will be set to null.
     */
    leftJoin = this.createJoin('left');
    /**
     * Includes all of the rows of the joined table.
     * If there is no matching row in the main table,
     * all the columns of the main table will be
     * set to null.
     */
    rightJoin = this.createJoin('right');
    /**
     * This is the default type of join.
     *
     * For each row of the table, the joined table
     * needs to have a matching row, or it will
     * be excluded from results.
     */
    innerJoin = this.createJoin('inner');
    /**
     * Rows from both the main & joined are included,
     * regardless of whether or not they have matching
     * rows in the other table.
     */
    fullJoin = this.createJoin('full');
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
    where(where) {
        if (typeof where === 'function') {
            where = where(new Proxy(this.config.fields, new SelectionProxyHandler({ sqlAliasedBehavior: 'sql', sqlBehavior: 'sql' })));
        }
        this.config.where = where;
        return this;
    }
    /**
     * Sets the HAVING clause of this query, which often
     * used with GROUP BY and filters rows after they've been
     * grouped together and combined.
     *
     * {@link https://www.postgresql.org/docs/current/sql-select.html#SQL-HAVING|Postgres having clause documentation}
     */
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
    limit(limit) {
        this.config.limit = limit;
        return this;
    }
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
    offset(offset) {
        this.config.offset = offset;
        return this;
    }
    /**
     * The FOR clause specifies a lock strength for this query
     * that controls how strictly it acquires exclusive access to
     * the rows being queried.
     *
     * {@link https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE|Postgres locking clause documentation}
     */
    for(strength, config = {}) {
        this.config.lockingClauses.push({ strength, config });
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
class PgSelect extends PgSelectQueryBuilder {
    _prepare(name) {
        const { session, config, dialect, joinsNotNullableMap } = this;
        if (!session) {
            throw new Error('Cannot execute a query on a query builder. Please use a database instance instead.');
        }
        return tracer.startActiveSpan('drizzle.prepareQuery', () => {
            const fieldsList = orderSelectedFields(config.fields);
            const query = session.prepareQuery(dialect.sqlToQuery(this.getSQL()), fieldsList, name);
            query.joinsNotNullableMap = joinsNotNullableMap;
            return query;
        });
    }
    /**
     * Create a prepared statement for this query. This allows
     * the database to remember this query for the given session
     * and call it by name, rather than specifying the full query.
     *
     * {@link https://www.postgresql.org/docs/current/sql-prepare.html|Postgres prepare documentation}
     */
    prepare(name) {
        return this._prepare(name);
    }
    execute = (placeholderValues) => {
        return tracer.startActiveSpan('drizzle.operation', () => {
            return this._prepare().execute(placeholderValues);
        });
    };
}
applyMixins(PgSelect, [QueryPromise]);

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
            return new PgSelectBuilder(fields ?? undefined, undefined, self.getDialect(), queries);
        }
        return { select };
    }
    select(fields) {
        return new PgSelectBuilder(fields ?? undefined, undefined, this.getDialect());
    }
    // Lazy load dialect to avoid circular dependency
    getDialect() {
        if (!this.dialect) {
            this.dialect = new PgDialect();
        }
        return this.dialect;
    }
}

class DefaultViewBuilderCore {
    name;
    schema;
    constructor(name, schema) {
        this.name = name;
        this.schema = schema;
    }
    config = {};
    with(config) {
        this.config.with = config;
        return this;
    }
}
class ViewBuilder extends DefaultViewBuilderCore {
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
        return new Proxy(new PgView({
            pgConfig: this.config,
            config: {
                name: this.name,
                schema: this.schema,
                selectedFields: aliasedSelection,
                query: qb.getSQL().inlineParams(),
            },
        }), selectionProxy);
    }
}
class ManualViewBuilder extends DefaultViewBuilderCore {
    columns;
    constructor(name, columns, schema) {
        super(name, schema);
        this.columns = getTableColumns(pgTable(name, columns));
    }
    existing() {
        return new Proxy(new PgView({
            pgConfig: undefined,
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
        return new Proxy(new PgView({
            pgConfig: this.config,
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
class MaterializedViewBuilderCore {
    name;
    schema;
    constructor(name, schema) {
        this.name = name;
        this.schema = schema;
    }
    config = {};
    using(using) {
        this.config.using = using;
        return this;
    }
    with(config) {
        this.config.with = config;
        return this;
    }
    tablespace(tablespace) {
        this.config.tablespace = tablespace;
        return this;
    }
    withNoData() {
        this.config.withNoData = true;
        return this;
    }
}
class MaterializedViewBuilder extends MaterializedViewBuilderCore {
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
        return new Proxy(new PgMaterializedView({
            pgConfig: {
                with: this.config.with,
                using: this.config.using,
                tablespace: this.config.tablespace,
                withNoData: this.config.withNoData,
            },
            config: {
                name: this.name,
                schema: this.schema,
                selectedFields: aliasedSelection,
                query: qb.getSQL().inlineParams(),
            },
        }), selectionProxy);
    }
}
class ManualMaterializedViewBuilder extends MaterializedViewBuilderCore {
    columns;
    constructor(name, columns, schema) {
        super(name, schema);
        this.columns = getTableColumns(pgTable(name, columns));
    }
    existing() {
        return new Proxy(new PgMaterializedView({
            pgConfig: undefined,
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
        return new Proxy(new PgMaterializedView({
            pgConfig: undefined,
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
class PgViewBase extends View {
}
const PgViewConfig = Symbol('PgViewConfig');
class PgView extends PgViewBase {
    [PgViewConfig];
    constructor({ pgConfig, config }) {
        super(config);
        if (pgConfig) {
            this[PgViewConfig] = {
                with: pgConfig.with,
            };
        }
    }
}
const PgMaterializedViewConfig = Symbol('PgMaterializedViewConfig');
class PgMaterializedView extends PgViewBase {
    [PgMaterializedViewConfig];
    constructor({ pgConfig, config }) {
        super(config);
        this[PgMaterializedViewConfig] = {
            with: pgConfig?.with,
            using: pgConfig?.using,
            tablespace: pgConfig?.tablespace,
            withNoData: pgConfig?.withNoData,
        };
    }
}
/** @internal */
function pgViewWithSchema(name, selection, schema) {
    if (selection) {
        return new ManualViewBuilder(name, selection, schema);
    }
    return new ViewBuilder(name, schema);
}
/** @internal */
function pgMaterializedViewWithSchema(name, selection, schema) {
    if (selection) {
        return new ManualMaterializedViewBuilder(name, selection, schema);
    }
    return new MaterializedViewBuilder(name, schema);
}
function pgView(name, columns) {
    return pgViewWithSchema(name, columns, undefined);
}
function pgMaterializedView(name, columns) {
    return pgMaterializedViewWithSchema(name, columns, undefined);
}

function getTableConfig(table) {
    const columns = Object.values(table[Table.Symbol.Columns]);
    const indexes = [];
    const checks = [];
    const primaryKeys = [];
    const foreignKeys = Object.values(table[PgTable.Symbol.InlineForeignKeys]);
    const name = table[Table.Symbol.Name];
    const schema = table[Table.Symbol.Schema];
    const extraConfigBuilder = table[PgTable.Symbol.ExtraConfigBuilder];
    if (extraConfigBuilder !== undefined) {
        const extraConfig = extraConfigBuilder(table[Table.Symbol.Columns]);
        for (const builder of Object.values(extraConfig)) {
            if (builder instanceof IndexBuilder) {
                indexes.push(builder.build(table));
            }
            else if (builder instanceof CheckBuilder) {
                checks.push(builder.build(table));
            }
            else if (builder instanceof PrimaryKeyBuilder) {
                primaryKeys.push(builder.build(table));
            }
            else if (builder instanceof ForeignKeyBuilder) {
                foreignKeys.push(builder.build(table));
            }
        }
    }
    return {
        columns,
        indexes,
        foreignKeys,
        checks,
        primaryKeys,
        name,
        schema,
    };
}
function getViewConfig(view) {
    return {
        ...view[ViewBaseConfig],
        ...view[PgViewConfig],
    };
}
function getMaterializedViewConfig(view) {
    return {
        ...view[ViewBaseConfig],
        ...view[PgMaterializedViewConfig],
    };
}
function parsePgArrayValue(arrayString, startFrom, inQuotes) {
    for (let i = startFrom; i < arrayString.length; i++) {
        const char = arrayString[i];
        if (char === '\\') {
            i++;
            continue;
        }
        if (char === '"') {
            return [arrayString.slice(startFrom, i).replace(/\\/g, ''), i + 1];
        }
        if (inQuotes) {
            continue;
        }
        if (char === ',' || char === '}') {
            return [arrayString.slice(startFrom, i).replace(/\\/g, ''), i];
        }
    }
    return [arrayString.slice(startFrom).replace(/\\/g, ''), arrayString.length];
}
function parsePgNestedArray(arrayString, startFrom = 0) {
    const result = [];
    let i = startFrom;
    let lastCharIsComma = false;
    while (i < arrayString.length) {
        const char = arrayString[i];
        if (char === ',') {
            if (lastCharIsComma || i === startFrom) {
                result.push('');
            }
            lastCharIsComma = true;
            i++;
            continue;
        }
        lastCharIsComma = false;
        if (char === '\\') {
            i += 2;
            continue;
        }
        if (char === '"') {
            const [value, startFrom] = parsePgArrayValue(arrayString, i + 1, true);
            result.push(value);
            i = startFrom;
            continue;
        }
        if (char === '}') {
            return [result, i + 1];
        }
        if (char === '{') {
            const [value, startFrom] = parsePgNestedArray(arrayString, i + 1);
            result.push(value);
            i = startFrom;
            continue;
        }
        const [value, newStartFrom] = parsePgArrayValue(arrayString, i, false);
        result.push(value);
        i = newStartFrom;
    }
    return [result, i];
}
function parsePgArray(arrayString) {
    const [result] = parsePgNestedArray(arrayString, 1);
    return result;
}
function makePgArray(array) {
    return `{${array.map((item) => {
        if (Array.isArray(item)) {
            return makePgArray(item);
        }
        if (typeof item === 'string' && item.includes(',')) {
            return `"${item.replace(/"/g, '\\"')}"`;
        }
        return `${item}`;
    }).join(',')}}`;
}

class PgColumnBuilder extends ColumnBuilder {
    foreignKeyConfigs = [];
    array(size) {
        return new PgArrayBuilder(this.config.name, this, size);
    }
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
// To understand how to use `PgColumn` and `AnyPgColumn`, see `Column` and `AnyColumn` documentation.
class PgColumn extends Column {
}

class PgArrayBuilder extends PgColumnBuilder {
    constructor(name, baseBuilder, size) {
        super(name);
        this.config.baseBuilder = baseBuilder;
        this.config.size = size;
    }
    /** @internal */
    build(table) {
        const baseColumn = this.config.baseBuilder.build(table);
        return new PgArray(table, this.config, baseColumn);
    }
}
class PgArray extends PgColumn {
    baseColumn;
    range;
    size;
    constructor(table, config, baseColumn, range) {
        super(table, config);
        this.baseColumn = baseColumn;
        this.range = range;
        this.size = config.size;
    }
    getSQLType() {
        return `${this.baseColumn.getSQLType()}[${typeof this.size === 'number' ? this.size : ''}]`;
    }
    mapFromDriverValue(value) {
        if (typeof value === 'string') {
            // Thank you node-postgres for not parsing enum arrays
            value = parsePgArray(value);
        }
        return value.map((v) => this.baseColumn.mapFromDriverValue(v));
    }
    mapToDriverValue(value, isNestedArray = false) {
        const a = value.map((v) => v === null
            ? null
            : this.baseColumn instanceof PgArray
                ? this.baseColumn.mapToDriverValue(v, true)
                : this.baseColumn.mapToDriverValue(v));
        if (isNestedArray)
            return a;
        return makePgArray(a);
    }
}

class PgDateColumnBaseBuilder extends PgColumnBuilder {
    defaultNow() {
        return this.default(sql `now()`);
    }
}

class PgDateBuilder extends PgDateColumnBaseBuilder {
    /** @internal */
    build(table) {
        return new PgDate(table, this.config);
    }
}
class PgDate extends PgColumn {
    getSQLType() {
        return 'date';
    }
    mapFromDriverValue(value) {
        return new Date(value);
    }
    mapToDriverValue(value) {
        return value.toISOString();
    }
}
class PgDateStringBuilder extends PgDateColumnBaseBuilder {
    /** @internal */
    build(table) {
        return new PgDateString(table, this.config);
    }
}
class PgDateString extends PgColumn {
    getSQLType() {
        return 'date';
    }
}
function date(name, config) {
    if (config?.mode === 'date') {
        return new PgDateBuilder(name);
    }
    return new PgDateStringBuilder(name);
}

class PgJsonBuilder extends PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgJson(table, this.config);
    }
}
class PgJson extends PgColumn {
    constructor(table, config) {
        super(table, config);
    }
    getSQLType() {
        return 'json';
    }
    mapToDriverValue(value) {
        return JSON.stringify(value);
    }
    mapFromDriverValue(value) {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch {
                return value;
            }
        }
        return value;
    }
}
function json(name) {
    return new PgJsonBuilder(name);
}

class PgJsonbBuilder extends PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgJsonb(table, this.config);
    }
}
class PgJsonb extends PgColumn {
    constructor(table, config) {
        super(table, config);
    }
    getSQLType() {
        return 'jsonb';
    }
    mapToDriverValue(value) {
        return JSON.stringify(value);
    }
    mapFromDriverValue(value) {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch {
                return value;
            }
        }
        return value;
    }
}
function jsonb(name) {
    return new PgJsonbBuilder(name);
}

class PgNumericBuilder extends PgColumnBuilder {
    constructor(name, precision, scale) {
        super(name);
        this.config.precision = precision;
        this.config.scale = scale;
    }
    /** @internal */
    build(table) {
        return new PgNumeric(table, this.config);
    }
}
class PgNumeric extends PgColumn {
    precision;
    scale;
    constructor(table, config) {
        super(table, config);
        this.precision = config.precision;
        this.scale = config.scale;
    }
    getSQLType() {
        if (this.precision !== undefined && this.scale !== undefined) {
            return `numeric(${this.precision}, ${this.scale})`;
        }
        else if (this.precision === undefined) {
            return 'numeric';
        }
        else {
            return `numeric(${this.precision})`;
        }
    }
}
function numeric(name, config) {
    return new PgNumericBuilder(name, config?.precision, config?.scale);
}
const decimal = numeric;

class PgTimeBuilder extends PgDateColumnBaseBuilder {
    withTimezone;
    precision;
    constructor(name, withTimezone, precision) {
        super(name);
        this.withTimezone = withTimezone;
        this.precision = precision;
        this.config.withTimezone = withTimezone;
        this.config.precision = precision;
    }
    /** @internal */
    build(table) {
        return new PgTime(table, this.config);
    }
}
class PgTime extends PgColumn {
    withTimezone;
    precision;
    constructor(table, config) {
        super(table, config);
        this.withTimezone = config.withTimezone;
        this.precision = config.precision;
    }
    getSQLType() {
        const precision = this.precision === undefined ? '' : `(${this.precision})`;
        return `time${precision}${this.withTimezone ? ' with time zone' : ''}`;
    }
}
function time(name, config = {}) {
    return new PgTimeBuilder(name, config.withTimezone ?? false, config.precision);
}

class PgTimestampBuilder extends PgDateColumnBaseBuilder {
    constructor(name, withTimezone, precision) {
        super(name);
        this.config.withTimezone = withTimezone;
        this.config.precision = precision;
    }
    /** @internal */
    build(table) {
        return new PgTimestamp(table, this.config);
    }
}
class PgTimestamp extends PgColumn {
    withTimezone;
    precision;
    constructor(table, config) {
        super(table, config);
        this.withTimezone = config.withTimezone;
        this.precision = config.precision;
    }
    getSQLType() {
        const precision = this.precision === undefined ? '' : ` (${this.precision})`;
        return `timestamp${precision}${this.withTimezone ? ' with time zone' : ''}`;
    }
    mapFromDriverValue = (value) => {
        return new Date(this.withTimezone ? value : value + '+0000');
    };
    mapToDriverValue = (value) => {
        return this.withTimezone ? value.toUTCString() : value.toISOString();
    };
}
class PgTimestampStringBuilder extends PgDateColumnBaseBuilder {
    constructor(name, withTimezone, precision) {
        super(name);
        this.config.withTimezone = withTimezone;
        this.config.precision = precision;
    }
    /** @internal */
    build(table) {
        return new PgTimestampString(table, this.config);
    }
}
class PgTimestampString extends PgColumn {
    withTimezone;
    precision;
    constructor(table, config) {
        super(table, config);
        this.withTimezone = config.withTimezone;
        this.precision = config.precision;
    }
    getSQLType() {
        const precision = this.precision === undefined ? '' : `(${this.precision})`;
        return `timestamp${precision}${this.withTimezone ? ' with time zone' : ''}`;
    }
}
function timestamp(name, config = {}) {
    if (config.mode === 'string') {
        return new PgTimestampStringBuilder(name, config.withTimezone ?? false, config.precision);
    }
    return new PgTimestampBuilder(name, config.withTimezone ?? false, config.precision);
}

class PgUUIDBuilder extends PgColumnBuilder {
    /**
     * Adds `default gen_random_uuid()` to the column definition.
     */
    defaultRandom() {
        return this.default(sql `gen_random_uuid()`);
    }
    /** @internal */
    build(table) {
        return new PgUUID(table, this.config);
    }
}
class PgUUID extends PgColumn {
    getSQLType() {
        return 'uuid';
    }
}
function uuid(name) {
    return new PgUUIDBuilder(name);
}

class Relation {
    sourceTable;
    referencedTable;
    relationName;
    referencedTableName;
    fieldName;
    constructor(sourceTable, referencedTable, relationName) {
        this.sourceTable = sourceTable;
        this.referencedTable = referencedTable;
        this.relationName = relationName;
        this.referencedTableName = referencedTable[Table.Symbol.Name];
    }
}
class Relations {
    table;
    config;
    constructor(table, config) {
        this.table = table;
        this.config = config;
    }
}
class One extends Relation {
    config;
    isNullable;
    constructor(sourceTable, referencedTable, config, isNullable) {
        super(sourceTable, referencedTable, config?.relationName);
        this.config = config;
        this.isNullable = isNullable;
    }
    withFieldName(fieldName) {
        const relation = new One(this.sourceTable, this.referencedTable, this.config, this.isNullable);
        relation.fieldName = fieldName;
        return relation;
    }
}
class Many extends Relation {
    config;
    constructor(sourceTable, referencedTable, config) {
        super(sourceTable, referencedTable, config?.relationName);
        this.config = config;
    }
    withFieldName(fieldName) {
        const relation = new Many(this.sourceTable, this.referencedTable, this.config);
        relation.fieldName = fieldName;
        return relation;
    }
}
const operators = {
    sql,
    eq,
    and,
    or,
};
const orderByOperators = {
    sql,
    asc,
    desc,
};
function extractTablesRelationalConfig(schema, configHelpers) {
    if (Object.keys(schema).length === 1 && 'default' in schema && !(schema['default'] instanceof Table)) {
        schema = schema['default'];
    }
    // table DB name -> schema table key
    const tableNamesMap = {};
    // Table relations found before their tables - need to buffer them until we know the schema table key
    const relationsBuffer = {};
    const tablesConfig = {};
    for (const [key, value] of Object.entries(schema)) {
        if (isTable(value)) {
            const dbName = value[Table.Symbol.Name];
            const bufferedRelations = relationsBuffer[dbName];
            tableNamesMap[dbName] = key;
            tablesConfig[key] = {
                tsName: key,
                dbName: value[Table.Symbol.Name],
                columns: value[Table.Symbol.Columns],
                relations: bufferedRelations?.relations ?? {},
                primaryKey: bufferedRelations?.primaryKey ?? [],
            };
            // Fill in primary keys
            for (const column of Object.values(value[Table.Symbol.Columns])) {
                if (column.primary) {
                    tablesConfig[key].primaryKey.push(column);
                }
            }
            const extraConfig = value[Table.Symbol.ExtraConfigBuilder]?.(value);
            if (extraConfig) {
                for (const configEntry of Object.values(extraConfig)) {
                    if (configEntry instanceof PrimaryKeyBuilder) {
                        tablesConfig[key].primaryKey.push(...configEntry.columns);
                    }
                }
            }
        }
        else if (value instanceof Relations) {
            const dbName = value.table[Table.Symbol.Name];
            const tableName = tableNamesMap[dbName];
            const relations = value.config(configHelpers(value.table));
            let primaryKey;
            for (const [relationName, relation] of Object.entries(relations)) {
                if (tableName) {
                    const tableConfig = tablesConfig[tableName];
                    tableConfig.relations[relationName] = relation;
                }
                else {
                    if (!(dbName in relationsBuffer)) {
                        relationsBuffer[dbName] = {
                            relations: {},
                            primaryKey,
                        };
                    }
                    relationsBuffer[dbName].relations[relationName] = relation;
                }
            }
        }
    }
    return { tables: tablesConfig, tableNamesMap };
}
function relations(table, relations) {
    return new Relations(table, (helpers) => Object.fromEntries(Object.entries(relations(helpers))
        .map(([key, value]) => [key, value.withFieldName(key)])));
}
function createOne(sourceTable) {
    return function one(table, config) {
        return new One(sourceTable, table, config, (config?.fields.reduce((res, f) => res && f.notNull, true) ?? false));
    };
}
function createMany(sourceTable) {
    return function many(referencedTable, config) {
        return new Many(sourceTable, referencedTable, config);
    };
}
function normalizeRelation(schema, tableNamesMap, relation) {
    if (relation instanceof One && relation.config) {
        return {
            fields: relation.config.fields,
            references: relation.config.references,
        };
    }
    const referencedTableTsName = tableNamesMap[relation.referencedTable[Table.Symbol.Name]];
    if (!referencedTableTsName) {
        throw new Error(`Table "${relation.referencedTable[Table.Symbol.Name]}" not found in schema`);
    }
    const referencedTableFields = schema[referencedTableTsName];
    if (!referencedTableFields) {
        throw new Error(`Table "${referencedTableTsName}" not found in schema`);
    }
    const sourceTable = relation.sourceTable;
    const sourceTableTsName = tableNamesMap[sourceTable[Table.Symbol.Name]];
    if (!sourceTableTsName) {
        throw new Error(`Table "${sourceTable[Table.Symbol.Name]}" not found in schema`);
    }
    const reverseRelations = [];
    for (const referencedTableRelation of Object.values(referencedTableFields.relations)) {
        if ((relation.relationName && relation !== referencedTableRelation
            && referencedTableRelation.relationName === relation.relationName)
            || (!relation.relationName && referencedTableRelation.referencedTable === relation.sourceTable)) {
            reverseRelations.push(referencedTableRelation);
        }
    }
    if (reverseRelations.length > 1) {
        throw relation.relationName
            ? new Error(`There are multiple relations with name "${relation.relationName}" in table "${referencedTableTsName}"`)
            : new Error(`There are multiple relations between "${referencedTableTsName}" and "${relation.sourceTable[Table.Symbol.Name]}". Please specify relation name`);
    }
    if (reverseRelations[0] && reverseRelations[0] instanceof One && reverseRelations[0].config) {
        return {
            fields: reverseRelations[0].config.references,
            references: reverseRelations[0].config.fields,
        };
    }
    throw new Error(`There is not enough information to infer relation "${sourceTableTsName}.${relation.fieldName}"`);
}
function createTableRelationsHelpers(sourceTable) {
    return {
        one: createOne(sourceTable),
        many: createMany(sourceTable),
    };
}
function mapRelationalRow(tablesConfig, tableConfig, row, buildQueryResultSelection, mapColumnValue = (value) => value) {
    const result = {};
    for (const [selectionItemIndex, selectionItem] of buildQueryResultSelection.entries()) {
        if (selectionItem.isJson) {
            const relation = tableConfig.relations[selectionItem.tsKey];
            const rawSubRows = row[selectionItemIndex];
            const subRows = typeof rawSubRows === 'string' ? JSON.parse(rawSubRows) : rawSubRows;
            if (relation instanceof One) {
                result[selectionItem.tsKey] = subRows[0]
                    ? mapRelationalRow(tablesConfig, tablesConfig[selectionItem.tableTsKey], subRows[0], selectionItem.selection, mapColumnValue)
                    : null;
            }
            else {
                result[selectionItem.tsKey] = subRows.map((subRow) => mapRelationalRow(tablesConfig, tablesConfig[selectionItem.tableTsKey], subRow, selectionItem.selection, mapColumnValue));
            }
        }
        else {
            const value = mapColumnValue(row[selectionItemIndex]);
            const field = selectionItem.field;
            let decoder;
            if (field instanceof Column) {
                decoder = field;
            }
            else if (field instanceof SQL) {
                decoder = field.decoder;
            }
            else {
                decoder = field.sql.decoder;
            }
            result[selectionItem.tsKey] = value === null ? null : decoder.mapFromDriverValue(value);
        }
    }
    return result;
}

export { PgArray as $, normalizeRelation as A, and as B, Column as C, or as D, aliasedTable as E, eq as F, TypedQueryBuilder as G, getTableLikeName as H, applyMixins as I, ColumnBuilder as J, TableAliasProxyHandler as K, PgColumnBuilder as L, PgColumn as M, pgTableWithSchema as N, pgViewWithSchema as O, PgDialect as P, QueryPromise as Q, Relation as R, SQL as S, Table as T, pgMaterializedViewWithSchema as U, View as V, WithSubquery as W, CheckBuilder as X, Check as Y, check as Z, PgArrayBuilder as _, Param as a, RelationTableAliasProxyHandler as a$, PgDateBuilder as a0, PgDate as a1, PgDateStringBuilder as a2, PgDateString as a3, date as a4, PgJsonBuilder as a5, PgJson as a6, json as a7, PgJsonbBuilder as a8, PgJsonb as a9, PrimaryKey as aA, PgSelectQueryBuilder as aB, PgSelect as aC, InlineForeignKeys as aD, PgTable as aE, pgTable as aF, pgTableCreator as aG, getTableConfig as aH, getViewConfig as aI, getMaterializedViewConfig as aJ, parsePgNestedArray as aK, parsePgArray as aL, makePgArray as aM, DefaultViewBuilderCore as aN, ViewBuilder as aO, ManualViewBuilder as aP, MaterializedViewBuilderCore as aQ, MaterializedViewBuilder as aR, ManualMaterializedViewBuilder as aS, PgViewBase as aT, PgViewConfig as aU, PgView as aV, PgMaterializedViewConfig as aW, PgMaterializedView as aX, pgView as aY, pgMaterializedView as aZ, ColumnAliasProxyHandler as a_, jsonb as aa, PgNumericBuilder as ab, PgNumeric as ac, numeric as ad, decimal as ae, PgTimeBuilder as af, PgTime as ag, time as ah, PgTimestampBuilder as ai, PgTimestamp as aj, PgTimestampStringBuilder as ak, PgTimestampString as al, timestamp as am, PgUUIDBuilder as an, PgUUID as ao, uuid as ap, ForeignKeyBuilder as aq, ForeignKey as ar, foreignKey as as, IndexBuilderOn as at, IndexBuilder as au, Index as av, index as aw, uniqueIndex as ax, primaryKey as ay, PrimaryKeyBuilder as az, mapUpdateSet as b, bindIfParam as b0, ne as b1, not as b2, gt as b3, gte as b4, lt as b5, lte as b6, inArray as b7, notInArray as b8, isNull as b9, placeholder as bA, TableName as bB, Schema as bC, Columns as bD, OriginalName as bE, BaseName as bF, IsAlias as bG, ExtraConfigBuilder as bH, isTable as bI, iife as bJ, isNotNull as ba, exists as bb, notExists as bc, between as bd, notBetween as be, like as bf, notLike as bg, ilike as bh, notIlike as bi, asc as bj, desc as bk, Relations as bl, One as bm, Many as bn, relations as bo, createOne as bp, createMany as bq, FakePrimitiveParam as br, isSQLWrapper as bs, StringChunk as bt, Name as bu, isDriverValueEncoder as bv, noopDecoder as bw, noopEncoder as bx, noopMapper as by, Placeholder as bz, createTableRelationsHelpers as c, mapRelationalRow as d, extractTablesRelationalConfig as e, fillPlaceholders as f, QueryBuilder as g, SelectionProxyHandler as h, PgSelectBuilder as i, getTableColumns as j, getTableName as k, Subquery as l, mapResultRow as m, name as n, orderSelectedFields as o, SubqueryConfig as p, ViewBaseConfig as q, param as r, sql as s, tracer as t, aliasedTableColumn as u, aliasedRelation as v, mapColumnsInAliasedSQLToAlias as w, operators as x, mapColumnsInSQLToAlias as y, orderByOperators as z };
//# sourceMappingURL=relations-3eb6fe55.mjs.map
