'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()

  const [companyName, setCompanyName] = useState('')
  const [adminName, setAdminName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignup = async () => {
    if (
      !companyName ||
      !adminName ||
      !email ||
      !password
    ) {
      alert('Please fill all fields')
      return
    }

    // Create Auth User
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password
      })

    if (error) {
      alert(error.message)
      return
    }

    if (!data.user) {
      alert('Signup failed')
      return
    }

    const user = data.user

    // Create Company
    const {
      data: companyData,
      error: companyError
    } = await supabase
      .from('companies')
      .insert([
        {
          name: companyName
        }
      ])
      .select()
      .single()

    if (companyError) {
      alert(companyError.message)
      return
    }

    // Create Admin Profile
    const { error: profileError } =
      await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            company_id: companyData.id,
            name: adminName,
            email,
            role: 'admin'
          }
        ])

    if (profileError) {
      alert(profileError.message)
      return
    }

    alert(
      'Company registered successfully!'
    )

    router.push('/login')
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
          borderRadius: '18px',
          width: '400px',
          boxShadow:
            '0 10px 30px rgba(0,0,0,0.25)'
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            marginBottom: '30px',
            color: '#111827'
          }}
        >
          Register Company
        </h1>

        <input
          type="text"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) =>
            setCompanyName(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Admin Name"
          value={adminName}
          onChange={(e) =>
            setAdminName(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={inputStyle}
        />

        <button
          onClick={handleSignup}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          Register Company
        </button>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '16px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '15px'
}