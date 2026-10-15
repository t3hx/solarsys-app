/**
 * @module scene/orbits/OrbitLine
 * @description Trajectoire visuelle d'une orbite. Construite en `THREE.Line` et inseree
 * via `<primitive>` (le JSX `<line>` entre en conflit avec l'element SVG du meme nom).
 * `userData.type = 'orbit-line'` sert au raycasting (phase 4), plus de detection par nom.
 */
import { useEffect, useMemo, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { BufferGeometry, Float32BufferAttribute, Line, LineBasicMaterial } from 'three'
import { colors } from '@/config/colors'
import { orbitLineDefaults } from '@/config/rendering'
import { outlineTarget } from '@/scene/effects/outlineTarget'
import { useBodyPointerHandlers } from '@/scene/interaction/useBodyPointerHandlers'
import { orbitAppearance } from '@/scene/orbits/orbitAppearance'
import { ellipsePoints } from '@/scene/orbits/orbitGeometry'
import { useInteractionStore } from '@/store/interaction'

export interface OrbitLineProps {
  bodyId: string
  name: string
  semiMajorAxis: number
  eccentricity: number
  argOfPerihelion: number
  /** Nombre de segments (voir `orbitLineResolution`) */
  resolution: number
}

export function OrbitLine({
  bodyId,
  name,
  semiMajorAxis,
  eccentricity,
  argOfPerihelion,
  resolution,
}: OrbitLineProps) {
  const line = useMemo(() => {
    const geometry = new BufferGeometry()
    geometry.setAttribute(
      'position',
      new Float32BufferAttribute(
        ellipsePoints(semiMajorAxis, eccentricity, argOfPerihelion, resolution),
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
  }, [bodyId, name, semiMajorAxis, eccentricity, argOfPerihelion, resolution])

  useEffect(
    () => () => {
      line.geometry.dispose()
      ;(line.material as LineBasicMaterial).dispose()
    },
    [line],
  )

  // ~ Surbrillance survol/selection prioritaire, couleur du corps en vue tactique
  const appearance = useInteractionStore(
    useShallow((state) => {
      const target = outlineTarget(state)
      return orbitAppearance(bodyId, target?.id === bodyId ? target.kind : null, state.isTactical)
    }),
  )
  const lineRef = useRef<Line>(null)
  useEffect(() => {
    const material = lineRef.current?.material as LineBasicMaterial | undefined
    if (!material) return
    material.color.set(appearance.color)
    material.opacity = appearance.opacity
  }, [appearance])

  const pointerHandlers = useBodyPointerHandlers(bodyId)

  return (
    <primitive
      ref={lineRef}
      object={line}
      {...pointerHandlers}
    />
  )
}
