import { Knex } from 'knex';
import { T as Table, I as InferModel } from '../column.d-66a08b85.js';

declare module 'knex/types/tables' {
    type Knexify<T extends Table> = Knex.CompositeTableType<InferModel<T, 'select', {
        dbColumnNames: true;
    }>, InferModel<T, 'insert', {
        dbColumnNames: true;
    }>>;
}
