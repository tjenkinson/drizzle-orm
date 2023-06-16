import { T as TransactionRollbackError } from './errors-bb636d84.mjs';
import { Q as QueryPromise, o as orderSelectedFields, T as Table, t as tracer, S as SQL, a as Param, s as sql, b as mapUpdateSet, d as mapRelationalRow, g as QueryBuilder, W as WithSubquery, h as SelectionProxyHandler, i as PgSelectBuilder } from './relations-3eb6fe55.mjs';

class PgDelete extends QueryPromise {
    session;
    dialect;
    config;
    constructor(table, session, dialect) {
        super();
        this.session = session;
        this.dialect = dialect;
        this.config = { table };
    }
    where(where) {
        this.config.where = where;
        return this;
    }
    returning(fields = this.config.table[Table.Symbol.Columns]) {
        this.config.returning = orderSelectedFields(fields);
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
    _prepare(name) {
        return tracer.startActiveSpan('drizzle.prepareQuery', () => {
            return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name);
        });
    }
    prepare(name) {
        return this._prepare(name);
    }
    execute = (placeholderValues) => {
        return tracer.startActiveSpan('drizzle.operation', () => {
            return this._prepare().execute(placeholderValues);
        });
    };
}

class PgInsertBuilder {
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
            const cols = this.table[Table.Symbol.Columns];
            for (const colKey of Object.keys(entry)) {
                const colValue = entry[colKey];
                result[colKey] = colValue instanceof SQL ? colValue : new Param(colValue, cols[colKey]);
            }
            return result;
        });
        return new PgInsert(this.table, mappedValues, this.session, this.dialect);
    }
}
class PgInsert extends QueryPromise {
    session;
    dialect;
    config;
    constructor(table, values, session, dialect) {
        super();
        this.session = session;
        this.dialect = dialect;
        this.config = { table, values };
    }
    returning(fields = this.config.table[Table.Symbol.Columns]) {
        this.config.returning = orderSelectedFields(fields);
        return this;
    }
    onConflictDoNothing(config = {}) {
        if (config.target === undefined) {
            this.config.onConflict = sql `do nothing`;
        }
        else {
            let targetColumn = '';
            targetColumn = Array.isArray(config.target)
                ? config.target.map((it) => this.dialect.escapeName(it.name)).join(',')
                : this.dialect.escapeName(config.target.name);
            const whereSql = config.where ? sql ` where ${config.where}` : undefined;
            this.config.onConflict = sql `(${sql.raw(targetColumn)}) do nothing${whereSql}`;
        }
        return this;
    }
    onConflictDoUpdate(config) {
        const whereSql = config.where ? sql ` where ${config.where}` : undefined;
        const setSql = this.dialect.buildUpdateSet(this.config.table, mapUpdateSet(this.config.table, config.set));
        let targetColumn = '';
        targetColumn = Array.isArray(config.target)
            ? config.target.map((it) => this.dialect.escapeName(it.name)).join(',')
            : this.dialect.escapeName(config.target.name);
        this.config.onConflict = sql `(${sql.raw(targetColumn)}) do update set ${setSql}${whereSql}`;
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
    _prepare(name) {
        return tracer.startActiveSpan('drizzle.prepareQuery', () => {
            return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name);
        });
    }
    prepare(name) {
        return this._prepare(name);
    }
    execute = (placeholderValues) => {
        return tracer.startActiveSpan('drizzle.operation', () => {
            return this._prepare().execute(placeholderValues);
        });
    };
}

class PgRefreshMaterializedView extends QueryPromise {
    session;
    dialect;
    config;
    constructor(view, session, dialect) {
        super();
        this.session = session;
        this.dialect = dialect;
        this.config = { view };
    }
    concurrently() {
        if (this.config.withNoData !== undefined) {
            throw new Error('Cannot use concurrently and withNoData together');
        }
        this.config.concurrently = true;
        return this;
    }
    withNoData() {
        if (this.config.concurrently !== undefined) {
            throw new Error('Cannot use concurrently and withNoData together');
        }
        this.config.withNoData = true;
        return this;
    }
    /** @internal */
    getSQL() {
        return this.dialect.buildRefreshMaterializedViewQuery(this.config);
    }
    toSQL() {
        const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
        return rest;
    }
    _prepare(name) {
        return tracer.startActiveSpan('drizzle.prepareQuery', () => {
            return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), undefined, name);
        });
    }
    prepare(name) {
        return this._prepare(name);
    }
    execute = (placeholderValues) => {
        return tracer.startActiveSpan('drizzle.operation', () => {
            return this._prepare().execute(placeholderValues);
        });
    };
}

class PgUpdateBuilder {
    table;
    session;
    dialect;
    constructor(table, session, dialect) {
        this.table = table;
        this.session = session;
        this.dialect = dialect;
    }
    set(values) {
        return new PgUpdate(this.table, mapUpdateSet(this.table, values), this.session, this.dialect);
    }
}
class PgUpdate extends QueryPromise {
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
    returning(fields = this.config.table[Table.Symbol.Columns]) {
        this.config.returning = orderSelectedFields(fields);
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
    _prepare(name) {
        return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name);
    }
    prepare(name) {
        return this._prepare(name);
    }
    execute = (placeholderValues) => {
        return this._prepare().execute(placeholderValues);
    };
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
        return new PgRelationalQuery(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, config ? config : {}, 'many');
    }
    findFirst(config) {
        return new PgRelationalQuery(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, config ? { ...config, limit: 1 } : { limit: 1 }, 'first');
    }
}
class PgRelationalQuery extends QueryPromise {
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
    _prepare(name) {
        return tracer.startActiveSpan('drizzle.prepareQuery', () => {
            const query = this.dialect.buildRelationalQuery(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.config, this.tableConfig.tsName, [], true);
            const builtQuery = this.dialect.sqlToQuery(query.sql);
            return this.session.prepareQuery(builtQuery, undefined, name, (rawRows, mapColumnValue) => {
                const rows = rawRows.map((row) => mapRelationalRow(this.schema, this.tableConfig, row, query.selection, mapColumnValue));
                if (this.mode === 'first') {
                    return rows[0];
                }
                return rows;
            });
        });
    }
    prepare(name) {
        return this._prepare(name);
    }
    execute() {
        return tracer.startActiveSpan('drizzle.operation', () => {
            return this._prepare().execute();
        });
    }
}

class PgDatabase {
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
                return new Proxy(new WithSubquery(qb.getSQL(), qb.getSelectedFields(), alias, true), new SelectionProxyHandler({ alias, sqlAliasedBehavior: 'alias', sqlBehavior: 'error' }));
            },
        };
    }
    with(...queries) {
        const self = this;
        function select(fields) {
            return new PgSelectBuilder(fields ?? undefined, self.session, self.dialect, queries);
        }
        return { select };
    }
    select(fields) {
        return new PgSelectBuilder(fields ?? undefined, this.session, this.dialect);
    }
    update(table) {
        return new PgUpdateBuilder(table, this.session, this.dialect);
    }
    insert(table) {
        return new PgInsertBuilder(table, this.session, this.dialect);
    }
    delete(table) {
        return new PgDelete(table, this.session, this.dialect);
    }
    refreshMaterializedView(view) {
        return new PgRefreshMaterializedView(view, this.session, this.dialect);
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
class PgSession {
    dialect;
    constructor(dialect) {
        this.dialect = dialect;
    }
    execute(query) {
        return tracer.startActiveSpan('drizzle.operation', () => {
            const prepared = tracer.startActiveSpan('drizzle.prepareQuery', () => {
                return this.prepareQuery(this.dialect.sqlToQuery(query), undefined, undefined);
            });
            return prepared.execute();
        });
    }
    all(query) {
        return this.prepareQuery(this.dialect.sqlToQuery(query), undefined, undefined).all();
    }
}
class PgTransaction extends PgDatabase {
    schema;
    nestedIndex;
    constructor(dialect, session, schema, nestedIndex = 0) {
        super(dialect, session, schema);
        this.schema = schema;
        this.nestedIndex = nestedIndex;
    }
    rollback() {
        throw new TransactionRollbackError();
    }
    /** @internal */
    getTransactionConfigSQL(config) {
        const chunks = [];
        if (config.isolationLevel) {
            chunks.push(`isolation level ${config.isolationLevel}`);
        }
        if (config.accessMode) {
            chunks.push(config.accessMode);
        }
        if (typeof config.deferrable === 'boolean') {
            chunks.push(config.deferrable ? 'deferrable' : 'not deferrable');
        }
        return sql.raw(chunks.join(' '));
    }
    setTransaction(config) {
        return this.session.execute(sql `set transaction ${this.getTransactionConfigSQL(config)}`);
    }
}

export { PreparedQuery as P, PgSession as a, PgTransaction as b, PgDatabase as c, PgDelete as d, PgInsertBuilder as e, PgInsert as f, PgRefreshMaterializedView as g, PgUpdateBuilder as h, PgUpdate as i };
//# sourceMappingURL=session-deaaed1f.mjs.map