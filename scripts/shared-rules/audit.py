#!/usr/bin/env python3
"""Count the decisions pages make for themselves, web + mobile.

Scopes:
  web-pages   apps/gurudevi-web/app + lib            (a page/room deciding)
  mob-pages   apps/gurudevi-mobile/app + src + features
  domain      packages/{self,community,library,profile,classroom,...}  (room screens shared by both)
  kit         packages/ui/src                           (the shared place; counted for reference)
"""
import json, os, re, sys
from collections import Counter, defaultdict

ROOT = sys.argv[1]
SKIP = re.compile(r"(node_modules|__tests__|\.test\.|\.spec\.|/archive/|/generated/|\.stories\.|/tests?/|/e2e/|/temp/|/mocks?/|__mocks__|/\.next/|/dist/)")
DOMAIN_PKGS = ["self", "community", "library", "profile", "classroom", "people", "workforce",
               "editorial", "form-builder", "admin", "accounting", "payments", "scanner-kit", "analytics"]

def scope_of(p):
    if p.startswith("apps/gurudevi-web/app/") or p.startswith("apps/gurudevi-web/lib/"):
        return "web-pages"
    if p.startswith("apps/gurudevi-mobile/") and re.match(r"apps/gurudevi-mobile/(app|src|features)/", p):
        return "mob-pages"
    if p.startswith("packages/ui/src/"):
        return "kit"
    for d in DOMAIN_PKGS:
        if p.startswith(f"packages/{d}/"):
            return "domain"
    return None

def is_lab(p):
    return bool(re.search(r"(lab|showcase|preview|demo|/kit/|\(dev\)|architecture)", p, re.I))

CSS_RULES = {
    "scrollbar": r"::-webkit-scrollbar|scrollbar-width|scrollbar-color|scrollbar-gutter",
    "reduced_motion": r"prefers-reduced-motion",
    "color_scheme": r"prefers-color-scheme",
    "width_media": r"@media[^{]*\b(max|min)-width",
    "viewport_units": r"\b100(d|s|l)?v[hw]\b",
    "fixed_sticky": r"position\s*:\s*(fixed|sticky)",
    "z_index_literal": r"z-index\s*:\s*-?\d+",
    "backdrop_filter": r"backdrop-filter",
    "safe_area": r"env\(\s*safe-area-inset",
    "raw_colour": r"(?<![\w-])#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(",
    "font_size_literal": r"font-size\s*:\s*[\d.]+(px|rem|em)",
    "max_width_literal": r"max-width\s*:\s*[\d.]+(px|rem|ch)",
    "radius_literal": r"border-radius\s*:\s*[\d.]+(px|rem)",
    "shadow_literal": r"box-shadow\s*:\s*(?!var|none)[^;]*\d",
    "duration_literal": r"(transition|animation)[^;:]*:[^;]*\b\d*\.?\d+m?s\b",
    "keyframes": r"@keyframes",
    "focus_outline": r":focus(-visible)?",
    "tap_highlight": r"-webkit-tap-highlight-color|touch-action|overscroll-behavior",
    "touch_min_literal": r"min-(height|width)\s*:\s*(3\d|4\d)px",
    "spacing_literal": r"(padding|margin|gap)[\w-]*\s*:\s*[^;]*\d+(px|rem)",
}
TSX_WEB_RULES = {
    "tw_responsive": r"\b(sm|md|lg|xl|2xl):[\w\[]",
    "tw_maxw": r"\bmax-w-(\[|\w)",
    "tw_arbitrary_colour": r"\b(bg|text|border|from|to|via)-\[#",
    "tw_screen_height": r"\b(min-)?h-(screen|dvh|svh)\b",
    "tw_motion_reduce": r"motion-(reduce|safe):",
    "tw_scroll": r"\boverflow-(y-)?(auto|scroll)\b",
    "inline_style": r"style=\{\{",
    "js_media": r"matchMedia\(|innerWidth|useMediaQuery",
    "js_reduced_motion": r"prefers-reduced-motion|useReducedMotion|reducedMotion",
    "spinner_local": r"animate-spin|Loading\.\.\.|Loading…",
}
TSX_NATIVE_RULES = {
    "stylesheet_create": r"StyleSheet\.create",
    "raw_colour": r"['\"]#[0-9a-fA-F]{3,8}['\"]|['\"]rgba?\(",
    "font_size_literal": r"fontSize\s*:\s*\d",
    "spacing_literal": r"\b(padding|margin|gap)\w*\s*:\s*\d",
    "radius_literal": r"borderRadius\s*:\s*\d",
    "scroll_indicator": r"shows(Vertical|Horizontal)ScrollIndicator",
    "reduced_motion": r"useReducedMotion|isReduceMotionEnabled|reduceMotion",
    "width_check": r"useWindowDimensions|Dimensions\.get",
    "width_literal_compare": r"width\s*[<>]=?\s*\d{3}",
    "safe_area": r"SafeAreaView|useSafeAreaInsets",
    "keyboard_avoid": r"KeyboardAvoidingView",
    "status_bar": r"<StatusBar\b",
    "activity_indicator": r"<ActivityIndicator\b",
    "hit_slop": r"hitSlop",
    "platform_branch": r"Platform\.(OS|select)",
    "haptics_direct": r"Haptics\.\w+Async",
    "shadow_literal": r"shadowColor|elevation\s*:\s*\d",
    "z_index_literal": r"zIndex\s*:\s*\d",
    "duration_literal": r"duration\s*:\s*\d",
    "refresh_control": r"<RefreshControl\b",
    "touch_min_literal": r"min(Height|Width)\s*:\s*(3\d|4\d)\b",
    "header_option": r"headerShown|header(Title|Left|Right)\s*:",
}
LOCAL_DEF = re.compile(r"(?:function|const)\s+(\w*(?:Empty|Loading|Loader|Skeleton|Spinner|Header|ErrorView|ErrorState)\w*)\s*[=(:<]")
KIT_IMPORT = re.compile(r"import\s*\{([^}]*)\}\s*from\s*['\"]@repo/ui[^'\"]*['\"]", re.S)
STATE_NAMES = re.compile(r"\b(EmptyState|BrandedEmptyState|ErrorState|ErrorMessage|WaitingSign|Waiting|Skeleton|SkeletonLoader|LotusLoader|BreathingLoader|LoadingOverlay|ProgressIndicator|States)\b")

out = {"files": Counter(), "rules": defaultdict(lambda: defaultdict(lambda: {"files": 0, "hits": 0, "top": Counter()})),
       "values": defaultdict(Counter), "local_defs": defaultdict(Counter), "state_imports": defaultdict(Counter)}

for base in ["apps/gurudevi-web", "apps/gurudevi-mobile", "packages"]:
    for dp, dn, fn in os.walk(os.path.join(ROOT, base)):
        dn[:] = [d for d in dn if d not in ("node_modules", ".next", "dist", ".expo", "android", "ios")]
        for f in fn:
            p = os.path.relpath(os.path.join(dp, f), ROOT)
            if SKIP.search(p):
                continue
            sc = scope_of(p)
            if not sc:
                continue
            ext = os.path.splitext(f)[1]
            if ext not in (".css", ".tsx", ".ts"):
                continue
            if ext == ".ts" and not (p.endswith("kitCss.ts") or p.endswith("css.ts")):
                if sc != "kit":
                    pass
                # .ts files only scanned for native rules (styles objects)
            try:
                txt = open(os.path.join(ROOT, p), encoding="utf-8", errors="ignore").read()
            except Exception:
                continue
            lab = is_lab(p)
            key = sc + (":lab" if lab else "")
            out["files"][key + ":" + ext] += 1
            if ext == ".css" or p.endswith("kitCss.ts"):
                rules = CSS_RULES
                kind = "css"
            elif ext == ".tsx" and (".web." in f or sc == "web-pages"):
                rules = {**TSX_WEB_RULES, **{k: v for k, v in TSX_NATIVE_RULES.items() if k in ("raw_colour",)}}
                kind = "web-tsx"
            elif ext in (".tsx", ".ts"):
                rules = TSX_NATIVE_RULES
                kind = "native"
            for name, rx in rules.items():
                hits = len(re.findall(rx, txt))
                if hits:
                    r = out["rules"][f"{kind}.{name}"][key]
                    r["files"] += 1
                    r["hits"] += hits
                    r["top"][p] += hits
            if kind == "css":
                for m in re.finditer(r"@media[^{]*?\b(max|min)-width\s*:\s*([\d.]+(?:px|rem|em))", txt):
                    out["values"]["css_breakpoints"][f"{m.group(1)} {m.group(2)}"] += 1
                for m in re.finditer(r"z-index\s*:\s*(-?\d+)", txt):
                    out["values"]["css_zindex"][m.group(1)] += 1
                for m in re.finditer(r"max-width\s*:\s*([\d.]+(?:px|rem|ch))", txt):
                    out["values"]["css_maxwidth"][m.group(1)] += 1
                for m in re.finditer(r"\b(\d*\.?\d+m?s)\b", " ".join(re.findall(r"(?:transition|animation)[^;:]*:[^;]*", txt))):
                    out["values"]["css_durations"][m.group(1)] += 1
            if kind == "native":
                for m in re.finditer(r"width\s*([<>]=?)\s*(\d{3,4})", txt):
                    out["values"]["native_width_breaks"][m.group(2)] += 1
                for m in re.finditer(r"duration\s*:\s*(\d+)", txt):
                    out["values"]["native_durations"][m.group(1)] += 1
                for m in re.finditer(r"fontSize\s*:\s*(\d+)", txt):
                    out["values"]["native_font_sizes"][m.group(1)] += 1
            if ext == ".tsx":
                for m in LOCAL_DEF.finditer(txt):
                    out["local_defs"][key][m.group(1)] += 1
                for m in KIT_IMPORT.finditer(txt):
                    for n in STATE_NAMES.findall(m.group(1)):
                        out["state_imports"][key][n] += 1

def ser(o):
    if isinstance(o, Counter):
        return dict(o.most_common(40))
    if isinstance(o, dict):
        return {k: ser(v) for k, v in o.items()}
    return o
res = ser(out)
for rule, scopes in res["rules"].items():
    for sc, r in scopes.items():
        r["top"] = dict(list(r["top"].items())[:8])
json.dump(res, sys.stdout, indent=1, default=str)
