import { Outlet } from "react-router-dom"

import Sidebar from "./Sidebar"
import Header from "./Header"

function DashboardLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-100">

            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">

                <Header />

                <main className="min-h-0 flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>

            </div>

        </div>
    )
}

export default DashboardLayout