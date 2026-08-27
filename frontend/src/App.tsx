import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import { useAuth } from './auth/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import DashboardLayout from './components/layout/DashboardLayout'
import Companies from './pages/Companies/Companies'
import User from './pages/Users/User'
import Roles from './pages/Roles/Roles'
import Permissions from './pages/Permissions/Permissions'
import Leads from './pages/Leads/Leads'
import Deals from './pages/Deals/Deals'

function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-100 p-8">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            CRM Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Welcome, {user?.first_name} {user?.last_name}
          </p>
        </div>

      </div>

    </div>
  )
}

function ComingSoon() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Coming Soon
      </h1>

      <p className="mt-2 text-slate-600">
        This module will be implemented next.
      </p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route element={<ProtectedRoute />}>

          <Route element={<DashboardLayout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/companies"
              element={<Companies />}
            />

            <Route
              path="/leads"
              element={<Leads />}
            />

            <Route
              path="/deals"
              element={<Deals />}
            />

            <Route
              path="/invoices"
              element={<ComingSoon />}
            />

            <Route
              path="/attendance"
              element={<ComingSoon />}
            />

            <Route
              path="/payroll"
              element={<ComingSoon />}
            />

            <Route
              path="/users"
              element={<User />}
            />

            <Route
              path="/permissions"
              element={<Permissions />}
            />

            <Route
              path="/roles"
              element={<Roles />}
            />

          </Route>

        </Route>

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App
