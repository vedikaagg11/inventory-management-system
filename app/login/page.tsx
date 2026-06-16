'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      alert(error.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background:
          'linear-gradient(to bottom right, #0f172a, #1e293b)',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '16px',
          width: '350px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            marginBottom: '30px',
            color: '#111827'
          }}
        >
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '16px',
            borderRadius: '8px',
            border: '1px solid #d1d5db'
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px',
            borderRadius: '8px',
            border: '1px solid #d1d5db'
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Login
        </button>

<p style={{ marginTop: '15px' }}>
  New employee?
  <a
    href="/employee-signup"
    style={{
      color: '#2563eb',
      marginLeft: '5px'
    }}
  >
    Create Account
  </a>
</p>

<p
  style={{
    marginTop: '15px',
    textAlign: 'center'
  }}
>
  Employee joining a company?

  <br />

  <a
    href="/employee-signup"
    style={{
      color: '#2563eb'
    }}
  >
    Create Employee Account
  </a>
</p>

      </div>
    </div>
  )
}