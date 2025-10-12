# 🏫 VIT Lost & Found — Item Management System

A responsive **Lost & Found web application** built for **Vidyalankar Institute of Technology (VIT)**.  
This project helps students and staff efficiently **manage lost and found items** within the campus using an intuitive, modern interface.

---

## 🚀 Live Demo
🔗 **App URL:** [VIT Lost & Found (Deployed on Vercel)](https://vercel.com/aaplaswarajya74-2275s-projects/v0-lost-and-found-app)

🔧 **Continue Development on v0:** [Open Project on v0.app](https://v0.app/chat/projects/PksXSxxzxkd)

---

## 💡 Overview

The **VIT Lost & Found System** allows users to:
- View all lost and found items in a clean dashboard.
- Add new items with images and details.
- Edit or delete existing entries.
- Filter and search items by category, location, or status.
- Track item statuses — *Lost*, *Found*, or *Returned*.
- View a summary of total lost, found, and returned items.

---

## ⚙️ Features

### 🔍 Item Management
- Display items with **image, name, description, location, and status**.
- **CRUD Operations:** Add, edit, and delete items.
- **Search & Filter:** Easily filter items by category, location, or status.

### 🧾 Modal Forms
- Add/Edit forms include:
  - Item Name  
  - Description  
  - Category (dropdown)  
  - Location  
  - Status (Lost, Found, Returned)  
  - Image Upload (optional)
- Form validation for required fields.
- Delete confirmation popup to prevent accidental removals.

### 🎨 UI & UX
- Clean **dashboard-style layout** with sidebar navigation (Home, Add Item, Reports).
- Built with **Tailwind CSS** and **ShadCN UI** components.
- Uses **Lucide icons** for a professional, modern look.
- **Toast notifications** for success/error messages.
- **Responsive design** for both desktop and mobile.
- **Dark/Light mode toggle** for better user comfort.

### 💾 Data Handling
- Currently uses **mock data (JSON/local state)** to simulate database operations.
- Placeholder API functions included for:
  - `getItems()`
  - `addItem()`
  - `updateItem()`
  - `deleteItem()`
- Future-ready for backend integration (Firebase, Express, or Supabase).

---

## 🧭 Dashboard Summary
At the top of the dashboard, quick stats display:
- Total Lost Items  
- Total Found Items  
- Total Returned Items

---

## 🖼️ Screenshots

> Add your actual images in the `/public` or `/assets` folder and rename them accordingly.

### 🏠 Dashboard View
![Dashboard Screenshot](public/dashboard.png)

### ➕ Add Item Modal
![Add Item Modal](public/add-item.png)

### 🌓 Dark Mode
![Dark Mode View](public/dark-mode.png)

---

## 🛠️ Tech Stack

- **React.js**  
- **Tailwind CSS**  
- **ShadCN UI**  
- **Lucide Icons**  
- **Vercel Deployment**  
- **v0.app Builder Integration**

---

## ⚙️ Installation & Setup (Local Development)

Follow these steps to run the project locally:

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/vit-lost-and-found.git
