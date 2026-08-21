import { Bell } from "lucide-react"
import { useAuth } from "../../auth/AuthContext"

function Header() {
    const { user } = useAuth()

    const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''
        }`.trim()

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">

            <div>
                <h2 className="text-lg font-semibold text-slate-900">
                    Leads CRM
                </h2>
            </div>

            <div className="flex items-center gap-4">

                <button
                    type="button"
                    className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                    <Bell size={20} />

                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                </button>

                <div className="flex items-center gap-3">

                    {user?.profile_image ? (
                        <img
                            src={user.profile_image}
                            alt={fullName}
                            className="h-9 w-9 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                            {user?.first_name?.charAt(0)}
                            {user?.last_name?.charAt(0)}
                        </div>
                    )}

                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-slate-900">
                            {fullName}
                        </p>

                        <p className="text-xs text-slate-500">
                            {user?.email}
                        </p>
                    </div>

                </div>

            </div>

        </header>
    )

}

export default Header