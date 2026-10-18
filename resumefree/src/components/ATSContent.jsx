import { useState, useEffect, useRef } from 'react'
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
  const [animateIn, setAnimateIn] = useState(false)

  // NEW — count-up score animation. `displayScore` is what's actually
  // rendered (both in the ring and the big "XX/100" text); `result.score`
  // is only used as the animation target. Counts 0 → score every time a
  // fresh result lands (first scan AND every "Reset and re-scan"), synced
  // to the same 800ms window + easing feel as the ring's stroke-dasharray
  // transition so both read as one motion, not two separate animations.
  const [displayScore, setDisplayScore] = useState(0)

  const templateAtsRating = getATSRating(selectedTemplateId)
  const isModerateLayout = templateAtsRating === 'moderate'

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setAnimateIn(false)
    setDisplayScore(0)
    const t = setTimeout(() => {
      setResult(runATSCheck(resumeData))
      setLoading(false)
    }, 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!loading && result) {
      const raf = requestAnimationFrame(() => setAnimateIn(true))
      return () => cancelAnimationFrame(raf)
    }
  }, [loading, result])

  // Count 0 → result.score whenever a fresh result starts animating in.
  // Uses requestAnimationFrame (not setInterval) for a smooth, tab-throttle-
  // safe count, with an easeOutCubic curve so it starts fast and settles
  // gently into the final number — same "decelerate into place" feel as
  // the ring fill. Respects prefers-reduced-motion by jumping straight to
  // the final score instead of counting.
  useEffect(() => {
    if (!animateIn || !result) return

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setDisplayScore(result.score)
      return
    }

    const target = result.score
    const duration = 800 // ms — matches .rf-bar-fill / ring transition length
    const startTime = performance.now()
    let rafId

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3)
    }

    function tick(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      setDisplayScore(Math.round(easeOutCubic(progress) * target))
      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [animateIn, result])

  if (!open) return null

  function handleReset() {
    setLoading(true)
    setAnimateIn(false)
    setShowAll(false)
    setTips(null)
    setTipsError(null)
    setDisplayScore(0)
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

  const scoreColor = result && result.score >= 70 ? '#059669' : result && result.score >= 40 ? '#b45309' : '#dc2626'
  const scoreBg    = result && result.score >= 70 ? '#ecfdf5' : result && result.score >= 40 ? '#fffbeb' : '#fef2f2'
  const scoreBorder= result && result.score >= 70 ? '#a7f3d0' : result && result.score >= 40 ? '#fde68a' : '#fca5a5'
  const scoreText  = result && result.score >= 70 ? '#065f46' : result && result.score >= 40 ? '#92400e' : '#991b1b'

  return createPortal(
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,22,40,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <style>{`
        @keyframes rf-pill-pop {
          from { opacity: 0; transform: scale(0.85) translateY(3px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .rf-pill-pop { animation: rf-pill-pop 0.28s cubic-bezier(0.34,1.56,0.64,1) both; }

        @keyframes rf-badge-in {
          from { opacity: 0; transform: translateX(-4px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .rf-role-badge { animation: rf-badge-in 0.3s ease-out 0.15s both; }

        .rf-bar-fill { transition: width 0.7s cubic-bezier(0.22,0.61,0.36,1); }
        .rf-ring-fill circle:last-child { transition: stroke-dasharray 0.8s cubic-bezier(0.22,0.61,0.36,1); }

        .rf-hover-lift { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .rf-hover-lift:hover { transform: translateY(-1px); }
      `}</style>

      <div
        className="rf-modal-in w-full max-w-4xl max-h-[90vh] bg-paper-white rounded-cards overflow-hidden flex flex-col"
        style={{
          border: '1px solid #e0e0e0',
          boxShadow: 'rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.18) 0px 24px 48px -12px',
        }}
      >
        <div className="flex items-start justify-between gap-4 px-7 py-6 shrink-0" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <div className="flex flex-col gap-2.5">
            <h2 className="text-2xl text-graphite-ink font-heading leading-tight">
              ATS Score
            </h2>
            {loading ? (
              <p className="text-[13px] text-ash font-body">Scanning your resume…</p>
            ) : result ? (
              <span
                className="rf-role-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-buttons text-[11px] font-semibold uppercase tracking-wider font-mono w-fit"
                style={{ background: '#f0ebff', color: '#7451f2', border: '1px solid rgba(116,81,242,0.25)' }}
              >
                Role detected: {result.roleLabel}
              </span>
            ) : null}
          </div>
          <button onClick={onClose} type="button"
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-buttons transition-colors hover:bg-soft-snow text-ash hover:text-graphite-ink text-xl leading-none">
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-7 py-6">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin h-6 w-6 text-ash" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          )}

          {!loading && result && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="space-y-4">
                  <div className="rf-hover-lift flex items-center gap-4 p-4 rounded-cards" style={{ background: scoreBg, border: `1px solid ${scoreBorder}` }}>
                    <svg width="64" height="64" viewBox="0 0 40 40" className="shrink-0 rf-ring-fill">
                      <circle cx="20" cy="20" r="15" fill="none" stroke="#e0e0e0" strokeWidth="3" />
                      <circle cx="20" cy="20" r="15" fill="none" stroke={scoreColor} strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={animateIn ? `${(result.score / 100) * 94.2} 94.2` : '0 94.2'}
                        transform="rotate(-90 20 20)" />
                      <text x="20" y="20" textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="700" fill={scoreColor}>
                        {displayScore}
                      </text>
                    </svg>
                    <div>
                      <p className="text-2xl font-bold leading-none mb-1 font-heading tabular-nums" style={{ color: scoreText }}>
                        {displayScore}/100
                      </p>
                      <p className="text-xs font-semibold font-body" style={{ color: scoreColor }}>
                        {si.label} · {result.matched.length} keywords matched
                      </p>
                      <p className="text-[10px] mt-0.5 font-body" style={{ color: scoreText + 'aa' }}>
                        Use JD Match for role-specific accuracy
                      </p>
                    </div>
                  </div>

                  {isModerateLayout && (
                    <div
                      className="rf-hover-lift rounded-cards px-4 py-3.5"
                      style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
                    >
                      <p className="text-[11px] font-semibold text-graphite-ink mb-1 flex items-center gap-1.5 font-body">
                        ⚠️ Sidebar layout in use
                      </p>
                      <p className="text-[11px] text-slate leading-relaxed mb-2 font-body">
                        Your current template has a sidebar/column layout. Some bulk-hiring ATS parsers (common at TCS/Infosys-style recruiters) can read side-by-side content out of order. A single-column template is safer for high-volume applications.
                      </p>
                      {onSwitchTemplate && (
                        <button
                          onClick={handleSwitchTemplateClick}
                          type="button"
                          className="text-[11px] font-semibold hover:underline font-body"
                          style={{ color: '#7451f2' }}
                        >
                          Switch to a single-column template →
                        </button>
                      )}
                    </div>
                  )}

                  <div className="p-4 rounded-cards border border-mist bg-soft-snow">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-ash mb-3 font-mono">
                      Category breakdown
                    </p>
                    <div className="space-y-2.5">
                      {Object.entries(result.categoryBreakdown).map(([cat, { found, total, relevant }], i) => (
                        <div key={cat} className={`flex items-center gap-2.5 ${!relevant ? 'opacity-30' : ''}`}>
                          <span className="text-[11px] text-ash shrink-0 truncate font-body" style={{ width: 108 }}>
                            {CATEGORY_LABELS[cat]}{!relevant && <span className="ml-1 text-[9px]">(n/a)</span>}
                          </span>
                          <div className="flex-1 h-1.5 bg-mist rounded-buttons overflow-hidden">
                            <div
                              className="rf-bar-fill h-full rounded-buttons"
                              style={{
                                width: animateIn && total > 0 ? `${Math.round((found / total) * 100)}%` : '0%',
                                background: relevant ? '#059669' : '#a69ea7',
                                transitionDelay: `${i * 60}ms`,
                              }}
                            />
                          </div>
                          <span className="text-[11px] text-ash/60 shrink-0 tabular-nums font-body" style={{ width: 28, textAlign: 'right' }}>
                            {found}/{total}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {result.matched.length > 0 && (
                    <div className="p-4 rounded-cards border border-mist">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-ash mb-2.5 font-mono">Found ✓</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.matched.map(({ word }, i) => (
                          <span key={word} className="rf-pill-pop px-2.5 py-0.5 text-[11px] rounded-buttons font-body"
                            style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', animationDelay: `${i * 30}ms` }}>
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.missing.length > 0 && (
                    <div className="p-4 rounded-cards border border-mist">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-ash mb-2.5 font-mono">Missing — add to Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {missingSlice.map(({ word }, i) => (
                          <span key={word} className="rf-pill-pop px-2.5 py-0.5 text-[11px] rounded-buttons font-body"
                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', animationDelay: `${i * 30}ms` }}>
                            {word}
                          </span>
                        ))}
                      </div>
                      {result.missing.length > 8 && (
                        <button onClick={() => setShowAll(p => !p)} type="button"
                          className="mt-2.5 text-[11px] text-ash hover:text-graphite-ink transition-colors font-body">
                          {showAll ? 'Show less ↑' : `+${result.missing.length - 8} more ↓`}
                        </button>
                      )}
                    </div>
                  )}

                  {result.missing.length > 0 && !hasAdvancedAccess && (
                    <div className="rf-hover-lift rounded-cards px-4 py-3.5" style={{ background: '#f0ebff', border: '1px solid rgba(116,81,242,0.25)' }}>
                      <p className="text-sm font-semibold text-graphite-ink mb-1 font-heading">
                        Unlock Advanced ATS Tips
                      </p>
                      <p className="text-[11px] text-slate leading-relaxed mb-2.5 font-body">
                        Get a prioritized, step-by-step plan to push this resume toward 90+ — built from your actual missing keywords.
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <button onClick={() => setUpgradeOpen(true)} type="button"
                          className="px-4 py-1.5 text-[11px] font-semibold rounded-buttons text-white transition-colors font-body"
                          style={{ background: '#272727' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#000000'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#272727'}>
                          Upgrade — ₹199/month
                        </button>
                        <button onClick={handleBuyATSAddon} type="button"
                          className="text-[11px] font-semibold hover:underline font-body" style={{ color: '#5952a1' }}>
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
                      className="w-full py-2.5 rounded-buttons text-sm font-semibold text-white transition-colors disabled:opacity-50 font-body"
                      style={{ background: tipsLoading ? '#a69ea7' : '#7451f2' }}
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
                    <p className="text-xs text-[#dc2626] font-body">{tipsError}</p>
                  )}

                  {tips && tips.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-ash mb-2 font-mono">
                        Your action plan to 90+
                      </p>
                      <div className="space-y-2">
                        {tips.map((t, i) => (
                          <div key={i} className="rf-pill-pop flex items-start gap-2.5 bg-soft-snow border border-mist rounded-cards p-3" style={{ animationDelay: `${i * 50}ms` }}>
                            <span className="shrink-0 w-5 h-5 rounded-buttons flex items-center justify-center text-[10px] font-bold text-white"
                              style={{ background: '#059669' }}>
                              {i + 1}
                            </span>
                            <p className="text-[13px] text-graphite-ink leading-relaxed font-body">
                              {t.action}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.missing.length === 0 && (
                    <div className="text-center py-6 rounded-cards border border-mist">
                      <p className="text-2xl mb-1">🎉</p>
                      <p className="text-[11px] text-ash font-body">
                        No missing keywords for your detected role — nothing to fix right now.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button onClick={handleReset} type="button"
                className="w-full mt-6 py-2.5 text-[11px] text-ash hover:text-graphite-ink border border-mist hover:border-ash rounded-cards transition-all font-body">
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