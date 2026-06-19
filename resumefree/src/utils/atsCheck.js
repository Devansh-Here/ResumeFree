// ATS keyword database — Indian tech job market focused
const ATS_KEYWORDS = {
  languages: [
    'java', 'python', 'javascript', 'typescript', 'c++', 'c#', 'kotlin',
    'swift', 'go', 'rust', 'php', 'ruby', 'scala', 'r',
  ],
  frontend: [
    'react', 'angular', 'vue', 'html', 'css', 'tailwind', 'bootstrap',
    'next.js', 'redux', 'webpack', 'sass',
  ],
  backend: [
    'node.js', 'express', 'spring boot', 'django', 'flask', 'fastapi',
    'rest api', 'graphql', 'microservices', 'servlet',
  ],
  database: [
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle',
    'firebase', 'dynamodb', 'cassandra',
  ],
  devops: [
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'github',
    'ci/cd', 'jenkins', 'linux', 'terraform',
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

// Flatten all keywords into one searchable list with category info
const ALL_KEYWORDS = Object.entries(ATS_KEYWORDS).flatMap(([category, words]) =>
  words.map((word) => ({ word, category }))
)

/**
 * Extract all text from resume store data into one lowercase string
 */
function extractResumeText(resumeData) {
  const parts = []

  // Personal
  if (resumeData.personal) {
    parts.push(resumeData.personal.summary || '')
  }

  // Experience bullets
  if (resumeData.experience) {
    resumeData.experience.forEach((exp) => {
      parts.push(exp.role || '')
      parts.push(exp.company || '')
      if (Array.isArray(exp.bullets)) parts.push(...exp.bullets)
    })
  }

  // Skills
  if (resumeData.skills) {
    const s = resumeData.skills
    if (Array.isArray(s.technical)) parts.push(...s.technical)
    if (Array.isArray(s.tools)) parts.push(...s.tools)
    if (Array.isArray(s.languages)) parts.push(...s.languages)
    if (typeof s.technical === 'string') parts.push(s.technical)
  }

  // Projects
  if (resumeData.projects) {
    resumeData.projects.forEach((p) => {
      parts.push(p.name || '')
      parts.push(p.description || '')
      if (Array.isArray(p.techStack)) parts.push(...p.techStack)
    })
  }

  // Education
  if (resumeData.education) {
    resumeData.education.forEach((e) => {
      parts.push(e.degree || '')
      parts.push(e.institution || '')
    })
  }

  return parts.join(' ').toLowerCase()
}

/**
 * Run ATS check on resume data
 * Returns: { score, matched, missing, categoryBreakdown }
 */
export function runATSCheck(resumeData) {
  const text = extractResumeText(resumeData)

  const matched = []
  const missing = []

  ALL_KEYWORDS.forEach(({ word, category }) => {
    if (text.includes(word.toLowerCase())) {
      matched.push({ word, category })
    } else {
      missing.push({ word, category })
    }
  })

  // Score: matched / total, scaled 0-100
  const raw = matched.length / ALL_KEYWORDS.length
  // Curve it a bit so even a decent resume hits 60+
  const score = Math.min(100, Math.round(40 + raw * 65))

  // Category breakdown — what % of each category is covered
  const categoryBreakdown = {}
  Object.keys(ATS_KEYWORDS).forEach((cat) => {
    const total = ATS_KEYWORDS[cat].length
    const found = matched.filter((m) => m.category === cat).length
    categoryBreakdown[cat] = { found, total }
  })

  return { score, matched, missing, categoryBreakdown }
}

/**
 * Score label and color for UI
 */
export function getScoreLabel(score) {
  if (score >= 80) return { label: 'Strong',  color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200', ring: '#16a34a' }
  if (score >= 60) return { label: 'Good',    color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',  ring: '#2563eb' }
  if (score >= 40) return { label: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200',ring: '#ca8a04' }
  return              { label: 'Weak',    color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',   ring: '#dc2626' }
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