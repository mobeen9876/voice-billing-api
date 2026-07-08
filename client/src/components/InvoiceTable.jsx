import styles from './InvoiceTable.module.css'

function InvoiceTable({ invoice }) {
  if (!invoice || !invoice.items || invoice.items.length === 0) return null

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>🧾 Invoice</h3>
        <span className={styles.invoiceNo}>{invoice.invoice_no}</span>
        <span className={`${styles.status} ${styles[invoice.status]}`}>{invoice.status}</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
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
            <tr className={styles.subtotalRow}>
              <td colSpan="4">Subtotal</td>
              <td>Rs. {invoice.subtotal.toLocaleString()}</td>
            </tr>
            <tr className={styles.totalRow}>
              <td colSpan="4">Total</td>
              <td>Rs. {invoice.total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className={styles.actions}>
        <button className={styles.printBtn} onClick={() => window.print()}>🖨️ Print</button>
        <button className={styles.newBtn} onClick={() => window.location.reload()}>➕ New Bill</button>
      </div>
    </div>
  )
}

export default InvoiceTable
