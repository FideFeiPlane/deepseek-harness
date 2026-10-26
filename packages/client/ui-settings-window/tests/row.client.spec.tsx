// @vitest-environment jsdom
/** The selector shows the stored preference, saves a choice, and notes a scaled display. */
import type { ComponentProps } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { DesktopStartupWindowSize } from '../src/protocol.ts'
import { StartupWindowSizeRow } from '../src/client/StartupWindowSizeRow.tsx'
import { en } from '../src/client/locales.ts'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

/** Fill the copy placeholders the row passes for the display note. */
function translate(key: keyof typeof en, params?: Readonly<Record<string, string | number>>): string {
  return en[key].replace(/\{(\w+)\}/g, (match, name: string) => String(params?.[name] ?? match))
}

function mount(
  initial: DesktopStartupWindowSize,
  accept: (size: DesktopStartupWindowSize) => Promise<DesktopStartupWindowSize>,
  ratio = 1,
) {
  vi.stubGlobal('devicePixelRatio', ratio)
  const startupSize = vi.fn(async () => initial)
  const setStartupSize = vi.fn(accept)
  const props = {
    window: { startupSize, setStartupSize },
    t: translate as ComponentProps<typeof StartupWindowSizeRow>['t'],
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
  fireEvent.click(screen.getByRole('menuitem', { name: en.sizeXga }))
  expect(await screen.findByText(en.writeFailed)).toBeTruthy()
  expect(screen.getByRole('button', { name: en.title }).textContent).toContain(en.sizeMaximize)
  expect(setStartupSize).toHaveBeenCalledTimes(1)
})

it('names a size a user edited into the settings file', async () => {
  mount({ width: 1000, height: 700 }, async size => size)
  const trigger = await screen.findByRole('button', { name: en.title })
  expect(trigger.textContent).toContain(`${en.sizeCustom} (1000 × 700)`)
})

it('offers every preset regardless of the display it opens on', async () => {
  mount({ width: 2560, height: 1440 }, async size => size)
  fireEvent.click(await screen.findByRole('button', { name: en.title }))
  expect(screen.getAllByRole('menuitem')).toHaveLength(7)
  expect(screen.getByRole('menuitem', { name: en.sizeQhd }).hasAttribute('disabled')).toBe(false)
})

it('names the display scale only when the system scales the display', async () => {
  mount('default', async size => size, 1.24)
  expect(await screen.findByText(translate('displayScale', { scale: 124 }))).toBeTruthy()
})

it('omits the display scale on an unscaled display', async () => {
  mount('default', async size => size)
  await screen.findByRole('button', { name: en.title })
  expect(screen.queryByText(translate('displayScale', { scale: 100 }))).toBeNull()
})
