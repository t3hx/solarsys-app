/**
 * @module windows/useAnimatedBorder
 * @description Contour lumineux dessine progressivement a l'ouverture d'une fenetre : les
 * huit segments (`borderPaths`) sont mesures, puis les coins et les bords sont reveles par
 * dash-offset avec GSAP. Partage par les fenetres d'information et « a propos » (audit A6).
 */
import { gsap } from 'gsap'
import type { RefObject } from 'react'
import { useEffect, useState } from 'react'
import { borderPaths } from '@/windows/borderPaths'

/** Delai avant le trace, le temps que l'ouverture (clip-path) soit bien engagee */
const START_DELAY_MS = 350

export function useAnimatedBorder(
  windowRef: RefObject<HTMLElement | null>,
  svgRef: RefObject<SVGSVGElement | null>,
  open: boolean,
): string[] {
  const [paths, setPaths] = useState<string[]>([])

  // * 1. Mesure de la fenetre une fois l'ouverture engagee, puis rendu des huit segments
  useEffect(() => {
    if (!open) return undefined
    const timeout = window.setTimeout(() => {
      const element = windowRef.current
      if (!element) return
      const { width, height } = element.getBoundingClientRect()
      const radius = Number.parseFloat(getComputedStyle(element).borderRadius)
      setPaths(borderPaths(width, height, radius))
    }, START_DELAY_MS)
    return () => {
      window.clearTimeout(timeout)
      setPaths([])
    }
  }, [open, windowRef])

  // * 2. Une fois les <path> commits, trace progressif (coins puis bords)
  useEffect(() => {
    if (paths.length !== 8) return undefined
    const segments = Array.from(svgRef.current?.querySelectorAll('path') ?? [])
    if (segments.length !== 8 || typeof segments[0]!.getTotalLength !== 'function') return undefined
    gsap.set(segments, {
      strokeDasharray: (_i: number, el: SVGPathElement) => el.getTotalLength() || 0,
      strokeDashoffset: (_i: number, el: SVGPathElement) => el.getTotalLength() || 0,
      opacity: 1,
    })
    const corners = [1, 3, 5, 7].map((i) => segments[i]!)
    const edges = [0, 2, 4, 6].map((i) => segments[i]!)
    const timeline = gsap
      .timeline()
      .to(corners, { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out', stagger: 0.07 })
      .to(edges, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out', stagger: 0.07 }, '-=0.2')
    return () => {
      timeline.kill()
    }
  }, [paths, svgRef])

  return paths
}
