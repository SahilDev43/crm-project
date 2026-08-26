import { useEffect, useState, useRef } from 'react'
import { X, Camera, Trash2 } from 'lucide-react'

import { getUser, uploadUserProfileImage, removeUserProfileImage } from '../../api/users'
import { getCompanies } from '../../api/companies'
import { getRoles } from '../../api/roles'
import { getAssetUrl } from '../../api/client'
import type { User } from '../../types/user'
import type { Company } from '../../types/company'
import type { Role } from '../../types/role'

interface UserViewProps {
    userId: number
    onClose: () => void
}

function UserView({
    userId,
    onClose,
}: UserViewProps) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [companies, setCompanies] = useState<Company[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [uploadingImage, setUploadingImage] = useState(false)
    const [imageError, setImageError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const loadUser = async () => {
            try {
                setLoading(true)
                setError('')

                const [userData, companiesData, rolesData] =
                    await Promise.all([
                        getUser(userId),
                        getCompanies({ page_size: 100 }),
                        getRoles(),
                    ])

                setUser(userData)
                setCompanies(companiesData.items)
                setRoles(rolesData)
            } catch (error: any) {
                if (error.response?.data?.detail) {
                    setError(error.response.data.detail)
                } else {
                    setError('unable to load user.')
                }
            } finally {
                setLoading(false)
            }
        }
        loadUser()
    }, [userId])

    const companyName = companies.find((company) => company.id === user?.company_id)?.name ?? '-'
    const roleName = roles.find((role) => role.id === user?.role_id)?.name ?? '-'

    const handleImageUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0]

        if (!file) {
            return
        }

        setImageError('')

        if (!file.type.startsWith('image/')) {
            setImageError('Please select an image file.')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setImageError('Image size must be less than 5 MB.')
            return
        }

        try {
            setUploadingImage(true)

            const updateUser =
                await uploadUserProfileImage(
                    userId,
                    file
                )
            setUser(updateUser)
        } catch (error: any) {
            if (error.response?.data?.detail) {
                setImageError(
                    error.response.data.detail
                )
            } else {
                setImageError(
                    'Unable to upload profile image'
                )
            }
        } finally {
            setUploadingImage(false)

            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleRemoveImage = async () => {
        try {
            setUploadingImage(true)
            setImageError('')

            const updatedUser =
                await removeUserProfileImage(userId)

            setUser(updatedUser)
        } catch (error: any) {
            if (error.response?.data?.detail) {
                setImageError(
                    error.response.data.detail
                )
            } else {
                setImageError(
                    'Unable to remove profile image.'
                )
            }
        } finally {
            setUploadingImage(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            User Details
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            View user information
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={18} />
                    </button>

                </div>

                <div className="p-6">

                    {loading && (
                        <div className="py-10 text-center text-sm text-slate-500">
                            Loading user...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {!loading && !error && user && (
                        <div className="space-y-6">

                            <div className="flex items-center gap-4">

                                <div className="flex flex-col items-center">

                                    <div className="relative">

                                        {user.profile_image ? (
                                            <img
                                                src={getAssetUrl(user.profile_image)}
                                                alt={`${user.first_name} ${user.last_name}`}
                                                className="h-24 w-24 rounded-full object-cover ring-4 ring-slate-100"
                                            />
                                        ) : (
                                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-3xl font-semibold text-red-600 ring-4 ring-slate-100">
                                                {user.first_name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            disabled={uploadingImage}
                                            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 disabled:opacity-50"
                                            title="Change profile image"
                                        >
                                            <Camera size={15} />
                                        </button>

                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />

                                    <h3 className="mt-4 text-xl font-semibold text-slate-900">
                                        {user.first_name} {user.last_name}
                                    </h3>

                                    <p className="text-sm text-slate-500">
                                        User #{user.id}
                                    </p>

                                    {user.profile_image && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            disabled={uploadingImage}
                                            className="mt-3 flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                                        >
                                            <Trash2 size={14} />

                                            {uploadingImage
                                                ? 'Processing...'
                                                : 'Remove Image'}
                                        </button>
                                    )}

                                    {imageError && (
                                        <div className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-600">
                                            {imageError}
                                        </div>
                                    )}

                                </div>

                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div>
                                    <p className="text-xs font-medium uppercase text-slate-400">
                                        Email
                                    </p>

                                    <p className="mt-1 text-sm text-slate-700">
                                        {user.email}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase text-slate-400">
                                        Phone
                                    </p>

                                    <p className="mt-1 text-sm text-slate-700">
                                        {user.phone || '—'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase text-slate-400">
                                        Company
                                    </p>

                                    <p className="mt-1 text-sm text-slate-700">
                                        {companyName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase text-slate-400">
                                        Role
                                    </p>

                                    <p className="mt-1 text-sm text-slate-700">
                                        {roleName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase text-slate-400">
                                        Status
                                    </p>

                                    <span
                                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.is_active
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-slate-100 text-slate-500'
                                            }`}
                                    >
                                        {user.is_active
                                            ? 'Active'
                                            : 'Inactive'}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase text-slate-400">
                                        Created
                                    </p>

                                    <p className="mt-1 text-sm text-slate-700">
                                        {new Date(
                                            user.created_at
                                        ).toLocaleString()}
                                    </p>
                                </div>

                            </div>

                        </div>
                    )}

                </div>

                <div className="flex justify-end border-t border-slate-200 px-6 py-4">

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>
    )
}

export default UserView