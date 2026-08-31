/**
 * Which dashboard a user sees is derived from the permissions the backend
 * already grants their role — not from a hardcoded role name.
 *
 *   admin : company-wide CRM + people + finance + attendance
 *   hr    : people + company attendance
 *   user  : only their own work and attendance
 */
export type DashboardExperience = 'admin' | 'hr' | 'user'

export function resolveExperience(
    hasPermission: (permission: string) => boolean,
): DashboardExperience {
    if (hasPermission('leads.view') && hasPermission('deals.view')) {
        return 'admin'
    }

    if (
        hasPermission('attendance.manage') ||
        hasPermission('users.view')
    ) {
        return 'hr'
    }

    return 'user'
}
