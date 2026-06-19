import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib'

const C = {
  ink:   rgb(22/255,  26/255,  46/255),
  green: rgb(30/255, 142/255,  90/255),
  gray:  rgb(90/255,  90/255,  90/255),
  light: rgb(150/255,150/255, 150/255),
}

const SZ = { name: 22, contact: 9, section: 9, title: 10.5, body: 9.5 }
const MARGIN = { top: 48, bottom: 36, left: 48, right: 48 }

export default async function generatePDF(resumeData) {
  console.log('generatePDF called with:', resumeData?.personal?.name)

  const doc  = await PDFDocument.create()
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const reg  = await doc.embedFont(StandardFonts.Helvetica)
  const ital = await doc.embedFont(StandardFonts.HelveticaOblique)

  let page, W, H, y

  const addPage = () => {
    page = doc.addPage(PageSizes.A4)
    W    = page.getSize().width
    H    = page.getSize().height
    y    = H - MARGIN.top
  }

  addPage()
  const cw = W - MARGIN.left - MARGIN.right

  const guard = (need) => { if (y - need < MARGIN.bottom) addPage() }

  const tw = (text, font, size) =>
    font.widthOfTextAtSize(String(text || ''), size)

  const drawText = (text, x, font, size, color = C.ink) => {
    if (!text) return
    page.drawText(String(text), { x, y, font, size, color })
  }

  const drawCentered = (text, font, size, color = C.ink) => {
    if (!text) return
    const x = MARGIN.left + (cw - tw(text, font, size)) / 2
    page.drawText(String(text), { x, y, font, size, color })
  }

  const drawRight = (text, font, size, color = C.light) => {
    if (!text) return
    const x = W - MARGIN.right - tw(text, font, size)
    page.drawText(String(text), { x, y, font, size, color })
  }

  const wrapText = (text, font, size, maxW) => {
    const words = String(text || '').split(' ')
    const lines = []
    let cur = ''
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w
      if (tw(test, font, size) > maxW && cur) { lines.push(cur); cur = w }
      else cur = test
    }
    if (cur) lines.push(cur)
    return lines
  }

  const drawWrapped = (text, x, font, size, maxW, color = C.ink, lh = 1.5) => {
    if (!text) return
    wrapText(text, font, size, maxW).forEach((line) => {
      guard(size * lh)
      page.drawText(line, { x, y, font, size, color })
      y -= size * lh
    })
  }

  const rule = (color = C.light, t = 0.4) =>
    page.drawLine({
      start: { x: MARGIN.left, y },
      end:   { x: W - MARGIN.right, y },
      thickness: t, color,
    })

  const sectionHeader = (title) => {
    guard(30)
    y -= 12
    page.drawText(title.toUpperCase(), {
      x: MARGIN.left, y,
      font: bold, size: SZ.section, color: C.green,
    })
    // rule on same y, after the text
    page.drawLine({
      start: { x: MARGIN.left + tw(title.toUpperCase(), bold, SZ.section) + 6, y: y + SZ.section / 2 },
      end:   { x: W - MARGIN.right, y: y + SZ.section / 2 },
      thickness: 0.6, color: C.light,
    })
    y -= 10
  }

  // ── PERSONAL ──────────────────────────────────────────
  const pi = resumeData?.personal || {}

  // Name — centered
  if (pi.name) {
    const nameW = tw(pi.name, bold, SZ.name)
    page.drawText(pi.name, {
      x: MARGIN.left + (cw - nameW) / 2,
      y,
      font: bold, size: SZ.name, color: C.ink,
    })
    y -= SZ.name * 1.4
  }

  // Contact row 1 — email · phone · address (centered)
  const row1 = [pi.email, pi.phone, pi.address].filter(Boolean)
  if (row1.length) {
    const str = row1.join('   ·   ')
    const x   = MARGIN.left + (cw - tw(str, reg, SZ.contact)) / 2
    page.drawText(str, { x, y, font: reg, size: SZ.contact, color: C.gray })
    y -= SZ.contact * 1.6
  }

  // Contact row 2 — linkedin · github · portfolio in green (centered)
  const row2 = [pi.linkedin, pi.github, pi.portfolio].filter(Boolean)
  if (row2.length) {
    const str = row2.join('   ·   ')
    const x   = MARGIN.left + (cw - tw(str, reg, SZ.contact)) / 2
    page.drawText(str, { x, y, font: reg, size: SZ.contact, color: C.green })
    y -= SZ.contact * 1.8
  }

  // ── EDUCATION ─────────────────────────────────────────
  // Preview layout: "degree · college" left, "year · cgpa" right — one line
  const education = resumeData?.education || []
  if (education.length) {
    sectionHeader('Education')
    for (const edu of education) {
      guard(22)

      const left  = [edu.degree, edu.college].filter(Boolean).join(' · ')
      const right = [edu.year, edu.cgpa ? `${edu.cgpa}%` : ''].filter(Boolean).join(' · ')

      // Draw right first (so left can overlap naturally)
      drawRight(right, reg, SZ.body)

      // Draw left — bold degree, then · college in reg
      if (edu.degree) {
        page.drawText(edu.degree, { x: MARGIN.left, y, font: bold, size: SZ.body, color: C.ink })
        const degW = tw(edu.degree, bold, SZ.body)
        if (edu.college) {
          const sep = ' · '
          page.drawText(sep + edu.college, {
            x: MARGIN.left + degW, y,
            font: reg, size: SZ.body, color: C.gray,
          })
        }
      } else if (edu.college) {
        page.drawText(edu.college, { x: MARGIN.left, y, font: bold, size: SZ.body, color: C.ink })
      }

      y -= SZ.body * 1.7
    }
  }

  // ── EXPERIENCE ────────────────────────────────────────
  // Preview layout: "role · company" left, "duration" right — one line, then bullets
  const experience = resumeData?.experience || []
  if (experience.length) {
    sectionHeader('Experience')
    for (const exp of experience) {
      guard(28)

      drawRight(exp.duration || '', reg, SZ.body)

      // role bold + · company reg
      if (exp.role) {
        page.drawText(exp.role, { x: MARGIN.left, y, font: bold, size: SZ.body, color: C.ink })
        const roleW = tw(exp.role, bold, SZ.body)
        if (exp.company) {
          page.drawText(' · ' + exp.company, {
            x: MARGIN.left + roleW, y,
            font: reg, size: SZ.body, color: C.gray,
          })
        }
      }
      y -= SZ.body * 1.6

      // Bullets
      const bullets = (exp.bullets || []).filter(b => b?.trim())
      for (const bullet of bullets) {
        guard(SZ.body * 1.5)
        page.drawText('•', { x: MARGIN.left + 4, y, font: reg, size: SZ.body, color: C.ink })
        drawWrapped(bullet, MARGIN.left + 14, reg, SZ.body, cw - 14, C.ink)
      }
      y -= 6
    }
  }

  // ── PROJECTS ──────────────────────────────────────────
  // Preview layout: "name" left bold, techStack right gray — one line, then bullets
  const projects = resumeData?.projects || []
  if (projects.length) {
    sectionHeader('Projects')
    for (const proj of projects) {
      guard(22)

      const tech = Array.isArray(proj.techStack)
        ? proj.techStack.join(', ')
        : (proj.techStack || '')

      // Tech on right
      if (tech) drawRight(tech, reg, SZ.body, C.gray)

      // Name on left bold
      page.drawText(proj.name || 'Project', {
        x: MARGIN.left, y, font: bold, size: SZ.body, color: C.ink,
      })
      y -= SZ.body * 1.6

      // Description
      if (proj.description) {
        drawWrapped(proj.description, MARGIN.left, ital, SZ.body, cw, C.gray)
      }

      // Bullets
      const bullets = (proj.bullets || []).filter(b => b?.trim())
      for (const bullet of bullets) {
        guard(SZ.body * 1.5)
        page.drawText('•', { x: MARGIN.left + 4, y, font: reg, size: SZ.body, color: C.ink })
        drawWrapped(bullet, MARGIN.left + 14, reg, SZ.body, cw - 14, C.ink)
      }
      y -= 6
    }
  }

  // ── SKILLS ────────────────────────────────────────────
  // Preview layout: "Technical:" bold + items reg — one line each
  const skills = resumeData?.skills
  if (skills) {
    const labelMap = { technical: 'Technical', tools: 'Tools', languages: 'Languages' }
    const hasAny = Object.values(skills).some(v => Array.isArray(v) && v.length > 0)
    if (hasAny) {
      sectionHeader('Skills')
      for (const [key, val] of Object.entries(skills)) {
        if (!Array.isArray(val) || val.length === 0) continue
        const label  = (labelMap[key] || key) + ': '
        const items  = val.join(', ')
        const labelW = tw(label, bold, SZ.body)
        guard(SZ.body * 1.6)
        page.drawText(label, { x: MARGIN.left, y, font: bold, size: SZ.body, color: C.ink })
        drawWrapped(items, MARGIN.left + labelW, reg, SZ.body, cw - labelW, C.gray)
        y -= 4
      }
    }
  }

  // ── SAVE ──────────────────────────────────────────────
  const bytes  = await doc.save()
  const blob   = new Blob([bytes], { type: 'application/pdf' })
  const url    = URL.createObjectURL(blob)
  const a      = document.createElement('a')
  const name   = (pi.name || 'Resume').replace(/\s+/g, '_')
  a.href       = url
  a.download   = `${name}_Resume.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}