'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AIPage() {
  const [products, setProducts] = useState<any[]>([])
  const [question, setQuestion] = useState('')
  const [chatOpen, setChatOpen] = useState(false)

  const [messages, setMessages] = useState<
    {
      role: string
      text: string
    }[]
  >([])

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
        transactions(
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
        recommendation:
          'No Sales History',
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

  const fastestMovingProduct =
    [...products].sort(
      (a, b) =>
        getForecast(b).sales -
        getForecast(a).sales
    )[0]

  const mostValuableProduct =
    [...products].sort(
      (a, b) =>
        Number(b.quantity) *
          Number(b.price || 0) -
        Number(a.quantity) *
          Number(a.price || 0)
    )[0]

  const deadStockProducts =
    products.filter(
      (p) =>
        getForecast(p).sales === 0
    )

  const lowStockProducts =
    products.filter(
      (p) => Number(p.quantity) < 5
    )

  const aiSummary =
    totalRiskProducts === 0
      ? 'Inventory is healthy. No urgent restocking required.'
      : `${totalRiskProducts} product(s) require immediate attention and restocking.`

  const askAssistant = () => {
    if (!question.trim()) return

    const q =
      question.toLowerCase()

    let answer =
      'Sorry, I do not understand that question.'

    if (
      q.includes('low stock') ||
      q.includes('restock')
    ) {
      answer =
        lowStockProducts.length === 0
          ? 'All products are sufficiently stocked.'
          : lowStockProducts
              .map(
                (p) =>
                  `${p.name} (${p.quantity} left)`
              )
              .join(', ')
    } else if (
      q.includes('inventory value')
    ) {
      const value =
        products.reduce(
          (sum, p) =>
            sum +
            Number(p.quantity) *
              Number(p.price || 0),
          0
        )

      answer =
        `Total inventory value is ₹${value}`
    } else if (
      q.includes('highest stock') ||
      q.includes('best product')
    ) {
      answer = criticalProduct
        ? `${criticalProduct.name}`
        : 'No products found.'
    } else if (
      q.includes('health')
    ) {
      answer =
        `Inventory health is ${inventoryHealth}%`
    } else if (
      q.includes('fastest')
    ) {
      answer =
        fastestMovingProduct
          ? `${fastestMovingProduct.name} is the fastest moving product`
          : 'No data available.'
    } else if (
      q.includes('dead stock')
    ) {
      answer =
        deadStockProducts.length === 0
          ? 'No dead stock products found.'
          : deadStockProducts
              .map(
                (p) => p.name
              )
              .join(', ')
    }

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: question
      },
      {
        role: 'assistant',
        text: answer
      }
    ])

    setQuestion('')
  }

  /*const totalRiskProducts =
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
  
  const fastestMovingProduct = [...products].sort(
    (a, b) =>
    getForecast(b).sales -
    getForecast(a).sales
  )[0]

  const mostValuableProduct = [...products].sort(
    (a, b) =>
    Number(b.quantity) *
    Number(b.price || 0) -
    Number(a.quantity) *
    Number(a.price || 0)
  )[0]

  const aiSummary =
  totalRiskProducts === 0
    ? 'Inventory is healthy. No urgent restocking required.'
    : `${totalRiskProducts} product(s) require immediate attention and restocking.`*/

    return (
    <div style={{ padding: '30px' }}>
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
          background: '#eff6ff',
          padding: '20px',
          borderRadius: '14px',
          marginBottom: '25px',
          border: '1px solid #bfdbfe'
        }}
      >
        <h2>🧠 AI Summary</h2>

        <p>{aiSummary}</p>

        {fastestMovingProduct && (
          <p>
            🔥 Fastest Moving Product:
            {' '}
            {fastestMovingProduct.name}
          </p>
        )}

        {mostValuableProduct && (
          <p>
            💎 Most Valuable Product:
            {' '}
            {mostValuableProduct.name}
          </p>
        )}
      </div>

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

        <Card
          title="Dead Stock"
          value={deadStockProducts.length}
        />
      </div>

      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '14px',
          marginBottom: '20px'
        }}
      >
        <h2>🚨 Highest Risk Product</h2>

        {criticalProduct ? (
          <p>{criticalProduct.name}</p>
        ) : (
          <p>No products found</p>
        )}
      </div>

      {lowStockProducts.length > 0 && (
        <div
          style={{
            background: '#fef2f2',
            padding: '20px',
            borderRadius: '14px',
            marginBottom: '25px'
          }}
        >
          <h2>⚠ Low Stock Alerts</h2>

          {lowStockProducts.map((p) => (
            <p key={p.id}>
              {p.name} - Only {p.quantity} left
            </p>
          ))}
        </div>
      )}

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
                backgroundColor: '#f8fafc'
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

      <button
        onClick={() =>
          setChatOpen(!chatOpen)
        }
        style={{
          position: 'fixed',
          right: '25px',
          bottom: '25px',
          width: '65px',
          height: '65px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: '#2563eb',
          color: 'white',
          fontSize: '28px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        🤖
      </button>

      {chatOpen && (
        <div
          style={{
            position: 'fixed',
            right: '25px',
            bottom: '100px',
            width: '350px',
            height: '500px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow:
              '0 10px 30px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor:
                '#2563eb',
              color: 'white',
              padding: '15px',
              fontWeight: 'bold'
            }}
          >
            AI Inventory Assistant
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '15px'
            }}
          >
            {messages.map(
              (m, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom:
                      '12px',
                    textAlign:
                      m.role ===
                      'user'
                        ? 'right'
                        : 'left'
                  }}
                >
                  <span
                    style={{
                      backgroundColor:
                        m.role ===
                        'user'
                          ? '#2563eb'
                          : '#f3f4f6',
                      color:
                        m.role ===
                        'user'
                          ? 'white'
                          : 'black',
                      padding:
                        '8px 12px',
                      borderRadius:
                        '12px',
                      display:
                        'inline-block'
                    }}
                  >
                    {m.text}
                  </span>
                </div>
              )
            )}
          </div>

          <div
            style={{
              padding: '12px',
              borderTop:
                '1px solid #e5e7eb'
            }}
          >
            <input
              value={question}
              onChange={(e) =>
                setQuestion(
                  e.target.value
                )
              }
              placeholder="Ask something..."
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border:
                  '1px solid #d1d5db',
                borderRadius: '8px'
              }}
            />

            <button
              onClick={
                askAssistant
              }
              style={{
                width: '100%',
                backgroundColor:
                  '#2563eb',
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Ask AI
            </button>
          </div>
        </div>
      )}
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

      <h2>{value}</h2>
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