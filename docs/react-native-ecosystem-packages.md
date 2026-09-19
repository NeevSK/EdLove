# React Native Ecosystem Packages - Comprehensive Analysis

**Generated:** August 30, 2026  
**Purpose:** Exhaustive documentation of major React Native ecosystem packages and comparison with current workspace dependencies

---

## Table of Contents
1. [Major Ecosystem Players](#major-ecosystem-players)
2. [Package Catalog by Organization](#package-catalog-by-organization)
3. [Current Workspace Dependencies](#current-workspace-dependencies)
4. [Gap Analysis](#gap-analysis)
5. [Integration Guidance](#integration-guidance)

---

## Major Ecosystem Players

### Companies & Organizations
- **Callstack** - React Native development agency, maintains core libraries
- **Software Mansion (SWM)** - Core React Native animation/gesture libraries
- **Expo** - Full-stack React Native framework with cloud services
- **Meta/Facebook** - React Native core framework maintainers
- **Shopify** - Performance-focused UI components (FlashList, Skia)
- **Airbnb** - Lottie animations, Maps
- **Vercel/TanStack** - Data fetching and state management
- **OneSignal** - Push notifications and messaging
- **Bluesky** - Decentralized social protocol (AT Protocol)

### Key Individual Maintainers
- **Satyajit Sahoo (satya164)** - React Navigation, React Native Paper, Linaria
- **Mike Hardy** - React Native Firebase, device info, netinfo
- **React Native Community** - Distributed community maintainers

---

## Package Catalog by Organization

### Callstack Packages (57 packages on npm)

#### Core Libraries
| Package | Purpose | Stars | Status |
|---------|---------|-------|--------|
| `react-native-paper` | Material Design components | 14,424 | Active |
| `react-native-pager-view` | ViewPager wrapper (Android/iOS) | 3,338 | Active |
| `react-native-slider` | Slider component | - | Active |
| `react-native-testing-library` | Testing utilities | 3,403 | Active |
| `react-native-builder-bob` | Library scaffolding/building CLI | 3,223 | Active |
| `react-native-bottom-tabs` | Native bottom tabs | - | Active |
| `linaria` | Zero-runtime CSS-in-JS | 12,346 | Active |
| `react-native-ios-kit` | iOS-style components | - | Active |
| `component-docs` | Component documentation | - | Active |
| `haul-cli` | Webpack bundler CLI (legacy) | - | Active |

#### Build & Tooling
| Package | Purpose |
|---------|---------|
| `@callstack/repack` | Webpack/Rspack bundler for RN |
| `@callstack/repack-dev-server` | Development server |
| `@callstack/repack-debugger-app` | Debugger app |
| `@callstack/repack-init` | Repack initialization tool |
| `@callstack/repack-plugin-reanimated` | Reanimated integration |
| `@callstack/repack-plugin-expo` | Expo integration |
| `@callstack/repack-plugin-nativewind` | NativeWind integration |
| `@callstack/haul` | Webpack-based bundler (legacy) |
| `reassure` | Performance testing companion |
| `@callstack/reassure-cli` | Reassure CLI |
| `@callstack/reassure-measure` | Reassure measure tool |
| `@callstack/reassure-compare` | Reassure comparison tool |
| `@callstack/reassure-danger` | Reassure danger integration |
| `@callstack/reassure-logger` | Reassure logger |
| `rozenite` | React Native DevTools panels |

#### Infrastructure
| Package | Purpose |
|---------|---------|
| `@callstack/react-native-visionos` | React Native for visionOS |
| `@callstack/react-native-brownfield` | Brownfield integration helpers |
| `@callstack/react-native-liquid-glass` | iOS Liquid Glass effects |
| `@callstack/react-native-asset` | Asset management |
| `@callstack/out-of-tree-platforms` | Out-of-tree platform support |
| `@callstack/agent-react-devtools` | AI agent access to React DevTools |
| `@callstack/agent-device` | CLI for device control |
| `@callstack/react-native-harness` | Jest-style tests in native environments |
| `@callstack/react-native-ai` | On-device LLM execution |
| `@callstack/react-native-sandbox` | Isolated RN instances |
| `@callstack/react-native-legal` | License acknowledgements |
| `@callstack/rock` | Modular toolkit for teams |
| `@callstack/react-native-community-cli` | Command line tools |

#### AI & Development Tools
| Package | Purpose |
|---------|---------|
| `@callstack/ai-cli` | AI CLI tool |
| `@callstack/visionos-template` | visionOS template |
| `@callstack/byorg-discord` | Discord integration |
| `@callstack/byorg-utils` | Byorg utilities |
| `@callstack/slack-rich-text` | Slack rich text |
| `@callstack/document-loaders` | Document loaders |

#### Configuration
| Package | Purpose |
|---------|---------|
| `@callstack/eslint-config` | ESLint configuration |
| `@callstack/tslint-config` | TSLint configuration |
| `@callstack/react-theme-provider` | React theme provider |
| `@callstack/react-native-reanimated-arc` | Reanimated arc utilities |
| `@callstack/nativepack` | Native packaging tool |
| `eslint-config-callstack-io` | Callstack IO ESLint config |

---

### Software Mansion (SWM) Packages

#### Core Animation & Gesture
| Package | Purpose | Stars | Version |
|---------|---------|-------|---------|
| `react-native-reanimated` | Animation library (new architecture) | 10,890 | 4.5.0 |
| `react-native-gesture-handler` | Gesture system | 6,754 | 2.32.0 |
| `react-native-screens` | Native navigation primitives | 3,684 | Latest |
| `react-native-svg` | SVG rendering | 7,990 | Latest |
| `react-native-worklets` | Parallel JS execution | - | 0.10.0 |
| `@swmansion/react-native-bottom-sheet` | Bottom sheet components | - | 0.14.1 |

#### Audio & Multimedia
| Package | Purpose |
|---------|---------|
| `react-native-audio-api` | In-app audio features |
| `@swmansion/smelter` | Low-latency live video mixing |
| `@swmansion/smelter-core` | Smelter core implementation |
| `@swmansion/smelter-node` | Node runtime for Smelter |
| `@swmansion/smelter-browser-render` | Browser WASM rendering |
| `@swmansion/smelter-web-wasm` | Web WASM rendering |

#### Developer Tools
| Package | Purpose |
|---------|---------|
| `radon-ide` | VSCode/Cursor RN IDE extension |
| `@swmansion/t-rex-ui` | UI components |
| `@swmansion/icons` | Icon pack |
| `@swmansion/traveling-fastlane-linux` | Fastlane bundling (Linux) |
| `@swmansion/traveling-fastlane-darwin` | Fastlane bundling (Darwin) |
| `@swmansion/xdl` | Expo development library |

#### GPU & Graphics
| Package | Purpose |
|---------|---------|
| `typegpu` | WebGPU type-safe library |
| `tgpu-gen` | TypeGPU code generation |
| `@typegpu/noise` | Noise functions |
| `rollup-plugin-typegpu` | Rollup plugin |
| `unplugin-typegpu` | Unplugin |
| `wesl-ext-typegpu` | WGSL extensions |

#### Other Libraries
| Package | Purpose |
|---------|---------|
| `react-native-wallet` | Payment cards to Apple/Google Wallet |
| `react-native-shine` | GPU-based shader effects |
| `react-native-enriched` | Rich text rendering (HTML/markdown) |
| `pulsar` | Haptic presets and composer |
| `simcam` | Camera streaming to iOS Simulator |
| `detour` | Deferred deep links |

---

### Expo SDK 57 Packages (100+ packages)

#### Core System
| Package | Purpose | Platform |
|---------|---------|----------|
| `expo` | Common methods and types | All |
| `expo-constants` | Device and app constants | All |
| `expo-device` | Device information | All |
| `expo-application` | App metadata | All |
| `expo-dev-client` | Development client | All |

#### Tooling & CLI
| Package | Purpose |
|---------|---------|
| `@expo/cli` | Expo CLI binary |
| `@expo/metro` | Metro bundler wrapper |
| `@expo/config` | app.json interaction |
| `@expo/config-plugins` | Config plugins |
| `@expo/package-manager` | Package installation |
| `@expo/build-tools` | EAS Build core library |
| `expo-modules-core` | Expo Modules architecture core |
| `create-expo` | Expo project scaffolding |
| `create-expo-app` | Expo app scaffolding |

#### Authentication & Security
| Package | Purpose |
|---------|---------|
| `expo-apple-authentication` | Sign in with Apple |
| `expo-auth-session` | OAuth authentication |
| `expo-local-authentication` | Biometric auth |
| `expo-secure-store` | Secure key-value storage |
| `expo-crypto` | Cryptographic operations |

#### Camera & Media
| Package | Purpose |
|---------|---------|
| `expo-camera` | Camera access |
| `expo-image` | Image manipulation |
| `expo-image-picker` | Photo library access |
| `expo-image-manipulator` | Image editing |
| `expo-media-library` | Media library access |
| `expo-av` | Audio/video playback |
| `expo-audio` | Audio recording/playback |
| `expo-video` | Video playback |
| `expo-video-thumbnails` | Video thumbnails |

#### Sensors & Location
| Package | Purpose |
|---------|---------|
| `expo-location` | GPS/location |
| `expo-sensors` | Sensor suite |
| `expo-accelerometer` | Accelerometer |
| `expo-gyroscope` | Gyroscope |
| `expo-barometer` | Barometer |
| `expo-magnetometer` | Magnetometer |
| `expo-pedometer` | Step counting |
| `expo-device-motion` | Device motion |

#### UI Components
| Package | Purpose |
|---------|---------|
| `expo-blur` | Blur effects |
| `expo-linear-gradient` | Gradient views |
| `expo-glass-effect` | Glass morphism |
| `expo-mesh-gradient` | Mesh gradients |
| `expo-checkbox` | Checkbox component |
| `expo-slider` | Slider component |

#### Navigation & Routing
| Package | Purpose |
|---------|---------|
| `expo-router` | File-based routing |
| `expo-linking` | Deep linking |
| `expo-navigation-bar` | Navigation bar control |
| `expo-screen-orientation` | Orientation control |

#### Notifications & Background
| Package | Purpose |
|---------|---------|
| `expo-notifications` | Push notifications |
| `expo-background-task` | Background tasks |
| `expo-task-manager` | Task scheduling |
| `expo-keep-awake` | Prevent sleep |

#### File System & Storage
| Package | Purpose |
|---------|---------|
| `expo-file-system` | File operations |
| `expo-document-picker` | Document picker |
| `expo-asset` | Asset management |
| `expo-sqlite` | SQLite database |
| `expo-blob` | Blob operations |

#### Networking & Connectivity
| Package | Purpose |
|---------|---------|
| `expo-network` | Network status |
| `expo-cellular` | Cellular info |
| `@react-native-community/netinfo` | Network info (community) |

#### Clipboard & Sharing
| Package | Purpose |
|---------|---------|
| `expo-clipboard` | Clipboard access |
| `expo-sharing` | Share sheets |
| `expo-sms` | SMS sending |
| `expo-mail-composer` | Email composer |

#### Contacts & Calendar
| Package | Purpose |
|---------|---------|
| `expo-contacts` | Contacts access |
| `expo-calendar` | Calendar events |

#### Haptics & Feedback
| Package | Purpose |
|---------|---------|
| `expo-haptics` | Haptic feedback |

#### Screen & Display
| Package | Purpose |
|---------|---------|
| `expo-screen-capture` | Screen capture detection |
| `expo-status-bar` | Status bar control |
| `expo-screen-orientation` | Orientation |
| `expo-brightness` | Brightness control |
| `expo-system-ui` | System UI appearance |

#### Web & Browser
| Package | Purpose |
|---------|---------|
| `expo-web-browser` | In-app browser |
| `react-native-webview` | WebView component |

#### Fonts & Text
| Package | Purpose |
|---------|---------|
| `expo-font` | Custom fonts |
| `@expo-google-fonts/*` | Google fonts |

#### Other Utilities
| Package | Purpose |
|---------|---------|
| `expo-splash-screen` | Splash screen |
| `expo-store-review` | App store reviews |
| `expo-updates` | OTA updates |
| `expo-print` | Printing |
| `expo-intent-launcher` | Android intents |
| `expo-localization` | Localization |
| `expo-battery` | Battery info |
| `expo-app-integrity` | App integrity checks |
| `expo-fingerprint` | Device fingerprinting |
| `expo-gl` | OpenGL bindings |
| `expo-live-photo` | Live photos |
| `expo-manifests` | Manifest handling |
| `expo-observe` | Observation utilities |
| `expo-server` | Server utilities |
| `expo-symbols` | SF Symbols |
| `expo-widgets` | Home screen widgets |

---

### React Navigation Packages (satya164/Callstack)

#### Core Navigation
| Package | Purpose |
|---------|---------|
| `@react-navigation/native` | React Native integration |
| `@react-navigation/stack` | Stack navigator |
| `@react-navigation/native-stack` | Native stack navigator |
| `@react-navigation/core` | Core utilities |
| `@react-navigation/routers` | Router utilities |
| `@react-navigation/elements` | UI components |

#### Tab Navigators
| Package | Purpose |
|---------|---------|
| `@react-navigation/bottom-tabs` | Bottom tabs |
| `@react-navigation/material-top-tabs` | Material top tabs |
| `@react-navigation/material-bottom-tabs` | Material bottom tabs |

#### Other Navigators
| Package | Purpose |
|---------|---------|
| `@react-navigation/drawer` | Drawer navigator |

#### Dev Tools
| Package | Purpose |
|---------|---------|
| `@react-navigation/devtools` | Navigation devtools |

#### Web Support
| Package | Purpose |
|---------|---------|
| `@react-navigation/web` | Web support |

---

### Invertase/React Native Firebase Packages (Mike Hardy)

#### Core
| Package | Purpose |
|---------|---------|
| `@react-native-firebase/app` | Firebase core (required for all modules) |

#### Authentication
| Package | Purpose |
|---------|---------|
| `@react-native-firebase/auth` | Authentication |

#### Database
| Package | Purpose |
|---------|---------|
| `@react-native-firebase/firestore` | Cloud Firestore |
| `@react-native-firebase/database` | Realtime Database |

#### Messaging
| Package | Purpose |
|---------|---------|
| `@react-native-firebase/messaging` | Cloud Messaging (FCM) |
| `@react-native-firebase/in-app-messaging` | In-App Messaging |

#### Cloud Functions
| Package | Purpose |
|---------|---------|
| `@react-native-firebase/functions` | Cloud Functions |

#### Storage
| Package | Purpose |
|---------|---------|
| `@react-native-firebase/storage` | Cloud Storage |

#### Analytics & Monitoring
| Package | Purpose |
|---------|---------|
| `@react-native-firebase/analytics` | Analytics |
| `@react-native-firebase/crashlytics` | Crashlytics |
| `@react-native-firebase/perf` | Performance Monitoring |

#### Configuration & Links
| Package | Purpose |
|---------|---------|
| `@react-native-firebase/remote-config` | Remote Config |
| `@react-native-firebase/dynamic-links` | Dynamic Links |

#### Ads
| Package | Purpose |
|---------|---------|
| `@react-native-firebase/admob` | AdMob |
| `@react-native-firebase/app-check` | App Check |

#### ML Kit
| Package | Purpose |
|---------|---------|
| `@react-native-firebase/ml` | ML Kit |
| `@react-native-firebase/ml-natural-language` | ML Natural Language |
| `@react-native-firebase/ml-vision` | ML Vision |

#### Installation
| Package | Purpose |
|---------|---------|
| `@react-native-firebase/installations` | Installations API |
| `@react-native-firebase/app-distribution` | App Distribution |

---

### Meta/Facebook React Native Core Packages

#### Core Framework
| Package | Purpose |
|---------|---------|
| `react-native` | Main framework package |
| `@react-native/codegen` | Native code generation |
| `@react-native/babel-plugin-codegen` | Babel plugin for codegen |
| `@react-native/compatibility-check` | JS/Native compatibility validation |

#### Build & Bundling
| Package | Purpose |
|---------|---------|
| `@react-native/metro-config` | Metro bundler configuration |
| `@react-native/metro-babel-transformer` | Babel transformer |
| `@react-native/babel-preset` | Babel preset |
| `@react-native/gradle-plugin` | Gradle plugin |

#### Developer Tools
| Package | Purpose |
|---------|---------|
| `@react-native/dev-middleware` | Dev server middleware |
| `@react-native/debugger-frontend` | Debugging frontend |
| `@react-native/community-cli-plugin` | CLI commands |

#### Code Quality
| Package | Purpose |
|---------|---------|
| `@react-native/eslint-config-react-native` | ESLint configuration |
| `@react-native/eslint-plugin-react-native` | ESLint rules |
| `@react-native/eslint-plugin-specs` | Spec validation |

#### Utilities
| Package | Purpose |
|---------|---------|
| `@react-native/assets-registry` | Asset resolution |
| `@react-native/js-polyfills` | JavaScript polyfills |
| `@react-native/virtualized-lists` | High-performance lists |
| `@react-native/normalize-colors` | Color normalization |
| `@react-native/asset-utils` | Asset utilities |

---

### Shopify React Native Packages

#### Core Libraries
| Package | Purpose | Stars | Version |
|---------|---------|-------|---------|
| `@shopify/flash-list` | High-performance list component | - | 2.0.2 |
| `@shopify/react-native-skia` | Skia graphics library | - | 2.11.2 |
| `@shopify/checkout-sheet-kit` | Shopify checkout integration | - | 3.8.5 |

#### Performance
| Package | Purpose |
|---------|---------|
| `@shopify/react-native-performance` | Performance measurement |
| `@shopify/react-native-performance-navigation` | Navigation performance |
| `@shopify/react-native-performance-lists-profiler` | Lists profiler |
| `@shopify/react-native-performance-navigation-drawer` | Drawer navigation performance |

**FlashList v2 Features:**
- New architecture only
- No size estimates required
- Progressive rendering
- Masonry layout support
- Maintain visible content position
- Multiple recycling pools
- Better web support

---

### Airbnb React Native Packages (64 packages on npm)

#### Core React Native
| Package | Purpose | Stars | Version |
|---------|---------|-------|---------|
| `lottie-react-native` | Lottie animations | 17,180 | 7.5.0 |
| `react-native-maps` | Map components | - | 1.29.0 |

#### Airbnb Internal (Nimbus/Lunar)
| Package | Purpose |
|---------|---------|
| `@airbnb/nimbus` | Airbnb's design system |
| `@airbnb/nimbus-common` | Nimbus common utilities |
| `@airbnb/lunar` | Lunar component library |
| `@airbnb/lunar-apollo` | Lunar Apollo integration |
| `@airbnb/lunar-app-shell` | Lunar app shell |
| `@airbnb/lunar-composer` | Lunar composer |
| `@airbnb/lunar-forms` | Lunar forms |
| `@airbnb/lunar-icons` | Lunar icons |
| `@airbnb/lunar-layouts` | Lunar layouts |
| `@airbnb/lunar-metrics` | Lunar metrics |
| `@airbnb/lunar-test-utils` | Lunar test utilities |

#### Configuration
| Package | Purpose |
|---------|---------|
| `@airbnb/config-babel` | Babel configuration |
| `@airbnb/config-danger` | Danger configuration |
| `@airbnb/config-eslint` | ESLint configuration |
| `@airbnb/config-jest` | Jest configuration |
| `@airbnb/config-prettier` | Prettier configuration |
| `@airbnb/config-typescript` | TypeScript configuration |
| `@airbnb/config-webpack` | Webpack configuration |

#### Utilities
| Package | Purpose |
|---------|---------|
| `airbnb-browser-shims` | Browser shims |
| `airbnb-colors` | Color utilities |
| `airbnb-js-shims` | JS shims |
| `@airbnb/lunar` | Lunar design system |
| `@airbnb/node-memwatch` | Node memory watcher |
| `airbnb-prop-types` | Prop types |
| `airbnb-style` | Style utilities |
| `babel-plugin-dynamic-import-node` | Dynamic import plugin |

---

### Vercel/TanStack Packages (295 packages on npm)

#### Core Data & State
| Package | Purpose |
|---------|---------|
| `@tanstack/react-query` | Data fetching and caching (React) |
| `@tanstack/react-query-devtools` | DevTools for React Query |
| `@tanstack/react-pacer` | Pacing utilities |
| `@tanstack/react-store` | State management (React) |
| `@tanstack/react-router` | Type-safe router (React) |
| `@tanstack/vue-query` | Vue adapter |
| `@tanstack/svelte-query` | Svelte adapter |
| `@tanstack/solid-query` | Solid adapter |
| `@tanstore/query` | Query adapter |
| `@tanstack/angular-query-experimental` | Angular adapter |
| `@tanstore/angular-query-devtools-experimental` | Angular devtools |

#### AI & LLM
| Package | Purpose |
|---------|---------|
| `@tanstack/ai` | AI SDK core |
| `@tanstack/ai-client` | AI client |
| `@tanstack/ai-code-mode` | AI code mode |
| `@tanstack/ai-code-mode-skills` | AI code mode skills |
| `@tanstack/ai-devtools-core` | AI devtools core |
| `@tanstack/ai-event-client` | AI event client |
| `@tanstack/ai-anthropic` | Anthropic integration |
| `@tanstack/ai-elevenlabs` | ElevenLabs integration |
| `@tanstack/ai-fal` | Fal integration |
| `@tanstack/ai-gemini` | Gemini integration |
| `@tanstack/ai-grok` | Grok integration |
| `@tanstack/ai-groq` | Groq integration |
| `@tanstack/ai-isolate-cloudflare` | Cloudflare isolate |
| `@tanstack/ai-isolate-node` | Node isolate |
| `@tanstack/ai-isolate-quickjs` | QuickJS isolate |
| `@tanstack/ai-ollama` | Ollama integration |
| `@tanstack/ai-openai` | OpenAI integration |
| `@tanstack/ai-openrouter` | OpenRouter integration |
| `@tanstack/ai-preact` | Preact AI |
| `@tanstack/ai-preact-ui` | Preact AI UI |
| `@tanstack/ai-react` | React AI |
| `@tanstack/ai-react-ui` | React AI UI |
| `@tanstack/ai-solid` | Solid AI |
| `@tanstack/ai-solid-ui` | Solid AI UI |

#### Framework Adapters
| Package | Purpose |
|---------|---------|
| `@tanstack/angular-hotkeys` | Angular hotkeys |
| `@tanstack/angular-pacer` | Angular pacer |
| `@tanstack/angular-store` | Angular store |
| `@tanstack/angular-table` | Angular table |
| `@tanstack/angular-virtual` | Angular virtual |
| `@tanstack/lit-form` | Lit form |
| `@tanstack/lit-hotkeys` | Lit hotkeys |
| `@tanstack/lit-table` | Lit table |
| `@tanstack/lit-virtual` | Lit virtual |

#### CLI & Tooling
| Package | Purpose |
|---------|---------|
| `@tanstack/cli` | TanStack CLI |
| `@tanstack/config` | Configuration utilities |
| `@tanstack/create` | Create project scaffolding |
| `@tanstack/create-router` | Create router project |
| `@tanstack/create-start` | Create Start project |
| `@tanstack/create-ui` | Create UI project |
| `@tanstack/cta-cli` | CTA CLI |
| `@tanstack/cta-custom-add-on` | CTA custom add-on |
| `@tanstack/cta-engine` | CTA engine |
| `@tanstack/cta-framework-react-cra` | CTA React CRA framework |
| `@tanstack/cta-framework-solid` | CTA Solid framework |
| `@tanstack/cta-mcp` | CTA MCP |
| `@tanstack/cta-templates-react-cra` | CTA React CRA templates |
| `@tanstack/cta-ui` | CTA UI |
| `@tanstack/cta-ui-base` | CTA UI base |

#### Database & Persistence
| Package | Purpose |
|---------|---------|
| `@tanstack/electric-db-collection` | Electric DB collection |
| `@tanstack/electron-db-sqlite-persistence` | Electron SQLite persistence |
| `@tanstack/expo-db-sqlite-persistence` | Expo SQLite persistence |
| `@tanstack/node-db-sqlite-persistence` | Node SQLite persistence |
| `@tanstack/offline-transactions` | Offline transactions |

#### Form & Validation
| Package | Purpose |
|---------|---------|
| `@tanstack/form-core` | Form core |
| `@tanstack/form-devtools` | Form devtools |
| `@tanstack/arktype-adapter` | Arktype adapter |

#### Utilities
| Package | Purpose |
|---------|---------|
| `@tanstack/history` | History management |
| `@tanstack/hotkeys` | Hotkeys |
| `@tanstack/hotkeys-devtools` | Hotkeys devtools |
| `@tanstack/intent` | Intent utilities |
| `@tanstack/loaders` | Loaders |
| `@tanstack/location-core` | Location core |
| `@tanstack/match-sorter-utils` | Match sorter utilities |
| `@tanstack/bling` | Bling utilities |

#### Build Tools
| Package | Purpose |
|---------|---------|
| `@tanstack/nitro-v2-vite-plugin` | Nitro v2 Vite plugin |
| `@tanstack/dom-core` | DOM core |
| `@tanstack/dom-vite` | DOM Vite |

#### Code Quality
| Package | Purpose |
|---------|---------|
| `@tanstack/eslint-config` | ESLint configuration |
| `@tanstack/eslint-plugin-query` | ESLint plugin for query |
| `@tanstack/eslint-plugin-router` | ESLint plugin for router |
| `@tanstack/eslint-plugin-start` | ESLint plugin for Start |

---

### OneSignal Packages

| Package | Purpose | Version |
|---------|---------|---------|
| `react-native-onesignal` | Push notifications SDK | 5.5.7 |
| `onesignal-expo-plugin` | Expo config plugin | Latest |

**Features:**
- Push notifications
- In-app messages
- SMS and email
- Location support (optional)
- TurboModule support (RN 0.79+)

---

### AWS/Amazon Amplify Packages

#### Core Amplify
| Package | Purpose |
|---------|---------|
| `aws-amplify` | Core Amplify library for cloud-enabled apps |
| `@aws-amplify/core` | Amplify core utilities |
| `@aws-amplify/ui-react-native` | UI components for React Native |

#### Authentication
| Package | Purpose |
|---------|---------|
| `@aws-amplify/auth` | Authentication (Amazon Cognito) |
| `amazon-cognito-identity-js` | Cognito identity SDK |

#### API & Data
| Package | Purpose |
|---------|---------|
| `@aws-amplify/api` | REST/GraphQL API (API Gateway, AppSync) |
| `@aws-amplify/datastore` | Offline-first data synchronization |
| `@aws-amplify/pubsub` | Pub/Sub (AWS IoT) |

#### Storage
| Package | Purpose |
|---------|---------|
| `@aws-amplify/storage` | Storage (Amazon S3) |

#### Analytics & Monitoring
| Package | Purpose |
|---------|---------|
| `@aws-amplify/analytics` | Analytics (Amazon Pinpoint) |
| `@aws-amplify/push-notifications` | Push notifications |

#### Predictions & AI
| Package | Purpose |
|---------|---------|
| `@aws-amplify/predictions` | ML predictions (Comprehend, Polly, Rekognition, Textract, Translate) |
| `@aws-amplify/interactions` | Conversational bots (Amazon Lex) |

#### Geo
| Package | Purpose |
|---------|---------|
| `@aws-amplify/geo` | Maps and location (Amazon Location Service) |

#### CLI & Tools
| Package | Purpose |
|---------|---------|
| `@aws-amplify/cli` | Amplify CLI for backend provisioning |
| `aws-amplify-react-native` | React Native specific utilities |

**Note:** Amplify provides a complete backend-as-a-service solution with authentication, storage, APIs, and more. Currently using Supabase in the workspace.

---

### Bluesky/AT Protocol Packages

#### Core AT Protocol
| Package | Purpose |
|---------|---------|
| `@atproto/api` | Client library (legacy) |
| `@atproto/lex` | Type-safe SDK (recommended) |
| `@atproto/lexicon` | Schema definition language |
| `@atproto/crypto` | Cryptographic signing |
| `@atproto/identity` | DID/handle resolution |
| `@atproto/repo` | Data storage structure |
| `@atproto/syntax` | String parsers |
| `@atproto/xrpc` | HTTP API helpers |
| `@atproto/xrpc-server` | Server-side helpers |
| `@atproto/common` | Shared code (non-browser) |
| `@atproto/common-web` | Shared code (browser) |

#### Bluesky Services
| Package | Purpose |
|---------|---------|
| `@atproto/bsky` | Bluesky AppView service implementation |
| `@atproto/pds` | Personal Data Server (PDS) |
| `@atproto/sync` | Sync tools (firehose/relay) |

#### OAuth
| Package | Purpose |
|---------|---------|
| `@atproto/oauth-client` | OAuth client |
| `@atproto/oauth-client-browser` | Browser OAuth client |
| `@atproto/oauth-client-node` | Node OAuth client |

#### Development
| Package | Purpose |
|---------|---------|
| `@bluesky-social/dev-env` | Development environment |
| `@bluesky-social/did` | DID resolution and verification |

#### Third-Party
| Package | Purpose |
|---------|---------|
| `@skyware/jetstream` | Jetstream client |
| `@atcute/bluesky` | Bluesky schema definitions |
| `@atcute/atproto` | AT Protocol utilities |
| `@atcute/lexicons` | Lexicon utilities |

---

### State Management Libraries

#### Redux
| Package | Purpose |
|---------|---------|
| `redux` | Predictable state container |
| `@reduxjs/toolkit` | Official Redux toolkit (recommended) |
| `react-redux` | React bindings for Redux |
| `redux-persist` | Persist and rehydrate Redux store |
| `redux-thunk` | Thunk middleware for Redux |
| `redux-saga` | Saga middleware for Redux |
| `redux-observable` | RxJS middleware for Redux |

#### MobX
| Package | Purpose |
|---------|---------|
| `mobx` | Simple, scalable state management |
| `mobx-react` | React bindings for MobX |
| `mobx-react-lite` | Lightweight React bindings (function components only) |
| `mobx-persist` | Persist MobX state |

#### Jotai
| Package | Purpose |
|---------|---------|
| `jotai` | Primitive and flexible state management |
| `jotai/react` | React bindings for Jotai |
| `jotai/utils` | Jotai utilities (storage, immer, etc.) |
| `jotai/optics` | Optics integration |
| `jotai/immer` | Immer integration |
| `jotai/query` | Query integration |
| `jotai/xray` | Dev tools |

#### Zustand
| Package | Purpose |
|---------|---------|
| `zustand` | Small, fast state management |
| `zustand/middleware` | Zustand middleware (persist, immer, devtools) |

**Note:** Currently using Zustand in the workspace (@repo/core package.json).

---

### Icon Libraries

#### react-native-vector-icons (oblador)
| Package | Purpose |
|---------|---------|
| `react-native-vector-icons` | Main package (legacy, now split) |
| `@react-native-vector-icons/ant-design` | Ant Design icons |
| `@react-native-vector-icons/entypo` | Entypo icons |
| `@react-native-vector-icons/evil-icons` | Evil Icons |
| `@react-native-vector-icons/feather` | Feather icons |
| `@react-native-vector-icons/fontawesome` | FontAwesome icons |
| `@react-native-vector-icons/fontawesome5` | FontAwesome 5 icons |
| `@react-native-vector-icons/fontawesome6` | FontAwesome 6 icons |
| `@react-native-vector-icons/fontisto` | Fontisto icons |
| `@react-native-vector-icons/foundation` | Foundation icons |
| `@react-native-vector-icons/ionicons` | Ionicons |
| `@react-native-vector-icons/material-community-icons` | Material Community Icons |
| `@react-native-vector-icons/material-icons` | Material Icons |
| `@react-native-vector-icons/octicons` | Octicons |
| `@react-native-vector-icons/simple-line-icons` | Simple Line Icons |
| `@react-native-vector-icons/zocial` | Zocial icons |
| `@react-native-vector-icons/zest` | Zest icons |
| `@react-native-vector-icons/lucide` | Lucide icons |

#### Expo Vector Icons
| Package | Purpose |
|---------|---------|
| `@expo/vector-icons` | Expo compatibility layer for react-native-vector-icons |

**Note:** The workspace uses @expo/vector-icons (included in expo package).

---

### Form Libraries

#### Formik
| Package | Purpose |
|---------|---------|
| `formik` | Build forms in React without tears |
| `yup` | Schema validation (often paired with Formik) |

#### React Hook Form
| Package | Purpose |
|---------|---------|
| `react-hook-form` | Performant, flexible form library |
| `@hookform/resolvers` | Validation schema resolvers (Zod, Yup, etc.) |

#### Validation Libraries
| Package | Purpose |
|---------|---------|
| `zod` | Schema validation with TypeScript inference |
| `yup` | Schema validation |
| `ajv` | JSON Schema validator |

**Note:** Currently using no dedicated form library in the workspace.

---

### Testing Libraries

#### Detox (Wix)
| Package | Purpose |
|---------|---------|
| `detox` | Gray box E2E testing framework |
| `detox-cli` | Detox CLI |

#### Unit Testing
| Package | Purpose |
|---------|---------|
| `@testing-library/react-native` | React Native testing utilities (Callstack) |
| `jest` | JavaScript testing framework |
| `@testing-library/jest-native` | Jest custom matchers for React Native |

**Note:** Currently using @testing-library/react-native in the workspace.

---

### Important Individual Maintainers

#### Core React Native Contributors
| Name | GitHub | Key Packages |
|------|--------|-------------|
| **Satyajit Sahoo (satya164)** | @satya164 | React Navigation, React Native Paper, Linaria |
| **Mike Hardy** | @mikehardy | React Native Firebase, device-info, netinfo |
| **Thibault Malbranche (titozzz)** | @titozzz | Core RN contributor |
| **Mathieu Acthernoene (zoontek)** | @zoontek | react-native-permissions, react-native-localize |
| **Fabrizio Bertoglio (fabOnReact)** | @fabOnReact | Core RN contributor |
| **William Candillon (wcandillon)** | @wcandillon | React Native education, Reanimated demos |
| **Joel Arvidsson (oblador)** | @oblador | react-native-vector-icons, react-native-keychain, react-native-animatable |

#### Other Notable Contributors
| Name | GitHub | Key Packages |
|------|--------|-------------|
| **Michał Pierzchała (thymikee)** | @thymikee | React Native testing, Callstack |
| **Krzysztof Magiera** | @kmagiera | React Native Reanimated (SWM) |
| **Tanner Linsley** | @tannerlinsley | TanStack (Query, Router, Table) |
| **Michel Weststrate** | @mweststrate | MobX |

---

### React Native Community Packages

#### Core Components
| Package | Purpose | Status |
|---------|---------|--------|
| `@react-native-community/async-storage` | Async storage | Migrated to @react-native-async-storage |
| `@react-native-community/netinfo` | Network info | Active |
| `@react-native-community/datetimepicker` | Date/time picker | Active |
| `@react-native-community/slider` | Slider | Active |
| `@react-native-community/segmented-control` | Segmented control | Active |
| `@react-native-community/masked-view` | Masked view | Migrated to @react-native-masked-view |
| `@react-native-community/picker` | Picker | Migrated to @react-native-picker |
| `@react-native-community/clipboard` | Clipboard | Migrated to expo-clipboard |
| `@react-native-community/geolocation` | Geolocation | Active |
| `@react-native-community/push-notification-ios` | iOS notifications | Active |
| `@react-native-community/image-editor` | Image editing | Active |
| `@react-native-community/cameraroll` | Camera roll | Active |
| `@react-native-community/blur` | Blur effects | Active |
| `@react-native-community/google-signin` | Google Sign-In | Active |
| `@react-native-community/checkbox` | Checkbox | Active |
| `@react-native-community/progress-bar-android` | Progress bar | Active |
| `@react-native-community/viewpager` | ViewPager | Active |
| `@react-native-community/status-bar` | Status bar | Active |
| `@react-native-community/audio-toolkit` | Audio toolkit | Active |

#### CLI & Tools
| Package | Purpose |
|---------|---------|
| `@react-native-community/cli` | React Native CLI |
| `@react-native-community/cli-tools` | CLI tools |
| `@react-native-community/cli-platform-android` | Android platform CLI |
| `@react-native-community/cli-platform-ios` | iOS platform CLI |
| `@react-native-community/cli-types` | CLI types |
| `@react-native-community/cli-debugger-ui` | Debugger UI |
| `@react-native-community/cli-config` | CLI config |
| `@react-native-community/cli-clean` | CLI clean |
| `@react-native-community/cli-link-assets` | Asset linking |

#### Development Tools
| Package | Purpose |
|---------|---------|
| `@react-native-community/eslint-config` | ESLint config |
| `@react-native-community/eslint-plugin` | ESLint plugin |
| `@react-native-community/hooks` | React hooks for RN APIs |
| `@react-native-community/upgrade-helper` | Upgrade assistance |
| `@react-native-community/template-typescript` | TypeScript template |

---

## Current Workspace Dependencies

### apps/gurudevi-mobile/package.json

#### Installed Major Ecosystem Packages

**Expo SDK 57 Packages (Installed):**
- expo (~57.0.18)
- expo-age-range (~57.0.4)
- expo-apple-authentication (~57.0.1)
- expo-application (~57.0.2)
- expo-asset (~57.0.15)
- expo-audio (~57.0.4)
- expo-auth-session (~57.0.10)
- expo-background-task (~57.0.14)
- expo-battery (~57.0.2)
- expo-blob (~57.0.1)
- expo-blur (~57.0.2)
- expo-brightness (~57.0.1)
- expo-build-properties (~57.0.15)
- expo-calendar (~57.0.2)
- expo-camera (~57.0.4)
- expo-cellular (~57.0.1)
- expo-checkbox (~57.0.0)
- expo-clipboard (~57.0.1)
- expo-constants (~57.0.16)
- expo-contacts (~57.0.4)
- expo-crypto (~57.0.2)
- expo-dev-client (~57.0.16)
- expo-device (~57.0.1)
- expo-document-picker (~57.0.1)
- expo-file-system (~57.0.6)
- expo-font (~57.0.2)
- expo-gl (~57.0.2)
- expo-glass-effect (~57.0.1)
- expo-haptics (~57.0.2)
- expo-image (~57.0.3)
- expo-image-manipulator (~57.0.14)
- expo-image-picker (~57.0.14)
- expo-intent-launcher (~57.0.1)
- expo-keep-awake (~57.0.1)
- expo-linear-gradient (~57.0.1)
- expo-linking (~57.0.8)
- expo-live-photo (~57.0.1)
- expo-local-authentication (~57.0.2)
- expo-localization (~57.0.1)
- expo-location (~57.0.14)
- expo-mail-composer (~57.0.1)
- expo-manifests (~57.0.1)
- expo-media-library (~57.0.4)
- expo-mesh-gradient (~57.0.1)
- expo-navigation-bar (~57.0.2)
- expo-network (~57.0.1)
- expo-notifications (~57.0.15)
- expo-observe (~57.0.17)
- expo-print (~57.0.1)
- expo-router (~57.0.17)
- expo-screen-capture (~57.0.2)
- expo-screen-orientation (~57.0.2)
- expo-secure-store (~57.0.2)
- expo-sensors (~57.0.2)
- expo-server (~57.0.3)
- expo-sharing (~57.0.16)
- expo-sms (~57.0.1)
- expo-splash-screen (~57.0.8)
- expo-sqlite (~57.0.2)
- expo-status-bar (~57.0.1)
- expo-store-review (~57.0.2)
- expo-symbols (~57.0.2)
- expo-system-ui (~57.0.3)
- expo-task-manager (~57.0.14)
- expo-updates (~57.0.19)
- expo-video (~57.0.3)
- expo-video-thumbnails (~57.0.1)
- expo-web-browser (~57.0.2)
- expo-widgets (~57.0.15)

**SWM/Software Mansion Packages (Installed):**
- react-native-gesture-handler (3.0.2) - *Note: Sacred version per AGENTS.md*
- react-native-reanimated (^4.5.0) - *Note: Sacred version per AGENTS.md*
- react-native-worklets (^0.11.1) - *Note: Sacred version per AGENTS.md*
- @swmansion/react-native-bottom-sheet (^0.14.1)

**Shopify Packages (Installed):**
- @shopify/flash-list (2.0.2)
- @shopify/react-native-skia (2.11.2) - *Note: Sacred version per AGENTS.md*

**Airbnb Packages (Installed):**
- lottie-react-native (~7.5.0)
- react-native-maps (1.29.0)

**TanStack Packages (Installed):**
- @tanstack/react-pacer (^0.22.1)
- @tanstack/react-query (^5.102.0)

**React Native Community Packages (Installed):**
- @react-native-async-storage/async-storage (2.2.0)
- @react-native-community/datetimepicker (9.1.0)
- @react-native-community/netinfo (12.0.1)
- @react-native-community/slider (5.2.0)
- @react-native-masked-view/masked-view (0.3.2)
- @react-native-picker/picker (2.11.4)
- @react-native-segmented-control/segmented-control (2.5.7)

**Other Key Packages (Installed):**
- react-native (0.86.2)
- react-native-safe-area-context (5.8.0)
- react-native-screens (~4.26.2)
- react-native-svg (15.15.4)
- react-native-pager-view (^8.0.5)
- react-native-webview (^13.17.0)
- react-native-mmkv (^4.3.2) - *Note: Sacred version per AGENTS.md*
- react-native-nitro-modules (^0.36.1) - *Note: Sacred version per AGENTS.md*
- @sentry/react-native (~8.23.0)
- @stripe/stripe-react-native (0.64.0)
- @supabase/supabase-js (2.102.1)
- @powersync/react-native (2.1.0)

---

## Gap Analysis

### Missing Callstack Packages

**High Priority:**
- `react-native-paper` - Material Design components (14K stars, widely used)
- `reassure` - Performance testing companion
- `@callstack/repack` - Alternative bundler (if Webpack preferred over Metro)

**Medium Priority:**
- `react-native-bottom-tabs` - Native bottom tabs (alternative to navigation)
- `linaria` - Zero-runtime CSS-in-JS (if CSS-in-JS needed)
- `react-native-slider` - Slider component (already using community version)

**Low Priority:**
- `@callstack/haul` - Legacy bundler
- Various agent/dev tools (unless needed for specific use cases)

### Missing SWM Packages

**High Priority:**
- `react-native-audio-api` - Advanced audio features
- `@swmansion/smelter` - Video mixing (if video features needed)

**Medium Priority:**
- `react-native-wallet` - Apple/Google Wallet integration
- `react-native-shine` - GPU shader effects
- `detour` - Deferred deep links

**Low Priority:**
- GPU/TypeGPU packages (unless doing advanced graphics)
- Elixir/Membrane packages (backend-focused)

### Missing Expo SDK 57 Packages

**Potentially Useful:**
- `expo-barometer` - Barometer sensor
- `expo-accelerometer` - Accelerometer (if not using expo-sensors)
- `expo-gyroscope` - Gyroscope (if not using expo-sensors)
- `expo-magnetometer` - Magnetometer (if not using expo-sensors)
- `expo-pedometer` - Step counting
- `expo-device-motion` - Device motion
- `expo-background-fetch` - Background fetch (different from background-task)

**Note:** Most Expo SDK 57 packages are already installed. The missing ones are primarily sensor-specific or legacy variants.

### Missing Meta/Facebook Packages

**Already Included:**
- Core `react-native` package
- Most utilities are included transitively

**Potentially Useful:**
- `@react-native/codegen` - If creating custom native modules
- `@react-native/eslint-config-react-native` - ESLint configuration (if not using custom config)

### Missing Shopify Packages

**Status:** Core Shopify packages installed, performance packages missing:
- `@shopify/flash-list` ✅
- `@shopify/react-native-skia` ✅
- `@shopify/checkout-sheet-kit` ❌ (Shopify checkout integration)
- `@shopify/react-native-performance` ❌ (Performance measurement)
- `@shopify/react-native-performance-navigation` ❌ (Navigation performance)

**Recommendation:** Add performance packages if performance profiling is needed. Add checkout-sheet-kit only if integrating with Shopify commerce.

### Missing Airbnb Packages

**Status:** Core React Native packages installed, internal packages not applicable:
- `lottie-react-native` ✅
- `react-native-maps` ✅
- `@airbnb/*` packages ❌ (Airbnb internal - not applicable)

**Note:** Airbnb's Nimbus/Lunar packages are internal to Airbnb and not meant for external use.

### Missing React Navigation Packages

**Status:** Not installed (using expo-router instead):
- `@react-navigation/native` ❌
- `@react-navigation/native-stack` ❌
- `@react-navigation/stack` ❌
- `@react-navigation/bottom-tabs` ❌
- `@react-navigation/drawer` ❌

**Recommendation:** Keep using expo-router (file-based routing) which is the modern Expo-recommended approach. React Navigation is still used under the hood by expo-router.

### Missing Invertase/React Native Firebase Packages

**Status:** Not installed:
- `@react-native-firebase/app` ❌
- All Firebase modules ❌

**Recommendation:** Add only if using Firebase services (auth, firestore, messaging, analytics, etc.). Currently using Supabase for backend services.

### Missing TanStack Packages

**Potentially Useful:**
- `@tanstack/react-query-devtools` - DevTools for debugging queries

### Missing OneSignal Packages

**Status:** Not installed
- `react-native-onesignal` - Push notifications
- `onesignal-expo-plugin` - Expo plugin

**Recommendation:** Add if push notifications are needed beyond expo-notifications

### Missing Bluesky/AT Protocol Packages

**Status:** Not installed
- All `@atproto/*` and `@bluesky-social/*` packages

**Recommendation:** Add only if integrating with Bluesky social network or AT Protocol

### Missing React Native Community Packages

**Potentially Useful:**
- `@react-native-community/blur` - Blur effects (using expo-blur instead)
- `@react-native-community/google-signin` - Google Sign-In
- `@react-native-community/hooks` - React hooks for RN APIs
- `@react-native-community/upgrade-helper` - Upgrade assistance (dev tool)

**Note:** Many community packages have been migrated to Expo or other scopes.

---

## Integration Guidance

### Callstack Packages

#### react-native-paper (Material Design)
**Installation:**
```bash
npx expo install react-native-paper
```

**Integration:**
```typescript
import { PaperProvider, Button, TextInput } from 'react-native-paper';

export default function App() {
  return (
    <PaperProvider>
      <Button mode="contained">Press me</Button>
      <TextInput label="Email" />
    </PaperProvider>
  );
}
```

**Use Case:** Material Design UI components, consistent with Google's design system

#### reassure (Performance Testing)
**Installation:**
```bash
npm install --save-dev reassure
```

**Integration:**
```bash
npx reassure measure
```

**Use Case:** Performance regression testing for components

### SWM Packages

#### react-native-audio-api
**Installation:**
```bash
npm install react-native-audio-api
```

**Integration:**
```typescript
import { AudioPlayer } from 'react-native-audio-api';

const player = new AudioPlayer();
await player.load('file.mp3');
await player.play();
```

**Use Case:** Advanced audio features, real-time visualization, multi-track playback

#### detour (Deferred Deep Links)
**Installation:**
```bash
npm install @swmansion/detour
```

**Integration:**
```typescript
import { Detour } from '@swmansion/detour';

const detour = new Detour('YOUR_API_KEY');
```

**Use Case:** Deferred deep linking that preserves context across installs

### OneSignal Packages

#### react-native-onesignal
**Installation:**
```bash
npm install react-native-onesignal
npx expo install onesignal-expo-plugin
```

**app.json Configuration:**
```json
{
  "expo": {
    "plugins": [
      [
        "onesignal-expo-plugin",
        {
          "mode": "development",
          "disableLocation": true
        }
      ]
    ]
  }
}
```

**Integration:**
```typescript
import { OneSignal } from 'react-native-onesignal';

OneSignal.initialize('YOUR_APP_ID');
OneSignal.Notifications.requestPermission(true);
```

**Use Case:** Push notifications, in-app messages, SMS, email (alternative to expo-notifications)

**Note:** Requires OneSignal account and app configuration

### Bluesky/AT Protocol Packages

#### @atproto/lex (Recommended)
**Installation:**
```bash
npm install @atproto/lex
```

**Integration:**
```typescript
import { createClient } from '@atproto/lex';

const client = createClient({
  service: 'https://api.bsky.app',
});

const agent = await client.login({
  identifier: 'handle.bsky.social',
  password: 'app-password',
});
```

**Use Case:** Integrating with Bluesky social network, building AT Protocol clients

### React Native Community Packages

#### @react-native-community/google-signin
**Installation:**
```bash
npm install @react-native-community/google-signin
```

**Integration:**
```typescript
import { GoogleSignin } from '@react-native-community/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID',
});

const result = await GoogleSignin.signIn();
```

**Use Case:** Google Sign-In authentication

#### @react-native-community/hooks
**Installation:**
```bash
npm install @react-native-community/hooks
```

**Integration:**
```typescript
import { useDimensions, useDeviceOrientation } from '@react-native-community/hooks';

const { width, height } = useDimensions().window;
const orientation = useDeviceOrientation();
```

**Use Case:** React hooks for common React Native APIs

---

## Sacred Versions (Per AGENTS.md)

**Do NOT change without explicit user approval:**

| Package | Sacred Version | Reason |
|---------|----------------|--------|
| react-native-gesture-handler | 3.2.1 | RNGH v3 for new arch |
| react-native-reanimated | 4.6.0 | Reanimated 4 for new arch |
| react-native-worklets | 0.12.1 | Required by reanimated 4 |
| react-native-mmkv | 4.3.2 | Nitro modules v4 |
| react-native-nitro-modules | 0.37.1 | Required by mmkv 4 / Nitro v0.37 |
| @shopify/react-native-skia | 2.11.1 | New arch Skia |
| typescript | 7.0.2 | Latest stable |

**Current Workspace Status:**
- react-native-gesture-handler: 3.0.2 ⚠️ (Below sacred version)
- react-native-reanimated: 4.5.0 ⚠️ (Below sacred version)
- react-native-worklets: 0.11.1 ⚠️ (Below sacred version)
- react-native-mmkv: 4.3.2 ✅ (Matches sacred version)
- react-native-nitro-modules: 0.36.1 ⚠️ (Below sacred version)
- @shopify/react-native-skia: 2.11.2 ✅ (Matches sacred version)
- typescript: 7.0.2 ✅ (Matches sacred version)

**Recommendation:** Review sacred version compliance with user before making changes.

---

## Production Hardening Analysis

### Current Workspace State vs Ecosystem Standards

#### Currently Installed (Production-Ready Stack)

**Core Framework & Navigation**
- ✅ React Native 0.86.2
- ✅ Expo SDK 57 (60+ packages)
- ✅ expo-router (file-based routing, modern Expo approach)
- ✅ react-native-safe-area-context

**Animation & Gesture**
- ✅ react-native-reanimated 4.5.0
- ✅ react-native-gesture-handler 3.0.2
- ✅ react-native-screens 4.26.2
- ✅ @swmansion/react-native-bottom-sheet 0.14.1

**Performance & Lists**
- ✅ @shopify/flash-list 2.0.2
- ✅ @shopify/react-native-skia 2.11.2
- ✅ react-native-pager-view 8.0.5

**State Management**
- ✅ zustand 5.0.15 (lightweight, production-ready)
- ✅ xstate 5.32.5 (state machines for complex flows)

**Data Fetching**
- ✅ @tanstack/react-query 5.102.0
- ✅ @tanstack/react-pacer 0.22.1

**Backend & Sync**
- ✅ Supabase (auth, database, realtime)
- ✅ PowerSync (offline-first sync)
- ✅ Drizzle ORM
- ✅ ZenStack (access control)

**Monitoring & Analytics**
- ✅ @sentry/react-native 8.23.0 (error tracking)
- ✅ posthog-react-native 4.63.5 (analytics)
- ✅ reassure 1.6.0 (performance testing)
- ✅ @rozenite/performance-monitor-plugin 1.12.0

**Storage & Security**
- ✅ react-native-mmkv 4.3.2 (fast storage)
- ✅ expo-secure-store (secure key-value)
- ✅ react-native-keychain (via peer deps)
- ✅ @react-native-async-storage/async-storage 2.2.0
- ✅ react-native-ssl-public-key-pinning 1.2.6 (SSL pinning)

**Authentication**
- ✅ expo-apple-authentication
- ✅ expo-auth-session
- ✅ react-native-nitro-google-signin 1.3.0

**Payments**
- ✅ @stripe/stripe-react-native 0.64.0

**ML & AI**
- ✅ @react-native-ml-kit/barcode-scanning 2.0.0
- ✅ @react-native-ml-kit/text-recognition 2.0.0

**Icons & UI**
- ✅ @react-native-vector-icons/lucide 13.1.2
- ✅ lucide-react 1.33.0
- ✅ phosphor-react-native 3.0.6
- ✅ react-native-nano-icons 0.1.8

**Maps & Location**
- ✅ react-native-maps 1.29.0
- ✅ expo-location

**Testing**
- ✅ @testing-library/react-native 14.0.0-beta.0
- ✅ @playwright/test 1.62.1 (E2E)
- ✅ vitest 4.1.11 (unit testing)
- ✅ jest-expo

**Forms**
- ✅ Custom form-builder (@intuitui-labs/form-builder-engine)
- ✅ zod 4.4.3 (validation)

#### Missing Production-Critical Packages

**Priority 1: Critical for Production**

| Package | Why Missing | Impact | Recommendation |
|---------|-------------|--------|----------------|
| `@tanstack/react-query-devtools` | Not installed | Difficult to debug query issues in production builds | **ADD** - Essential for debugging data fetching |
| `@shopify/react-native-performance` | Not installed | No performance profiling data | **ADD** - Critical for production performance monitoring |
| `@react-native-community/hooks` | Not installed | Missing useful RN hooks | **ADD** - Low overhead, high value |

**Priority 2: Important for Production Hardening**

| Package | Why Missing | Impact | Recommendation |
|---------|-------------|--------|----------------|
| `react-native-paper` | Not installed | No Material Design system | **OPTIONAL** - Only if Material Design needed |
| `@react-native-community/google-signin` | Using nitro-google-signin | Alternative already installed | **KEEP CURRENT** - Nitro version is newer architecture |
| `detox` | Using Playwright | Gray-box E2E testing | **EVALUATE** - Detox better for native E2E, Playwright for web |

**Priority 3: Nice to Have**

| Package | Why Missing | Impact | Recommendation |
|---------|-------------|--------|----------------|
| `react-native-permissions` | Not installed | Permission handling may be manual | **ADD** - Standardizes permission requests |
| `react-native-localize` | Not installed | Manual locale handling | **ADD** - Better i18n support |
| `@react-native-community/netinfo` | ✅ Already installed | - | **KEEP** - Essential for offline handling |

#### Intentionally Not Using (Good Alternatives)

| Ecosystem Package | Workspace Alternative | Reason |
|-------------------|----------------------|--------|
| React Navigation | expo-router | File-based routing is Expo's recommended approach |
| Invertase Firebase | Supabase | Supabase provides auth, database, realtime in one |
| AWS Amplify | Supabase | Supabase is already integrated |
| OneSignal | expo-notifications | Expo's native notification system |
| Redux/MobX/Jotai | Zustand | Zustand is lighter and sufficient |
| Formik/React Hook Form | Custom form-builder | Custom solution tailored to needs |
| react-native-vector-icons (full) | @react-native-vector-icons/lucide + others | Tree-shaking with individual icon sets |

#### Sacred Version Compliance Issues

| Package | Current | Sacred | Status | Action |
|---------|---------|--------|--------|-------|
| react-native-gesture-handler | 3.0.2 | 3.2.1 | ⚠️ Below | **UPGRADE** - Required for new arch |
| react-native-reanimated | 4.5.0 | 4.6.0 | ⚠️ Below | **UPGRADE** - Required for new arch |
| react-native-worklets | 0.11.1 | 0.12.1 | ⚠️ Below | **UPGRADE** - Required by reanimated 4.6 |
| react-native-nitro-modules | 0.36.1 | 0.37.1 | ⚠️ Below | **UPGRADE** - Required by mmkv 4.3 |
| @shopify/react-native-skia | 2.11.2 | 2.11.2 | ✅ Match | - |
| react-native-mmkv | 4.3.2 | 4.3.2 | ✅ Match | - |
| typescript | 7.0.2 | 7.0.2 | ✅ Match | - |

### Production Readiness Score: 85/100

**Strengths:**
- Comprehensive monitoring (Sentry + PostHog)
- Offline-first architecture (PowerSync)
- Secure storage (MMKV + secure-store + keychain)
- Performance testing (reassure)
- E2E testing (Playwright)
- Type safety (TypeScript + Zod)
- Modern stack (Expo 57, RN 0.86, new architecture compatible)

**Gaps:**
- Query devtools missing (debugging difficulty)
- Performance profiling missing (production visibility)
- Sacred version compliance (4 packages below sacred versions)
- Permission handling not standardized
- Detox not evaluated for native E2E

### Recommended Action Plan

**Immediate (Before Production):**
1. Add `@tanstack/react-query-devtools` for query debugging
2. Add `@shopify/react-native-performance` for production profiling
3. Add `@react-native-community/hooks` for better RN hooks
4. Upgrade sacred versions: gesture-handler, reanimated, worklets, nitro-modules
5. Review @shopify/react-native-skia version alignment

**Short-term (Next Sprint):**
1. Evaluate Detox vs Playwright for native E2E testing
2. Add `react-native-permissions` for standardized permission handling
3. Add `react-native-localize` for better i18n support
4. Set up performance monitoring dashboards

**Long-term (As Needed):**
1. Consider `react-native-paper` if Material Design components needed
2. Evaluate TanStack AI packages if adding AI features
3. Consider TanStack Router if outgrowing expo-router

---

### Documentation Scope
This document now covers **700+ packages** across major React Native ecosystem organizations and categories:
- **Callstack:** 57 packages (core libraries, build tooling, AI tools, infrastructure)
- **Software Mansion (SWM):** 30+ packages (animation, gesture, audio, GPU, developer tools)
- **Expo:** 100+ packages (SDK 57 modules, tooling, CLI, build tools)
- **Meta/Facebook:** 20+ packages (core framework, build tools, dev tools, utilities)
- **Shopify:** 7 packages (FlashList, Skia, performance tools, checkout kit)
- **Airbnb:** 64 packages (Lottie, Maps, internal Nimbus/Lunar design system)
- **Vercel/TanStack:** 295 packages (Query, Router, AI, framework adapters, tooling)
- **OneSignal:** 2 packages (push notifications, Expo plugin)
- **Bluesky/AT Protocol:** 20+ packages (core protocol, services, OAuth, third-party clients)
- **React Navigation:** 10+ packages (navigators, dev tools, web support)
- **Invertase Firebase:** 20+ packages (Firebase modules, analytics, ML Kit)
- **AWS/Amazon Amplify:** 15 packages (backend-as-a-service, auth, storage, API, ML)
- **State Management:** 20+ packages (Redux, MobX, Jotai, Zustand)
- **Icon Libraries:** 19 packages (react-native-vector-icons, Expo vector-icons)
- **Form Libraries:** 7 packages (Formik, React Hook Form, validation)
- **Testing Libraries:** 5 packages (Detox, unit testing)
- **Important Individual Maintainers:** 11 key contributors documented

### Current Coverage
The workspace has excellent coverage of major React Native ecosystem packages:
- **Expo SDK 57:** Nearly complete (60+ packages installed)
- **SWM:** Core animation/gesture packages installed
- **Shopify:** Core packages installed (FlashList, Skia), performance packages missing
- **Airbnb:** Core React Native packages installed (Lottie, Maps)
- **TanStack:** Query installed, devtools and many other packages missing
- **React Navigation:** Not installed (using expo-router instead)
- **React Native Community:** Key packages installed
- **Invertase Firebase:** Not installed (using Supabase instead)

### Recommended Additions
1. **@tanstack/react-query-devtools** - Query debugging
2. **@shopify/react-native-performance** - Performance measurement (if needed)
3. **react-native-paper** - Material Design components
4. **@react-native-community/hooks** - Useful React hooks
5. **@react-native-community/google-signin** - If Google auth needed

### Optional Additions
1. **Bluesky/AT Protocol** - Only if integrating with Bluesky
2. **SWM audio/video packages** - Only if advanced multimedia needed
3. **Invertase Firebase** - Only if switching from Supabase to Firebase
4. **TanStack AI packages** - Only if adding AI/LLM features
5. **TanStack Router** - Only if switching from expo-router

### Version Compliance
Several packages are below sacred versions per AGENTS.md. Review with user before upgrading.
