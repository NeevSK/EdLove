#!/bin/sh
# Regenerate the atlas. Read-only on the analysed repo; writes only into $EDLOVE_ATLAS_WORK.
#   EDLOVE_REPO        checkout to analyse (default: this repo's toplevel)
#   EDLOVE_ATLAS_WORK  scratch work dir     (default: ./.atlas-work under the repo root, git-ignored by you)
#   EDLOVE_PLAN        optional private plan docs folder (skipped if unset)
#   PY                 python with pyyaml + scikit-learn for the v3/v4 steps (default: python3)
set -e
TOOLS=$(cd "$(dirname "$0")/.." && pwd); ATLAS_DOCS=$(dirname "$TOOLS")
export EDLOVE_REPO=${EDLOVE_REPO:-$(git -C "$TOOLS" rev-parse --show-toplevel)}
export EDLOVE_ATLAS_WORK=${EDLOVE_ATLAS_WORK:-$EDLOVE_REPO/.atlas-work}
PY=${PY:-python3}; W=$EDLOVE_ATLAS_WORK
# Lay out the work dir the way the scripts expect: analysis/ + v2..v5/ + published yaml at the root.
mkdir -p "$W/analysis"
cp "$TOOLS"/*.py "$W/analysis/"; cp "$TOOLS/atlas_paths.py" "$W/"
for v in v2 v3 v4 v5; do mkdir -p "$W/$v"; cp -r "$TOOLS/$v/." "$W/$v/"; done
for f in features.yaml capabilities.yaml branches.yaml NON_CAPABILITIES.yaml; do [ -f "$W/$f" ] || cp "$ATLAS_DOCS/$f" "$W/"; done
cd "$W"
python3 analysis/graph.py
python3 analysis/trace.py
TZ=Asia/Colombo python3 v2/inventory.py
python3 v2/capabilities.py
python3 v2/post_tables.py
TZ=Asia/Colombo $PY v3/docs_collect.py
$PY v3/docs_extract.py
$PY v3/docs_match.py
$PY v3/merge_docs.py
python3 v4/build_index.py
$PY v4/verify.py          # writes v4/verification.json (~1.4 MB, not committed)
python3 v5/apply.py
python3 v2/render_v2.py
python3 v5/rebase_ref.py
$PY v3/docs_report.py
python3 analysis/render_v1.py
python3 v4/report.py
echo "Done. Review $W/*.md and *.yaml, then copy them into $ATLAS_DOCS/."
