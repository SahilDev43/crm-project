import { Handshake, UserPlus, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { getDeals } from '../../api/deals'
import { getLeads } from '../../api/leads'
import { getUsers } from '../../api/users'
import { timeAgo } from './dashboardData'
import {
    WidgetCard,
    WidgetEmpty,
    WidgetError,
    WidgetSkeleton,
} from './widgetChrome'
import { useWidget } from './useWidget'

interface FeedItem {
    key: string
    icon: LucideIcon
    iconClass: string
    title: string
    subtitle: string
    at: string
}

interface RecentActivitiesProps {
    hasPermission: (permission: string) => boolean
}

const byNewest = (a: FeedItem, b: FeedItem): number =>
    new Date(b.at).getTime() - new Date(a.at).getTime()

function RecentActivities({ hasPermission }: RecentActivitiesProps) {
    const canLeads = hasPermission('leads.view')
    const canDeals = hasPermission('deals.view')
    const canUsers = hasPermission('users.view')

    const { data, loading, error, reload } = useWidget<FeedItem[]>(
        async () => {
            const [leads, deals, users] = await Promise.all([
                canLeads
                    ? getLeads({ page: 1, page_size: 5 })
                    : Promise.resolve(null),
                canDeals
                    ? getDeals({ page: 1, page_size: 5 })
                    : Promise.resolve(null),
                canUsers
                    ? getUsers({ page: 1, page_size: 5 })
                    : Promise.resolve(null),
            ])

            const items: FeedItem[] = []

            for (const lead of leads?.items ?? []) {
                items.push({
                    key: `lead-${lead.id}`,
                    icon: UserPlus,
                    iconClass: 'bg-blue-50 text-blue-600',
                    title: 'New lead added',
                    subtitle:
                        lead.client_company_name ||
                        lead.first_name ||
                        lead.email ||
                        `Lead #${lead.id}`,
                    at: lead.created_at,
                })
            }

            for (const deal of deals?.items ?? []) {
                items.push({
                    key: `deal-${deal.id}`,
                    icon: Handshake,
                    iconClass: 'bg-purple-50 text-purple-600',
                    title: 'New deal created',
                    subtitle: deal.title,
                    at: deal.created_at,
                })
            }

            for (const user of users?.items ?? []) {
                items.push({
                    key: `user-${user.id}`,
                    icon: UserRound,
                    iconClass: 'bg-slate-100 text-slate-600',
                    title: 'New user created',
                    subtitle:
                        `${user.first_name} ${user.last_name}`.trim() ||
                        user.email,
                    at: user.created_at,
                })
            }

            return items.sort(byNewest).slice(0, 6)
        },
        [canLeads, canDeals, canUsers],
    )

    return (
        <WidgetCard title="Recent Activity" bare>
            <div className="p-4 sm:p-5">
                {loading ? (
                    <WidgetSkeleton rows={5} />
                ) : error ? (
                    <WidgetError onRetry={reload} />
                ) : !data || data.length === 0 ? (
                    <WidgetEmpty message="No recent activity" />
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {data.map((item) => {
                            const Icon = item.icon

                            return (
                                <li
                                    key={item.key}
                                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                                >
                                    <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconClass}`}
                                    >
                                        <Icon size={16} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-slate-800">
                                            {item.title}
                                        </p>
                                        <p className="truncate text-xs text-slate-400">
                                            {item.subtitle}
                                        </p>
                                    </div>

                                    <span className="whitespace-nowrap text-xs text-slate-400">
                                        {timeAgo(item.at)}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </WidgetCard>
    )
}

export default RecentActivities
