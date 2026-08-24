import { useEffect, useState } from 'react'
import { X, Upload, Trash2 } from 'lucide-react'

import { getCompany, uploadCompanyLogo, removeCompanyLogo } from '../../api/companies'
import type { Company } from '../../types/company'
import { getCompanyApiKeys, deleteCompanyApiKey } from '../../api/companies'
import type { CompanyApiKey } from '../../types/company'

import CompanyApiKeyForm from './CompanyApiKeyForm'
import ApiKeyCreatedModal from './ApiKeyCreatedModal'

interface CompanyViewProps {
    companyId: number
    onClose: () => void
}

function CompanyView({
    companyId,
    onClose,
}: CompanyViewProps) {
    const [company, setCompany] = useState<Company | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [removingLogo, setRemovingLogo] = useState(false)
    const [logoError, setLogoError] = useState('')
    const [apiKeys, setApiKeys] = useState<CompanyApiKey[]>([])
    const [loadingApiKeys, setLoadingApiKeys] = useState(false)
    const [showApiKeyForm, setShowApiKeyForm] = useState(false)
    const [createdApiKey, setCreatedApiKey] = useState<string | null>(null)

    useEffect(() => {
        const loadCompany = async () => {
            try {
                setLoading(true)
                setError('')

                const data = await getCompany(companyId)

                setCompany(data)
            } catch (error: any) {
                if (error.response?.data?.detail) {
                    setError(error.response.data.detail)
                } else {
                    setError('Unable to load company.')
                }
            } finally {
                setLoading(false)
            }
        }

        loadCompany()
        loadApiKeys()
    }, [companyId])

    const handleLogoUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0]

        if (!file) {
            return
        }

        setLogoError('')

        try {
            setUploadingLogo(true)

            const updatedCompany =
                await uploadCompanyLogo(
                    companyId,
                    file
                )

            setCompany(updatedCompany)
        } catch (error: any) {
            if (error.response?.data?.detail) {
                setLogoError(
                    error.response.data.detail
                )
            } else {
                setLogoError(
                    'Unable to upload company logo.'
                )
            }
        } finally {
            setUploadingLogo(false)

            event.target.value = ''
        }
    }

    const handleLogoRemove = async () => {
        if (!company?.logo) {
            return
        }

        try {
            setRemovingLogo(true)
            setLogoError('')

            const updatedCompany =
                await removeCompanyLogo(companyId)

            setCompany(updatedCompany)
        } catch (error: any) {
            if (error.response?.data?.detail) {
                setLogoError(
                    error.response.data.detail
                )
            } else {
                setLogoError(
                    'Unable to remove company logo.'
                )
            }
        } finally {
            setRemovingLogo(false)
        }
    }

    const loadApiKeys = async () => {
        try {
            setLoadingApiKeys(true)

            const data = await getCompanyApiKeys(companyId)

            setApiKeys(data)
        } catch {
            setLogoError('Unable to load API keys.')
        } finally {
            setLoadingApiKeys(false)
        }
    }

    const handleDeleteApiKey = async (key: CompanyApiKey) => {
        try {
            await deleteCompanyApiKey(
                companyId,
                key.id
            )

            await loadApiKeys()
        } catch {
            setLogoError('Unable to revoke API key.')
        }
    }

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                        onClose()
                    }
                }}
            >
                <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                Company Details
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                View company information.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X size={20} />
                        </button>

                    </div>

                    {/* Body */}
                    <div className="p-6">

                        {loading && (
                            <div className="py-10 text-center text-sm text-slate-500">
                                Loading company...
                            </div>
                        )}

                        {!loading && error && (
                            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        {!loading && !error && company && (
                            <div className="space-y-6">

                                {/* Company heading */}
                                <div className="flex items-center gap-4">

                                    <div className="flex items-center gap-4">

                                        {company.logo ? (
                                            <img
                                                src={company.logo}
                                                alt={company.name}
                                                className="h-20 w-20 rounded-xl border border-slate-200 object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-blue-50 text-2xl font-bold text-blue-600">
                                                {company.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-2">

                                            <div className="flex items-center gap-2">

                                                <label
                                                    className={`flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 ${uploadingLogo
                                                        ? 'pointer-events-none opacity-50'
                                                        : ''
                                                        }`}
                                                >
                                                    <Upload size={15} />

                                                    {uploadingLogo
                                                        ? 'Uploading...'
                                                        : company.logo
                                                            ? 'Change Logo'
                                                            : 'Upload Logo'}

                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleLogoUpload}
                                                        disabled={uploadingLogo}
                                                        className="hidden"
                                                    />
                                                </label>

                                                {company.logo && (
                                                    <button
                                                        type="button"
                                                        onClick={handleLogoRemove}
                                                        disabled={removingLogo}
                                                        className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <Trash2 size={15} />

                                                        {removingLogo
                                                            ? 'Removing...'
                                                            : 'Remove'}
                                                    </button>
                                                )}

                                            </div>

                                            {logoError && (
                                                <p className="text-xs text-red-600">
                                                    {logoError}
                                                </p>
                                            )}

                                        </div>

                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">
                                            {company.name}
                                        </h3>

                                        <p className="text-sm text-slate-500">
                                            Company ID: {company.id}
                                        </p>
                                    </div>

                                    <span
                                        className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${company.is_active
                                            ? 'bg-green-50 text-green-600'
                                            : 'bg-slate-100 text-slate-500'
                                            }`}
                                    >
                                        {company.is_active
                                            ? 'Active'
                                            : 'Inactive'}
                                    </span>

                                </div>

                                {/* Information */}
                                <div className="grid gap-5 sm:grid-cols-2">

                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-400">
                                            Company Name
                                        </p>

                                        <p className="mt-1 text-sm text-slate-900">
                                            {company.name}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-400">
                                            GST Number
                                        </p>

                                        <p className="mt-1 text-sm text-slate-900">
                                            {company.gst_number || '-'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-400">
                                            State
                                        </p>

                                        <p className="mt-1 text-sm text-slate-900">
                                            {company.state || '-'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-400">
                                            State Code
                                        </p>

                                        <p className="mt-1 text-sm text-slate-900">
                                            {company.state_code || '-'}
                                        </p>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <p className="text-xs font-medium uppercase text-slate-400">
                                            Address
                                        </p>

                                        <p className="mt-1 text-sm text-slate-900">
                                            {company.company_address || '-'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-400">
                                            Created
                                        </p>

                                        <p className="mt-1 text-sm text-slate-900">
                                            {new Date(
                                                company.created_at
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-400">
                                            Last Updated
                                        </p>

                                        <p className="mt-1 text-sm text-slate-900">
                                            {new Date(
                                                company.updated_at
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                </div>

                            </div>
                        )}

                        <div className="border-t border-slate-200 pt-6">

                            <div className="mb-4 flex items-center justify-between">

                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        API Keys
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Manage API keys used to access this company.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowApiKeyForm(true)}
                                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                                >
                                    + Create API Key
                                </button>

                            </div>

                            {loadingApiKeys ? (
                                <div className="rounded-lg border border-slate-200 p-4 text-center text-sm text-slate-500">
                                    Loading API keys...
                                </div>
                            ) : apiKeys.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
                                    No API keys found.
                                </div>
                            ) : (
                                <div className="space-y-3">

                                    {apiKeys.map((key) => (

                                        <div
                                            key={key.id}
                                            className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                                        >

                                            <div>

                                                <p className="text-sm font-medium text-slate-900">
                                                    {key.name}
                                                </p>

                                                <p className="mt-1 font-mono text-xs text-slate-500">
                                                    {key.key_prefix}••••••••
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    Created{' '}
                                                    {new Date(
                                                        key.created_at
                                                    ).toLocaleDateString()}
                                                </p>

                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    void handleDeleteApiKey(key)
                                                }}
                                                className="rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                                            >
                                                Revoke
                                            </button>

                                        </div>

                                    ))}

                                </div>
                            )}

                        </div>

                    </div>

                    {/* Footer */}
                    <div className="flex justify-end border-t border-slate-200 px-6 py-4">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Close
                        </button>

                    </div>

                </div>
            </div>

            {showApiKeyForm && (
                <CompanyApiKeyForm
                    companyId={companyId}
                    onClose={() => setShowApiKeyForm(false)}
                    onSuccess={(apiKey) => {
                        setShowApiKeyForm(false)
                        setCreatedApiKey(apiKey)
                        loadApiKeys()
                    }}
                />
            )}

            {createdApiKey && (
                <ApiKeyCreatedModal
                    apiKey={createdApiKey}
                    onClose={() => setCreatedApiKey(null)}
                />
            )}
        </>
    )
}

export default CompanyView