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

echo "== reality forms (report only until gurudevi.yaml takes its forms)"
python -I "$dir/scripts/check-reality.py" "$dir" --report
