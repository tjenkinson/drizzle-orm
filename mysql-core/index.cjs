'use strict';

var relations = require('../relations-9f413b53.cjs');
var session = require('../session-ff20ca01.cjs');
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

class MySqlBigInt53Builder extends session.MySqlColumnBuilderWithAutoIncrement {
    /** @internal */
    build(table) {
        return new MySqlBigInt53(table, this.config);
    }
}
class MySqlBigInt53 extends session.MySqlColumnWithAutoIncrement {
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
class MySqlBigInt64Builder extends session.MySqlColumnBuilderWithAutoIncrement {
    /** @internal */
    build(table) {
        return new MySqlBigInt64(table, this.config);
    }
}
class MySqlBigInt64 extends session.MySqlColumnWithAutoIncrement {
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

class MySqlBinaryBuilder extends session.MySqlColumnBuilder {
    constructor(name, length) {
        super(name);
        this.config.length = length;
    }
    /** @internal */
    build(table) {
        return new MySqlBinary(table, this.config);
    }
}
class MySqlBinary extends session.MySqlColumn {
    length = this.config.length;
    getSQLType() {
        return this.length === undefined ? `binary` : `binary(${this.length})`;
    }
}
function binary(name, config = {}) {
    return new MySqlBinaryBuilder(name, config.length);
}

class MySqlBooleanBuilder extends session.MySqlColumnBuilder {
    /** @internal */
    build(table) {
        return new MySqlBoolean(table, this.config);
    }
}
class MySqlBoolean extends session.MySqlColumn {
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

class MySqlCharBuilder extends session.MySqlColumnBuilder {
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
class MySqlChar extends session.MySqlColumn {
    length = this.config.length;
    enumValues = (this.config.enum ?? []);
    getSQLType() {
        return this.length === undefined ? `char` : `char(${this.length})`;
    }
}
function char(name, config = {}) {
    return new MySqlCharBuilder(name, config);
}

class MySqlCustomColumnBuilder extends session.MySqlColumnBuilder {
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
class MySqlCustomColumn extends session.MySqlColumn {
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

class MySqlDateBuilder extends session.MySqlColumnBuilder {
    /** @internal */
    build(table) {
        return new MySqlDate(table, this.config);
    }
}
class MySqlDate extends session.MySqlColumn {
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
class MySqlDateStringBuilder extends session.MySqlColumnBuilder {
    /** @internal */
    build(table) {
        return new MySqlDateString(table, this.config);
    }
}
class MySqlDateString extends session.MySqlColumn {
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

class MySqlDateTimeBuilder extends session.MySqlColumnBuilder {
    constructor(name, config) {
        super(name);
        this.config.fsp = config?.fsp;
    }
    /** @internal */
    build(table) {
        return new MySqlDateTime(table, this.config);
    }
}
class MySqlDateTime extends session.MySqlColumn {
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
class MySqlDateTimeStringBuilder extends session.MySqlColumnBuilder {
    constructor(name, config) {
        super(name);
        this.config.fsp = config?.fsp;
    }
    /** @internal */
    build(table) {
        return new MySqlDateTimeString(table, this.config);
    }
}
class MySqlDateTimeString extends session.MySqlColumn {
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

class MySqlDecimalBuilder extends session.MySqlColumnBuilderWithAutoIncrement {
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
class MySqlDecimal extends session.MySqlColumnWithAutoIncrement {
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

class MySqlDoubleBuilder extends session.MySqlColumnBuilderWithAutoIncrement {
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
class MySqlDouble extends session.MySqlColumnWithAutoIncrement {
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

class MySqlEnumColumnBuilder extends session.MySqlColumnBuilder {
    constructor(name, values) {
        super(name);
        this.config.enumValues = values;
    }
    /** @internal */
    build(table) {
        return new MySqlEnumColumn(table, this.config);
    }
}
class MySqlEnumColumn extends session.MySqlColumn {
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

class MySqlFloatBuilder extends session.MySqlColumnBuilderWithAutoIncrement {
    /** @internal */
    build(table) {
        return new MySqlFloat(table, this.config);
    }
}
class MySqlFloat extends session.MySqlColumnWithAutoIncrement {
    getSQLType() {
        return 'float';
    }
}
function float(name) {
    return new MySqlFloatBuilder(name);
}

class MySqlIntBuilder extends session.MySqlColumnBuilderWithAutoIncrement {
    /** @internal */
    build(table) {
        return new MySqlInt(table, this.config);
    }
}
class MySqlInt extends session.MySqlColumnWithAutoIncrement {
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

class MySqlJsonBuilder extends session.MySqlColumnBuilder {
    /** @internal */
    build(table) {
        return new MySqlJson(table, this.config);
    }
}
class MySqlJson extends session.MySqlColumn {
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

class MySqlMediumIntBuilder extends session.MySqlColumnBuilderWithAutoIncrement {
    /** @internal */
    build(table) {
        return new MySqlMediumInt(table, this.config);
    }
}
class MySqlMediumInt extends session.MySqlColumnWithAutoIncrement {
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

class MySqlRealBuilder extends session.MySqlColumnBuilderWithAutoIncrement {
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
class MySqlReal extends session.MySqlColumnWithAutoIncrement {
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

class MySqlSerialBuilder extends session.MySqlColumnBuilderWithAutoIncrement {
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
class MySqlSerial extends session.MySqlColumnWithAutoIncrement {
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

class MySqlSmallIntBuilder extends session.MySqlColumnBuilderWithAutoIncrement {
    /** @internal */
    build(table) {
        return new MySqlSmallInt(table, this.config);
    }
}
class MySqlSmallInt extends session.MySqlColumnWithAutoIncrement {
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

class MySqlTextBuilder extends session.MySqlColumnBuilder {
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
class MySqlText extends session.MySqlColumn {
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

class MySqlTimeBuilder extends session.MySqlColumnBuilder {
    constructor(name, config) {
        super(name);
        this.config.fsp = config?.fsp;
    }
    /** @internal */
    build(table) {
        return new MySqlTime(table, this.config);
    }
}
class MySqlTime extends session.MySqlColumn {
    fsp = this.config.fsp;
    getSQLType() {
        const precision = this.fsp === undefined ? '' : `(${this.fsp})`;
        return `time${precision}`;
    }
}
function time(name, config) {
    return new MySqlTimeBuilder(name, config);
}

class MySqlDateColumnBaseBuilder extends session.MySqlColumnBuilder {
    defaultNow() {
        return this.default(relations.sql `(now())`);
    }
    // "on update now" also adds an implicit default value to the column - https://dev.mysql.com/doc/refman/8.0/en/timestamp-initialization.html
    onUpdateNow() {
        this.config.hasOnUpdateNow = true;
        this.config.hasDefault = true;
        return this;
    }
}
class MySqlDateBaseColumn extends session.MySqlColumn {
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

class MySqlTinyIntBuilder extends session.MySqlColumnBuilderWithAutoIncrement {
    /** @internal */
    build(table) {
        return new MySqlTinyInt(table, this.config);
    }
}
class MySqlTinyInt extends session.MySqlColumnWithAutoIncrement {
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

class MySqlVarBinaryBuilder extends session.MySqlColumnBuilder {
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
class MySqlVarBinary extends session.MySqlColumn {
    length = this.config.length;
    getSQLType() {
        return this.length === undefined ? `varbinary` : `varbinary(${this.length})`;
    }
}
function varbinary(name, options) {
    return new MySqlVarBinaryBuilder(name, options);
}

class MySqlVarCharBuilder extends session.MySqlColumnBuilder {
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
class MySqlVarChar extends session.MySqlColumn {
    length = this.config.length;
    enumValues = (this.config.enum ?? []);
    getSQLType() {
        return this.length === undefined ? `varchar` : `varchar(${this.length})`;
    }
}
function varchar(name, config) {
    return new MySqlVarCharBuilder(name, config);
}

class MySqlYearBuilder extends session.MySqlColumnBuilder {
    /** @internal */
    build(table) {
        return new MySqlYear(table, this.config);
    }
}
class MySqlYear extends session.MySqlColumn {
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
        return `${this.table[session.MySqlTable.Symbol.Name]}_${this.columns.map((column) => column.name).join('_')}_pk`;
    }
}

class MySqlSchema {
    schemaName;
    constructor(schemaName) {
        this.schemaName = schemaName;
    }
    table = (name, columns, extraConfig) => {
        return session.mysqlTableWithSchema(name, columns, extraConfig, this.schemaName);
    };
    view = ((name, columns) => {
        return session.mysqlViewWithSchema(name, columns, this.schemaName);
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
    const columns = Object.values(table[session.MySqlTable.Symbol.Columns]);
    const indexes = [];
    const checks = [];
    const primaryKeys = [];
    const foreignKeys = Object.values(table[session.MySqlTable.Symbol.InlineForeignKeys]);
    const name = table[relations.Table.Symbol.Name];
    const schema = table[relations.Table.Symbol.Schema];
    const baseName = table[relations.Table.Symbol.BaseName];
    const extraConfigBuilder = table[session.MySqlTable.Symbol.ExtraConfigBuilder];
    if (extraConfigBuilder !== undefined) {
        const extraConfig = extraConfigBuilder(table[session.MySqlTable.Symbol.Columns]);
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
            else if (builder instanceof session.ForeignKeyBuilder) {
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
        ...view[relations.ViewBaseConfig],
        ...view[session.MySqlViewConfig],
    };
}

exports.ForeignKey = session.ForeignKey;
exports.ForeignKeyBuilder = session.ForeignKeyBuilder;
exports.InlineForeignKeys = session.InlineForeignKeys;
exports.ManualViewBuilder = session.ManualViewBuilder;
exports.MySqlColumn = session.MySqlColumn;
exports.MySqlColumnBuilder = session.MySqlColumnBuilder;
exports.MySqlColumnBuilderWithAutoIncrement = session.MySqlColumnBuilderWithAutoIncrement;
exports.MySqlColumnWithAutoIncrement = session.MySqlColumnWithAutoIncrement;
exports.MySqlDatabase = session.MySqlDatabase;
exports.MySqlDelete = session.MySqlDelete;
exports.MySqlDialect = session.MySqlDialect;
exports.MySqlInsert = session.MySqlInsert;
exports.MySqlInsertBuilder = session.MySqlInsertBuilder;
exports.MySqlSelect = session.MySqlSelect;
exports.MySqlSelectBuilder = session.MySqlSelectBuilder;
exports.MySqlSelectQueryBuilder = session.MySqlSelectQueryBuilder;
exports.MySqlSession = session.MySqlSession;
exports.MySqlTable = session.MySqlTable;
exports.MySqlTransaction = session.MySqlTransaction;
exports.MySqlUpdate = session.MySqlUpdate;
exports.MySqlUpdateBuilder = session.MySqlUpdateBuilder;
exports.MySqlView = session.MySqlView;
exports.MySqlViewBase = session.MySqlViewBase;
exports.MySqlViewConfig = session.MySqlViewConfig;
exports.PreparedQuery = session.PreparedQuery;
exports.QueryBuilder = session.QueryBuilder;
exports.ViewBuilder = session.ViewBuilder;
exports.ViewBuilderCore = session.ViewBuilderCore;
exports.foreignKey = session.foreignKey;
exports.mysqlTable = session.mysqlTable;
exports.mysqlTableCreator = session.mysqlTableCreator;
exports.mysqlTableWithSchema = session.mysqlTableWithSchema;
exports.mysqlView = session.mysqlView;
exports.mysqlViewWithSchema = session.mysqlViewWithSchema;
exports.Check = Check;
exports.CheckBuilder = CheckBuilder;
exports.Index = Index;
exports.IndexBuilder = IndexBuilder;
exports.IndexBuilderOn = IndexBuilderOn;
exports.MySqlBigInt53 = MySqlBigInt53;
exports.MySqlBigInt53Builder = MySqlBigInt53Builder;
exports.MySqlBigInt64 = MySqlBigInt64;
exports.MySqlBigInt64Builder = MySqlBigInt64Builder;
exports.MySqlBinary = MySqlBinary;
exports.MySqlBinaryBuilder = MySqlBinaryBuilder;
exports.MySqlBoolean = MySqlBoolean;
exports.MySqlBooleanBuilder = MySqlBooleanBuilder;
exports.MySqlChar = MySqlChar;
exports.MySqlCharBuilder = MySqlCharBuilder;
exports.MySqlCustomColumn = MySqlCustomColumn;
exports.MySqlCustomColumnBuilder = MySqlCustomColumnBuilder;
exports.MySqlDate = MySqlDate;
exports.MySqlDateBuilder = MySqlDateBuilder;
exports.MySqlDateString = MySqlDateString;
exports.MySqlDateStringBuilder = MySqlDateStringBuilder;
exports.MySqlDateTime = MySqlDateTime;
exports.MySqlDateTimeBuilder = MySqlDateTimeBuilder;
exports.MySqlDateTimeString = MySqlDateTimeString;
exports.MySqlDateTimeStringBuilder = MySqlDateTimeStringBuilder;
exports.MySqlDecimal = MySqlDecimal;
exports.MySqlDecimalBuilder = MySqlDecimalBuilder;
exports.MySqlDouble = MySqlDouble;
exports.MySqlDoubleBuilder = MySqlDoubleBuilder;
exports.MySqlEnumColumn = MySqlEnumColumn;
exports.MySqlEnumColumnBuilder = MySqlEnumColumnBuilder;
exports.MySqlFloat = MySqlFloat;
exports.MySqlFloatBuilder = MySqlFloatBuilder;
exports.MySqlInt = MySqlInt;
exports.MySqlIntBuilder = MySqlIntBuilder;
exports.MySqlJson = MySqlJson;
exports.MySqlJsonBuilder = MySqlJsonBuilder;
exports.MySqlMediumInt = MySqlMediumInt;
exports.MySqlMediumIntBuilder = MySqlMediumIntBuilder;
exports.MySqlReal = MySqlReal;
exports.MySqlRealBuilder = MySqlRealBuilder;
exports.MySqlSchema = MySqlSchema;
exports.MySqlSerial = MySqlSerial;
exports.MySqlSerialBuilder = MySqlSerialBuilder;
exports.MySqlSmallInt = MySqlSmallInt;
exports.MySqlSmallIntBuilder = MySqlSmallIntBuilder;
exports.MySqlText = MySqlText;
exports.MySqlTextBuilder = MySqlTextBuilder;
exports.MySqlTime = MySqlTime;
exports.MySqlTimeBuilder = MySqlTimeBuilder;
exports.MySqlTimestamp = MySqlTimestamp;
exports.MySqlTimestampBuilder = MySqlTimestampBuilder;
exports.MySqlTimestampString = MySqlTimestampString;
exports.MySqlTimestampStringBuilder = MySqlTimestampStringBuilder;
exports.MySqlTinyInt = MySqlTinyInt;
exports.MySqlTinyIntBuilder = MySqlTinyIntBuilder;
exports.MySqlVarBinary = MySqlVarBinary;
exports.MySqlVarBinaryBuilder = MySqlVarBinaryBuilder;
exports.MySqlVarChar = MySqlVarChar;
exports.MySqlVarCharBuilder = MySqlVarCharBuilder;
exports.MySqlYear = MySqlYear;
exports.MySqlYearBuilder = MySqlYearBuilder;
exports.PrimaryKey = PrimaryKey;
exports.PrimaryKeyBuilder = PrimaryKeyBuilder;
exports.alias = alias;
exports.bigint = bigint;
exports.binary = binary;
exports.boolean = boolean;
exports.char = char;
exports.check = check;
exports.customType = customType;
exports.date = date;
exports.datetime = datetime;
exports.decimal = decimal;
exports.double = double;
exports.float = float;
exports.getTableConfig = getTableConfig;
exports.getViewConfig = getViewConfig;
exports.index = index;
exports.int = int;
exports.isMySqlSchema = isMySqlSchema;
exports.json = json;
exports.longtext = longtext;
exports.mediumint = mediumint;
exports.mediumtext = mediumtext;
exports.mysqlDatabase = mysqlDatabase;
exports.mysqlEnum = mysqlEnum;
exports.mysqlSchema = mysqlSchema;
exports.primaryKey = primaryKey;
exports.real = real;
exports.serial = serial;
exports.smallint = smallint;
exports.text = text;
exports.time = time;
exports.timestamp = timestamp;
exports.tinyint = tinyint;
exports.tinytext = tinytext;
exports.uniqueIndex = uniqueIndex;
exports.varbinary = varbinary;
exports.varchar = varchar;
exports.year = year;
//# sourceMappingURL=index.cjs.map
