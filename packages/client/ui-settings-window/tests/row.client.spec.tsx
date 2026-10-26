// @vitest-environment jsdom
/** The selector shows the stored preference and saves a choice before publishing it. */
import type { ComponentProps } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { DesktopStartupWindowSize } from '../src/protocol.ts'
import { StartupWindowSizeRow } from '../src/client/StartupWindowSizeRow.tsx'
import { en } from '../src/client/locales.ts'

afterEach(cleanup)

function mount(initial: DesktopStartupWindowSize, accept: (size: DesktopStartupWindowSize) => Promise<DesktopStartupWindowSize>) {
  const startupSize = vi.fn(async () => initial)
  const setStartupSize = vi.fn(accept)
  const props = {
    window: { startupSize, setStartupSize },
    t: (key: keyof typeof en) => en[key],
  } as ComponentProps<typeof StartupWindowSizeRow>
  render(<StartupWindowSizeRow {...props} />)
  return { startupSize, setStartupSize }
}

it('shows the stored preset and explains the next-launch scope', async () => {
  mount('default', async size => size)
  const trigger = await screen.findByRole('button', { name: en.title })
  expect(trigger.textContent).toContain(en.sizeDefault)
  expect(screen.getByText(en.description)).toBeTruthy()
})

it('saves a chosen preset and shows the accepted value', async () => {
  const { setStartupSize } = mount('default', async size => size)
  fireEvent.click(await screen.findByRole('button', { name: en.title }))
  fireEvent.click(screen.getByRole('menuitem', { name: en.sizeFhd }))
  expect(setStartupSize).toHaveBeenCalledWith({ width: 1920, height: 1080 })
  const trigger = await screen.findByRole('button', { name: en.title })
  expect(trigger.textContent).toContain(en.sizeFhd)
})

it('keeps the accepted value and reports a rejected write', async () => {
  const { setStartupSize } = mount('maximize', async () => { throw new Error('denied') })
  const trigger = await screen.findByRole('button', { name: en.title })
  expect(trigger.textContent).toContain(en.sizeMaximize)
  fireEvent.click(trigger)
  fireEvent.click(screen.getByRole('menuitem', { name: en.size720p }))
  expect(await screen.findByText(en.writeFailed)).toBeTruthy()
  expect(screen.getByRole('button', { name: en.title }).textContent).toContain(en.sizeMaximize)
  expect(setStartupSize).toHaveBeenCalledTimes(1)
})

it('names a size a user edited into the settings file', async () => {
  mount({ width: 1000, height: 700 }, async size => size)
  const trigger = await screen.findByRole('button', { name: en.title })
  expect(trigger.textContent).toContain(`${en.sizeCustom} (1000 × 700)`)
})
