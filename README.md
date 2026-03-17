# Cloud Athan

Privacy-first, free, and open source prayer times app for iOS, Android, and web.

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2055-000020.svg)](https://expo.dev)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-brightgreen.svg)]()
[![Translation status](https://hosted.weblate.org/widgets/cloud-athan/-/svg-badge.svg)](https://hosted.weblate.org/engage/cloud-athan/)

## Features

- **Accurate prayer times** powered by the [adhan](https://github.com/batoulapps/adhan-js) astronomical calculation library
- **Athan notifications** with beautiful call-to-prayer sounds from Makkah, Madinah, and Al-Aqsa
- **Countdown timer** showing time remaining until the next prayer
- **Qibla compass** with haptic feedback for direction alignment
- **Multi-language** support with RTL layout (Arabic, English, French, Turkish, Urdu, Malay, Indonesian)
- **Offline-first** — works without internet after initial location detection
- **Zero tracking** — your location never leaves your device

## Screenshots

<!-- Screenshots will be added before store submission -->

## Quick Start

```bash
bun install
bunx expo start
```

That's it — up and running in under 3 minutes. Scan the QR code with Expo Go, or press `i` for iOS Simulator / `a` for Android Emulator.

For development builds with native modules (notifications, alarm manager):

```bash
bunx expo prebuild
bunx expo run:ios    # or run:android
```

## Architecture

Cloud Athan is built with **Expo SDK 55** and **React Native 0.83**, using a file-based routing approach with `expo-router`.

```
app/              # Screens and navigation (file-based routing)
components/       # Reusable UI components
services/         # Business logic (prayer calculation, notifications, location)
stores/           # Zustand state management with MMKV persistence
hooks/            # Custom React hooks
i18n/             # Translations (7 languages)
theme/            # Design tokens, colors, typography
modules/          # Custom native modules (alarm-manager)
utils/            # Shared utilities
__tests__/        # Test suites
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 55 + React Native 0.83 |
| Language | TypeScript 5.9 |
| Navigation | expo-router (file-based) |
| State | Zustand + react-native-mmkv |
| Prayer Calc | adhan.js (astronomical) |
| Animations | react-native-reanimated 4 |
| Notifications | expo-notifications + custom alarm-manager module |
| Sensors | expo-sensors (magnetometer for Qibla) |
| i18n | i18next + expo-localization |
| Testing | Jest 30 + jest-expo + React Native Testing Library |
| Linting | Biome |
| CI/CD | GitHub Actions + EAS Build |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, code style, and PR guidelines.

## License

[GPL-3.0](LICENSE)

## Privacy

**Zero data collection.** Location coordinates are processed entirely on-device and never transmitted to any server. There are no analytics, no ads, no user accounts, and no telemetry. The code IS the privacy policy.
