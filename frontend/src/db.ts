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
  }
}

export const db = new SalesOrderDB();