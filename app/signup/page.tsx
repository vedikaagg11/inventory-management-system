'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      return
    }

    const user = data.user

    // 1. Create company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([{ name: 'My Company' }])
      .select()
      .single()

    if (companyError) {
      alert(companyError.message)
      return
    }

    // 2. Create profile
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: user?.id,
        company_id: company.id,
        role: 'admin',
      },
    ])

    if (profileError) {
      alert(profileError.message)
      return
    }

    alert('Signup successful 🚀')
  }

  return (
    <div className="p-10">
      <h1>Signup</h1>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 block mb-2"
      />

      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 block mb-2"
      />

      <button onClick={handleSignup} className="bg-blue-500 text-white p-2">
        Signup
      </button>
    </div>
  )
}