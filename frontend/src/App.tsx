import { useState, useEffect } from 'react';
import { useOrders } from './hooks/useOrders';
import toast, { Toaster } from 'react-hot-toast';

interface FormData {
  order_number: string;
  customer_name: string;
  amount: string;
}

function App() {
  const { orders, addOrder, deleteOrder, syncPendingOrders } = useOrders();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    order_number: '',
    customer_name: '',
    amount: '',
  });

  useEffect(() => {
    const handleOnline = () => {
      syncPendingOrders();
      toast.success('✅ Back Online - Syncing data...');
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncPendingOrders]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.order_number || !formData.customer_name || !formData.amount) {
      alert("All fields are required!");
      return;
    }

    addOrder({
      order_number: formData.order_number,
      customer_name: formData.customer_name,
      amount: parseFloat(formData.amount),
    });

    setFormData({ order_number: '', customer_name: '', amount: '' });
    setShowForm(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "1100px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", color: "#2563eb", fontSize: "40px" }}>
        Rangdhara ERP
      </h1>
      {/* <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
        Offline First
      </p> */}

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: "14px 28px",
            fontSize: "18px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          + New Sales Order
        </button>
      </div>

      {/* Orders Table */}
      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th style={{ padding: "16px", textAlign: "left" }}>Order Number</th>
              <th style={{ padding: "16px", textAlign: "left" }}>Customer Name</th>
              <th style={{ padding: "16px", textAlign: "right" }}>Amount</th>
              <th style={{ padding: "16px", textAlign: "center" }}>Status</th>
              <th style={{ padding: "16px", textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "80px", textAlign: "center", color: "#888" }}>
                  No orders yet. Create your first order.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: "16px" }}>{order.order_number}</td>
                  <td style={{ padding: "16px" }}>{order.customer_name}</td>
                  <td style={{ padding: "16px", textAlign: "right", fontWeight: "bold" }}>
                    ${Number(order.amount).toFixed(2)}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <span style={{
                      padding: "6px 16px",
                      borderRadius: "20px",
                      background: order.isPendingSync ? "#fef3c7" : "#d1fae5",
                      color: order.isPendingSync ? "#854d0e" : "#166534"
                    }}>
                      {order.isPendingSync ? "⏳ Pending Sync" : "✅ Synced"}
                    </span>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <button
                      onClick={() => deleteOrder(order.id!)}
                      style={{ color: "red", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "420px" }}>
            <h2>New Sales Order</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Order Number (SO-1001)"
                value={formData.order_number}
                onChange={(e) => setFormData({...formData, order_number: e.target.value})}
                style={{ width: "100%", padding: "12px", margin: "10px 0", borderRadius: "6px", border: "1px solid #ccc" }}
              />
              <input
                type="text"
                placeholder="Customer Name"
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                style={{ width: "100%", padding: "12px", margin: "10px 0", borderRadius: "6px", border: "1px solid #ccc" }}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                style={{ width: "100%", padding: "12px", margin: "10px 0", borderRadius: "6px", border: "1px solid #ccc" }}
              />

              <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: "14px", background: "#6b7280", color: "white", border: "none", borderRadius: "8px" }}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ flex: 1, padding: "14px", background: "#2563eb", color: "white", border: "none", borderRadius: "8px" }}>
                  Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;