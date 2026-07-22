# Changelog

## v0.4.1 — Release Candidate

### Stability and responsiveness

- Added a dedicated viewport hardening layer to prevent horizontal scrolling across Home, Calendar, Garden, Journal and Settings.
- Added small-screen safeguards for 320 px mobile viewports and more spacious desktop limits.
- Prevented long labels, calendar cells, dialogs and navigation content from forcing layouts wider than the screen.
- Improved touch targets, keyboard focus visibility and active-state feedback.

### Reliability and performance

- Simplified and documented the application state flow.
- Added safe LocalStorage loading: corrupted or unavailable storage no longer prevents startup.
- Preserved theme, journal, mood, water and cycle persistence under the established local key.
- Updated the service worker cache list, cache versioning and old-cache cleanup for reliable offline releases.

### Product continuity

- Preserved the Phase 4 Home hierarchy, Garden atmosphere, local cycle forecast, calendar, Journal and themes.
- Added no major product features.
