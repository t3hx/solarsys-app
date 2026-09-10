/**
 * @module scene/bodies/shaderInjections
 * @description Composition d'injections GLSL (`onBeforeCompile`) sur un materiau Three.
 * Three met les programmes en cache d'apres `customProgramCacheKey` : deux materiaux avec
 * des injections differentes doivent avoir des cles differentes, sinon ils partageraient
 * le programme du premier compile. La cle est la liste des noms d'injections.
 */
export interface ShaderInjection<S> {
  name: string
  apply: (shader: S) => S
}

export interface ShaderInjectionProps<S> {
  onBeforeCompile: (shader: S) => S
  customProgramCacheKey: () => string
}

export function composeShaderInjections<S>(
  injections: readonly ShaderInjection<S>[],
): ShaderInjectionProps<S> | Record<string, never> {
  if (injections.length === 0) return {}
  const key = injections.map((injection) => injection.name).join('+')
  return {
    onBeforeCompile: (shader) =>
      injections.reduce((current, injection) => injection.apply(current), shader),
    customProgramCacheKey: () => key,
  }
}
