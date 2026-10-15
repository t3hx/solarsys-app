/**
 * @module hud/useWindowSize
 * @description Dimensions de la fenetre et device pixel ratio, mis a jour au redimensionnement.
 */
import { useEffect, useState } from 'react'

export interface WindowSize {
  width: number
  height: number
  devicePixelRatio: number
}

function read(): WindowSize {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
  }
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>(read)
  useEffect(() => {
    const update = () => setSize(read())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}
