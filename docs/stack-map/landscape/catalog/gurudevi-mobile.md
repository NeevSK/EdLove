# gurudevi-mobile — dependency footprint

> Part of the [Stack Catalog](../stack-map.md) · auto-generated · links point back to the master

The Operational Engine — mobile app for teachers, students, and principals. Largest consumer in the workspace.

## Workspace packages used

| Package | Layer | Purpose |
| :--- | :--- | :--- |
| [@repo/admin](../stack-map.md#repoadmin) | domain | Institutional governance & official-ops domain — the school as an institution, not a classroom cell. |
| [@repo/ai](../stack-map.md#repoai) | domain | AI domain — TanStack AI agent/model wiring + UI affordances (reanimated, lucide, expo-router). |
| [@repo/analytics](../stack-map.md#repoanalytics) | domain | Premium analytics engine — student performance insights, GPA calculations, predictive analytics. |
| [@repo/classroom](../stack-map.md#repoclassroom) | domain | Pedagogical & classroom-operational domain — the living teacher-student-classroom cell. |
| [@repo/community](../stack-map.md#repocommunity) | domain | Relational ecosystem — groups, feed participation, community creation & discovery flows. |
| [@repo/core](../stack-map.md#repocore) | core | Platform spine — shared contracts & infrastructure every domain relies on. |
| [@repo/form-builder](../stack-map.md#repoform-builder) | domain | Feature host for forms (build + render flows) — the app-side shell, not the engine. |
| [@repo/library](../stack-map.md#repolibrary) | domain | Knowledge sanctuary — library browsing, collections, resource consumption, maps, contribution flows. |
| [@repo/people](../stack-map.md#repopeople) | domain | Human identity & human-administration — who belongs, where, with which staff-facing processes. |
| [@repo/profile](../stack-map.md#repoprofile) | domain | Identity-expression for people & school presence — profiles, social presentation, completion. |
| [@repo/scanner-kit](../stack-map.md#reposcanner-kit) | domain | Scanning, QR, OCR & code-based capture features reusable across platform surfaces. |
| [@repo/self](../stack-map.md#repoself) | domain | Personal sanctuary — inner-life, growth, journaling, wellbeing, role-shaped self-work. |
| [@repo/ui](../stack-map.md#repoui) | ui | Shared design system & shell primitives for the whole product family. |
| [@repo/workforce](../stack-map.md#repoworkforce) | domain | Future non-academic & job-structure domain — school-wide operations beyond classrooms. |

## External deps (179 direct)

```text
@azure/core-asynciterator-polyfill
@expo-google-fonts/inter
@expo-google-fonts/poppins
@expo/app-integrity
@expo/fingerprint
@expo/metro-runtime
@expo/ui
@journeyapps/wa-sqlite
@legendapp/list
@lottiefiles/dotlottie-react
@op-engineering/op-sqlite
@powersync/drizzle-driver
@powersync/react
@powersync/react-native
@powersync/web
@react-native-async-storage/async-storage
@react-native-community/datetimepicker
@react-native-community/netinfo
@react-native-community/slider
@react-native-masked-view/masked-view
@react-native-ml-kit/barcode-scanning
@react-native-ml-kit/text-recognition
@react-native-picker/picker
@react-native-segmented-control/segmented-control
@react-native-vector-icons/lucide
@sentry/react-native
@shopify/flash-list
@shopify/react-native-skia
@stripe/stripe-react-native
@supabase/postgrest-js
@supabase/supabase-js
@swmansion/react-native-bottom-sheet
@tanstack/react-pacer
@tanstack/react-query
@ts-rest/core
@types/qrcode
@zenstackhq/orm
@zenstackhq/schema
@zenstackhq/zod
apca-w3
base64-js
buffer
color-name
culori
date-fns
drizzle-orm
effect
expo
expo-age-range
expo-apple-authentication
expo-application
expo-asset
expo-audio
expo-auth-session
expo-background-task
expo-battery
expo-blob
expo-blur
expo-brightness
expo-build-properties
expo-calendar
expo-camera
expo-cellular
expo-checkbox
expo-clipboard
expo-constants
expo-contacts
expo-crypto
expo-dev-client
expo-device
expo-document-picker
expo-file-system
expo-font
expo-gl
expo-glass-effect
expo-haptics
expo-image
expo-image-manipulator
expo-image-picker
expo-intent-launcher
expo-keep-awake
expo-linear-gradient
expo-linking
expo-live-photo
expo-local-authentication
expo-localization
expo-location
expo-mail-composer
expo-manifests
expo-media-library
expo-mesh-gradient
expo-navigation-bar
expo-network
expo-notifications
expo-print
expo-router
expo-screen-capture
expo-screen-orientation
expo-secure-store
expo-sensors
expo-server
expo-sharing
expo-sms
expo-splash-screen
expo-sqlite
expo-status-bar
expo-store-review
expo-symbols
expo-system-ui
expo-task-manager
expo-updates
expo-video
expo-video-thumbnails
expo-web-browser
expo-widgets
fast-deep-equal
hoist-non-react-statics
i18next
ieee754
inline-style-prefixer
inngest
invariant
isomorphic-webcrypto
jpeg-js
jsqr
lottie-react-native
lucide-react
lucide-react-native
nativewind
phosphor-react-native
pino
posthog-js
posthog-react-native
qrcode
react
react-dom
react-freeze
react-i18next
react-is
react-native
react-native-avoid-softinput
react-native-css
react-native-css-interop
react-native-custom-pull-refresh
react-native-ease
react-native-enriched-markdown
react-native-fast-shimmer
react-native-gesture-handler
react-native-get-random-values
react-native-keyboard-controller
react-native-linear-gradient
react-native-maps
react-native-mmkv
react-native-nano-icons
react-native-nitro-google-signin
react-native-nitro-modules
react-native-pager-view
react-native-reanimated
react-native-reanimated-carousel
react-native-reanimated-skeleton
react-native-safe-area-context
react-native-screens
react-native-shared-hero
react-native-ssl-public-key-pinning
react-native-streamdown
react-native-svg
react-native-url-polyfill
react-native-webview
react-native-worklets
scheduler
styleq
tailwindcss
use-latest-callback
use-sync-external-store
uuid
voltra
xstate
zod
zustand
```

## Dev tooling (35)

```text
@babel/runtime
@babel/traverse
@playwright/test
@repo/eslint-config
@repo/types-shim
@repo/typescript-config
@rozenite/performance-monitor-plugin
@sentry/cli
@tailwindcss/postcss
@testing-library/jest-dom
@testing-library/jest-native
@testing-library/react
@testing-library/react-native
@types/jest
@types/react
@types/react-test-renderer
babel-preset-expo
cross-env
eslint
eslint-config-expo
eslint-plugin-react-compiler
eslint-plugin-react-native-a11y
expo-doctor
globals
jest-cucumber
jest-expo
playwright
postcss
react-native-bundle-visualizer
react-native-web
react-test-renderer
reassure
supabase
typescript
vitest
```

## Coupling notes

Pulls 14 domain packages (ai, classroom, payments, people, profile, self, scanner-kit...). Most fragile: sacred native pins + new-arch only; any domain change ripples here.

