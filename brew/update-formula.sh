#!/bin/bash

# Script to build binaries, generate checksums, and update the Homebrew formula

set -e

VERSION=${1:-"1.0.0"}
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CLI_DIR="$REPO_ROOT/cli"
BREW_DIR="$CLI_DIR/brew"

echo "Building Specchio Setup CLI v$VERSION"
echo "====================================="

# Navigate to CLI directory
cd "$CLI_DIR"

# Build for ARM64
echo "Building for ARM64 (Apple Silicon)..."
bun build --compile --target=bun-darwin-arm64 --outfile specchio-arm64 src/index.ts

# Build for x64
echo "Building for x64 (Intel)..."
bun build --compile --target=bun-darwin-x64 --outfile specchio-x64 src/index.ts

# Generate SHA256 checksums
echo ""
echo "Generating SHA256 checksums..."
ARM64_SHA256=$(shasum -a 256 specchio-arm64 | awk '{print $1}')
X64_SHA256=$(shasum -a 256 specchio-x64 | awk '{print $1}')

echo "ARM64 SHA256: $ARM64_SHA256"
echo "x64 SHA256:   $X64_SHA256"

# Update the formula
echo ""
echo "Updating Homebrew formula..."
sed -i.bak "s/REPLACE_ARM64_SHA256/$ARM64_SHA256/g" "$BREW_DIR/specchio.rb"
sed -i.bak "s/REPLACE_X86_64_SHA256/$X64_SHA256/g" "$BREW_DIR/specchio.rb"

# Clean up backup
rm -f "$BREW_DIR/specchio.rb.bak"

echo ""
echo "✓ Build complete!"
echo "Binaries are in: $CLI_DIR"
echo "  - specchio-arm64"
echo "  - specchio-x64"
echo ""
echo "Next steps:"
echo "1. Upload the binaries to GitHub Releases"
echo "2. Test the formula: brew install --build-from-source $BREW_DIR/specchio.rb"
echo "3. Commit and push the updated formula"
