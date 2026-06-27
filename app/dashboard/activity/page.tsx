'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ActivityPage() {
const [transactions, setTransactions] = useState<any[]>([])

useEffect(() => {
fetchTransactions()
}, [])

const fetchTransactions = async () => {
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
  .from('transactions')
  .select(`
    *,
    products(name)
  `)
  .eq('company_id', profile.company_id)
  .order('created_at', {
    ascending: false
  })

setTransactions(data || [])


}

return (
<div
style={{
padding: '30px'
}}
>
<h1
style={{
fontSize: '34px',
marginBottom: '25px'
}}
>
📜 Activity History </h1>


  <div
    style={{
      background: 'white',
      borderRadius: '14px',
      padding: '20px'
    }}
  >
    {transactions.length === 0 ? (
      <p>No activity found</p>
    ) : (
      transactions.map((t) => (
        <div
          key={t.id}
          style={{
            padding: '15px',
            borderBottom:
              '1px solid #e5e7eb'
          }}
        >
          <h3>
            {t.transaction_type ===
            'purchase'
              ? '📦 Purchase'
              : '🛒 Sale'}
          </h3>

          <p>
            Product:
            {' '}
            {t.products?.name}
          </p>

          <p>
            Quantity:
            {' '}
            {t.quantity}
          </p>

          <p>
            Date:
            {' '}
            {new Date(
              t.created_at
            ).toLocaleString()}
          </p>
        </div>
      ))
    )}
  </div>
</div>


)
}
