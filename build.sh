#!/bin/bash
# Build script for SearchGoggles browser extension
# Creates distribution packages for Firefox and Chrome

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Clean previous builds
rm -rf dist
mkdir -p dist/firefox dist/chrome

# Files to include in the extension
FILES=(
  "manifest.json"
  "background.js"
  "content.js"
  "popup/popup.html"
  "popup/popup.css"
  "popup/popup.js"
  "icons/icon-16.png"
  "icons/icon-48.png"
  "icons/icon-128.png"
)

echo "Building Firefox extension..."
# Copy files to Firefox dist
for file in "${FILES[@]}"; do
  dir=$(dirname "dist/firefox/$file")
  mkdir -p "$dir"
  cp "$file" "dist/firefox/$file"
done

# Create Firefox zip
cd dist/firefox
zip -r ../searchgoggles-firefox.zip . -q
cd "$SCRIPT_DIR"
echo "  Created: dist/searchgoggles-firefox.zip"

echo "Building Chrome extension..."
# Copy files to Chrome dist (excluding Firefox manifest)
for file in "${FILES[@]}"; do
  if [ "$file" != "manifest.json" ]; then
    dir=$(dirname "dist/chrome/$file")
    mkdir -p "$dir"
    cp "$file" "dist/chrome/$file"
  fi
done

# Use Chrome-specific manifest
cp manifest.chrome.json dist/chrome/manifest.json

# Create Chrome zip
cd dist/chrome
zip -r ../searchgoggles-chrome.zip . -q
cd "$SCRIPT_DIR"
echo "  Created: dist/searchgoggles-chrome.zip"

echo ""
echo "Build complete!"
echo ""
echo "Firefox: dist/searchgoggles-firefox.zip"
echo "Chrome:  dist/searchgoggles-chrome.zip"
echo ""
echo "To test locally:"
echo "  Firefox: about:debugging → Load Temporary Add-on → dist/firefox/manifest.json"
echo "  Chrome:  chrome://extensions → Load unpacked → dist/chrome/"
