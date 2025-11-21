# 🌍 HopeBridge – Community Donation & Aid Management Platform

A full-stack MERN-style (React + Node + PostgreSQL) application built to connect donors, beneficiaries, organizers, partners (NGOs/companies), and administrators in a unified ecosystem.

HopeBridge ensures **transparent donations**, **verified organizers**, **fair aid distribution**, and **real impact tracking** across communities.

---

## 🚀 Live Demo

### 🔹 Frontend (Vercel)  
https://hope-bridge-mu.vercel.app

### 🔹 Backend API (Render)  
https://hopebridge-p2z0.onrender.com

> Replace with your actual deployed URLs.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [User Roles](#-user-roles)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Installation](#-installation)
- [Folder Structure](#-folder-structure)
- [API Overview](#-api-overview)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)


---

## 🧩 Overview

HopeBridge streamlines the aid-distribution lifecycle by improving transparency, verification, and coordination among donors, organizers, partners, and beneficiaries.

The platform supports:

- ✔ Secure user authentication  
- ✔ Transparent donation tracking  
- ✔ Admin verification of organizers  
- ✔ NGO & company partnerships  
- ✔ Role-specific dashboards  
- ✔ Aid delivery confirmations  
- ✔ Full admin oversight  

---

## ⭐ Key Features

### 🔐 Authentication & Role-Based Access
- JWT-secured login & signup  
- Dedicated dashboards for each user role  

### 💝 Donations & Beneficiary Management
- Donors submit cash or item donations  
- Beneficiaries request help  
- Organizers manage donation drives  
- Partners launch community support programs  

### 🕵️ Admin Organizer Verification
Admins can:
- Approve or reject organizer profiles  
- Monitor users and system activities  
- Manage roles and permissions  

### 📦 Aid Distribution Tracking
Organizers can:
- Mark donations as delivered  
- Track fulfillment  
- Update donation status  

### 📊 Dashboards
- **Donors:** donation history & impact  
- **Beneficiaries:** request updates & delivery status  
- **Organizers:** drives, volunteers, deliveries  
- **Partners:** CSR dashboards & community programs  
- **Admins:** system analytics & user management  

### 🔔 Notifications
- Status updates  
- Delivery confirmations  
- Verification decisions  

---

## 👥 User Roles

### 1️⃣ Donors
- Donate money or items  
- Track contributions  
- View transparency reports  

### 2️⃣ Beneficiaries
- Submit aid requests  
- Track delivery status  
- Receive updates  

### 3️⃣ Organizers
- Manage donation drives  
- Approve beneficiary requests  
- Handle aid distribution  

### 4️⃣ Partners (NGOs, Companies, Communities)
- Run community projects  
- Contribute resources  
- Collaborate with organizers  

### 5️⃣ Admins
- Verify organizers  
- Manage all users  
- Monitor system-wide activities  

---

## 🛠 Tech Stack

### **Frontend**
- React + TypeScript  
- React Router  
-  CSS  
- Context API (Auth)
- Lucide-react icons 

### **Backend**
- Node.js  
- Express.js  
- PostgreSQL  
- JWT Authentication  
- Bcrypt  

### **DevOps**
- Vercel (Frontend)  
- Render (Backend)  
- PostgreSQL (Database)

---

## 🏗 System Architecture

       ┌──────────────────┐
       │   Frontend        │
       │ React + TypeScript│
       └───────▲──────────┘
               │
               │ REST API Calls
               │
       ┌───────┴──────────┐
       │   Backend API     │
       │ Node.js + Express │
       └───────▲──────────┘
               │
               │ SQL Queries
               │
       ┌───────┴──────────┐
       │   PostgreSQL DB   │
       └──────────────────┘

---

## 📦 Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/loycekalume/HopeBridge
cd hopebridge

## 🧪 Backend Setup

```bash
cd backend
npm install
npm run dev


cd frontend
npm install
npm run dev

HopeBridge/
│
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route logic
│   │   ├── middleware/       # Auth, validation
│   │   ├── routes/           # API route definitions
│   │   ├── utils/            # Helpers (JWT, hashing, etc.)
│   │   └── config/           # DB & environment configurations
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Page-level views
    │   ├── hooks/            # Custom hooks
    │   ├── context/          # Global state (Auth, User)
    │   └── services/         # Axios API services
    └── package.json
```
