import { useState, useEffect } from 'react'
import styles from './productList.module.css'

function ProductList() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ brand: '', model: '', category: '', price: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (data.success) setProducts(data.products)
    } catch { console.error('Failed to fetch products') }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      })
      const data = await res.json()
      if (data.success) {
        setProducts(prev => [...prev, data.product])
        setForm({ brand: '', model: '', category: '', price: '' })
        setShowForm(false)
      }
    } catch { console.error('Failed to add product') }
  }

  const filtered = products.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>📦 Products</h3>
        <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className={styles.form}>
          <div className={styles.formRow}>
            <input placeholder="Brand (e.g. Oppo)" value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} />
            <input placeholder="Model (e.g. A56)" value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} />
          </div>
          <div className={styles.formRow}>
            <input placeholder="Category *" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
            <input placeholder="Price (Rs.) *" type="number" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
          </div>
          <button className={styles.saveBtn} onClick={handleSave} disabled={!form.category || !form.price}>Save Product</button>
        </div>
      )}

      <div className={styles.searchRow}>
        <input className={styles.search} placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        <span className={styles.count}>{filtered.length} products</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead><tr><th>Product Name</th><th>Category</th><th>Price</th><th>Action</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className={styles.empty}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="4" className={styles.empty}>No products found.</td></tr>
            ) : filtered.map(p => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td><span className={styles.badge}>{p.category}</span></td>
                <td className={styles.price}>Rs. {p.price.toLocaleString()}</td>
                <td><button className={styles.editBtn}>Edit Price</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProductList
