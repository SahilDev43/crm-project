import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from '../auth/AuthContext'

function ProtectedRoute() {
    const {
        isAuthenticated,
        isLoading
    } = useAuth()

    if (isLoading) {
        return (
            <div className="flex min-h-screen item-center justify-center bg-slate-100">
                <div className="text-sm text-slate-500">
                    Loading...
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />

}

export default ProtectedRoute