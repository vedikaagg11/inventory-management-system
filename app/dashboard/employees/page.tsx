'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('employee')

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
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
      .from('employee_invites')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', {
        ascending: false
      })

    setEmployees(data || [])
  }

  const addEmployee = async () => {
    if (!name || !email) {
      alert('Fill all fields')
      return
    }

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

    const { error } = await supabase
      .from('employee_invites')
      .insert([
        {
          company_id: profile.company_id,
          name,
          email,
          role
        }
      ])

    if (error) {
      alert(error.message)
      return
    }

    setName('')
    setEmail('')
    setRole('employee')

    fetchEmployees()
  }

  const deleteEmployee = async (
    id: string
  ) => {
    const confirmDelete = confirm(
      'Delete employee?'
    )

    if (!confirmDelete) return

    await supabase
      .from('employee_invites')
      .delete()
      .eq('id', id)

    fetchEmployees()
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
        👥 Employees
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
        <h2
          style={{
            marginBottom: '15px'
          }}
        >
          Add Employee
        </h2>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          style={inputStyle}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={inputStyle}
        />

        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value)
          }
          style={inputStyle}
        >
          <option value="employee">
            Employee
          </option>

          <option value="admin">
            Admin
          </option>
        </select>

        <button
          onClick={addEmployee}
          style={buttonStyle}
        >
          Add Employee
        </button>
      </div>

      <div
        style={{
          background: 'white',
          borderRadius: '14px',
          overflow: 'hidden'
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
                backgroundColor:
                  '#f8fafc'
              }}
            >
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td style={tdStyle}>
                  {emp.name}
                </td>

                <td style={tdStyle}>
                  {emp.email}
                </td>

                <td style={tdStyle}>
                    <span
                        style={{
                        backgroundColor:
                            emp.role === 'admin'
                            ? '#dbeafe'
                            : '#dcfce7',
                        color:
                            emp.role === 'admin'
                            ? '#1d4ed8'
                            : '#166534',
                        padding: '6px 10px',
                        borderRadius: '999px',
                        fontWeight: '600'
                        }}
                    >
                        {emp.role}
                    </span>
                </td>

                <td style={tdStyle}>
                  <button
                    onClick={() =>
                      deleteEmployee(
                        emp.id
                      )
                    }
                    style={{
                      background:
                        '#dc2626',
                      color: 'white',
                      border: 'none',
                      padding:
                        '8px 12px',
                      borderRadius:
                        '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '12px',
  borderRadius: '8px',
  border: '1px solid #d1d5db'
}

const buttonStyle = {
  backgroundColor: '#2563eb',
  color: 'white',
  border: 'none',
  padding: '12px 16px',
  borderRadius: '8px',
  cursor: 'pointer'
}

const thStyle = {
  padding: '14px',
  textAlign: 'left' as const
}

const tdStyle = {
  padding: '14px'
}