# SearchGoggles - Browser Extension

A Firefox extension for creating keyboard shortcuts that refine search queries across search engines.

## What It Does

Users press a keyboard shortcut (e.g., `⌥R`) while on a search results page, and the extension appends a predefined term (e.g., `site:reddit.com`) to their query—instantly refining results without retyping.

## Architecture

```
manifest.json          Extension config (Manifest v2)
background.js          Message broker, storage, validation
content.js             Keyboard handling, URL manipulation
popup/
  popup.html           UI structure
  popup.js             State management, rendering
  popup.css            Styling with CSS variables
```

**Data Flow:**
```
Popup UI → browser.runtime.sendMessage → background.js → browser.storage.local
                                                              ↓
Content Script ← browser.storage.onChanged ← storage update
```

## Design Principles

### Minimalism
- No frameworks, no build step—vanilla JavaScript only
- Single-purpose: keyboard shortcuts for search refinement
- Lightweight popup with immediate mode rendering

### User Control
- Every shortcut is fully customizable (modifiers, key, term)
- Conflict warnings for 99+ browser shortcuts
- 5-second undo window for deleted shortcuts
- Toggle individual shortcuts on/off

### Performance
- Content script scoped to search engine URLs only
- Storage caching prevents redundant reads
- Capture-phase event listeners for reliable interception

## Styling Guidelines

### Popup CSS
- **8px spacing grid** for consistent layout
- **Primary blue:** `#4a90d9`
- **System fonts:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`
- **Focus states:** Always use `box-shadow` for keyboard navigation visibility
- **Component patterns:** Toggle switches, conflict warnings (#fff3cd), toast notifications

### Homepage (docs/index.html)
- CSS variables for dark mode (`prefers-color-scheme`)
- Inline SVG icons for scalability
- CSS Grid for features, Flexbox for navigation

## Code Patterns

### DOM Safety
- Use `textContent` for user-provided content (never `innerHTML`)
- `escapeHtml()` and `escapeRegex()` utilities exist—use them
- HTML escaping required for tooltip content

### Validation (background.js)
All shortcuts validated before storage:
- `id`: required, numeric
- `keys`: required object with modifier flags
- `term`: required string, max 500 chars
- `enabled`: required boolean

### Keyboard Matching (content.js)
- Exact modifier matching (ctrlKey, shiftKey, altKey, metaKey)
- Case-insensitive key comparison
- Duplicate term prevention via regex

## Supported Search Engines

Google, Bing, DuckDuckGo, Yahoo

Detection via URL patterns in `content.js` → `detectSearchEngine()`

## Key Implementation Details

| Component | File | Key Function |
|-----------|------|--------------|
| Shortcut storage | background.js | `handleSaveShortcuts()` |
| Key recording | popup.js | `startRecording()` |
| Query modification | content.js | `appendToSearch()` |
| Engine detection | content.js | `detectSearchEngine()` |
| Conflict check | popup.js | `COMMON_BROWSER_SHORTCUTS` |

## Development

```bash
# Load in Firefox
about:debugging → This Firefox → Load Temporary Add-on → manifest.json

# No build step required
```

## Do Not

- Add external dependencies without strong justification
- Use `innerHTML` with user content
- Skip validation in background.js
- Add shortcuts that conflict with browser defaults without warning
- Commit .env files or secrets
