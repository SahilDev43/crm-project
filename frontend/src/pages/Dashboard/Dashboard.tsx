import type { ReactNode } from 'react'
import { CalendarDays } from 'lucide-react'

import { useAuth } from '../../auth/AuthContext'
import AttendanceWidget from '../Attendance/AttendanceWidget'
import { resolveExperience } from './experience'
import SummaryCards from './SummaryCards'
import AttendanceSummary from './AttendanceSummary'
import RecentActivities from './RecentActivities'
import LeadsByStatus from './LeadsByStatus'
import DealPipeline from './DealPipeline'
import TopPerformers from './TopPerformers'
import FinanceSummary from './FinanceSummary'

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

/** Grid whose column count adapts to how many widgets are actually shown. */
function AdaptiveRow({ children }: { children: ReactNode[] }) {
    const visible = children.filter(Boolean)

    if (visible.length === 0) {
        return null
    }

    const cols =
        visible.length === 1
            ? ''
            : visible.length === 2
              ? 'lg:grid-cols-2'
              : 'lg:grid-cols-3'

    return (
        <div className={`grid gap-5 sm:gap-6 ${cols}`}>{visible}</div>
    )
}

function Dashboard() {
    const { user, hasPermission } = useAuth()

    const experience = resolveExperience(hasPermission)
    const userId = user?.id ?? 0

    const canLeads = hasPermission('leads.view')
    const canDeals = hasPermission('deals.view')
    const canUsers = hasPermission('users.view')
    const canAttendanceMgmt = hasPermission('attendance.manage')

    const showSummaryCards = experience !== 'user' || canDeals
    const summaryColumns =
        experience === 'user' ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'

    const showLeadsByStatus = canLeads
    const showDealPipeline = canDeals
    const showFinance = experience === 'admin'
    const showTopPerformers = experience === 'admin' && canUsers && canDeals
    const showAttendanceSummary = canAttendanceMgmt

    const dealScope: 'company' | 'mine' =
        experience === 'user' ? 'mine' : 'company'

    const fullDate = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })

    return (
        <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">
            <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                        {getGreeting()}
                        {user?.first_name ? `, ${user.first_name}` : ''} 👋
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Here's your workspace at a glance.
                    </p>
                </div>

                <p className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
                    <CalendarDays size={15} className="text-slate-400" />
                    {fullDate}
                </p>
            </header>

            {showSummaryCards && (
                <div className={`grid grid-cols-1 gap-4 sm:gap-5 ${summaryColumns}`}>
                    <SummaryCards experience={experience} userId={userId} />
                </div>
            )}

            <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <AttendanceWidget />
                </div>

                <RecentActivities hasPermission={hasPermission} />
            </div>

            {showAttendanceSummary && <AttendanceSummary />}

            <AdaptiveRow>
                {[
                    showLeadsByStatus ? <LeadsByStatus key="leads" /> : null,
                    showDealPipeline ? (
                        <DealPipeline
                            key="pipeline"
                            scope={dealScope}
                            userId={userId}
                        />
                    ) : null,
                    showFinance ? <FinanceSummary key="finance" /> : null,
                ]}
            </AdaptiveRow>

            {showTopPerformers && <TopPerformers />}
        </div>
    )
}

export default Dashboard
