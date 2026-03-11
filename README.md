📦 Warehouse & Inventory Management System

A Full Stack Warehouse & Inventory Management System designed to manage masters, orders, dispatch, warehouse inward, stock transfers, labour issue management, and inventory tracking with a modular architecture and role-based permissions.

The system is built using React, Redux, Node.js, Express, MongoDB, and Bootstrap, providing a structured and scalable solution for warehouse operations.

🧾 Project Overview

This project manages the complete lifecycle of warehouse operations, including:

Item master management

Order creation

Dispatch management

Warehouse inward operations

Labour issue tracking

Stock transfers between warehouses

Inventory availability tracking

Role-based permissions

Structured module architecture

The system ensures that inventory movement is tracked across all modules, preventing stock inconsistencies.

🏗 System Architecture
flowchart LR

<img width="2299" height="328" alt="mermaid-diagram" src="https://github.com/user-attachments/assets/de47555c-8787-403b-b29e-857b8e02ab44" />


Explanation:

Masters define base data

Orders create demand

Dispatch sends items

Warehouse inward receives stock

Labour issues consume stock

Inventory updates quantities

Stock transfers move stock between warehouses

🧩 Main Modules

The project is divided into the following major modules.

Masters
Users & Permissions
Orders
Warehouse
Inventory
Dashboard
Authentication
🧱 Masters Module

Masters store the base reference data used across the system.

Sub Modules
Categories

Organizes items into main categories.

Example:

Electronics
Hardware
Tools
Sub Categories

Further classification of items.

Example:

Electronics
   ├── Mobile
   ├── Laptop
   └── Accessories
Units

Defines measurement units.

Examples:

Nos
Kg
Meters
Boxes
GST

Stores GST percentage.

Example:

5%
12%
18%
28%
Items

Stores item information including:

Item Name

Item Code

Category

Sub Category

Unit

GST

Customers

Stores customer details:

Customer Name
Contact Person
Phone
Address
City
State
Pincode
Suppliers

Stores supplier information.

Warehouses

Stores warehouse locations.

Example:

Main Warehouse
Factory Warehouse
Retail Warehouse
Labours

Stores labour/worker details for job assignments.

👤 Users & Permissions Module

The system includes role-based access control.

Permissions include:

Create
View
Update
Delete

Example permissions structure:

Masters
Orders
Warehouse
Inventory
Users
Dashboard

Each user gets permissions per module.

🧾 Orders Module

Handles customer order creation.

Flow
Create Order
      ↓
Order Approved
      ↓
Ready For Dispatch

Orders include:

Customer
Items
Quantity
Price
GST
Total Amount
🚚 Dispatch Module

Dispatch sends items from warehouse to customers.

Dispatch Types
ORDER
DIRECT
LABOUR

Dispatch contains:

Dispatch Number
Order Reference
Customer
Warehouse
Items
Dispatch Date
Transport Details
Dispatch Flow
flowchart TD

A[Order Ready] --> B[Create Dispatch]
B --> C[Items Sent From Warehouse]
C --> D[Dispatch Status Updated]
📥 Warehouse Inward Module

Warehouse inward records stock received into warehouse.

Types
GRN (Goods Receipt Note)
Stock Transfer Inward
Return Inward
Inward Flow
flowchart TD

A[Stock Received] --> B[Create Inward Entry]
B --> C[Validate Quantities]
C --> D[Update Inventory]
👷 Issue To Labour Module

Tracks items issued to workers.

Example:

Labour Name
Item
Quantity
Issue Date
Return Status
Labour Flow
flowchart TD

A[Dispatch] --> B[Issue To Labour]
B --> C[Labour Uses Item]
C --> D[Return Or Consume]
D --> E[Inventory Update]
🔄 Stock Transfer Module

Transfers stock between warehouses.

Example:

From Warehouse → To Warehouse
Transfer Flow
flowchart TD

A[Warehouse A] --> B[Create Stock Transfer]
B --> C[Dispatch Transfer]
C --> D[Warehouse B Inward]
D --> E[Inventory Updated]
📊 Inventory Module

Inventory tracks real-time item quantities.

It maintains:

Received Quantity
Reserved Quantity
Available Quantity

Formula:

Available = Received - Reserved

Inventory updates automatically when:

Dispatch occurs
Warehouse inward happens
Labour issues happen
Stock transfers occur
📊 Dashboard Module

Dashboard provides summary analytics.

Example widgets:

Total Orders
Total Dispatches
Inventory Stock Overview
Pending Dispatch
Pending Inwards
Low Stock Items

Example dashboard layout:

Orders Summary
Dispatch Summary
Warehouse Activity
Inventory Statistics
🖥 Frontend Architecture
src
 ├── components
 │    ├── Table
 │    ├── Forms
 │    ├── Layout
 │
 ├── pages
 │    ├── Authentication
 │    ├── Dashboard
 │    ├── Masters
 │    ├── Orders
 │    ├── Warehouse
 │    ├── Inventory
 │
 ├── slices
 │    ├── auth
 │    ├── orders
 │    ├── inventory
 │    ├── warehouse
 │
 ├── routes
 ├── utils
 └── types
⚙ Backend Architecture
backend
 ├── controllers
 ├── models
 ├── routes
 ├── services
 ├── middlewares
 ├── utils
 └── config
🔧 Tech Stack

Frontend

React
Redux Toolkit
TypeScript
Bootstrap
TanStack Table
Formik
Yup
React Router

Backend

Node.js
Express.js
MongoDB
Mongoose
JWT Authentication

Tools

Postman
Git
GitHub
VS Code
🔐 Authentication

Authentication uses JWT tokens.

Flow:

Login
 ↓
JWT Generated
 ↓
Token Stored In Frontend
 ↓
Authenticated Requests
📸 Screenshots
Dashboard

Orders

Dispatch

Warehouse Inward

Inventory Overview

🚀 Installation
Clone Repository
git clone https://github.com/yourusername/warehouse-management-system.git
Backend Setup
cd backend
npm install
npm run dev
Frontend Setup
cd frontend
npm install
npm run dev
🌱 Future Improvements

Planned features:

Barcode scanning
PDF invoice generation
Advanced analytics dashboard
Email notifications
Mobile responsive UI
Multi warehouse analytics

🏛 System Architecture Diagram
flowchart LR

A[Frontend - React + TypeScript + Redux + Bootstrap] --> B[React Router]
B --> C[Pages / Modules]
C --> D[API Service / Thunks]

D --> E[Backend - Node.js + Express]
E --> F[Routes]
F --> G[Controllers]
G --> H[Services / Business Logic]
H --> I[Models]
I --> J[(MongoDB)]

E --> K[JWT Authentication Middleware]
E --> L[Permission Middleware]

J --> M[Masters Data]
J --> N[Orders Data]
J --> O[Warehouse Data]
J --> P[Inventory Data]
J --> Q[Users Data]
Explanation

This project follows a modular full-stack architecture:

Frontend handles UI, routing, tables, forms, and state management.

Redux Toolkit manages async API calls and global state.

Backend is organized into routes, controllers, business logic, and models.

MongoDB stores all operational data.

JWT + Permission middleware secures access to modules and actions.

This structure makes the project:

scalable

maintainable

easy to extend

suitable for role-based enterprise workflows

🗂 Database / Collection Schema Overview
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
🧠 Data Model Explanation
1. Users

Stores login and access information.

Purpose:

Authentication

Role-based access

Tracking createdBy / updatedBy

2. Masters Collections

These collections are base references used across the entire system.

Categories

Main classification of items.

SubCategories

Child classification under categories.

Units

Measurement units like Nos, Kg, Box, Meter.

GSTs

Tax slabs for items.

Items

Core inventory items linked to category, subcategory, unit, and GST.

Customers

Used in order and dispatch modules.

Suppliers

Used for procurement / future inward processes.

Warehouses

Storage locations for physical stock.

Labours

Workers to whom material can be issued.

3. Orders

Stores customer order data.

Includes:

orderNo

customer details

items

quantities

pricing

totals

order status

Orders are the starting point for dispatch-based sales flow.

4. Dispatches

Stores item movement out of warehouse.

Includes:

dispatchNo

dispatchDate

dispatchType

order linkage

warehouse source

customer details

items

transporter / delivery info

status

Dispatch reduces or reserves stock depending on workflow.

5. Warehouse Inwards

Stores stock received into warehouse.

Includes:

inwardNo

inwardType

reference document

warehouse details

item list

quantities

date

remarks

Warehouse inward increases inventory.

6. Stock Transfers

Moves stock from one warehouse to another.

Flow:

create transfer from source warehouse

dispatch transfer

inward at destination warehouse

inventory updated for both ends

7. Issue To Labour

Tracks item issuance to workers.

Includes:

labour name

linked dispatch/reference

warehouse

item list

issued quantity

consumed / return status

This is important for tracing non-customer stock movement.

8. Inventory

Stores stock summary per item per warehouse.

Tracks:

receivedQuantity

reservedQuantity

availableQuantity

This module acts as the live stock position of the business.

🔄 Complete Project Workflow Diagram
flowchart TD

A[Masters Setup] --> A1[Categories]
A --> A2[SubCategories]
A --> A3[Units]
A --> A4[GST]
A --> A5[Items]
A --> A6[Customers]
A --> A7[Suppliers]
A --> A8[Warehouses]
A --> A9[Labours]

A9 --> B[Order Created]
B --> C[Order Review / Approval]
C --> D[Ready For Dispatch]

D --> E[Create Dispatch]
E --> F[Dispatch From Warehouse]

F --> G1[Customer Delivery]
F --> G2[Issue To Labour]
F --> G3[Stock Transfer Dispatch]

G2 --> H1[Labour Uses / Returns Item]
G3 --> H2[Destination Warehouse Inward]
G1 --> H3[Order Completed]

H2 --> I[Inventory Updated]
H1 --> I
H3 --> I

J[Direct Warehouse Inward / GRN] --> I

I --> K[Stock Overview]
K --> L[Dashboard Summary]
🔁 Module-Wise Working Flow
1. Masters Flow

Masters are created first because all transaction modules depend on them.

Sequence:

create categories

create subcategories

create units

create GST slabs

create items

create customers / suppliers / warehouses / labours

Without masters, transaction modules cannot function properly.

2. Order to Dispatch Flow
flowchart LR
A[Customer Order] --> B[Order Saved]
B --> C[Order Ready]
C --> D[Dispatch Created]
D --> E[Items Moved From Warehouse]
E --> F[Dispatch Status Updated]
Working

User creates an order

Order contains customer and item details

Once ready, dispatch is generated from the order

Dispatch copies item and customer details

Dispatch updates stock movement process

3. Dispatch to Labour Flow
flowchart LR
A[Dispatch Page] --> B[Issue To Labour Created]
B --> C[Labour Receives Items]
C --> D[Item Used / Returned]
D --> E[Inventory Adjusted]
Working

User creates labour issue from dispatch

Labour receives item quantity

Item may be consumed or later returned

Inventory reflects actual movement

4. Stock Transfer Flow
flowchart LR
A[Source Warehouse] --> B[Create Stock Transfer]
B --> C[Transfer Dispatch]
C --> D[Destination Warehouse]
D --> E[Warehouse Inward]
E --> F[Inventory Updated]
Working

Stock is transferred between two warehouses

Source stock is moved out

Destination warehouse receives inward

Inventory records remain warehouse-specific

5. Warehouse Inward Flow
flowchart LR
A[Goods Received] --> B[Create Inward Entry]
B --> C[Validate Item Details]
C --> D[Save Inward]
D --> E[Update Inventory]
Working

Stock received is recorded in inward entry

Item quantities are validated

Inventory received quantity increases

6. Inventory Flow
flowchart TD
A[Inward] --> D[Inventory Engine]
B[Dispatch] --> D
C[Issue To Labour] --> D
E[Stock Transfer] --> D
D --> F[Received Qty]
D --> G[Reserved Qty]
D --> H[Available Qty]
Inventory Formula
Available Quantity = Received Quantity - Reserved Quantity
Notes

Inward increases stock

Dispatch and issue-related flows affect usable stock

Transfer impacts stock warehouse-wise

Inventory acts as the final stock truth

🧩 Module → Submodule → Sub-Submodule Structure
1. Authentication

Login

Register

Logout

Protected Routes

Access Denied

2. Dashboard

Summary Cards

Inventory Snapshot

Pending Operations

Module Statistics

Warehouse Overview

Low Stock Indicators

3. Masters

Categories

SubCategories

Units

GST

Items

Customers

Suppliers

Warehouses

Labours

Common actions in all masters

List

Add

Edit

View

Delete

Permission checks

4. Users & Permissions

User List

User Create

User Edit

Password Update

Role / Permission Assignment

Module access control

Action-level permission control

5. Orders

Orders List

Order Create

Order Edit

Order View

Ready To Dispatch stage

Status update flow

Order sub-sections

customer details

item details

quantity / rate

tax / totals

status history

6. Warehouse
Dispatch

Ready To Dispatch List

Dispatch List

Create Dispatch

Edit Dispatch

View Dispatch

Deliver Dispatch

Revert Dispatch

Warehouse Inward

Inward List

GRN Inward

Pending Transfer Inward

Inward View

Inward Create

Inward Complete Flow

Stock Transfer

Transfer List

Create Transfer

Dispatch Transfer

Pending Transfer

Complete Transfer

Revert Transfer

Issue To Labour

Labour Issue List

Create Labour Issue

View Labour Issue

Edit Labour Issue

Pending Labour Inward / return handling

7. Inventory

In Stock List

Item Stock View

Warehouse Overview

Stock Summary

Received / Reserved / Available quantity display

📸 Suggested GitHub Image Sections

You said you want images too. In GitHub README, use screenshots like this:

# 📸 Application Screens

## Login Page
![Login Page](docs/images/login-page.png)

## Dashboard
![Dashboard](docs/images/dashboard.png)

## Orders Module
![Orders](docs/images/orders-list.png)

## Dispatch Module
![Dispatch](docs/images/dispatch-list.png)

## Warehouse Inward
![Warehouse Inward](docs/images/warehouse-inward.png)

## Stock Transfer
![Stock Transfer](docs/images/stock-transfer.png)

## Issue To Labour
![Issue To Labour](docs/images/issue-to-labour.png)

## Inventory Overview
![Inventory](docs/images/inventory-overview.png)
🖼 Suggested Diagram Images To Add

Create a folder:

docs/
 ├── images/
 ├── diagrams/

Recommended files:

docs/images/dashboard.png
docs/images/login-page.png
docs/images/orders-list.png
docs/images/dispatch-list.png
docs/images/warehouse-inward.png
docs/images/stock-transfer.png
docs/images/issue-to-labour.png
docs/images/inventory-overview.png

docs/diagrams/system-architecture.png
docs/diagrams/module-flow.png
docs/diagrams/database-schema.png
🌟 Why This Project Is Strong

This project is not just CRUD. It demonstrates:

modular full-stack architecture

real business process handling

warehouse and stock movement logic

interconnected module dependencies

role-based permissions

reusable table and form structure

real inventory calculations

scalable enterprise-style design

This makes it a strong portfolio project for:

Full Stack Developer roles

MERN Stack Developer roles

ERP / Inventory software projects

Warehouse / Operations tech solutions
