import { K as TableAliasProxyHandler, L as PgColumnBuilder, M as PgColumn, N as pgTableWithSchema, O as pgViewWithSchema, U as pgMaterializedViewWithSchema } from '../relations-3eb6fe55.mjs';
export { Y as Check, X as CheckBuilder, aN as DefaultViewBuilderCore, ar as ForeignKey, aq as ForeignKeyBuilder, av as Index, au as IndexBuilder, at as IndexBuilderOn, aD as InlineForeignKeys, aS as ManualMaterializedViewBuilder, aP as ManualViewBuilder, aR as MaterializedViewBuilder, aQ as MaterializedViewBuilderCore, $ as PgArray, _ as PgArrayBuilder, a1 as PgDate, a0 as PgDateBuilder, a3 as PgDateString, a2 as PgDateStringBuilder, P as PgDialect, a6 as PgJson, a5 as PgJsonBuilder, a9 as PgJsonb, a8 as PgJsonbBuilder, aX as PgMaterializedView, aW as PgMaterializedViewConfig, ac as PgNumeric, ab as PgNumericBuilder, aC as PgSelect, i as PgSelectBuilder, aB as PgSelectQueryBuilder, aE as PgTable, ag as PgTime, af as PgTimeBuilder, aj as PgTimestamp, ai as PgTimestampBuilder, al as PgTimestampString, ak as PgTimestampStringBuilder, ao as PgUUID, an as PgUUIDBuilder, aV as PgView, aT as PgViewBase, aU as PgViewConfig, aA as PrimaryKey, az as PrimaryKeyBuilder, g as QueryBuilder, aO as ViewBuilder, Z as check, a4 as date, ae as decimal, as as foreignKey, aJ as getMaterializedViewConfig, aH as getTableConfig, aI as getViewConfig, aw as index, a7 as json, aa as jsonb, aM as makePgArray, ad as numeric, aL as parsePgArray, aK as parsePgNestedArray, aZ as pgMaterializedView, aF as pgTable, aG as pgTableCreator, aY as pgView, ay as primaryKey, ah as time, am as timestamp, ax as uniqueIndex, ap as uuid } from '../relations-3eb6fe55.mjs';
export { c as PgDatabase, d as PgDelete, f as PgInsert, e as PgInsertBuilder, g as PgRefreshMaterializedView, a as PgSession, b as PgTransaction, i as PgUpdate, h as PgUpdateBuilder, P as PreparedQuery } from '../session-deaaed1f.mjs';
import '../errors-bb636d84.mjs';

function alias(table, alias) {
    return new Proxy(table, new TableAliasProxyHandler(alias, false));
}

class PgBigInt53Builder extends PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgBigInt53(table, this.config);
    }
}
class PgBigInt53 extends PgColumn {
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
class PgBigInt64Builder extends PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgBigInt64(table, this.config);
    }
}
class PgBigInt64 extends PgColumn {
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

class PgBigSerial53Builder extends PgColumnBuilder {
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
class PgBigSerial53 extends PgColumn {
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
class PgBigSerial64Builder extends PgColumnBuilder {
    constructor(name) {
        super(name);
        this.config.hasDefault = true;
    }
    /** @internal */
    build(table) {
        return new PgBigSerial64(table, this.config);
    }
}
class PgBigSerial64 extends PgColumn {
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

class PgBooleanBuilder extends PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgBoolean(table, this.config);
    }
}
class PgBoolean extends PgColumn {
    getSQLType() {
        return 'boolean';
    }
}
function boolean(name) {
    return new PgBooleanBuilder(name);
}

class PgCharBuilder extends PgColumnBuilder {
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
class PgChar extends PgColumn {
    length = this.config.length;
    enumValues = this.config.enumValues;
    getSQLType() {
        return this.length === undefined ? `char` : `char(${this.length})`;
    }
}
function char(name, config = {}) {
    return new PgCharBuilder(name, config);
}

class PgCidrBuilder extends PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgCidr(table, this.config);
    }
}
class PgCidr extends PgColumn {
    getSQLType() {
        return 'cidr';
    }
}
function cidr(name) {
    return new PgCidrBuilder(name);
}

class PgCustomColumnBuilder extends PgColumnBuilder {
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
class PgCustomColumn extends PgColumn {
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

class PgDoublePrecisionBuilder extends PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgDoublePrecision(table, this.config);
    }
}
class PgDoublePrecision extends PgColumn {
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
class PgEnumColumnBuilder extends PgColumnBuilder {
    constructor(name, enumInstance) {
        super(name);
        this.config.enum = enumInstance;
    }
    /** @internal */
    build(table) {
        return new PgEnumColumn(table, this.config);
    }
}
class PgEnumColumn extends PgColumn {
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

class PgInetBuilder extends PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgInet(table, this.config);
    }
}
class PgInet extends PgColumn {
    getSQLType() {
        return 'inet';
    }
}
function inet(name) {
    return new PgInetBuilder(name);
}

class PgIntegerBuilder extends PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgInteger(table, this.config);
    }
}
class PgInteger extends PgColumn {
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

class PgIntervalBuilder extends PgColumnBuilder {
    constructor(name, intervalConfig) {
        super(name);
        this.config.intervalConfig = intervalConfig;
    }
    /** @internal */
    build(table) {
        return new PgInterval(table, this.config);
    }
}
class PgInterval extends PgColumn {
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

class PgMacaddrBuilder extends PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgMacaddr(table, this.config);
    }
}
class PgMacaddr extends PgColumn {
    getSQLType() {
        return 'macaddr';
    }
}
function macaddr(name) {
    return new PgMacaddrBuilder(name);
}

class PgMacaddr8Builder extends PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgMacaddr8(table, this.config);
    }
}
class PgMacaddr8 extends PgColumn {
    getSQLType() {
        return 'macaddr8';
    }
}
function macaddr8(name) {
    return new PgMacaddr8Builder(name);
}

class PgRealBuilder extends PgColumnBuilder {
    constructor(name, length) {
        super(name);
        this.config.length = length;
    }
    /** @internal */
    build(table) {
        return new PgReal(table, this.config);
    }
}
class PgReal extends PgColumn {
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

class PgSerialBuilder extends PgColumnBuilder {
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
class PgSerial extends PgColumn {
    getSQLType() {
        return 'serial';
    }
}
function serial(name) {
    return new PgSerialBuilder(name);
}

class PgSmallIntBuilder extends PgColumnBuilder {
    /** @internal */
    build(table) {
        return new PgSmallInt(table, this.config);
    }
}
class PgSmallInt extends PgColumn {
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

class PgSmallSerialBuilder extends PgColumnBuilder {
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
class PgSmallSerial extends PgColumn {
    getSQLType() {
        return 'serial';
    }
}
function smallserial(name) {
    return new PgSmallSerialBuilder(name);
}

class PgTextBuilder extends PgColumnBuilder {
    constructor(name, config) {
        super(name);
        this.config.enumValues = (config.enum ?? []);
    }
    /** @internal */
    build(table) {
        return new PgText(table, this.config);
    }
}
class PgText extends PgColumn {
    enumValues = this.config.enumValues;
    getSQLType() {
        return 'text';
    }
}
function text(name, config = {}) {
    return new PgTextBuilder(name, config);
}

class PgVarcharBuilder extends PgColumnBuilder {
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
class PgVarchar extends PgColumn {
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
        return pgTableWithSchema(name, columns, extraConfig, this.schemaName);
    });
    view = ((name, columns) => {
        return pgViewWithSchema(name, columns, this.schemaName);
    });
    materializedView = ((name, columns) => {
        return pgMaterializedViewWithSchema(name, columns, this.schemaName);
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

export { PgBigInt53, PgBigInt53Builder, PgBigInt64, PgBigInt64Builder, PgBigSerial53, PgBigSerial53Builder, PgBigSerial64, PgBigSerial64Builder, PgBoolean, PgBooleanBuilder, PgChar, PgCharBuilder, PgCidr, PgCidrBuilder, PgColumn, PgColumnBuilder, PgCustomColumn, PgCustomColumnBuilder, PgDoublePrecision, PgDoublePrecisionBuilder, PgEnumColumn, PgEnumColumnBuilder, PgInet, PgInetBuilder, PgInteger, PgIntegerBuilder, PgInterval, PgIntervalBuilder, PgMacaddr, PgMacaddr8, PgMacaddr8Builder, PgMacaddrBuilder, PgReal, PgRealBuilder, PgSchema, PgSerial, PgSerialBuilder, PgSmallInt, PgSmallIntBuilder, PgSmallSerial, PgSmallSerialBuilder, PgText, PgTextBuilder, PgVarchar, PgVarcharBuilder, alias, bigint, bigserial, boolean, char, cidr, customType, doublePrecision, inet, integer, interval, isPgEnum, isPgSchema, macaddr, macaddr8, pgEnum, pgMaterializedViewWithSchema, pgSchema, pgTableWithSchema, pgViewWithSchema, real, serial, smallint, smallserial, text, varchar };
//# sourceMappingURL=index.mjs.map
