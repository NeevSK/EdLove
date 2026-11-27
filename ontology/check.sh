#!/usr/bin/env bash
# The ontology checks that exist at build step 1. Later steps add the generator, its drift
# check and the CUE, Alloy, OntoUML, TLC and TypeSpec runs here.
#   ontology/check.sh        (tools on PATH, see ontology/tools/install.sh)
set -euo pipefail
dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "== linkml lint"
linkml lint --max-warnings 0 "$dir/gurudevi.yaml"

echo "== examples"
python -I "$dir/scripts/check-examples.py" "$dir"

echo "== reality forms"
python -I "$dir/scripts/check-reality.py" "$dir"

echo "== links: reality to screen"
# Builds ontology/links/out from every layer's own files, fails on a broken link or on a gap
# count above its ceiling (tooling/ratchet.json, ontologyLinkGaps), then fails if the
# committed graph is stale: a change anywhere in the chain must show up in the PR.
root="$(cd "$dir/.." && pwd)"
(cd "$root" && python -I ontology/scripts/links.py check)
if [ -d "$root/.git" ] && ! git -C "$root" diff --quiet -- ontology/links/out; then
  echo "ontology/links/out is stale: run python -I ontology/scripts/links.py build and commit it"
  git -C "$root" --no-pager diff --stat -- ontology/links/out
  exit 1
fi
