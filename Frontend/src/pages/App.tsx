import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import BottomNav from './components/BottomNav'

// Pages that should show the BottomNav
const NAV_ROUTES = ['/dashboard', '/profile']

function Layout() {
  const { pathname } = useLocation()
  const showNav = NAV_ROUTES.includes(pathname)

  return (
    <>
      <Routes>
        <Route path="/"          element={<LoginPage />} />
        <Route path="/signup"    element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile"   element={<ProfilePage />} />
        {/* Catch-all → redirect to login */}
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
