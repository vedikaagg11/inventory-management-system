'use client'

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ReportsPage() {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    fetchProducts()

    const checkRole = async () => {
    const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    router.push('/dashboard')
  }
}

checkRole()
  }, [])

  const router = useRouter()

  const fetchProducts = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single()

    if (!profile) return
    if (profile.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', profile.company_id)

    setProducts(data || [])
  }

  const totalProducts = products.length

  const totalQuantity = products.reduce(
    (sum, p) => sum + Number(p.quantity),
    0
  )

  const inventoryValue = products.reduce(
    (sum, p) =>
      sum +
      Number(p.quantity) *
        Number(p.price || 0),
    0
  )

  const lowStockProducts = products.filter(
    (p) => Number(p.quantity) < 5
  )

  const topProduct = [...products].sort(
    (a, b) =>
      Number(b.quantity) -
      Number(a.quantity)
  )[0]

  const mostValuableProduct =
    [...products].sort(
      (a, b) =>
        Number(b.quantity) *
          Number(b.price || 0) -
        Number(a.quantity) *
          Number(a.price || 0)
    )[0]

  const healthScore =
    totalProducts === 0
      ? 0
      : Math.round(
          ((totalProducts -
            lowStockProducts.length) /
            totalProducts) *
            100
        )

  const exportExcel = () => {
    const reportData = products.map((p) => ({
    Product: p.name,
    Quantity: p.quantity,
    Price: p.price,
    Value:
      Number(p.quantity) *
      Number(p.price || 0),
    Status:
      Number(p.quantity) < 5
        ? 'Low Stock'
        : 'Healthy'
  }))

  const worksheet =
    XLSX.utils.json_to_sheet(reportData)

  const workbook =
    XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Inventory Report'
  )

  const excelBuffer =
    XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    })

  const fileData = new Blob(
    [excelBuffer],
    {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  )

  saveAs(
    fileData,
    'Inventory_Report.xlsx'
  )
}

  const downloadPDF = () => {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Inventory Report', 14, 20)

  doc.setFontSize(12)
  doc.text(`Total Products: ${totalProducts}`, 14, 30)
  doc.text(`Total Quantity: ${totalQuantity}`, 14, 40)
  doc.text(`Inventory Value: Rs. ${inventoryValue.toLocaleString('en-IN')}`, 14, 50)
  doc.text(`Inventory Health: ${healthScore}%`, 14, 60)

  autoTable(doc, {
    startY: 80,
    head: [[
      'Product',
      'Quantity',
      'Price',
      'Value',
      'Status'
    ]],
    body: products.map((p) => [
      p.name,
      p.quantity,
      p.price,
      Number(p.quantity) *
        Number(p.price || 0),
      Number(p.quantity) < 5
        ? 'Low Stock'
        : 'Healthy'
    ])
  })

  doc.save('inventory-report.pdf')
}
  
  return (
    <div>
      <h1
        style={{
          fontSize: '34px',
          marginBottom: '25px'
        }}
      >
        📊 Reports
      </h1>
      <button
  onClick={downloadPDF}
  style={{
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '12px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '20px'
  }}
>
  📄 Download PDF Report
</button>
<button
  onClick={exportExcel}
  style={{
    backgroundColor: '#16a34a',
    color: 'white',
    border: 'none',
    padding: '12px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '20px',
    marginLeft: '10px'
  }}
>
  📊 Export Excel
</button>


      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(220px,1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}
      >
        <ReportCard
          title="Total Products"
          value={totalProducts}
        />

        <ReportCard
          title="Total Quantity"
          value={totalQuantity}
        />

        <ReportCard
          title="Inventory Value"
          value={`₹ ${inventoryValue}`}
        />

        <ReportCard
          title="Low Stock Items"
          value={lowStockProducts.length}
        />

        <ReportCard
          title="Inventory Health"
          value={`${healthScore}%`}
        />
      </div>

      {/* Best Stocked Product */}
      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '14px',
          marginBottom: '20px'
        }}
      >
        <h2>🏆 Best Stocked Product</h2>

        {topProduct ? (
          <p>
            {topProduct.name} (
            {topProduct.quantity} units)
          </p>
        ) : (
          <p>No products available</p>
        )}
      </div>

      {/* Most Valuable Product */}
      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '14px',
          marginBottom: '25px'
        }}
      >
        <h2>💎 Most Valuable Product</h2>

        {mostValuableProduct ? (
          <p>
            {mostValuableProduct.name}
            {' '}
            (₹
            {Number(
              mostValuableProduct.quantity
            ) *
              Number(
                mostValuableProduct.price
              )}
            )
          </p>
        ) : (
          <p>No products available</p>
        )}
      </div>

      {/* Product Table */}
      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '14px'
        }}
      >
        <h2
          style={{
            marginBottom: '20px'
          }}
        >
          Product Report
        </h2>

        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}
        >
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total Value</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <img
                    src={
                      p.image_url ||
                      'https://via.placeholder.com/50'
                    }
                    alt={p.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                </td>

                <td>{p.name}</td>

                <td>{p.quantity}</td>

                <td>₹ {p.price}</td>

                <td>
                  ₹{' '}
                  {Number(p.quantity) *
                    Number(p.price || 0)}
                </td>

                <td>
                  {Number(p.quantity) < 5 ? (
                    <span
                      style={{
                        color: '#dc2626',
                        fontWeight: 'bold'
                      }}
                    >
                      Low Stock
                    </span>
                  ) : (
                    <span
                      style={{
                        color: '#16a34a',
                        fontWeight: 'bold'
                      }}
                    >
                      Healthy
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Low Stock Report */}
      <div
        style={{
          background: '#fef2f2',
          padding: '20px',
          borderRadius: '14px',
          marginTop: '25px'
        }}
      >
        <h2>⚠ Low Stock Report</h2>

        {lowStockProducts.length === 0 ? (
          <p>
            All products sufficiently
            stocked
          </p>
        ) : (
          lowStockProducts.map((p) => (
            <p key={p.id}>
              {p.name} - {p.quantity} left
            </p>
          ))
        )}
      </div>
    </div>
  )
}

function ReportCard({
  title,
  value
}: {
  title: string
  value: any
}) {
  return (
    <div
      style={{
        background: 'white',
        padding: '20px',
        borderRadius: '14px',
        boxShadow:
          '0 4px 10px rgba(0,0,0,0.05)'
      }}
    >
      <h3>{title}</h3>

      <p
        style={{
          fontSize: '28px',
          fontWeight: 'bold'
        }}
      >
        {value}
      </p>
    </div>
  )
}