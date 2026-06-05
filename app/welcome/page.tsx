'use client'

import { useRouter } from 'next/navigation'

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div
      style={{
        height: '100vh',
        background:
          'linear-gradient(to bottom right, #0f172a, #1e293b)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <div
        style={{
          textAlign: 'center'
        }}
      >
        <div
          style={{
            fontSize: '70px',
            marginBottom: '20px'
          }}
        >
          📦
        </div>

        <h1
          style={{
            fontSize: '52px',
            marginBottom: '10px'
          }}
        >
          StockFlow
        </h1>

        <p
          style={{
            color: '#cbd5e1',
            marginBottom: '40px'
          }}
        >
          Smart Inventory Management System
        </p>

        <div
          style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center'
          }}
        >
          <button
            onClick={() => router.push('/signup')}
            style={{
              padding: '14px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Register Company
          </button>

          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '14px 24px',
              backgroundColor: '#334155',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}