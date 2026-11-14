"""Shared, configurable paths for the atlas tools (no hard-coded machine paths).

EDLOVE_REPO        repo checkout to analyse   (default: the git toplevel containing these tools)
EDLOVE_ATLAS_WORK  working/output directory   (default: this tools/ directory)
EDLOVE_PLAN        optional private plan docs (default: unset -> skipped)
"""
import os, subprocess

TOOLS = os.path.dirname(os.path.abspath(__file__))


def _toplevel():
    try:
        return subprocess.run(["git", "-C", TOOLS, "rev-parse", "--show-toplevel"],
                              capture_output=True, text=True, check=True).stdout.strip()
    except Exception:
        return os.path.abspath(os.path.join(TOOLS, "..", "..", ".."))


REPO = os.environ.get("EDLOVE_REPO") or _toplevel()
ATLAS = os.environ.get("EDLOVE_ATLAS_WORK") or TOOLS
PLAN = os.environ.get("EDLOVE_PLAN", "")
