import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CornerNW } from '@/hud/corners/CornerNW'

const box = { x: 0, y: 0, width: 80, height: 290 }

describe('CornerNW', () => {
  // * Regression : les lettres avaient des x ajustes a la main (40/40/41/39), visibles
  // * comme un desalignement une fois le HUD mis a l'echelle. Avec text-anchor: middle,
  // * toutes les lettres se centrent sur l'axe vertical du bandeau (x = 40).
  it('centers every MENU letter on the same vertical axis', () => {
    const { container } = render(
      <CornerNW
        box={box}
        onClick={() => {}}
      />,
    )
    const letters = Array.from(container.querySelectorAll('tspan'))
    expect(letters.map((el) => el.textContent).join('')).toBe('MENU')
    const xs = new Set(letters.map((el) => el.getAttribute('x')))
    expect(xs).toEqual(new Set(['40']))
  })
})
