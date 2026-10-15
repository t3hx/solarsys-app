/**
 * @module hud/BodySymbol
 * @description Glyphe astronomique du corps selectionne (voir `bodySymbols`).
 */
import { GLYPHS } from '@/hud/bodySymbols'

export function BodySymbol({ bodyId }: { bodyId: string }) {
  const glyphs = GLYPHS[bodyId]
  if (!glyphs) return null
  return (
    <div
      data-testid="body-symbol"
      data-symbol={bodyId}
      style={{
        pointerEvents: 'none',
        color: 'var(--color-hud)',
        width: 80,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        viewBox="0 0 12 12"
        style={{ width: '60%', height: '60%' }}
        aria-hidden="true"
      >
        {glyphs.map((glyph) => (
          <path
            key={glyph.d}
            d={glyph.d}
            transform={glyph.transform}
            fill={glyph.fill ? 'currentColor' : 'none'}
            stroke={glyph.fill ? 'none' : 'currentColor'}
            strokeWidth={glyph.strokeWidth}
            strokeLinecap={glyph.linecap}
            strokeLinejoin={glyph.linejoin}
          />
        ))}
      </svg>
    </div>
  )
}
