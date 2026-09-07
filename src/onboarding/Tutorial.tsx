/**
 * @module onboarding/Tutorial
 * @description Tutoriel par etapes avec spotlight sur l'element `data-tutorial-target` de
 * l'etape courante (le HUD est visible dessous) et carte auto-positionnee a l'oppose.
 */
import { Icon } from '@iconify/react'
import type { CSSProperties } from 'react'
import { useMemo, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { LangSwitcher } from '@/hud/controls/LangSwitcher'
import styles from '@/onboarding/Tutorial.module.css'
import { useTutorial } from '@/onboarding/useTutorial'

const SPOTLIGHT_PADDING = 10

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

function measureTarget(target: string | undefined): Rect | null {
  if (!target || typeof document === 'undefined') return null
  const element = document.querySelector(`[data-tutorial-target="${target}"]`)
  if (!element) return null
  const rect = element.getBoundingClientRect()
  return {
    top: rect.top - SPOTLIGHT_PADDING,
    left: rect.left - SPOTLIGHT_PADDING,
    width: rect.width + SPOTLIGHT_PADDING * 2,
    height: rect.height + SPOTLIGHT_PADDING * 2,
  }
}

function subscribeToResize(onChange: () => void) {
  window.addEventListener('resize', onChange)
  return () => window.removeEventListener('resize', onChange)
}

/** ~ Place la carte du cote oppose au spotlight pour ne pas le masquer. */
function cardPlacement(rect: Rect | null): CSSProperties {
  if (!rect) return {}
  const centerY = rect.top + rect.height / 2
  const centerX = rect.left + rect.width / 2
  const style: CSSProperties = {}
  if (centerY < window.innerHeight * 0.4) {
    style.alignSelf = 'flex-end'
    style.marginBottom = '8%'
  } else if (centerY > window.innerHeight * 0.6) {
    style.alignSelf = 'flex-start'
    style.marginTop = '8%'
  }
  if (centerX < window.innerWidth * 0.3) style.marginLeft = '25%'
  else if (centerX > window.innerWidth * 0.7) style.marginRight = '25%'
  return style
}

export function Tutorial({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation()
  const tutorial = useTutorial()
  const { step, steps, index } = tutorial

  // * Mesure de la cible, rafraichie au redimensionnement (snapshot serialise, compare par valeur)
  const snapshot = useSyncExternalStore(
    subscribeToResize,
    () => JSON.stringify(measureTarget(step.target)),
    () => 'null',
  )
  const spotlight = useMemo(() => JSON.parse(snapshot) as Rect | null, [snapshot])

  const finish = () => {
    tutorial.dismiss()
    onComplete()
  }

  return (
    <div className={`${styles.overlay} ${spotlight ? styles.hasSpotlight : ''}`}>
      {spotlight && (
        <div
          key={step.target}
          className={styles.spotlight}
          data-testid="spotlight"
          style={spotlight}
        />
      )}

      <div
        className={styles.card}
        style={cardPlacement(spotlight)}
        role="dialog"
        aria-labelledby="tutorial-title"
      >
        <div className={styles.lang}>
          <LangSwitcher />
        </div>

        <div
          key={index}
          className={styles.step}
        >
          <Icon
            icon={step.icon}
            className={styles.icon}
          />
          <h2
            id="tutorial-title"
            className={styles.title}
          >
            {t(step.titleKey)}
          </h2>
          <p className={styles.description}>{t(step.descriptionKey)}</p>
        </div>

        <div className={styles.dots}>
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${i < index ? styles.completed : ''}`}
              aria-label={`Go to step ${i + 1}`}
              aria-current={i === index ? 'step' : undefined}
              onClick={() => tutorial.goTo(i)}
            />
          ))}
        </div>

        <div className={styles.nav}>
          <button
            type="button"
            className={`${styles.button} ${styles.skip}`}
            onClick={finish}
          >
            {t('tutorial.skip')}
          </button>
          <div className={styles.navRight}>
            {!tutorial.isFirst && (
              <button
                type="button"
                className={`${styles.button} ${styles.secondary}`}
                onClick={tutorial.previous}
              >
                {t('tutorial.previous')}
              </button>
            )}
            <button
              type="button"
              className={`${styles.button} ${styles.primary}`}
              onClick={tutorial.isLast ? finish : tutorial.next}
            >
              {tutorial.isLast ? t('tutorial.finish') : t('tutorial.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
