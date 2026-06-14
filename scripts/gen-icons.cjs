// Rasterize the cow logo into the source PNGs @capacitor/assets needs.
// Uses sharp (a dependency of @capacitor/assets). Output → assets/*.png
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const A = path.join(__dirname, '..', 'assets')
const fgSvg = path.join(A, 'icon-foreground.svg')
const GREEN = { r: 27, g: 94, b: 32, alpha: 1 } // #1B5E20

async function main() {
  const fgPng = await sharp(fgSvg, { density: 300 })
    .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
  fs.writeFileSync(path.join(A, 'icon-foreground.png'), fgPng)

  const bg = await sharp({ create: { width: 1024, height: 1024, channels: 4, background: GREEN } }).png().toBuffer()
  fs.writeFileSync(path.join(A, 'icon-background.png'), bg)

  const only = await sharp({ create: { width: 1024, height: 1024, channels: 4, background: GREEN } })
    .composite([{ input: fgPng }])
    .png()
    .toBuffer()
  fs.writeFileSync(path.join(A, 'icon-only.png'), only)

  console.log('icon source PNGs written to assets/')
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
