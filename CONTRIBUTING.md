# Contributing to Cloud Athan

Jazakum Allahu khairan for considering a contribution to Cloud Athan. Every contribution to a prayer times app is **sadaqah jariyah** (ongoing charity) — each time someone prays on time because of this app, you share in the reward, in sha Allah.

## Prerequisites

- [Bun](https://bun.sh) 1.3+
- [Node.js](https://nodejs.org) 22+
- iOS Simulator (macOS only) or Android Emulator
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (included via `bunx`)

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Devoxer/cloud-athan.git
cd cloud-athan

# Install dependencies
bun install

# Start the dev server
bunx expo start
```

For features that require native modules (notifications, alarm manager):

```bash
bunx expo prebuild
bunx expo run:ios    # or run:android
```

## Code Style

Cloud Athan uses **[Biome](https://biomejs.dev)** for linting and formatting (not ESLint).

```bash
# Check for lint and format issues
bun run lint

# Auto-fix issues
bun run format
```

All code must pass `bun run lint` with zero errors before merging.

## Testing

```bash
# Run the full test suite
bun run test

# Run with coverage
bun run test -- --coverage

# Type checking
bun run typecheck
```

- Test framework: **Jest 30** with **jest-expo** preset and **React Native Testing Library**
- Coverage thresholds enforced for services and utilities
- All tests must pass before a PR can be merged

## Commit Convention

```
{prefix}: {short summary in imperative mood}

- ComponentA: what changed and why
- ComponentB: what changed and why
```

| Context | Prefix |
|---|---|
| Story work | Story key (e.g. `6-3-store-compliance`) |
| Hotfix | `fix` |
| Config/tooling | `chore` |
| Documentation | `docs` |

## Pull Request Process

1. **Fork** the repository
2. **Create a branch** from `main` with a descriptive name
3. **Make your changes** with tests where applicable
4. **Ensure CI passes**: lint + typecheck + test + coverage thresholds
5. **Open a PR** with a clear description of what and why

## Translations

Translation contributions are managed via **[Weblate](https://hosted.weblate.org/engage/cloud-athan/)**. Please do **not** manually edit files in `i18n/` — Weblate ensures consistency across all supported languages.

**How to contribute translations:**

1. Visit [Cloud Athan on Weblate](https://hosted.weblate.org/engage/cloud-athan/)
2. Pick your language (or request a new one)
3. Translate strings through the web interface
4. Weblate automatically creates a PR for review

No development setup needed — everything happens in your browser.

## Bug Reports

Open a [GitHub Issue](https://github.com/Devoxer/cloud-athan/issues) with:

- Steps to reproduce
- Expected vs actual behavior
- Device/OS version
- Screenshots if applicable

## Feature Requests

Open a [GitHub Issue](https://github.com/Devoxer/cloud-athan/issues) with:

- Use case description
- Why this would benefit the community
- Any reference implementations or mockups

## Community Guidelines

Be respectful, constructive, and kind. This is a community project built for the sake of Allah — let's keep the environment welcoming for everyone.

## License

By contributing, you agree that your contributions will be licensed under the [GPL-3.0 License](LICENSE).
