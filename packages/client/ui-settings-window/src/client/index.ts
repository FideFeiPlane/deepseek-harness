/** General settings row for the Desktop startup window size. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { DesktopWindowPreferencesApi } from '../protocol.ts'
import { StartupWindowSizeRow, type StartupWindowSizeRowInjected } from './StartupWindowSizeRow.tsx'
import { de, en, es, fr, ja, pt, ru, zh, type WindowSizeLocaleKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Desktop startup window size copy. */
    'settings.startupWindow': WindowSizeLocaleKey
  }
}

/** Dictionary namespace owned by this plugin. */
export const NS = 'settings.startupWindow'

/** Services used by the browser companion. */
export const inject = ['slots', 'locale']

/**
 * Register the row when the page runs under the Desktop shell, whose preload
 * exposes the window preference; a browser has no window to size.
 * @param ctx - browser plugin context.
 */
export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en, ja, es, fr, de, ru, pt }), 'ui-settings-window: dictionaries')
  const bridge = (globalThis as typeof globalThis & {
    dshDesktop?: { readonly protocolVersion: number; readonly window?: DesktopWindowPreferencesApi }
  }).dshDesktop?.window
  if (bridge === undefined) return
  const face = (): StartupWindowSizeRowInjected => ({ window: bridge })
  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'startup-window-size',
    // Between the appearance row (10) and the font-size row (11).
    order: 10.5,
    locale: NS,
    inject: face,
  }, StartupWindowSizeRow))
}
