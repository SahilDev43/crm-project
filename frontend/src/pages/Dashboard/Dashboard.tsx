import { useAuth } from '../../auth/AuthContext'
import AttendanceWidget from '../Attendance/AttendanceWidget'

function getGreeting(): string {
    const hour = new Date().getHours()

    if (hour < 12) {
        return 'Good morning'
    }

    if (hour < 18) {
        return 'Good afternoon'
    }

    return 'Good evening'
}

function Dashboard() {
    const { user } = useAuth()

    const fullDate = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })

    return (
        <div className="mx-auto max-w-6xl">
            <header className="flex flex-wrap items-end justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {getGreeting()}
                        {user?.first_name
                            ? `, ${user.first_name}`
                            : ''}{' '}
                        👋
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Here's your workspace at a glance.
                    </p>
                </div>

                <p className="text-sm text-slate-400">{fullDate}</p>
            </header>

            <div className="mt-6">
                <AttendanceWidget />
            </div>
        </div>
    )
}

export default Dashboard
