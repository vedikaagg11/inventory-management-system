'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div
      style={{
        height: '100vh',
        background:
          'linear-gradient(to bottom right, #0f172a, #1e293b)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        color: 'white',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontSize: '70px',
          marginBottom: '20px'
        }}
      >
        📦
      </div>

      {/* App Name */}
      <h1
        style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '10px'
        }}
      >
        StockFlow
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontSize: '18px',
          color: '#cbd5e1',
          marginBottom: '40px'
        }}
      >
        Smart Inventory Management System
      </p>

      {/* Loader */}
      <div
        style={{
          width: '50px',
          height: '50px',
          border: '5px solid #334155',
          borderTop: '5px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}