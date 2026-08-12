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

The gate checks computed styles for layout, text, pressable, SVG icon and virtualized-list adapters
and fails on missing elements or page errors. Jest prop assertions do not count as runtime evidence.
