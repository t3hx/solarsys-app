import { Texture } from 'three'

/**
 * ~ Remplacant de `useTexture` (drei) pour jsdom : une texture vide par URL, avec la meme
 * forme de retour que l'original (texture, tableau ou objet) et un `preload` inerte.
 */
function fake<T extends string | string[] | Record<string, string>>(
  input: T,
): T extends string ? Texture : T extends string[] ? Texture[] : Record<string, Texture> {
  if (typeof input === 'string') return new Texture() as never
  if (Array.isArray(input)) return input.map(() => new Texture()) as never
  return Object.fromEntries(Object.keys(input).map((key) => [key, new Texture()])) as never
}

export const fakeUseTexture = Object.assign(fake, {
  preload: () => undefined,
  clear: () => undefined,
})
