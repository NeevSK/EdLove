---
title: "Style-engine runtime fixture"
status: "active"
created: 2026-08-12
updated: 2026-09-07
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Style-engine runtime fixture

This entry deliberately avoids Expo Router, Supabase, auth and application providers. It is the
renderer-level gate for the product-owned primitive adapters exported through the `@repo/ui/gluestack`
facade and backed by NativeWind v5. The fixture imports only the reviewed primitive adapters under
test so unrelated facade exports cannot pull application/domain code into this renderer gate.

Run it with the Expo CLI entrypoint directly from this directory so the fixture, rather than the
monorepo root, is discovered as the project root:

```powershell
node ..\..\node_modules\expo\bin\cli export -p web --output-dir dist
```

Serve `dist` and run the repeatable browser gate from the app package:

```powershell
pnpm --filter gurudevi-mobile inspect:style-engine-fixture
```

The inspector expects the exported `dist` directory to be served at
`http://127.0.0.1:4176/`; use any static server for that directory. The
successful 2026-09-07 gate used Python's built-in static server.

The gate checks computed styles for layout, text, pressable, SVG icon and virtualized-list adapters,
then runs a real Button/Input/FormField scenario: helper text, validation error, loading, transient
failure, retry, recovery, and final style output. It fails on missing elements, page errors, or
incorrect user-visible state. Jest/Vitest prop assertions do not count as runtime evidence for this
fixture.

This fixture is a Metro/browser runtime gate, not a device test and not a replacement for the
Vitest contract/component lanes. It is the supported place to verify NativeWind/react-native-css
class-to-style output.
