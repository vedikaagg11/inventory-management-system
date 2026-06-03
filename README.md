# 📦 StockFlow – AI-Powered Inventory Management System

## Overview

StockFlow is a modern inventory management system built with Next.js, TypeScript, Supabase, and PostgreSQL. It helps businesses manage products, customers, vendors, transactions, and inventory data through a centralized dashboard.

The project is designed as the foundation for an AI-powered inventory platform that can provide intelligent stock monitoring, demand forecasting, and inventory optimization.

---

## Features

### 🔐 Authentication & Authorization

* Secure user authentication using Supabase Auth
* Login and registration system
* Role-based access support
* Company-specific data isolation

### 📊 Dashboard

* Inventory overview dashboard
* Total products statistics
* Total stock quantity tracking
* Inventory value calculation
* Low-stock monitoring
* Top product display
* Analytics visualization

### 🛒 Product Management

* Add products
* Edit product details
* Delete products
* Search products
* Product image support
* Quantity management
* Price management

### 👥 Customer Management

* Add customers
* View customer records
* Edit customer details
* Delete customers

### 🏢 Vendor Management

* Add vendors
* View vendor records
* Edit vendor information
* Delete vendors

### 💰 Transaction Management

* Record sales transactions
* Record purchase transactions
* Automatic inventory updates
* Transaction history tracking
* Product-wise transaction records

### 📈 Reports

* Product inventory reports
* Stock summaries
* Business insights
* Inventory analytics

### ⚠️ Inventory Monitoring

* Low stock alerts
* Real-time inventory updates
* Inventory status tracking

---

## Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Recharts

### Backend

* Supabase
* PostgreSQL

### Authentication

* Supabase Auth

### Database

* PostgreSQL
* Row Level Security (RLS)

### Deployment

* Vercel (Planned)

---

## Database Structure

### Tables

#### Profiles

Stores user information and company association.

#### Products

Stores product details including:

* Name
* Quantity
* Price
* Image URL
* Company ID

#### Customers

Stores customer records.

#### Vendors

Stores vendor records.

#### Transactions

Stores purchase and sales history.

---

## Security Features

* Company-based data separation
* Authenticated access only
* Protected dashboard routes
* Secure database policies using Supabase RLS

---

## Future Enhancements

### 🤖 AI Features

* Demand forecasting
* Inventory prediction
* Smart reorder recommendations
* AI-generated inventory reports
* Automated stock optimization

### 📊 Advanced Analytics

* Real sales analytics
* Revenue tracking
* Profit analysis
* Performance dashboards

### 📤 Export Options

* PDF reports
* Excel exports
* Downloadable analytics

### ☁️ Storage

* Product image uploads using Supabase Storage

---

## Project Status

Current Version: v1.0

Completed Modules:

* Authentication
* Dashboard
* Products
* Customers
* Vendors
* Transactions
* Reports
* Company Data Isolation

Upcoming Modules:

* AI Inventory Insights
* Forecasting System
* Report Export
* Image Upload System

---

## Author

Vedika Aggarwal

Computer Science Engineering Student

AI-Powered Inventory Management System Internship Project
