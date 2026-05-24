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
  const [search, setSearch] = useState('')

  // Fetch products
  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')

    setProducts(data || [])
  }

  // Add product
  const addProduct = async () => {
    const { data: userData } =
      await supabase.auth.getUser()

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
        company_id: profile.company_id
      }
    ])

    setName('')
    setQuantity('')

    fetchProducts()
  }

  // Fetch role + realtime
  useEffect(() => {
    const fetchRole = async () => {
      const { data: userData } =
        await supabase.auth.getUser()

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
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchProducts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  // Stats
  const totalProducts = products.length

  const totalQuantity = products.reduce(
    (sum, p) => sum + Number(p.quantity),
    0
  )

  const lowStock = products.filter(
    (p) => Number(p.quantity) < 5
  ).length

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const lowStockProducts = products.filter(
    (p) => Number(p.quantity) < 5
  )

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: 'Inter, system-ui, sans-serif',
        backgroundColor: '#f1f5f9'
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: '240px',
          background:
            'linear-gradient(to bottom, #0f172a, #1e293b)',
          color: 'white',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          borderRight:
            '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <h2
          style={{
            marginBottom: '40px',
            fontSize: '28px',
            fontWeight: 'bold'
          }}
        >
          📦 StockFlow
        </h2>

        {/* Sidebar Buttons */}
        {['📦 Dashboard', '🛒 Products', '📊 Reports'].map(
          (item, index) => (
            <div
              key={index}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  '#475569'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  '#334155'
              }}
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                backgroundColor: '#334155',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: '600',
                fontSize: '15px',
                marginBottom: '14px'
              }}
            >
              {item}
            </div>
          )
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: 'auto',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '15px',
            transition: 'all 0.2s ease'
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: '30px',
          overflowX: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '18px',
            marginBottom: '30px'
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '34px',
                fontWeight: '700',
                margin: 0,
                color: '#111827'
              }}
            >
              Inventory Dashboard
            </h1>

            <p
              style={{
                marginTop: '6px',
                color: '#6b7280',
                fontSize: '15px'
              }}
            >
              Manage your products and inventory
              easily.
            </p>
          </div>

          {/* Profile */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'white',
              padding: '10px 16px',
              borderRadius: '14px',
              boxShadow:
                '0 6px 16px rgba(0,0,0,0.06)'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '18px'
              }}
            >
              {role.charAt(0).toUpperCase()}
            </div>

            <div>
              <div
                style={{
                  fontWeight: '700',
                  color: '#111827'
                }}
              >
                {role.toUpperCase()}
              </div>

              <div
                style={{
                  fontSize: '13px',
                  color: '#6b7280'
                }}
              >
                Welcome back 👋
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}
        >
          {[
            {
              title: 'Total Products',
              value: totalProducts,
              color: '#111827'
            },
            {
              title: 'Total Quantity',
              value: totalQuantity,
              color: '#111827'
            },
            {
              title: 'Low Stock',
              value: lowStock,
              color: 'red'
            }
          ].map((card, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '14px',
                boxShadow:
                  '0 6px 16px rgba(0,0,0,0.06)'
              }}
            >
              <h3>{card.title}</h3>

              <p
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: card.color
                }}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Low Stock Alerts */}
        {lowStockProducts.length > 0 && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '18px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}
          >
            <h3
              style={{
                color: '#b91c1c',
                marginBottom: '12px'
              }}
            >
              ⚠ Low Stock Alerts
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    color: '#991b1b',
                    fontWeight: '600'
                  }}
                >
                  {p.name} — Only {p.quantity} left
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div
          style={{
            marginBottom: '20px'
          }}
        >
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid #d1d5db',
              fontSize: '16px',
              outline: 'none',
              backgroundColor: 'white',
              boxShadow:
                '0 2px 8px rgba(0,0,0,0.04)'
            }}
          />
        </div>

        {/* Add Product */}
        {role === 'admin' && (
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
              onChange={(e) =>
                setName(e.target.value)
              }
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
              onChange={(e) =>
                setQuantity(e.target.value)
              }
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
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Add Product
            </button>
          </div>
        )}

        {/* Product List */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          {filteredProducts.length === 0 ? (
            <div
              style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '14px',
                textAlign: 'center',
                color: '#6b7280',
                boxShadow:
                  '0 4px 10px rgba(0,0,0,0.05)'
              }}
            >
              <h2
                style={{
                  marginBottom: '10px'
                }}
              >
                📦 No products found
              </h2>

              <p>
                Add your first product to get
                started.
              </p>
            </div>
          ) : (
            filteredProducts.map((p) => (
              <div
                key={p.id}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    'translateY(-3px)'

                  e.currentTarget.style.boxShadow =
                    '0 8px 20px rgba(0,0,0,0.10)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    'translateY(0px)'

                  e.currentTarget.style.boxShadow =
                    '0 4px 10px rgba(0,0,0,0.06)'
                }}
                style={{
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '15px',
                  boxShadow:
                    '0 4px 10px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer'
                }}
              >
                {editingId !== p.id ? (
                  <>
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '20px',
                          fontWeight: '600',
                          color: '#111827'
                        }}
                      >
                        {p.name}
                      </h3>

                      <div
                        style={{
                          marginTop: '8px',
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
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        Qty: {p.quantity}
                      </div>
                    </div>

                    {role === 'admin' && (
                      <div
                        style={{
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'center'
                        }}
                      >
                        <button
                          onClick={() => {
                            setEditingId(p.id)
                            setEditQuantity(
                              p.quantity
                            )
                          }}
                          style={{
                            backgroundColor:
                              'orange',
                            color: 'white',
                            padding: '8px 14px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition:
                              'all 0.2s ease'
                          }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={async () => {
                            await supabase
                              .from('products')
                              .delete()
                              .eq('id', p.id)

                            fetchProducts()
                          }}
                          style={{
                            backgroundColor:
                              'red',
                            color: 'white',
                            padding: '8px 14px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition:
                              'all 0.2s ease'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <input
                      value={editQuantity}
                      onChange={(e) =>
                        setEditQuantity(
                          e.target.value
                        )
                      }
                      style={{
                        padding: '8px',
                        width: '80px',
                        borderRadius: '8px',
                        border:
                          '1px solid #d1d5db'
                      }}
                    />

                    <div
                      style={{
                        display: 'flex',
                        gap: '10px'
                      }}
                    >
                      <button
                        onClick={async () => {
                          await supabase
                            .from('products')
                            .update({
                              quantity:
                                Number(
                                  editQuantity
                                )
                            })
                            .eq('id', p.id)

                          setEditingId(null)

                          fetchProducts()
                        }}
                        style={{
                          backgroundColor:
                            'green',
                          color: 'white',
                          padding: '8px 14px',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition:
                            'all 0.2s ease'
                        }}
                      >
                        Save
                      </button>

                      <button
                        onClick={() =>
                          setEditingId(null)
                        }
                        style={{
                          backgroundColor:
                            'gray',
                          color: 'white',
                          padding: '8px 14px',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition:
                            'all 0.2s ease'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}