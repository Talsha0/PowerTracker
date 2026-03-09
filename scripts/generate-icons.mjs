/**
 * Generates placeholder PWA icons using Canvas API (Node.js).
 * Run: node scripts/generate-icons.mjs
 *
 * Requires: npm install canvas
 * (or use an online icon generator and place PNGs in public/icons/)
 */

import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ICONS_DIR = join(__dirname, '../public/icons')

mkdirSync(ICONS_DIR, { recursive: true })

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512]

function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#111827'
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, size * 0.22)
  ctx.fill()

  // Gradient circle
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, '#38bdf8')
  gradient.addColorStop(1, '#0284c7')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size * 0.35, 0, Math.PI * 2)
  ctx.fill()

  // "P" text
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${size * 0.38}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('P', size / 2, size / 2 + size * 0.02)

  return canvas.toBuffer('image/png')
}

for (const size of sizes) {
  const filename = size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`
  const buffer = generateIcon(size)
  writeFileSync(join(ICONS_DIR, filename), buffer)
  console.log(`Generated: ${filename}`)
}

console.log('\nAll icons generated in public/icons/')
console.log('Replace with branded icons before production deployment.')
