'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TransactionsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])

  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [type, setType] = useState('sale')

  const fetchData = async () => {
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

    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', profile.company_id)

    const { data: transactionsData } = await supabase
      .from('transactions')
      .select(`
        *,
        products(name)
      `)
      .eq('company_id', profile.company_id)
      .order('created_at', {
        ascending: false
      })

    setProducts(productsData || [])
    setTransactions(transactionsData || [])
  }

  const addTransaction = async () => {
    if (!productId || !quantity) return

    const qty = Number(quantity)

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

    const selectedProduct = products.find(
      (p) => p.id === productId
    )

    if (!selectedProduct) return

    let newQty = Number(selectedProduct.quantity)

    if (type === 'sale') {
      newQty -= qty

      if (newQty < 0) {
        alert('Not enough stock')
        return
      }
    } else {
      newQty += qty
    }

    await supabase
      .from('products')
      .update({
        quantity: newQty
      })
      .eq('id', productId)

    await supabase
      .from('transactions')
      .insert([
        {
          company_id: profile.company_id,
          product_id: productId,
          quantity: qty,
          transaction_type: type
        }
      ])

    setQuantity('')
    setProductId('')

    fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div>
      <h1
        style={{
          fontSize: '34px',
          marginBottom: '20px'
        }}
      >
        💰 Transactions
      </h1>

      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '14px',
          marginBottom: '25px',
          boxShadow:
            '0 4px 10px rgba(0,0,0,0.05)'
        }}
      >
        <select
          value={productId}
          onChange={(e) =>
            setProductId(e.target.value)
          }
          style={{
            padding: '10px',
            marginRight: '10px'
          }}
        >
          <option value="">
            Select Product
          </option>

          {products.map((p) => (
            <option
              key={p.id}
              value={p.id}
            >
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value)
          }
          style={{
            padding: '10px',
            marginRight: '10px'
          }}
        >
          <option value="sale">
            Sale
          </option>

          <option value="purchase">
            Purchase
          </option>
        </select>

        <input
          placeholder="Quantity"
          value={quantity}
          onChange={(e) =>
            setQuantity(e.target.value)
          }
          style={{
            padding: '10px',
            marginRight: '10px'
          }}
        />

        <button
          onClick={addTransaction}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Save Transaction
        </button>
      </div>

      <div
        style={{
          background: 'white',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow:
            '0 4px 10px rgba(0,0,0,0.05)'
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
              <th style={{ padding: '14px' }}>
                Type
              </th>

              <th style={{ padding: '14px' }}>
                Product
              </th>

              <th style={{ padding: '14px' }}>
                Quantity
              </th>

              <th style={{ padding: '14px' }}>
                Date
              </th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((t) => (
              <tr
                key={t.id}
                style={{
                  borderTop:
                    '1px solid #e5e7eb'
                }}
              >
                <td
                  style={{
                    padding: '14px',
                    textAlign: 'center'
                  }}
                >
                  <span
                    style={{
                      color:
                        t.transaction_type ===
                        'sale'
                          ? '#dc2626'
                          : '#16a34a',
                      fontWeight: 'bold'
                    }}
                  >
                    {t.transaction_type.toUpperCase()}
                  </span>
                </td>

                <td
                  style={{
                    padding: '14px',
                    textAlign: 'center'
                  }}
                >
                  {t.products?.name}
                </td>

                <td
                  style={{
                    padding: '14px',
                    textAlign: 'center'
                  }}
                >
                  {t.quantity}
                </td>

                <td
                  style={{
                    padding: '14px',
                    textAlign: 'center'
                  }}
                >
                  {new Date(
                    t.created_at
                  ).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}