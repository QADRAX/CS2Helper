# @cs2helper/cs2-scoreboard-screenshot

Windows-only helper for saving **PNG screenshots** of the CS2 client when the player fires a **registered global hotkey** (typically an auxiliary key combined with a keyboard macro: TAB + F13, etc.).

This package is the foundation for later **scoreboard OCR**: it only writes files under the shared CS2Helper app-data layout.

## Requirements

- **Windows** — uses `RegisterHotKey`, GDI window capture, and `tasklist`-backed PID lookup.
- **Game display** — **Fullscreen Windowed** or **Windowed** works best. **Exclusive fullscreen** may yield blank or incomplete captures because the Win32 `PrintWindow` / `BitBlt` path cannot read every exclusive-fullscreen swap chain; upgrading the `WindowCapturePort` implementation (e.g. Windows.Graphics.Capture) is the usual mitigation.

## Macro + hotkey flow

1. Configure your keyboard/macro software to send **TAB** (held for scoreboard) and your **auxiliary VK** (default integration uses **`VK_F13`** — see `VK_F13` export).
2. Register **only the auxiliary key** via `RegisterHotKey` (`ScoreboardScreenshotService`). CS2 continues to receive TAB normally.
3. When the auxiliary hotkey fires, the service runs the capture pipeline **only if**:
   - **CS2 is foreground** (`cs2.exe` owns the foreground HWND), and
   - the host reports an **active GSI match** via `MatchSignalPort` — typically `currentMatch != null` from `GsiGatewayService.getState()` (see `@cs2helper/gsi-processor`).

## Output folder

Use `@cs2helper/cli-common` **`getScoreboardSnapshotsDir(hostAppName)`** so files land under:

`%APPDATA%\CS2Helper\<hostApp>\scoreboard-snapshots\`

Filenames look like `scoreboard-<iso-timestamp>.png`.

## Which monitor?

Captures target the **CS2 window HWND** (largest visible client rect for `cs2.exe`). You do **not** pick a monitor index: Windows associates the window with a monitor automatically.

## Host wiring (next PR)

Implement `MatchSignalPort` from live GSI state, e.g.:

```ts
getMatchSignal() {
  const s = gateway.getState();
  return {
    hasActiveMatch: s.currentMatch != null,
    mapPhase: s.lastSnapshot?.map?.phase,
  };
}
```

Then compose `ScoreboardScreenshotService` with `FsScoreboardSnapshotSinkAdapter(getScoreboardSnapshotsDir("gsi-cli"))`, `WindowsCs2ForegroundAdapter`, `WindowsCs2WindowCaptureAdapter`, `ClockNowMsAdapter`, and your match adapter.

## Native dependency (koffi)

pnpm may skip native install scripts until approved. If loading `koffi` fails at runtime, run `pnpm approve-builds` (or allow scripts for `koffi`) so the native addon can build.

For `handleScoreboardHotkey`, order is documented as:

`[matchSignal, foreground, windowCapture, snapshotSink, clock]`.
