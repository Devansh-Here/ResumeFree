// src/components/ATSCheckPanel.jsx
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { runATSCheck, getScoreLabel, CATEGORY_LABELS } from '../utils/atsCheck'
import { useResumeStore } from '../store/resumeStore'
import { useAuthStore } from '../store/authStore'
import UpgradeModal from './premium/UpgradeModal'

export default function ATSCheckPanel() {
  const navigate = useNavigate()
  const resumeData = useResumeStore((s) => s.resume)
  // Note: basic ATS check (score/matched/missing) is free for everyone —
  // this only gates the AI-generated "reach 90+" tips below.
  const hasAdvancedAccess = useAuthStore((s) => s.hasATSAdvancedAccess())
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [open, setOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const [tips, setTips] = useState(null)
  const [tipsLoading, setTipsLoading] = useState(false)
  const [tipsError, setTipsError] = useState(null)

  function handleClick() {
    if (result) { setOpen(true); return }
    setLoading(true)
    setTimeout(() => {
      const res = runATSCheck(resumeData)
      setResult(res)
      setLoading(false)
      setOpen(true)
    }, 700)
  }

  function handleClose() { setOpen(false) }

  function handleReset() {
    setResult(null)
    setOpen(false)
    setShowAll(false)
    setTips(null)
    setTipsError(null)
  }

  // Sends the user to Pricing with the addon pre-selected AND remembers
  // that they started this from the Builder — PricingPage reads this via
  // location.state.returnTo and routes back here (not /dashboard) after
  // a successful purchase.
  function handleBuyATSAddon() {
    setOpen(false)
    navigate('/pricing?confirm=addon_ats', { state: { returnTo: '/builder' } })
  }

  async function handleGetTips() {
    if (!hasAdvancedAccess) { setUpgradeOpen(true); return }
    if (!result || !result.missing || result.missing.length === 0) return
    setTipsLoading(true)
    setTipsError(null)
    try {
      const res = await fetch('/api/ats-advanced-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: result.score,
          roleLabel: result.roleLabel,
          missingKeywords: result.missing.map((m) => m.word),
          categoryBreakdown: result.categoryBreakdown,
          matchedCount: result.matched.length,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not generate tips. Try again.')
      setTips(data.tips)
    } catch (err) {
      setTipsError(err.message)
    }
    setTipsLoading(false)
  }

  const si = result ? getScoreLabel(result.score) : null
  const missingSlice = result
    ? showAll ? result.missing : result.missing.slice(0, 8)
    : []

  const scoreColor = result && result.score >= 70 ? '#059669' : result && result.score >= 40 ? '#d97706' : '#dc2626'
  const scoreBg    = result && result.score >= 70 ? '#d1fae5' : result && result.score >= 40 ? '#fef3c7' : '#fee2e2'
  const scoreText  = result && result.score >= 70 ? '#065f46' : result && result.score >= 40 ? '#92400e' : '#991b1b'

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        type="button"
        className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-full border transition-all whitespace-nowrap"
        style={{
          fontFamily: "'Inter', sans-serif",
          background: result ? scoreBg : 'white',
          borderColor: result ? scoreColor + '40' : '#cbd5e1',
          color: result ? scoreText : '#1e3a5f',
          opacity: loading ? 0.5 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Scanning…
          </>
        ) : result ? (
          <>{result.score}/100 · {si.label}</>
        ) : (
          <>🔍 ATS Check</>
        )}
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(10,22,40,0.55)', backdropFilter: 'blur(2px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div
            className="w-full sm:max-w-md bg-white flex flex-col"
            style={{
              borderRadius: '24px',
              maxHeight: '90vh',
              border: '1px solid #e2e8f0',
              boxShadow: 'rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.14) 0px 24px 40px -8px',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 className="text-base font-semibold text-[#0a1628] leading-none mb-0.5" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  ATS Score
                </h2>
                <p className="text-[11px] text-[#4a6fa5]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {result ? `Role detected: ${result.roleLabel}` : 'Scanning your resume…'}
                </p>
              </div>
              <button onClick={handleClose} type="button"
                className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-[#f1f5f9] text-[#4a6fa5] hover:text-[#0a1628] text-lg leading-none">
                ×
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

              {/* Score hero */}
              {result && (
                <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: scoreBg, border: `1px solid ${scoreColor}20` }}>
                  <svg width="56" height="56" viewBox="0 0 40 40" className="shrink-0">
                    <circle cx="20" cy="20" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle cx="20" cy="20" r="15" fill="none" stroke={scoreColor} strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(result.score / 100) * 94.2} 94.2`}
                      transform="rotate(-90 20 20)" />
                    <text x="20" y="20" textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="700" fill={scoreColor}>
                      {result.score}
                    </text>
                  </svg>
                  <div>
                    <p className="text-2xl font-bold leading-none mb-1" style={{ color: scoreText, fontFamily: "'DM Serif Display', serif" }}>
                      {result.score}/100
                    </p>
                    <p className="text-xs font-semibold" style={{ color: scoreColor, fontFamily: "'Inter', sans-serif" }}>
                      {si.label} · {result.matched.length} keywords matched
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: scoreText + 'aa', fontFamily: "'Inter', sans-serif" }}>
                      Use JD Match for role-specific accuracy
                    </p>
                  </div>
                </div>
              )}

              {/* Category bars */}
              {result && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4a6fa5] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Category breakdown
                  </p>
                  <div className="space-y-2">
                    {Object.entries(result.categoryBreakdown).map(([cat, { found, total, relevant }]) => (
                      <div key={cat} className={`flex items-center gap-2.5 ${!relevant ? 'opacity-30' : ''}`}>
                        <span className="text-[11px] text-[#4a6fa5] shrink-0 truncate" style={{ width: 100, fontFamily: "'Inter', sans-serif" }}>
                          {CATEGORY_LABELS[cat]}{!relevant && <span className="ml-1 text-[9px]">(n/a)</span>}
                        </span>
                        <div className="flex-1 h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: total > 0 ? `${Math.round((found / total) * 100)}%` : '0%', background: relevant ? '#059669' : '#cbd5e1' }} />
                        </div>
                        <span className="text-[11px] text-[#4a6fa5]/60 shrink-0 tabular-nums" style={{ width: 28, textAlign: 'right', fontFamily: "'Inter', sans-serif" }}>
                          {found}/{total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Found */}
              {result && result.matched.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4a6fa5] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Found ✓</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matched.map(({ word }) => (
                      <span key={word} className="px-2.5 py-0.5 text-[11px] rounded-full"
                        style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0', fontFamily: "'Inter', sans-serif" }}>
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing */}
              {result && result.missing.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4a6fa5] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Missing — add to Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {missingSlice.map(({ word }) => (
                      <span key={word} className="px-2.5 py-0.5 text-[11px] rounded-full"
                        style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', fontFamily: "'Inter', sans-serif" }}>
                        {word}
                      </span>
                    ))}
                  </div>
                  {result.missing.length > 8 && (
                    <button onClick={() => setShowAll(p => !p)} type="button"
                      className="mt-2 text-[11px] text-[#4a6fa5] hover:text-[#0a1628] transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {showAll ? 'Show less ↑' : `+${result.missing.length - 8} more ↓`}
                    </button>
                  )}
                </div>
              )}

              {/* Advanced ATS Tips — locked (upgrade nudge) */}
              {result && result.missing.length > 0 && !hasAdvancedAccess && (
                <div className="rounded-2xl px-4 py-3.5" style={{ background: '#d1fae5', border: '1px solid #a7f3d0' }}>
                  <p className="text-sm font-semibold text-[#0a1628] mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    Unlock Advanced ATS Tips
                  </p>
                  <p className="text-[11px] text-[#1e3a5f] leading-relaxed mb-2.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Get a prioritized, step-by-step plan to push this resume toward 90+ — built from your actual missing keywords.
                  </p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setUpgradeOpen(true); setOpen(false) }} type="button"
                      className="px-4 py-1.5 text-[11px] font-semibold rounded-full text-white transition-colors hover:bg-[#1e3a5f]"
                      style={{ background: '#0a1628', fontFamily: "'Inter', sans-serif" }}>
                      Upgrade — ₹199/month
                    </button>
                    <button onClick={handleBuyATSAddon} type="button"
                      className="text-[11px] font-semibold text-[#059669] hover:underline" style={{ fontFamily: "'Inter', sans-serif" }}>
                      or buy Advanced ATS add-on ₹99
                    </button>
                  </div>
                </div>
              )}

              {/* Advanced ATS Tips — unlocked */}
              {result && result.missing.length > 0 && hasAdvancedAccess && !tips && (
                <button
                  type="button"
                  onClick={handleGetTips}
                  disabled={tipsLoading}
                  className="w-full py-2.5 rounded-full text-sm font-semibold text-white transition-colors disabled:opacity-50"
                  style={{ background: tipsLoading ? '#4a6fa5' : '#0a1628', fontFamily: "'Inter', sans-serif" }}
                >
                  {tipsLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Building your plan…
                    </span>
                  ) : '🎯 Get Advanced Tips to Reach 90+'}
                </button>
              )}

              {tipsError && (
                <p className="text-xs text-red-500" style={{ fontFamily: "'Inter', sans-serif" }}>{tipsError}</p>
              )}

              {tips && tips.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4a6fa5] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Your action plan to 90+
                  </p>
                  <div className="space-y-2">
                    {tips.map((t, i) => (
                      <div key={i} className="flex items-start gap-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-3">
                        <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ background: '#059669' }}>
                          {i + 1}
                        </span>
                        <p className="text-[13px] text-[#0a1628] leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {t.action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result && result.missing.length === 0 && (
                <div className="text-center py-2">
                  <p className="text-xl mb-1">🎉</p>
                  <p className="text-[11px] text-[#4a6fa5]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    No missing keywords for your detected role — nothing to fix right now.
                  </p>
                </div>
              )}

              {/* Reset */}
              <button onClick={handleReset} type="button"
                className="w-full py-2 text-[11px] text-[#4a6fa5] hover:text-[#0a1628] border border-[#cbd5e1] hover:border-[#4a6fa5] rounded-2xl transition-all"
                style={{ fontFamily: "'Inter', sans-serif" }}>
                ↻ Reset and re-scan
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </>
  )
}