import type { ReactElement } from 'react'
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
import Dashboard from './pages/Dashboard/Dashboard'
import Companies from './pages/Companies/Companies'
import User from './pages/Users/User'
import Roles from './pages/Roles/Roles'
import Permissions from './pages/Permissions/Permissions'
import Leads from './pages/Leads/Leads'
import Deals from './pages/Deals/Deals'
import Invoices from './pages/Invoices/Invoices'
import Attendance from './pages/Attendance/Attendance'

function RequirePermission({
  permission,
  children,
}: {
  permission: string
  children: ReactElement
}) {
  const { hasPermission } = useAuth()

  return hasPermission(permission) ? (
    children
  ) : (
    <Navigate to="/dashboard" replace />
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
              element={<Invoices />}
            />

            <Route
              path="/attendance"
              element={
                <RequirePermission permission="attendance.manage">
                  <Attendance />
                </RequirePermission>
              }
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
