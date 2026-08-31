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
import SalaryComponents from './pages/SalaryComponents/SalaryComponents'
import SalaryStructures from './pages/SalaryStructures/SalaryStructures'
import SalaryStructureDetail from './pages/SalaryStructures/SalaryStructureDetail'
import EmployeeSalaries from './pages/EmployeeSalaries/EmployeeSalaries'
import Payroll from './pages/Payroll/Payroll'
import PayrollDetail from './pages/Payroll/PayrollDetail'

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
              element={<Payroll />}
            />

            <Route
              path="/payroll/:payrollId"
              element={<PayrollDetail />}
            />

            <Route
              path="/salary-components"
              element={
                <RequirePermission permission="salary_components.view">
                  <SalaryComponents />
                </RequirePermission>
              }
            />

            <Route
              path="/salary-structures"
              element={
                <RequirePermission permission="salary_structures.view">
                  <SalaryStructures />
                </RequirePermission>
              }
            />

            <Route
              path="/salary-structures/:structureId"
              element={
                <RequirePermission permission="salary_structures.view">
                  <SalaryStructureDetail />
                </RequirePermission>
              }
            />

            <Route
              path="/employee-salaries"
              element={
                <RequirePermission permission="employee_salaries.view">
                  <EmployeeSalaries />
                </RequirePermission>
              }
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
