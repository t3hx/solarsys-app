import { describe, expect, it, vi } from 'vitest'
import rawData from '../../public/data/solar_system_data.json'
import { loadSolarSystem } from '@/data/loadSolarSystem'

function fakeFetch(body: unknown, ok = true, status = 200) {
  return vi.fn(async () => ({
    ok,
    status,
    statusText: ok ? 'OK' : 'Not Found',
    json: async () => body,
  })) as unknown as typeof fetch
}

describe('loadSolarSystem', () => {
  it('fetches the default URL and returns a normalized system', async () => {
    const fetchImpl = fakeFetch(rawData)
    const system = await loadSolarSystem({ fetchImpl })
    expect(fetchImpl).toHaveBeenCalledWith('/data/solar_system_data.json')
    expect(system.planets).toHaveLength(13)
  })

  it('rejects when the HTTP response is not ok', async () => {
    await expect(loadSolarSystem({ fetchImpl: fakeFetch({}, false, 404) })).rejects.toThrow(/404/)
  })

  it('rejects when the JSON does not match the schema', async () => {
    await expect(loadSolarSystem({ fetchImpl: fakeFetch({ sun: {} }) })).rejects.toThrow()
  })
})
