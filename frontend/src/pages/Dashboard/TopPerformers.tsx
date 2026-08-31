import {
    cachedDealStatuses,
    countDeals,
    findStatus,
} from '../../api/dashboard'
import { getUsers } from '../../api/users'
import { employeeName } from '../../lib/payroll'
import { formatCount } from './dashboardData'
import {
    WidgetCard,
    WidgetEmpty,
    WidgetError,
    WidgetSkeleton,
} from './widgetChrome'
import { useWidget } from './useWidget'

interface PerformerRow {
    id: number
    name: string
    initials: string
    deals: number
    won: number
}

const MAX_USERS = 12

function initialsOf(first: string, last: string): string {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || 'U'
}

function TopPerformers() {
    const { data, loading, error, reload } = useWidget<PerformerRow[]>(
        async () => {
            const [userList, statuses] = await Promise.all([
                getUsers({ page: 1, page_size: MAX_USERS }),
                cachedDealStatuses(),
            ])

            const wonStatus = findStatus(statuses, ['won', 'closedwon'])

            const rows = await Promise.all(
                userList.items.map(async (user) => {
                    const [deals, won] = await Promise.all([
                        countDeals({ assigned_to: user.id }),
                        wonStatus
                            ? countDeals({
                                  assigned_to: user.id,
                                  deal_status_id: wonStatus.id,
                              })
                            : Promise.resolve(0),
                    ])

                    return {
                        id: user.id,
                        name: employeeName(user, user.id),
                        initials: initialsOf(
                            user.first_name,
                            user.last_name,
                        ),
                        deals,
                        won,
                    }
                }),
            )

            return rows
                .filter((row) => row.deals > 0 || row.won > 0)
                .sort((a, b) => b.won - a.won || b.deals - a.deals)
                .slice(0, 6)
        },
        [],
    )

    const maxWon = data
        ? Math.max(...data.map((row) => row.won), 1)
        : 1

    return (
        <WidgetCard title="Top Performing Users" bare>
            {loading ? (
                <div className="p-4 sm:p-5">
                    <WidgetSkeleton rows={5} />
                </div>
            ) : error ? (
                <div className="p-4 sm:p-5">
                    <WidgetError onRetry={reload} />
                </div>
            ) : !data || data.length === 0 ? (
                <div className="p-4 sm:p-5">
                    <WidgetEmpty message="No deal activity yet" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[26rem] text-left">
                        <thead>
                            <tr className="text-[11px] uppercase tracking-wide text-slate-400">
                                <th className="px-4 py-2.5 font-semibold sm:px-5">
                                    Employee
                                </th>
                                <th className="px-4 py-2.5 font-semibold sm:px-5">
                                    Deals
                                </th>
                                <th className="px-4 py-2.5 font-semibold sm:px-5">
                                    Won
                                </th>
                                <th className="hidden px-5 py-2.5 sm:table-cell" />
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {data.map((row) => (
                                <tr key={row.id}>
                                    <td className="px-4 py-3 sm:px-5">
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
                                                {row.initials}
                                            </span>
                                            <span className="whitespace-nowrap text-sm font-medium text-slate-800">
                                                {row.name}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-sm text-slate-600 sm:px-5">
                                        {formatCount(row.deals)}
                                    </td>

                                    <td className="px-4 py-3 text-sm font-medium text-slate-800 sm:px-5">
                                        {formatCount(row.won)}
                                    </td>

                                    <td className="hidden px-5 py-3 sm:table-cell">
                                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-emerald-400"
                                                style={{
                                                    width: `${(row.won / maxWon) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </WidgetCard>
    )
}

export default TopPerformers
