// src/utils/atsCheck.js
// ATS keyword database — Indian tech job market focused
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

const ALL_KEYWORDS = Object.entries(ATS_KEYWORDS).flatMap(([category, words]) =>
  words.map((word) => ({ word, category }))
)

// ── Boundary-aware keyword matching ─────────────────────────────────────────
// Fixes "java" matching inside "javascript", "sql" matching inside "mysql", etc.
// Handles special-char keywords (node.js, c++, c#) correctly.
function matchesKeyword(text, keyword) {
  if (keyword.includes(' ')) {
    // Multi-word phrase — substring is fine, won't cause false positives
    return text.includes(keyword)
  }

  const hasSpecialChars = /[^a-z0-9]/.test(keyword)

  if (hasSpecialChars) {
    // Manual boundary check for things like node.js, c++, c#
    const idx = text.indexOf(keyword)
    if (idx === -1) return false
    const beforeOk = idx === 0 || !/[a-z0-9]/.test(text[idx - 1])
    const afterOk  = idx + keyword.length >= text.length || !/[a-z0-9]/.test(text[idx + keyword.length])
    return beforeOk && afterOk
  }

  // Pure alphanumeric word — word-boundary regex
  return new RegExp('(?<![a-z0-9])' + keyword + '(?![a-z0-9])', 'i').test(text)
}

function extractResumeText(resumeData) {
  const parts = []

  if (resumeData.personal) {
    parts.push(resumeData.personal.summary || '')
  }

  if (resumeData.experience) {
    resumeData.experience.forEach((exp) => {
      parts.push(exp.role || '')
      parts.push(exp.company || '')
      if (Array.isArray(exp.bullets)) parts.push(...exp.bullets)
    })
  }

  if (resumeData.skills) {
    const s = resumeData.skills
    if (Array.isArray(s.technical)) parts.push(...s.technical)
    if (Array.isArray(s.tools))     parts.push(...s.tools)
    if (Array.isArray(s.languages)) parts.push(...s.languages)
    if (typeof s.technical === 'string') parts.push(s.technical)
  }

  if (resumeData.projects) {
    resumeData.projects.forEach((p) => {
      parts.push(p.name || '')
      parts.push(p.description || '')
      if (Array.isArray(p.techStack)) parts.push(...p.techStack)
      if (Array.isArray(p.bullets))   parts.push(...p.bullets)
    })
  }

  if (resumeData.education) {
    resumeData.education.forEach((e) => {
      parts.push(e.degree || '')
      parts.push(e.institution || '')
    })
  }

  return parts.join(' ').toLowerCase()
}

export function runATSCheck(resumeData) {
  const text = extractResumeText(resumeData)

  const matched = []
  const missing = []

  ALL_KEYWORDS.forEach(({ word, category }) => {
    if (matchesKeyword(text, word.toLowerCase())) {
      matched.push({ word, category })
    } else {
      missing.push({ word, category })
    }
  })

  // Honest score — no artificial floor
  // A resume with 10 of 64 keywords (~16%) gets ~16/100
  // Typical strong student resume with 25 keywords gets ~39/100
  // So we scale: raw% * 1.5 capped at 100, giving strong resumes ~60+
  const ratio = matched.length / ALL_KEYWORDS.length
  const score = Math.min(100, Math.round(ratio * 150))

  const categoryBreakdown = {}
  Object.keys(ATS_KEYWORDS).forEach((cat) => {
    const total = ATS_KEYWORDS[cat].length
    const found  = matched.filter((m) => m.category === cat).length
    categoryBreakdown[cat] = { found, total }
  })

  return { score, matched, missing, categoryBreakdown }
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