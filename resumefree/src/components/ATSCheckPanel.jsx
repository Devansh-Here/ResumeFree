import { useState } from 'react'
import { runATSCheck, getScoreLabel, CATEGORY_LABELS } from '../utils/atsCheck'
import { useResumeStore } from '../store/resumeStore'
import { useAuthStore } from '../store/authStore'
import UpgradeModal from './premium/UpgradeModal'

export default function ATSCheckPanel() {
  const resumeData = useResumeStore((s) => s.resume)
  const isPremium = useAuthStore((s) => s.isPremium())
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [open, setOpen]       = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  function handleClick() {
    if (result) { setOpen((p) => !p); return }
    setLoading(true)
    setTimeout(() => {
      const res = runATSCheck(resumeData)
      setResult(res)
      setLoading(false)
      setOpen(true)
    }, 700)
  }

  const si = result ? getScoreLabel(result.score) : null
  const missingSlice = result
    ? showAll ? result.missing : result.missing.slice(0, 8)
    : []

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`flex items-center gap-1.5 h-8 px-3 text-xs font-semibold
                    rounded-lg border transition-all whitespace-nowrap
                    ${loading
                      ? 'bg-[#F6F4EF] text-[#161A2E]/30 border-[#DDD6C8] cursor-not-allowed'
                      : result
                      ? `${si.bg} ${si.border} ${si.color}`
                      : 'bg-white border-[#DDD6C8] text-[#161A2E] hover:border-[#161A2E]/40'
                    }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Scanning…
          </>
        ) : result ? (
          <>
            {result.score}/100 · {si.label}
            <span className="opacity-40 ml-0.5 text-[10px]">{open ? '▲' : '▼'}</span>
          </>
        ) : (
          <>🔍 ATS Check</>
        )}
      </button>

      {result && open && (
        <div className="absolute top-full right-0 mt-2 w-80
                        bg-white border border-[#DDD6C8] rounded-xl shadow-xl z-50 overflow-hidden">

          {/* Score header */}
          <div className={`flex items-center gap-3 px-4 py-3 border-b border-[#E8E5DF] ${si.bg}`}>
            <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0">
              <circle cx="20" cy="20" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3.5"/>
              <circle cx="20" cy="20" r="15"
                fill="none" stroke={si.ring} strokeWidth="3.5" strokeLinecap="round"
                strokeDasharray={`${(result.score / 100) * 94.2} 94.2`}
                transform="rotate(-90 20 20)"
              />
              <text x="20" y="20" textAnchor="middle" dominantBaseline="central"
                fontSize="9" fontWeight="600" fill={si.ring}>
                {result.score}
              </text>
            </svg>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm leading-none ${si.color}`}>
                {result.score}/100 — {si.label}
              </p>
              <p className="text-xs text-[#161A2E]/40 mt-1">
                {result.matched.length} relevant keywords found
              </p>
              <p className="text-[10px] text-[#161A2E]/30 mt-0.5">
                Role detected: {result.roleLabel} · Use JD Match for job-specific accuracy
              </p>
            </div>
            <button onClick={() => setOpen(false)}
              className="text-[#161A2E]/25 hover:text-[#161A2E] text-lg leading-none shrink-0">
              ×
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-3 space-y-3 max-h-[60vh] overflow-y-auto">

            {/* Category bars */}
            <div className="space-y-1.5">
              {Object.entries(result.categoryBreakdown).map(([cat, { found, total, relevant }]) => (
                <div key={cat} className={`flex items-center gap-2 ${!relevant ? 'opacity-30' : ''}`}>
                  <span className="text-[11px] text-[#161A2E]/40 w-28 shrink-0 truncate">
                    {CATEGORY_LABELS[cat]}
                    {!relevant && <span className="ml-1 text-[9px]">(n/a)</span>}
                  </span>
                  <div className="flex-1 h-1 bg-[#E8E5DF] rounded-full overflow-hidden">
                    <div className="h-full bg-[#161A2E] rounded-full"
                      style={{ width: total > 0 ? `${Math.round((found / total) * 100)}%` : '0%' }}/>
                  </div>
                  <span className="text-[11px] text-[#161A2E]/30 w-7 text-right shrink-0">
                    {found}/{total}
                  </span>
                </div>
              ))}
            </div>

            {/* Found */}
            {result.matched.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-[#161A2E]/30 uppercase tracking-wider mb-1.5">
                  Found ✓
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.matched.map(({ word }) => (
                    <span key={word}
                      className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-100 text-[11px] rounded-md">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing */}
            {result.missing.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-[#161A2E]/30 uppercase tracking-wider mb-1.5">
                  Missing — add to Skills
                </p>
                <div className="flex flex-wrap gap-1">
                  {missingSlice.map(({ word }) => (
                    <span key={word}
                      className="px-1.5 py-0.5 bg-red-50 text-red-500 border border-red-100 text-[11px] rounded-md">
                      {word}
                    </span>
                  ))}
                </div>
                {result.missing.length > 8 && (
                  <button onClick={() => setShowAll((p) => !p)}
                    className="mt-1 text-[11px] text-[#161A2E]/40 hover:text-[#161A2E]">
                    {showAll ? 'Show less ↑' : `+${result.missing.length - 8} more ↓`}
                  </button>
                )}
              </div>
            )}

            {/* Premium nudge */}
            {result.score < 80 && !isPremium && (
              <div className="bg-[#F6F4EF] border border-[#DDD6C8] rounded-lg px-3 py-2.5">
                <p className="text-xs font-semibold text-[#161A2E] mb-0.5">
                  Reach 90+ with Premium
                </p>
                <p className="text-[11px] text-[#161A2E]/50 leading-relaxed">
                  Paste any job description — we scan for that exact role's keywords.
                </p>
                <button
                  onClick={() => setUpgradeOpen(true)}
                  className="mt-2 px-3 py-1.5 bg-[#161A2E] text-white text-[11px]
                             font-semibold rounded-lg hover:bg-[#161A2E]/80 transition-colors">
                  Upgrade — ₹199/month
                </button>
              </div>
            )}

            {/* Re-scan */}
            <button onClick={() => { setResult(null); setOpen(false) }}
              className="w-full py-1.5 text-[11px] text-[#161A2E]/30 hover:text-[#161A2E]/60
                         border border-[#E8E5DF] hover:border-[#DDD6C8] rounded-lg transition-colors">
              ↻ Reset & re-scan
            </button>
          </div>
        </div>
      )}

      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </div>
  )
}