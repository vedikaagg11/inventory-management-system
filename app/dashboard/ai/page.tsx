'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AIPage() {
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
      .select(`
        *,
        transactions (
          quantity,
          transaction_type,
          created_at
        )
      `)
      .eq('company_id', profile.company_id)

    setProducts(data || [])
  }

  const getForecast = (product: any) => {
    const sales =
      product.transactions?.filter(
        (t: any) =>
          t.transaction_type === 'sale'
      ) || []

    const totalSales = sales.reduce(
      (sum: number, t: any) =>
        sum + Number(t.quantity),
      0
    )

    if (totalSales === 0) {
      return {
        sales: 0,
        daysLeft: '∞',
        recommendation: 'No Sales History',
        color: '#6b7280',
        suggestedOrder: 0
      }
    }

    const avgDailyUsage =
      totalSales / 30

    const daysLeft = Math.round(
      product.quantity / avgDailyUsage
    )

    let recommendation = 'Healthy'
    let color = '#16a34a'

    if (daysLeft <= 30) {
      recommendation = 'Reorder Soon'
      color = '#d97706'
    }

    if (daysLeft <= 7) {
      recommendation =
        'Reorder Immediately'
      color = '#dc2626'
    }

    const suggestedOrder =
      Math.max(
        20,
        Math.ceil(avgDailyUsage * 30)
      )

    return {
      sales: totalSales,
      daysLeft,
      recommendation,
      color,
      suggestedOrder
    }
  }

  const totalRiskProducts =
    products.filter((p) => {
      const forecast =
        getForecast(p)

      return (
        forecast.recommendation ===
        'Reorder Immediately'
      )
    }).length

  const inventoryHealth =
    products.length === 0
      ? 100
      : Math.round(
          ((products.length -
            totalRiskProducts) /
            products.length) *
            100
        )

  const criticalProduct =
    [...products].sort((a, b) => {
      const fa = getForecast(a)
      const fb = getForecast(b)

      const da =
        fa.daysLeft === '∞'
          ? 999999
          : Number(fa.daysLeft)

      const db =
        fb.daysLeft === '∞'
          ? 999999
          : Number(fb.daysLeft)

      return da - db
    })[0]

  return (
    <div>
      <h1
        style={{
          fontSize: '34px',
          marginBottom: '25px'
        }}
      >
        🤖 AI Inventory Forecast
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(220px,1fr))',
          gap: '20px',
          marginBottom: '25px'
        }}
      >
        <Card
          title="Inventory Health"
          value={`${inventoryHealth}%`}
        />

        <Card
          title="Products Analysed"
          value={products.length}
        />

        <Card
          title="Critical Products"
          value={totalRiskProducts}
        />
      </div>

      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '14px',
          marginBottom: '25px'
        }}
      >
        <h2>🚨 Highest Risk Product</h2>

        {criticalProduct ? (
          <p>{criticalProduct.name}</p>
        ) : (
          <p>No products found</p>
        )}
      </div>

      <div
        style={{
          background: 'white',
          borderRadius: '14px',
          overflow: 'hidden'
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor:
                  '#f8fafc'
              }}
            >
              <th style={thStyle}>
                Product
              </th>
              <th style={thStyle}>
                Stock
              </th>
              <th style={thStyle}>
                Sales
              </th>
              <th style={thStyle}>
                Days Left
              </th>
              <th style={thStyle}>
                Suggested Order
              </th>
              <th style={thStyle}>
                Recommendation
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => {
              const forecast =
                getForecast(p)

              return (
                <tr key={p.id}>
                  <td style={tdStyle}>
                    {p.name}
                  </td>

                  <td style={tdStyle}>
                    {p.quantity}
                  </td>

                  <td style={tdStyle}>
                    {forecast.sales}
                  </td>

                  <td style={tdStyle}>
                    {forecast.daysLeft}
                  </td>

                  <td style={tdStyle}>
                    {
                      forecast.suggestedOrder
                    }
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        color:
                          forecast.color,
                        fontWeight:
                          'bold'
                      }}
                    >
                      {
                        forecast.recommendation
                      }
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Card({
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
      <p
        style={{
          color: '#6b7280',
          marginBottom: '10px'
        }}
      >
        {title}
      </p>

      <h2>
        {value}
      </h2>
    </div>
  )
}

const thStyle = {
  padding: '14px',
  textAlign: 'left' as const
}

const tdStyle = {
  padding: '14px'
}