import { useEffect, useMemo, useState } from "react"
import { ArrowRight, LockKeyhole, Mail, User2, ShieldCheck } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  getAuthSession,
  login,
  saveAuthSession,
  startSignup,
  verifySignup
} from "../lib/auth"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const isSignup = useMemo(() => location.pathname === "/signup", [location.pathname])
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [otpStep, setOtpStep] = useState(false)
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (getAuthSession()) {
      navigate("/dashboard", { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    setOtpStep(false)
    setOtp("")
    setMessage("")
    setError("")
  }, [isSignup])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError("")
    setMessage("")

    try {
      if (!isSignup) {
        const session = await login(email, password)
        saveAuthSession(session)
        navigate("/dashboard")
        return
      }

      if (!otpStep) {
        const resultMessage = await startSignup(name, email, password)
        setOtpStep(true)
        setMessage(resultMessage)
        return
      }

      const session = await verifySignup(email, otp)
      saveAuthSession(session)
      navigate("/dashboard")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authentication failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f1e8] text-slate-900 [font-family:Space_Grotesk,Manrope,ui-sans-serif,system-ui,sans-serif]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.14),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.12),_transparent_24%),linear-gradient(180deg,_#fffaf2_0%,_#f6f1e8_100%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-12">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur lg:grid-cols-[0.95fr_1.05fr]">
          <section className="hidden bg-slate-950 px-8 py-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-teal-300">Taskflow</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">
                {isSignup ? (otpStep ? "Verify your email." : "Create your workspace.") : "Welcome back."}
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-7 text-slate-300">
                {isSignup
                  ? (otpStep
                      ? "We sent a verification code to your email. Enter it to finish creating your account."
                      : "Set up your account and jump into project planning, boards, and analytics.")
                  : "Sign in to continue managing tasks, workflows, and deadlines in one place."}
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-white/5 p-5">
              <p className="text-sm text-slate-300">
                {isSignup
                  ? "Already have an account? Switch back to login and continue to your dashboard."
                  : "New here? Create an account and start organizing work with Taskflow."}
              </p>
            </div>
          </section>

          <section className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="mb-8">
              <Link to="/" className="text-sm font-medium text-slate-500 transition hover:text-slate-900">
                ← Back to welcome
              </Link>
              <h2 className="mt-4 text-3xl font-bold text-slate-950">
                {isSignup ? (otpStep ? "Verify signup" : "Sign up") : "Log in"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isSignup
                  ? (otpStep
                      ? "Enter the verification code sent to your email to finish creating your TaskFlow account."
                      : "Create your account to access the Taskflow dashboard.")
                  : "Enter your credentials to continue to the dashboard."}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {isSignup && (
                <Field label="Full name" icon={<User2 className="h-4 w-4 text-slate-400" />}>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    required
                    disabled={otpStep}
                  />
                </Field>
              )}

              <Field label="Email address" icon={<Mail className="h-4 w-4 text-slate-400" />}>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@taskflow.app"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  required
                  disabled={otpStep}
                />
              </Field>

              {(!isSignup || !otpStep) && (
                <Field label="Password" icon={<LockKeyhole className="h-4 w-4 text-slate-400" />}>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    required
                    disabled={otpStep}
                  />
                </Field>
              )}

              {isSignup && otpStep && (
                <Field label="Verification code" icon={<ShieldCheck className="h-4 w-4 text-slate-400" />}>
                  <input
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter the 6 digit code"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    required
                  />
                </Field>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting
                  ? (isSignup
                      ? (otpStep ? "Verifying code..." : "Sending verification code...")
                      : "Logging in...")
                  : (isSignup
                      ? (otpStep ? "Verify and create account" : "Send verification code")
                      : "Continue to dashboard")}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>

              {message && (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </p>
              )}

              {error && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}
            </form>

            <p className="mt-6 text-sm text-slate-600">
              {isSignup ? "Already have an account?" : "Need an account?"}{" "}
              <Link
                to={isSignup ? "/login" : "/signup"}
                className="font-semibold text-teal-700 transition hover:text-teal-900"
              >
                {isSignup ? "Log in" : "Sign up"}
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  icon,
  children
}: {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-teal-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(13,148,136,0.12)]">
        {icon}
        {children}
      </div>
    </label>
  )
}

