# Maestro Mobile — App Store Release Checklist

Everything below is the current state. Steps 1–3 are done. Resume from Step 4.

---

## STATUS

| # | Step | Status |
|---|------|--------|
| 1 | Add `http://localhost` redirect URI in UiPath | ✅ Done |
| 2 | Install Xcode | ✅ Done (Xcode 26.3) |
| 3 | Enroll in Apple Developer Program | ⏳ Waiting for Apple approval (24–48 hrs) |
| 4 | iOS Simulator runtime installing | ⏳ Downloading in background (~10 min) |
| 5 | Open in Xcode + configure signing | ⏳ After 3 & 4 |
| 6 | Test on iPhone Simulator + take screenshots | ⏳ After 5 |
| 7 | Create App Store listing | ⏳ After 3 |
| 8 | Archive & Upload from Xcode | ⏳ After 6 & 7 |
| 9 | Submit for review | ⏳ After 8 |

---

## Step 4 — Simulator Runtime (downloading in background)

The iOS 26.3.1 Simulator runtime (8.4 GB) is downloading automatically.
Check progress in Terminal:

```bash
tail -f /tmp/ios-runtime-download.log | grep -o '[0-9.]*% ([^)]*)'
```

When it finishes, verify the runtime is registered:

```bash
xcrun simctl list runtimes
```

You should see: `iOS 26.3.1 (23D8133) - com.apple.CoreSimulator.SimRuntime.iOS-26-3`

If you see `xcrun simctl list devices` and no iPhone simulators appear, run:

```bash
xcrun simctl create "iPhone 16 Pro" "com.apple.CoreSimulator.SimDeviceType.iPhone-16-Pro" "com.apple.CoreSimulator.SimRuntime.iOS-26-3-1"
```

---

## Step 5 — Open in Xcode + configure signing

> ⚠️ Do this AFTER Apple Developer Program approval email arrives.

```bash
cd "/Users/joshikumar/Documents/coded-demo/first app/maestro-mobile"
npm run ios:open
```

In Xcode:
1. Click **App** in the left project navigator
2. Select the **Signing & Capabilities** tab
3. Check ✅ **Automatically manage signing**
4. Set **Team** to your Apple Developer account (add via Xcode → Settings → Accounts → + → sign in with Apple ID)
5. Verify **Bundle Identifier** = `com.uipath.maestro` ← already set
6. Verify **Version** = `1.0` and **Build** = `1` ← already set

---

## Step 6 — Test on iPhone Simulator + take screenshots

In Xcode:
1. Select simulator from the top device picker: **iPhone 16 Pro Max** (needed for 6.9" screenshots)
2. Press ▶ **Run** (or Cmd+R)
3. Simulator opens — tap **Sign In** and log in with your UiPath credentials
4. Navigate through the app (process list, agentic instances, cases)
5. Take screenshots: Simulator menu → **File → Save Screen** (or Cmd+S)

> **Screenshots required for App Store:** 6.9" display (iPhone 16 Pro Max).
> Take at least 3: home screen, process list, instance detail.

---

## Step 7 — Create App Store listing

1. Go to: https://appstoreconnect.apple.com
2. My Apps → **+** → **New App**
   - Platform: **iOS**
   - Name: **Maestro Mobile**
   - Primary Language: **English (U.S.)**
   - Bundle ID: **com.uipath.maestro** ← select from dropdown (appears after Step 5)
   - SKU: `maestro-mobile-001`
3. Fill in the product page:
   - **Description**: "Maestro Mobile gives you a real-time view of your UiPath Orchestrator processes, agentic instances, and case management — right from your iPhone."
   - **Keywords**: `UiPath, Maestro, RPA, automation, process, orchestrator`
   - **Support URL**: Host `public/privacy.html` somewhere (GitHub Pages or Netlify) and paste the URL
   - **Privacy Policy URL**: same URL as Support URL (required by Apple)
4. Upload screenshots from Step 6

### Hosting the privacy policy (required)

Quickest option — Netlify Drop:
1. Go to: https://app.netlify.com/drop
2. Drag the `public/` folder onto the page
3. Copy the URL they give you (e.g. `https://amazing-name-123.netlify.app`)
4. Your privacy policy URL = `https://amazing-name-123.netlify.app/privacy.html`

---

## Step 8 — Archive & Upload

In Xcode:
1. Set the top device target to **Any iOS Device (arm64)** — NOT a simulator
2. Menu → **Product** → **Archive**
3. Wait ~3 min for archive to build
4. **Organizer** window opens automatically
5. Select your archive → **Distribute App**
6. Choose **App Store Connect** → **Upload**
7. Leave all checkboxes as default → **Upload**
8. Wait ~15 min for Apple to process the build in App Store Connect

---

## Step 9 — Submit for Review

1. In App Store Connect, go to your app
2. Under **iOS App**, click **+** next to "Build" → select the uploaded build
3. Export compliance: **No** (standard OAuth, no custom encryption)
4. Click **Submit for Review**
5. Apple review: **1–3 business days**

---

## Every time you update the app code

```bash
cd "/Users/joshikumar/Documents/coded-demo/first app/maestro-mobile"
npm run ios:sync       # rebuilds web app and syncs into iOS project
npm run ios:open       # opens Xcode
```

Then in Xcode → General tab → increment **Build** number (1 → 2 → 3…) before archiving.

---

## What's already done ✅

- Capacitor installed and configured (`capacitor.config.ts`)
  - `iosScheme: 'http'` → `window.location.origin` = `http://localhost` on device
  - Redirect URI `http://localhost` added to UiPath External Application ✅
- Bundle ID: `com.uipath.maestro`
- iOS Xcode project generated in `ios/`
- Info.plist configured:
  - Portrait-only orientation for iPhone
  - `NSAppTransportSecurity` with arbitrary loads in web content
  - `WKAppBoundDomains` for UiPath staging/cloud
  - Camera + photo library usage descriptions (required by App Store)
- App icon: purple gradient with white "M" at 1024×1024
  (`ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`)
- Privacy policy at `public/privacy.html`
- Web app built and synced into iOS project
- `npm run ios:sync` and `npm run ios:open` scripts ready in `package.json`
- iOS 26.3.1 Simulator runtime downloading in background (check with `tail -f /tmp/ios-runtime-download.log`)
