'use client'

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
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')

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

  const totalProducts = products.length

  const totalQuantity = products.reduce(
    (sum, p) => sum + Number(p.quantity),
    0
  )

  const lowStock = products.filter(
    (p) => Number(p.quantity) < 5
  ).length

  const inventoryValue = products.reduce(
    (sum, p) =>
      sum +
      Number(p.quantity) *
        Number(p.price || 0),
    0
  )

  const lowStockProducts = products.filter(
    (p) => Number(p.quantity) < 5
  )

  const bestProduct = [...products].sort(
    (a, b) => b.quantity - a.quantity
  )[0]

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
        padding: '30px'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '34px',
              marginBottom: '8px'
            }}
          >
            Welcome Back 👋
          </h1>

          <p
            style={{
              color: '#6b7280'
            }}
          >
            Manage your inventory efficiently and track stock in real time
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            padding: '12px 18px',
            borderRadius: '12px',
            boxShadow:
              '0 4px 10px rgba(0,0,0,0.06)'
          }}
        >
          <strong>
            {role.toUpperCase()}
          </strong>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(220px,1fr))',
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
            title: 'Inventory Value',
            value: `₹${inventoryValue}`,
            color: '#2563eb'
          },
          {
            title: 'Low Stock',
            value: lowStock,
            color: '#ef4444'
          }
        ].map((card, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '14px',
              boxShadow:
                '0 4px 10px rgba(0,0,0,0.06)'
            }}
          >
            <h3>{card.title}</h3>

            <p
              style={{
                fontSize: '30px',
                fontWeight: 'bold',
                color: card.color
              }}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Best Product */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '14px',
          marginBottom: '25px',
          boxShadow:
            '0 4px 10px rgba(0,0,0,0.06)'
        }}
      >
        <h2>🏆 Best Stocked Product</h2>

        {bestProduct ? (
          <>
            <img
              src={
                bestProduct.image_url ||
                'https://via.placeholder.com/300'
              }
              alt={bestProduct.name}
              style={{
                width: '200px',
                borderRadius: '12px',
                marginTop: '15px'
              }}
            />

            <h3>{bestProduct.name}</h3>

            <p>
              Quantity:
              {' '}
              {bestProduct.quantity}
            </p>

            <p>
              Price:
              {' '}
              ₹{bestProduct.price}
            </p>
          </>
        ) : (
          <p>No products available</p>
        )}
      </div>

      {/* Sales Analytics */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '14px',
          marginBottom: '25px',
          boxShadow:
            '0 4px 10px rgba(0,0,0,0.06)'
        }}
      >
        <h2>📈 Sales Analytics</h2>

        <p
          style={{
            color: '#6b7280',
            marginBottom: '20px'
          }}
        >
          Monthly sales performance
        </p>

        <ResponsiveContainer
          width="100%"
          height={300}
        >
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

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '20px',
            borderRadius: '12px'
          }}
        >
          <h2
            style={{
              color: '#b91c1c'
            }}
          >
            ⚠ Low Stock Alerts
          </h2>

          {lowStockProducts.map((p) => (
            <div
              key={p.id}
              style={{
                backgroundColor: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '10px'
              }}
            >
              {p.name} — Only {p.quantity} left
            </div>
          ))}
        </div>
      )}
    </div>
  )
}