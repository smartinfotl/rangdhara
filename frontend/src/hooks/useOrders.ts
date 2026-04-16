import { useLiveQuery } from 'dexie-react-hooks';
import { db, SalesOrder } from '../db';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api/orders';

export function useOrders() {
  const orders = useLiveQuery(() =>
    db.orders.orderBy('id').reverse().toArray(), []);

  const syncPendingOrders = async () => {
    console.log("Syncing pending orders...");
    const pending = await db.orders.where({ isPendingSync: true }).toArray();

    console.log(`Found ${pending.length} pending orders to sync.`);

    for (const order of pending) {
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_number: order.order_number,
            customer_name: order.customer_name,
            amount: order.amount
          })
        });

        if (res.ok) {
          await db.orders.update(order.id!, { isPendingSync: false });
        }
      } catch (err) {
        console.log("Sync failed for order", order.order_number);
      }
    }
  };

  const addOrder = async (data: Omit<SalesOrder, 'id' | 'created_at'>) => {
    const newOrder = { ...data, isPendingSync: !navigator.onLine };

    await db.orders.add(newOrder as SalesOrder);

    if (navigator.onLine) await syncPendingOrders();

    toast.success(newOrder.isPendingSync ? 'Saved offline (will sync when online)' : 'Order saved successfully!');
  };

  const deleteOrder = async (id: number) => {
    await db.orders.delete(id);
    if (navigator.onLine) {
      try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      } catch (e) {}
    }
    toast.success('Order deleted');
  };

  // Auto sync when back online
  window.addEventListener('online', syncPendingOrders);

  return { orders: orders || [], addOrder, deleteOrder, syncPendingOrders };
}