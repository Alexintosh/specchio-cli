# Homebrew Formula for Specchio Setup

This directory contains the Homebrew formula for distributing the `specchio-setup` CLI.

## Files

- `specchio-setup.rb` - The Homebrew formula definition
- `update-formula.sh` - Helper script to build binaries and update checksums

## Creating a New Release

### 1. Build and Update Checksums

Run the update script from the brew directory:

```bash
./update-formula.sh [version]
```

This will:
- Build binaries for both ARM64 and x86_64 architectures
- Generate SHA256 checksums
- Update the formula with the new checksums

### 2. Create GitHub Release

1. Go to the [GitHub Releases page](https://github.com/Alexintosh/specchio/releases)
2. Create a new release with tag `v{version}`
3. Upload the binaries:
   - `specchio-setup-arm64`
   - `specchio-setup-x64`

### 3. Test the Formula

Before releasing, test the formula locally:

```bash
brew install --build-from-source specchio-setup.rb
specchio-setup --version
```

### 4. Submit to Homebrew

For a tap, simply commit and push the updated formula:

```bash
git add brew/specchio-setup.rb
git commit -m "Bump version to {version}"
git push
```

## Formula Structure

The formula follows Homebrew best practices:

- **Automatic architecture detection**: Homebrew automatically selects the correct bottle for the user's architecture
- **Bottle support**: Pre-compiled binaries for faster installation
- **Version pinning**: Each release is tied to a specific git tag
- **Checksum verification**: SHA256 checksums ensure binary integrity
- **Dependency management**: Declares Bun as a runtime dependency

## Testing

Test the formula locally before pushing:

```bash
# Install from local file
brew install --build-from-source brew/specchio-setup.rb

# Test basic functionality
specchio-setup --version
specchio-setup --help

# Uninstall
brew uninstall specchio-setup
```

## Troubleshooting

### Checksum Mismatch

If you see a checksum error, rebuild the binaries and update the formula:

```bash
./update-formula.sh
```

### Architecture Issues

Make sure you're building for the correct target:

```bash
# Apple Silicon
bun build --compile --target=bun-darwin-arm64 --outfile specchio-setup-arm64 src/index.ts

# Intel
bun build --compile --target=bun-darwin-x64 --outfile specchio-setup-x64 src/index.ts
```

### Bottle URLs

The bottle URLs in the formula should match your GitHub release URLs:

```
https://github.com/Alexintosh/specchio/releases/download/v{version}/
```
