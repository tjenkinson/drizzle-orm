'use strict';

var errors = require('./errors-d0192d62.cjs');
var relations = require('./relations-9f413b53.cjs');

class PgDelete extends relations.QueryPromise {
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
    returning(fields = this.config.table[relations.Table.Symbol.Columns]) {
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
    _prepare(name) {
        return relations.tracer.startActiveSpan('drizzle.prepareQuery', () => {
            return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name);
        });
    }
    prepare(name) {
        return this._prepare(name);
    }
    execute = (placeholderValues) => {
        return relations.tracer.startActiveSpan('drizzle.operation', () => {
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
            const cols = this.table[relations.Table.Symbol.Columns];
            for (const colKey of Object.keys(entry)) {
                const colValue = entry[colKey];
                result[colKey] = colValue instanceof relations.SQL ? colValue : new relations.Param(colValue, cols[colKey]);
            }
            return result;
        });
        return new PgInsert(this.table, mappedValues, this.session, this.dialect);
    }
}
class PgInsert extends relations.QueryPromise {
    session;
    dialect;
    config;
    constructor(table, values, session, dialect) {
        super();
        this.session = session;
        this.dialect = dialect;
        this.config = { table, values };
    }
    returning(fields = this.config.table[relations.Table.Symbol.Columns]) {
        this.config.returning = relations.orderSelectedFields(fields);
        return this;
    }
    onConflictDoNothing(config = {}) {
        if (config.target === undefined) {
            this.config.onConflict = relations.sql `do nothing`;
        }
        else {
            let targetColumn = '';
            targetColumn = Array.isArray(config.target)
                ? config.target.map((it) => this.dialect.escapeName(it.name)).join(',')
                : this.dialect.escapeName(config.target.name);
            const whereSql = config.where ? relations.sql ` where ${config.where}` : undefined;
            this.config.onConflict = relations.sql `(${relations.sql.raw(targetColumn)}) do nothing${whereSql}`;
        }
        return this;
    }
    onConflictDoUpdate(config) {
        const whereSql = config.where ? relations.sql ` where ${config.where}` : undefined;
        const setSql = this.dialect.buildUpdateSet(this.config.table, relations.mapUpdateSet(this.config.table, config.set));
        let targetColumn = '';
        targetColumn = Array.isArray(config.target)
            ? config.target.map((it) => this.dialect.escapeName(it.name)).join(',')
            : this.dialect.escapeName(config.target.name);
        this.config.onConflict = relations.sql `(${relations.sql.raw(targetColumn)}) do update set ${setSql}${whereSql}`;
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
        return relations.tracer.startActiveSpan('drizzle.prepareQuery', () => {
            return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name);
        });
    }
    prepare(name) {
        return this._prepare(name);
    }
    execute = (placeholderValues) => {
        return relations.tracer.startActiveSpan('drizzle.operation', () => {
            return this._prepare().execute(placeholderValues);
        });
    };
}

class PgRefreshMaterializedView extends relations.QueryPromise {
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
        return relations.tracer.startActiveSpan('drizzle.prepareQuery', () => {
            return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), undefined, name);
        });
    }
    prepare(name) {
        return this._prepare(name);
    }
    execute = (placeholderValues) => {
        return relations.tracer.startActiveSpan('drizzle.operation', () => {
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
        return new PgUpdate(this.table, relations.mapUpdateSet(this.table, values), this.session, this.dialect);
    }
}
class PgUpdate extends relations.QueryPromise {
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
    returning(fields = this.config.table[relations.Table.Symbol.Columns]) {
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
class PgRelationalQuery extends relations.QueryPromise {
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
        return relations.tracer.startActiveSpan('drizzle.prepareQuery', () => {
            const query = this.dialect.buildRelationalQuery(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.config, this.tableConfig.tsName, [], true);
            const builtQuery = this.dialect.sqlToQuery(query.sql);
            return this.session.prepareQuery(builtQuery, undefined, name, (rawRows, mapColumnValue) => {
                const rows = rawRows.map((row) => relations.mapRelationalRow(this.schema, this.tableConfig, row, query.selection, mapColumnValue));
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
        return relations.tracer.startActiveSpan('drizzle.operation', () => {
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
                    qb = qb(new relations.QueryBuilder());
                }
                return new Proxy(new relations.WithSubquery(qb.getSQL(), qb.getSelectedFields(), alias, true), new relations.SelectionProxyHandler({ alias, sqlAliasedBehavior: 'alias', sqlBehavior: 'error' }));
            },
        };
    }
    with(...queries) {
        const self = this;
        function select(fields) {
            return new relations.PgSelectBuilder(fields ?? undefined, self.session, self.dialect, queries);
        }
        return { select };
    }
    select(fields) {
        return new relations.PgSelectBuilder(fields ?? undefined, this.session, this.dialect);
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
        return relations.tracer.startActiveSpan('drizzle.operation', () => {
            const prepared = relations.tracer.startActiveSpan('drizzle.prepareQuery', () => {
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
        throw new errors.TransactionRollbackError();
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
        return relations.sql.raw(chunks.join(' '));
    }
    setTransaction(config) {
        return this.session.execute(relations.sql `set transaction ${this.getTransactionConfigSQL(config)}`);
    }
}

exports.PgDatabase = PgDatabase;
exports.PgDelete = PgDelete;
exports.PgInsert = PgInsert;
exports.PgInsertBuilder = PgInsertBuilder;
exports.PgRefreshMaterializedView = PgRefreshMaterializedView;
exports.PgSession = PgSession;
exports.PgTransaction = PgTransaction;
exports.PgUpdate = PgUpdate;
exports.PgUpdateBuilder = PgUpdateBuilder;
exports.PreparedQuery = PreparedQuery;
//# sourceMappingURL=session-95978d5c.cjs.map
