// One-off: renders public/icon.svg to PNGs using the preinstalled Chromium.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
import { readFileSync } from 'node:fs'
const svg = readFileSync('public/icon.svg', 'utf8')
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
for (const size of [192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  await page.setContent(`<body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body>`)
  await page.screenshot({ path: `public/icon-${size}.png` })
}
await browser.close()
