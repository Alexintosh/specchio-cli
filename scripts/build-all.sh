#!/bin/bash

# Specchio Setup CLI - Build All Binaries
# This script builds standalone binaries for both ARM64 and x86_64 architectures

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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the CLI directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the CLI directory."
    exit 1
fi

# Get version
VERSION=$(node -p "require('./package.json').version")
print_info "Building Specchio Setup CLI v$VERSION"
echo ""

# Clean previous builds
print_info "Cleaning previous builds..."
rm -f specchio-setup-arm64 specchio-setup-x64 *.sha256
print_success "Clean complete"

# Build for ARM64 (Apple Silicon)
print_info "Building for ARM64 (Apple Silicon)..."
bun build --compile --target=bun-darwin-arm64 --outfile specchio-setup-arm64 src/index.ts
chmod +x specchio-setup-arm64
print_success "ARM64 binary built: specchio-setup-arm64"

# Build for x86_64 (Intel)
print_info "Building for x86_64 (Intel)..."
bun build --compile --target=bun-darwin-x64 --outfile specchio-setup-x64 src/index.ts
chmod +x specchio-setup-x64
print_success "x86_64 binary built: specchio-setup-x64"

# Generate checksums
print_info "Generating SHA256 checksums..."
shasum -a 256 specchio-setup-arm64 > specchio-setup-arm64.sha256
shasum -a 256 specchio-setup-x64 > specchio-setup-x64.sha256
print_success "Checksums generated"

# Display build summary
echo ""
echo "=== Build Summary ==="
echo ""
echo "Binaries:"
ls -lh specchio-setup-arm64 specchio-setup-x64 | awk '{print "  " $9 " - " $5}'
echo ""
echo "Checksums:"
echo "  ARM64: $(cat specchio-setup-arm64.sha256 | awk '{print $1}')"
echo "  x64:   $(cat specchio-setup-x64.sha256 | awk '{print $1}')"
echo ""
print_success "All builds completed successfully!"
