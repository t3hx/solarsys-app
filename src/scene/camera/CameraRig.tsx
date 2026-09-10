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
 *   sortie et reprise du suivi s'il etait actif ; si la sortie vient d'une selection (clic sur
 *   un corps depuis la vue tactique), c'est le focus qui prend la main, pas la restauration ;
 * - a chaque frame : niveau de zoom depuis la distance (relatif a la distance minimale de la
 *   cible), seuil de raycast des lignes d'orbite ;
 * - distance minimale : surface du corps suivi, ou du Soleil quand rien n'est selectionne ;
 *   relachee pendant les transitions (qui partent parfois de plus pres) et reappliquee a
 *   leur fin.
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
  frameOrder,
  lineRaycastThreshold,
  tacticalViewConfig,
} from '@/config/scene'
import type { CameraPlacement } from '@/scene/camera/cameraDirector'
import {
  focusPlacement,
  followMinDistance,
  homePlacement,
  tacticalPlacement,
} from '@/scene/camera/cameraDirector'
import { useRegistry } from '@/scene/registry'
import { isDebugApiEnabled } from '@/debug/exposeDebugApi'
import { useCameraStore } from '@/store/camera'
import { useInteractionStore } from '@/store/interaction'

interface SavedState extends CameraPlacement {
  wasFollowing: boolean
  selectedId: string | null
}

export function CameraRig() {
  const registry = useRegistry()
  const controlsRef = useRef<CameraControls>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const savedRef = useRef<SavedState | null>(null)
  const scratch = useRef(new Vector3())

  const selectedId = useInteractionStore((state) => state.selectedId)
  const isTactical = useInteractionStore((state) => state.isTactical)
  const isFollowing = useInteractionStore((state) => state.isFollowing)

  /** ~ Distance minimale de la cible courante : surface du corps selectionne, sinon du Soleil. */
  const targetMinDistance = useCallback(() => {
    const id = useInteractionStore.getState().selectedId ?? 'sun'
    const entry = registry.getBody(id)
    if (!entry) return controlsConfig.minDistance
    return followMinDistance(Math.max(entry.mesh.scale.x, entry.mesh.scale.y, entry.mesh.scale.z))
  }, [registry])

  // ~ Hors transition, la camera ne peut pas entrer dans le corps suivi ni dans le Soleil
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls || tweenRef.current) return
    controls.minDistance = targetMinDistance()
  }, [isFollowing, selectedId, targetMinDistance])

  // ~ API de debug (captures et mesures) : placer la camera a une distance donnee de la cible
  useEffect(() => {
    if (!isDebugApiEnabled() || !window.solarsys) return undefined
    window.solarsys.setDistance = (distance: number) => {
      void controlsRef.current?.dollyTo(distance, false)
    }
    window.solarsys.rotateCamera = (azimuth: number, polar: number) => {
      void controlsRef.current?.rotate(azimuth, polar, false)
    }
    return () => {
      delete window.solarsys?.setDistance
      delete window.solarsys?.rotateCamera
    }
  }, [])

  /** ~ Interpole de l'etat courant vers `getEnd()` (reevalue a chaque tick) en `duration` s. */
  const transitionTo = useCallback(
    (getEnd: () => CameraPlacement, duration: number, onComplete: () => void) => {
      const controls = controlsRef.current
      if (!controls) return
      tweenRef.current?.kill()
      // * La transition peut partir de plus pres que la distance minimale de la cible
      controls.minDistance = controlsConfig.minDistance

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
          controls.minDistance = targetMinDistance()
        },
      })
    },
    [targetMinDistance],
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
    const from = controlsRef.current?.getPosition(new Vector3(), false)
    transitionTo(
      () => focusPlacement(mesh.getWorldPosition(worldPosition), radius, cameraConfig.fov, from),
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
        selectedId: state.selectedId,
      }
      transitionTo(tacticalPlacement, tacticalViewConfig.transitionDuration, () => undefined)
      return
    }

    const saved = savedRef.current ?? {
      ...homePlacement(),
      wasFollowing: false,
      selectedId: null,
    }
    savedRef.current = null
    // * Sortie provoquee par la selection d'un autre corps : l'effet de focus est deja lance
    if (useInteractionStore.getState().selectedId !== saved.selectedId) return
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
    useCameraStore.getState().updateFromDistance(distance, targetMinDistance())
    state.raycaster.params.Line.threshold =
      lineRaycastThreshold.base + distance * lineRaycastThreshold.perUnitOfDistance
  }, frameOrder.cameraFollow)

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
