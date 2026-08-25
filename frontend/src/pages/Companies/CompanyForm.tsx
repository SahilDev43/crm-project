import { useEffect, useState } from 'react'
import { X, Save, Upload, Trash2, Loader2 } from 'lucide-react'

import {
  createCompany,
  removeCompanyLogo,
  uploadCompanyLogo,
  updateCompany,
} from '../../api/companies'
import { getAssetUrl } from '../../api/client'

import type {
  Company,
  CompanyCreate,
  CompanyUpdate,
} from '../../types/company'

interface CompanyFormProps {
  company?: Company | null
  onClose: () => void
  onSuccess: () => void
}

function CompanyForm({
  company,
  onClose,
  onSuccess,
}: CompanyFormProps) {
  const isEditMode = Boolean(company)

  const [name, setName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [state, setState] = useState('')
  const [stateCode, setStateCode] = useState('')

  const [isActive, setIsActive] = useState(true)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [removeExistingLogo, setRemoveExistingLogo] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (company) {
      setName(company.name)
      setCompanyAddress(
        company.company_address ?? ''
      )
      setGstNumber(
        company.gst_number ?? ''
      )
      setState(company.state ?? '')
      setStateCode(
        company.state_code ?? ''
      )
      setIsActive(company.is_active)
    } else {
      setName('')
      setCompanyAddress('')
      setGstNumber('')
      setState('')
      setStateCode('')
      setIsActive(true)
    }

    setLogoFile(null)
    setLogoPreview(null)
    setRemoveExistingLogo(false)
    setError('')
  }, [company])

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null)
      return
    }

    const previewUrl = URL.createObjectURL(logoFile)
    setLogoPreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [logoFile])

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null

    if (!file) {
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      setError('Please choose a JPG, PNG, or WebP logo.')
      event.target.value = ''
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('The logo must be 2 MB or smaller.')
      event.target.value = ''
      return
    }

    setError('')
    setLogoFile(file)
    setRemoveExistingLogo(false)
  }

  const getErrorMessage = (error: any, fallback: string) => {
    const detail = error.response?.data?.detail

    if (typeof detail === 'string') {
      return detail
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => item?.msg)
        .filter((message): message is string => typeof message === 'string')

      if (messages.length > 0) {
        return messages.join('. ')
      }
    }

    return fallback
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      let savedCompany: Company

      if (company) {
        const data: CompanyUpdate = {
          name,
          company_address:
            companyAddress || null,
          gst_number:
            gstNumber || null,
          state:
            state || null,
          state_code:
            stateCode || null,
          is_active: isActive,
        }

        savedCompany = await updateCompany(
          company.id,
          data
        )
      } else {
        const data: CompanyCreate = {
          name,
          company_address:
            companyAddress || null,
          gst_number:
            gstNumber || null,
          state:
            state || null,
          state_code:
            stateCode || null,
        }

        savedCompany = await createCompany(data)
      }

      if (logoFile) {
        await uploadCompanyLogo(savedCompany.id, logoFile)
      } else if (company?.logo && removeExistingLogo) {
        await removeCompanyLogo(savedCompany.id)
      }

      onSuccess()
    } catch (error: any) {
      setError(
        getErrorMessage(
          error,
          isEditMode
            ? 'Unable to update company.'
            : 'Unable to create company.'
        )
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose()
        }
      }}
    >
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {isEditMode
                ? 'Edit Company'
                : 'Add Company'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditMode
                ? 'Update company information.'
                : 'Create a new company in your CRM.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>

        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>

          <div className="max-h-[70vh] overflow-y-auto p-6">

            {error && (
              <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-5">

              {/* Company Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Company Name
                  <span className="text-red-500"> *</span>
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                  minLength={2}
                  maxLength={255}
                  placeholder="Enter company name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* Company logo */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Company Logo
                </label>

                <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 p-4">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="New company logo preview"
                      className="h-16 w-16 rounded-xl border border-slate-200 object-cover"
                    />
                  ) : company?.logo && !removeExistingLogo ? (
                    <img
                      src={getAssetUrl(company.logo)}
                      alt={`${company.name} logo`}
                      className="h-16 w-16 rounded-xl border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-600">
                      {name.charAt(0).toUpperCase() || 'C'}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      <Upload size={16} />
                      {logoFile || company?.logo ? 'Replace logo' : 'Choose logo'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleLogoChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-2 text-xs text-slate-500">
                      JPG, PNG, or WebP, up to 2 MB.
                    </p>
                  </div>

                  {(logoFile || (company?.logo && !removeExistingLogo)) && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null)
                        setRemoveExistingLogo(Boolean(company?.logo))
                      }}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Company Address
                </label>

                <textarea
                  value={companyAddress}
                  onChange={(event) =>
                    setCompanyAddress(
                      event.target.value
                    )
                  }
                  rows={3}
                  placeholder="Enter company address"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* GST + State */}
              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    GST Number
                  </label>

                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(event) =>
                      setGstNumber(
                        event.target.value
                      )
                    }
                    maxLength={20}
                    placeholder="03AAAAA0000A1Z5"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    State
                  </label>

                  <input
                    type="text"
                    value={state}
                    onChange={(event) =>
                      setState(
                        event.target.value
                      )
                    }
                    maxLength={100}
                    placeholder="Punjab"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

              </div>

              {/* State Code */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  State Code
                </label>

                <input
                  type="text"
                  value={stateCode}
                  onChange={(event) =>
                    setStateCode(
                      event.target.value
                    )
                  }
                  maxLength={10}
                  placeholder="03"
                  className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* Active status - Edit only */}
              {isEditMode && (
                <div className="rounded-lg border border-slate-200 p-4">

                  <label className="flex cursor-pointer items-center gap-3">

                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(event) =>
                        setIsActive(
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                    />

                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Active Company
                      </p>

                      <p className="text-xs text-slate-500">
                        Inactive companies can remain in the CRM without being active.
                      </p>
                    </div>

                  </label>

                </div>
              )}

            </div>

          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}

              {loading
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                  ? 'Update Company'
                  : 'Create Company'}
            </button>

          </div>

        </form>

      </div>
    </div>
  )
}

export default CompanyForm
