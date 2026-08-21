import { LayoutDashboard, Building2, Handshake, FileText, CalendarCheck, WalletCards, LogOut } from "lucide-react";

import { NavLink } from "react-router-dom"
import { useAuth } from "../../auth/AuthContext"

const navigation = [
    {
        name: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        name: 'Companies',
        path: '/companies',
        icon: Building2,
    },
    {
        name: 'Leads',
        path: '/leads',
        icon: Handshake,
    },
    {
        name: 'Deals',
        path: 'deals',
        icon: FileText,
    },
    {
        name: 'Invoices',
        path: '/invoices',
        icon: FileText,
    },
    {
        name: 'Attendance',
        path: '/attendance',
        icon: CalendarCheck,
    },
    {
        name: 'Payroll',
        path: '/payroll',
        icon: WalletCards,
    },
]

function Sidebar() {
    const { logout } = useAuth()

    return (
        <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">

            <div className="flex h-16 items-center border-b border-slate-200 px-6">
                <h1 className="text-xl font-bold text-slate-900">
                    Leads CRM
                </h1>
            </div>

            <nav className="flex-1 space-y-1 p-4">
                {navigation.map((item) => {
                    const Icon = item.icon

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`
                            }
                        >
                            <Icon size={18} />

                            <span>
                                {item.name}
                            </span>
                        </NavLink>
                    )
                })}
            </nav>

            <div className="border-t border-slate-200 p-4">
                <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600">

                    <LogOut size={18} />
                    <span>
                        Logout
                    </span>
                </button>
            </div>

        </aside>
    )
}

export default Sidebar