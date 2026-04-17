# Release Automation Scripts

This directory contains automation scripts for releasing the Specchio Setup CLI.

## Scripts

### `build-all.sh`
Builds standalone binaries for both ARM64 and x86_64 architectures.

**Features:**
- Cleans previous builds
- Builds for ARM64 (Apple Silicon)
- Builds for x86_64 (Intel)
- Generates SHA256 checksums
- Shows build summary with file sizes and checksums

**Usage:**
```bash
bash scripts/build-all.sh
# or
bun run build:all
```

**Output:**
- `specchio-arm64` - ARM64 binary
- `specchio-x64` - x86_64 binary
- `specchio-arm64.sha256` - ARM64 checksum
- `specchio-x64.sha256` - x86_64 checksum

---

### `test-release.sh`
Tests the built binary to ensure it works correctly.

**Features:**
- Tests binary is executable
- Tests version flag
- Tests help flag
- Tests all major commands (check, doctor, verify)
- Tests verbose flag
- Tests invalid command handling
- Tests specific check commands
- Shows version information

**Usage:**
```bash
bash scripts/test-release.sh
# or
bun run test:release
```

**Requirements:**
- Binaries must be built first (run `build-all.sh` or `bun run build:all`)

---

### `release.sh`
Automates the complete release process.

**Features:**
- Updates version in `package.json`
- Updates VERSION constant in `src/index.ts`
- Builds all binaries
- Generates checksums
- Creates git tag
- Shows next steps for GitHub release

**Usage:**
```bash
bash scripts/release.sh
# or
bun run release
```

**Process:**
1. Prompts for new version (defaults to current version)
2. Confirms release
3. Updates version in `package.json` and `src/index.ts`
4. Builds all binaries
5. Generates checksums
6. Creates git commit and tag
7. Shows instructions for GitHub release

**Requirements:**
- Clean git working directory (no uncommitted changes)
- Valid semantic version format (e.g., 1.2.3)

---

## Complete Release Workflow

### 1. Build and Test
```bash
# Build all binaries
bun run build:all

# Test the binaries
bun run test:release
```

### 2. Create Release
```bash
# This will:
# - Update version
# - Build binaries
# - Create git tag
# - Show next steps
bun run release
```

### 3. Push to GitHub
```bash
# Push the commit and tag
git push origin main
git push origin v1.0.0  # Use your version
```

### 4. Create GitHub Release
1. Go to https://github.com/Alexintosh/specchio/releases
2. Click "Draft a new release"
3. Select the tag you just pushed
4. Upload the binaries and checksums:
   - `specchio-arm64`
   - `specchio-x64`
   - `specchio-arm64.sha256`
   - `specchio-x64.sha256`
5. Add release notes
6. Publish the release

### 5. Update Homebrew Formula
Update the Homebrew formula with the new version and checksums:
https://github.com/Alexintosh/homebrew-specchio

---

## Development

### Making Scripts Executable
The scripts should already be executable. If not:
```bash
chmod +x scripts/*.sh
```

### Testing Scripts
Test each script individually:
```bash
bash scripts/build-all.sh
bash scripts/test-release.sh
```

### Script Requirements
- `bash` shell
- `bun` runtime (for building)
- `git` (for release script)
- `shasum` (for checksums)

---

## Error Handling

All scripts include:
- `set -e` - Exit on error
- Color-coded output (green for success, red for errors, blue for info)
- Validation of prerequisites
- Clear error messages

---

## Version Bumping

The release script supports semantic versioning:
- `1.0.0` - Major release (breaking changes)
- `1.1.0` - Minor release (new features)
- `1.1.1` - Patch release (bug fixes)

Always follow semantic versioning principles:
- MAJOR: Incompatible API changes
- MINOR: Backwards-compatible functionality additions
- PATCH: Backwards-compatible bug fixes
