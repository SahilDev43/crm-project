import { useEffect, useState } from 'react'
import { X, Upload, Trash2, Loader2, KeyRound, ShieldOff } from 'lucide-react'

import { getCompany, uploadCompanyLogo, removeCompanyLogo } from '../../api/companies'
import { getAssetUrl } from '../../api/client'
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
    const [apiKeyError, setApiKeyError] = useState('')
    const [showApiKeyForm, setShowApiKeyForm] = useState(false)
    const [createdApiKey, setCreatedApiKey] = useState<string | null>(null)
    const [keyToRevoke, setKeyToRevoke] = useState<CompanyApiKey | null>(null)
    const [revoking, setRevoking] = useState(false)

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
            setApiKeyError('')

            const data = await getCompanyApiKeys(companyId)

            setApiKeys(data)
        } catch {
            setApiKeyError('Unable to load API keys.')
        } finally {
            setLoadingApiKeys(false)
        }
    }

    const handleRevokeApiKey = async () => {
        if (!keyToRevoke) {
            return
        }

        try {
            setRevoking(true)
            setApiKeyError('')

            await deleteCompanyApiKey(
                companyId,
                keyToRevoke.id
            )

            setKeyToRevoke(null)

            await loadApiKeys()
        } catch {
            setApiKeyError('Unable to revoke API key.')
        } finally {
            setRevoking(false)
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
                            <div className="flex flex-col items-center gap-3 py-10 text-sm text-slate-500">
                                <Loader2 className="h-5 w-5 animate-spin text-red-600" />
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
                                                src={getAssetUrl(company.logo)}
                                                alt={company.name}
                                                className="h-20 w-20 rounded-xl border border-slate-200 object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-red-50 text-2xl font-bold text-red-600">
                                                {company.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-2">

                                            <div className="flex items-center gap-2">

                                                <label
                                                    className={`flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 ${uploadingLogo
                                                        ? 'pointer-events-none opacity-50'
                                                        : ''
                                                        }`}
                                                >
                                                    {uploadingLogo ? (
                                                        <Loader2 size={15} className="animate-spin" />
                                                    ) : (
                                                        <Upload size={15} />
                                                    )}

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
                                                        className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {removingLogo ? (
                                                            <Loader2 size={15} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={15} />
                                                        )}

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

                                {/* API Keys */}
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
                                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700"
                                        >
                                            + Create API Key
                                        </button>

                                    </div>

                                    {apiKeyError && (
                                        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                            {apiKeyError}
                                        </div>
                                    )}

                                    {loadingApiKeys ? (
                                        <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 p-4 text-center text-sm text-slate-500">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Loading API keys...
                                        </div>
                                    ) : apiKeys.length === 0 ? (
                                        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                                            <KeyRound className="h-5 w-5 text-slate-300" />
                                            No API keys found.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">

                                            {apiKeys.map((key) => (

                                                <div
                                                    key={key.id}
                                                    className={`flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-opacity ${key.is_active ? '' : 'opacity-50'
                                                        }`}
                                                >

                                                    <div>

                                                        <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                                                            {key.name}
                                                            {!key.is_active && (
                                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                                                    Revoked
                                                                </span>
                                                            )}
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

                                                    {key.is_active && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setKeyToRevoke(key)}
                                                            className="rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                                                        >
                                                            Revoke
                                                        </button>
                                                    )}

                                                </div>

                                            ))}

                                        </div>
                                    )}

                                </div>

                            </div>
                        )}

                    </div>

                    {/* Footer */}
                    <div className="flex justify-end border-t border-slate-200 px-6 py-4">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
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

            {keyToRevoke && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !revoking) {
                            setKeyToRevoke(null)
                        }
                    }}
                >
                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

                        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600">
                                <ShieldOff size={18} />
                            </div>

                            <h2 className="text-lg font-semibold text-slate-900">
                                Revoke API Key
                            </h2>

                        </div>

                        <div className="px-6 py-6">
                            <p className="text-sm leading-6 text-slate-600">
                                Are you sure you want to revoke
                                {' '}
                                <span className="font-semibold text-slate-900">
                                    {keyToRevoke.name}
                                </span>
                                ? Any requests using this key will stop working immediately.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">

                            <button
                                type="button"
                                disabled={revoking}
                                onClick={() => setKeyToRevoke(null)}
                                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={revoking}
                                onClick={handleRevokeApiKey}
                                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {revoking && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                {revoking ? 'Revoking...' : 'Revoke Key'}
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </>
    )
}

export default CompanyView
