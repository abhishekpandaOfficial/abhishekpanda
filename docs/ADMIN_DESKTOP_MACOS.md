# Admin Desktop for macOS

This project now supports a desktop-first admin shell for macOS using Tauri.

## What is included

- Shared React admin workspace reused from the web codebase
- Desktop-aware admin shell and browser handoff
- Tauri wrapper in `src-tauri/`
- Apple Silicon build script in `package.json`

## Local setup

1. Install Rust using `rustup`
2. Install Xcode Command Line Tools with `xcode-select --install`
3. Run `npm install`
4. Start the desktop app with `npm run dev:desktop`

## Apple Silicon production build

Run:

```bash
npm run build:desktop
```

That targets `aarch64-apple-darwin`.

## Release metadata

Every desktop or web build now runs `npm run sync:desktop-release` first. That keeps:

- `public/downloads/latest.json` in sync with the desktop app version
- `src/generated/desktopRelease.ts` in sync for the installed app update checker

## Optional web handoff download button

Set these in your environment if you want the web `/admin` handoff screen and desktop app update checker to use your live production URLs:

```bash
VITE_ADMIN_DESKTOP_DOWNLOAD_URL="https://www.abhishekpanda.com/downloads/Abhishek-Admin.dmg"
VITE_ADMIN_DESKTOP_UPDATE_MANIFEST_URL="https://www.abhishekpanda.com/downloads/latest.json"
```
