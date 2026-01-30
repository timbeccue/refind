#!/bin/bash
# Build script for SearchGoggles browser extension
# Creates separate distributions for Firefox and Chrome

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"

# Clean previous builds
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR/firefox" "$DIST_DIR/chrome"

# Shared files to copy
FILES=(
    "background.js"
    "content.js"
    "popup/popup.html"
    "popup/popup.js"
    "popup/popup.css"
    "icons/icon-16.png"
    "icons/icon-48.png"
    "icons/icon-128.png"
)

# Create directory structure
mkdir -p "$DIST_DIR/firefox/popup" "$DIST_DIR/firefox/icons"
mkdir -p "$DIST_DIR/chrome/popup" "$DIST_DIR/chrome/icons"

# Copy shared files to both distributions
for file in "${FILES[@]}"; do
    cp "$SCRIPT_DIR/$file" "$DIST_DIR/firefox/$file"
    cp "$SCRIPT_DIR/$file" "$DIST_DIR/chrome/$file"
done

# Copy browser-specific manifests
cp "$SCRIPT_DIR/manifest.json" "$DIST_DIR/firefox/manifest.json"
cp "$SCRIPT_DIR/manifest.chrome.json" "$DIST_DIR/chrome/manifest.json"

echo "Build complete:"
echo "  Firefox: $DIST_DIR/firefox/"
echo "  Chrome:  $DIST_DIR/chrome/"
