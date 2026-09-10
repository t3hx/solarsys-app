import { renderHook } from '@testing-library/react'
import type { ThreeEvent } from '@react-three/fiber'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { pointerConfig } from '@/config/scene'
import { useBodyPointerHandlers } from '@/scene/interaction/useBodyPointerHandlers'
import { useInteractionStore } from '@/store/interaction'

function clickEvent(delta: number): ThreeEvent<MouseEvent> {
  return { delta, stopPropagation: vi.fn() } as unknown as ThreeEvent<MouseEvent>
}

describe('useBodyPointerHandlers', () => {
  beforeEach(() => useInteractionStore.getState().reset())

  it('selects the body on a click and stops propagation', () => {
    const { result } = renderHook(() => useBodyPointerHandlers('mars'))
    const event = clickEvent(0)
    result.current.onClick(event)
    expect(useInteractionStore.getState().selectedId).toBe('mars')
    expect(event.stopPropagation).toHaveBeenCalled()
  })

  it('ignores a click that ends a drag (pointer moved beyond the click tolerance)', () => {
    const { result } = renderHook(() => useBodyPointerHandlers('mars'))
    const event = clickEvent(pointerConfig.clickMaxDistancePx + 1)
    result.current.onClick(event)
    expect(useInteractionStore.getState().selectedId).toBeNull()
    expect(event.stopPropagation).toHaveBeenCalled()
  })
})
