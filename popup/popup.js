// SearchGoggles Popup Script

// Cross-browser compatibility: Chrome uses 'chrome', Firefox uses 'browser'
if (typeof browser === 'undefined') {
  globalThis.browser = chrome;
}

(function () {
  'use strict';

  // DOM Elements
  const shortcutsList = document.getElementById('shortcuts-list');
  const emptyState = document.getElementById('empty-state');
  const addForm = document.getElementById('add-form');
  const addShortcutBtn = document.getElementById('add-shortcut-btn');
  const keyInput = document.getElementById('key-input');
  const clearKeysBtn = document.getElementById('clear-keys');
  const termInput = document.getElementById('term-input');
  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');

  // State
  let shortcuts = [];
  let editingId = null;
  let recordedKeys = null;
  let undoTimeout = null;
  let deletedShortcut = null;

  // Common browser shortcuts that may conflict
  // Format: { ctrl, alt, shift, meta, key } - meta is Cmd on Mac
  const BROWSER_SHORTCUTS = [
    // Tab/Window management
    { meta: true, key: 't', desc: 'New tab' },
    { ctrl: true, key: 't', desc: 'New tab' },
    { meta: true, key: 'w', desc: 'Close tab' },
    { ctrl: true, key: 'w', desc: 'Close tab' },
    { meta: true, key: 'n', desc: 'New window' },
    { ctrl: true, key: 'n', desc: 'New window' },
    { meta: true, shift: true, key: 't', desc: 'Reopen closed tab' },
    { ctrl: true, shift: true, key: 't', desc: 'Reopen closed tab' },
    { meta: true, shift: true, key: 'n', desc: 'New private window' },
    { ctrl: true, shift: true, key: 'n', desc: 'New private window' },
    { meta: true, shift: true, key: 'p', desc: 'New private window' },
    { ctrl: true, shift: true, key: 'p', desc: 'New private window' },
    // Navigation
    { meta: true, key: 'l', desc: 'Focus address bar' },
    { ctrl: true, key: 'l', desc: 'Focus address bar' },
    { meta: true, key: 'k', desc: 'Focus search bar' },
    { ctrl: true, key: 'k', desc: 'Focus search bar' },
    { meta: true, key: 'r', desc: 'Reload page' },
    { ctrl: true, key: 'r', desc: 'Reload page' },
    { meta: true, shift: true, key: 'r', desc: 'Hard reload' },
    { ctrl: true, shift: true, key: 'r', desc: 'Hard reload' },
    { key: 'F5', desc: 'Reload page' },
    // Bookmarks/History
    { meta: true, key: 'd', desc: 'Bookmark page' },
    { ctrl: true, key: 'd', desc: 'Bookmark page' },
    { meta: true, key: 'h', desc: 'History' },
    { ctrl: true, key: 'h', desc: 'History' },
    { meta: true, key: 'j', desc: 'Downloads' },
    { ctrl: true, key: 'j', desc: 'Downloads' },
    { meta: true, shift: true, key: 'b', desc: 'Bookmarks' },
    { ctrl: true, shift: true, key: 'b', desc: 'Bookmarks' },
    // Find
    { meta: true, key: 'f', desc: 'Find in page' },
    { ctrl: true, key: 'f', desc: 'Find in page' },
    { meta: true, key: 'g', desc: 'Find next' },
    { ctrl: true, key: 'g', desc: 'Find next' },
    // Page actions
    { meta: true, key: 'p', desc: 'Print' },
    { ctrl: true, key: 'p', desc: 'Print' },
    { meta: true, key: 's', desc: 'Save page' },
    { ctrl: true, key: 's', desc: 'Save page' },
    { meta: true, key: 'u', desc: 'View source' },
    { ctrl: true, key: 'u', desc: 'View source' },
    // Zoom
    { meta: true, key: '=', desc: 'Zoom in' },
    { ctrl: true, key: '=', desc: 'Zoom in' },
    { meta: true, key: '-', desc: 'Zoom out' },
    { ctrl: true, key: '-', desc: 'Zoom out' },
    { meta: true, key: '0', desc: 'Reset zoom' },
    { ctrl: true, key: '0', desc: 'Reset zoom' },
    // Dev tools
    { key: 'F12', desc: 'Developer tools' },
    { meta: true, alt: true, key: 'i', desc: 'Developer tools' },
    { ctrl: true, shift: true, key: 'i', desc: 'Developer tools' },
    { meta: true, alt: true, key: 'c', desc: 'Inspector' },
    { ctrl: true, shift: true, key: 'c', desc: 'Inspector' },
    { meta: true, alt: true, key: 'j', desc: 'Browser console' },
    { ctrl: true, shift: true, key: 'j', desc: 'Browser console' },
    // Misc
    { key: 'F11', desc: 'Fullscreen' },
    { meta: true, key: 'q', desc: 'Quit browser' },
    { meta: true, key: 'a', desc: 'Select all' },
    { ctrl: true, key: 'a', desc: 'Select all' },
    { meta: true, key: 'c', desc: 'Copy' },
    { ctrl: true, key: 'c', desc: 'Copy' },
    { meta: true, key: 'v', desc: 'Paste' },
    { ctrl: true, key: 'v', desc: 'Paste' },
    { meta: true, key: 'x', desc: 'Cut' },
    { ctrl: true, key: 'x', desc: 'Cut' },
    { meta: true, key: 'z', desc: 'Undo' },
    { ctrl: true, key: 'z', desc: 'Undo' },
  ];

  // Initialize
  init();

  async function init() {
    await loadShortcuts();
    render();
    setupEventListeners();
  }

  // Load shortcuts from background script
  async function loadShortcuts() {
    try {
      const response = await browser.runtime.sendMessage({ action: 'getShortcuts' });
      shortcuts = response.shortcuts || [];
    } catch (err) {
      shortcuts = [];
    }
  }

  // Save shortcuts to background script
  async function saveShortcuts() {
    try {
      const response = await browser.runtime.sendMessage({ action: 'saveShortcuts', shortcuts });
      if (!response.success) {
        showError(response.error || 'Failed to save');
      }
    } catch (err) {
      showError('Failed to save shortcuts');
    }
  }

  // Show error toast
  function showError(message) {
    // Remove existing error if any
    const existing = document.querySelector('.error-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }

  // Render the shortcuts list
  function render() {
    shortcutsList.innerHTML = '';

    if (shortcuts.length === 0) {
      emptyState.hidden = false;
      shortcutsList.hidden = true;
    } else {
      emptyState.hidden = true;
      shortcutsList.hidden = false;

      shortcuts.forEach(shortcut => {
        const item = createShortcutItem(shortcut);
        shortcutsList.appendChild(item);
      });
    }
  }

  // Create a shortcut list item
  function createShortcutItem(shortcut) {
    const item = document.createElement('div');
    item.className = 'shortcut-item' + (shortcut.enabled ? '' : ' disabled');
    item.dataset.id = shortcut.id;

    const keysDisplay = formatKeys(shortcut.keys);

    item.innerHTML = `
      <span class="shortcut-keys">${keysDisplay}</span>
      <span class="shortcut-term" title="${escapeHtml(shortcut.term)}">${escapeHtml(shortcut.term)}</span>
      <div class="shortcut-actions">
        <label class="toggle">
          <input type="checkbox" ${shortcut.enabled ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
        <button class="btn-delete" title="Delete">&times;</button>
      </div>
    `;

    // Toggle handler
    const toggle = item.querySelector('.toggle input');
    toggle.addEventListener('change', () => {
      shortcut.enabled = toggle.checked;
      item.classList.toggle('disabled', !shortcut.enabled);
      saveShortcuts();
    });

    // Delete handler
    const deleteBtn = item.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => {
      deleteShortcut(shortcut.id);
    });

    // Add click handler for editing (on the keys or term)
    const keysSpan = item.querySelector('.shortcut-keys');
    const termSpan = item.querySelector('.shortcut-term');
    keysSpan.style.cursor = 'pointer';
    termSpan.style.cursor = 'pointer';
    keysSpan.addEventListener('click', () => showAddForm(shortcut));
    termSpan.addEventListener('click', () => showAddForm(shortcut));

    return item;
  }

  // Format keys object to display string
  function formatKeys(keys) {
    const parts = [];
    if (keys.meta) parts.push('\u2318');
    if (keys.ctrl) parts.push('Ctrl');
    if (keys.alt) parts.push('Alt');
    if (keys.shift) parts.push('Shift');
    if (keys.key) parts.push(keys.key.toUpperCase());
    return parts.join('+') || 'None';
  }

  // Check if keys conflict with a browser shortcut
  function checkBrowserConflict(keys) {
    for (const shortcut of BROWSER_SHORTCUTS) {
      const metaMatch = !!shortcut.meta === !!keys.meta;
      const ctrlMatch = !!shortcut.ctrl === !!keys.ctrl;
      const altMatch = !!shortcut.alt === !!keys.alt;
      const shiftMatch = !!shortcut.shift === !!keys.shift;
      const keyMatch = shortcut.key.toLowerCase() === keys.key.toLowerCase();

      if (metaMatch && ctrlMatch && altMatch && shiftMatch && keyMatch) {
        return shortcut.desc;
      }
    }
    return null;
  }

  // Show or hide the conflict warning
  function updateConflictWarning(keys) {
    let warning = document.getElementById('conflict-warning');

    if (!keys) {
      if (warning) warning.hidden = true;
      return;
    }

    const conflict = checkBrowserConflict(keys);

    if (conflict) {
      if (!warning) {
        warning = document.createElement('div');
        warning.id = 'conflict-warning';
        warning.className = 'conflict-warning';
        // Insert after the key input form group
        const keyFormGroup = keyInput.closest('.form-group');
        keyFormGroup.appendChild(warning);
      }
      warning.innerHTML = `⚠️ This conflicts with "<strong>${escapeHtml(conflict)}</strong>"`;
      warning.hidden = false;
    } else if (warning) {
      warning.hidden = true;
    }
  }

  // Delete a shortcut with undo
  function deleteShortcut(id) {
    const index = shortcuts.findIndex(s => s.id === id);
    if (index === -1) return;

    deletedShortcut = { shortcut: shortcuts[index], index };
    shortcuts.splice(index, 1);
    saveShortcuts();
    render();
    showUndoToast();
  }

  // Show undo toast
  function showUndoToast() {
    // Remove existing toast if any
    const existingToast = document.querySelector('.undo-toast');
    if (existingToast) {
      existingToast.remove();
      clearTimeout(undoTimeout);
    }

    const toast = document.createElement('div');
    toast.className = 'undo-toast';
    toast.innerHTML = `
      <span>Shortcut deleted</span>
      <button>Undo</button>
    `;

    toast.querySelector('button').addEventListener('click', () => {
      if (deletedShortcut) {
        shortcuts.splice(deletedShortcut.index, 0, deletedShortcut.shortcut);
        deletedShortcut = null;
        saveShortcuts();
        render();
      }
      toast.remove();
      clearTimeout(undoTimeout);
    });

    document.body.appendChild(toast);

    undoTimeout = setTimeout(() => {
      toast.remove();
      deletedShortcut = null;
    }, 5000);
  }

  // Setup event listeners
  function setupEventListeners() {
    // Add shortcut button
    addShortcutBtn.addEventListener('click', () => {
      showAddForm();
    });

    // Cancel button
    cancelBtn.addEventListener('click', () => {
      hideAddForm();
    });

    // Save button
    saveBtn.addEventListener('click', () => {
      saveNewShortcut();
    });

    // Clear keys button
    clearKeysBtn.addEventListener('click', () => {
      recordedKeys = null;
      keyInput.value = '';
      keyInput.classList.remove('recording');
      updateConflictWarning(null);
    });

    // Key input - record keypress
    keyInput.addEventListener('focus', () => {
      keyInput.classList.add('recording');
      keyInput.placeholder = 'Press keys now...';
    });

    keyInput.addEventListener('blur', () => {
      keyInput.classList.remove('recording');
      keyInput.placeholder = 'Click and press keys...';
    });

    keyInput.addEventListener('keydown', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Ignore modifier-only keypresses
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        return;
      }

      recordedKeys = {
        ctrl: e.ctrlKey,
        alt: e.altKey,
        shift: e.shiftKey,
        meta: e.metaKey,
        key: e.key.length === 1 ? e.key.toLowerCase() : e.key
      };

      keyInput.value = formatKeys(recordedKeys);
      updateConflictWarning(recordedKeys);
    });

    // Allow Enter to save from term input
    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveNewShortcut();
      }
    });
  }

  // Show add form
  function showAddForm(shortcut = null) {
    editingId = shortcut ? shortcut.id : null;
    recordedKeys = shortcut ? { ...shortcut.keys } : null;

    keyInput.value = shortcut ? formatKeys(shortcut.keys) : '';
    termInput.value = shortcut ? shortcut.term : '';
    saveBtn.textContent = shortcut ? 'Update' : 'Save';

    addForm.hidden = false;
    addShortcutBtn.hidden = true;

    // Check for conflicts when editing existing shortcut
    updateConflictWarning(recordedKeys);

    termInput.focus();
  }

  // Hide add form
  function hideAddForm() {
    addForm.hidden = true;
    addShortcutBtn.hidden = false;
    editingId = null;
    recordedKeys = null;
    keyInput.value = '';
    termInput.value = '';
    saveBtn.textContent = 'Save';
    updateConflictWarning(null);
  }

  // Save new or edited shortcut
  function saveNewShortcut() {
    if (!recordedKeys || !recordedKeys.key) {
      keyInput.focus();
      return;
    }

    const term = termInput.value.trim();
    if (!term) {
      termInput.focus();
      return;
    }

    if (editingId !== null) {
      // Edit existing
      const shortcut = shortcuts.find(s => s.id === editingId);
      if (shortcut) {
        shortcut.keys = { ...recordedKeys };
        shortcut.term = term;
      }
    } else {
      // Add new
      const newId = shortcuts.length > 0
        ? Math.max(...shortcuts.map(s => s.id)) + 1
        : 1;

      shortcuts.push({
        id: newId,
        keys: { ...recordedKeys },
        term: term,
        enabled: true
      });
    }

    saveShortcuts();
    hideAddForm();
    render();
  }

  // Escape HTML for safe display
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
