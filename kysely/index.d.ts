import { ColumnType } from 'kysely';
import { T as Table, S as Simplify, I as InferModel, M as MapColumnName } from '../column.d-66a08b85.js';

type Kyselify<T extends Table> = Simplify<{
    [Key in keyof T['_']['columns'] & string as MapColumnName<Key, T['_']['columns'][Key], true>]: ColumnType<InferModel<T, 'select', {
        dbColumnNames: true;
    }>[MapColumnName<Key, T['_']['columns'][Key], true>], MapColumnName<Key, T['_']['columns'][Key], true> extends keyof InferModel<T, 'insert', {
        dbColumnNames: true;
    }> ? InferModel<T, 'insert', {
        dbColumnNames: true;
    }>[MapColumnName<Key, T['_']['columns'][Key], true>] : never, MapColumnName<Key, T['_']['columns'][Key], true> extends keyof InferModel<T, 'insert', {
        dbColumnNames: true;
    }> ? InferModel<T, 'insert', {
        dbColumnNames: true;
    }>[MapColumnName<Key, T['_']['columns'][Key], true>] : never>;
}>;

export { Kyselify };