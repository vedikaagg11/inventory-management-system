'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ReportsPage() {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    fetchProducts()
  }, [])

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

  const totalProducts = products.length

  const totalQuantity = products.reduce(
    (sum, p) => sum + Number(p.quantity),
    0
  )

  const inventoryValue = products.reduce(
    (sum, p) =>
      sum +
      Number(p.quantity) *
        Number(p.price || 0),
    0
  )

  const lowStockProducts = products.filter(
    (p) => p.quantity < 5
  )

  const topProduct =
    [...products].sort(
      (a, b) => b.quantity - a.quantity
    )[0]

  return (
    <div>
      <h1
        style={{
          fontSize: '34px',
          marginBottom: '25px'
        }}
      >
        📊 Reports
      </h1>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(220px,1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}
      >
        <ReportCard
          title="Total Products"
          value={totalProducts}
        />

        <ReportCard
          title="Total Quantity"
          value={totalQuantity}
        />

        <ReportCard
          title="Inventory Value"
          value={`₹ ${inventoryValue}`}
        />

        <ReportCard
          title="Low Stock Items"
          value={lowStockProducts.length}
        />
      </div>

      {/* Top Product */}
      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '14px',
          marginBottom: '25px'
        }}
      >
        <h2>🏆 Best Stocked Product</h2>

        {topProduct ? (
          <p>
            {topProduct.name} (
            {topProduct.quantity} units)
          </p>
        ) : (
          <p>No products available</p>
        )}
      </div>

      {/* Product Report Table */}
      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '14px'
        }}
      >
        <h2
          style={{
            marginBottom: '20px'
          }}
        >
          Product Report
        </h2>

        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total Value</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.quantity}</td>
                <td>₹ {p.price}</td>
                <td>
                  ₹{' '}
                  {Number(p.quantity) *
                    Number(p.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Low Stock Section */}
      <div
        style={{
          background: '#fef2f2',
          padding: '20px',
          borderRadius: '14px',
          marginTop: '25px'
        }}
      >
        <h2>⚠ Low Stock Report</h2>

        {lowStockProducts.length === 0 ? (
          <p>All products sufficiently stocked</p>
        ) : (
          lowStockProducts.map((p) => (
            <p key={p.id}>
              {p.name} - {p.quantity} left
            </p>
          ))
        )}
      </div>
    </div>
  )
}

function ReportCard({
  title,
  value
}: {
  title: string
  value: any
}) {
  return (
    <div
      style={{
        background: 'white',
        padding: '20px',
        borderRadius: '14px',
        boxShadow:
          '0 4px 10px rgba(0,0,0,0.05)'
      }}
    >
      <h3>{title}</h3>

      <p
        style={{
          fontSize: '28px',
          fontWeight: 'bold'
        }}
      >
        {value}
      </p>
    </div>
  )
}