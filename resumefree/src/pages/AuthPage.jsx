import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'

export default function AuthPage() {
  const [mode, setMode]               = useState('signin')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [fullName, setFullName]       = useState('')
  const [loading, setLoading]         = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]             = useState('')
  const [successMsg, setSuccessMsg]   = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard')
    })
  }, [navigate])

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccessMsg('')
    try {
      if (mode === 'signup') {
        if (!fullName.trim()) throw new Error('Please enter your full name')
        if (password.length < 6) throw new Error('Password must be at least 6 characters')
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        })
        if (error) throw error
        setSuccessMsg('Check your email to confirm your account, then sign in.')
        setMode('signin'); setPassword('')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = (newMode) => {
    setMode(newMode); setError(''); setSuccessMsg(''); setPassword('')
  }

  return (
    <div className="min-h-screen bg-fog flex flex-col items-center justify-center p-4">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 bg-ink rounded-images flex items-center justify-center">
          <span className="text-white text-[10px] font-semibold tracking-wider font-sohne">ATS</span>
        </div>
        <span className="text-ink text-lg font-semibold font-sohne tracking-[-0.014px]">
          ResumeFree
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-[420px] bg-white rounded-cards shadow-subtle overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-dove/30">
          <h1 className="font-signifier text-[26px] leading-[1.18] tracking-[-0.23px] text-ink mb-1">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-graphite font-sohne text-[14px] leading-[1.5] tracking-[-0.13px]">
            {mode === 'signin'
              ? 'Sign in to your ResumeFree account.'
              : 'Free forever. Upgrade anytime for AI features.'}
          </p>
        </div>

        <div className="px-8 py-6 space-y-4">

          {/* Alerts */}
          {successMsg && (
            <div className="px-4 py-3 rounded-inputs bg-[#f0faf4] border border-[#a3d9b8]">
              <p className="text-[#1a6b3c] font-sohne text-[14px] leading-[1.5]">{successMsg}</p>
            </div>
          )}
          {error && (
            <div className="px-4 py-3 rounded-inputs bg-apricot-wash border border-rust/20">
              <p className="text-rust font-sohne text-[14px] leading-[1.5]">{error}</p>
            </div>
          )}

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-fog hover:bg-dove/20 rounded-buttons font-sohne text-[15px] font-[450] text-ink tracking-[-0.009em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-dove/50"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dove/40" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-dove font-sohne text-[13px]">or</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block font-sohne text-[14px] font-[500] text-ink mb-1.5 tracking-[-0.009em]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Rahul Sharma"
                  required
                  className="w-full px-4 py-3 border border-dove/60 rounded-inputs font-sohne text-[15px] text-ink placeholder-dove focus:outline-none focus:border-ink/40 focus:ring-2 focus:ring-ink/8 transition-all bg-white"
                />
              </div>
            )}

            <div>
              <label className="block font-sohne text-[14px] font-[500] text-ink mb-1.5 tracking-[-0.009em]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border border-dove/60 rounded-inputs font-sohne text-[15px] text-ink placeholder-dove focus:outline-none focus:border-ink/40 focus:ring-2 focus:ring-ink/8 transition-all bg-white"
              />
            </div>

            <div>
              <label className="block font-sohne text-[14px] font-[500] text-ink mb-1.5 tracking-[-0.009em]">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                required
                className="w-full px-4 py-3 border border-dove/60 rounded-inputs font-sohne text-[15px] text-ink placeholder-dove focus:outline-none focus:border-ink/40 focus:ring-2 focus:ring-ink/8 transition-all bg-white"
              />
            </div>

            {/* Primary CTA — ONE filled button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 bg-ink hover:bg-ink/85 text-white font-sohne text-[15px] font-[450] tracking-[-0.009em] rounded-buttons transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {/* Mode switch — text link, not a button */}
          <p className="text-center font-sohne text-[14px] text-graphite tracking-[-0.009em]">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => resetForm(mode === 'signin' ? 'signup' : 'signin')}
              className="text-ink font-[500] hover:underline underline-offset-2"
            >
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="px-8 pb-6">
          <p className="text-center font-sohne text-[13px] text-dove tracking-[-0.009em]">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-graphite hover:text-ink transition-colors">Terms</Link>
            {' & '}
            <Link to="/privacy" className="text-graphite hover:text-ink transition-colors">Privacy</Link>
          </p>
        </div>
      </div>

      <Link to="/"
        className="mt-6 font-sohne text-[14px] text-graphite hover:text-ink transition-colors tracking-[-0.009em]">
        ← Back to home
      </Link>
    </div>
  )
}