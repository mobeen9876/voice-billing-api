import React, { useState } from 'react';
import './InvoiceHistory.css';

// Sample static data — will be replaced with real API data later
const SAMPLE_INVOICES = [
  {
    _id: '1',
    invoice_no: 'INV-2025-07-0003',
    total: 2170,
    status: 'saved',
    createdAt: '2025-07-07T10:30:00Z',
    items: [
      { product_name: 'Oppo A56 Tempered Glass', quantity: 3, price: 250 },
      { product_name: 'Charger 35W Original',    quantity: 2, price: 650 },
      { product_name: 'Type C Cable Original',   quantity: 1, price: 120 },
    ],
  },
  {
    _id: '2',
    invoice_no: 'INV-2025-07-0002',
    total: 830,
    status: 'saved',
    createdAt: '2025-07-07T09:15:00Z',
    items: [
      { product_name: 'Samsung A15 Cover',  quantity: 2, price: 180 },
      { product_name: 'Type C Cable Fast',  quantity: 1, price: 150 },
      { product_name: 'Vivo Y17 Glass',     quantity: 1, price: 200 },
      { product_name: 'Earphones',          quantity: 1, price: 120 },
    ],
  },
  {
    _id: '3',
    invoice_no: 'INV-2025-07-0001',
    total: 500,
    status: 'saved',
    createdAt: '2025-07-06T16:45:00Z',
    items: [
      { product_name: 'Charger 35W Original', quantity: 1, price: 500 },
    ],
  },
];

function InvoiceHistory() {
  const [invoices]         = useState(SAMPLE_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-PK', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="history-card">

      {/* Header */}
      <div className="history-header">
        <h3 className="history-title">📋 Invoice History</h3>
        <span className="history-count">{invoices.length} invoices</span>
      </div>

      {/* List */}
      <div className="history-list">
        {invoices.length === 0 ? (
          <p className="history-empty">No invoices yet.</p>
        ) : (
          invoices.map((invoice) => (
            <div
              key={invoice._id}
              className={`history-item ${selectedInvoice?._id === invoice._id ? 'active' : ''}`}
              onClick={() => setSelectedInvoice(
                selectedInvoice?._id === invoice._id ? null : invoice
              )}
            >
              <div className="history-item-left">
                <span className="history-invoice-no">{invoice.invoice_no}</span>
                <span className="history-date">{formatDate(invoice.createdAt)}</span>
              </div>
              <div className="history-item-right">
                <span className="history-total">Rs. {invoice.total.toLocaleString()}</span>
                <span className={`history-status ${invoice.status}`}>{invoice.status}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail View */}
      {selectedInvoice && (
        <div className="history-detail">
          <div className="history-detail-header">
            <span className="history-detail-no">{selectedInvoice.invoice_no}</span>
            <button className="btn-close-detail" onClick={() => setSelectedInvoice(null)}>✕</button>
          </div>
          <table className="history-detail-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedInvoice.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>Rs. {item.price.toLocaleString()}</td>
                  <td>Rs. {(item.quantity * item.price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="detail-total-row">
                <td colSpan="3">Total</td>
                <td>Rs. {selectedInvoice.total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

    </div>
  );
}

export default InvoiceHistory;
