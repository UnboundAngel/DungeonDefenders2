# MacroHub (Dungeon Defenders 2)

Quality-of-life desktop companion for Dungeon Defenders 2: global macro runner, HUD overlay, and reroll counter packaged as a portable EXE.

## Download & Run
- Get the latest release ZIP from the GitHub Releases page.
- Extract the ZIP (built as a single-file, self-contained EXE; no .NET install required).
- Double-click `MacroHub.exe`.
- On first run it will create a local `data` folder next to the EXE for settings/state.

## Features
- **Macro hub:** Pre-seeded DD2 binds plus custom macros with adjustable delays.
- **HUD overlay:** Minimal/Standard/Overkill modes with reroll info; pin/unpin, choose corner.
- **Reroll counter:** Tracks pity, history, and quick actions (increment/record/reset).
- **Global hotkeys:** Start/Pause/Stop macros; emergency hotkey; configurable in-app.
- **Info hub:** Quick links to DD2 resources.

## Basic Usage
- Select a macro from the list, adjust delay/hotkey if needed, and start/stop via the UI or global keys.
- Use the Nav combo (left panel) to switch between Macros and the Info/Reroll pane.
- HUD pin toggles top-most; mode selector changes the HUD layout.
- Reroll tools live in the Info pane and also surface in the HUD.

## Notes & Requirements
- Built as a self-contained `win-x64` app; no external runtime needed.
- If a hotkey clashes with another app, change it in Settings/Globals.
- App exits fully on close (no tray icon).

## Troubleshooting
- **Window closes immediately:** Make sure you’re running the published `MacroHub.exe` (not the source build) and that the ZIP was fully extracted.
- **Missing icon in Explorer:** Windows may cache icons; refresh the folder or open Properties once. The icon is embedded in the EXE.
- **Antivirus warnings:** Self-contained single-file EXEs can be large; allowlist if falsely flagged.

## Building from source (optional)
```
dotnet publish -c Release -r win-x64 ^
  -p:PublishSingleFile=true ^
  -p:PublishReadyToRun=true ^
  -p:IncludeNativeLibrariesForSelfExtract=true
```
Output: `bin/Release/net9.0-windows/win-x64/publish/` (MacroHub.exe). Zip that folder (or just the EXE) for distribution.
