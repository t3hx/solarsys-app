import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DrawerMenu } from '@/hud/drawer/DrawerMenu'
import { useDebugStore } from '@/store/debug'
import { useInteractionStore } from '@/store/interaction'
import { solarSystemFixture } from '@/test/fixtures/solarSystem'

const debug = () => useDebugStore.getState()

function renderDrawer(onClose = vi.fn()) {
  render(
    <DrawerMenu
      system={solarSystemFixture}
      box={{ x: 90, y: 32, width: 500, height: 918 }}
      open
      onClose={onClose}
    />,
  )
  return onClose
}

describe('DrawerMenu', () => {
  beforeEach(() => {
    debug().reset()
    useInteractionStore.getState().reset()
  })

  it('opens on the home view with the product title, Options and About', () => {
    renderDrawer()
    const drawer = screen.getByRole('complementary', { name: /menu/i })
    expect(within(drawer).getAllByText(/solarsys/i).length).toBeGreaterThan(0)
    expect(within(drawer).getByRole('button', { name: /options/i })).toBeInTheDocument()
    expect(within(drawer).getByRole('button', { name: /about/i })).toBeInTheDocument()
  })

  it('closes from the close button', () => {
    const onClose = renderDrawer()
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('opens the about window and closes the drawer', () => {
    const onClose = renderDrawer()
    fireEvent.click(screen.getByRole('button', { name: /about/i }))
    expect(useInteractionStore.getState().aboutOpen).toBe(true)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('navigates to the options view and back', () => {
    renderDrawer()
    fireEvent.click(screen.getByRole('button', { name: /options/i }))
    expect(screen.getByText(/user interface/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByRole('button', { name: /options/i })).toBeInTheDocument()
  })

  it('applies the global toggles to every body and orbit', () => {
    renderDrawer()
    fireEvent.click(screen.getByRole('button', { name: /options/i }))
    const wireframe = screen.getByRole('button', { name: /toggle all wireframe/i })
    fireEvent.click(wireframe)
    expect(debug().globalWireframe).toBe(true)
    expect(debug().isWireframe('eris')).toBe(true)
    expect(wireframe).toHaveTextContent(/on/i)
    fireEvent.click(screen.getByRole('button', { name: /toggle all axes/i }))
    expect(debug().hasBodyAxes('moon')).toBe(true)
    expect(debug().hasOrbitAxes('moon')).toBe(true)
    expect(debug().hasOrbitAxes('sun')).toBe(false)
  })

  it('lists every body in the accordion and toggles its own and its orbit helpers', () => {
    renderDrawer()
    fireEvent.click(screen.getByRole('button', { name: /options/i }))
    const items = screen.getAllByRole('button', {
      name: /^(the sun|mercury|venus|earth|moon|mars|jupiter|saturn|uranus|neptune|pluto|ceres|haumea|makemake|eris)$/i,
    })
    expect(items).toHaveLength(15)

    fireEvent.click(screen.getByRole('button', { name: /^earth$/i }))
    const panel = screen.getByRole('region', { name: /^earth$/i })
    const checkboxes = within(panel).getAllByRole('checkbox')
    // * corps : wireframe, axes, grille ; orbite : axes, grille
    expect(checkboxes).toHaveLength(5)
    fireEvent.click(checkboxes[0]!)
    expect(debug().isWireframe('earth')).toBe(true)
    fireEvent.click(checkboxes[4]!)
    expect(debug().hasOrbitGrid('earth')).toBe(true)
    expect(checkboxes[4]).toBeChecked()
  })

  it('does not offer orbit controls for the Sun', () => {
    renderDrawer()
    fireEvent.click(screen.getByRole('button', { name: /options/i }))
    fireEvent.click(screen.getByRole('button', { name: /^the sun$/i }))
    const panel = screen.getByRole('region', { name: /^the sun$/i })
    expect(within(panel).getAllByRole('checkbox')).toHaveLength(3)
  })
})
