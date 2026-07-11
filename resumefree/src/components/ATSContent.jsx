import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { runATSCheck, getScoreLabel, CATEGORY_LABELS } from '../utils/atsCheck'
import { useResumeStore } from '../store/resumeStore'
import { useAuthStore } from '../store/authStore'
import { getATSRating } from './templates/templateRegistry'
import UpgradeModal from './premium/UpgradeModal'

export default function ATSContent({ open, onClose, onSwitchTemplate }) {
  const navigate = useNavigate()
  const resumeData = useResumeStore((s) => s.resume)
  const selectedTemplateId = useResumeStore((s) => s.selectedTemplateId)
  const hasAdvancedAccess = useAuthStore((s) => s.hasATSAdvancedAccess())
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [tips, setTips] = useState(null)
  const [tipsLoading, setTipsLoading] = useState(false)
  const [tipsError, setTipsError] = useState(null)

  const templateAtsRating = getATSRating(selectedTemplateId)
  const isModerateLayout = templateAtsRating === 'moderate'

  useEffect(() => {
    if (!open) return
    setLoading(true)
    const t = setTimeout(() => {
      setResult(runATSCheck(resumeData))
      setLoading(false)
    }, 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  function handleReset() {
    setLoading(true)
    setShowAll(false)
    setTips(null)
    setTipsError(null)
    setTimeout(() => {
      setResult(runATSCheck(resumeData))
      setLoading(false)
    }, 500)
  }

  function handleBuyATSAddon() {
    onClose()
    navigate('/pricing?confirm=addon_ats', { state: { returnTo: '/builder' } })
  }

  function handleSwitchTemplateClick() {
    onClose()
    if (onSwitchTemplate) onSwitchTemplate()
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
  const missingSlice = result ? (showAll ? result.missing : result.missing.slice(0, 8)) : []

  const scoreColor = result && result.score >= 70 ? '#059669' : result && result.score >= 40 ? '#d97706' : '#dc2626'
  const scoreBg    = result && result.score >= 70 ? '#d1fae5' : result && result.score >= 40 ? '#fef3c7' : '#fee2e2'
  const scoreText  = result && result.score >= 70 ? '#065f46' : result && result.score >= 40 ? '#92400e' : '#991b1b'

  return createPortal(
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,22,40,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <style>{`
        @keyframes rf-modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden flex flex-col"
        style={{
          border: '1px solid #e2e8f0',
          boxShadow: 'rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.18) 0px 24px 48px -12px',
          animation: 'rf-modal-in 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 shrink-0" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 className="text-2xl text-[#0a1628] leading-none mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
              ATS Score
            </h2>
            <p className="text-[13px] text-[#4a6fa5]" style={{ fontFamily: "'Inter', sans-serif" }}>
              {loading ? 'Scanning your resume…' : result ? `Role detected: ${result.roleLabel}` : ''}
            </p>
          </div>
          <button onClick={onClose} type="button"
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[#f1f5f9] text-[#4a6fa5] hover:text-[#0a1628] text-xl leading-none">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-7 py-6">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin h-6 w-6 text-[#4a6fa5]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          )}

          {!loading && result && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── LEFT COLUMN: Score + ATS-safety tip + Category breakdown ── */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: scoreBg, border: `1px solid ${scoreColor}20` }}>
                    <svg width="64" height="64" viewBox="0 0 40 40" className="shrink-0">
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

                  {isModerateLayout && (
                    <div
                      className="rounded-2xl px-4 py-3.5"
                      style={{ background: '#ecfdf5', border: '1px solid rgba(5,150,105,0.2)' }}
                    >
                      <p className="text-[11px] font-semibold text-[#0a1628] mb-1 flex items-center gap-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                        ⚠️ Sidebar layout in use
                      </p>
                      <p className="text-[11px] text-[#1e3a5f] leading-relaxed mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Your current template has a sidebar/column layout. Some bulk-hiring ATS parsers (common at TCS/Infosys-style recruiters) can read side-by-side content out of order. A single-column template is safer for high-volume applications.
                      </p>
                      {onSwitchTemplate && (
                        <button
                          onClick={handleSwitchTemplateClick}
                          type="button"
                          className="text-[11px] font-semibold text-[#059669] hover:underline"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          Switch to a single-column template →
                        </button>
                      )}
                    </div>
                  )}

                  <div className="p-4 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc]">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4a6fa5] mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Category breakdown
                    </p>
                    <div className="space-y-2.5">
                      {Object.entries(result.categoryBreakdown).map(([cat, { found, total, relevant }]) => (
                        <div key={cat} className={`flex items-center gap-2.5 ${!relevant ? 'opacity-30' : ''}`}>
                          <span className="text-[11px] text-[#4a6fa5] shrink-0 truncate" style={{ width: 108, fontFamily: "'Inter', sans-serif" }}>
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
                </div>

                {/* ── RIGHT COLUMN: Found / Missing keywords + Advanced Tips ── */}
                <div className="space-y-4">
                  {result.matched.length > 0 && (
                    <div className="p-4 rounded-2xl border border-[#e2e8f0]">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4a6fa5] mb-2.5" style={{ fontFamily: "'Inter', sans-serif" }}>Found ✓</p>
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

                  {result.missing.length > 0 && (
                    <div className="p-4 rounded-2xl border border-[#e2e8f0]">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4a6fa5] mb-2.5" style={{ fontFamily: "'Inter', sans-serif" }}>Missing — add to Skills</p>
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
                          className="mt-2.5 text-[11px] text-[#4a6fa5] hover:text-[#0a1628] transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {showAll ? 'Show less ↑' : `+${result.missing.length - 8} more ↓`}
                        </button>
                      )}
                    </div>
                  )}

                  {result.missing.length > 0 && !hasAdvancedAccess && (
                    <div className="rounded-2xl px-4 py-3.5" style={{ background: '#d1fae5', border: '1px solid #a7f3d0' }}>
                      <p className="text-sm font-semibold text-[#0a1628] mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
                        Unlock Advanced ATS Tips
                      </p>
                      <p className="text-[11px] text-[#1e3a5f] leading-relaxed mb-2.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Get a prioritized, step-by-step plan to push this resume toward 90+ — built from your actual missing keywords.
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <button onClick={() => setUpgradeOpen(true)} type="button"
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

                  {result.missing.length > 0 && hasAdvancedAccess && !tips && (
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

                  {result.missing.length === 0 && (
                    <div className="text-center py-6 rounded-2xl border border-[#e2e8f0]">
                      <p className="text-2xl mb-1">🎉</p>
                      <p className="text-[11px] text-[#4a6fa5]" style={{ fontFamily: "'Inter', sans-serif" }}>
                        No missing keywords for your detected role — nothing to fix right now.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reset — full width, below both columns */}
              <button onClick={handleReset} type="button"
                className="w-full mt-6 py-2.5 text-[11px] text-[#4a6fa5] hover:text-[#0a1628] border border-[#cbd5e1] hover:border-[#4a6fa5] rounded-2xl transition-all"
                style={{ fontFamily: "'Inter', sans-serif" }}>
                ↻ Reset and re-scan
              </button>
            </>
          )}
        </div>

        {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
      </div>
    </div>,
    document.body
  )
}