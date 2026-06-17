#!/usr/bin/env bash

set -euo pipefail

VERSION="v2.3.2"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BIN_DIR="$ROOT/.cache/osv-scanner"
BIN="$BIN_DIR/osv-scanner"

install_osv_scanner() {
	local os arch platform

	os="$(uname -s | tr '[:upper:]' '[:lower:]')"
	arch="$(uname -m)"

	case "$arch" in
	x86_64) arch="64-bit" ;;
	aarch64 | arm64) arch="arm64" ;;
	*)
		echo "osv-scanner: unsupported architecture: $(uname -m)" >&2
		exit 1
		;;
	esac

	case "$os" in
	darwin) platform="darwin" ;;
	linux) platform="linux" ;;
	*)
		echo "osv-scanner: unsupported OS: $(uname -s)" >&2
		exit 1
		;;
	esac

	mkdir -p "$BIN_DIR"
	curl -sSfL "https://github.com/google/osv-scanner/releases/download/${VERSION}/osv-scanner_${platform}_${arch}.tar.gz" \
		| tar -xz -C "$BIN_DIR" osv-scanner
	chmod +x "$BIN"
}

if [[ ! -x "$BIN" ]]; then
	echo "Installing osv-scanner ${VERSION} into .cache/osv-scanner/ ..."
	install_osv_scanner
fi

exec "$BIN" scan --recursive "$ROOT"
