import { useEffect, useState } from 'react'
import { X, Save } from 'lucide-react'

import {
  createCompany,
  updateCompany,
} from '../../api/companies'

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

    setError('')
  }, [company])

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
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

        await updateCompany(
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

        await createCompany(data)
      }

      onSuccess()
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setError(
          error.response.data.detail
        )
      } else {
        setError(
          isEditMode
            ? 'Unable to update company.'
            : 'Unable to create company.'
        )
      }
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                  className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
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
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

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