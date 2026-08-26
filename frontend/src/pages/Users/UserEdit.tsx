import { useEffect, useState } from 'react'
import { X, Upload, Trash2 } from 'lucide-react'

import {
  getUser,
  updateUser,
  uploadUserProfileImage,
  removeUserProfileImage,
} from '../../api/users'
import { getCompanies } from '../../api/companies'
import { getRoles } from '../../api/roles'
import { getAssetUrl } from '../../api/client'

import type { User, UserUpdate } from '../../types/user'
import type { Company } from '../../types/company'
import type { Role } from '../../types/role'

interface UserEditProps {
  userId: number
  onClose: () => void
  onSuccess: () => void
}

function UserEdit({
  userId,
  onClose,
  onSuccess,
}: UserEditProps) {
  const [user, setUser] = useState<User | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [roles, setRoles] = useState<Role[]>([])

  const [form, setForm] = useState<UserUpdate>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    company_id: null,
    role_id: null,
    is_active: true,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null)
      return
    }

    const previewUrl = URL.createObjectURL(imageFile)
    setImagePreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [imageFile])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError('')

        const [
          userData,
          companiesData,
          rolesData,
        ] = await Promise.all([
          getUser(userId),
          getCompanies({ page_size: 100 }),
          getRoles(),
        ])

        setUser(userData)
        setCompanies(companiesData.items)
        setRoles(rolesData)

        setForm({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          phone: userData.phone ?? '',
          password: '',
          company_id: userData.company_id,
          role_id: userData.role_id,
          is_active: userData.is_active,
        })

        setImageFile(null)
        setRemoveExistingImage(false)
      } catch (error: any) {
        if (error.response?.data?.detail) {
          setError(error.response.data.detail)
        } else {
          setError('Unable to load user.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [userId])

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]:
        name === 'company_id'
          ? value ? Number(value) : null
          : name === 'role_id'
            ? value ? Number(value) : null
            : name === 'is_active'
              ? value === 'true'
              : value,
    }))
  }

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('The image must be 5 MB or smaller.')
      event.target.value = ''
      return
    }

    setError('')
    setImageFile(file)
    setRemoveExistingImage(false)
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError('')

    if (!form.company_id) {
      setError('Please select a company.')
      return
    }

    try {
      setSaving(true)

      const updateData: UserUpdate = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || null,
        company_id: form.company_id,
        role_id: form.role_id,
        is_active: form.is_active,
      }

      // Only send a password when the user entered one.
      if (form.password) {
        updateData.password = form.password
      }

      await updateUser(userId, updateData)

      if (imageFile) {
        await uploadUserProfileImage(userId, imageFile)
      } else if (user?.profile_image && removeExistingImage) {
        await removeUserProfileImage(userId)
      }

      onSuccess()
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else {
        setError('Unable to update user.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Edit User
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Update user information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="max-h-[70vh] overflow-y-auto p-6">

            {loading ? (
              <div className="py-10 text-center text-sm text-slate-500">
                Loading user...
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {user && (
                  <div className="mb-5 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Editing user #{user.id}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Profile Photo
                    </label>

                    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 p-4">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="New profile photo preview"
                          className="h-16 w-16 rounded-full border border-slate-200 object-cover"
                        />
                      ) : user?.profile_image && !removeExistingImage ? (
                        <img
                          src={getAssetUrl(user.profile_image)}
                          alt={`${user.first_name} ${user.last_name}`}
                          className="h-16 w-16 rounded-full border border-slate-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-600">
                          {(form.first_name ?? '').charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                          <Upload size={16} />
                          {imageFile || user?.profile_image ? 'Replace photo' : 'Choose photo'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="mt-2 text-xs text-slate-500">
                          JPG, PNG, or WebP, up to 5 MB.
                        </p>
                      </div>

                      {(imageFile || (user?.profile_image && !removeExistingImage)) && (
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null)
                            setRemoveExistingImage(Boolean(user?.profile_image))
                          }}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      First Name *
                    </label>

                    <input
                      name="first_name"
                      value={form.first_name ?? ''}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Last Name *
                    </label>

                    <input
                      name="last_name"
                      value={form.last_name ?? ''}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Email *
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={form.email ?? ''}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Phone
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone ?? ''}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      New Password
                    </label>

                    <input
                      type="password"
                      name="password"
                      value={form.password ?? ''}
                      onChange={handleChange}
                      placeholder="Leave blank to keep current"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Company *
                    </label>

                    <select
                      name="company_id"
                      value={form.company_id ?? ''}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500"
                    >
                      <option value="">
                        Select company
                      </option>

                      {companies.map((company) => (
                        <option
                          key={company.id}
                          value={company.id}
                        >
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Role
                    </label>

                    <select
                      name="role_id"
                      value={form.role_id ?? ''}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500"
                    >
                      <option value="">
                        No role
                      </option>

                      {roles.map((role) => (
                        <option
                          key={role.id}
                          value={role.id}
                        >
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Status
                    </label>

                    <select
                      name="is_active"
                      value={String(form.is_active)}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500"
                    >
                      <option value="true">
                        Active
                      </option>

                      <option value="false">
                        Inactive
                      </option>
                    </select>
                  </div>

                </div>
              </>
            )}

          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || saving}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : 'Save Changes'}
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}

export default UserEdit