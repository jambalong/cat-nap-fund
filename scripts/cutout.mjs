// One-off: removes the white background from the source cat photo (flood fill from the edges),
// trims it, and writes public/cat.png. Usage: node scripts/cutout.mjs <input.png>
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
import { readFileSync, writeFileSync } from 'node:fs'

const src = 'data:image/png;base64,' + readFileSync(process.argv[2]).toString('base64')
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage()
const out = await page.evaluate(async (src) => {
  const img = new Image()
  img.src = src
  await img.decode()
  const w = img.width, h = img.height
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0)
  const d = ctx.getImageData(0, 0, w, h)
  const px = d.data
  const hasAlpha = px[3] < 255
  const isBg = (i) => px[i + 3] < 10 || (px[i] > 238 && px[i + 1] > 238 && px[i + 2] > 238)
  const seen = new Uint8Array(w * h)
  const stack = []
  const push = (x, y) => { const k = y * w + x; if (!seen[k] && isBg(k * 4)) { seen[k] = 1; stack.push(k) } }
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1) }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y) }
  while (stack.length) {
    const k = stack.pop(), x = k % w, y = (k / w) | 0
    if (x > 0) push(x - 1, y); if (x < w - 1) push(x + 1, y)
    if (y > 0) push(x, y - 1); if (y < h - 1) push(x, y + 1)
  }
  for (let k = 0; k < w * h; k++) if (seen[k]) px[k * 4 + 3] = 0
  // soften the edge: pixels touching background get partial alpha
  const a = new Uint8Array(w * h)
  for (let k = 0; k < w * h; k++) a[k] = px[k * 4 + 3]
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const k = y * w + x
    if (a[k] && (!a[k - 1] || !a[k + 1] || !a[k - w] || !a[k + w])) px[k * 4 + 3] = 150
  }
  let x0 = w, y0 = h, x1 = 0, y1 = 0
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (px[(y * w + x) * 4 + 3] > 0) {
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y
  }
  ctx.putImageData(d, 0, 0)
  const tw = x1 - x0 + 1, th = y1 - y0 + 1
  const scale = Math.min(1, 560 / tw)
  const o = document.createElement('canvas')
  o.width = Math.round(tw * scale); o.height = Math.round(th * scale)
  const octx = o.getContext('2d')
  octx.imageSmoothingQuality = 'high'
  octx.drawImage(c, x0, y0, tw, th, 0, 0, o.width, o.height)
  return { hasAlpha, w, h, tw: o.width, th: o.height, data: o.toDataURL('image/png') }
}, src)
console.log({ ...out, data: undefined })
writeFileSync('public/cat.png', Buffer.from(out.data.split(',')[1], 'base64'))
await browser.close()
