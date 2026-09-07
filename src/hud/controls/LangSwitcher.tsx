/**
 * @module hud/controls/LangSwitcher
 * @description Bascule EN / FR (react-i18next, choix persiste).
 */
import { useTranslation } from 'react-i18next'
import styles from '@/hud/controls/controls.module.css'
import { supportedLocales } from '@/i18n'

export function LangSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language.slice(0, 2)
  return (
    <div
      className={styles.group}
      role="group"
    >
      {supportedLocales.map((locale) => (
        <button
          key={locale}
          type="button"
          className={styles.button}
          aria-pressed={current === locale}
          onClick={() => void i18n.changeLanguage(locale)}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
