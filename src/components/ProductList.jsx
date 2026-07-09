import { useState, useEffect } from 'react'
import styles from './productList.module.css'

const emptyForm = { brand: '', model: '', category: '', price: '' }

function ProductList() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null) // full product object or null
  const [editForm, setEditForm] = useState(emptyForm)
  const [deletingId, setDeletingId] = useState(null)

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
        setForm(emptyForm)
        setShowAdd(false)
      }
    } catch { console.error('Failed to add product') }
  }

  const openEdit = (p) => {
    setEditingProduct(p)
    setEditForm({
      brand: p.brand || '',
      model: p.model || '',
      category: p.category || '',
      name: p.name || '',
      price: String(p.price),
    })
  }

  const handleEditSave = async () => {
    try {
      const res = await fetch(`/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, price: parseFloat(editForm.price) }),
      })
      const data = await res.json()
      if (data.success) {
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? data.product : p))
        setEditingProduct(null)
      }
    } catch { console.error('Failed to update product') }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/products/${editingProduct._id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setProducts(prev => prev.filter(p => p._id !== editingProduct._id))
        setEditingProduct(null)
        setDeletingId(null)
      }
    } catch { console.error('Failed to delete product') }
  }

  const filtered = products.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>📦 Products</h3>
        <button className={styles.addBtn} onClick={() => setShowAdd(true)}>+ Add Product</button>
      </div>

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
                <td>
                  <button className={styles.editBtn} onClick={() => openEdit(p)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product — small popup window */}
      {showAdd && (
        <div className={styles.overlay} onClick={() => setShowAdd(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>+ Add Product</h3>
              <button className={styles.closeBtn} onClick={() => setShowAdd(false)}>✕</button>
            </div>
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
        </div>
      )}

      {/* Edit Product — full edit + delete, small popup window */}
      {editingProduct && (
        <div className={styles.overlay} onClick={() => { setEditingProduct(null); setDeletingId(null) }}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>✏️ Edit Product</h3>
              <button className={styles.closeBtn} onClick={() => { setEditingProduct(null); setDeletingId(null) }}>✕</button>
            </div>

            <div className={styles.formRow}>
              <input placeholder="Product Name *" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className={styles.formRow}>
              <input placeholder="Brand" value={editForm.brand} onChange={e => setEditForm(p => ({ ...p, brand: e.target.value }))} />
              <input placeholder="Model" value={editForm.model} onChange={e => setEditForm(p => ({ ...p, model: e.target.value }))} />
            </div>
            <div className={styles.formRow}>
              <input placeholder="Category *" value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))} />
              <input placeholder="Price (Rs.) *" type="number" min="0" value={editForm.price} onChange={e => setEditForm(p => ({ ...p, price: e.target.value }))} />
            </div>

            <div className={styles.modalActions}>
              {deletingId === editingProduct._id ? (
                <div className={styles.confirmDelete}>
                  <span>Delete this product?</span>
                  <button className={styles.confirmBtn} onClick={handleDelete}>Yes, delete</button>
                  <button className={styles.cancelBtn} onClick={() => setDeletingId(null)}>Cancel</button>
                </div>
              ) : (
                <button className={styles.deleteBtn} onClick={() => setDeletingId(editingProduct._id)}>🗑️ Delete</button>
              )}
              <button className={styles.saveBtn} onClick={handleEditSave} disabled={!editForm.category || !editForm.price || !editForm.name}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductList