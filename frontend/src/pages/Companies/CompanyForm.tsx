import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"

import { createCompany } from '../../api/companies'

function CompanyForm() {
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [companyAddress, setCompanyAddress] = useState('')
    const [gstNumber, setGstNumber] = useState('')
    const [state, setState] = useState('')
    const [stateCode, setStateCode] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        setError('')
        setLoading(true)

        try {
            await createCompany({
                name,
                company_address: companyAddress || null,
                gst_number: gstNumber || null,
                state: state || null,
                state_code: stateCode || null
            })

            navigate('/companies')
        } catch (error: any) {
            if (error.response?.data?.detail) {
                setError(error.response.data.detail)
            } else {
                setError('Unable to create company.')
            }
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl">

            <div className="mb-6 flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => navigate('/companies')}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                >
                    <ArrowLeft size={20} />
                </button>

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Add Company
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Create a new company in your CRM.
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">

                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

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

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Company Address
                        </label>

                        <textarea
                            value={companyAddress}
                            onChange={(event) =>
                                setCompanyAddress(event.target.value)
                            }
                            rows={3}
                            placeholder="Enter company address"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                GST Number
                            </label>

                            <input
                                type="text"
                                value={gstNumber}
                                onChange={(event) =>
                                    setGstNumber(event.target.value)
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
                                    setState(event.target.value)
                                }
                                maxLength={100}
                                placeholder="Punjab"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            State Code
                        </label>

                        <input
                            type="text"
                            value={stateCode}
                            onChange={(event) =>
                                setStateCode(event.target.value)
                            }
                            maxLength={10}
                            placeholder="03"
                            className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">

                        <button
                            type="button"
                            onClick={() => navigate('/companies')}
                            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
                                ? 'Creating...'
                                : 'Create Company'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    )
}

export default CompanyForm