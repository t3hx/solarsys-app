/**
 * ~ Extrait les icones utilisees par l'application depuis les collections Iconify
 * installees et ecrit un sous-ensemble dans `src/hud/icons.generated.json`, charge hors
 * ligne par `src/hud/icons.ts` (aucun appel a l'API Iconify en production).
 *
 * Usage : pnpm icons
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

const require = createRequire(import.meta.url)

const wanted = {
  solar: [
    'settings-minimalistic-broken',
    'arrow-right-broken',
    'arrow-left-broken',
    'info-circle-broken',
    'close-circle-broken',
    'black-hole-bold',
    'asteroid-linear',
    'asteroid-bold',
    'planet-bold-duotone',
    'mouse-bold-duotone',
    'cursor-bold-duotone',
    'settings-bold-duotone',
    'magnifer-zoom-in-bold-duotone',
    'clock-circle-bold-duotone',
    'global-bold-duotone',
    'black-hole-bold-duotone',
    'rocket-2-bold-duotone',
    'document-text-bold-duotone',
    'star-bold-duotone',
    'medal-ribbons-star-broken',
    'tag-broken',
    'ruler-angular-broken',
    'sledgehammer-broken',
    'box-broken',
    'magnet-broken',
    'sun-broken',
    'planet-3-broken',
    'clock-circle-broken',
    'refresh-broken',
    'temperature-broken',
    'wind-broken',
    'leaf-broken',
    'moon-broken',
    'atom-broken',
  ],
  logos: [
    'react',
    'threejs',
    'typescript-icon',
    'tailwindcss-icon',
    'greensock-icon',
    'docker-icon',
  ],
  'simple-icons': ['nasa', 'wikipedia', 'theplanetarysociety'],
}

const collections = []
for (const [prefix, names] of Object.entries(wanted)) {
  const source = JSON.parse(
    readFileSync(require.resolve(`@iconify-json/${prefix}/icons.json`), 'utf8'),
  )
  const icons = {}
  for (const name of names) {
    const alias = source.aliases?.[name]
    const icon = source.icons[name] ?? (alias ? source.icons[alias.parent] : undefined)
    if (!icon) throw new Error(`Icon ${prefix}:${name} not found`)
    icons[name] = { ...icon, ...(alias ? { ...alias, parent: undefined } : {}) }
    delete icons[name].parent
  }
  const collection = { prefix, icons }
  for (const key of ['width', 'height', 'left', 'top'])
    if (source[key] !== undefined) collection[key] = source[key]
  collections.push(collection)
}

const target = resolve(process.cwd(), 'src/hud/icons.generated.json')
writeFileSync(target, `${JSON.stringify(collections)}\n`)
console.log(
  `Wrote ${collections.reduce((n, c) => n + Object.keys(c.icons).length, 0)} icons to ${target}`,
)
