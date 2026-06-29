import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'

const getInitials = (name = '', email = '') => {
  if (name?.trim()) {
    const parts = name.trim().split(' ')
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase()
  }
  return email ? email[0].toUpperCase() : '?'
}

const formatDate = (str) => {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export default function ProfilePage() {
  const [user, setUser]                 = useState(null)
  const [profile, setProfile]           = useState(null)
  const [payment, setPayment]           = useState(null)
  const [resumes, setResumes]           = useState([])
  const [coverLetters, setCoverLetters] = useState([])
  const [loading, setLoading]           = useState(true)
  const [deleteId, setDeleteId]         = useState(null)
  const navigate = useNavigate()

  useEffect(() => { loadDashboard() }, [])

  const loadDashboard = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { navigate('/auth'); return }
    setUser(session.user)

    const [profileRes, resumesRes, clRes, paymentRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('resumes').select('*').eq('user_id', session.user.id).order('updated_at', { ascending: false }),
      supabase.from('cover_letters').select('*').eq('user_id', session.user.id).order('updated_at', { ascending: false }),
      supabase.from('payments').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
    ])

    setProfile(profileRes.data)
    setResumes(resumesRes.data || [])
    setCoverLetters(clRes.data || [])
    setPayment(paymentRes.data || null)
    setLoading(false)
  }

  const handleDeleteResume = async (id) => {
    const { error } = await supabase.from('resumes').delete().eq('id', id)
    if (!error) { setResumes(p => p.filter(r => r.id !== id)); setDeleteId(null) }
  }

  const handleDeleteCoverLetter = async (id) => {
    const { error } = await supabase.from('cover_letters').delete().eq('id', id)
    if (!error) setCoverLetters(p => p.filter(c => c.id !== id))
  }

  const handleOpenResume = (resume) => {
    localStorage.setItem('resumefree_load_resume', JSON.stringify({ id: resume.id, data: resume.data }))
    navigate('/builder')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const isPremium  = profile?.is_premium === true
  const planLabel  = isPremium
    ? (payment?.plan_type === 'yearly' ? '✦ Premium Yearly' : '✦ Premium Monthly')
    : 'Free'

  const displayName = user?.user_metadata?.full_name
    || profile?.full_name
    || user?.email?.split('@')[0]
    || 'User'

  const avatarUrl = user?.user_metadata?.avatar_url || null

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-fog flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin mx-auto mb-3" />
        <p className="font-sohne text-[14px] text-graphite tracking-[-0.009em]">Loading…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-fog">

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-dove/40 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-ink rounded-images flex items-center justify-center">
              <span className="text-white text-[10px] font-semibold font-sohne tracking-wider">ATS</span>
            </div>
            <span className="font-sohne text-[15px] font-[500] text-ink tracking-[-0.009em] hidden sm:block">
              ResumeFree
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Secondary — text link */}
            <button
              onClick={handleSignOut}
              className="font-sohne text-[15px] font-[450] text-graphite hover:text-ink transition-colors tracking-[-0.009em]"
            >
              Sign out
            </button>
            {/* Primary CTA — one filled button */}
            <Link
              to="/builder"
              className="px-5 py-2 bg-ink hover:bg-ink/85 text-white font-sohne text-[15px] font-[450] rounded-buttons transition-colors tracking-[-0.009em]"
            >
              + New Resume
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* ── Profile Card ── */}
        <div className="bg-white rounded-cards p-6 shadow-subtle">
          <div className="flex flex-wrap items-start justify-between gap-6">

            {/* Avatar + info */}
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName}
                  className="w-14 h-14 rounded-[9999px] object-cover ring-1 ring-dove/40" />
              ) : (
                <div className="w-14 h-14 rounded-[9999px] bg-apricot-wash flex items-center justify-center shrink-0">
                  <span className="text-rust text-base font-[500] font-sohne">
                    {getInitials(displayName, user?.email)}
                  </span>
                </div>
              )}
              <div>
                <h1 className="font-signifier text-[26px] leading-[1.18] tracking-[-0.23px] text-ink">
                  {displayName}
                </h1>
                <p className="font-sohne text-[14px] text-graphite tracking-[-0.009em] mt-0.5">
                  {user?.email}
                </p>
                <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-tags font-sohne text-[13px] font-[450] tracking-[-0.009em] ${
                  isPremium
                    ? 'bg-apricot-wash text-rust'
                    : 'bg-fog text-graphite'
                }`}>
                  {planLabel}
                </span>
              </div>
            </div>

            {/* Plan action */}
            <div className="text-right">
              {isPremium ? (
                <div>
                  <p className="font-sohne text-[13px] text-graphite tracking-[-0.009em]">Active plan</p>
                  {payment?.created_at && (
                    <p className="font-sohne text-[13px] text-dove mt-0.5">
                      Since {formatDate(payment.created_at)}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-sohne text-[13px] text-graphite mb-2">Unlock AI features</p>
                  <Link
                    to="/#pricing"
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-ink hover:bg-ink/85 text-white font-sohne text-[14px] font-[450] rounded-buttons transition-colors tracking-[-0.009em]"
                  >
                    ✦ Upgrade
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-dove/30">
            {[
              { label: 'Resumes saved',    value: resumes.length },
              { label: 'Cover letters',    value: coverLetters.length },
              { label: 'AI improvements', value: isPremium ? '∞' : '3 / 3' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="font-signifier text-[26px] leading-[1.18] tracking-[-0.23px] text-ink">
                  {value}
                </p>
                <p className="font-sohne text-[13px] text-graphite mt-1 tracking-[-0.009em]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Resumes ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sohne text-[16px] font-[500] text-ink tracking-[-0.009em]">
              My Resumes
            </h2>
            <Link to="/builder"
              className="font-sohne text-[14px] font-[450] text-graphite hover:text-ink transition-colors tracking-[-0.009em]">
              + Create new
            </Link>
          </div>

          {resumes.length === 0 ? (
            <div className="bg-white rounded-cards border border-dove/30 border-dashed p-16 text-center">
              <div className="w-12 h-12 bg-fog rounded-images flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-dove" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-sohne text-[15px] font-[450] text-ink mb-1">No resumes yet</p>
              <p className="font-sohne text-[14px] text-graphite mb-6">
                Build one and save it to access from anywhere
              </p>
              <Link to="/builder"
                className="inline-flex items-center px-5 py-2.5 bg-ink hover:bg-ink/85 text-white font-sohne text-[14px] font-[450] rounded-buttons transition-colors tracking-[-0.009em]">
                Build my resume
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumes.map(resume => (
                <div key={resume.id}
                  className="bg-white rounded-cards p-6 border border-dove/20 hover:shadow-subtle transition-all group">

                  {/* Top row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-10 h-12 bg-apricot-wash rounded-images flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>

                    {deleteId === resume.id ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => handleDeleteResume(resume.id)}
                          className="font-sohne text-[13px] px-3 py-1.5 bg-rust/10 text-rust rounded-tags hover:bg-rust/20 transition-colors">
                          Delete
                        </button>
                        <button onClick={() => setDeleteId(null)}
                          className="font-sohne text-[13px] px-3 py-1.5 bg-fog text-graphite rounded-tags hover:bg-dove/20 transition-colors">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteId(resume.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-dove hover:text-rust transition-all rounded-images">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <p className="font-sohne text-[15px] font-[480] text-ink truncate tracking-[-0.009em]">
                    {resume.title}
                  </p>
                  <p className="font-sohne text-[13px] text-dove mt-1 tracking-[-0.009em]">
                    {formatDate(resume.updated_at)}
                  </p>

                  {/* Text link — no ghost button */}
                  <button onClick={() => handleOpenResume(resume)}
                    className="mt-4 font-sohne text-[14px] font-[450] text-ash hover:text-ink transition-colors tracking-[-0.009em]">
                    Open & edit →
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Cover Letters ── */}
        <section className="pb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sohne text-[16px] font-[500] text-ink tracking-[-0.009em]">
              Cover Letters
            </h2>
          </div>

          {!isPremium ? (
            <div className="bg-apricot-wash rounded-cards p-10 text-center">
              <p className="font-signifier text-[26px] leading-[1.18] tracking-[-0.23px] text-rust mb-2">
                AI Cover Letter Generator
              </p>
              <p className="font-sohne text-[15px] text-rust/70 mb-6 tracking-[-0.009em]">
                Tailored cover letters per job description — Premium only
              </p>
              <Link to="/#pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-ink hover:bg-ink/85 text-white font-sohne text-[15px] font-[450] rounded-buttons transition-colors tracking-[-0.009em]">
                ✦ Upgrade to unlock
              </Link>
            </div>
          ) : coverLetters.length === 0 ? (
            <div className="bg-white rounded-cards border border-dove/30 border-dashed p-12 text-center">
              <p className="font-sohne text-[15px] font-[450] text-ink mb-1">No cover letters yet</p>
              <p className="font-sohne text-[14px] text-graphite">Generate one from the Resume Builder</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coverLetters.map(cl => (
                <div key={cl.id}
                  className="bg-white rounded-cards p-6 border border-dove/20 hover:shadow-subtle transition-all group">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-10 h-12 bg-sky-wash rounded-images flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#3b6fd4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <button onClick={() => handleDeleteCoverLetter(cl.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-dove hover:text-rust transition-all rounded-images">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="font-sohne text-[15px] font-[480] text-ink truncate tracking-[-0.009em]">
                    {cl.title}
                  </p>
                  <p className="font-sohne text-[13px] text-dove mt-1 tracking-[-0.009em]">
                    {formatDate(cl.updated_at)}
                  </p>
                  <button className="mt-4 font-sohne text-[14px] font-[450] text-ash hover:text-ink transition-colors tracking-[-0.009em]">
                    View →
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}