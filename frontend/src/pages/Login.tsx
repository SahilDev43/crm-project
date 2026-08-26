import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  BarChart3,
  Users,
} from 'lucide-react'

import { useAuth } from '../auth/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      await login({
        email,
        password,
      })

      navigate('/dashboard')
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else {
        setError('Unable to login. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-red-700 via-red-800 to-slate-900 p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-red-500/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Leads CRM
          </span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight text-white">
            Every customer relationship, in one place.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-red-100">
            Track deals, manage contacts, and close faster with a
            workspace built for growing sales teams.
          </p>

          <div className="mt-10 space-y-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Unified contact records
                </p>
                <p className="text-xs text-red-200">
                  Every conversation and touchpoint, automatically synced.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Real-time pipeline insights
                </p>
                <p className="text-xs text-red-200">
                  Know exactly where every deal stands, at a glance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-red-300">
          © {new Date().getFullYear()} Leads CRM. All rights reserved.
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              Leads CRM
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to your account to continue
          </p>

          {error && (
            <div className="mt-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex select-none items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500/30"
              />
              Remember me
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <span className="font-medium text-red-600">
              Contact your administrator
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
