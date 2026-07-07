import React from 'react';
import './InvoiceTable.css';

// Sample static data — will be replaced with real API data later
const SAMPLE_INVOICE = {
  invoice_no: 'INV-2025-07-0001',
  items: [
    { product_name: 'Oppo A56 Tempered Glass', quantity: 3, price: 250, total: 750 },
    { product_name: 'Charger 35W Original',    quantity: 2, price: 650, total: 1300 },
    { product_name: 'Type C Cable Original',   quantity: 1, price: 120, total: 120 },
  ],
  subtotal: 2170,
  total:    2170,
  status:   'saved',
};

function InvoiceTable({ invoice = SAMPLE_INVOICE }) {
  if (!invoice || !invoice.items || invoice.items.length === 0) {
    return null;
  }

  return (
    <div className="invoice-card">

      {/* Header */}
      <div className="invoice-header">
        <h3 className="invoice-title">🧾 Invoice</h3>
        <span className="invoice-no">{invoice.invoice_no}</span>
        <span className={`invoice-status ${invoice.status}`}>{invoice.status}</span>
      </div>

      {/* Table */}
      <div className="invoice-table-wrapper">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.product_name}</td>
                <td>{item.quantity}</td>
                <td>Rs. {item.price.toLocaleString()}</td>
                <td>Rs. {(item.quantity * item.price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="subtotal-row">
              <td colSpan="4">Subtotal</td>
              <td>Rs. {invoice.subtotal.toLocaleString()}</td>
            </tr>
            <tr className="total-row">
              <td colSpan="4">Total</td>
              <td>Rs. {invoice.total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Actions */}
      <div className="invoice-actions">
        <button className="btn-print" onClick={() => window.print()}>
          🖨️ Print
        </button>
        <button className="btn-new">
          ➕ New Bill
        </button>
      </div>

    </div>
  );
}

export default InvoiceTable;
