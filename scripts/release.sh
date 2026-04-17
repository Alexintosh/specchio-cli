#!/bin/bash

# Specchio Setup CLI - Release Script
# This script automates the release process:
# - Updates version in package.json
# - Builds standalone binaries for ARM64 and x86_64
# - Generates SHA256 checksums
# - Creates a git tag
# - Shows commands to push to GitHub

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

confirm() {
    read -p "$1 (y/n) " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

# Check if we're in the CLI directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the CLI directory."
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_info "Current version: $CURRENT_VERSION"

# Prompt for new version
read -p "Enter new version (default: $CURRENT_VERSION): " NEW_VERSION
if [ -z "$NEW_VERSION" ]; then
    NEW_VERSION="$CURRENT_VERSION"
fi

# Validate version format
if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    print_error "Invalid version format. Use semantic versioning (e.g., 1.2.3)"
    exit 1
fi

print_info "New version will be: $NEW_VERSION"

# Confirm release
if ! confirm "Proceed with release $NEW_VERSION?"; then
    print_info "Release cancelled."
    exit 0
fi

# Step 1: Update version in package.json
print_info "Step 1: Updating version in package.json..."
npm version "$NEW_VERSION" --no-git-tag-version
print_success "Version updated to $NEW_VERSION"

# Step 2: Update VERSION constant in src/index.ts
print_info "Step 2: Updating VERSION constant in src/index.ts..."
sed -i.bak "s/const VERSION = '[^']*'/const VERSION = '$NEW_VERSION'/" src/index.ts
rm -f src/index.ts.bak
print_success "VERSION constant updated"

# Step 3: Build binaries
print_info "Step 3: Building binaries..."
if ! bash scripts/build-all.sh; then
    print_error "Build failed. Please fix the errors and try again."
    exit 1
fi
print_success "All binaries built successfully"

# Step 4: Generate checksums
print_info "Step 4: Generating SHA256 checksums..."
shasum -a 256 specchio-arm64 > specchio-arm64.sha256
shasum -a 256 specchio-x64 > specchio-x64.sha256
print_success "Checksums generated"

# Step 5: Create git tag
print_info "Step 5: Creating git tag..."
TAG_NAME="v$NEW_VERSION"
git add package.json src/index.ts
git commit -m "Release $NEW_VERSION"
git tag -a "$TAG_NAME" -m "Release $NEW_VERSION"
print_success "Git tag $TAG_NAME created"

# Step 6: Show next steps
print_info "Step 6: Next steps..."
echo ""
echo "=== Release $NEW_VERSION is ready! ==="
echo ""
echo "Built binaries:"
echo "  - specchio-arm64"
echo "  - specchio-x64"
echo ""
echo "Checksums:"
echo "  - specchio-arm64.sha256"
echo "  - specchio-x64.sha256"
echo ""
echo "Git changes:"
echo "  - Commit created with version bump"
echo "  - Tag created: $TAG_NAME"
echo ""
echo "To push to GitHub, run:"
echo ""
echo "  git push origin main"
echo "  git push origin $TAG_NAME"
echo ""
echo "Then create a GitHub release with the following assets:"
echo "  - specchio-arm64"
echo "  - specchio-x64"
echo "  - specchio-arm64.sha256"
echo "  - specchio-x64.sha256"
echo ""
echo "Don't forget to update the Homebrew formula:"
echo "  https://github.com/Alexintosh/homebrew-specchio"
echo ""
print_success "Release preparation complete!"
