import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { BrandMark } from '@/hud/BrandMark'
import { useAppStore } from '@/store/app'

function renderMark() {
  render(
    <BrandMark
      margin={16}
      seBox={{ x: 1700, y: 900, width: 130, height: 124 }}
    />,
  )
}

describe('BrandMark', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
  })

  it('stays hidden until the tutorial is done', () => {
    useAppStore.getState().finishPreloading({ tutorialSeen: false })
    renderMark()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows the logo once the scene phase starts', () => {
    useAppStore.getState().finishPreloading({ tutorialSeen: true })
    renderMark()
    const logo = screen.getByRole('img', { name: /solarsys/i })
    expect(logo).toHaveAttribute('src', '/solarsys-logo.png')
  })
})
