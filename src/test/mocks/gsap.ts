/**
 * ~ GSAP synchrone pour jsdom : les tweens et timelines sautent a leur fin immediatement,
 * `set` applique les valeurs, `onComplete` est appele tout de suite.
 */
type Vars = Record<string, unknown> & {
  onUpdate?: () => void
  onComplete?: () => void
  progress?: number
}

function complete(target: unknown, vars: Vars) {
  if (target && typeof target === 'object' && 'progress' in vars) {
    ;(target as { progress: number }).progress = 1
  }
  vars.onUpdate?.()
  vars.onComplete?.()
}

function timeline(options: Vars = {}) {
  const api = {
    to: (target: unknown, vars: Vars) => {
      complete(target, vars)
      return api
    },
    fromTo: (target: unknown, _from: Vars, vars: Vars) => {
      complete(target, vars)
      return api
    },
    set: () => api,
    kill: () => undefined,
    progress: () => 1,
  }
  options.onComplete?.()
  return api
}

export const gsapMock = {
  gsap: {
    to: (target: unknown, vars: Vars) => {
      complete(target, vars)
      return { kill: () => undefined }
    },
    set: () => undefined,
    timeline,
    killTweensOf: () => undefined,
    ticker: { lagSmoothing: () => undefined },
  },
}
