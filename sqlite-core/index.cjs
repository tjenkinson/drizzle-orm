'use strict';

var relations = require('../relations-9f413b53.cjs');
var session = require('../session-276be7a3.cjs');
require('../errors-d0192d62.cjs');

function alias(table, alias) {
    return new Proxy(table, new relations.TableAliasProxyHandler(alias, false));
}

class CheckBuilder {
    name;
    value;
    brand;
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
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
            this.table[session.SQLiteTable.Symbol.Name],
            ...columnNames,
            foreignColumns[0].table[session.SQLiteTable.Symbol.Name],
            ...foreignColumnNames,
        ];
        return `${chunks.join('_')}_fk`;
    }
}
function foreignKey(config) {
    function mappedConfig() {
        const { columns, foreignColumns } = config();
        return {
            columns,
            foreignColumns,
        };
    }
    return new ForeignKeyBuilder(mappedConfig);
}

class SQLiteColumnBuilder extends relations.ColumnBuilder {
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
// To understand how to use `SQLiteColumn` and `AnySQLiteColumn`, see `Column` and `AnyColumn` documentation.
class SQLiteColumn extends relations.Column {
}

class SQLiteBigIntBuilder extends SQLiteColumnBuilder {
    /** @internal */
    build(table) {
        return new SQLiteBigInt(table, this.config);
    }
}
class SQLiteBigInt extends SQLiteColumn {
    getSQLType() {
        return 'blob';
    }
    mapFromDriverValue(value) {
        return BigInt(value.toString());
    }
    mapToDriverValue(value) {
        return Buffer.from(value.toString());
    }
}
class SQLiteBlobJsonBuilder extends SQLiteColumnBuilder {
    /** @internal */
    build(table) {
        return new SQLiteBlobJson(table, this.config);
    }
}
class SQLiteBlobJson extends SQLiteColumn {
    getSQLType() {
        return 'blob';
    }
    mapFromDriverValue(value) {
        return JSON.parse(value.toString());
    }
    mapToDriverValue(value) {
        return Buffer.from(JSON.stringify(value));
    }
}
class SQLiteBlobBufferBuilder extends SQLiteColumnBuilder {
    /** @internal */
    build(table) {
        return new SQLiteBlobBuffer(table, this.config);
    }
}
class SQLiteBlobBuffer extends SQLiteColumn {
    getSQLType() {
        return 'blob';
    }
}
function blob(name, config) {
    if (config?.mode === 'json') {
        return new SQLiteBlobJsonBuilder(name);
    }
    if (config?.mode === 'bigint') {
        return new SQLiteBigIntBuilder(name);
    }
    return new SQLiteBlobBufferBuilder(name);
}

class SQLiteCustomColumnBuilder extends SQLiteColumnBuilder {
    constructor(name, fieldConfig, customTypeParams) {
        super(name);
        this.config.fieldConfig = fieldConfig;
        this.config.customTypeParams = customTypeParams;
    }
    /** @internal */
    build(table) {
        return new SQLiteCustomColumn(table, this.config);
    }
}
class SQLiteCustomColumn extends SQLiteColumn {
    sqlName;
    mapTo;
    mapFrom;
    constructor(table, config) {
        super(table, config);
        this.sqlName = config.customTypeParams.dataType(config.fieldConfig);
        this.mapTo = config.customTypeParams.toDriver;
        this.mapFrom = config.customTypeParams.fromDriver;
    }
    getSQLType() {
        return this.sqlName;
    }
    mapFromDriverValue(value) {
        return typeof this.mapFrom === 'function' ? this.mapFrom(value) : value;
    }
    mapToDriverValue(value) {
        return typeof this.mapTo === 'function' ? this.mapTo(value) : value;
    }
}
/**
 * Custom sqlite database data type generator
 */
function customType(customTypeParams) {
    return (dbName, fieldConfig) => {
        return new SQLiteCustomColumnBuilder(dbName, fieldConfig, customTypeParams);
    };
}

class SQLiteBaseIntegerBuilder extends SQLiteColumnBuilder {
    constructor(name) {
        super(name);
        this.config.autoIncrement = false;
    }
    primaryKey(config) {
        if (config?.autoIncrement) {
            this.config.autoIncrement = true;
        }
        this.config.hasDefault = true;
        return super.primaryKey();
    }
}
class SQLiteBaseInteger extends SQLiteColumn {
    autoIncrement = this.config.autoIncrement;
    getSQLType() {
        return 'integer';
    }
}
class SQLiteIntegerBuilder extends SQLiteBaseIntegerBuilder {
    build(table) {
        return new SQLiteInteger(table, this.config);
    }
}
class SQLiteInteger extends SQLiteBaseInteger {
}
class SQLiteTimestampBuilder extends SQLiteBaseIntegerBuilder {
    constructor(name, mode) {
        super(name);
        this.config.mode = mode;
    }
    /**
     * @deprecated Use `default()` with your own expression instead.
     *
     * Adds `DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))` to the column, which is the current epoch timestamp in milliseconds.
     */
    defaultNow() {
        return this.default(relations.sql `(cast((julianday('now') - 2440587.5)*86400000 as integer))`);
    }
    build(table) {
        return new SQLiteTimestamp(table, this.config);
    }
}
class SQLiteTimestamp extends SQLiteBaseInteger {
    mode = this.config.mode;
    mapFromDriverValue(value) {
        if (this.config.mode === 'timestamp') {
            return new Date(value * 1000);
        }
        return new Date(value);
    }
    mapToDriverValue(value) {
        const unix = value.getTime();
        if (this.config.mode === 'timestamp') {
            return Math.floor(unix / 1000);
        }
        return unix;
    }
}
function integer(name, config) {
    if (config?.mode === 'timestamp' || config?.mode === 'timestamp_ms') {
        return new SQLiteTimestampBuilder(name, config.mode);
    }
    return new SQLiteIntegerBuilder(name);
}
const int = integer;

class SQLiteNumericBuilder extends SQLiteColumnBuilder {
    /** @internal */
    build(table) {
        return new SQLiteNumeric(table, this.config);
    }
}
class SQLiteNumeric extends SQLiteColumn {
    getSQLType() {
        return 'numeric';
    }
}
function numeric(name) {
    return new SQLiteNumericBuilder(name);
}

class SQLiteRealBuilder extends SQLiteColumnBuilder {
    /** @internal */
    build(table) {
        return new SQLiteReal(table, this.config);
    }
}
class SQLiteReal extends SQLiteColumn {
    getSQLType() {
        return 'real';
    }
}
function real(name) {
    return new SQLiteRealBuilder(name);
}

class SQLiteTextBuilder extends SQLiteColumnBuilder {
    constructor(name, config) {
        super(name);
        this.config.enumValues = (config.enum ?? []);
        this.config.length = config.length;
    }
    /** @internal */
    build(table) {
        return new SQLiteText(table, this.config);
    }
}
class SQLiteText extends SQLiteColumn {
    enumValues = this.config.enumValues;
    length = this.config.length;
    constructor(table, config) {
        super(table, config);
    }
    getSQLType() {
        return `text${this.config.length ? `(${this.config.length})` : ''}`;
    }
}
function text(name, config = {}) {
    return new SQLiteTextBuilder(name, config);
}

class IndexBuilderOn {
    name;
    unique;
    constructor(name, unique) {
        this.name = name;
        this.unique = unique;
    }
    on(...columns) {
        return new IndexBuilder(this.name, columns, this.unique);
    }
}
class IndexBuilder {
    /** @internal */
    config;
    constructor(name, columns, unique) {
        this.config = {
            name,
            columns,
            unique,
            where: undefined,
        };
    }
    /**
     * Condition for partial index.
     */
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
    return new IndexBuilderOn(name, false);
}
function uniqueIndex(name) {
    return new IndexBuilderOn(name, true);
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
        return `${this.table[session.SQLiteTable.Symbol.Name]}_${this.columns.map((column) => column.name).join('_')}_pk`;
    }
}

class UniqueBuilder {
    name;
    column;
    constructor(name, column) {
        this.name = name;
        this.column = column;
    }
    /** @internal */
    build(table) {
        return new Unique(table, this);
    }
}
class Unique {
    table;
    name;
    column;
    constructor(table, builder) {
        this.table = table;
        this.name = builder.name;
        this.column = builder.column;
    }
}
function unique(name, column) {
    return new UniqueBuilder(name, column);
}

function getTableConfig(table) {
    const columns = Object.values(table[session.SQLiteTable.Symbol.Columns]);
    const indexes = [];
    const checks = [];
    const primaryKeys = [];
    const foreignKeys = Object.values(table[session.SQLiteTable.Symbol.InlineForeignKeys]);
    const name = table[relations.Table.Symbol.Name];
    const extraConfigBuilder = table[session.SQLiteTable.Symbol.ExtraConfigBuilder];
    if (extraConfigBuilder !== undefined) {
        const extraConfig = extraConfigBuilder(table[session.SQLiteTable.Symbol.Columns]);
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
    };
}
function getViewConfig(view) {
    return {
        ...view[relations.ViewBaseConfig],
        ...view[session.SQLiteViewConfig],
    };
}

exports.BaseSQLiteDatabase = session.BaseSQLiteDatabase;
exports.Batch = session.Batch;
exports.InlineForeignKeys = session.InlineForeignKeys;
exports.ManualViewBuilder = session.ManualViewBuilder;
exports.PreparedQuery = session.PreparedQuery;
exports.QueryBuilder = session.QueryBuilder;
exports.SQLiteAsyncDialect = session.SQLiteAsyncDialect;
exports.SQLiteDelete = session.SQLiteDelete;
exports.SQLiteDialect = session.SQLiteDialect;
exports.SQLiteInsert = session.SQLiteInsert;
exports.SQLiteInsertBuilder = session.SQLiteInsertBuilder;
exports.SQLiteSelect = session.SQLiteSelect;
exports.SQLiteSelectBuilder = session.SQLiteSelectBuilder;
exports.SQLiteSelectQueryBuilder = session.SQLiteSelectQueryBuilder;
exports.SQLiteSession = session.SQLiteSession;
exports.SQLiteSyncDialect = session.SQLiteSyncDialect;
exports.SQLiteTable = session.SQLiteTable;
exports.SQLiteTransaction = session.SQLiteTransaction;
exports.SQLiteUpdate = session.SQLiteUpdate;
exports.SQLiteUpdateBuilder = session.SQLiteUpdateBuilder;
exports.SQLiteView = session.SQLiteView;
exports.SQLiteViewBase = session.SQLiteViewBase;
exports.SQLiteViewConfig = session.SQLiteViewConfig;
exports.ViewBuilder = session.ViewBuilder;
exports.ViewBuilderCore = session.ViewBuilderCore;
exports.sqliteTable = session.sqliteTable;
exports.sqliteTableCreator = session.sqliteTableCreator;
exports.sqliteView = session.sqliteView;
exports.view = session.view;
exports.Check = Check;
exports.CheckBuilder = CheckBuilder;
exports.ForeignKey = ForeignKey;
exports.ForeignKeyBuilder = ForeignKeyBuilder;
exports.Index = Index;
exports.IndexBuilder = IndexBuilder;
exports.IndexBuilderOn = IndexBuilderOn;
exports.PrimaryKey = PrimaryKey;
exports.PrimaryKeyBuilder = PrimaryKeyBuilder;
exports.SQLiteBaseInteger = SQLiteBaseInteger;
exports.SQLiteBaseIntegerBuilder = SQLiteBaseIntegerBuilder;
exports.SQLiteBigInt = SQLiteBigInt;
exports.SQLiteBigIntBuilder = SQLiteBigIntBuilder;
exports.SQLiteBlobBuffer = SQLiteBlobBuffer;
exports.SQLiteBlobBufferBuilder = SQLiteBlobBufferBuilder;
exports.SQLiteBlobJson = SQLiteBlobJson;
exports.SQLiteBlobJsonBuilder = SQLiteBlobJsonBuilder;
exports.SQLiteColumn = SQLiteColumn;
exports.SQLiteColumnBuilder = SQLiteColumnBuilder;
exports.SQLiteCustomColumn = SQLiteCustomColumn;
exports.SQLiteCustomColumnBuilder = SQLiteCustomColumnBuilder;
exports.SQLiteInteger = SQLiteInteger;
exports.SQLiteIntegerBuilder = SQLiteIntegerBuilder;
exports.SQLiteNumeric = SQLiteNumeric;
exports.SQLiteNumericBuilder = SQLiteNumericBuilder;
exports.SQLiteReal = SQLiteReal;
exports.SQLiteRealBuilder = SQLiteRealBuilder;
exports.SQLiteText = SQLiteText;
exports.SQLiteTextBuilder = SQLiteTextBuilder;
exports.SQLiteTimestamp = SQLiteTimestamp;
exports.SQLiteTimestampBuilder = SQLiteTimestampBuilder;
exports.Unique = Unique;
exports.UniqueBuilder = UniqueBuilder;
exports.alias = alias;
exports.blob = blob;
exports.check = check;
exports.customType = customType;
exports.foreignKey = foreignKey;
exports.getTableConfig = getTableConfig;
exports.getViewConfig = getViewConfig;
exports.index = index;
exports.int = int;
exports.integer = integer;
exports.numeric = numeric;
exports.primaryKey = primaryKey;
exports.real = real;
exports.text = text;
exports.unique = unique;
exports.uniqueIndex = uniqueIndex;
//# sourceMappingURL=index.cjs.map
