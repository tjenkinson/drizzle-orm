import { Y as SQLWrapper, a as SQL, an as AnyTable, A as AnyColumn, aL as ColumnsSelection, S as Simplify, v as ChangeColumnTableName, ay as Assume, az as Equal, F as SelectedFields, T as Table, aA as DrizzleTypeError, ah as Subquery, V as View, G as GetColumnData, d as ColumnKind, U as UpdateColConfig } from './column.d-66a08b85.js';

declare abstract class TypedQueryBuilder<TSelection, TResult = unknown> implements SQLWrapper {
    _: {
        selectedFields: TSelection;
        result: TResult;
    };
    abstract getSQL(): SQL;
}

type JoinType = 'inner' | 'left' | 'right' | 'full';
type JoinNullability = 'nullable' | 'not-null';
type ApplyNullability<T, TNullability extends JoinNullability> = TNullability extends 'nullable' ? T | null : TNullability extends 'null' ? null : T;
type ApplyNullabilityToColumn<TColumn extends AnyColumn, TNullability extends JoinNullability> = TNullability extends 'not-null' ? TColumn : ColumnKind<TColumn['_']['hkt'], UpdateColConfig<TColumn['_']['config'], {
    notNull: TNullability extends 'nullable' ? false : TColumn['_']['notNull'];
}>>;
type ApplyNotNullMapToJoins<TResult, TNullabilityMap extends Record<string, JoinNullability>> = Simplify<{
    [TTableName in keyof TResult & keyof TNullabilityMap & string]: ApplyNullability<TResult[TTableName], TNullabilityMap[TTableName]>;
}>;
type SelectMode = 'partial' | 'single' | 'multiple';
type SelectResult<TResult, TSelectMode extends SelectMode, TNullabilityMap extends Record<string, JoinNullability>> = TSelectMode extends 'partial' ? SelectPartialResult<TResult, TNullabilityMap> : TSelectMode extends 'single' ? SelectResultFields<TResult> : ApplyNotNullMapToJoins<SelectResultFields<TResult>, TNullabilityMap>;
type IsUnion<T, U extends T = T> = (T extends any ? (U extends T ? false : true) : never) extends false ? false : true;
type Not<T extends boolean> = T extends true ? false : true;
type SelectPartialResult<TFields, TNullability extends Record<string, JoinNullability>> = TNullability extends TNullability ? {
    [Key in keyof TFields]: TFields[Key] extends infer TField ? TField extends AnyTable ? TField['_']['name'] extends keyof TNullability ? ApplyNullability<SelectResultFields<TField['_']['columns']>, TNullability[TField['_']['name']]> : never : TField extends AnyColumn ? TField['_']['tableName'] extends keyof TNullability ? ApplyNullability<SelectResultField<TField>, TNullability[TField['_']['tableName']]> : never : TField extends SQL | SQL.Aliased ? SelectResultField<TField> : TField extends Record<string, any> ? TField[keyof TField] extends AnyColumn<{
        tableName: infer TTableName extends string;
    }> | SQL | SQL.Aliased ? Not<IsUnion<TTableName>> extends true ? ApplyNullability<SelectResultFields<TField>, TNullability[TTableName]> : SelectPartialResult<TField, TNullability> : never : never : never;
} : never;
type MapColumnsToTableAlias<TColumns extends ColumnsSelection, TAlias extends string> = Simplify<{
    [Key in keyof TColumns]: TColumns[Key] extends AnyColumn ? ChangeColumnTableName<Assume<TColumns[Key], AnyColumn>, TAlias> : TColumns[Key];
}>;
type AddAliasToSelection<TSelection extends ColumnsSelection, TAlias extends string> = Equal<TSelection, any> extends true ? any : Simplify<{
    [Key in keyof TSelection]: TSelection[Key] extends AnyColumn ? ChangeColumnTableName<TSelection[Key], TAlias> : TSelection[Key] extends SQL | SQL.Aliased ? TSelection[Key] : TSelection[Key] extends ColumnsSelection ? MapColumnsToTableAlias<TSelection[Key], TAlias> : never;
}>;
type AppendToResult<TTableName extends string | undefined, TResult, TJoinedName extends string | undefined, TSelectedFields extends SelectedFields<AnyColumn, Table>, TOldSelectMode extends SelectMode> = TOldSelectMode extends 'partial' ? TResult : TOldSelectMode extends 'single' ? (TTableName extends string ? Record<TTableName, TResult> : TResult) & (TJoinedName extends string ? Record<TJoinedName, TSelectedFields> : TSelectedFields) : TResult & (TJoinedName extends string ? Record<TJoinedName, TSelectedFields> : TSelectedFields);
type BuildSubquerySelection<TSelection extends ColumnsSelection, TNullability extends Record<string, JoinNullability>> = TSelection extends never ? any : Simplify<{
    [Key in keyof TSelection]: TSelection[Key] extends SQL ? DrizzleTypeError<'You cannot reference this field without assigning it an alias first - use `.as(<alias>)`'> : TSelection[Key] extends SQL.Aliased ? TSelection[Key] : TSelection[Key] extends AnyColumn ? ApplyNullabilityToColumn<TSelection[Key], TNullability[TSelection[Key]['_']['tableName']]> : TSelection[Key] extends ColumnsSelection ? BuildSubquerySelection<TSelection[Key], TNullability> : never;
}>;
type SetJoinsNullability<TNullabilityMap extends Record<string, JoinNullability>, TValue extends JoinNullability> = {
    [Key in keyof TNullabilityMap]: TValue;
};
type AppendToNullabilityMap<TJoinsNotNull extends Record<string, JoinNullability>, TJoinedName extends string | undefined, TJoinType extends JoinType> = TJoinedName extends string ? 'left' extends TJoinType ? TJoinsNotNull & {
    [name in TJoinedName]: 'nullable';
} : 'right' extends TJoinType ? SetJoinsNullability<TJoinsNotNull, 'nullable'> & {
    [name in TJoinedName]: 'not-null';
} : 'inner' extends TJoinType ? TJoinsNotNull & {
    [name in TJoinedName]: 'not-null';
} : 'full' extends TJoinType ? SetJoinsNullability<TJoinsNotNull, 'nullable'> & {
    [name in TJoinedName]: 'nullable';
} : never : TJoinsNotNull;
type GetSelectTableName<TTable extends AnyTable | Subquery | View | SQL> = TTable extends AnyTable ? TTable['_']['name'] : TTable extends Subquery ? TTable['_']['alias'] : TTable extends View ? TTable['_']['name'] : TTable extends SQL ? undefined : never;
type GetSelectTableSelection<TTable extends AnyTable | Subquery | View | SQL> = TTable extends AnyTable ? TTable['_']['columns'] : TTable extends Subquery | View ? Assume<TTable['_']['selectedFields'], ColumnsSelection> : TTable extends SQL ? {} : never;
type SelectResultField<T, TDeep extends boolean = true> = T extends DrizzleTypeError<any> ? T : T extends AnyTable ? Equal<TDeep, true> extends true ? SelectResultField<T['_']['columns'], false> : never : T extends AnyColumn ? GetColumnData<T> : T extends SQL | SQL.Aliased ? T['_']['type'] : T extends Record<string, any> ? SelectResultFields<T, true> : never;
type SelectResultFields<TSelectedFields, TDeep extends boolean = true> = Simplify<{
    [Key in keyof TSelectedFields & string]: SelectResultField<TSelectedFields[Key], TDeep>;
}>;

export { AddAliasToSelection as A, BuildSubquerySelection as B, GetSelectTableName as G, JoinNullability as J, MapColumnsToTableAlias as M, SelectMode as S, TypedQueryBuilder as T, GetSelectTableSelection as a, SelectResult as b, JoinType as c, AppendToResult as d, AppendToNullabilityMap as e, SelectResultFields as f };
