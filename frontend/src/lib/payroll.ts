/**
 * Shared formatting helpers and backend enum mappings for the payroll domain
 * (salary components, salary structures, employee salaries and payroll).
 *
 * The numeric codes here mirror `app/common/constants/payroll.py` on the
 * backend — they are the source of truth, this file only labels them.
 */

/** Format a rupee amount coming from the API (Decimal serialised as string). */
export const formatCurrency = (
    value: string | number | null | undefined,
): string => {
    if (value === null || value === undefined || value === '') {
        return '—'
    }

    const numeric = typeof value === 'number' ? value : Number(value)

    if (Number.isNaN(numeric)) {
        return String(value)
    }

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numeric)
}

export const formatDate = (value: string | null | undefined): string => {
    if (!value) {
        return '—'
    }

    const date = new Date(
        /[zZ]$/.test(value) || /\d{2}:\d{2}/.test(value)
            ? value
            : `${value}T00:00:00`,
    )

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return date.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export interface MonthOption {
    value: number
    label: string
}

export const MONTHS: MonthOption[] = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
]

export const monthName = (month: number): string =>
    MONTHS.find((entry) => entry.value === month)?.label ?? String(month)

/* --- Salary component type (ComponentType) --- */

export const COMPONENT_TYPE = {
    EARNING: 1,
    DEDUCTION: 2,
} as const

export const COMPONENT_TYPE_OPTIONS: MonthOption[] = [
    { value: COMPONENT_TYPE.EARNING, label: 'Earning' },
    { value: COMPONENT_TYPE.DEDUCTION, label: 'Deduction' },
]

export const componentTypeLabel = (value: number): string =>
    COMPONENT_TYPE_OPTIONS.find((entry) => entry.value === value)?.label ??
    `Type ${value}`

export const componentTypeBadge = (value: number): string =>
    value === COMPONENT_TYPE.EARNING
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-700'

/* --- Calculation type (CalculationType) --- */

export const CALCULATION_TYPE = {
    FIXED: 1,
    PERCENTAGE: 2,
} as const

export const CALCULATION_TYPE_OPTIONS: MonthOption[] = [
    { value: CALCULATION_TYPE.FIXED, label: 'Fixed' },
    { value: CALCULATION_TYPE.PERCENTAGE, label: 'Percentage' },
]

export const calculationTypeLabel = (value: number): string =>
    CALCULATION_TYPE_OPTIONS.find((entry) => entry.value === value)?.label ??
    `Type ${value}`

/* --- Calculation base (CalculationBase) --- */

export const CALCULATION_BASE = {
    BASIC: 1,
    GROSS: 2,
    COMPONENT: 3,
} as const

export const CALCULATION_BASE_OPTIONS: MonthOption[] = [
    { value: CALCULATION_BASE.BASIC, label: 'Basic Salary' },
    { value: CALCULATION_BASE.GROSS, label: 'Gross Salary' },
    { value: CALCULATION_BASE.COMPONENT, label: 'Another Component' },
]

export const calculationBaseLabel = (value: number | null): string => {
    if (value === null) {
        return '—'
    }

    return (
        CALCULATION_BASE_OPTIONS.find((entry) => entry.value === value)?.label ??
        `Base ${value}`
    )
}

/* --- Employee salary status --- */

export const SALARY_STATUS = {
    ACTIVE: 1,
    INACTIVE: 2,
} as const

export const SALARY_STATUS_OPTIONS: MonthOption[] = [
    { value: SALARY_STATUS.ACTIVE, label: 'Active' },
    { value: SALARY_STATUS.INACTIVE, label: 'Inactive' },
]

export const salaryStatusLabel = (value: number): string =>
    SALARY_STATUS_OPTIONS.find((entry) => entry.value === value)?.label ??
    `Status ${value}`

export const salaryStatusBadge = (value: number): string =>
    value === SALARY_STATUS.ACTIVE
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-slate-100 text-slate-600'

/* --- Payroll status (PayrollStatus) --- */

export const PAYROLL_STATUS = {
    DRAFT: 1,
    PROCESSED: 2,
    PAID: 3,
    CANCELLED: 4,
} as const

export const PAYROLL_STATUS_OPTIONS: MonthOption[] = [
    { value: PAYROLL_STATUS.DRAFT, label: 'Draft' },
    { value: PAYROLL_STATUS.PROCESSED, label: 'Processed' },
    { value: PAYROLL_STATUS.PAID, label: 'Paid' },
    { value: PAYROLL_STATUS.CANCELLED, label: 'Cancelled' },
]

export const payrollStatusLabel = (value: number): string =>
    PAYROLL_STATUS_OPTIONS.find((entry) => entry.value === value)?.label ??
    `Status ${value}`

export const payrollStatusBadge = (value: number): string => {
    switch (value) {
        case PAYROLL_STATUS.PAID:
            return 'bg-emerald-100 text-emerald-700'
        case PAYROLL_STATUS.PROCESSED:
            return 'bg-blue-100 text-blue-700'
        case PAYROLL_STATUS.CANCELLED:
            return 'bg-red-100 text-red-700'
        default:
            return 'bg-slate-100 text-slate-600'
    }
}

/** Build a "First Last" label from a user-like record, falling back to an id. */
export const employeeName = (
    user: { first_name: string; last_name: string } | null | undefined,
    fallbackId: number,
): string => {
    if (!user) {
        return `User #${fallbackId}`
    }

    const name = `${user.first_name} ${user.last_name}`.trim()

    return name || `User #${fallbackId}`
}
