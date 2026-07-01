import { useState } from 'react'
import generatePDF from '../utils/generatePDF'
import { useResumeStore } from '../store/resumeStore'

export default function DownloadButton() {
  const resume = useResumeStore((s) => s.resume)
  const selectedTemplateId = useResumeStore((s) => s.selectedTemplateId)
  const [status, setStatus] = useState('idle') // idle | loading | done | error

  async function handleDownload() {
    if (status === 'loading') return
    setStatus('loading')
    try {
      await generatePDF(resume, selectedTemplateId)
      setStatus('done')
      setTimeout(() => setStatus('idle'), 2800)
    } catch (e) {
      console.error('PDF ERROR:', e)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2800)
    }
  }

  const bg =
    status === 'done'  ? 'bg-[#059669]' :
    status === 'error' ? 'bg-red-600' :
                          'bg-[#0a1628]'

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={status === 'loading'}
        className={`group relative overflow-hidden flex items-center justify-center gap-2
                    min-w-[152px] h-9 px-4 text-xs font-semibold text-white
                    rounded-full transition-colors duration-300 ease-out
                    ${bg} ${status === 'error' ? 'rf-shake' : ''}
                    ${status === 'loading' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {/* loading sweep bar */}
        {status === 'loading' && (
          <span className="absolute bottom-0 left-0 w-full h-[3px] overflow-hidden">
            <span className="block h-full w-1/3 bg-white/80 rf-sweep" />
          </span>
        )}

        {/* ICON */}
        <span className="relative flex items-center justify-center w-3.5 h-3.5">
          {status === 'idle' && (
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 rf-bob-trigger">
              <path d="M8 1.5v8" stroke="white" strokeWidth="1.6" strokeLinecap="round" className="rf-arrow"/>
              <path d="M4.5 6.5L8 10l3.5-3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="rf-arrow"/>
              <path d="M2 13.5h12" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          )}

          {status === 'loading' && (
            <span className="flex items-end gap-[3px] h-3">
              <span className="w-[3px] h-[3px] rounded-full bg-white rf-dot" style={{ animationDelay: '0ms' }} />
              <span className="w-[3px] h-[3px] rounded-full bg-white rf-dot" style={{ animationDelay: '120ms' }} />
              <span className="w-[3px] h-[3px] rounded-full bg-white rf-dot" style={{ animationDelay: '240ms' }} />
            </span>
          )}

          {status === 'done' && (
            <span className="relative inline-flex">
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 rf-pop">
                <path d="M3 8.5l3.2 3.2L13 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {/* mini burst particles */}
              {[
                { tx: '-10px', ty: '-8px' },
                { tx: '10px',  ty: '-8px' },
                { tx: '-8px',  ty: '8px'  },
                { tx: '8px',   ty: '8px'  },
              ].map((p, i) => (
                <span
                  key={i}
                  className="absolute top-1/2 left-1/2 w-[3px] h-[3px] rounded-full bg-white rf-burst"
                  style={{ '--tx': p.tx, '--ty': p.ty, animationDelay: `${i * 30}ms` }}
                />
              ))}
            </span>
          )}

          {status === 'error' && (
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
              <path d="M4 4l8 8M12 4l-8 8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          )}
        </span>

        <span className="relative">
          {status === 'idle' && 'Download PDF'}
          {status === 'loading' && 'Generating…'}
          {status === 'done' && 'Downloaded'}
          {status === 'error' && 'Try again'}
        </span>
      </button>

      <style>{`
        @keyframes rf-bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(3px); }
        }
        .group:hover .rf-bob-trigger .rf-arrow {
          animation: rf-bob 0.7s ease-in-out infinite;
        }

        @keyframes rf-sweep {
          0%   { transform: translateX(-110%); }
          100% { transform: translateX(310%); }
        }
        .rf-sweep { animation: rf-sweep 0.9s ease-in-out infinite; }

        @keyframes rf-dot-fall {
          0%, 100% { transform: translateY(0px);   opacity: 0.4; }
          50%      { transform: translateY(4px);   opacity: 1;   }
        }
        .rf-dot { animation: rf-dot-fall 0.8s ease-in-out infinite; }

        @keyframes rf-pop {
          0%   { transform: scale(0.3) rotate(-20deg); opacity: 0; }
          60%  { transform: scale(1.25) rotate(6deg);   opacity: 1; }
          100% { transform: scale(1) rotate(0deg);      opacity: 1; }
        }
        .rf-pop { animation: rf-pop 0.45s cubic-bezier(.34,1.56,.64,1) both; }

        @keyframes rf-burst {
          0%   { transform: translate(0,0) scale(1);   opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        .rf-burst { animation: rf-burst 0.55s ease-out forwards; }

        @keyframes rf-shake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-4px); }
          40%      { transform: translateX(4px); }
          60%      { transform: translateX(-3px); }
          80%      { transform: translateX(3px); }
        }
        .rf-shake { animation: rf-shake 0.4s ease-in-out; }
      `}</style>
    </>
  )
}