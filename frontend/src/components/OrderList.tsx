import { useState } from 'react';
import { SalesOrder } from '../db';
import OrderForm from './OrderForm';

interface OrderListProps {
  orders: SalesOrder[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: any) => void;
  onAdd: (data: any) => void;
}

export default function OrderList({ orders, onDelete, onUpdate, onAdd }: OrderListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);

  const handleEdit = (order: SalesOrder) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '32px', margin: 0 }}>Sales Orders</h1>
          <p style={{ color: '#666', marginTop: '8px' }}>Offline-First PWA Demo</p>
        </div>
        <button
          onClick={() => { setEditingOrder(null); setShowForm(true); }}
          className="btn btn-primary"
        >
          + New Order
        </button>
      </div>

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '16px', borderBottom: '1px solid #ddd' }}>Order Number</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #ddd' }}>Customer Name</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #ddd', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
                  No orders yet. Click "New Order" to create one.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '16px', fontWeight: '500' }}>{order.order_number}</td>
                  <td style={{ padding: '16px' }}>{order.customer_name}</td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>
                    ${Number(order.amount).toFixed(2)}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      background: order.isPendingSync ? '#fef3c7' : '#d1fae5',
                      color: order.isPendingSync ? '#854d0e' : '#166534'
                    }}>
                      {order.isPendingSync ? 'Pending Sync' : 'Synced'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEdit(order)}
                      style={{ marginRight: '12px', color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => onDelete(order.id!)}
                      style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <OrderForm
          order={editingOrder || undefined}
          onClose={() => setShowForm(false)}
          onSave={(data) => {
            if (editingOrder) {
              onUpdate(editingOrder.id!, data);
            } else {
              onAdd(data);
            }
          }}
        />
      )}
    </div>
  );
}