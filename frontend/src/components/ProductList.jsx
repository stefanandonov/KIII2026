import { useState, useEffect, useCallback } from 'react'
import './ProductList.css'

export default function ProductList({ onAdd, onEdit }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chartMessage, setChartMessage] = useState(null)
  const [chartUrl, setChartUrl] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/products/')
      if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`)
      setProducts(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (e) {
      alert(e.message)
    } finally {
      setDeletingId(null)
    }
  }

  async function handleGenerateChart() {
    setChartMessage(null)
    try {
      const res = await fetch('/visualizations/products-per-category', { method: 'POST' })
      if (!res.ok) throw new Error(`Chart generation failed: ${res.status}`)
      setChartMessage('Chart generated successfully.')
      setChartUrl(`/charts/products_per_category.png?t=${Date.now()}`)
    } catch (e) {
      setChartMessage(`Error: ${e.message}`)
    }
  }

  return (
    <div className="product-list">
      <div className="toolbar">
        <h2>Products</h2>
        <div className="toolbar-actions">
          <button className="btn btn-secondary" onClick={handleGenerateChart}>
            Generate Chart
          </button>
          <button className="btn btn-primary" onClick={onAdd}>
            + Add Product
          </button>
        </div>
      </div>

      {chartMessage && (
        <div className={`alert ${chartMessage.startsWith('Error') ? 'alert-error' : 'alert-success'}`}>
          {chartMessage}
        </div>
      )}

      {chartUrl && (
        <div className="chart-container">
          <h3>Products per Category</h3>
          <img src={chartUrl} alt="Products per category chart" />
        </div>
      )}

      {loading && <p className="status-msg">Loading products...</p>}
      {error && <p className="status-msg error">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p className="status-msg">No products found. Add one to get started.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td className="product-name">{p.name}</td>
                  <td>{p.category || '—'}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td>
                    <span className={`badge ${p.is_active ? 'badge-active' : 'badge-inactive'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn btn-sm btn-edit" onClick={() => onEdit(p)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                    >
                      {deletingId === p.id ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}