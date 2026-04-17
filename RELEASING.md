# Releasing Specchio CLI

## Overview

Releases are built **locally** and uploaded to GitHub. Binaries are distributed via Homebrew.

```
make release-patch  →  bump version, build, tag, push, upload, update Homebrew
```

## Prerequisites

- Bun >= 1.0.0
- `gh` CLI authenticated (`gh auth login`)
- Homebrew tap cloned (`brew tap Alexintosh/specchio`)
- Clean git working tree

## Commands

| Command | Description |
|---------|-------------|
| `make release-patch` | Bump x.y.Z, build, tag, push, upload, update Homebrew |
| `make release-minor` | Bump x.Y.0, build, tag, push, upload, update Homebrew |
| `make release-major` | Bump X.0.0, build, tag, push, upload, update Homebrew |
| `make release` | Release current version (no version bump) |
| `make build` | Build ARM64 + x64 binaries without releasing |
| `make build-arm64` | Build ARM64 binary only |
| `make build-x64` | Build x64 binary only |
| `make clean` | Remove built binaries |
| `make test` | Run tests |
| `make install-local` | Install to /usr/local/bin for local testing |
| `make help` | Show all commands |

## What `make release-patch` does

1. **Bumps version** in `package.json` and `src/index.ts` (e.g. 1.0.0 → 1.0.1)
2. **Builds binaries** for ARM64 (Apple Silicon) and x64 (Intel)
3. **Verifies** the ARM64 binary runs (`--version`)
4. **Generates checksums** in `checksums.txt`
5. **Commits and tags** (`git tag v1.0.1`)
6. **Pushes** commit and tag to GitHub
7. **Creates GitHub release** with binaries and checksums via `gh`
8. **Updates Homebrew formula** in `homebrew-specchio` tap

## Manual release

If you need more control:

```bash
# 1. Bump version manually
npm version 1.2.0 --no-git-tag-version
sed -i '' "s/const VERSION = '[^']*'/const VERSION = '1.2.0'/" src/index.ts

# 2. Build
make build

# 3. Test the binary
./specchio-arm64 --version
./specchio-arm64 --help

# 4. Commit, tag, push
git add package.json src/index.ts checksums.txt
git commit -m "Release v1.2.0"
git tag v1.2.0
git push origin main --tags

# 5. Create GitHub release
gh release create v1.2.0 ./specchio-arm64 ./specchio-x64 --title "v1.2.0" --generate-release-notes

# 6. Update Homebrew formula
ARM64_SHA=$(shasum -a 256 specchio-arm64 | awk '{print $1}')
X64_SHA=$(shasum -a 256 specchio-x64 | awk '{print $1}')
bash scripts/update-homebrew.sh "1.2.0" "$ARM64_SHA" "$X64_SHA"
```

## Homebrew distribution

Users install with:

```bash
brew tap Alexintosh/specchio
brew install specchio
```

The Homebrew formula lives at:
- **Repo**: https://github.com/Alexintosh/homebrew-specchio
- **Formula**: `Formula/specchio.rb`

The formula downloads the correct binary based on CPU architecture (ARM64 or x64).

## CI

The CI workflow (`.github/workflows/ci.yml`) runs on every push to `main`:
- Installs dependencies
- Runs tests
- Builds both binaries
- Verifies the ARM64 binary executes

CI does **not** create releases. All releases are local.

## File structure

```
cli/
├── Makefile                      # Build and release commands
├── scripts/
│   ├── build-all.sh              # Build script (used by make build)
│   ├── update-homebrew.sh        # Updates the Homebrew tap formula
│   └── release.sh                # Legacy release script
├── src/
│   └── index.ts                  # CLI entry point (contains VERSION constant)
├── .github/workflows/
│   └── ci.yml                    # CI: test + build verification
└── RELEASING.md                  # This file
```

## Troubleshooting

**Binary crashes with exit code 137**: Binary was built on CI with a different Bun version. Always build locally with `make build` and upload those binaries.

**`gh release create` fails**: Make sure `gh auth login` has been run and the token has `repo` scope.

**Homebrew formula update fails**: Make sure the tap is cloned locally:
```bash
brew tap Alexintosh/specchio
```
Check that `/opt/homebrew/Library/Taps/alexintosh/homebrew-specchio` exists and you have push access.
