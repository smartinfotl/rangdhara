import { useState } from 'react';
import { SalesOrder } from '../db';

interface OrderFormProps {
  order?: SalesOrder;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function OrderForm({ order, onClose, onSave }: OrderFormProps) {
  const [formData, setFormData] = useState({
    order_number: order?.order_number || '',
    customer_name: order?.customer_name || '',
    amount: order?.amount || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.order_number || !formData.customer_name || !formData.amount) {
      alert('All fields are required!');
      return;
    }

    onSave({
      order_number: formData.order_number,
      customer_name: formData.customer_name,
      amount: parseFloat(formData.amount),
    });
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>
          {order ? 'Edit Order' : 'New Sales Order'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Order Number</label>
            <input
              type="text"
              className="input"
              value={formData.order_number}
              onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
              placeholder="SO-1001"
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Customer Name</label>
            <input
              type="text"
              className="input"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label>Amount ($)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="1250.50"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={onClose} className="btn" style={{ background: '#6b7280', color: 'white', flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {order ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}