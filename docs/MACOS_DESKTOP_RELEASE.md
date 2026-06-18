# macOS Desktop Release

This project uses Tauri for the admin desktop app.

## Outputs

- `npm run build:desktop`
  Produces the macOS `.app`
- `npm run bundle:desktop`
  Produces the macOS `.app` and `.dmg`

## Prerequisites

Install Apple developer tools:

```bash
xcode-select --install
```

Install Rust:

```bash
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
source "$HOME/.cargo/env"
rustup target add aarch64-apple-darwin
```

Verify:

```bash
cargo --version
rustc --version
```

## 1. Unsigned local build

```bash
npm install
npm run build:desktop
```

Output:

- `src-tauri/target/aarch64-apple-darwin/release/bundle/macos/Abhishek Admin.app`

## 2. DMG build

```bash
npm run bundle:desktop
```

Outputs are typically in:

- `src-tauri/target/aarch64-apple-darwin/release/bundle/macos/`
- `src-tauri/target/aarch64-apple-darwin/release/bundle/dmg/`

## 2.1 Website-hosted update feed

Every build now refreshes:

- `public/downloads/Abhishek-Admin.dmg`
  You still replace this with the newly built DMG you want to publish
- `public/downloads/latest.json`
  This is the manifest the installed desktop app polls for update notifications

For production, set:

```bash
VITE_ADMIN_DESKTOP_DOWNLOAD_URL="https://www.abhishekpanda.com/downloads/Abhishek-Admin.dmg"
VITE_ADMIN_DESKTOP_UPDATE_MANIFEST_URL="https://www.abhishekpanda.com/downloads/latest.json"
```

Then redeploy Vercel after you replace the DMG.

## 3. Code signing

You need an Apple Developer account and a `Developer ID Application` certificate for direct downloads outside the App Store.

List installed signing identities:

```bash
security find-identity -v -p codesigning
```

Then build with the signing identity set:

```bash
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAMID)"
npm run bundle:desktop
```

## 4. Notarization using Apple ID

Create an app-specific password for your Apple account, then:

```bash
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAMID)"
export APPLE_ID="you@example.com"
export APPLE_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="TEAMID"
npm run bundle:desktop
```

## 5. Notarization using App Store Connect API

```bash
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAMID)"
export APPLE_API_ISSUER="issuer-id"
export APPLE_API_KEY="key-id"
export APPLE_API_KEY_PATH="/absolute/path/AuthKey_KEYID.p8"
npm run bundle:desktop
```

## 6. Open the built app or DMG

```bash
open "src-tauri/target/aarch64-apple-darwin/release/bundle/macos/Abhishek Admin.app"
```

If a DMG was built:

```bash
open src-tauri/target/aarch64-apple-darwin/release/bundle/dmg
```

## Notes

- Direct download distribution on macOS requires notarization to avoid the unverified app warning.
- A free Apple Developer account can sign for testing, but cannot notarize for smooth public distribution.
- The current desktop app can notify you when a newer website-hosted build is available. Fully silent background install and automatic relaunch still require a signed updater pipeline.
