import { Texture } from 'three'

/**
 * ~ Remplacant de `useTexture` (drei) pour jsdom : une texture vide par URL, avec la meme
 * forme de retour que l'original (texture, tableau ou objet) et un `preload` inerte.
 */
function fake<T extends string | string[] | Record<string, string>>(
  input: T,
): T extends string ? Texture : T extends string[] ? Texture[] : Record<string, Texture> {
  const make = (url: string) => Object.assign(new Texture(), { userData: { url } })
  if (typeof input === 'string') return make(input) as never
  if (Array.isArray(input)) return input.map(make) as never
  return Object.fromEntries(Object.entries(input).map(([key, url]) => [key, make(url)])) as never
}

export const fakeUseTexture = Object.assign(fake, {
  preload: () => undefined,
  clear: () => undefined,
})
