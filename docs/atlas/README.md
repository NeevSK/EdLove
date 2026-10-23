# docs/atlas
This is the EdLove feature atlas. features.yaml is the source of truth; regenerate the markdown with tools/render_v1.py. Atlas v5, produced read-only from `terrain/version-hops` @ 50fb1b9e (per-feature evidence can be newer or older; see CHANGELOG.md). The older v4 copy in `docs/edlove/atlas/` is superseded by this one.

## Regenerating
* `sh docs/atlas/tools/v2/run_all.sh` rebuilds everything into a scratch dir (`$EDLOVE_ATLAS_WORK`, default `.atlas-work/`). Then copy the reviewed `*.md`/`*.yaml` back here.
* Paths come from env vars (`EDLOVE_REPO`, `EDLOVE_ATLAS_WORK`, `EDLOVE_PLAN`), and every script's defaults are repo-relative (see `tools/atlas_paths.py`). Without `EDLOVE_PLAN`, the private plan docs are skipped, so `DOCS_INTENT.md` will have fewer sources.
* Some bulky generated JSON is not committed: `tools/v4/verification.json` (~1.4 MB, from `v4/verify.py`), plus the intermediate `graph.json`, `trace.json`, `v2/capabilities.json` and `v3/*.json`. The pipeline recreates them.
* To replay the migrations locally, run `sh docs/atlas/tools/v5/replay.sh [ref]`. It needs a local Postgres 17 and makes no network calls.
