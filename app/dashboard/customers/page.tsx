'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [search, setSearch] = useState('')

  const [editingId, setEditingId] =
    useState<string | null>(null)

  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')

  const fetchCustomers = async () => {
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
      .from('customers')
      .select('*')
      .eq('company_id', profile.company_id)

    setCustomers(data || [])
  }

  const addCustomer = async () => {
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

    await supabase.from('customers').insert([
      {
        name,
        email,
        phone,
        company_id: profile.company_id
      }
    ])

    setName('')
    setEmail('')
    setPhone('')

    fetchCustomers()
  }

  const deleteCustomer = async (
    id: string
  ) => {
    await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    fetchCustomers()
  }

  const updateCustomer = async (
    id: string
  ) => {
    await supabase
      .from('customers')
      .update({
        name: editName,
        email: editEmail,
        phone: editPhone
      })
      .eq('id', id)

    setEditingId(null)

    fetchCustomers()
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const filteredCustomers =
    customers.filter((c) =>
      c.name
        .toLowerCase()
        .includes(search.toLowerCase())
    )

  return (
    <div>
      <h1
        style={{
          fontSize: '34px',
          marginBottom: '20px'
        }}
      >
        👥 Customers
      </h1>

      <input
        type="text"
        placeholder="Search customers..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '10px',
          border: '1px solid #d1d5db'
        }}
      />

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
        <input
          placeholder="Customer Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          style={{
            padding: '10px',
            marginRight: '10px'
          }}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            padding: '10px',
            marginRight: '10px'
          }}
        />

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
          style={{
            padding: '10px',
            marginRight: '10px'
          }}
        />

        <button
          onClick={addCustomer}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Add Customer
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(300px,1fr))',
          gap: '20px'
        }}
      >
        {filteredCustomers.map((c) => (
          <div
            key={c.id}
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '14px',
              boxShadow:
                '0 4px 10px rgba(0,0,0,0.05)'
            }}
          >
            {editingId === c.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) =>
                    setEditName(
                      e.target.value
                    )
                  }
                  style={{
                    width: '100%',
                    marginBottom: '10px',
                    padding: '8px'
                  }}
                />

                <input
                  value={editEmail}
                  onChange={(e) =>
                    setEditEmail(
                      e.target.value
                    )
                  }
                  style={{
                    width: '100%',
                    marginBottom: '10px',
                    padding: '8px'
                  }}
                />

                <input
                  value={editPhone}
                  onChange={(e) =>
                    setEditPhone(
                      e.target.value
                    )
                  }
                  style={{
                    width: '100%',
                    marginBottom: '10px',
                    padding: '8px'
                  }}
                />

                <button
                  onClick={() =>
                    updateCustomer(c.id)
                  }
                  style={{
                    background: '#22c55e',
                    color: 'white',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '8px'
                  }}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <h2>{c.name}</h2>

                <p>{c.email}</p>

                <p>{c.phone}</p>

                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '15px'
                  }}
                >
                  <button
                    onClick={() => {
                      setEditingId(c.id)
                      setEditName(c.name)
                      setEditEmail(c.email)
                      setEditPhone(c.phone)
                    }}
                    style={{
                      background: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px'
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteCustomer(c.id)
                    }
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}