# SearchGoggles

A browser extension that filters search results with a single keystroke.

![Firefox](https://img.shields.io/badge/Firefox-Extension-FF7139?logo=firefox-browser&logoColor=white)
![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=google-chrome&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

## The Problem

You search for "best mechanical keyboards" and realize that only showing results from reddit would be more useful. But it takes a long time to type site:reddit.com into the search bar.

## The Solution

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Search "best mechanical keyboards"                          |
|  2. Press cmd-shift-E                                           │
│  3. Results filtered instantly                                  │
│     "best mechanical keyboards site:reddit.com"                 │
└─────────────────────────────────────────────────────────────────┘
```

Much faster, minimal friction. This has saved me a lot of time, and I hope it might help others too.

## Features

- Customizable keyboard shortcuts via popup UI
- Press-to-record shortcut capture
- Multiple shortcuts with different search terms
- Enable/disable individual shortcuts
- Edit and delete shortcuts (with undo support)
- Browser shortcut conflict warnings
- Real-time sync (changes apply immediately)

## Installation

### Browser Stores

- **Firefox Add-ons** - [Install from Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/searchgoggles/)
- **Chrome Web Store** - Coming soon

### Manual Installation

**Firefox:**
1. Clone this repository
2. Go to `about:debugging` → This Firefox → Load Temporary Add-on
3. Select `manifest.json`

**Chrome:**
1. Run `./build.sh` to generate the Chrome build
2. Go to `chrome://extensions` → Enable Developer mode → Load unpacked
3. Select the `dist/chrome` folder

## Usage

1. **Search** - Use Google, Bing, DuckDuckGo, or Yahoo as usual
2. **Filter** - Press cmd-shift-E to filter results to Reddit (or customize your own)
3. **Customize** - Click the extension icon to add shortcuts for other sites

## Example Shortcuts

| Shortcut | Adds to search | Use case |
|----------|----------------|----------|
| `⌥R` | `site:reddit.com` | Real user opinions |
| `⌥S` | `site:stackoverflow.com` | Programming answers |
| `⌥G` | `site:github.com` | Code and projects |
| `⌥H` | `site:news.ycombinator.com` | Tech discussions |

## Supported Search Engines

- Google
- Bing
- DuckDuckGo
- Yahoo

## Development

```bash
git clone git@github.com:timbeccue/searchgoggles.git
cd searchgoggles

# Build for both browsers
./build.sh

# Load in Firefox: about:debugging → Load Temporary Add-on → manifest.json
# Load in Chrome: chrome://extensions → Load unpacked → dist/chrome/
```

## License

MIT
