/**
 * @module onboarding/Tutorial
 * @description Tutoriel par etapes : logo-titre fixe au-dessus d'une carte a position
 * fixe (centre de l'ecran), dont les pages defilent horizontalement (rail translate).
 * Le spotlight continue d'encadrer l'element `data-tutorial-target` de l'etape courante.
 */
import { Icon } from '@iconify/react'
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

      <div className={styles.panel}>
        <img
          className={styles.titleLogo}
          src="/solarsys-logo-title.png"
          alt="solarsys"
        />

        <div
          className={styles.card}
          role="dialog"
          aria-labelledby="tutorial-title"
        >
          <div className={styles.lang}>
            <LangSwitcher />
          </div>

          <div className={styles.viewport}>
            <div
              className={styles.track}
              data-testid="tutorial-track"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {steps.map((s, i) => (
                <div
                  key={s.titleKey}
                  className={styles.step}
                  aria-hidden={i !== index || undefined}
                >
                  <Icon
                    icon={s.icon}
                    className={styles.icon}
                  />
                  <h2
                    id={i === index ? 'tutorial-title' : undefined}
                    className={styles.title}
                  >
                    {t(s.titleKey)}
                  </h2>
                  <p className={styles.description}>{t(s.descriptionKey)}</p>
                </div>
              ))}
            </div>
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
    </div>
  )
}
