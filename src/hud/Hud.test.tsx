import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { Hud } from '@/hud/Hud'
import { seTriangleSize } from '@/hud/hudLayout'
import { i18n } from '@/i18n'
import { useCameraStore } from '@/store/camera'
import { useDebugStore } from '@/store/debug'
import { useInteractionStore } from '@/store/interaction'
import { useSimulationStore } from '@/store/simulation'
import { solarSystemFixture } from '@/test/fixtures/solarSystem'

const interaction = () => useInteractionStore.getState()

function resize(width: number, height: number) {
  Object.assign(window, { innerWidth: width, innerHeight: height })
  window.dispatchEvent(new Event('resize'))
}

describe('Hud', () => {
  beforeEach(async () => {
    interaction().reset()
    useSimulationStore.getState().reset()
    useCameraStore.getState().reset()
    useDebugStore.getState().reset()
    await i18n.changeLanguage('en')
    resize(1920, 1080)
  })

  it('renders the four corners, the zoom indicator and the frame lines', () => {
    render(<Hud system={solarSystemFixture} />)
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tactical view/i })).toBeInTheDocument()
    expect(screen.getByTestId('target-name')).toHaveTextContent('TARGET')
    expect(screen.getByTestId('zoom-indicator')).toBeInTheDocument()
    expect(screen.getByTestId('hud-frame').querySelectorAll('line')).toHaveLength(5)
  })

  it('opens the drawer from the menu corner and closes it from its close button', () => {
    render(<Hud system={solarSystemFixture} />)
    expect(screen.queryByRole('complementary', { name: /menu/i })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /menu/i }))
    const drawer = screen.getByRole('complementary', { name: /menu/i })
    expect(within(drawer).getByRole('button', { name: /options/i })).toBeInTheDocument()
    fireEvent.click(within(drawer).getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('complementary', { name: /menu/i })).not.toBeInTheDocument()
  })

  it('shows the hovered or selected body name in the SW corner, translated', async () => {
    render(<Hud system={solarSystemFixture} />)
    act(() => interaction().hover('mars'))
    expect(screen.getByTestId('target-name')).toHaveTextContent('MARS')
    act(() => interaction().select('sun'))
    expect(screen.getByTestId('target-name')).toHaveTextContent('THE SUN')
    await act(() => i18n.changeLanguage('fr'))
    expect(screen.getByTestId('target-name')).toHaveTextContent(/SOLEIL/)
  })

  it('toggles the tactical view from the SE corner', () => {
    render(<Hud system={solarSystemFixture} />)
    fireEvent.click(screen.getByRole('button', { name: /tactical view/i }))
    expect(interaction().isTactical).toBe(true)
    expect(screen.getByRole('button', { name: /tactical view/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('labels the tactical corner with an upright word stretched to the triangle width', () => {
    render(<Hud system={solarSystemFixture} />)
    const label = screen.getByText('TACTICAL')
    expect(label).toHaveAttribute('textLength', String(seTriangleSize))
    expect(label).toHaveAttribute('lengthAdjust', 'spacing')
  })

  it('sets the simulation speed from the time scale presets', () => {
    render(<Hud system={solarSystemFixture} />)
    const preset = screen.getByRole('button', { name: '1 s = 1 year' })
    fireEvent.click(preset)
    expect(useSimulationStore.getState().speed).toBe(365.25)
    expect(preset).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '1 s = 1 day' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('switches the language', async () => {
    render(<Hud system={solarSystemFixture} />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'FR' }))
    })
    expect(i18n.language).toBe('fr')
    expect(screen.getByRole('button', { name: 'FR' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows the focus UI only while following a selected body', () => {
    render(<Hud system={solarSystemFixture} />)
    expect(screen.queryByTestId('focus-ui')).not.toBeInTheDocument()
    act(() => interaction().select('mercury'))
    expect(screen.queryByTestId('focus-ui')).not.toBeInTheDocument()
    act(() => interaction().setFollowing(true))
    const focus = screen.getByTestId('focus-ui')
    expect(within(focus).getByTestId('body-symbol')).toHaveAttribute('data-symbol', 'mercury')
    expect(within(focus).getByText(/press space to exit/i)).toBeInTheDocument()
    fireEvent.click(within(focus).getByRole('button', { name: /want to know more/i }))
    expect(interaction().infoOpen).toBe(true)
  })
})
