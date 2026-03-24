import { useState } from 'react'
import ProductList from './components/ProductList.jsx'
import ProductForm from './components/ProductForm.jsx'
import './App.css'

export default function App() {
  const [view, setView] = useState('list')
  const [editingProduct, setEditingProduct] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  function handleAdd() {
    setEditingProduct(null)
    setView('form')
  }

  function handleEdit(product) {
    setEditingProduct(product)
    setView('form')
  }

  function handleSaved() {
    setRefreshKey(k => k + 1)
    setView('list')
  }

  function handleCancel() {
    setView('list')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Product Catalog</h1>
      </header>
      <main className="app-main">
        {view === 'list' && (
          <ProductList
            key={refreshKey}
            onAdd={handleAdd}
            onEdit={handleEdit}
          />
        )}
        {view === 'form' && (
          <ProductForm
            product={editingProduct}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        )}
      </main>
    </div>
  )
}