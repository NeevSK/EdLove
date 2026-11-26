#!/usr/bin/env bash
# Installs the pinned ontology tools (docs/decisions/2026-11-26-gurudevi-tool-selection.md,
# rule 7) into one folder, verifies every download by SHA-256, and prints each version.
#
#   ontology/tools/install.sh            install into $ONTOLOGY_TOOLS (default .ontology-tools)
#   ontology/tools/install.sh --relock   also rewrite requirements.lock.txt from requirements.in
#
# Needs: bash, curl, python3.13, java 17+, node + npm. Prints `export` lines to source.
#
# ZenStack (3.10.3) and Cedar (@cedar-policy/cedar-wasm 4.15.0) are already pinned in the pnpm
# workspace and are used from there, not installed again here.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
dest="${ONTOLOGY_TOOLS:-$(cd "$here/../.." && pwd)/.ontology-tools}"
mkdir -p "$dest/bin"

LINKML_VERSION=1.12.1
CUE_VERSION=0.14.2
CUE_SHA256=de6bcd5a601ca53dde09de8e5f884a4bad23c91306f04ca6a6ce11dab48a8307   # linux amd64
ALLOY_VERSION=6.2.0
ALLOY_SHA256=6b8c1cb5bc93bedfc7c61435c4e1ab6e688a242dc702a394628d9a9801edb78d
TLA_VERSION=1.8.0
TLA_SHA256=67f9575c3b9ef7a0787b1bded34812862ffe79d711298e5a75b1a77720b19928

fetch() { # url sha256 out
  if [ -f "$3" ] && echo "$2  $3" | sha256sum -c --status; then return; fi
  curl -fsSL --retry 4 -o "$3.part" "$1"
  echo "$2  $3.part" | sha256sum -c --quiet || { echo "checksum mismatch for $1" >&2; rm -f "$3.part"; exit 1; }
  mv "$3.part" "$3"
}

# LinkML (Python, development only; nothing Python ships)
python3 -m venv "$dest/venv"
"$dest/venv/bin/pip" install --quiet --upgrade pip
if [ "${1:-}" = "--relock" ]; then
  "$dest/venv/bin/pip" install --quiet -r "$here/requirements.in"
  { echo "# Generated: pip freeze of a Python 3.13 venv after 'pip install -r requirements.in'."
    echo "# Regenerate with ontology/tools/install.sh --relock. Do not edit by hand."
    "$dest/venv/bin/pip" freeze | grep -v '^-e'; } > "$here/requirements.lock.txt"
else
  "$dest/venv/bin/pip" install --quiet --no-deps -r "$here/requirements.lock.txt"
fi

# CUE
fetch "https://github.com/cue-lang/cue/releases/download/v${CUE_VERSION}/cue_v${CUE_VERSION}_linux_amd64.tar.gz" \
  "$CUE_SHA256" "$dest/cue.tar.gz"
tar -xzf "$dest/cue.tar.gz" -C "$dest/bin" cue

# Alloy 6 and TLA+ tools (Java)
fetch "https://github.com/AlloyTools/org.alloytools.alloy/releases/download/v${ALLOY_VERSION}/org.alloytools.alloy.dist.jar" \
  "$ALLOY_SHA256" "$dest/alloy.jar"
fetch "https://github.com/tlaplus/tlaplus/releases/download/v${TLA_VERSION}/tla2tools.jar" \
  "$TLA_SHA256" "$dest/tla2tools.jar"

# TypeSpec and ontouml-js (Node), from the lockfile beside this script
mkdir -p "$dest/node"
cp "$here/package.json" "$here/package-lock.json" "$dest/node/"
(cd "$dest/node" && npm ci --ignore-scripts --no-audit --no-fund --silent)

# Versions: fail if any tool is not the pinned one.
check() { # name want got
  if [ "$2" != "$3" ]; then echo "$1: want $2, got $3" >&2; exit 1; fi
  echo "$1 $3"
}
check linkml "$LINKML_VERSION" "$("$dest/venv/bin/python" -c 'import importlib.metadata as m; print(m.version("linkml"))')"
check cue "v$CUE_VERSION" "$("$dest/bin/cue" version | awk 'NR==1{print $3}')"
check alloy "$ALLOY_VERSION" "$(java -jar "$dest/alloy.jar" version 2>/dev/null | tail -n1)"
echo "tla2tools $TLA_VERSION (sha256 verified)"
check typespec 1.18.0 "$(node -p "require('$dest/node/node_modules/@typespec/compiler/package.json').version")"
check ontouml-js 0.5.0 "$(node -p "require('$dest/node/node_modules/ontouml-js/package.json').version")"

echo "export ONTOLOGY_TOOLS='$dest'"
echo "export PATH='$dest/venv/bin:$dest/bin:$dest/node/node_modules/.bin':\"\$PATH\""
