'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([])
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [role, setRole] = useState('')

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*')
    setProducts(data || [])
  }

  const addProduct = async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', userData.user.id)
      .single()

    await supabase.from('products').insert([
      {
        name,
        quantity: Number(quantity),
        company_id: profile.company_id,
      },
    ])

    setName('')
    setQuantity('')
    fetchProducts()
  }

  useEffect(() => {
    const fetchRole = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single()

      setRole(profile?.role || '')
    }

    fetchRole()
    fetchProducts()

    const channel = supabase
      .channel('realtime products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchProducts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '40px auto',
        padding: '20px',
        fontFamily: 'Arial'
      }}
    >
      {/* 🔹 Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Inventory Dashboard</h1>

        <button
          onClick={handleLogout}
          style={{
            backgroundColor: 'black',
            color: 'white',
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* 🔥 Add Product (STEP 3 applied here) */}
      {role === 'admin' && (
        <div
          style={{
            marginBottom: '20px',
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '6px'
          }}
        >
          <input
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: '8px', marginRight: '10px' }}
          />

          <input
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{ padding: '8px', marginRight: '10px', width: '80px' }}
          />

          <button
            onClick={addProduct}
            style={{
              backgroundColor: 'blue',
              color: 'white',
              padding: '8px 14px',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Add Product
          </button>
        </div>
      )}

      {/* 🔹 Product List (STEP 4 applied here) */}
      {products.map((p) => (
        <div
          key={p.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
            padding: '10px',
            borderRadius: '6px',
            backgroundColor: '#f9f9f9'
          }}
        >
          {editingId !== p.id ? (
            <>
              <span>{p.name} - {p.quantity}</span>

              {role === 'admin' && (
                <button
                  onClick={() => {
                    setEditingId(p.id)
                    setEditQuantity(p.quantity)
                  }}
                  style={{
                    backgroundColor: 'orange',
                    color: 'white',
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                >
                  Edit
                </button>
              )}

              {role === 'admin' && (
                <button
                  onClick={async () => {
                    await supabase.from('products').delete().eq('id', p.id)
                    fetchProducts()
                  }}
                  style={{
                    backgroundColor: 'red',
                    color: 'white',
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                >
                  Delete
                </button>
              )}
            </>
          ) : (
            <>
              <input
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
                style={{ padding: '5px', width: '60px' }}
              />

              <button
                onClick={async () => {
                  await supabase
                    .from('products')
                    .update({ quantity: Number(editQuantity) })
                    .eq('id', p.id)

                  setEditingId(null)
                  fetchProducts()
                }}
                style={{
                  backgroundColor: 'green',
                  color: 'white',
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Save
              </button>

              <button
                onClick={() => setEditingId(null)}
                style={{
                  backgroundColor: 'gray',
                  color: 'white',
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}