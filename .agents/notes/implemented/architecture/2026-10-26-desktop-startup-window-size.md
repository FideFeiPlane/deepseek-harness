# Agent Note: Desktop startup window size as shell configuration

Status: implemented

English | [中文](2026-10-26-desktop-startup-window-size.zh.md)

## Problem

The Desktop main window always opened at 1280 × 820. The shell persists no window geometry, so a user who works maximized re-maximizes on every launch, and no settings surface could express the preference. The preference must be known when Electron constructs the window, which is before the Host is available and independent of any profile.

## Decision

`userData/desktop/settings.json` gains `window.startupSize`, alongside the existing `updates` fields, following the [shell configuration decision](2026-10-08-desktop-shell-configuration.md): Electron owns the value because it constructs the window before the Host starts, and a window size is device-local rather than profile-local.

The value is `"default"`, `"maximize"`, or an explicit `{ width, height }` size. `apps/desktop/src/window-size.ts` validates it, clamps it into the display work area and the window minimums, and returns whether to maximize. `createWindow` takes the resolved geometry and maximizes before any content loads, so the first paint already has the requested size; `enterWorkspace` re-applies maximize for a window the process recreates.

The editing surface is a Desktop-only row in General settings, owned by `@deepseek-ai/dsh-client-ui-settings-window`. It registers `settings.general.item` only when the preload exposes `dshDesktop.window`, so the browser shows no row for a window it does not own. It writes through a typed preload API (`DESKTOP_IPC.windowStartupSizeGet`/`Set`) and the main process rewrites the document atomically, preserving fields it does not know.

## Alternatives considered

**Store the preference in Cordis configuration.** The window exists before the Host resolves configuration, so Electron would either delay window creation until the Host starts or duplicate configuration evaluation, which the shell configuration decision already rejects.

**Persist and restore the last window geometry.** This is a larger behavioural promise: it needs per-display bookkeeping, handling for monitors that disappear, and a rule for maximized versus windowed bounds. The requested preference is a size chosen in advance, not a restoration of the previous session.

**Images the row inside a plugin's own configuration page.** A plugin page would put the Desktop window under Plugins settings, away from the General surface where it was requested, and the row would still need the same preload API.

## Consequences

The preference applies at the next launch and to a window recreated in-process; changing it never resizes the window the user is looking at. Hand-edited custom sizes are accepted and shown as a custom value; switching to a preset replaces them without remembering the previous size. A document that cannot be parsed makes the write fail rather than discard content, so the row can report a failure the user can fix by editing the file.
