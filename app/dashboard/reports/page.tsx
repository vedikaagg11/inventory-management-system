'use client'

export default function ReportsPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        padding: '40px',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <h1
        style={{
          fontSize: '34px',
          color: '#111827',
          marginBottom: '10px'
        }}
      >
        📊 Reports
      </h1>

      <p
        style={{
          color: '#6b7280',
          marginBottom: '30px'
        }}
      >
        Analytics and inventory reports.
      </p>

      {/* Report Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow:
              '0 4px 10px rgba(0,0,0,0.06)'
          }}
        >
          <h3
            style={{
              marginBottom: '10px'
            }}
          >
            📦 Inventory Summary
          </h3>

          <p
            style={{
              color: '#6b7280'
            }}
          >
            View inventory statistics and stock
            overview.
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow:
              '0 4px 10px rgba(0,0,0,0.06)'
          }}
        >
          <h3
            style={{
              marginBottom: '10px'
            }}
          >
            📈 Sales Analytics
          </h3>

          <p
            style={{
              color: '#6b7280'
            }}
          >
            Monthly and yearly sales insights.
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow:
              '0 4px 10px rgba(0,0,0,0.06)'
          }}
        >
          <h3
            style={{
              marginBottom: '10px'
            }}
          >
            ⚠ Low Stock Report
          </h3>

          <p
            style={{
              color: '#6b7280'
            }}
          >
            Monitor products running low in stock.
          </p>
        </div>
      </div>
    </div>
  )
}