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
      .select('*')
      .eq('company_id', profile.company_id)

    setProducts(data || [])
  }

  const getRecommendation = (qty: number) => {
    if (qty <= 3)
      return {
        text: '🚨 Reorder Immediately',
        color: '#dc2626'
      }

    if (qty <= 10)
      return {
        text: '⚠ Low Stock Warning',
        color: '#d97706'
      }

    return {
      text: '✅ Stock Healthy',
      color: '#16a34a'
    }
  }

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
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Quantity</th>
              <th style={thStyle}>AI Recommendation</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => {
              const recommendation =
                getRecommendation(
                  Number(p.quantity)
                )

              return (
                <tr key={p.id}>
                  <td style={tdStyle}>
                    {p.name}
                  </td>

                  <td style={tdStyle}>
                    {p.quantity}
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        color:
                          recommendation.color,
                        fontWeight: 'bold'
                      }}
                    >
                      {recommendation.text}
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

const thStyle = {
  padding: '14px',
  textAlign: 'left' as const
}

const tdStyle = {
  padding: '14px'
}