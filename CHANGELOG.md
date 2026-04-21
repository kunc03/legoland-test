# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-04-21
### Added
- **Backend Validation**: Integrated backend validation for gacha spin flow to ensure data integrity (PR #37).
- **Character Count Logic**: Updated total character count logic to synchronize with point display in the bottom bar.

### Fixed
- **Camera Infinite Loading**: Resolved an issue where the camera page could get stuck in a loading state (PR #38).
- **Status Checks**: Fixed various bugs related to gacha status checking and prize redemption.

## [1.1.0] - 2026-04-21
### Added
- **Gacha Improvements**: Refactored gacha logic for better performance and reliability (PR #32).
- **Safe Refresh Flow**: Implemented state persistence during page refreshes in the gacha flow to prevent data loss.
- **UI Enhancements**: Added dynamic point formatting (x/4 format) and improved visibility logic for gacha results.
- **Camera Focus**: Implemented autofocus and zoom improvements for barcode scanning.

### Fixed
- **State Management**: Fixed issues where points were not immediately updated after a spin.
- **Redirection**: Fixed incorrect redirection after prize redemption (PR #29).
- **Loading States**: Improved visual feedback with better loading indicators (PR #27).
- **Mobile UI**: Fixed button overflow and navigation bar overlap issues.

## [1.0.4] - 2026-04-15
### Changed
- Stable release for the current deployment phase.
- Updated dependencies for Nuxt 3 compatibility.

---
*Last Updated: 2026-04-21*
