import Dexie, { Table } from 'dexie';

export interface SalesOrder {
  id?: number;
  order_number: string;
  customer_name: string;
  amount: number;
  isPendingSync?: boolean;
  created_at?: string;
}

export class SalesOrderDB extends Dexie {
  orders!: Table<SalesOrder, number>;

  constructor() {
    super('SalesOrdersDB');
    this.version(1).stores({
      orders: '++id, order_number, customer_name, amount, isPendingSync'
    });
    this.version(2)
      .stores({
        // Avoid indexing boolean fields (IndexedDB keys cannot be booleans).
        orders: '++id, order_number, customer_name, amount'
      })
      .upgrade(async (tx) => {
        await tx.table('orders').toCollection().modify((order: SalesOrder) => {
          if (typeof order.isPendingSync !== 'boolean') {
            order.isPendingSync = false;
          }
        });
      });
  }
}

export const db = new SalesOrderDB();