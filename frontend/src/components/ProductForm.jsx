import { useState } from 'react'
import './ProductForm.css'

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '0',
  category: '',
  is_active: true,
}

export default function ProductForm({ product, onSaved, onCancel }) {
  const isEdit = Boolean(product)
  const [form, setForm] = useState(
    product
      ? {
          name: product.name,
          description: product.description ?? '',
          price: String(product.price),
          stock: String(product.stock),
          category: product.category ?? '',
          is_active: product.is_active,
        }
      : EMPTY_FORM
  )
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (form.name.length > 255) e.name = 'Name must be at most 255 characters.'
    const price = parseFloat(form.price)
    if (isNaN(price) || price <= 0) e.price = 'Price must be a positive number.'
    const stock = parseInt(form.stock, 10)
    if (isNaN(stock) || stock < 0) e.stock = 'Stock must be a non-negative integer.'
    return e
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }

    setSubmitting(true)
    const body = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      category: form.category.trim() || null,
      is_active: form.is_active,
    }

    try {
      const url = isEdit ? `/products/${product.id}` : '/products/'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail ?? `Request failed: ${res.status}`)
      }
      onSaved()
    } catch (err) {
      setErrors({ general: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="product-form-wrapper">
      <div className="form-header">
        <h2>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
      </div>

      {errors.general && <div className="form-error-banner">{errors.general}</div>}

      <form className="product-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Product name"
            maxLength={255}
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional description"
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price ($) *</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
            />
            {errors.price && <span className="field-error">{errors.price}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock *</label>
            <input
              id="stock"
              name="stock"
              type="number"
              step="1"
              min="0"
              value={form.stock}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.stock && <span className="field-error">{errors.stock}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            name="category"
            type="text"
            value={form.category}
            onChange={handleChange}
            placeholder="Optional category"
            maxLength={100}
          />
        </div>

        <div className="form-group form-checkbox">
          <label>
            <input
              name="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={handleChange}
            />
            Active
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-cancel" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-submit" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}