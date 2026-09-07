/**
 * @module scene/orbits/OrbitLine
 * @description Trajectoire visuelle d'une orbite. Construite en `THREE.Line` et inseree
 * via `<primitive>` (le JSX `<line>` entre en conflit avec l'element SVG du meme nom).
 * `userData.type = 'orbit-line'` sert au raycasting (phase 4), plus de detection par nom.
 */
import { useEffect, useMemo } from 'react'
import { BufferGeometry, Float32BufferAttribute, Line, LineBasicMaterial } from 'three'
import { colors } from '@/config/colors'
import { orbitLineDefaults } from '@/config/rendering'
import { ellipsePoints } from '@/scene/orbits/orbitGeometry'

export interface OrbitLineProps {
  bodyId: string
  name: string
  semiMajorAxis: number
  eccentricity: number
  argOfPerihelion: number
}

export function OrbitLine({
  bodyId,
  name,
  semiMajorAxis,
  eccentricity,
  argOfPerihelion,
}: OrbitLineProps) {
  const line = useMemo(() => {
    const geometry = new BufferGeometry()
    geometry.setAttribute(
      'position',
      new Float32BufferAttribute(
        ellipsePoints(semiMajorAxis, eccentricity, argOfPerihelion, orbitLineDefaults.resolution),
        3,
      ),
    )
    const material = new LineBasicMaterial({
      color: colors.white,
      transparent: true,
      opacity: orbitLineDefaults.opacity,
    })
    const object = new Line(geometry, material)
    object.name = name
    object.userData = { id: `${bodyId}_orbit`, bodyId, type: 'orbit-line' }
    return object
  }, [bodyId, name, semiMajorAxis, eccentricity, argOfPerihelion])

  useEffect(
    () => () => {
      line.geometry.dispose()
      ;(line.material as LineBasicMaterial).dispose()
    },
    [line],
  )

  return <primitive object={line} />
}
