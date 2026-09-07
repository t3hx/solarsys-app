/**
 * @module onboarding/useTutorial
 * @description Etapes du tutoriel (cles i18n, icone, cible de spotlight) et navigation,
 * avec persistance de la completion dans localStorage.
 */
import { useCallback, useMemo, useState } from 'react'

export interface TutorialStep {
  titleKey: string
  descriptionKey: string
  icon: string
  /** Valeur de `data-tutorial-target` de l'element a mettre en lumiere */
  target?: string
}

export const TUTORIAL_STORAGE_KEY = 'solarsys_tutorial_seen'

const step = (name: string, icon: string, target?: string): TutorialStep => ({
  titleKey: `tutorial.steps.${name}.title`,
  descriptionKey: `tutorial.steps.${name}.description`,
  icon,
  ...(target ? { target } : {}),
})

export const tutorialSteps: readonly TutorialStep[] = [
  step('welcome', 'solar:planet-bold-duotone'),
  step('camera', 'solar:mouse-bold-duotone'),
  step('select', 'solar:cursor-bold-duotone'),
  step('menu', 'solar:settings-bold-duotone', 'menu'),
  step('zoom', 'solar:magnifer-zoom-in-bold-duotone', 'zoom'),
  step('time', 'solar:clock-circle-bold-duotone', 'time'),
  step('lang', 'solar:global-bold-duotone', 'lang'),
  step('tactical', 'solar:black-hole-bold-duotone', 'tactical'),
  step('ready', 'solar:rocket-2-bold-duotone'),
]

export function hasSeenTutorial(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function markTutorialSeen(): void {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, '1')
  } catch {
    // * Stockage indisponible (navigation privee stricte) : le tutoriel reviendra
  }
}

export function useTutorial() {
  const [index, setIndex] = useState(0)
  const last = tutorialSteps.length - 1

  const goTo = useCallback(
    (target: number) => setIndex(Math.max(0, Math.min(last, target))),
    [last],
  )
  const next = useCallback(() => setIndex((i) => Math.min(last, i + 1)), [last])
  const previous = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])
  const dismiss = useCallback(() => markTutorialSeen(), [])

  return useMemo(
    () => ({
      index,
      step: tutorialSteps[index]!,
      steps: tutorialSteps,
      isFirst: index === 0,
      isLast: index === last,
      goTo,
      next,
      previous,
      dismiss,
    }),
    [index, last, goTo, next, previous, dismiss],
  )
}
