# Inventory Management System

A multi-company inventory and stock management system built using Next.js and Supabase.

## Features

### Authentication

* Company-based login system
* Secure user authentication using Supabase
* Role-based access control (Admin/User)

### Inventory Management

* Add products
* Edit product quantity
* Delete products
* Real-time product updates
* Company-specific inventory isolation

### User Roles

#### Admin

* Add products
* Edit products
* Delete products
* Manage inventory

#### User

* View inventory only

### Dashboard

* Product listing
* Real-time synchronization
* Clean dashboard UI
* Logout functionality

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript

### Backend

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Realtime

## Project Structure

```bash
inventory-app/
├── app/
│   ├── dashboard/
│   ├── login/
│   ├── signup/
│   └── layout.tsx
├── lib/
│   └── supabase.ts
├── .env.local
├── package.json
└── README.md
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Current Development Roadmap

### Phase 1

* Authentication system
* Dashboard
* CRUD operations
* Role-based access
* Realtime updates

### Phase 2 (In Progress)

* Customers module
* Vendors module
* Employee module
* Transactions system
* Purchase & sales tracking

### Phase 3

* Reports & analytics
* Graphs and charts
* Best-selling products
* Sales performance reports

### Phase 4

* UI polish
* Deployment
* Production optimization

## Future Goals

* Multi-company SaaS platform
* Advanced reporting system
* Search & filtering
* Low stock alerts
* Sales analytics
* Production deployment

## Author

Vedika Aggarwal
