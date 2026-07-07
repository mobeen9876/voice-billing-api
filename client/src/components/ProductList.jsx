import React, { useState } from 'react';
import './ProductList.css';

// Sample static data — will be replaced with real API data later
const SAMPLE_PRODUCTS = [
  { _id: '1', brand: 'Oppo',    model: 'A56',  category: 'Glass',    name: 'Oppo A56 Tempered Glass',  price: 250 },
  { _id: '2', brand: 'Samsung', model: 'A15',  category: 'Cover',    name: 'Samsung A15 Cover',        price: 180 },
  { _id: '3', brand: '',        model: '',     category: 'Charger',  name: 'Charger 35W Original',     price: 650 },
  { _id: '4', brand: '',        model: '',     category: 'Cable',    name: 'Type C Cable Original',    price: 120 },
  { _id: '5', brand: 'Vivo',    model: 'Y17',  category: 'Glass',    name: 'Vivo Y17 Tempered Glass',  price: 200 },
];

function ProductList() {
  const [products]      = useState(SAMPLE_PRODUCTS);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    brand: '', model: '', category: '', price: '',
  });

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddChange = (e) => {
    setNewProduct((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="product-list-card">

      {/* Header */}
      <div className="pl-header">
        <h3 className="pl-title">📦 Products</h3>
        <button className="btn-add-product" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <div className="add-product-form">
          <div className="form-row">
            <input
              name="brand"
              placeholder="Brand (e.g. Oppo)"
              value={newProduct.brand}
              onChange={handleAddChange}
            />
            <input
              name="model"
              placeholder="Model (e.g. A56)"
              value={newProduct.model}
              onChange={handleAddChange}
            />
          </div>
          <div className="form-row">
            <input
              name="category"
              placeholder="Category (e.g. Glass) *"
              value={newProduct.category}
              onChange={handleAddChange}
            />
            <input
              name="price"
              type="number"
              placeholder="Price (Rs.) *"
              value={newProduct.price}
              onChange={handleAddChange}
              min="0"
            />
          </div>
          <button
            className="btn-save-product"
            disabled={!newProduct.category || !newProduct.price}
          >
            Save Product
          </button>
        </div>
      )}

      {/* Search */}
      <div className="pl-search-row">
        <input
          className="pl-search"
          type="text"
          placeholder="🔍 Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="pl-count">{filtered.length} products</span>
      </div>

      {/* Table */}
      <div className="pl-table-wrapper">
        <table className="pl-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="4" className="pl-empty">No products found.</td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td><span className="category-badge">{product.category}</span></td>
                  <td className="price-cell">Rs. {product.price.toLocaleString()}</td>
                  <td>
                    <button className="btn-edit-price">Edit Price</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default ProductList;
