# Founder Notes — v0.4.1 Release Candidate

## What improved

- The app now has explicit horizontal-overflow protection from the document level down to cards, calendar cells, dialogs and the bottom navigation.
- Small phone layouts were tightened without changing the visual identity; desktop receives additional breathing room.
- Tap feedback, focus states and input handling are more reliable and accessible.
- The code that restores and saves user data is clearer and more defensive.
- The offline cache is versioned and cleans up older Orchidaceae caches after an update.

## Bugs fixed

- Potential horizontal scrolling from wide ambient visuals, fixed navigation, long labels and calendar cells.
- A malformed LocalStorage value could previously stop the whole app during startup; it now falls back safely to local defaults.
- The old service worker cache did not include the Release Candidate stylesheet and did not remove stale caches.

## Technical decisions

- Added a small `release-candidate.css` layer instead of rewriting successful Phase 4 styles. This keeps the release focused, reviewable and low-risk.
- Retained the existing `orchidaceae.phase4` storage key so an existing user’s data continues to load.
- Used CSS-first responsiveness and touch feedback to avoid adding dependencies or runtime cost.

## Trade-offs

- The browser test surface was unavailable in this environment, so the release was verified through static packaging and targeted responsive safeguards rather than a live device session.
- Horizontal overflow is clipped intentionally. All interactive content remains within the visible layout rather than relying on the clipping to hide needed controls.

## Remaining issues

- A true PWA install/offline test requires serving the app over HTTPS or localhost; opening `index.html` directly does not activate a service worker in most browsers.
- Cycle estimates remain informational only and should never be used for medical or contraception decisions.

## Recommendation

Have the Founder and his wife test this build first on the smallest iPhone and Android phones available, then install it through their browsers. If the experience is approved, the next sprint can begin the Health Tracking module without revisiting the foundation.
