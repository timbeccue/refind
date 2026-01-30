/**
 * SearchGoggles - Background Script
 *
 * Handles:
 * - Initializing default shortcuts on extension install
 * - Message passing between content script and popup
 * - Storage operations for shortcuts
 */

// Default shortcuts configuration
const DEFAULT_SHORTCUTS = [
  {
    id: 1,
    keys: {
      ctrl: false,
      alt: false,
      shift: true,
      meta: true,
      key: 'e'
    },
    term: 'site:reddit.com',
    enabled: true
  }
];

/**
 * Initialize default settings when extension is installed
 */
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    try {
      // Set default shortcuts on fresh install
      await browser.storage.local.set({ shortcuts: DEFAULT_SHORTCUTS });
    } catch (error) {
      // Silently fail - defaults will be used on next getShortcuts call
    }
  }
});

/**
 * Handle messages from content script and popup
 */
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'getShortcuts':
      // Return shortcuts to content script or popup
      return handleGetShortcuts();

    case 'saveShortcuts':
      // Save shortcuts from popup
      return handleSaveShortcuts(message.shortcuts);

    default:
      return Promise.resolve({ success: false, error: 'Unknown action' });
  }
});

/**
 * Retrieve shortcuts from storage
 * @returns {Promise} Resolves with shortcuts array
 */
async function handleGetShortcuts() {
  try {
    const result = await browser.storage.local.get('shortcuts');
    // Return stored shortcuts or defaults if none exist
    const shortcuts = result.shortcuts || DEFAULT_SHORTCUTS;
    return { success: true, shortcuts };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Save shortcuts to storage
 * @param {Array} shortcuts - Array of shortcut objects to save
 * @returns {Promise} Resolves with success status
 */
async function handleSaveShortcuts(shortcuts) {
  try {
    // Validate shortcuts array
    if (!Array.isArray(shortcuts)) {
      throw new Error('Shortcuts must be an array');
    }

    // Validate each shortcut has required fields
    for (const shortcut of shortcuts) {
      if (typeof shortcut.id !== 'number') {
        throw new Error('Shortcut must have numeric id');
      }
      if (!shortcut.keys || typeof shortcut.keys !== 'object') {
        throw new Error('Shortcut must have keys object');
      }
      if (typeof shortcut.keys.key !== 'string' || !shortcut.keys.key) {
        throw new Error('Shortcut must have a key defined');
      }
      if (typeof shortcut.term !== 'string' || !shortcut.term.trim()) {
        throw new Error('Shortcut must have a non-empty term');
      }
      if (shortcut.term.length > 500) {
        throw new Error('Shortcut term must be 500 characters or less');
      }
      if (typeof shortcut.enabled !== 'boolean') {
        throw new Error('Shortcut must have boolean enabled field');
      }
    }

    await browser.storage.local.set({ shortcuts });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
