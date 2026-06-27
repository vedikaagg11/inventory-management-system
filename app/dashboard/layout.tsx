'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const [role, setRole] = useState('')

  useEffect(() => {
  fetchRole()
}, [])

const fetchRole = async () => {
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (data) {
    setRole(data.role)
  }
}

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const navItems = [
  {
    name: 'Dashboard',
    icon: '📦',
    href: '/dashboard'
  },
  {
    name: 'Products',
    icon: '🛒',
    href: '/dashboard/products'
  },
  {
    name: 'Transactions',
    icon: '💰',
    href: '/dashboard/transactions'
  },
  {
    name: 'AI',
    icon: '🤖',
    href: '/dashboard/ai'
  },

  ...(role === 'admin'
    ? [
        {
          name: 'Customers',
          icon: '👥',
          href: '/dashboard/customers'
        },
        {
          name: 'Vendors',
          icon: '🏢',
          href: '/dashboard/vendors'
        },
        {
          name: 'Reports',
          icon: '📊',
          href: '/dashboard/reports'
        },
        {
          name: 'Activity',
          icon: '📜',
          href: '/dashboard/activity'
        },
        {
          name: 'Employees',
          icon: '👨‍💼',
          href: '/dashboard/employees'
        }
      ]
    : [])
]

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: '250px',
          background:
            'linear-gradient(to bottom, #0f172a, #1e293b)',
          color: 'white',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            marginBottom: '40px',
            textAlign: 'center'
          }}
        >
          📦 StockFlow
        </h1>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'white',
                backgroundColor:
                  pathname === item.href
                    ? '#2563eb'
                    : '#334155',
                fontWeight: '600',
                transition: '0.2s'
              }}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </div>

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
            fontWeight: '600'
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: '30px'
        }}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#fff'
            }
          }}
        />
      </div>
    </div>
  )
}