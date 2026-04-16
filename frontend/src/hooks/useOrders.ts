import { useLiveQuery } from 'dexie-react-hooks';
import { db, SalesOrder } from '../db';
import toast from 'react-hot-toast';
import { useCallback, useEffect } from 'react';

const API_URL = 'http://192.168.10.18:5000/api/orders';

export function useOrders() {
    const orders = useLiveQuery(() =>
        db.orders.orderBy('id').reverse().toArray(), []);

    const fetchOrdersFromApi = useCallback(async () => {
        if (!navigator.onLine) return;

        try {
            const res = await fetch(API_URL);
            if (!res.ok) return;

            const serverOrders: SalesOrder[] = await res.json();

            await db.transaction('rw', db.orders, async () => {
                for (const order of serverOrders) {
                    const existing = await db.orders
                        .where('order_number')
                        .equals(order.order_number)
                        .first();

                    if (existing?.id) {
                        await db.orders.update(existing.id, {
                            customer_name: order.customer_name,
                            amount: Number(order.amount),
                            created_at: order.created_at,
                            isPendingSync: false,
                        });
                    } else {
                        await db.orders.add({
                            order_number: order.order_number,
                            customer_name: order.customer_name,
                            amount: Number(order.amount),
                            created_at: order.created_at,
                            isPendingSync: false,
                        });
                    }
                }
            });
        } catch (err) {
            console.log("Failed to fetch orders from API.");
        }
    }, []);

    const syncPendingOrders = useCallback(async () => {
        console.log("Syncing pending orders...");

        const pending = await db.orders.filter((order) => order.isPendingSync === true).toArray();

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

        await fetchOrdersFromApi();
    }, [fetchOrdersFromApi]);

    const addOrder = async (data: Omit<SalesOrder, 'id' | 'created_at'>) => {
        // const newOrder = { ...data, isPendingSync: !navigator.onLine };
        // If online, syncPendingOrders() will immediately push and clear this flag.
        const newOrder = { ...data, isPendingSync: true };

        await db.orders.add(newOrder as SalesOrder);

        if (navigator.onLine) await syncPendingOrders();

        // toast.success(newOrder.isPendingSync ? 'Saved offline (will sync when online)' : 'Order saved successfully!');
        toast.success(navigator.onLine ? 'Order saved successfully!' : 'Saved offline (will sync when online)');
    };

    const deleteOrder = async (id: number) => {
        await db.orders.delete(id);
        if (navigator.onLine) {
            try {
                await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            } catch (e) { }
        }
        toast.success('Order deleted');
    };

    // Auto sync when back online
    useEffect(() => {
        if (navigator.onLine) {
            fetchOrdersFromApi();
        }
    }, [fetchOrdersFromApi]);

    useEffect(() => {
        window.addEventListener('online', syncPendingOrders);
        return () => {
            window.removeEventListener('online', syncPendingOrders);
        };
    }, [syncPendingOrders]);

    return { orders: orders || [], addOrder, deleteOrder, syncPendingOrders, fetchOrdersFromApi };
}