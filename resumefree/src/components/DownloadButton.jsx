import { useState } from 'react'
import generatePDF from '../utils/generatePDF'
import { useResumeStore } from '../store/resumeStore'

const STATES = {
  idle:    { label: 'Download PDF', cls: 'bg-[#161A2E] hover:bg-[#161A2E]/80 text-white border-transparent' },
  loading: { label: 'Generating…',  cls: 'bg-[#161A2E]/30 text-white border-transparent cursor-not-allowed' },
  done:    { label: 'Downloaded ✓', cls: 'bg-[#1E8E5A] text-white border-transparent' },
  error:   { label: 'Try again',    cls: 'bg-red-600 hover:bg-red-700 text-white border-transparent' },
}

export default function DownloadButton() {
  const resume          = useResumeStore((s) => s.resume)
  const [status, setStatus] = useState('idle')

  async function handleDownload() {
    if (status === 'loading') return
    console.log('RESUME DATA GOING TO PDF:', resume)
    setStatus('loading')
    try {
      await generatePDF(resume)
      setStatus('done')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (e) {
      console.error('PDF ERROR:', e)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const s = STATES[status]

  return (
    <button
      onClick={handleDownload}
      disabled={status === 'loading'}
      className={`flex items-center gap-1.5 h-8 px-3 text-xs font-semibold
                  rounded-lg border transition-all whitespace-nowrap ${s.cls}`}
    >
      {status === 'loading' ? (
        <>
          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          {s.label}
        </>
      ) : (
        <>↓ {s.label}</>
      )}
    </button>
  )
}