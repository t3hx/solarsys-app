/**
 * @module hud/controls/TimeScaleControl
 * @description Presets de vitesse de simulation en unites humaines : une heure, un jour ou
 * une annee simulee par seconde reelle.
 */
import { useTranslation } from 'react-i18next'
import styles from '@/hud/controls/controls.module.css'
import { timeScalePresets, useSimulationStore } from '@/store/simulation'

export function TimeScaleControl() {
  const { t } = useTranslation()
  const speed = useSimulationStore((state) => state.speed)
  const setSpeed = useSimulationStore((state) => state.setSpeed)
  return (
    <div
      className={styles.group}
      role="group"
    >
      {timeScalePresets.map((preset) => (
        <button
          key={preset.id}
          type="button"
          className={styles.button}
          aria-pressed={speed === preset.daysPerSecond}
          onClick={() => setSpeed(preset.daysPerSecond)}
        >
          {t(`hud.timeScale.${preset.id}`)}
        </button>
      ))}
    </div>
  )
}
