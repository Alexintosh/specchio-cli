#!/bin/bash
# Update Homebrew formula for a given version
# Usage: bash scripts/update-homebrew.sh <version> <arm64_sha256> <x64_sha256>

set -e

VERSION="$1"
ARM64_SHA="$2"
X64_SHA="$3"
TAP_DIR="/opt/homebrew/Library/Taps/alexintosh/homebrew-specchio"

if [ -z "$VERSION" ] || [ -z "$ARM64_SHA" ] || [ -z "$X64_SHA" ]; then
  echo "Usage: bash scripts/update-homebrew.sh <version> <arm64_sha256> <x64_sha256>"
  exit 1
fi

# Get tarball checksum
echo "Fetching tarball checksum for v${VERSION}..."
TARBALL_SHA=$(curl -fsSL "https://github.com/Alexintosh/specchio-cli/archive/refs/tags/v${VERSION}.tar.gz" | shasum -a 256 | awk '{print $1}')

if [ ! -d "$TAP_DIR" ]; then
  echo "Error: Homebrew tap not found at $TAP_DIR"
  echo "Run: brew tap Alexintosh/specchio"
  exit 1
fi

cd "$TAP_DIR"

cat > Formula/specchio.rb << FORMULA
# typed: true
# frozen_string_literal: true

class Specchio < Formula
  desc "Interactive setup CLI for Specchio iOS development environment"
  homepage "https://github.com/Alexintosh/specchio-cli"
  url "https://github.com/Alexintosh/specchio-cli/archive/refs/tags/v${VERSION}.tar.gz"
  sha256 "${TARBALL_SHA}"
  version "${VERSION}"
  license "MIT"

  def install
    arm64 = "https://github.com/Alexintosh/specchio-cli/releases/download/v#{version}/specchio-arm64"
    x64 = "https://github.com/Alexintosh/specchio-cli/releases/download/v#{version}/specchio-x64"

    if Hardware::CPU.arm?
      system "curl", "-fSL", "-o", "specchio-bin", arm64
    else
      system "curl", "-fSL", "-o", "specchio-bin", x64
    end

    chmod 0755, "specchio-bin"
    bin.install "specchio-bin" => "specchio"
  end

  test do
    assert_match "specchio v", shell_output("#{bin}/specchio --version")
  end
end
FORMULA

git add Formula/specchio.rb
git commit -m "chore: update formula for v${VERSION}" || echo "No changes to commit"
git push

echo "Homebrew formula updated for v${VERSION}"
