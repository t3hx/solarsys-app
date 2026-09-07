/**
 * @module hud/zoom/ZoomIndicator
 * @description Indicateur de zoom : dix barres (niveau 0-10), MAX clignotant au plus pres,
 * OUT OF RANGE en rouge au-dela du dernier seuil, VOID en violet pres de la distance maximale.
 */
import { useTranslation } from 'react-i18next'
import { colors } from '@/config/colors'
import type { Box } from '@/hud/hudLayout'
import { cornerSizes } from '@/hud/hudLayout'
import styles from '@/hud/zoom/ZoomIndicator.module.css'
import type { ZoomMode } from '@/hud/zoom/zoomState'

const BARS = [
  'M0 0H13.1103L40.2351 33H27.1248L0 0Z',
  'M26.2205 0H39.3308L66.4556 33H53.3453L26.2205 0Z',
  'M52.4412 0H65.5515L92.6763 33H79.566L52.4412 0Z',
  'M78.6618 0H91.7721L118.897 33H105.787L78.6618 0Z',
  'M104.883 0H117.993L145.118 33H132.007L104.883 0Z',
  'M131.103 0H144.213L171.338 33H158.228L131.103 0Z',
  'M157.324 0H170.434L197.559 33H184.448L157.324 0Z',
  'M183.544 0H196.655L223.779 33H210.669L183.544 0Z',
  'M209.7645 0H222.8748L249.9996 33H236.8893L209.7645 0Z',
  'M252.5 21.6857L235 1.56164e-05H269.9L252.5 21.6857Z',
]

const LABEL_HEIGHT = 14

export interface ZoomIndicatorProps {
  level: number
  mode: ZoomMode
  box?: Box
}

export function ZoomIndicator({ level, mode, box }: ZoomIndicatorProps) {
  const { t } = useTranslation()
  const { width, height } = cornerSizes.zoom
  const strokeColor =
    mode === 'void' ? colors.purple : mode === 'outOfRange' ? colors.red : colors.springGreen
  const visibleBars = Math.round(level)

  return (
    <svg
      className={styles.indicator}
      style={
        box
          ? {
              left: box.x,
              top: box.y,
              width: box.width,
              height: box.height + LABEL_HEIGHT * (box.height / height),
            }
          : undefined
      }
      viewBox={`0 0 ${width} ${height + LABEL_HEIGHT}`}
      data-testid="zoom-indicator"
      data-tutorial-target="zoom"
      aria-label={`${t('hud.zoomLevel')} ${level}`}
    >
      <path
        d="M1 0L31 41H261L291 0"
        stroke={strokeColor}
        fill="none"
        strokeLinecap="round"
      />
      <text
        x={33}
        y={50}
        fill={strokeColor}
        fontSize={6}
        fontWeight="bold"
        letterSpacing="0.3em"
      >
        {t('hud.zoomLevel')}
      </text>

      {mode === 'void' && (
        <text
          x={146}
          y={25}
          fill={colors.purple}
          fontSize={25}
          fontWeight="bold"
          letterSpacing="0.3em"
          textAnchor="middle"
        >
          {t('hud.void')}
        </text>
      )}

      {mode === 'outOfRange' && (
        <text
          className={styles.slowBlink}
          x={146}
          y={25}
          fill={colors.red}
          fontSize={20}
          fontWeight="bold"
          letterSpacing="0.3em"
          textAnchor="middle"
        >
          {t('hud.outOfRange')}
        </text>
      )}

      {(mode === 'normal' || mode === 'max') && (
        <g transform="translate(11, 2.5)">
          {BARS.map((d, index) => (
            <path
              key={d}
              d={d}
              fill={colors.springGreen}
              visibility={index < visibleBars ? 'visible' : 'hidden'}
              data-testid="zoom-bar"
            />
          ))}
          {mode === 'max' && (
            <text
              className={styles.blink}
              x={252.5}
              y={10}
              fill={colors.black}
              fontSize={8}
              fontWeight="bold"
              textAnchor="middle"
            >
              {t('hud.max')}
            </text>
          )}
        </g>
      )}
    </svg>
  )
}
