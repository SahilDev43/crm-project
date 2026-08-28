import { LayoutDashboard, Building2, Handshake, FileText, CalendarCheck, WalletCards, LogOut, User, ShieldCheck, KeyRound, ChevronDown } from "lucide-react";
import { useState } from "react"

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
        path: '/deals',
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
        permission: 'attendance.manage',
    },
    {
        name: 'Payroll',
        path: '/payroll',
        icon: WalletCards,
    },
    {
        name: 'Users',
        path: '/users',
        icon: User,
    },
    {
        name: 'Manage Permissions',
        icon: ShieldCheck,
        children: [
            {
                name: 'Permissions',
                path: '/permissions',
                icon: KeyRound,
            },
            {
                name: 'Roles',
                path: '/roles',
                icon: ShieldCheck,
            },
        ],
    },
]

function Sidebar() {
    const { logout, hasPermission } = useAuth()
    const [isPermissionsOpen, setIsPermissionsOpen] = useState(false)

    const visibleNavigation = navigation.filter((item) => {
        const permission = (item as { permission?: string }).permission

        return !permission || hasPermission(permission)
    })

    return (
        <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">

            <div className="flex h-16 items-center border-b border-slate-200 px-6">
                <h1 className="text-xl font-bold text-slate-900">
                    Leads CRM
                </h1>
            </div>

            <nav className="flex-1 space-y-1 p-4">
                {visibleNavigation.map((item) => {
                    const Icon = item.icon

                    if (item.children) {
                        return (
                            <div key={item.name}>
                                <button
                                    type="button"
                                    onClick={() => setIsPermissionsOpen((isOpen) => !isOpen)}
                                    aria-expanded={isPermissionsOpen}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <Icon size={18} />

                                    <span className="flex-1">
                                        {item.name}
                                    </span>

                                    <ChevronDown
                                        size={16}
                                        className={`transition-transform ${isPermissionsOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {isPermissionsOpen && (
                                    <div className="ml-4 space-y-1 border-l border-slate-200 pl-3">
                                        {item.children.map((child) => {
                                            const ChildIcon = child.icon

                                            return (
                                                <NavLink
                                                    key={child.path}
                                                    to={child.path}
                                                    className={({ isActive }) =>
                                                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive
                                                            ? 'bg-red-50 text-red-600'
                                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                        }`
                                                    }
                                                >
                                                    <ChildIcon size={16} />

                                                    <span>
                                                        {child.name}
                                                    </span>
                                                </NavLink>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    }

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive
                                    ? 'bg-red-50 text-red-600'
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