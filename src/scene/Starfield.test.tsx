import ReactThreeTestRenderer from '@react-three/test-renderer'
import type { Points } from 'three'
import { describe, expect, it } from 'vitest'
import { Starfield } from '@/scene/Starfield'

describe('Starfield', () => {
  it('renders one point per star between the configured distances', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Starfield
        count={200}
        size={5}
        minDistance={100}
        maxDistance={200}
      />,
    )
    const points = renderer.scene.findByType('Points').instance as Points
    expect(points.name).toBe('starfield')
    const positions = points.geometry.getAttribute('position')
    expect(positions.count).toBe(200)
    for (let i = 0; i < positions.count; i++) {
      const r = Math.hypot(positions.getX(i), positions.getY(i), positions.getZ(i))
      expect(r).toBeGreaterThanOrEqual(100 - 1e-3)
      expect(r).toBeLessThanOrEqual(200 + 1e-3)
    }
    await renderer.unmount()
  })
})
