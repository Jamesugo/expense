# 💰 ExpenseTracker

A **modern, full-stack personal finance tracker** built with React, Tailwind CSS, Framer Motion, Node.js, Express, and MongoDB.

![ExpenseTracker Dashboard](https://via.placeholder.com/800x400/3b82f6/ffffff?text=ExpenseTracker+Dashboard)

---

## ✨ Features

- 📅 **Interactive Calendar** – Click any day to view, add, edit, or delete expenses
- 📊 **Rich Analytics** – Pie chart, area chart, and bar chart powered by Recharts
- 🔐 **Authentication** – Email/password + Google Sign-In with JWT tokens
- 🌙 **Dark / Light Mode** – Smooth theme switching with persistent preference
- 💱 **Multi-Currency** – 20+ currencies with proper locale formatting
- 📤 **Export** – Download expenses as PDF, CSV, or Excel
- 🔍 **Advanced Filters** – Search, category, date range, amount range
- ⚡ **Loading Skeletons** – Smooth loading states on every page
- 📱 **Responsive** – Mobile, tablet, and desktop friendly
- 🎨 **Premium Design** – Notion/Linear-inspired minimal UI

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + JSX |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form |
| Auth | JWT + Google OAuth 2.0 |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Export | jsPDF + xlsx |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Cloud project (optional, for Google Sign-In)

### 1. Clone & Install

```bash
git clone <your-repo>
cd expense
npm install:all
```

Or install manually:
```bash
npm install                # root (concurrently)
cd server && npm install   # backend
cd ../client && npm install # frontend
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/expensetracker
JWT_SECRET=your_long_random_secret_here
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
CLIENT_URL=http://localhost:5173
```

Edit `client/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 3. Run the Application

```bash
# From the root directory – runs both server & client
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/health

---

## 📁 Project Structure

```
expense/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── api/            # Axios helpers
│       ├── components/     # Reusable UI, layout, calendar, expenses
│       ├── contexts/       # AuthContext, ThemeContext
│       ├── pages/          # Dashboard, Calendar, Expenses, Analytics, Settings
│       └── utils/          # formatCurrency, dateHelpers, exportHelpers
└── server/                 # Node.js / Express backend
    ├── config/             # MongoDB connection
    ├── controllers/        # Business logic
    ├── middleware/         # JWT auth, error handler
    ├── models/             # User, Expense schemas
    └── routes/             # API routes
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register with email/password |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/google` | Google OAuth sign-in |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/expenses` | List expenses (with filters) |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/expenses/summary` | Get totals + analytics data |
| GET | `/api/expenses/date/:date` | Get expenses for a specific day |
| GET | `/api/expenses/monthly-calendar/:ym` | Get daily totals for calendar |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/currency` | Update currency preference |
| PUT | `/api/users/theme` | Update theme preference |
| PUT | `/api/users/password` | Change password |
| DELETE | `/api/users/account` | Delete account |

---

## 📋 Expense Categories

Food · Transport · Shopping · Bills · Entertainment · Health · Education · Utilities · Travel · Other

---

## 🌐 Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Add `http://localhost:5173` to Authorized JavaScript origins
5. Copy the Client ID into `.env` and `client/.env`

> Email/password auth works without Google OAuth configured.

---

## 📄 License

MIT