import { K as TableAliasProxyHandler, s as sql, T as Table, q as ViewBaseConfig } from '../relations-3eb6fe55.mjs';
import { d as MySqlColumnBuilderWithAutoIncrement, e as MySqlColumnWithAutoIncrement, f as MySqlColumnBuilder, g as MySqlColumn, h as MySqlTable, m as mysqlTableWithSchema, i as mysqlViewWithSchema, F as ForeignKeyBuilder, j as MySqlViewConfig } from '../session-2b625be5.mjs';
export { k as ForeignKey, I as InlineForeignKeys, y as ManualViewBuilder, b as MySqlDatabase, n as MySqlDelete, c as MySqlDialect, p as MySqlInsert, o as MySqlInsertBuilder, s as MySqlSelect, q as MySqlSelectBuilder, r as MySqlSelectQueryBuilder, M as MySqlSession, a as MySqlTransaction, u as MySqlUpdate, t as MySqlUpdateBuilder, A as MySqlView, z as MySqlViewBase, P as PreparedQuery, Q as QueryBuilder, x as ViewBuilder, V as ViewBuilderCore, l as foreignKey, v as mysqlTable, w as mysqlTableCreator, B as mysqlView } from '../session-2b625be5.mjs';
import '../errors-bb636d84.mjs';

function alias(table, alias) {
    return new Proxy(table, new TableAliasProxyHandler(alias, false));
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

class MySqlBigInt53Builder extends MySqlColumnBuilderWithAutoIncrement {
    /** @internal */
    build(table) {
        return new MySqlBigInt53(table, this.config);
    }
}
class MySqlBigInt53 extends MySqlColumnWithAutoIncrement {
    getSQLType() {
        return 'bigint';
    }
    mapFromDriverValue(value) {
        if (typeof value === 'number') {
            return value;
        }
        return Number(value);
    }
}
class MySqlBigInt64Builder extends MySqlColumnBuilderWithAutoIncrement {
    /** @internal */
    build(table) {
        return new MySqlBigInt64(table, this.config);
    }
}
class MySqlBigInt64 extends MySqlColumnWithAutoIncrement {
    getSQLType() {
        return 'bigint';
    }
    // eslint-disable-next-line unicorn/prefer-native-coercion-functions
    mapFromDriverValue(value) {
        return BigInt(value);
    }
}
function bigint(name, config) {
    if (config.mode === 'number') {
        return new MySqlBigInt53Builder(name);
    }
    return new MySqlBigInt64Builder(name);
}

class MySqlBinaryBuilder extends MySqlColumnBuilder {
    constructor(name, length) {
        super(name);
        this.config.length = length;
    }
    /** @internal */
    build(table) {
        return new MySqlBinary(table, this.config);
    }
}
class MySqlBinary extends MySqlColumn {
    length = this.config.length;
    getSQLType() {
        return this.length === undefined ? `binary` : `binary(${this.length})`;
    }
}
function binary(name, config = {}) {
    return new MySqlBinaryBuilder(name, config.length);
}

class MySqlBooleanBuilder extends MySqlColumnBuilder {
    /** @internal */
    build(table) {
        return new MySqlBoolean(table, this.config);
    }
}
class MySqlBoolean extends MySqlColumn {
    getSQLType() {
        return 'boolean';
    }
    mapFromDriverValue(value) {
        if (typeof value === 'boolean') {
            return value;
        }
        return value === 1;
    }
}
function boolean(name) {
    return new MySqlBooleanBuilder(name);
}

class MySqlCharBuilder extends MySqlColumnBuilder {
    constructor(name, config) {
        super(name);
        this.config.length = config.length;
        this.config.enum = config.enum;
    }
    /** @internal */
    build(table) {
        return new MySqlChar(table, this.config);
    }
}
class MySqlChar extends MySqlColumn {
    length = this.config.length;
    enumValues = (this.config.enum ?? []);
    getSQLType() {
        return this.length === undefined ? `char` : `char(${this.length})`;
    }
}
function char(name, config = {}) {
    return new MySqlCharBuilder(name, config);
}

class MySqlCustomColumnBuilder extends MySqlColumnBuilder {
    constructor(name, fieldConfig, customTypeParams) {
        super(name);
        this.config.fieldConfig = fieldConfig;
        this.config.customTypeParams = customTypeParams;
    }
    /** @internal */
    build(table) {
        return new MySqlCustomColumn(table, this.config);
    }
}
class MySqlCustomColumn extends MySqlColumn {
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
 * Custom mysql database data type generator
 */
function customType(customTypeParams) {
    return (dbName, fieldConfig) => {
        return new MySqlCustomColumnBuilder(dbName, fieldConfig, customTypeParams);
    };
}

class MySqlDateBuilder extends MySqlColumnBuilder {
    /** @internal */
    build(table) {
        return new MySqlDate(table, this.config);
    }
}
class MySqlDate extends MySqlColumn {
    constructor(table, config) {
        super(table, config);
    }
    getSQLType() {
        return `date`;
    }
    mapFromDriverValue(value) {
        return new Date(value);
    }
}
class MySqlDateStringBuilder extends MySqlColumnBuilder {
    /** @internal */
    build(table) {
        return new MySqlDateString(table, this.config);
    }
}
class MySqlDateString extends MySqlColumn {
    constructor(table, config) {
        super(table, config);
    }
    getSQLType() {
        return `date`;
    }
}
function date(name, config = {}) {
    if (config.mode === 'string') {
        return new MySqlDateStringBuilder(name);
    }
    return new MySqlDateBuilder(name);
}

class MySqlDateTimeBuilder extends MySqlColumnBuilder {
    constructor(name, config) {
        super(name);
        this.config.fsp = config?.fsp;
    }
    /** @internal */
    build(table) {
        return new MySqlDateTime(table, this.config);
    }
}
class MySqlDateTime extends MySqlColumn {
    fsp;
    constructor(table, config) {
        super(table, config);
        this.fsp = config.fsp;
    }
    getSQLType() {
        const precision = this.fsp === undefined ? '' : `(${this.fsp})`;
        return `datetime${precision}`;
    }
    mapFromDriverValue(value) {
        return new Date(value);
    }
}
class MySqlDateTimeStringBuilder extends MySqlColumnBuilder {
    constructor(name, config) {
        super(name);
        this.config.fsp = config?.fsp;
    }
    /** @internal */
    build(table) {
        return new MySqlDateTimeString(table, this.config);
    }
}
class MySqlDateTimeString extends MySqlColumn {
    fsp;
    constructor(table, config) {
        super(table, config);
        this.fsp = config.fsp;
    }
    getSQLType() {
        const precision = this.fsp === undefined ? '' : `(${this.fsp})`;
        return `datetime${precision}`;
    }
}
function datetime(name, config = {}) {
    if (config.mode === 'string') {
        return new MySqlDateTimeStringBuilder(name, config);
    }
    return new MySqlDateTimeBuilder(name, config);
}

class MySqlDecimalBuilder extends MySqlColumnBuilderWithAutoIncrement {
    constructor(name, precision, scale) {
        super(name);
        this.config.precision = precision;
        this.config.scale = scale;
    }
    /** @internal */
    build(table) {
        return new MySqlDecimal(table, this.config);
    }
}
class MySqlDecimal extends MySqlColumnWithAutoIncrement {
    precision = this.config.precision;
    scale = this.config.scale;
    getSQLType() {
        if (this.precision !== undefined && this.scale !== undefined) {
            return `decimal(${this.precision},${this.scale})`;
        }
        else if (this.precision === undefined) {
            return 'decimal';
        }
        else {
            return `decimal(${this.precision})`;
        }
    }
}
function decimal(name, config = {}) {
    return new MySqlDecimalBuilder(name, config.precision, config.scale);
}

class MySqlDoubleBuilder extends MySqlColumnBuilderWithAutoIncrement {
    constructor(name, config) {
        super(name);
        this.config.precision = config?.precision;
        this.config.scale = config?.scale;
    }
    /** @internal */
    build(table) {
        return new MySqlDouble(table, this.config);
    }
}
class MySqlDouble extends MySqlColumnWithAutoIncrement {
    precision = this.config.precision;
    scale = this.config.scale;
    getSQLType() {
        if (this.precision !== undefined && this.scale !== undefined) {
            return `double(${this.precision},${this.scale})`;
        }
        else if (this.precision === undefined) {
            return 'double';
        }
        else {
            return `double(${this.precision})`;
        }
    }
}
function double(name, config) {
    return new MySqlDoubleBuilder(name, config);
}

class MySqlEnumColumnBuilder extends MySqlColumnBuilder {
    constructor(name, values) {
        super(name);
        this.config.enumValues = values;
    }
    /** @internal */
    build(table) {
        return new MySqlEnumColumn(table, this.config);
    }
}
class MySqlEnumColumn extends MySqlColumn {
    enumValues = this.config.enumValues;
    getSQLType() {
        return `enum(${this.enumValues.map((value) => `'${value}'`).join(',')})`;
    }
}
function mysqlEnum(name, values) {
    if (values.length === 0) {
        throw new Error(`You have an empty array for "${name}" enum values`);
    }
    return new MySqlEnumColumnBuilder(name, values);
}

class MySqlFloatBuilder extends MySqlColumnBuilderWithAutoIncrement {
    /** @internal */
    build(table) {
        return new MySqlFloat(table, this.config);
    }
}
class MySqlFloat extends MySqlColumnWithAutoIncrement {
    getSQLType() {
        return 'float';
    }
}
function float(name) {
    return new MySqlFloatBuilder(name);
}

class MySqlIntBuilder extends MySqlColumnBuilderWithAutoIncrement {
    /** @internal */
    build(table) {
        return new MySqlInt(table, this.config);
    }
}
class MySqlInt extends MySqlColumnWithAutoIncrement {
    getSQLType() {
        return 'int';
    }
    mapFromDriverValue(value) {
        if (typeof value === 'string') {
            return Number(value);
        }
        return value;
    }
}
function int(name) {
    return new MySqlIntBuilder(name);
}

class MySqlJsonBuilder extends MySqlColumnBuilder {
    /** @internal */
    build(table) {
        return new MySqlJson(table, this.config);
    }
}
class MySqlJson extends MySqlColumn {
    getSQLType() {
        return 'json';
    }
    mapToDriverValue(value) {
        return JSON.stringify(value);
    }
}
function json(name) {
    return new MySqlJsonBuilder(name);
}

class MySqlMediumIntBuilder extends MySqlColumnBuilderWithAutoIncrement {
    /** @internal */
    build(table) {
        return new MySqlMediumInt(table, this.config);
    }
}
class MySqlMediumInt extends MySqlColumnWithAutoIncrement {
    getSQLType() {
        return 'mediumint';
    }
    mapFromDriverValue(value) {
        if (typeof value === 'string') {
            return Number(value);
        }
        return value;
    }
}
function mediumint(name) {
    return new MySqlMediumIntBuilder(name);
}

class MySqlRealBuilder extends MySqlColumnBuilderWithAutoIncrement {
    constructor(name, config) {
        super(name);
        this.config.precision = config?.precision;
        this.config.scale = config?.scale;
    }
    /** @internal */
    build(table) {
        return new MySqlReal(table, this.config);
    }
}
class MySqlReal extends MySqlColumnWithAutoIncrement {
    precision = this.config.precision;
    scale = this.config.scale;
    getSQLType() {
        if (this.precision !== undefined && this.scale !== undefined) {
            return `real(${this.precision}, ${this.scale})`;
        }
        else if (this.precision === undefined) {
            return 'real';
        }
        else {
            return `real(${this.precision})`;
        }
    }
}
function real(name, config = {}) {
    return new MySqlRealBuilder(name, config);
}

class MySqlSerialBuilder extends MySqlColumnBuilderWithAutoIncrement {
    constructor(name) {
        super(name);
        this.config.hasDefault = true;
        this.config.autoIncrement = true;
    }
    /** @internal */
    build(table) {
        return new MySqlSerial(table, this.config);
    }
}
class MySqlSerial extends MySqlColumnWithAutoIncrement {
    getSQLType() {
        return 'serial';
    }
    mapFromDriverValue(value) {
        if (typeof value === 'string') {
            return Number(value);
        }
        return value;
    }
}
function serial(name) {
    return new MySqlSerialBuilder(name);
}

class MySqlSmallIntBuilder extends MySqlColumnBuilderWithAutoIncrement {
    /** @internal */
    build(table) {
        return new MySqlSmallInt(table, this.config);
    }
}
class MySqlSmallInt extends MySqlColumnWithAutoIncrement {
    getSQLType() {
        return 'smallint';
    }
    mapFromDriverValue(value) {
        if (typeof value === 'string') {
            return Number(value);
        }
        return value;
    }
}
function smallint(name) {
    return new MySqlSmallIntBuilder(name);
}

class MySqlTextBuilder extends MySqlColumnBuilder {
    constructor(name, textType, config) {
        super(name);
        this.config.textType = textType;
        this.config.enumValues = config.enum;
    }
    /** @internal */
    build(table) {
        return new MySqlText(table, this.config);
    }
}
class MySqlText extends MySqlColumn {
    textType = this.config.textType;
    enumValues = (this.config.enumValues ?? []);
    getSQLType() {
        return this.textType;
    }
}
function text(name, config = {}) {
    return new MySqlTextBuilder(name, 'text', config);
}
function tinytext(name, config = {}) {
    return new MySqlTextBuilder(name, 'tinytext', config);
}
function mediumtext(name, config = {}) {
    return new MySqlTextBuilder(name, 'mediumtext', config);
}
function longtext(name, config = {}) {
    return new MySqlTextBuilder(name, 'longtext', config);
}

class MySqlTimeBuilder extends MySqlColumnBuilder {
    constructor(name, config) {
        super(name);
        this.config.fsp = config?.fsp;
    }
    /** @internal */
    build(table) {
        return new MySqlTime(table, this.config);
    }
}
class MySqlTime extends MySqlColumn {
    fsp = this.config.fsp;
    getSQLType() {
        const precision = this.fsp === undefined ? '' : `(${this.fsp})`;
        return `time${precision}`;
    }
}
function time(name, config) {
    return new MySqlTimeBuilder(name, config);
}

class MySqlDateColumnBaseBuilder extends MySqlColumnBuilder {
    defaultNow() {
        return this.default(sql `(now())`);
    }
    // "on update now" also adds an implicit default value to the column - https://dev.mysql.com/doc/refman/8.0/en/timestamp-initialization.html
    onUpdateNow() {
        this.config.hasOnUpdateNow = true;
        this.config.hasDefault = true;
        return this;
    }
}
class MySqlDateBaseColumn extends MySqlColumn {
    hasOnUpdateNow = this.config.hasOnUpdateNow;
}

class MySqlTimestampBuilder extends MySqlDateColumnBaseBuilder {
    constructor(name, config) {
        super(name);
        this.config.fsp = config?.fsp;
    }
    /** @internal */
    build(table) {
        return new MySqlTimestamp(table, this.config);
    }
}
class MySqlTimestamp extends MySqlDateBaseColumn {
    fsp = this.config.fsp;
    getSQLType() {
        const precision = this.fsp === undefined ? '' : `(${this.fsp})`;
        return `timestamp${precision}`;
    }
    mapFromDriverValue(value) {
        return new Date(value + '+0000');
    }
    mapToDriverValue(value) {
        return value.toISOString().slice(0, 19).replace('T', ' ');
    }
}
class MySqlTimestampStringBuilder extends MySqlDateColumnBaseBuilder {
    constructor(name, config) {
        super(name);
        this.config.fsp = config?.fsp;
    }
    /** @internal */
    build(table) {
        return new MySqlTimestampString(table, this.config);
    }
}
class MySqlTimestampString extends MySqlDateBaseColumn {
    fsp = this.config.fsp;
    getSQLType() {
        const precision = this.fsp === undefined ? '' : `(${this.fsp})`;
        return `timestamp${precision}`;
    }
}
function timestamp(name, config = {}) {
    if (config.mode === 'string') {
        return new MySqlTimestampStringBuilder(name, config);
    }
    return new MySqlTimestampBuilder(name, config);
}

class MySqlTinyIntBuilder extends MySqlColumnBuilderWithAutoIncrement {
    /** @internal */
    build(table) {
        return new MySqlTinyInt(table, this.config);
    }
}
class MySqlTinyInt extends MySqlColumnWithAutoIncrement {
    getSQLType() {
        return 'tinyint';
    }
    mapFromDriverValue(value) {
        if (typeof value === 'string') {
            return Number(value);
        }
        return value;
    }
}
function tinyint(name) {
    return new MySqlTinyIntBuilder(name);
}

class MySqlVarBinaryBuilder extends MySqlColumnBuilder {
    /** @internal */
    constructor(name, config) {
        super(name);
        this.config.length = config?.length;
    }
    /** @internal */
    build(table) {
        return new MySqlVarBinary(table, this.config);
    }
}
class MySqlVarBinary extends MySqlColumn {
    length = this.config.length;
    getSQLType() {
        return this.length === undefined ? `varbinary` : `varbinary(${this.length})`;
    }
}
function varbinary(name, options) {
    return new MySqlVarBinaryBuilder(name, options);
}

class MySqlVarCharBuilder extends MySqlColumnBuilder {
    /** @internal */
    constructor(name, config) {
        super(name);
        this.config.length = config.length;
        this.config.enum = config.enum;
    }
    /** @internal */
    build(table) {
        return new MySqlVarChar(table, this.config);
    }
}
class MySqlVarChar extends MySqlColumn {
    length = this.config.length;
    enumValues = (this.config.enum ?? []);
    getSQLType() {
        return this.length === undefined ? `varchar` : `varchar(${this.length})`;
    }
}
function varchar(name, config) {
    return new MySqlVarCharBuilder(name, config);
}

class MySqlYearBuilder extends MySqlColumnBuilder {
    /** @internal */
    build(table) {
        return new MySqlYear(table, this.config);
    }
}
class MySqlYear extends MySqlColumn {
    getSQLType() {
        return `year`;
    }
}
function year(name) {
    return new MySqlYearBuilder(name);
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
        };
    }
    using(using) {
        this.config.using = using;
        return this;
    }
    algorythm(algorythm) {
        this.config.algorythm = algorythm;
        return this;
    }
    lock(lock) {
        this.config.lock = lock;
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
        return `${this.table[MySqlTable.Symbol.Name]}_${this.columns.map((column) => column.name).join('_')}_pk`;
    }
}

class MySqlSchema {
    schemaName;
    constructor(schemaName) {
        this.schemaName = schemaName;
    }
    table = (name, columns, extraConfig) => {
        return mysqlTableWithSchema(name, columns, extraConfig, this.schemaName);
    };
    view = ((name, columns) => {
        return mysqlViewWithSchema(name, columns, this.schemaName);
    });
}
/** @deprecated - use `instanceof MySqlSchema` */
function isMySqlSchema(obj) {
    return obj instanceof MySqlSchema;
}
/**
 * Create a MySQL schema.
 * https://dev.mysql.com/doc/refman/8.0/en/create-database.html
 *
 * @param name mysql use schema name
 * @returns MySQL schema
 */
function mysqlDatabase(name) {
    return new MySqlSchema(name);
}
/**
 * @see mysqlDatabase
 */
const mysqlSchema = mysqlDatabase;

function getTableConfig(table) {
    const columns = Object.values(table[MySqlTable.Symbol.Columns]);
    const indexes = [];
    const checks = [];
    const primaryKeys = [];
    const foreignKeys = Object.values(table[MySqlTable.Symbol.InlineForeignKeys]);
    const name = table[Table.Symbol.Name];
    const schema = table[Table.Symbol.Schema];
    const baseName = table[Table.Symbol.BaseName];
    const extraConfigBuilder = table[MySqlTable.Symbol.ExtraConfigBuilder];
    if (extraConfigBuilder !== undefined) {
        const extraConfig = extraConfigBuilder(table[MySqlTable.Symbol.Columns]);
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
        baseName,
    };
}
function getViewConfig(view) {
    return {
        ...view[ViewBaseConfig],
        ...view[MySqlViewConfig],
    };
}

export { Check, CheckBuilder, ForeignKeyBuilder, Index, IndexBuilder, IndexBuilderOn, MySqlBigInt53, MySqlBigInt53Builder, MySqlBigInt64, MySqlBigInt64Builder, MySqlBinary, MySqlBinaryBuilder, MySqlBoolean, MySqlBooleanBuilder, MySqlChar, MySqlCharBuilder, MySqlColumn, MySqlColumnBuilder, MySqlColumnBuilderWithAutoIncrement, MySqlColumnWithAutoIncrement, MySqlCustomColumn, MySqlCustomColumnBuilder, MySqlDate, MySqlDateBuilder, MySqlDateString, MySqlDateStringBuilder, MySqlDateTime, MySqlDateTimeBuilder, MySqlDateTimeString, MySqlDateTimeStringBuilder, MySqlDecimal, MySqlDecimalBuilder, MySqlDouble, MySqlDoubleBuilder, MySqlEnumColumn, MySqlEnumColumnBuilder, MySqlFloat, MySqlFloatBuilder, MySqlInt, MySqlIntBuilder, MySqlJson, MySqlJsonBuilder, MySqlMediumInt, MySqlMediumIntBuilder, MySqlReal, MySqlRealBuilder, MySqlSchema, MySqlSerial, MySqlSerialBuilder, MySqlSmallInt, MySqlSmallIntBuilder, MySqlTable, MySqlText, MySqlTextBuilder, MySqlTime, MySqlTimeBuilder, MySqlTimestamp, MySqlTimestampBuilder, MySqlTimestampString, MySqlTimestampStringBuilder, MySqlTinyInt, MySqlTinyIntBuilder, MySqlVarBinary, MySqlVarBinaryBuilder, MySqlVarChar, MySqlVarCharBuilder, MySqlViewConfig, MySqlYear, MySqlYearBuilder, PrimaryKey, PrimaryKeyBuilder, alias, bigint, binary, boolean, char, check, customType, date, datetime, decimal, double, float, getTableConfig, getViewConfig, index, int, isMySqlSchema, json, longtext, mediumint, mediumtext, mysqlDatabase, mysqlEnum, mysqlSchema, mysqlTableWithSchema, mysqlViewWithSchema, primaryKey, real, serial, smallint, text, time, timestamp, tinyint, tinytext, uniqueIndex, varbinary, varchar, year };
//# sourceMappingURL=index.mjs.map
