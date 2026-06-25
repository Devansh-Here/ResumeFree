// src/utils/atsCheck.js — Role-aware ATS checker
// Each role has its own set of relevant keywords.
// A frontend dev is never told "you're missing Kotlin or Kubernetes."

// ── Full keyword database (for detection + category bars) ────────────────────
const ATS_KEYWORDS = {
  languages: [
    'java', 'python', 'javascript', 'typescript', 'c++', 'c#', 'kotlin',
    'swift', 'go', 'rust', 'php', 'ruby', 'scala',
  ],
  frontend: [
    'react', 'angular', 'vue', 'html', 'css', 'tailwind', 'bootstrap',
    'next.js', 'redux', 'webpack', 'sass',
  ],
  backend: [
    'node.js', 'express', 'spring boot', 'django', 'flask', 'fastapi',
    'rest api', 'graphql', 'microservices',
  ],
  database: [
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle',
    'firebase', 'dynamodb',
  ],
  devops: [
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git',
    'ci/cd', 'jenkins', 'linux',
  ],
  concepts: [
    'data structures', 'algorithms', 'oops', 'object oriented',
    'system design', 'agile', 'scrum', 'mvc',
  ],
  softSkills: [
    'leadership', 'communication', 'teamwork', 'problem solving',
    'analytical', 'collaboration',
  ],
}

// ── Role profiles ────────────────────────────────────────────────────────────
// signal   — keywords used to auto-detect this role from the resume
// relevant — ONLY these keywords will appear in "missing" suggestions
const ROLE_PROFILES = {
  frontend: {
    label: 'Frontend Developer',
    signal: ['react', 'angular', 'vue', 'html', 'css', 'next.js', 'redux', 'tailwind', 'bootstrap', 'webpack', 'sass'],
    relevant: new Set([
      'javascript', 'typescript',
      'react', 'angular', 'vue', 'html', 'css', 'tailwind', 'bootstrap', 'next.js', 'redux', 'webpack', 'sass',
      'node.js', 'rest api', 'graphql',
      'mongodb', 'firebase', 'sql',
      'git', 'aws',
      'data structures', 'algorithms', 'oops', 'object oriented', 'system design', 'agile',
      'leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'collaboration',
    ]),
  },
  backend: {
    label: 'Backend Developer',
    signal: ['spring boot', 'django', 'flask', 'fastapi', 'node.js', 'express', 'rest api', 'graphql', 'microservices'],
    relevant: new Set([
      'java', 'python', 'javascript', 'typescript', 'go', 'php', 'c#',
      'node.js', 'express', 'spring boot', 'django', 'flask', 'fastapi', 'rest api', 'graphql', 'microservices',
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'firebase', 'dynamodb',
      'docker', 'git', 'aws', 'linux', 'ci/cd', 'kubernetes',
      'data structures', 'algorithms', 'oops', 'object oriented', 'system design', 'agile', 'scrum', 'mvc',
      'leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'collaboration',
    ]),
  },
  fullstack: {
    label: 'Full Stack Developer',
    signal: ['react', 'node.js', 'express', 'mongodb', 'rest api', 'angular', 'vue', 'spring boot', 'django'],
    relevant: new Set([
      'javascript', 'typescript', 'python', 'java',
      'react', 'angular', 'vue', 'html', 'css', 'tailwind', 'next.js', 'redux',
      'node.js', 'express', 'spring boot', 'django', 'flask', 'rest api', 'graphql', 'microservices',
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase',
      'docker', 'git', 'aws', 'linux', 'ci/cd',
      'data structures', 'algorithms', 'oops', 'object oriented', 'system design', 'agile', 'scrum', 'mvc',
      'leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'collaboration',
    ]),
  },
  devops: {
    label: 'DevOps / Cloud Engineer',
    signal: ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'ci/cd', 'linux'],
    relevant: new Set([
      'python', 'go', 'javascript',
      'rest api',
      'sql', 'redis',
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'ci/cd', 'jenkins', 'linux',
      'system design', 'agile', 'scrum',
      'leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'collaboration',
    ]),
  },
  data: {
    label: 'Data / ML Engineer',
    signal: ['python', 'machine learning', 'data science', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'tableau', 'power bi'],
    relevant: new Set([
      'python', 'r', 'sql', 'java', 'scala',
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'dynamodb',
      'docker', 'git', 'aws', 'azure', 'gcp', 'linux',
      'data structures', 'algorithms', 'oops', 'object oriented', 'system design', 'agile',
      'leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'collaboration',
    ]),
  },
  android: {
    label: 'Android Developer',
    signal: ['kotlin', 'android', 'android studio', 'jetpack', 'retrofit', 'coroutines'],
    relevant: new Set([
      'kotlin', 'java', 'python',
      'sql', 'firebase', 'mongodb',
      'git', 'aws',
      'data structures', 'algorithms', 'oops', 'object oriented', 'system design', 'agile', 'mvc',
      'leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'collaboration',
    ]),
  },
  ios: {
    label: 'iOS Developer',
    signal: ['swift', 'ios', 'xcode', 'swiftui', 'uikit'],
    relevant: new Set([
      'swift', 'python',
      'sql', 'firebase',
      'git', 'aws',
      'data structures', 'algorithms', 'oops', 'object oriented', 'system design', 'agile', 'mvc',
      'leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'collaboration',
    ]),
  },
}

// Default: general / fresher — show everything
const DEFAULT_RELEVANT = new Set(Object.values(ATS_KEYWORDS).flat())

// ── Boundary-aware keyword matching ─────────────────────────────────────────
function matchesKeyword(text, keyword) {
  if (keyword.includes(' ')) return text.includes(keyword)
  const hasSpecialChars = /[^a-z0-9]/.test(keyword)
  if (hasSpecialChars) {
    const idx = text.indexOf(keyword)
    if (idx === -1) return false
    const beforeOk = idx === 0 || !/[a-z0-9]/.test(text[idx - 1])
    const afterOk  = idx + keyword.length >= text.length || !/[a-z0-9]/.test(text[idx + keyword.length])
    return beforeOk && afterOk
  }
  return new RegExp('(?<![a-z0-9])' + keyword + '(?![a-z0-9])', 'i').test(text)
}

// ── Text extraction ──────────────────────────────────────────────────────────
function extractResumeText(resumeData) {
  const parts = []
  if (resumeData.personal?.summary) parts.push(resumeData.personal.summary)
  resumeData.experience?.forEach((exp) => {
    parts.push(exp.role || '', exp.company || '')
    if (Array.isArray(exp.bullets)) parts.push(...exp.bullets)
  })
  if (resumeData.skills) {
    const s = resumeData.skills
    if (Array.isArray(s.technical)) parts.push(...s.technical)
    if (Array.isArray(s.tools))     parts.push(...s.tools)
    if (Array.isArray(s.languages)) parts.push(...s.languages)
  }
  resumeData.projects?.forEach((p) => {
    parts.push(p.name || '', p.description || '')
    if (Array.isArray(p.techStack)) parts.push(...p.techStack)
    if (Array.isArray(p.bullets))   parts.push(...p.bullets)
  })
  resumeData.education?.forEach((e) => {
    parts.push(e.degree || '', e.institution || '')
  })
  return parts.join(' ').toLowerCase()
}

// ── Role detection ───────────────────────────────────────────────────────────
function detectRole(text) {
  let bestRole = null
  let bestScore = 0
  Object.entries(ROLE_PROFILES).forEach(([roleKey, profile]) => {
    const hits = profile.signal.filter((sig) => matchesKeyword(text, sig)).length
    const score = hits / profile.signal.length
    if (score > bestScore) { bestScore = score; bestRole = roleKey }
  })
  return bestScore >= 0.2 ? bestRole : null
}

// ── Main ATS check ───────────────────────────────────────────────────────────
export function runATSCheck(resumeData) {
  const text         = extractResumeText(resumeData)
  const detectedRole = detectRole(text)
  const profile      = detectedRole ? ROLE_PROFILES[detectedRole] : null
  const roleLabel    = profile ? profile.label : 'General / Fresher'
  const relevantSet  = profile ? profile.relevant : DEFAULT_RELEVANT

  const matched = []
  const missing = []

  Object.entries(ATS_KEYWORDS).forEach(([category, words]) => {
    words.forEach((word) => {
      if (matchesKeyword(text, word.toLowerCase())) {
        matched.push({ word, category })
      } else {
        missing.push({ word, category })
      }
    })
  })

  // Score: only relevant keywords count
  const relevantTotal   = [...relevantSet].length
  const relevantMatched = matched.filter((m) => relevantSet.has(m.word)).length
  const score = relevantTotal > 0
    ? Math.min(100, Math.round((relevantMatched / relevantTotal) * 100))
    : 0

  // Category breakdown — only categories that have relevant keywords
  const categoryBreakdown = {}
  Object.keys(ATS_KEYWORDS).forEach((cat) => {
    const relevantInCat = ATS_KEYWORDS[cat].filter((w) => relevantSet.has(w))
    const foundInCat    = matched.filter((m) => m.category === cat && relevantSet.has(m.word))
    categoryBreakdown[cat] = {
      found: foundInCat.length,
      total: relevantInCat.length,
      relevant: relevantInCat.length > 0,
    }
  })

  // Missing: only relevant keywords
  const relevantMissing = missing.filter((m) => relevantSet.has(m.word))

  return { score, matched, missing: relevantMissing, categoryBreakdown, roleLabel, detectedRole }
}

export function getScoreLabel(score) {
  if (score >= 75) return { label: 'Strong',  color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200',  ring: '#16a34a' }
  if (score >= 50) return { label: 'Good',    color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   ring: '#2563eb' }
  if (score >= 25) return { label: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', ring: '#ca8a04' }
  return              { label: 'Weak',    color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    ring: '#dc2626' }
}

export const CATEGORY_LABELS = {
  languages:  'Programming Languages',
  frontend:   'Frontend',
  backend:    'Backend',
  database:   'Databases',
  devops:     'DevOps & Cloud',
  concepts:   'CS Concepts',
  softSkills: 'Soft Skills',
}