'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function EmployeeSignupPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] =
    useState('')

  const handleSignup = async () => {
    if (!email || !password) {
      alert('Fill all fields')
      return
    }

    // Check invite exists

    const { data: invite } =
      await supabase
        .from('employee_invites')
        .select('*')
        .eq('email', email)
        .single()

    if (!invite) {
      alert(
        'You are not invited to any company'
      )
      return
    }

    // Create auth user

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password
      })

    if (error) {
      alert(error.message)
      return
    }

    const user = data.user

    if (!user) {
      alert('Signup failed')
      return
    }

    // Create profile

    const { error: profileError } =
      await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            company_id:
              invite.company_id,
            role: invite.role
          }
        ])

    if (profileError) {
      alert(profileError.message)
      return
    }

    alert(
      'Employee account created successfully'
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
          'linear-gradient(to bottom right,#0f172a,#1e293b)'
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '18px',
          width: '400px'
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            marginBottom: '25px',
            color: '#111827'
          }}
        >
          Employee Signup
        </h1>

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
          style={buttonStyle}
        >
          Create Account
        </button>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '15px',
  borderRadius: '8px',
  border: '1px solid #d1d5db'
}

const buttonStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer'
}