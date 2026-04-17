VERSION := $(shell node -p "require('./package.json').version")

.PHONY: build build-arm64 build-x64 clean release release-patch release-minor release-major install-local test help

# ── Build ──────────────────────────────────────────────

build: build-arm64 build-x64 ## Build all binaries
	@echo ""
	@echo "=== Build Summary ==="
	@ls -lh specchio-arm64 specchio-x64 | awk '{print "  " $$9 " - " $$5}'
	@echo ""
	@shasum -a 256 specchio-arm64 specchio-x64

build-arm64: ## Build ARM64 binary (Apple Silicon)
	@echo "Building ARM64..."
	bun build --compile --target=bun-darwin-arm64 --outfile specchio-arm64 src/index.ts
	chmod +x specchio-arm64
	@./specchio-arm64 --version

build-x64: ## Build x64 binary (Intel)
	@echo "Building x64..."
	bun build --compile --target=bun-darwin-x64 --outfile specchio-x64 src/index.ts
	chmod +x specchio-x64

clean: ## Remove built binaries and checksums
	rm -f specchio specchio-arm64 specchio-x64 checksums.txt *.sha256

# ── Test ───────────────────────────────────────────────

test: ## Run tests
	bun test

# ── Release ────────────────────────────────────────────

release-patch: ## Release x.y.Z (bug fix)
	@$(MAKE) _bump VERSION_PART=patch
	@$(MAKE) _release

release-minor: ## Release x.Y.0 (new feature)
	@$(MAKE) _bump VERSION_PART=minor
	@$(MAKE) _release

release-major: ## Release X.0.0 (breaking change)
	@$(MAKE) _bump VERSION_PART=major
	@$(MAKE) _release

release: ## Release current version (no version bump)
	@$(MAKE) _release

# ── Install locally ────────────────────────────────────

install-local: build-arm64 ## Install specchio to /usr/local/bin (for testing)
	cp specchio-arm64 /usr/local/bin/specchio
	@echo "Installed specchio v$(VERSION) to /usr/local/bin/specchio"

# ── Internal targets ──────────────────────────────────

_bump:
	@echo "Bumping $(VERSION_PART) version..."
	npm version $(VERSION_PART) --no-git-tag-version
	@NEW_VERSION=$$(node -p "require('./package.json').version") && \
	sed -i '' "s/const VERSION = '[^']*'/const VERSION = '$$NEW_VERSION'/" src/index.ts && \
	echo "Updated to v$$NEW_VERSION"

_release: build
	@echo ""
	@echo "=== Creating release v$(VERSION) ==="
	@shasum -a 256 specchio-arm64 specchio-x64 > checksums.txt
	@cat checksums.txt
	git add package.json src/index.ts checksums.txt
	git commit -m "Release v$(VERSION)" || true
	git tag -a "v$(VERSION)" -m "Release v$(VERSION)"
	git push origin main
	git push origin "v$(VERSION)"
	gh release create "v$(VERSION)" \
		./specchio-arm64 \
		./specchio-x64 \
		./checksums.txt \
		--title "v$(VERSION)" \
		--generate-release-notes
	@ARM64_SHA=$$(shasum -a 256 specchio-arm64 | awk '{print $$1}') && \
	X64_SHA=$$(shasum -a 256 specchio-x64 | awk '{print $$1}') && \
	bash scripts/update-homebrew.sh "$(VERSION)" "$$ARM64_SHA" "$$X64_SHA"
	@echo ""
	@echo "=== Release v$(VERSION) complete ==="
	@echo "  Install: brew tap Alexintosh/specchio && brew install specchio"

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
