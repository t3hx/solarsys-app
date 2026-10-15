/**
 * @module hud/bodySymbols
 * @description Glyphes astronomiques (viewBox 12×12) des corps du jeu de donnees.
 */

export interface Glyph {
  d: string
  strokeWidth?: number
  fill?: boolean
  linecap?: 'round' | 'butt'
  linejoin?: 'round' | 'miter'
  transform?: string
}

const thin = { strokeWidth: 0.6, linecap: 'round', linejoin: 'round' } as const
const thick = { strokeWidth: 1, linecap: 'butt', linejoin: 'miter' } as const

export const GLYPHS: Record<string, Glyph[]> = {
  sun: [
    { d: 'M6 5.102a.899.899 0 1 0 0 1.797.899.899 0 0 0 0-1.797Z', fill: true },
    {
      d: 'M110 60c0 27.617-22.383 50-50 50S10 87.617 10 60s22.383-50 50-50 50 22.383 50 50z',
      strokeWidth: 6,
      transform: 'matrix(.1 0 0 -.1 0 12)',
    },
  ],
  mercury: [
    {
      d: 'M8 5a1.999 1.999 0 1 0-4 0 1.999 1.999 0 1 0 4 0ZM4 1a1.999 1.999 0 1 0 4 0M6 11V7M4 9h4',
      ...thin,
    },
  ],
  venus: [
    { d: 'M6 11V7M4 9h4m1-5a3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3 3 3 0 0 1 3 3Z', ...thin },
  ],
  earth: [{ d: 'M11 6A5 5 0 1 0 1 6a5 5 0 0 0 10 0zm-5 5V1M1 6h10', strokeWidth: 0.6 }],
  moon: [
    { d: 'M8.5 1a5 5 0 1 0 0 10C6.715 9.969 5.613 8.062 5.613 6S6.715 2.031 8.5 1Zm0 0', ...thin },
  ],
  mars: [
    {
      d: 'M9 7c0-2.207-1.793-4-4-4S1 4.793 1 7s1.793 4 4 4 4-1.793 4-4ZM7.828 4.172 11 1M9.23 1H11v1.77',
      ...thin,
    },
  ],
  jupiter: [{ d: 'M2.25 1a4.33 4.33 0 0 1 0 7.5h7.5M7.25 6v5', ...thick }],
  saturn: [
    {
      d: 'M5 1v5.75a1.999 1.999 0 1 1 4 0c0 .531-.21 1.039-.586 1.414C7.508 9.07 7 9.719 7 11M3 3h4',
      ...thick,
    },
  ],
  uranus: [
    {
      d: 'M7.25 9.75A1.249 1.249 0 1 0 6 11a1.25 1.25 0 0 0 1.25-1.25ZM6 8.5V2.25M3.5 1v5m5-5v5m-5-2.5h5',
      ...thick,
    },
  ],
  neptune: [{ d: 'M6 11V1M3.5 7.25h5M2.25 1a3.751 3.751 0 0 0 7.5 0', ...thick }],
  pluto: [
    {
      d: 'M2.25 3a3.751 3.751 0 0 0 7.5 0M6 11V6.75M3.5 8.875h5M8 3a1.999 1.999 0 1 0-4 0 1.999 1.999 0 1 0 4 0zm0 0',
      ...thick,
    },
  ],
  ceres: [
    { d: 'M4.23 1.73A2.502 2.502 0 0 1 8.5 3.5C8.5 4.879 7.379 6 6 6v5M3.5 8.5h5', ...thick },
  ],
  haumea: [
    {
      d: 'M7.25 2.25A1.249 1.249 0 1 0 6 3.5a1.25 1.25 0 0 0 1.25-1.25Zm0 5A1.249 1.249 0 1 0 6 8.5a1.25 1.25 0 0 0 1.25-1.25ZM1 4.75h10m-7.5 0C3.5 8.203 2.379 11 1 11m7.5-6.25C8.5 8.203 9.621 11 11 11',
      ...thick,
    },
  ],
  makemake: [
    {
      d: 'M4.75 3.5a1.25 1.25 0 1 0-2.498-.002A1.25 1.25 0 0 0 4.75 3.5zm5 0a1.25 1.25 0 1 0-2.498-.002A1.25 1.25 0 0 0 9.75 3.5zM3.5 6A2.502 2.502 0 0 1 1 3.5C1 2.121 2.121 1 3.5 1h5C9.879 1 11 2.121 11 3.5S9.879 6 8.5 6M6 1v10',
      ...thick,
    },
  ],
  eris: [
    { d: 'M6 11V1M2.25 9.75a3.751 3.751 0 0 0 0-7.5m7.5 0a3.751 3.751 0 0 0 0 7.5', ...thick },
  ],
}

export const bodySymbolIds: ReadonlySet<string> = new Set(Object.keys(GLYPHS))
