/**
 * @module hud/controls/TimeScaleControl
 * @description Presets de vitesse de simulation (x0.01, x0.1, x1, x10).
 */
import styles from '@/hud/controls/controls.module.css'
import { timeScalePresets, useSimulationStore } from '@/store/simulation'

export function TimeScaleControl() {
  const speed = useSimulationStore((state) => state.speed)
  const setSpeed = useSimulationStore((state) => state.setSpeed)
  return (
    <div
      className={styles.group}
      role="group"
    >
      {timeScalePresets.map((preset) => (
        <button
          key={preset}
          type="button"
          className={styles.button}
          aria-pressed={speed === preset}
          onClick={() => setSpeed(preset)}
        >
          x{preset}
        </button>
      ))}
    </div>
  )
}
