/**
 * Refind - Content Script
 *
 * Runs on supported search engine pages and listens for keyboard shortcuts.
 * When a configured shortcut is detected, appends the associated term
 * to the current search query and reloads the page.
 *
 * Supported search engines:
 * - Google (google.com/search?q=)
 * - Bing (bing.com/search?q=)
 * - DuckDuckGo (duckduckgo.com/?q=)
 * - Yahoo (search.yahoo.com/search?p=)
 */

// Store shortcuts fetched from background script
let shortcuts = [];

/**
 * Escape special regex characters in a string
 * @param {string} str - The string to escape
 * @returns {string} The escaped string safe for use in a regex
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Search engine configurations
 * Each engine has a pattern to match and query parameter name
 */
const SEARCH_ENGINES = {
  google: {
    pattern: /^https?:\/\/(www\.)?google\.[a-z.]+\/search/i,
    queryParam: 'q'
  },
  bing: {
    pattern: /^https?:\/\/(www\.)?bing\.com\/search/i,
    queryParam: 'q'
  },
  duckduckgo: {
    pattern: /^https?:\/\/(www\.)?duckduckgo\.com\//i,
    queryParam: 'q'
  },
  yahoo: {
    pattern: /^https?:\/\/search\.yahoo\.com\/search/i,
    queryParam: 'p'
  }
};

/**
 * Detect which search engine we're on based on current URL
 * @returns {Object|null} Search engine config or null if not on a supported engine
 */
function detectSearchEngine() {
  const url = window.location.href;

  for (const [name, config] of Object.entries(SEARCH_ENGINES)) {
    if (config.pattern.test(url)) {
      return { name, ...config };
    }
  }

  return null;
}

/**
 * Get the current search query from the URL
 * @param {string} queryParam - The URL parameter name for the search query
 * @returns {Object} Object with query string and whether it was found in hash
 */
function getCurrentQuery(queryParam) {
  // Check regular query params first
  let urlParams = new URLSearchParams(window.location.search);
  let query = urlParams.get(queryParam);

  // If not found, check hash params (some sites like DDG use these)
  if (!query && window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    query = hashParams.get(queryParam);
    if (query) {
      return { query, fromHash: true };
    }
  }

  return { query: query || '', fromHash: false };
}

/**
 * Append term to search query and reload the page
 * @param {string} queryParam - The URL parameter name for the search query
 * @param {string} term - The term to append (e.g., "site:reddit.com")
 */
function appendTermAndReload(queryParam, term) {
  const { query: currentQuery, fromHash } = getCurrentQuery(queryParam);

  // Don't add if the term is already in the query (as a complete phrase, not substring)
  const termRegex = new RegExp('(^|\\s)' + escapeRegex(term) + '(\\s|$)', 'i');
  if (termRegex.test(currentQuery)) {
    return;
  }

  // Build new query with appended term
  const newQuery = `${currentQuery} ${term}`.trim();

  // Update URL with new query
  const url = new URL(window.location.href);

  if (fromHash) {
    // Query was in hash params, update the hash
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    hashParams.set(queryParam, newQuery);
    url.hash = hashParams.toString();
  } else {
    // Query was in regular params, update search params
    url.searchParams.set(queryParam, newQuery);
  }

  // Navigate to the new URL
  window.location.href = url.toString();
}

/**
 * Check if a keyboard event matches a shortcut's key configuration
 * @param {KeyboardEvent} event - The keyboard event
 * @param {Object} keys - The shortcut's key configuration
 * @returns {boolean} True if the event matches the shortcut
 */
function matchesShortcut(event, keys) {
  // Check all modifier keys
  const ctrlMatch = event.ctrlKey === keys.ctrl;
  const altMatch = event.altKey === keys.alt;
  const shiftMatch = event.shiftKey === keys.shift;
  const metaMatch = event.metaKey === keys.meta;

  // Check the main key (case-insensitive)
  const keyMatch = event.key.toLowerCase() === keys.key.toLowerCase();

  return ctrlMatch && altMatch && shiftMatch && metaMatch && keyMatch;
}

/**
 * Handle keydown events and check against configured shortcuts
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeydown(event) {
  // Skip if user is typing in an input field
  const activeElement = document.activeElement;
  const isInputField =
    activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.isContentEditable;

  // Allow shortcuts even in search input, but not in other inputs
  // Check if it's the main search input by looking for common search input names
  const isSearchInput =
    isInputField &&
    (activeElement.name === 'q' ||
      activeElement.name === 'p' ||
      activeElement.getAttribute('aria-label')?.toLowerCase().includes('search'));

  // Skip if in a non-search input field
  if (isInputField && !isSearchInput) {
    return;
  }

  // Check each enabled shortcut
  for (const shortcut of shortcuts) {
    if (!shortcut.enabled) continue;

    if (matchesShortcut(event, shortcut.keys)) {
      // Detect current search engine
      const engine = detectSearchEngine();

      if (engine) {
        // Prevent default browser behavior
        event.preventDefault();
        event.stopPropagation();

        // Append term and reload
        appendTermAndReload(engine.queryParam, shortcut.term);
        return;
      }
    }
  }
}

/**
 * Fetch shortcuts from background script and set up event listener
 */
async function initialize() {
  try {
    // Request shortcuts from background script
    const response = await browser.runtime.sendMessage({ action: 'getShortcuts' });

    if (response.success) {
      shortcuts = response.shortcuts;
      // Set up keyboard event listener
      document.addEventListener('keydown', handleKeydown, true);
    }
  } catch (error) {
    // Silently fail - extension won't work but page remains functional
  }
}

// Initialize when the script loads
initialize();

// Listen for storage changes to update shortcuts in real-time
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.shortcuts) {
    shortcuts = changes.shortcuts.newValue || [];
  }
});
