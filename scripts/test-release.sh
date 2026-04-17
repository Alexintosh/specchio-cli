#!/bin/bash

# Specchio Setup CLI - Test Release Script
# This script tests the built binary to ensure it works correctly

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

print_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
}

# Check if binary exists
if [ ! -f "specchio-setup-arm64" ] && [ ! -f "specchio-setup-x64" ]; then
    print_error "No binaries found. Please build first using scripts/build-all.sh"
    exit 1
fi

# Determine which binary to test
BINARY=""
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
    if [ -f "specchio-setup-arm64" ]; then
        BINARY="./specchio-setup-arm64"
    else
        print_error "ARM64 binary not found for this ARM64 Mac"
        exit 1
    fi
elif [ "$ARCH" = "x86_64" ]; then
    if [ -f "specchio-setup-x64" ]; then
        BINARY="./specchio-setup-x64"
    else
        print_error "x86_64 binary not found for this Intel Mac"
        exit 1
    fi
else
    print_error "Unknown architecture: $ARCH"
    exit 1
fi

print_info "Testing binary: $BINARY"
print_info "Architecture: $ARCH"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"

    print_test "$test_name"
    if eval "$test_command" > /dev/null 2>&1; then
        print_success "✓ $test_name"
        ((TESTS_PASSED++))
        return 0
    else
        print_error "✗ $test_name"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Test 1: Binary is executable
print_info "Test 1: Checking binary is executable..."
if [ -x "$BINARY" ]; then
    print_success "✓ Binary is executable"
    ((TESTS_PASSED++))
else
    print_error "✗ Binary is not executable"
    ((TESTS_FAILED++))
fi

# Test 2: Version flag
echo ""
run_test "Version flag (--version)" "$BINARY --version"

# Test 3: Help flag
run_test "Help flag (--help)" "$BINARY --help"

# Test 4: Check command (dry run)
run_test "Check command" "$BINARY check"

# Test 5: Doctor command
run_test "Doctor command" "$BINARY doctor"

# Test 6: Verify command
run_test "Verify command" "$BINARY verify"

# Test 7: Test --verbose flag doesn't crash
echo ""
run_test "Verbose flag (--verbose)" "$BINARY --version --verbose"

# Test 8: Test invalid command (should start setup wizard, not crash)
echo ""
print_test "Invalid command handling (should start setup wizard)"
# Use expect or a simple echo to handle the interactive prompt
# The invalid command should start the setup wizard
if echo "n" | $BINARY invalid-command 2>&1 | grep -q "Setup Wizard\|Welcome to Specchio"; then
    print_success "✓ Invalid command starts setup wizard (expected behavior)"
    ((TESTS_PASSED++))
else
    print_error "✗ Invalid command did not start setup wizard"
    ((TESTS_FAILED++))
fi

# Test 9: Test check macos specifically
echo ""
run_test "Check macOS version" "$BINARY check macos"

# Test 10: Test help for check command
run_test "Help for check command" "$BINARY help check"

# Display version info
echo ""
print_info "Binary version information:"
$BINARY --version

# Display results
echo ""
echo "=== Test Results ==="
echo ""
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    print_success "All tests passed! The binary is ready for release."
    exit 0
else
    print_error "Some tests failed. Please review the output above."
    exit 1
fi
