/**
 * @module hud/drawer/DebugCheckbox
 * @description Case a cocher stylisee (bouton `role="checkbox"`) pour les aides de debug.
 */
import styles from '@/hud/drawer/DrawerMenu.module.css'

export function DebugCheckbox({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className={styles.checkbox}
      onClick={onToggle}
    >
      <span>{label}</span>
      <span
        className={styles.checkboxBox}
        aria-hidden="true"
      >
        {checked && <span className={styles.checkboxMark} />}
      </span>
    </button>
  )
}
