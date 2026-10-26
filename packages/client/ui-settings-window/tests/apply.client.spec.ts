/** The row is a Desktop-only contribution and disappears with its plugin. */
import { Context } from '@deepseek-ai/cordis'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { afterEach, expect, it, vi } from 'vitest'
import { apply, inject } from '../src/client/index.ts'

afterEach(() => { vi.unstubAllGlobals() })

const api = {
  startupSize: async () => 'default' as const,
  setStartupSize: async (size: 'default' | 'maximize' | { width: number; height: number }) => size,
}

async function mount(desktop: boolean) {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  ctx.provide('locale', new LocaleRuntime(ctx))
  const slots = ctx.get('slots') as SlotRegistry
  slots.register({ name: 'root', children: {
    'settings.general.item': { kind: 'list', scope: 'root' },
  } } as never, () => null)
  if (desktop) vi.stubGlobal('dshDesktop', { protocolVersion: 1, window: api })
  const fiber = ctx.plugin({ inject, apply })
  await fiber.await()
  return { ctx, slots, fiber }
}

it('registers no row in a browser, where no window exists', async () => {
  const { ctx, slots, fiber } = await mount(false)
  try {
    expect(slots.entries('settings.general.item')).toHaveLength(0)
    await fiber.dispose()
  } finally {
    await ctx.fiber.dispose()
  }
})

it('adds one General row under the Desktop shell and removes it on disposal', async () => {
  const { ctx, slots, fiber } = await mount(true)
  try {
    const entries = slots.entries('settings.general.item')
    expect(entries).toHaveLength(1)
    expect(entries[0]!.options).toMatchObject({ id: 'startup-window-size', order: 10.5 })
    expect(entries[0]!.inject?.()).toEqual({ window: api })
    await fiber.dispose()
    expect(slots.entries('settings.general.item')).toHaveLength(0)
  } finally {
    await ctx.fiber.dispose()
  }
})

it('orders the row between the appearance and font-size rows', async () => {
  const { ctx, slots, fiber } = await mount(true)
  try {
    // client-ui-theme owns 'appearance' at order 10 and 'font-size' at order 11.
    slots.register({ name: 'settings.general.item', id: 'appearance', order: 10 }, () => null)
    slots.register({ name: 'settings.general.item', id: 'font-size', order: 11 }, () => null)
    expect(slots.entries('settings.general.item').map(entry => entry.options.id))
      .toEqual(['appearance', 'startup-window-size', 'font-size'])
  } finally {
    await fiber.dispose()
    await ctx.fiber.dispose()
  }
})
