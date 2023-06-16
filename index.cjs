'use strict';

var relations = require('./relations-9f413b53.cjs');
var errors = require('./errors-d0192d62.cjs');

class ConsoleLogWriter {
    write(message) {
        console.log(message);
    }
}
class DefaultLogger {
    writer;
    constructor(config) {
        this.writer = config?.writer ?? new ConsoleLogWriter();
    }
    logQuery(query, params) {
        const stringifiedParams = params.map((p) => {
            try {
                return JSON.stringify(p);
            }
            catch {
                return String(p);
            }
        });
        const paramsStr = stringifiedParams.length ? ` -- params: [${stringifiedParams.join(', ')}]` : '';
        this.writer.write(`Query: ${query}${paramsStr}`);
    }
}
class NoopLogger {
    logQuery() {
        // noop
    }
}

exports.BaseName = relations.BaseName;
exports.Column = relations.Column;
exports.ColumnAliasProxyHandler = relations.ColumnAliasProxyHandler;
exports.ColumnBuilder = relations.ColumnBuilder;
exports.Columns = relations.Columns;
exports.ExtraConfigBuilder = relations.ExtraConfigBuilder;
exports.FakePrimitiveParam = relations.FakePrimitiveParam;
exports.IsAlias = relations.IsAlias;
exports.Many = relations.Many;
exports.Name = relations.Name;
exports.One = relations.One;
exports.OriginalName = relations.OriginalName;
exports.Param = relations.Param;
exports.Placeholder = relations.Placeholder;
exports.QueryPromise = relations.QueryPromise;
exports.Relation = relations.Relation;
exports.RelationTableAliasProxyHandler = relations.RelationTableAliasProxyHandler;
exports.Relations = relations.Relations;
Object.defineProperty(exports, 'SQL', {
    enumerable: true,
    get: function () { return relations.SQL; }
});
exports.Schema = relations.Schema;
exports.SelectionProxyHandler = relations.SelectionProxyHandler;
exports.StringChunk = relations.StringChunk;
exports.Subquery = relations.Subquery;
exports.SubqueryConfig = relations.SubqueryConfig;
exports.Table = relations.Table;
exports.TableAliasProxyHandler = relations.TableAliasProxyHandler;
exports.TableName = relations.TableName;
exports.View = relations.View;
exports.ViewBaseConfig = relations.ViewBaseConfig;
exports.WithSubquery = relations.WithSubquery;
exports.aliasedRelation = relations.aliasedRelation;
exports.aliasedTable = relations.aliasedTable;
exports.aliasedTableColumn = relations.aliasedTableColumn;
exports.and = relations.and;
exports.applyMixins = relations.applyMixins;
exports.asc = relations.asc;
exports.between = relations.between;
exports.bindIfParam = relations.bindIfParam;
exports.createMany = relations.createMany;
exports.createOne = relations.createOne;
exports.createTableRelationsHelpers = relations.createTableRelationsHelpers;
exports.desc = relations.desc;
exports.eq = relations.eq;
exports.exists = relations.exists;
exports.extractTablesRelationalConfig = relations.extractTablesRelationalConfig;
exports.fillPlaceholders = relations.fillPlaceholders;
exports.getTableColumns = relations.getTableColumns;
exports.getTableLikeName = relations.getTableLikeName;
exports.getTableName = relations.getTableName;
exports.gt = relations.gt;
exports.gte = relations.gte;
exports.iife = relations.iife;
exports.ilike = relations.ilike;
exports.inArray = relations.inArray;
exports.isDriverValueEncoder = relations.isDriverValueEncoder;
exports.isNotNull = relations.isNotNull;
exports.isNull = relations.isNull;
exports.isSQLWrapper = relations.isSQLWrapper;
exports.isTable = relations.isTable;
exports.like = relations.like;
exports.lt = relations.lt;
exports.lte = relations.lte;
exports.mapColumnsInAliasedSQLToAlias = relations.mapColumnsInAliasedSQLToAlias;
exports.mapColumnsInSQLToAlias = relations.mapColumnsInSQLToAlias;
exports.mapRelationalRow = relations.mapRelationalRow;
exports.mapResultRow = relations.mapResultRow;
exports.mapUpdateSet = relations.mapUpdateSet;
exports.name = relations.name;
exports.ne = relations.ne;
exports.noopDecoder = relations.noopDecoder;
exports.noopEncoder = relations.noopEncoder;
exports.noopMapper = relations.noopMapper;
exports.normalizeRelation = relations.normalizeRelation;
exports.not = relations.not;
exports.notBetween = relations.notBetween;
exports.notExists = relations.notExists;
exports.notIlike = relations.notIlike;
exports.notInArray = relations.notInArray;
exports.notLike = relations.notLike;
exports.operators = relations.operators;
exports.or = relations.or;
exports.orderByOperators = relations.orderByOperators;
exports.orderSelectedFields = relations.orderSelectedFields;
exports.param = relations.param;
exports.placeholder = relations.placeholder;
exports.relations = relations.relations;
Object.defineProperty(exports, 'sql', {
    enumerable: true,
    get: function () { return relations.sql; }
});
exports.DrizzleError = errors.DrizzleError;
exports.TransactionRollbackError = errors.TransactionRollbackError;
exports.ConsoleLogWriter = ConsoleLogWriter;
exports.DefaultLogger = DefaultLogger;
exports.NoopLogger = NoopLogger;
//# sourceMappingURL=index.cjs.map
