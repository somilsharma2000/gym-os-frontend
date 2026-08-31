/**
 * Automatic QR Code Token Generator
 * 
 * Generates unique QR tokens for members and trial passes.
 * Format: MBR-[INITIALS]-[SEQUENCE] for members
 *         TRL-[SEQUENCE] for trial passes
 *         BIO-[INITIALS]-[SEQUENCE] for biometric entries
 */

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, 3).toUpperCase()
  }
  const first = parts[0][0] || ''
  const last = parts[parts.length - 1].substring(0, 2) || ''
  return (first + last).toUpperCase()
}

export function generateMemberQrToken(name: string, existingCount: number = 0): string {
  const initials = getInitials(name)
  const sequence = String(existingCount + 1).padStart(3, '0')
  return `MBR-${initials}-${sequence}`
}

export function generateTrialQrToken(existingCount: number = 0): string {
  const sequence = String(existingCount + 1).padStart(4, '0')
  return `TRL-${sequence}`
}

export function generateBioQrToken(name: string, existingCount: number = 0): string {
  const initials = getInitials(name)
  const sequence = String(existingCount + 1).padStart(3, '0')
  return `BIO-${initials}-${sequence}`
}

export function generateQrCheckInUrl(qrToken: string, gymId?: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://gym-os.beyondpixells.com'
  const gym = gymId ? `&gym=${gymId}` : ''
  return `${base}/check-in?token=${qrToken}${gym}`
}

export function generateQrCodeSvg(qrToken: string): string {
  const hash = qrToken.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)
  const size = 21
  const cells: boolean[][] = Array(size).fill(0).map(() => Array(size).fill(false))

  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          cells[startY + r][startX + c] = true
        }
      }
    }
  }

  drawFinder(0, 0)
  drawFinder(size - 7, 0)
  drawFinder(0, size - 7)

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7)) continue
      const val = Math.abs((hash ^ (r * 31 + c * 17))) % 3
      if (val === 0 || val === 1) {
        cells[r][c] = true
      }
    }
  }

  const cellSize = 10
  const totalSize = size * cellSize
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="200" height="200">`
  svg += `<rect width="${totalSize}" height="${totalSize}" fill="white"/>`
  
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (cells[r][c]) {
        svg += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`
      }
    }
  }
  svg += '</svg>'
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}
