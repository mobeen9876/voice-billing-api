import { useState, useEffect } from 'react'
import styles from './InvoiceHistory.module.css'

function InvoiceHistory() {
  const [invoices, setInvoices] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices')
      const data = await res.json()
      if (data.success) setInvoices(data.invoices)
    } catch {
      console.error('Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-PK', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>📋 Invoice History</h3>
        <span className={styles.count}>{invoices.length} invoices</span>
      </div>

      <div className={styles.list}>
        {loading ? (
          <p className={styles.empty}>Loading...</p>
        ) : invoices.length === 0 ? (
          <p className={styles.empty}>No invoices yet.</p>
        ) : (
          invoices.map((invoice) => (
            <div
              key={invoice._id}
              className={`${styles.item} ${selected?._id === invoice._id ? styles.active : ''}`}
              onClick={() => setSelected(selected?._id === invoice._id ? null : invoice)}
            >
              <div className={styles.itemLeft}>
                <span className={styles.invoiceNo}>{invoice.invoice_no}</span>
                <span className={styles.date}>{formatDate(invoice.createdAt)}</span>
              </div>
              <div className={styles.itemRight}>
                <span className={styles.total}>Rs. {invoice.total.toLocaleString()}</span>
                <span className={`${styles.status} ${styles[invoice.status]}`}>{invoice.status}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <div className={styles.detail}>
          <div className={styles.detailHeader}>
            <span className={styles.detailNo}>{selected.invoice_no}</span>
            <button className={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
          </div>
          <table className={styles.detailTable}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {selected.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>Rs. {item.price.toLocaleString()}</td>
                  <td>Rs. {(item.quantity * item.price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={styles.totalRow}>
                <td colSpan="3">Total</td>
                <td>Rs. {selected.total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

export default InvoiceHistory
