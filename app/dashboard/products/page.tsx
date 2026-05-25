'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [search, setSearch] = useState('')

  // Fetch Products
  const fetchProducts = async () => {
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

    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', profile.company_id)

    setProducts(data || [])
  }

  // Add Product
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
        company_id: profile.company_id
      }
    ])

    setName('')
    setQuantity('')

    fetchProducts()
  }

  // Delete Product
  const deleteProduct = async (id: string) => {
    await supabase
      .from('products')
      .delete()
      .eq('id', id)

    fetchProducts()
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
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
      {/* Header */}
      <div
        style={{
          marginBottom: '30px'
        }}
      >
        <h1
          style={{
            fontSize: '34px',
            color: '#111827',
            marginBottom: '10px'
          }}
        >
          🛒 Products
        </h1>

        <p
          style={{
            color: '#6b7280'
          }}
        >
          Manage your inventory products here.
        </p>
      </div>

      {/* Search */}
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
          marginBottom: '20px',
          fontSize: '15px'
        }}
      />

      {/* Add Product */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '14px',
          marginBottom: '25px',
          boxShadow:
            '0 4px 10px rgba(0,0,0,0.05)'
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

      {/* Product Cards */}
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
              padding: '24px',
              borderRadius: '16px',
              boxShadow:
                '0 4px 10px rgba(0,0,0,0.06)'
            }}
          >
            <h2
              style={{
                marginBottom: '12px',
                color: '#111827'
              }}
            >
              {p.name}
            </h2>

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
                marginBottom: '20px'
              }}
            >
              Qty: {p.quantity}
            </div>

            <button
              onClick={() => deleteProduct(p.id)}
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
          </div>
        ))}
      </div>
    </div>
  )
}