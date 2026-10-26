---
kind: upgrade-guide
description: "Desktop stores a launch window size in its shell settings and offers it in General settings."
---

# Choose the Desktop startup window size

English | [中文](guide.zh.md)

## Change

Desktop reads `window.startupSize` from `userData/desktop/settings.json` when it creates the main window and can maximize before the workspace shows. `Settings → General` gains a **Window size on open** row from the new `@deepseek-ai/dsh-client-ui-settings-window` package, and the Desktop preload's product API gains `window.startupSize()` and `window.setStartupSize(size)` over two new `DESKTOP_IPC` channels.

Existing documents are not rewritten: an absent or invalid `window.startupSize` resolves to `"default"` (1280 × 820), matching the previous fixed window size. The row registers only when the page runs under the Desktop shell, so a browser composition shows nothing new.

## Migration

1. Custom client compositions that intentionally replace the shipped General settings section need nothing: the row is absent when `globalThis.dshDesktop?.window` is undefined.
2. A custom preload that reimplements the Desktop product API must expose `window.startupSize()` and `window.setStartupSize(size)` to keep the row, or omit `window` entirely and the row stays hidden.
3. Values are `"default"`, `"maximize"`, or `{"width": <integer>, "height": <integer>}`. Sizes larger than the display work area open fitted to it; neither dimension drops below 520 × 600.
4. A document that cannot be parsed makes the row's write fail instead of replacing content. Correct the file, then restart to apply a hand-edited size.

See the [Desktop reference](../../../../apps/desktop/README.md#local-desktop-settings) for the file location and full field semantics.
