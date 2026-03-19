<p align="center">
  <img src="assets/images/icon.png" alt="Cloud Athan" width="120" height="120" />
</p>

<h1 align="center">Cloud Athan</h1>

<p align="center">
  <strong>Privacy-first, free, and open-source prayer times app.</strong><br />
  The first actively maintained FOSS prayer app with true cross-platform coverage and zero data collection.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPL--3.0-blue.svg" alt="License: GPL-3.0" /></a>
  <a href="https://expo.dev"><img src="https://img.shields.io/badge/Expo-SDK%2055-000020.svg" alt="Expo SDK 55" /></a>
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-brightgreen.svg" alt="Platform" />
  <a href="https://hosted.weblate.org/engage/cloud-athan/"><img src="https://hosted.weblate.org/widgets/cloud-athan/-/svg-badge.svg" alt="Translation status" /></a>
  <a href="https://github.com/ilyassrachedine/cloud-adhan/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
</p>

---

## Overview

Cloud Athan calculates prayer times entirely on your device using the [adhan.js](https://github.com/batoulapps/adhan-js) astronomical library. Your location coordinates never leave your phone. There are no analytics, no ads, no user accounts, and no telemetry.

**Privacy is not a policy -- it is the architecture.** The app makes zero network requests during normal operation. The code _is_ the privacy policy.

This project is sustained as _sadaqah jariyah_ (ongoing charity).

## Screenshots

<!-- TODO: Add screenshots before store submission -->

| Home | Countdown | Qibla | Settings |
|:----:|:---------:|:-----:|:--------:|
| _coming soon_ | _coming soon_ | _coming soon_ | _coming soon_ |

## Features

### Prayer Times
- Accurate astronomical calculation via **adhan.js v4.4.3** (supports all major calculation methods)
- Countdown timer to next prayer with **60fps animations** powered by Reanimated 4
- Visual prayer state indicators (upcoming, current, passed)

### Athan Notifications
- Curated call-to-prayer sounds from **Makkah**, **Madinah**, **Al-Aqsa**, and **Mishary Rashid Alafasy**
- Separate Fajr-specific athan sounds
- Platform-optimized delivery:
  - **iOS:** rolling 64-slot notification schedule with background reschedule
  - **Android:** `AlarmManager.setAlarmClock` + Foreground Service via custom native module for reliable wake-up alarms

### Qibla Compass
- Real-time direction to Makkah using the device magnetometer
- Haptic feedback when aligned with the Qibla direction

### Internationalization
- **7 languages:** English, Arabic, French, Turkish, Urdu, Malay, Indonesian
- Full **RTL layout** support for Arabic and Urdu
- Translations managed via [Weblate](https://hosted.weblate.org/engage/cloud-athan/) -- contributions welcome

### Privacy & Performance
- 100% offline-first -- no internet required after initial location detection
- Zero tracking, zero ads, zero telemetry, no user accounts
- Less than 30MB binary size, under 50MB RAM usage

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 55 + React Native 0.83.2 |
| Language | TypeScript 5.9 |
| Navigation | expo-router (file-based routing) |
| State | Zustand + react-native-mmkv |
| Prayer Calculation | adhan.js v4.4.3 (astronomical) |
| Animations | react-native-reanimated 4 |
| Notifications | expo-notifications + custom alarm-manager native module |
| Sensors | expo-sensors (magnetometer for Qibla) |
| Audio | expo-audio (athan playback) |
| i18n | i18next + expo-localization |
| Linting | Biome v2.4.7 |
| Testing | Jest 30 + jest-expo + React Native Testing Library |
| Error Reporting | Sentry (crash data only, no PII) |
| CI/CD | GitHub Actions + EAS Build |

## Architecture

```
 User opens app
       |
       v
 +-----------+     +------------------+
 |  Location  |---->|  adhan.js        |   All on-device.
 |  (device)  |     |  (calculation)   |   No network calls.
 +-----------+     +------------------+
                           |
              +------------+-------------+
              |                          |
              v                          v
     +----------------+       +-------------------+
     |   UI Layer      |       |  Notifications    |
     |  (React Native) |       |  (platform-aware) |
     +----------------+       +-------------------+
              |                     |           |
              v                     v           v
        +-----------+        +---------+  +-------------+
        |  Zustand   |        |  iOS    |  |  Android    |
        |  + MMKV    |        |  (UNS   |  |  (Alarm     |
        |  (persist) |        |  64-slot)|  |  Manager +  |
        +-----------+        +---------+  |  FG Service) |
                                          +-------------+
```

**Key design decisions:**

- **Offline-first:** adhan.js runs entirely on-device. Location coordinates are stored locally in MMKV and never transmitted anywhere.
- **Platform-divergent notifications:** iOS uses the 64-slot UNUserNotification rolling schedule. Android uses `AlarmManager.setAlarmClock` with a Foreground Service via a custom Expo native module (`modules/alarm-manager`) for reliable alarm delivery even in Doze mode.
- **Zero network requests** in normal operation. Sentry is the only optional network dependency (crash reports only, no PII collected).

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (package manager)
- [Expo CLI](https://docs.expo.dev/get-started/set-up-your-environment/) (`bunx expo`)
- iOS Simulator (macOS) or Android Emulator, or a physical device with [Expo Go](https://expo.dev/go)
- For native builds: Xcode 16+ (iOS) or Android Studio (Android)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/ilyassrachedine/cloud-adhan.git
cd cloud-adhan

# Install dependencies
bun install

# Start the dev server
bun start
```

Scan the QR code with Expo Go, or press `i` for iOS Simulator / `a` for Android Emulator.

### Development Builds (with native modules)

Notification sounds and the Android alarm manager require a development build:

```bash
# Generate native projects
bunx expo prebuild

# Run on device or emulator
bun ios       # or: bun android
```

### Other Commands

```bash
bun test          # Run tests
bun run lint      # Lint with Biome
bun run format    # Auto-fix lint issues
bun run typecheck # TypeScript type checking
bun web           # Start web version
```

## Project Structure

```
cloud-athan/
  app/                    # Screens & navigation (expo-router file-based routing)
    (tabs)/               #   Tab screens: home, qibla, settings
    _layout.tsx           #   Root layout
  components/             # Reusable UI components
    home/                 #   Home screen components
    prayer/               #   Prayer time display components
    qibla/                #   Qibla compass components
    settings/             #   Settings screen components
    ui/                   #   Shared UI primitives
  services/               # Core business logic
    prayer.ts             #   Prayer time calculation (adhan.js)
    notification.ts       #   Cross-platform notification scheduling
    notification.ios.ts   #   iOS-specific notification logic
    notification.android.ts # Android-specific alarm logic
    location.ts           #   Location service
    audio.ts              #   Athan audio playback
  stores/                 # Zustand stores with MMKV persistence
    settings.ts           #   User preferences (calculation method, sounds, language)
    location.ts           #   Cached location coordinates
  hooks/                  # Custom React hooks
    usePrayerTimes.ts     #   Prayer time computation
    useCountdown.ts       #   Animated countdown timer
    useQibla.ts           #   Magnetometer-based Qibla direction
    useLocation.ts        #   Device location with permissions
    useNotifications.ts   #   Notification scheduling
  i18n/                   # Translation files (7 languages)
  modules/                # Custom Expo native modules
    alarm-manager/        #   Android AlarmManager + Foreground Service
  constants/              # App constants (calculation methods, sounds, cities)
  assets/                 # Images, icons, athan audio files
  __tests__/              # Test suites
```

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, code style, and PR guidelines.

### Ways to contribute

- **Translations:** Add or improve translations via [Weblate](https://hosted.weblate.org/engage/cloud-athan/). No coding required.
- **Bug reports:** Open an issue with steps to reproduce.
- **Feature requests:** Open an issue describing the use case.
- **Code:** Fork, create a branch, submit a PR. Please run `bun run lint` and `bun test` before submitting.

### Related Projects

- [cloud-quran](https://github.com/ilyassrachedine/cloud-quran) -- Companion Quran app

## Privacy

**Cloud Athan collects zero user data.** This is enforced by architecture, not policy:

- Location coordinates are processed **entirely on-device** by adhan.js and cached locally in MMKV
- The app makes **zero network requests** during normal operation
- There are **no analytics, no ads, no user accounts, and no telemetry**
- Crash reports (via Sentry) contain no personally identifiable information and are the only optional network activity
- The source code is open for anyone to verify

Apple's privacy manifest in `app.json` confirms: no tracking, no data linked to identity.

## License

Cloud Athan is licensed under the [GNU General Public License v3.0](LICENSE).

You are free to use, modify, and distribute this software under the terms of the GPL-3.0. Any derivative work must also be open-source under the same license.

## Acknowledgments

- [adhan.js](https://github.com/batoulapps/adhan-js) by Batoul Apps -- the astronomical prayer time calculation engine that powers this app
- The muezzins of **Masjid al-Haram (Makkah)**, **Masjid an-Nabawi (Madinah)**, and **Masjid al-Aqsa** for the call-to-prayer recordings
- **Mishary Rashid Alafasy** for his widely beloved athan recitation
- [Weblate](https://hosted.weblate.org/engage/cloud-athan/) and all translation contributors
- The open-source community for making projects like this possible

---

<p align="center">
  Built with care as <em>sadaqah jariyah</em>.
</p>
