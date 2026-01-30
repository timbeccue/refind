# SearchGoggles

Put on your search goggles - a browser extension that adds keyboard shortcuts to narrow your search results. Focus your search vision and filter results instantly without retyping queries.

![Firefox](https://img.shields.io/badge/Firefox-Extension-FF7139?logo=firefox-browser&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

## Features

- Customizable keyboard shortcuts via popup UI
- Press-to-record shortcut capture
- Multiple shortcuts with different search terms
- Enable/disable individual shortcuts
- Edit and delete shortcuts (with undo support)
- Browser shortcut conflict warnings
- Real-time sync (changes apply immediately)

## Installation

### Firefox Add-ons

Coming soon to Firefox Add-ons.

### Manual Installation

1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on..."
5. Select the `manifest.json` file from this extension's directory

## Usage

1. Perform a search on any supported search engine
2. Press the keyboard shortcut (default: `Cmd+Shift+E` on macOS, `Ctrl+Shift+E` on Windows/Linux)
3. Your search query will be updated with the configured search term appended

To customize shortcuts, click the SearchGoggles extension icon in your toolbar.

## Default Shortcut

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+E` (macOS) / `Ctrl+Shift+E` (Windows/Linux) | Append `site:reddit.com` to search |

## Supported Search Engines

- Google
- Bing
- DuckDuckGo
- Yahoo

## Development

1. Clone the repository:
   ```bash
   git clone git@github.com:timbeccue/searchgoggles.git
   cd searchgoggles
   ```

2. Load the extension in Firefox:
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on..."
   - Select the `manifest.json` file

3. Make changes and reload the extension to test

## License

MIT
