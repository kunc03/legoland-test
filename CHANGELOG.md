# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.21] - 2026-05-23

### Added

- **Dynamic Copyright**: Implemented dynamically updated copyright year in the footer.

### Fixed

- **Camera Scan Page**: Fixed camera flip and mirroring issue on iPhone 17 (iOS 16+ / 26.3) and handled `StreamLoadTimeoutError` camera load timeout and general scanning errors on Samsung devices with multi-language error displays.
- **UI & Modal Styling**: Corrected modal width, button labels, and title image padding/layout on the gacha interface before spinning, and fixed unhandled error message before login.

## [1.3.16] - 2025-10-15

### Fixed

- **UI Improvements**: Change button text in prize list history and font size in success claim.

## [1.3.15] - 2026-05-06

### Features

- **Dialog & UI**: Added prize lists dialog.
- **Legal**: Added copyright information.

### Fixed

- **Layout**: Position content adjustments.
- **Authentication**: Fixed login issues.
- **Gacha Mechanic**: Allowed spin gacha A and updated character gacha flow.
- **Service Worker**: Updated sw.js logic.

## [1.1.9] - 2026-04-29

### Fixed

- **Text & Labels**: Changed text menu and label for history prize.

## [1.1.8] - 2026-04-28

### Added

- **Version Display**: Added text above the version display.

### Fixed

- **UI Improvements**: Changed text color to white, updated button label for exchanging prizes, removed pinch-to-zoom feature, and hid map on the prize exchange screen.
- **Gacha Machine**: Changed the machine to roulette and hid autoplay video.
- **Point & Display**: Fixed blank screen issue in point page, hid characters, and set point to 1 digit.
- **Optimization**: Fetched data only on the point page.

## [1.1.7] - 2026-04-28

### Added

- **Version Display**: Added text above the version display.

### Fixed

- **UI Improvements**: Changed text color to white, updated button label for exchanging prizes, removed pinch-to-zoom feature, and hid map on the prize exchange screen.
- **Gacha Machine**: Changed the machine to roulette and hid autoplay video.
- **Point & Display**: Fixed blank screen issue in point page, hid characters, and set point to 1 digit.
- **Optimization**: Fetched data only on the point page.

## [1.1.6] - 2026-04-23

### Fixed

- **UI Improvements**: Added gap in prize card, and improved character collection display.
- **Miscellaneous**: Changed the title in the redeem page and hid commit in `versionDetector`.

### Changed

- **Documentation & Config**: Updated API_URL in `.env.example`, added pull request template, and updated README.

## [1.1.5] - 2026-04-21

### Fixed

- **API Robustness**: Improved `checkStatus` and `checkSpinStatus` in `gacha.ts` to
  correctly handle subpaths by isolating the location segment.
- **Character Count Display**: Refactored the character catalog count in
  `history/index.vue` to use dynamic variables (`character_count` /
  `master_count`) instead of hardcoded or stale values.
- **Camera Loading Text**: Localized the "Memuat kamera..." text using the
  `$t('startingCamera')` translation key.

### Changed

- **Localization**: Updated translation files (`locales/*.json`) with improved
  phrasing for ticket scanning and camera initialization.
- **Dependencies**: Updated `pnpm-lock.yaml` to sync with the latest build
  environment.

## [1.1.4] - 2026-04-21

### Added

- **Backend Validation**: Integrated backend validation for gacha spin flow to
  ensure data integrity (PR #37).
- **Character Count Logic**: Updated total character count logic to synchronize
  with point display in the bottom bar.

### Fixed

- **Camera Infinite Loading**: Resolved an issue where the camera page could get
  stuck in a loading state (PR #38).
- **Status Checks**: Fixed various bugs related to gacha status checking and
  prize redemption.

### Added

- **Version Display**: Added text above the version display.

### Fixed

- **UI Improvements**: Changed text color to white, updated button label for exchanging prizes, removed pinch-to-zoom feature, and hid map on the prize exchange screen.
- **Gacha Machine**: Changed the machine to roulette and hid autoplay video.
- **Point & Display**: Fixed blank screen issue in point page, hid characters, and set point to 1 digit.
- **Optimization**: Fetched data only on the point page.

## [1.1.0] - 2026-04-21

### Added

- **Gacha Improvements**: Refactored gacha logic for better performance and
  reliability (PR #32).
- **Safe Refresh Flow**: Implemented state persistence during page refreshes in
  the gacha flow to prevent data loss.
- **UI Enhancements**: Added dynamic point formatting (x/4 format) and improved
  visibility logic for gacha results.
- **Camera Focus**: Implemented autofocus and zoom improvements for barcode
  scanning.

### Fixed

- **State Management**: Fixed issues where points were not immediately updated
  after a spin.
- **Redirection**: Fixed incorrect redirection after prize redemption (PR #29).
- **Loading States**: Improved visual feedback with better loading indicators
  (PR #27).
- **Mobile UI**: Fixed button overflow and navigation bar overlap issues.

## [1.0.4] - 2026-04-15

### Changed

- Stable release for the current deployment phase.
- Updated dependencies for Nuxt 3 compatibility.

---

_Last Updated: 2026-05-23_
