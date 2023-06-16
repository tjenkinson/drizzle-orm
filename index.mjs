export { bF as BaseName, C as Column, a_ as ColumnAliasProxyHandler, J as ColumnBuilder, bD as Columns, bH as ExtraConfigBuilder, br as FakePrimitiveParam, bG as IsAlias, bn as Many, bu as Name, bm as One, bE as OriginalName, a as Param, bz as Placeholder, Q as QueryPromise, R as Relation, a$ as RelationTableAliasProxyHandler, bl as Relations, S as SQL, bC as Schema, h as SelectionProxyHandler, bt as StringChunk, l as Subquery, p as SubqueryConfig, T as Table, K as TableAliasProxyHandler, bB as TableName, V as View, q as ViewBaseConfig, W as WithSubquery, v as aliasedRelation, E as aliasedTable, u as aliasedTableColumn, B as and, I as applyMixins, bj as asc, bd as between, b0 as bindIfParam, bq as createMany, bp as createOne, c as createTableRelationsHelpers, bk as desc, F as eq, bb as exists, e as extractTablesRelationalConfig, f as fillPlaceholders, j as getTableColumns, H as getTableLikeName, k as getTableName, b3 as gt, b4 as gte, bJ as iife, bh as ilike, b7 as inArray, bv as isDriverValueEncoder, ba as isNotNull, b9 as isNull, bs as isSQLWrapper, bI as isTable, bf as like, b5 as lt, b6 as lte, w as mapColumnsInAliasedSQLToAlias, y as mapColumnsInSQLToAlias, d as mapRelationalRow, m as mapResultRow, b as mapUpdateSet, n as name, b1 as ne, bw as noopDecoder, bx as noopEncoder, by as noopMapper, A as normalizeRelation, b2 as not, be as notBetween, bc as notExists, bi as notIlike, b8 as notInArray, bg as notLike, x as operators, D as or, z as orderByOperators, o as orderSelectedFields, r as param, bA as placeholder, bo as relations, s as sql } from './relations-3eb6fe55.mjs';
export { D as DrizzleError, T as TransactionRollbackError } from './errors-bb636d84.mjs';

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

export { ConsoleLogWriter, DefaultLogger, NoopLogger };
//# sourceMappingURL=index.mjs.map
