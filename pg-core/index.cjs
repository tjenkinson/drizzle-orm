'use strict';

var relations = require('../relations-9f413b53.cjs');
var session = require('../session-95978d5c.cjs');
require('../errors-d0192d62.cjs');

function alias(table, alias) {
    return new Proxy(table, new relations.TableAliasProxyHandler(alias, false));
}

class PgBigInt53Builder extends relations.PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgBigInt53(table, this.config);
    }
}
class PgBigInt53 extends relations.PgColumn {
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
class PgBigInt64Builder extends relations.PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgBigInt64(table, this.config);
    }
}
class PgBigInt64 extends relations.PgColumn {
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
        return new PgBigInt53Builder(name);
    }
    return new PgBigInt64Builder(name);
}

class PgBigSerial53Builder extends relations.PgColumnBuilder {
    constructor(name) {
        super(name);
        this.config.hasDefault = true;
        this.config.notNull = true;
    }
    /** @internal */
    build(table) {
        return new PgBigSerial53(table, this.config);
    }
}
class PgBigSerial53 extends relations.PgColumn {
    getSQLType() {
        return 'bigserial';
    }
    mapFromDriverValue(value) {
        if (typeof value === 'number') {
            return value;
        }
        return Number(value);
    }
}
class PgBigSerial64Builder extends relations.PgColumnBuilder {
    constructor(name) {
        super(name);
        this.config.hasDefault = true;
    }
    /** @internal */
    build(table) {
        return new PgBigSerial64(table, this.config);
    }
}
class PgBigSerial64 extends relations.PgColumn {
    getSQLType() {
        return 'bigserial';
    }
    // eslint-disable-next-line unicorn/prefer-native-coercion-functions
    mapFromDriverValue(value) {
        return BigInt(value);
    }
}
function bigserial(name, { mode }) {
    if (mode === 'number') {
        return new PgBigSerial53Builder(name);
    }
    return new PgBigSerial64Builder(name);
}

class PgBooleanBuilder extends relations.PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgBoolean(table, this.config);
    }
}
class PgBoolean extends relations.PgColumn {
    getSQLType() {
        return 'boolean';
    }
}
function boolean(name) {
    return new PgBooleanBuilder(name);
}

class PgCharBuilder extends relations.PgColumnBuilder {
    constructor(name, config) {
        super(name);
        this.config.length = config.length;
        this.config.enumValues = (config.enum ?? []);
    }
    /** @internal */
    build(table) {
        return new PgChar(table, this.config);
    }
}
class PgChar extends relations.PgColumn {
    length = this.config.length;
    enumValues = this.config.enumValues;
    getSQLType() {
        return this.length === undefined ? `char` : `char(${this.length})`;
    }
}
function char(name, config = {}) {
    return new PgCharBuilder(name, config);
}

class PgCidrBuilder extends relations.PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgCidr(table, this.config);
    }
}
class PgCidr extends relations.PgColumn {
    getSQLType() {
        return 'cidr';
    }
}
function cidr(name) {
    return new PgCidrBuilder(name);
}

class PgCustomColumnBuilder extends relations.PgColumnBuilder {
    constructor(name, fieldConfig, customTypeParams) {
        super(name);
        this.config.fieldConfig = fieldConfig;
        this.config.customTypeParams = customTypeParams;
    }
    /** @internal */
    build(table) {
        return new PgCustomColumn(table, this.config);
    }
}
class PgCustomColumn extends relations.PgColumn {
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
 * Custom pg database data type generator
 */
function customType(customTypeParams) {
    return (dbName, fieldConfig) => {
        return new PgCustomColumnBuilder(dbName, fieldConfig, customTypeParams);
    };
}

class PgDoublePrecisionBuilder extends relations.PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgDoublePrecision(table, this.config);
    }
}
class PgDoublePrecision extends relations.PgColumn {
    getSQLType() {
        return 'double precision';
    }
    mapFromDriverValue(value) {
        if (typeof value === 'string') {
            return Number.parseFloat(value);
        }
        return value;
    }
}
function doublePrecision(name) {
    return new PgDoublePrecisionBuilder(name);
}

const isPgEnumSym = Symbol('isPgEnum');
function isPgEnum(obj) {
    return !!obj && typeof obj === 'function' && isPgEnumSym in obj;
}
class PgEnumColumnBuilder extends relations.PgColumnBuilder {
    constructor(name, enumInstance) {
        super(name);
        this.config.enum = enumInstance;
    }
    /** @internal */
    build(table) {
        return new PgEnumColumn(table, this.config);
    }
}
class PgEnumColumn extends relations.PgColumn {
    enum = this.config.enum;
    enumValues = this.config.enum.enumValues;
    constructor(table, config) {
        super(table, config);
        this.enum = config.enum;
    }
    getSQLType() {
        return this.enum.enumName;
    }
}
// Gratitude to zod for the enum function types
function pgEnum(enumName, values) {
    const enumInstance = Object.assign((name) => new PgEnumColumnBuilder(name, enumInstance), {
        enumName,
        enumValues: values,
        [isPgEnumSym]: true,
    });
    return enumInstance;
}

class PgInetBuilder extends relations.PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgInet(table, this.config);
    }
}
class PgInet extends relations.PgColumn {
    getSQLType() {
        return 'inet';
    }
}
function inet(name) {
    return new PgInetBuilder(name);
}

class PgIntegerBuilder extends relations.PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgInteger(table, this.config);
    }
}
class PgInteger extends relations.PgColumn {
    getSQLType() {
        return 'integer';
    }
    mapFromDriverValue(value) {
        if (typeof value === 'string') {
            return Number.parseInt(value);
        }
        return value;
    }
}
function integer(name) {
    return new PgIntegerBuilder(name);
}

class PgIntervalBuilder extends relations.PgColumnBuilder {
    constructor(name, intervalConfig) {
        super(name);
        this.config.intervalConfig = intervalConfig;
    }
    /** @internal */
    build(table) {
        return new PgInterval(table, this.config);
    }
}
class PgInterval extends relations.PgColumn {
    fields = this.config.intervalConfig.fields;
    precision = this.config.intervalConfig.precision;
    getSQLType() {
        const fields = this.fields ? ` ${this.fields}` : '';
        const precision = this.precision ? `(${this.precision})` : '';
        return `interval${fields}${precision}`;
    }
}
function interval(name, config = {}) {
    return new PgIntervalBuilder(name, config);
}

class PgMacaddrBuilder extends relations.PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgMacaddr(table, this.config);
    }
}
class PgMacaddr extends relations.PgColumn {
    getSQLType() {
        return 'macaddr';
    }
}
function macaddr(name) {
    return new PgMacaddrBuilder(name);
}

class PgMacaddr8Builder extends relations.PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgMacaddr8(table, this.config);
    }
}
class PgMacaddr8 extends relations.PgColumn {
    getSQLType() {
        return 'macaddr8';
    }
}
function macaddr8(name) {
    return new PgMacaddr8Builder(name);
}

class PgRealBuilder extends relations.PgColumnBuilder {
    constructor(name, length) {
        super(name);
        this.config.length = length;
    }
    /** @internal */
    build(table) {
        return new PgReal(table, this.config);
    }
}
class PgReal extends relations.PgColumn {
    constructor(table, config) {
        super(table, config);
    }
    getSQLType() {
        return 'real';
    }
    mapFromDriverValue = (value) => {
        if (typeof value === 'string') {
            return Number.parseFloat(value);
        }
        return value;
    };
}
function real(name) {
    return new PgRealBuilder(name);
}

class PgSerialBuilder extends relations.PgColumnBuilder {
    constructor(name) {
        super(name);
        this.config.hasDefault = true;
        this.config.notNull = true;
    }
    /** @internal */
    build(table) {
        return new PgSerial(table, this.config);
    }
}
class PgSerial extends relations.PgColumn {
    getSQLType() {
        return 'serial';
    }
}
function serial(name) {
    return new PgSerialBuilder(name);
}

class PgSmallIntBuilder extends relations.PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgSmallInt(table, this.config);
    }
}
class PgSmallInt extends relations.PgColumn {
    getSQLType() {
        return 'smallint';
    }
    mapFromDriverValue = (value) => {
        if (typeof value === 'string') {
            return Number(value);
        }
        return value;
    };
}
function smallint(name) {
    return new PgSmallIntBuilder(name);
}

class PgSmallSerialBuilder extends relations.PgColumnBuilder {
    constructor(name) {
        super(name);
        this.config.hasDefault = true;
        this.config.notNull = true;
    }
    /** @internal */
    build(table) {
        return new PgSmallSerial(table, this.config);
    }
}
class PgSmallSerial extends relations.PgColumn {
    getSQLType() {
        return 'serial';
    }
}
function smallserial(name) {
    return new PgSmallSerialBuilder(name);
}

class PgTextBuilder extends relations.PgColumnBuilder {
    constructor(name, config) {
        super(name);
        this.config.enumValues = (config.enum ?? []);
    }
    /** @internal */
    build(table) {
        return new PgText(table, this.config);
    }
}
class PgText extends relations.PgColumn {
    enumValues = this.config.enumValues;
    getSQLType() {
        return 'text';
    }
}
function text(name, config = {}) {
    return new PgTextBuilder(name, config);
}

class PgVarcharBuilder extends relations.PgColumnBuilder {
    constructor(name, config) {
        super(name);
        this.config.length = config.length;
        this.config.enumValues = (config.enum ?? []);
    }
    /** @internal */
    build(table) {
        return new PgVarchar(table, this.config);
    }
}
class PgVarchar extends relations.PgColumn {
    length = this.config.length;
    enumValues = this.config.enumValues;
    getSQLType() {
        return this.length === undefined ? `varchar` : `varchar(${this.length})`;
    }
}
function varchar(name, config = {}) {
    return new PgVarcharBuilder(name, config);
}

class PgSchema {
    schemaName;
    constructor(schemaName) {
        this.schemaName = schemaName;
    }
    table = ((name, columns, extraConfig) => {
        return relations.pgTableWithSchema(name, columns, extraConfig, this.schemaName);
    });
    view = ((name, columns) => {
        return relations.pgViewWithSchema(name, columns, this.schemaName);
    });
    materializedView = ((name, columns) => {
        return relations.pgMaterializedViewWithSchema(name, columns, this.schemaName);
    });
}
function isPgSchema(obj) {
    return obj instanceof PgSchema;
}
function pgSchema(name) {
    if (name === 'public') {
        throw new Error(`You can't specify 'public' as schema name. Postgres is using public schema by default. If you want to use 'public' schema, just use pgTable() instead of creating a schema`);
    }
    return new PgSchema(name);
}

exports.Check = relations.Check;
exports.CheckBuilder = relations.CheckBuilder;
exports.DefaultViewBuilderCore = relations.DefaultViewBuilderCore;
exports.ForeignKey = relations.ForeignKey;
exports.ForeignKeyBuilder = relations.ForeignKeyBuilder;
exports.Index = relations.Index;
exports.IndexBuilder = relations.IndexBuilder;
exports.IndexBuilderOn = relations.IndexBuilderOn;
exports.InlineForeignKeys = relations.InlineForeignKeys;
exports.ManualMaterializedViewBuilder = relations.ManualMaterializedViewBuilder;
exports.ManualViewBuilder = relations.ManualViewBuilder;
exports.MaterializedViewBuilder = relations.MaterializedViewBuilder;
exports.MaterializedViewBuilderCore = relations.MaterializedViewBuilderCore;
exports.PgArray = relations.PgArray;
exports.PgArrayBuilder = relations.PgArrayBuilder;
exports.PgColumn = relations.PgColumn;
exports.PgColumnBuilder = relations.PgColumnBuilder;
exports.PgDate = relations.PgDate;
exports.PgDateBuilder = relations.PgDateBuilder;
exports.PgDateString = relations.PgDateString;
exports.PgDateStringBuilder = relations.PgDateStringBuilder;
exports.PgDialect = relations.PgDialect;
exports.PgJson = relations.PgJson;
exports.PgJsonBuilder = relations.PgJsonBuilder;
exports.PgJsonb = relations.PgJsonb;
exports.PgJsonbBuilder = relations.PgJsonbBuilder;
exports.PgMaterializedView = relations.PgMaterializedView;
exports.PgMaterializedViewConfig = relations.PgMaterializedViewConfig;
exports.PgNumeric = relations.PgNumeric;
exports.PgNumericBuilder = relations.PgNumericBuilder;
exports.PgSelect = relations.PgSelect;
exports.PgSelectBuilder = relations.PgSelectBuilder;
exports.PgSelectQueryBuilder = relations.PgSelectQueryBuilder;
exports.PgTable = relations.PgTable;
exports.PgTime = relations.PgTime;
exports.PgTimeBuilder = relations.PgTimeBuilder;
exports.PgTimestamp = relations.PgTimestamp;
exports.PgTimestampBuilder = relations.PgTimestampBuilder;
exports.PgTimestampString = relations.PgTimestampString;
exports.PgTimestampStringBuilder = relations.PgTimestampStringBuilder;
exports.PgUUID = relations.PgUUID;
exports.PgUUIDBuilder = relations.PgUUIDBuilder;
exports.PgView = relations.PgView;
exports.PgViewBase = relations.PgViewBase;
exports.PgViewConfig = relations.PgViewConfig;
exports.PrimaryKey = relations.PrimaryKey;
exports.PrimaryKeyBuilder = relations.PrimaryKeyBuilder;
exports.QueryBuilder = relations.QueryBuilder;
exports.ViewBuilder = relations.ViewBuilder;
exports.check = relations.check;
exports.date = relations.date;
exports.decimal = relations.decimal;
exports.foreignKey = relations.foreignKey;
exports.getMaterializedViewConfig = relations.getMaterializedViewConfig;
exports.getTableConfig = relations.getTableConfig;
exports.getViewConfig = relations.getViewConfig;
exports.index = relations.index;
exports.json = relations.json;
exports.jsonb = relations.jsonb;
exports.makePgArray = relations.makePgArray;
exports.numeric = relations.numeric;
exports.parsePgArray = relations.parsePgArray;
exports.parsePgNestedArray = relations.parsePgNestedArray;
exports.pgMaterializedView = relations.pgMaterializedView;
exports.pgMaterializedViewWithSchema = relations.pgMaterializedViewWithSchema;
exports.pgTable = relations.pgTable;
exports.pgTableCreator = relations.pgTableCreator;
exports.pgTableWithSchema = relations.pgTableWithSchema;
exports.pgView = relations.pgView;
exports.pgViewWithSchema = relations.pgViewWithSchema;
exports.primaryKey = relations.primaryKey;
exports.time = relations.time;
exports.timestamp = relations.timestamp;
exports.uniqueIndex = relations.uniqueIndex;
exports.uuid = relations.uuid;
exports.PgDatabase = session.PgDatabase;
exports.PgDelete = session.PgDelete;
exports.PgInsert = session.PgInsert;
exports.PgInsertBuilder = session.PgInsertBuilder;
exports.PgRefreshMaterializedView = session.PgRefreshMaterializedView;
exports.PgSession = session.PgSession;
exports.PgTransaction = session.PgTransaction;
exports.PgUpdate = session.PgUpdate;
exports.PgUpdateBuilder = session.PgUpdateBuilder;
exports.PreparedQuery = session.PreparedQuery;
exports.PgBigInt53 = PgBigInt53;
exports.PgBigInt53Builder = PgBigInt53Builder;
exports.PgBigInt64 = PgBigInt64;
exports.PgBigInt64Builder = PgBigInt64Builder;
exports.PgBigSerial53 = PgBigSerial53;
exports.PgBigSerial53Builder = PgBigSerial53Builder;
exports.PgBigSerial64 = PgBigSerial64;
exports.PgBigSerial64Builder = PgBigSerial64Builder;
exports.PgBoolean = PgBoolean;
exports.PgBooleanBuilder = PgBooleanBuilder;
exports.PgChar = PgChar;
exports.PgCharBuilder = PgCharBuilder;
exports.PgCidr = PgCidr;
exports.PgCidrBuilder = PgCidrBuilder;
exports.PgCustomColumn = PgCustomColumn;
exports.PgCustomColumnBuilder = PgCustomColumnBuilder;
exports.PgDoublePrecision = PgDoublePrecision;
exports.PgDoublePrecisionBuilder = PgDoublePrecisionBuilder;
exports.PgEnumColumn = PgEnumColumn;
exports.PgEnumColumnBuilder = PgEnumColumnBuilder;
exports.PgInet = PgInet;
exports.PgInetBuilder = PgInetBuilder;
exports.PgInteger = PgInteger;
exports.PgIntegerBuilder = PgIntegerBuilder;
exports.PgInterval = PgInterval;
exports.PgIntervalBuilder = PgIntervalBuilder;
exports.PgMacaddr = PgMacaddr;
exports.PgMacaddr8 = PgMacaddr8;
exports.PgMacaddr8Builder = PgMacaddr8Builder;
exports.PgMacaddrBuilder = PgMacaddrBuilder;
exports.PgReal = PgReal;
exports.PgRealBuilder = PgRealBuilder;
exports.PgSchema = PgSchema;
exports.PgSerial = PgSerial;
exports.PgSerialBuilder = PgSerialBuilder;
exports.PgSmallInt = PgSmallInt;
exports.PgSmallIntBuilder = PgSmallIntBuilder;
exports.PgSmallSerial = PgSmallSerial;
exports.PgSmallSerialBuilder = PgSmallSerialBuilder;
exports.PgText = PgText;
exports.PgTextBuilder = PgTextBuilder;
exports.PgVarchar = PgVarchar;
exports.PgVarcharBuilder = PgVarcharBuilder;
exports.alias = alias;
exports.bigint = bigint;
exports.bigserial = bigserial;
exports.boolean = boolean;
exports.char = char;
exports.cidr = cidr;
exports.customType = customType;
exports.doublePrecision = doublePrecision;
exports.inet = inet;
exports.integer = integer;
exports.interval = interval;
exports.isPgEnum = isPgEnum;
exports.isPgSchema = isPgSchema;
exports.macaddr = macaddr;
exports.macaddr8 = macaddr8;
exports.pgEnum = pgEnum;
exports.pgSchema = pgSchema;
exports.real = real;
exports.serial = serial;
exports.smallint = smallint;
exports.smallserial = smallserial;
exports.text = text;
exports.varchar = varchar;
//# sourceMappingURL=index.cjs.map
