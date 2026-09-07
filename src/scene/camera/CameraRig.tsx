/**
 * @module scene/camera/CameraRig
 * @description Pilotage de la camera sur drei `CameraControls` :
 * - entrees utilisateur (orbite, zoom, pan) et suivi : CameraControls ;
 * - transitions scriptees (focus, vue tactique, reset) : tween GSAP `power3.inOut` de duree
 *   fixe qui interpole position et cible et les applique via `setLookAt(..., false)`.
 *   Un `rest` de camera-controls arriverait plusieurs secondes apres la fin visuelle
 *   (amortissement exponentiel) ; GSAP donne une fin deterministe, comme la version Vue.
 * - focus : placement calcule par `cameraDirector`, cible recalculee a chaque tick (le corps
 *   bouge pendant l'animation), puis suivi par `moveTo` sur la position monde a chaque frame ;
 * - vue tactique : sauvegarde de l'etat courant, montee au-dessus du systeme, restauration a la
 *   sortie et reprise du suivi s'il etait actif ;
 * - a chaque frame : niveau de zoom depuis la distance, seuil de raycast des lignes d'orbite.
 *
 * Le focus ne modifie plus la vitesse de simulation (audit B5).
 */
import { CameraControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import { useCallback, useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import {
  cameraConfig,
  cameraFocusConfig,
  controlsConfig,
  lineRaycastThreshold,
  tacticalViewConfig,
} from '@/config/scene'
import type { CameraPlacement } from '@/scene/camera/cameraDirector'
import { focusPlacement, homePlacement, tacticalPlacement } from '@/scene/camera/cameraDirector'
import { useRegistry } from '@/scene/registry'
import { useCameraStore } from '@/store/camera'
import { useInteractionStore } from '@/store/interaction'

interface SavedState extends CameraPlacement {
  wasFollowing: boolean
}

export function CameraRig() {
  const registry = useRegistry()
  const controlsRef = useRef<CameraControls>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const savedRef = useRef<SavedState | null>(null)
  const scratch = useRef(new Vector3())

  const selectedId = useInteractionStore((state) => state.selectedId)
  const isTactical = useInteractionStore((state) => state.isTactical)

  /** ~ Interpole de l'etat courant vers `getEnd()` (reevalue a chaque tick) en `duration` s. */
  const transitionTo = useCallback(
    (getEnd: () => CameraPlacement, duration: number, onComplete: () => void) => {
      const controls = controlsRef.current
      if (!controls) return
      tweenRef.current?.kill()

      const startPosition = controls.getPosition(new Vector3(), false)
      const startTarget = controls.getTarget(new Vector3(), false)
      const position = new Vector3()
      const target = new Vector3()
      const proxy = { progress: 0 }

      tweenRef.current = gsap.to(proxy, {
        progress: 1,
        duration,
        ease: 'power3.inOut',
        onUpdate: () => {
          const end = getEnd()
          position.copy(startPosition).lerp(end.position, proxy.progress)
          target.copy(startTarget).lerp(end.target, proxy.progress)
          void controls.setLookAt(
            position.x,
            position.y,
            position.z,
            target.x,
            target.y,
            target.z,
            false,
          )
        },
        onComplete: () => {
          tweenRef.current = null
          onComplete()
        },
      })
    },
    [],
  )

  useEffect(
    () => () => {
      tweenRef.current?.kill()
    },
    [],
  )

  // ~ Focus / reset sur changement de selection (jamais au montage)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (selectedId === null) {
      transitionTo(homePlacement, cameraFocusConfig.resetDuration, () => undefined)
      return
    }
    const entry = registry.getBody(selectedId)
    if (!entry) return
    const { mesh } = entry
    mesh.geometry.computeBoundingSphere()
    const radius =
      (mesh.geometry.boundingSphere?.radius ?? 1) *
      Math.max(mesh.scale.x, mesh.scale.y, mesh.scale.z)
    const worldPosition = new Vector3()
    transitionTo(
      () => focusPlacement(mesh.getWorldPosition(worldPosition), radius, cameraConfig.fov),
      cameraFocusConfig.focusDuration,
      () => useInteractionStore.getState().setFollowing(true),
    )
  }, [selectedId, registry, transitionTo])

  // ~ Entree / sortie de la vue tactique
  const wasTactical = useRef(false)
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls || wasTactical.current === isTactical) return
    wasTactical.current = isTactical

    if (isTactical) {
      const state = useInteractionStore.getState()
      savedRef.current = {
        position: controls.getPosition(new Vector3(), true),
        target: controls.getTarget(new Vector3(), true),
        wasFollowing: state.selectedId !== null,
      }
      transitionTo(tacticalPlacement, tacticalViewConfig.transitionDuration, () => undefined)
      return
    }

    const saved = savedRef.current ?? { ...homePlacement(), wasFollowing: false }
    savedRef.current = null
    transitionTo(
      () => saved,
      tacticalViewConfig.transitionDuration,
      () => {
        if (saved.wasFollowing) useInteractionStore.getState().setFollowing(true)
      },
    )
  }, [isTactical, transitionTo])

  useFrame((state) => {
    const controls = controlsRef.current
    if (!controls) return

    const { isFollowing, selectedId: followedId } = useInteractionStore.getState()
    if (isFollowing && followedId !== null) {
      const entry = registry.getBody(followedId)
      if (entry) {
        const position = entry.mesh.getWorldPosition(scratch.current)
        void controls.moveTo(position.x, position.y, position.z, false)
      }
    }

    const distance = controls.distance
    useCameraStore.getState().updateFromDistance(distance)
    state.raycaster.params.Line.threshold =
      lineRaycastThreshold.base + distance * lineRaycastThreshold.perUnitOfDistance
  })

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={controlsConfig.minDistance}
      maxDistance={controlsConfig.maxDistance}
      maxPolarAngle={controlsConfig.maxPolarAngle}
      smoothTime={controlsConfig.smoothTime}
    />
  )
}
