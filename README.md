# 📦 Warehouse & Inventory Management System

A full-stack **Warehouse & Inventory Management System** designed to manage masters, orders, dispatch, warehouse inward, stock transfers, labour issue management, and inventory tracking — with a modular architecture and role-based permissions.

> Built using **React**, **Redux**, **Node.js**, **Express**, **MongoDB**, and **Bootstrap**, providing a structured and scalable solution for warehouse operations.

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [System Architecture](#-system-architecture)
- [Main Modules](#-main-modules)
- [Masters Module](#-masters-module)
- [Users & Permissions](#-users--permissions-module)
- [Orders Module](#-orders-module)
- [Dispatch Module](#-dispatch-module)
- [Warehouse Inward Module](#-warehouse-inward-module)
- [Issue To Labour Module](#-issue-to-labour-module)
- [Stock Transfer Module](#-stock-transfer-module)
- [Inventory Module](#-inventory-module)
- [Dashboard Module](#-dashboard-module)
- [Complete Workflow](#-complete-project-workflow)
- [Module-Wise Flow](#-module-wise-working-flow)
- [Frontend Architecture](#-frontend-architecture)
- [Backend Architecture](#-backend-architecture)
- [Database Schema](#-database--collection-schema)
- [Tech Stack](#-tech-stack)
- [Authentication](#-authentication)
- [Installation](#-installation)
- [Future Improvements](#-future-improvements)

---

## 🧾 Project Overview

This project manages the **complete lifecycle of warehouse operations**, including:

| Area | Description |
|------|-------------|
| 📋 Item Masters | Base data management for items, categories, units, GST |
| 🛒 Orders | Customer order creation and approval |
| 🚚 Dispatch | Sending items from warehouse to customers |
| 📥 Warehouse Inward | Recording stock received into warehouse |
| 👷 Labour Issues | Tracking items issued to workers |
| 🔄 Stock Transfers | Moving stock between warehouses |
| 📊 Inventory | Real-time availability tracking |
| 🔐 Permissions | Role-based access per module and action |

The system ensures that inventory movement is tracked across **all modules**, preventing stock inconsistencies.

---

## 🏗 System Architecture

```mermaid
flowchart LR
    A[Frontend\nReact + TypeScript\nRedux + Bootstrap] --> B[React Router]
    B --> C[Pages / Modules]
    C --> D[API Service / Thunks]

    D --> E[Backend\nNode.js + Express]
    E --> F[Routes]
    F --> G[Controllers]
    G --> H[Services /\nBusiness Logic]
    H --> I[Models]
    I --> J[(MongoDB)]

    E --> K[JWT Auth\nMiddleware]
    E --> L[Permission\nMiddleware]

    J --> M[(Masters Data)]
    J --> N[(Orders Data)]
    J --> O[(Warehouse Data)]
    J --> P[(Inventory Data)]
    J --> Q[(Users Data)]
```

**How it fits together:**
- **Frontend** handles UI, routing, tables, forms, and state management via Redux Toolkit
- **Backend** is organized into routes → controllers → business logic → models
- **MongoDB** stores all operational data
- **JWT + Permission middleware** secures access to every module and action

---

## 🧩 Main Modules

```mermaid
mindmap
  root((WMS))
    Masters
      Categories
      Sub Categories
      Units
      GST
      Items
      Customers
      Suppliers
      Warehouses
      Labours
    Users & Permissions
      Role Management
      Module Access
      Action Control
    Orders
      Create Order
      Approve Order
      Ready For Dispatch
    Warehouse
      Dispatch
      Inward
      Stock Transfer
      Issue To Labour
    Inventory
      In Stock List
      Stock Summary
      Warehouse Overview
    Dashboard
      Summary Cards
      Analytics
      Low Stock Alerts
```

---

## 🧱 Masters Module

Masters store the **base reference data** used across the entire system. All transaction modules depend on masters being set up first.

```mermaid
flowchart TD
    A[Masters Setup] --> B[Categories]
    A --> C[Sub Categories]
    A --> D[Units]
    A --> E[GST Slabs]
    A --> F[Items]
    A --> G[Customers]
    A --> H[Suppliers]
    A --> I[Warehouses]
    A --> J[Labours]

    B --> F
    C --> F
    D --> F
    E --> F

    F --> K[Orders / Dispatch /\nInward / Inventory]
    G --> K
    H --> K
    I --> K
    J --> K
```

### Sub-modules

| Sub Module | Purpose | Example |
|------------|---------|---------|
| **Categories** | Main item classification | Electronics, Hardware, Tools |
| **Sub Categories** | Child classification | Electronics → Mobile, Laptop |
| **Units** | Measurement units | Nos, Kg, Meters, Boxes |
| **GST** | Tax slabs | 5%, 12%, 18%, 28% |
| **Items** | Core inventory items | Name, Code, Category, Unit, GST |
| **Customers** | Customer details | Name, Phone, Address, City |
| **Suppliers** | Supplier information | Name, Contact, Address |
| **Warehouses** | Storage locations | Main, Factory, Retail |
| **Labours** | Worker details | Name, Assignment info |

---

## 👤 Users & Permissions Module

The system includes **role-based access control** with granular per-module permissions.

```mermaid
flowchart TD
    A[User Account] --> B{Assign Permissions}
    B --> C[Masters Module]
    B --> D[Orders Module]
    B --> E[Warehouse Module]
    B --> F[Inventory Module]
    B --> G[Users Module]
    B --> H[Dashboard Module]

    C --> I[Create / View /\nUpdate / Delete]
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
```

**Permission types:** `Create` · `View` · `Update` · `Delete`

Each user is assigned permissions **per module per action**, enabling fine-grained enterprise-level access control.

---

## 🧾 Orders Module

Handles customer order creation and status tracking.

```mermaid
flowchart LR
    A[Create Order] --> B{Order Review}
    B -->|Approved| C[Order Approved]
    B -->|Rejected| D[Order Rejected]
    C --> E[Ready For Dispatch]
    E --> F[Dispatch Created]
```

**Order includes:** Customer · Items · Quantity · Price · GST · Total Amount · Status History

---

## 🚚 Dispatch Module

Dispatch sends items **from warehouse to customers** or routes them internally.

```mermaid
flowchart TD
    A[Order Ready For Dispatch] --> B[Create Dispatch]
    B --> C{Dispatch Type}

    C -->|ORDER| D[Customer Delivery]
    C -->|DIRECT| E[Direct Dispatch]
    C -->|LABOUR| F[Issue To Labour]

    D --> G[Items Sent\nFrom Warehouse]
    E --> G
    F --> G

    G --> H[Dispatch Status Updated]
    H --> I[Inventory Reserved /\nReduced]
```

**Dispatch contains:** Dispatch No · Order Reference · Customer · Warehouse · Items · Date · Transport Details

---

## 📥 Warehouse Inward Module

Warehouse inward records **stock received** into a warehouse, increasing inventory.

```mermaid
flowchart TD
    A[Stock Received] --> B{Inward Type}

    B -->|GRN| C[Goods Receipt Note]
    B -->|Transfer| D[Stock Transfer Inward]
    B -->|Return| E[Return Inward]

    C --> F[Create Inward Entry]
    D --> F
    E --> F

    F --> G[Validate Quantities\n& Item Details]
    G --> H[Save Inward Record]
    H --> I[Update Inventory\nReceived Quantity ↑]
```

---

## 👷 Issue To Labour Module

Tracks items **issued to workers** for use on jobs.

```mermaid
flowchart TD
    A[Dispatch Created\nType: LABOUR] --> B[Issue To Labour Entry]
    B --> C[Assign Labour + Items\n+ Quantity + Date]
    C --> D[Labour Receives Items]
    D --> E{Outcome}

    E -->|Item Used| F[Mark As Consumed]
    E -->|Item Returned| G[Return Entry]

    F --> H[Inventory Adjusted]
    G --> H
```

**Issue record includes:** Labour Name · Item · Quantity · Issue Date · Return Status

---

## 🔄 Stock Transfer Module

Transfers stock **between warehouses**, maintaining per-warehouse inventory accuracy.

```mermaid
flowchart LR
    A[Source Warehouse\nHas Stock] --> B[Create Stock Transfer]
    B --> C[Dispatch Transfer\nOut of Source]
    C --> D[In Transit]
    D --> E[Destination Warehouse\nReceives Inward]
    E --> F[Inventory Updated\nBoth Warehouses]

    style A fill:#4A90D9,color:#fff
    style F fill:#27AE60,color:#fff
```

**Transfer flow:** Source stock is moved out → destination receives inward → both warehouse inventories update accordingly.

---

## 📊 Inventory Module

Inventory tracks **real-time item quantities** per warehouse using a simple, reliable formula.

```mermaid
flowchart TD
    A[Warehouse Inward] -->|Increases Stock| D[Inventory Engine]
    B[Dispatch] -->|Reserves / Reduces Stock| D
    C[Issue To Labour] -->|Reduces Stock| D
    E[Stock Transfer] -->|Adjusts Per Warehouse| D

    D --> F[Received Qty]
    D --> G[Reserved Qty]
    D --> H[Available Qty]

    F --> I["Available = Received − Reserved"]
    G --> I
    H --> I

    style I fill:#F39C12,color:#fff
```

| Quantity Type | Meaning |
|---------------|---------|
| **Received Quantity** | Total stock received via inward |
| **Reserved Quantity** | Stock reserved by dispatches / issues |
| **Available Quantity** | `Received − Reserved` — what can be used |

---

## 📊 Dashboard Module

Provides **summary analytics** across all modules at a glance.

| Widget | Description |
|--------|-------------|
| 📦 Total Orders | Count of all orders |
| 🚚 Total Dispatches | Count of all dispatches |
| 📊 Inventory Overview | Stock levels by warehouse |
| ⏳ Pending Dispatches | Orders awaiting dispatch |
| 📥 Pending Inwards | Stock awaiting inward entry |
| ⚠️ Low Stock Items | Items below threshold |

---

## 🔄 Complete Project Workflow

```mermaid
flowchart TD
    A[Masters Setup\nCategories · Items · Warehouses · etc] --> B[Customer Places Order]
    B --> C[Order Review & Approval]
    C --> D[Ready For Dispatch]

    D --> E[Create Dispatch]
    E --> F{Dispatch Route}

    F -->|Customer Order| G[Customer Delivery\nOrder Completed]
    F -->|Labour| H[Issue To Labour]
    F -->|Transfer| I[Stock Transfer Dispatch]

    H --> J[Labour Uses or\nReturns Item]
    I --> K[Destination Warehouse\nInward Entry]
    G --> L[Inventory Updated]
    J --> L
    K --> L

    M[Direct GRN / Supplier\nWarehouse Inward] --> L

    L --> N[Live Stock Overview]
    N --> O[Dashboard Summary\n& Analytics]

    style A fill:#3498DB,color:#fff
    style L fill:#27AE60,color:#fff
    style O fill:#8E44AD,color:#fff
```

---

## 🔁 Module-Wise Working Flow

### 1. Masters → Transactions Flow

```mermaid
flowchart LR
    A[Create Categories] --> B[Create SubCategories]
    B --> C[Create Units & GST]
    C --> D[Create Items]
    D --> E[Create Customers\nSuppliers\nWarehouses\nLabours]
    E --> F[Transactions\nCan Begin]

    style F fill:#27AE60,color:#fff
```

### 2. Order → Dispatch Flow

```mermaid
flowchart LR
    A[Customer Order Created] --> B[Order Saved with\nItems & Pricing]
    B --> C[Order Approved]
    C --> D[Status: Ready]
    D --> E[Dispatch Created\nFrom Order]
    E --> F[Items Moved\nFrom Warehouse]
    F --> G[Dispatch Status\nUpdated]
```

### 3. Dispatch → Labour Flow

```mermaid
flowchart LR
    A[Dispatch: Type LABOUR] --> B[Issue To Labour\nEntry Created]
    B --> C[Labour Receives\nItem Quantity]
    C --> D{Item Outcome}
    D -->|Consumed| E[Mark Consumed]
    D -->|Returned| F[Return Entry]
    E --> G[Inventory Adjusted]
    F --> G
```

### 4. Stock Transfer Flow

```mermaid
flowchart LR
    A[Source Warehouse] --> B[Create Transfer Record]
    B --> C[Transfer Dispatched\nOut of Source]
    C --> D[In Transit]
    D --> E[Destination Inward\nEntry Created]
    E --> F[Both Inventories\nUpdated]

    style A fill:#E74C3C,color:#fff
    style F fill:#27AE60,color:#fff
```

### 5. Warehouse Inward Flow

```mermaid
flowchart LR
    A[Goods Arrive\nat Warehouse] --> B[Create Inward Entry]
    B --> C[Select Type:\nGRN / Transfer / Return]
    C --> D[Validate Item\nDetails & Qty]
    D --> E[Save Inward]
    E --> F[Inventory\nReceived Qty ↑]
```

### 6. Inventory Update Flow

```mermaid
flowchart TD
    A[Inward Entry] -->|+Received Qty| E[Inventory Engine]
    B[Dispatch] -->|+Reserved Qty| E
    C[Labour Issue] -->|Adjusts Qty| E
    D[Stock Transfer] -->|Warehouse-wise Adjust| E

    E --> F["Available = Received − Reserved"]
    F --> G[Live Stock Position\nPer Item Per Warehouse]

    style F fill:#F39C12,color:#fff
    style G fill:#27AE60,color:#fff
```

---

## 🖥 Frontend Architecture

```
src/
 ├── components/
 │    ├── Table/
 │    ├── Forms/
 │    └── Layout/
 ├── pages/
 │    ├── Authentication/
 │    ├── Dashboard/
 │    ├── Masters/
 │    ├── Orders/
 │    ├── Warehouse/
 │    └── Inventory/
 ├── slices/
 │    ├── auth/
 │    ├── orders/
 │    ├── inventory/
 │    └── warehouse/
 ├── routes/
 ├── utils/
 └── types/
```

---

## ⚙ Backend Architecture

```
backend/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── services/
 ├── middlewares/
 ├── utils/
 └── config/
```

---

## 🗂 Database / Collection Schema

```mermaid
erDiagram
    USERS ||--o{ ORDERS : creates
    USERS ||--o{ DISPATCHES : manages
    USERS ||--o{ WAREHOUSE_INWARDS : creates
    USERS ||--o{ STOCK_TRANSFERS : creates
    USERS ||--o{ ISSUE_TO_LABOURS : creates

    CUSTOMERS ||--o{ ORDERS : places
    ORDERS ||--o{ DISPATCHES : generates

    WAREHOUSES ||--o{ DISPATCHES : source
    WAREHOUSES ||--o{ WAREHOUSE_INWARDS : receives
    WAREHOUSES ||--o{ STOCK_TRANSFERS : from_to
    WAREHOUSES ||--o{ INVENTORIES : stores

    LABOURS ||--o{ ISSUE_TO_LABOURS : receives

    CATEGORIES ||--o{ SUBCATEGORIES : contains
    SUBCATEGORIES ||--o{ ITEMS : classifies
    UNITS ||--o{ ITEMS : measures
    GSTS ||--o{ ITEMS : applies

    ITEMS ||--o{ ORDER_ITEMS : included_in
    ITEMS ||--o{ DISPATCH_ITEMS : dispatched_in
    ITEMS ||--o{ INWARD_ITEMS : inwarded_in
    ITEMS ||--o{ TRANSFER_ITEMS : transferred_in
    ITEMS ||--o{ LABOUR_ISSUE_ITEMS : issued_in
    ITEMS ||--o{ INVENTORIES : tracked_in
```

---

## 🔧 Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React | UI Framework |
| Redux Toolkit | State Management & Async Thunks |
| TypeScript | Type Safety |
| Bootstrap | Styling & Layout |
| TanStack Table | Advanced Data Tables |
| Formik + Yup | Forms & Validation |
| React Router | Client-Side Routing |

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| MongoDB | Database |
| Mongoose | ODM / Schema Management |
| JWT | Authentication |

### Tools

Git · GitHub · Postman · VS Code

---

## 🔐 Authentication

```mermaid
flowchart LR
    A[User Enters\nCredentials] --> B[POST /auth/login]
    B --> C{Credentials\nValid?}
    C -->|Yes| D[JWT Token Generated]
    C -->|No| E[401 Unauthorized]
    D --> F[Token Stored\nIn Frontend]
    F --> G[All Requests Include\nAuthorization Header]
    G --> H[JWT Middleware\nVerifies Token]
    H --> I[Permission Middleware\nChecks Module Access]
    I --> J[Request Proceeds]
```

---

## 📸 Screenshots

| Module | Screenshot |
|--------|-----------|
| Dashboard | ![Dashboard](docs/images/dashboard.png) |
| Orders | ![Orders](docs/images/orders-list.png) |
| Dispatch | ![Dispatch](docs/images/dispatch-list.png) |
| Warehouse Inward | ![Inward](docs/images/warehouse-inward.png) |
| Stock Transfer | ![Transfer](docs/images/stock-transfer.png) |
| Issue To Labour | ![Labour](docs/images/issue-to-labour.png) |
| Inventory | ![Inventory](docs/images/inventory-overview.png) |

---

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/warehouse-management-system.git
cd warehouse-management-system
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌱 Future Improvements

- [ ] Barcode scanning integration
- [ ] PDF invoice generation
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Mobile responsive UI
- [ ] Multi-warehouse analytics

---

## 🌟 Why This Project Stands Out

This is not just a CRUD application. It demonstrates:

- ✅ **Modular full-stack architecture** — clean separation of concerns across all layers
- ✅ **Real business process handling** — mirrors actual warehouse operations
- ✅ **Interconnected module dependencies** — modules work together, not in isolation
- ✅ **Role-based permissions** — enterprise-grade access control
- ✅ **Reusable components** — shared table and form structures throughout
- ✅ **Live inventory calculations** — accurate, formula-driven stock tracking
- ✅ **Scalable design** — built to extend into ERP-level systems

**Ideal portfolio project for:** Full Stack Developer · MERN Stack Developer · ERP/Inventory Software · Warehouse & Operations Tech

---

<p align="center">Built with ❤️ using the MERN Stack</p>
