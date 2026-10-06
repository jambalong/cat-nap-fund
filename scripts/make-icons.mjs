// One-off: renders app icons (cat on a Catppuccin Mocha tile) to PNGs using the preinstalled Chromium.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
import { readFileSync } from 'node:fs'

const cat = 'data:image/png;base64,' + readFileSync('public/cat.png').toString('base64')
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
for (const size of [192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  await page.setContent(`<body style="margin:0;width:${size}px;height:${size}px;background:#cba6f7;display:grid;place-items:center">
    <div style="width:78%;aspect-ratio:1;border-radius:50%;background:#eff1f5;display:grid;place-items:center">
      <img src="${cat}" style="width:84%"></div></body>`)
  await page.screenshot({ path: `public/icon-${size}.png` })
}
await browser.close()
