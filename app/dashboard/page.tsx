'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([])
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')
  const [companyId, setCompanyId] = useState('')

  // Fetch products
  const fetchProducts = async () => {
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return

  // Get logged user's company
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return

  setCompanyId(profile.company_id)

  // Fetch ONLY company products
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('company_id', profile.company_id)

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
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    window.location.href = '/login'
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return

  setRole(profile.role)
  setCompanyId(profile.company_id)
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

  const salesData = [
    { month: 'Jan', sales: 400 },
    { month: 'Feb', sales: 700 },
    { month: 'Mar', sales: 500 },
    { month: 'Apr', sales: 900 },
    { month: 'May', sales: 1200 },
    { month: 'Jun', sales: 800 }
  ]
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
        <div
  style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  }}
>
  <Link
    href="/dashboard"
    style={{
      padding: '14px 16px',
      borderRadius: '12px',
      backgroundColor: '#2563eb',
      color: 'white',
      textDecoration: 'none',
      fontWeight: '600'
    }}
  >
    📦 Dashboard
  </Link>

  <Link
    href="/dashboard/products"
    style={{
      padding: '14px 16px',
      borderRadius: '12px',
      backgroundColor: '#334155',
      color: 'white',
      textDecoration: 'none',
      fontWeight: '600'
    }}
  >
    🛒 Products
  </Link>

  <Link
    href="/dashboard/reports"
    style={{
      padding: '14px 16px',
      borderRadius: '12px',
      backgroundColor: '#334155',
      color: 'white',
      textDecoration: 'none',
      fontWeight: '600'
    }}
  >
    📊 Reports
  </Link>
</div>

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

{/* Sales Analytics */}
<div
  style={{
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '16px',
    marginBottom: '30px',
    boxShadow:
      '0 4px 10px rgba(0,0,0,0.06)'
  }}
>
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '10px'
    }}
  >
    <div>
      <h2
        style={{
          margin: 0,
          color: '#111827'
        }}
      >
        📈 Sales Overview
      </h2>

      <p
        style={{
          color: '#6b7280',
          marginTop: '6px'
        }}
      >
        Monthly sales performance
      </p>
    </div>

    <div
      style={{
        backgroundColor: '#dcfce7',
        color: '#166534',
        padding: '8px 14px',
        borderRadius: '999px',
        fontWeight: '600'
      }}
    >
      +12.5%
    </div>
  </div>

  <div
    style={{
      width: '100%',
      height: '300px'
    }}
  >
    <ResponsiveContainer>
      <LineChart data={salesData}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />

        <Line
          type="monotone"
          dataKey="sales"
          stroke="#2563eb"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
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
      </div>
    </div>
  )
}