import { useState, useEffect } from 'react'
import styles from './invoiceHistory.module.css'

const PAGE_SIZE = 5

function InvoiceHistory() {
  const [invoices, setInvoices] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetch('/api/invoices').then(r => r.json())
      .then(d => { if (d.success) setInvoices(d.invoices) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const fmt = (iso) => new Date(iso).toLocaleDateString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const totalPages = Math.max(1, Math.ceil(invoices.length / PAGE_SIZE))
  const pageInvoices = invoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const goToPage = (p) => {
    setPage(Math.min(Math.max(1, p), totalPages))
    setSelected(null)
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>📋 Invoice History</h3>
        <span className={styles.count}>{invoices.length} invoices</span>
      </div>

      <div className={styles.list}>
        {loading ? <p className={styles.empty}>Loading...</p>
          : invoices.length === 0 ? <p className={styles.empty}>No invoices yet.</p>
          : pageInvoices.map(inv => (
            <div key={inv._id}>
              <div
                className={`${styles.item} ${selected?._id === inv._id ? styles.active : ''}`}
                onClick={() => setSelected(selected?._id === inv._id ? null : inv)}>
                <div className={styles.itemLeft}>
                  <span className={styles.invoiceNo}>{inv.invoice_no}</span>
                  <span className={styles.date}>{fmt(inv.createdAt)}</span>
                </div>
                <div className={styles.itemRight}>
                  <span className={styles.total}>Rs. {inv.total.toLocaleString()}</span>
                  <span className={`${styles.status} ${styles[inv.status]}`}>{inv.status}</span>
                </div>
              </div>

              {/* Detail now opens right here, directly under the clicked invoice */}
              {selected?._id === inv._id && (
                <div className={styles.detail}>
                  <div className={styles.detailHeader}>
                    <span className={styles.detailNo}>{selected.invoice_no}</span>
                    <button className={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
                  </div>
                  <table className={styles.detailTable}>
                    <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
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
                      <tr className={styles.totalRow}><td colSpan="3">Total</td><td>Rs. {selected.total.toLocaleString()}</td></tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          ))}
      </div>

      {!loading && invoices.length > PAGE_SIZE && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} onClick={() => goToPage(page - 1)} disabled={page === 1}>← Prev</button>
          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
          <button className={styles.pageBtn} onClick={() => goToPage(page + 1)} disabled={page === totalPages}>Next →</button>
        </div>
      )}
    </div>
  )
}

export default InvoiceHistory