# 🎓 CampusOS AI

> The Operating System for College Life

CampusOS AI is a mobile-first student productivity platform designed to help college students manage notes, tasks, assignments, and AI-powered assistance in one place.

---

## 🚀 Features

### Authentication
- Login
- Signup
- JWT Authentication

### Dashboard
- Student Dashboard
- Quick Actions
- Recent Activity

### Notes Module
- Upload Notes
- Search Notes
- Download Notes

### Tasks Module
- Create Tasks
- Mark Complete
- Due Dates

### AI Assistant
- AI Chat Support

### Profile
- Edit Profile
- Logout

---

## 🛠 Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL

### Authentication
- JWT

---

## 📂 Project Structure

```plaintext
CampusOS-AI/
├── Backend/                # Node.js, Express.js, PostgreSQL
│   ├── src/
│   │   ├── api/            # API routes and controllers
│   │   ├── config/         # Configuration files (db, etc.)
│   │   ├── middleware/     # Custom Express middleware
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── .env.example        # Example environment variables
│   └── package.json
│
├── Frontend/               # React, TypeScript, Tailwind CSS
│   ├── src/
│   │   ├── assets/         # Images, fonts, etc.
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service calls
│   │   ├── state/          # State management (e.g., Zustand, Redux)
│   │   ├── styles/         # Global styles
│   │   └── utils/          # Utility functions
│   └── package.json
│
└── README.md
```

---

## 🏁 Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm or yarn
- PostgreSQL

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/CampusOS-AI.git
cd CampusOS-AI
```

### 2. Backend Setup

```bash
# Navigate to the backend directory
cd Backend

# Install dependencies
npm install

# Set up environment variables by copying the example file
cp .env.example .env

# Update .env with your PostgreSQL connection string and a JWT secret

# Run the backend server
npm run dev
```

### 3. Frontend Setup

```bash
# Navigate to the frontend directory
cd ../Frontend

# Install dependencies
npm install

# Run the frontend development server
npm start
```

---

## 👥 Team
- Divyansh Singh
- Fariza Sultana (Project Lead)

---

## 🚧 Current Status

Under Development

---

Built with ❤️ for Students.

---

## 📦 Production Build

### Frontend

```bash
cd Frontend
npm run build
```
The production-ready static files will be in the `Frontend/dist` directory.

### Backend

```bash
cd Backend
npm run build
```
The compiled JavaScript files will be in the `Backend/dist` directory. Ensure your `NODE_ENV` is set to `production` when deploying.
