'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
'''import toast from 'react-hot-toast''''

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [category, setCategory] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editQuantity, setEditQuantity] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editCategory, setEditCategory] = useState('')

  const fetchProducts = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single()

    if (!profile) return
    setRole(profile.role)

    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', profile.company_id)

    setProducts(data || [])
  }

  const addProduct = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!profile) return

    await supabase.from('products').insert([
      {
        name,
        quantity: Number(quantity),
        price: Number(price),
        category,
        image_url: imageUrl,
        company_id: profile.company_id
      }
    ])

    setName('')
    setQuantity('')
    setPrice('')
    setCategory('')
    setImageUrl('')

    fetchProducts()
  }

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    fetchProducts()
  }

  const updateProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .update({
        name: editName,
        quantity: Number(editQuantity),
        price: Number(editPrice),
        category: editCategory
      })
      .eq('id', id)
    if (error) {
      alert(error.message)
      return
    }

    setEditingId(null)
    setEditCategory('')
    fetchProducts()
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(
    (p) => {
      const matchSearch =
        p.name
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchCategory =
        categoryFilter === ''
          ? true
          : p.category === categoryFilter

      return (
        matchSearch &&
        matchCategory
      )
    }
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        padding: '40px',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <div style={{ marginBottom: '30px' }}>
        <h1
          style={{
            fontSize: '34px',
            color: '#111827',
            marginBottom: '10px'
          }}
        >
          🛒 Products
        </h1>

        <p style={{ color: '#6b7280' }}>
          Manage your inventory products here.
        </p>
      </div>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '14px',
          borderRadius: '10px',
          border: '1px solid #d1d5db',
          marginBottom: '20px'
        }}
      />

      <select
        value={categoryFilter}
        onChange={(e) =>
          setCategoryFilter(e.target.value)
        }
        style={{
          padding: '12px',
          borderRadius: '10px',
          border: '1px solid #d1d5db',
          marginBottom: '25px',
          marginLeft: '10px'
        }}
      >
        <option value="">
          All Categories
        </option>

        {[
          ...new Set(
            products.map(
              (p) => p.category
            )
          )
        ].map((category) => (
          <option
            key={category}
            value={category}
          >
            {category}
          </option>
        ))}
      </select>

      {role === 'admin' && (
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '14px',
            marginBottom: '25px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
          }}
        >
          <input
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: '10px',
              marginRight: '10px',
              borderRadius: '8px',
              border: '1px solid #d1d5db'
            }}
          />

          <input
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{
              padding: '10px',
              marginRight: '10px',
              width: '100px',
              borderRadius: '8px',
              border: '1px solid #d1d5db'
            }}
          />

          <input
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{
              padding: '10px',
              marginRight: '10px',
              width: '120px',
              borderRadius: '8px',
              border: '1px solid #d1d5db'
            }}
          />

          <input
            placeholder="Category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            style={{
              padding: '10px',
              marginRight: '10px',
              width: '150px',
              borderRadius: '8px',
              border: '1px solid #d1d5db'
            }}
          />

          <input
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={{
              padding: '10px',
              marginRight: '10px',
              width: '250px',
              borderRadius: '8px',
              border: '1px solid #d1d5db'
            }}
          />

          <button
            onClick={addProduct}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '10px 16px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Add Product
          </button>
        </div>
      )}  

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}
      >
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow:
                '0 4px 10px rgba(0,0,0,0.06)'
            }}
          >
            <img
              src={
                p.image_url ||
                'https://via.placeholder.com/300'
              }
              alt={p.name}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover'
              }}
            />

            <div style={{ padding: '20px' }}>
              {editingId === p.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) =>
                      setEditName(e.target.value)
                    }
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '10px'
                    }}
                  />

                  <input
                    value={editQuantity}
                    onChange={(e) =>
                      setEditQuantity(e.target.value)
                    }
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '10px'
                    }}
                  />

                  <input
                    value={editPrice}
                    onChange={(e) =>
                      setEditPrice(e.target.value)
                    }
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '10px'
                    }}
                  />
                  <input
                    placeholder="Category"
                    value={editCategory}
                    onChange={(e) =>
                      setEditCategory(e.target.value)
                    }
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '10px'
                    }}
                  />
                </>
              ) : (
                <>
                  <h2
                    style={{
                      marginBottom: '10px',
                      color: '#111827'
                    }}
                  >
                    {p.name}
                  </h2>

                  <p
                    style={{
                      color: '#6b7280',
                      marginBottom: '8px'
                    }}
                  >
                    Category: {p.category || 'General'}
                  </p>

                  <p
                    style={{
                      color: '#2563eb',
                      fontWeight: '700',
                      fontSize: '18px',
                      marginBottom: '10px'
                    }}
                  >
                    ₹ {p.price}
                  </p>

                  <div
                    style={{
                      display: 'inline-block',
                      backgroundColor:
                        p.quantity < 5
                          ? '#fee2e2'
                          : '#dcfce7',
                      color:
                        p.quantity < 5
                          ? '#b91c1c'
                          : '#166534',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      fontWeight: '600',
                      marginBottom: '16px'
                    }}
                  >
                    Qty: {p.quantity}
                  </div>
                </>
              )}

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '15px'
                }}
              >
                {editingId === p.id ? (
                  <button
                    onClick={() =>
                      updateProduct(p.id)
                    }
                    style={{
                      backgroundColor: '#22c55e',
                      color: 'white',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Save
                  </button>
                ) : role === 'admin' ? (
  <button
    onClick={() => {
      setEditingId(p.id)
      setEditName(p.name)
      setEditQuantity(String(p.quantity))
      setEditPrice(String(p.price || ''))
      setEditCategory(p.category || '')
    }}
    style={{
      backgroundColor: '#f59e0b',
      color: 'white',
      border: 'none',
      padding: '10px 14px',
      borderRadius: '8px',
      cursor: 'pointer'
    }}
  >
    Edit
  </button>
) : null
}
                {role === 'admin' && (
                  <button
                    onClick={() =>
                      deleteProduct(p.id)
                    }
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}







