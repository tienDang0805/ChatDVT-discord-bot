# Android Device Toolbox

Route: `/android-toolbox`, listed on `/mobile` and the homepage. Real USB ADB via Tango; no backend API. Requires HTTPS/localhost, WebUSB (desktop Chrome/Edge), a data cable, USB debugging, and ADB shell v2 (typically Android 7+).

## Test locally

From `client`: `npm run dev`, then open `/android-toolbox` in Chrome. Click Connect and authorize the device on Android. If USB is busy, stop IDE debugging and run `adb kill-server` before retrying. ADB and WebUSB may compete for the same USB interface.

Supported: device information, third-party package discovery, launch/stop/restart/app settings, runtime permission grant/revoke, confirmed full app-data reset, PNG screenshot, bounded Logcat snapshot (not streaming), filtering and export. Actions run sequentially, with a 30-second timeout. USB authorization times out after 60 seconds; navigation/unplug/cancel clean up the session.

Metro reverse is deliberately a Terminal helper: daemon WebUSB transport cannot forward TCP to the computer without an additional local bridge. Keep that ADB session instead of reconnecting WebUSB, or use LAN Metro while using Toolbox.

Storage: `android_toolbox_project_v1` in localStorage contains only package and Metro port. Tango stores the ADB credential in its own IndexedDB. Screenshots, device logs and command history remain in tab memory and are not sent to a backend by this feature.

## Checks

Run in `client`:

```sh
node --experimental-strip-types --test src/features/public/android-toolbox/adb.test.mjs
./node_modules/.bin/tsc --noEmit -p src/features/public/android-toolbox/tsconfig.json
npm run build
```

Tests use Node 22.6+ (tested with Node 24). Hardware checklist: cancel chooser; deny/accept authorization; busy USB; unplug while idle and during a command; reconnect; fetch info/app list; launch a debug app; screenshot PNG; retrieve logs; permission success/failure; cancel data reset and confirm only on a disposable test app. Never use automated checks to clear a personal app's data.
