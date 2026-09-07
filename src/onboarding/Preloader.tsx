/**
 * @module onboarding/Preloader
 * @description Ecran de chargement : progression des textures (gestionnaire de chargement
 * Three via drei `useProgress`), puis attente de la scene, puis fondu de sortie.
 */
import { useProgress } from '@react-three/drei'
import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styles from '@/onboarding/Preloader.module.css'
import { useAppStore } from '@/store/app'

const FADE_OUT_SECONDS = 0.8

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation()
  const { progress, loaded, total, active } = useProgress()
  const sceneReady = useAppStore((state) => state.sceneReady)
  const containerRef = useRef<HTMLDivElement>(null)
  const completedRef = useRef(false)

  const texturesLoaded = !active && total > 0 && loaded >= total
  const ready = texturesLoaded && sceneReady
  const percent = Math.round(progress)

  useEffect(() => {
    if (!ready || completedRef.current) return undefined
    completedRef.current = true
    const tween = gsap.to(containerRef.current, {
      opacity: 0,
      duration: FADE_OUT_SECONDS,
      ease: 'power2.inOut',
      onComplete,
    })
    return () => {
      tween.kill()
    }
  }, [ready, onComplete])

  const status = ready
    ? t('preloader.ready')
    : texturesLoaded
      ? t('preloader.initializing')
      : t('preloader.loading')

  return (
    <div
      ref={containerRef}
      className={styles.screen}
    >
      <div className={styles.content}>
        <p className={styles.title}>SOLARSYS</p>
        <div
          className={styles.progress}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={t('preloader.loading')}
        >
          <div className={styles.track}>
            <div
              className={styles.fill}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className={styles.info}>
            <span className={styles.percent}>{percent}%</span>
            <span className={styles.count}>
              {loaded} / {total} {t('preloader.textures')}
            </span>
          </div>
        </div>
        <p className={`${styles.status} ${texturesLoaded && !sceneReady ? styles.pulse : ''}`}>
          {status}
        </p>
      </div>
    </div>
  )
}
