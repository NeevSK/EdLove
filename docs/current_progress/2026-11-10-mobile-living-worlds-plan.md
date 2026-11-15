---
title: "Gurudevi mobile: living worlds plan"
status: "active"
created: 2026-11-10
updated: 2026-11-15
author: "Neev"
scribe: "Claude"
tags: [gurudevi-mobile, worlds, verger, shell, plan]
source: "https://claude.ai/artifact/Fk9nwKvrmYDC6za3Ae2fzy"
---

> **Copied into the repo on 2026-11-15** from the claude.ai page https://claude.ai/artifact/Fk9nwKvrmYDC6za3Ae2fzy so the context lives with the code. The page may keep changing; this file is the version of 15 Nov 2026. The five phases were built on `claude/project-thread-g4vy3a` (draft PR #151).

# Gurudevi mobile: living worlds plan

2026-11-10 · @Neev

## 1. What you asked

Mobile is the main product, so it should be the best version of the living worlds, not a copy of the web. It has to run well on a 2 GB Android 9 or 10 phone. This plan only says what we will build and why. Nothing gets built until you have reviewed it.

What I heard, in your words turned into requirements:

1.  **The world draws everything.** Features never paint themselves. A feature only says *what* it is (a list, a form, an action), and the active world decides *how it looks*. Any feature added later gets the world's look for free.

2.  **Standard world.** Alongside the 11 worlds there is one plain, familiar world for people who want the app to look like a normal app.

3.  **The shell wears the world.** The header, tabs and FAB take the world's shape, tint and voice, even when there is no artwork behind them. If they don't, they look broken the moment the world changes.

4.  **The header gets redesigned.** Today its buttons float and overlap the status bar. Notifications must always be reachable.

5.  **The FAB works and can be seen.** You have never seen it on a phone.

6.  **The workspace has room to breathe.** Calm, elegant and uncluttered.

7.  **Gateway and Sanctuary flows match the world.** That covers welcome, sign-in, onboarding, recovery, and every Sanctuary control.

8.  **The parts are new and world-aware.** Build on current tools (Skia 3.9, Reanimated 4, RNGH 3, RN 0.88) and replace the older Gluestack-era parts.

9.  **Each world feels different.** Every world has its own life, and verger, our runtime that measures what the phone can handle, decides how much of that life a given phone can afford.

10. **Low-end phones get a graceful version.** Animation and visuals step down smoothly, never break, and never go flat or ugly.

## 2. The core idea: the world is the cloth, features are the pattern

A feature describes its content and its roles. The world decides the cloth it is cut from. Think of a tailor: the pattern (a shirt, a sari) is the feature, and the cloth (silk, cotton, khadi) is the world. Change the cloth and every garment changes, but no pattern was rewritten.

So the dress has four layers, and each layer only talks to the one next to it:

| Layer       | What it holds                                                 | Who writes it              | Example                                                    |
|-------------|---------------------------------------------------------------|----------------------------|------------------------------------------------------------|
| **Floor**   | the ground under everything: colour, scene, light of the hour | the world                  | Tea country's misty slope at dusk                          |
| **Surface** | what content sits on: sheets, cards, groups, wells            | the world, through recipes | a paper card in Sanctuary, a lacquered panel in Perahera   |
| **Dress**   | how controls look and move: shape, edge, ink, press, haptic   | the world, through recipes | Spark's cut corners and crisp tap, Wewa's soft round press |
| **Content** | words, numbers, pictures, actions                             | the feature                | today's attendance, a lesson, a quiz                       |

The rule that follows: **a feature may name a role (primary action, quiet text, danger, a group) but never a colour, radius, font, shadow or duration.** If a screen needs something the kit can't say, we add the word to the kit, so every world learns it once.

This is the world model's rule already (`ui-kit-guide.md`). What is new is applying it everywhere, including the shell, the gateway and every Sanctuary control, and making the floor alive on mobile.

## 3. Who and what we design for

We design for the floor phone first and let better phones add life on top. Designing for the A52 and cutting down later is the wrong order. The app already sets `minSdkVersion 28` (Android 9), so the floor is real.

| Profile              | Example phones (approximate)                                                                                      | What it means for us                                                                                                                                  |
|----------------------|-------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Floor**            | 2 GB RAM, Android 9 or 10, Helio P22 or Snapdragon 439 class, 720p screen, 16 to 32 GB storage, often nearly full | No live animation by default. One painted floor that is baked once, no blur, few shadows. The full app must stay under about 180 MB of memory in use. |
| **Middle** (the A52) | 4 to 8 GB, Android 13 or newer, Snapdragon 720G, 1080p at 90 Hz                                                   | Still floor plus a light moving layer at 15 to 30 fps. Press light and transitions on.                                                                |
| **Rich**             | flagship phones                                                                                                   | Full scene with particles and depth, all motion on.                                                                                                   |

The people and conditions behind those phones:

- **Teachers** mark attendance in a noisy classroom with one hand, often against a time limit. **Students** use shared family phones, **parents** check in briefly, and **principals** look at overviews.

- **Three scripts.** Sinhala and Tamil words run longer and taller than English, and conjuncts must render correctly.

- **Bright sun outdoors,** cheap screens with poor contrast, and big font sizes set by older users.

- **Mobile data is expensive,** power cuts happen, signal drops, and the phone gets hot. The app must never download its look; all of it ships inside the app.

- **Interruptions** are constant. Every screen has to survive being backgrounded and come back exactly where it was.

## 4. What is there today, and why it feels shallow

The engine underneath is strong, but on mobile it reaches the screen only in patches. These findings come from branch `integrate/worlds-and-upstream` (your latest, which already contains the earlier UI branch).

| Area                         | What I found                                                                                                                                                                                               | Why it feels shallow                                                                              |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| **Worlds on the floor**      | Mobile draws one Sri Lankan landscape per room and tints it with the world's glow (`SceneBackdrop`, `resolveScene`). Web has 11 separate world scenes (`WorldSceneSvg`, `scenes/*.tsx`).                   | Switching worlds on mobile barely changes the floor. Rosa looks like Spark with a different tint. |
| **Scenes are web-only code** | The 11 world scenes are SVG files inside the web app, drawn with CSS animation.                                                                                                                            | Mobile can't reuse them, so mobile and web drift apart.                                           |
| **Header**                   | `AppHeader` never pads for the status bar, and the tab layout picks between 4 header styles, 2 of them legacy (`DomainSubHeader`, `ActiveSubTabStrip`).                                                    | Buttons float and collide with the status bar, and each room has a different header.              |
| **FAB**                      | Mobile still mounts the old `LotusPetalFAB`. The kit's `ActionFab` and `FabMenu` were built but never connected. `fabTab.ts` lists only `self`, and the FAB also waits for each screen to register itself. | It shows only on the Self home, and only if that screen registered, so you never saw it.          |
| **Legacy parts**             | 49 mobile screen files still import old Gluestack-era UI. Only 17 use the new kit. Repo-wide count: 1,284 legacy imports (`tooling/ui-legacy-ratchet.json`).                                               | Most screens ignore the world's shape and voice, so they look the same in every world.            |
| **Gateway**                  | Welcome and sign-in are hand-built with raw React Native and their own colours. Onboarding uses the kit and the scene. Recovery and the PIN modal are legacy.                                              | The first five minutes look like three different apps.                                            |
| **Root shell**               | `EntryShell` still sits on the legacy `bg-phase-canvas` and phase classes, and the capability notice is hard-coded white text on `phase-*`.                                                                | The frame around everything is the old system.                                                    |
| **Fonts**                    | 9.6 MB of fonts are bundled, all loaded at start.                                                                                                                                                          | Costly on a 16 GB phone that is nearly full, and slower to launch.                                |
| **Proof**                    | No world gallery on the phone, and no per-world screenshots. Not yet measured on the A52.                                                                                                                  | We can't see or prove that every world is whole.                                                  |

The strong base we keep: one world engine (`resolveWorld` and recipes), verger's experience levels, the scene resolver with tiers, 11 worlds with fonts and motion, feedback grammar, living light, the contrast test over every recipe pair, and a kit that already exists on both platforms.

## 5. Architecture

We keep the current engine and add three things: a scene description that works on any platform, one floor for the whole app, and a stage that tells every part what the phone can afford. The picture below shows how they connect.

<figure data-embed="node/ca2803f9-6217">

<figcaption>architecture · inputs, one resolver, three drawers, features on top</figcaption>
</figure>

The world, the clock and verger feed one resolver, so the floor, the kit and the shell always agree. Features sit on top and only ever name roles.

The new pieces, in plain terms:

1.  **World scene spec** (`theme/scene/worlds/<id>.ts`). Each world describes its floor as data: layers (sky, far, middle, near, ornament, particles), shapes computed once from the width and height, fills named by palette role, and motion written as small instructions (sway, drift, twinkle, rise) with the lowest tier allowed to run each. The web's 11 SVG scenes move here, so **phone and web draw the same world from one source.**

2.  **One floor, not one per screen** (`WorldStage` at the app root). Today the tab layout and onboarding each mount their own scene. One floor sits under the navigator. Screens only ask for how present it should be (`useFloorPresence('full' | 'band' | 'quiet')`), and the floor eases between them. That means one Skia surface in memory instead of several.

3.  **Two renderers for one spec.** On the phone, Skia draws the still layers once into a picture and reuses it until the minute changes. Only the moving layer redraws, at the tier's frame rate, and particles use one Skia `Atlas` draw call. On the web, the same spec becomes SVG plus CSS keyframes.

4.  **The stage budget** (`useStage()`). It turns verger's levels into one tier for the whole screen (section 9), so the floor, kit and shell never disagree about what the phone can afford.

5.  **Shell as kit parts.** `WorldHeader`, `WorldTabBar`, `WorldFab` and `WorldSheet` live in the kit and read recipes like a button does. The app's layout only composes them.

Boundaries stay as AGENTS.md sets them. `theme/` never imports React Native or Skia, renderers live in `components/native` and `components/web`, and apps only compose.

## 6. The shell: header, tabs, FAB, notifications

The shell wears the world's shape, tint and voice in every tier. Artwork behind it is a bonus that only richer tiers get. Its job is to be quiet, steady and always in the same place.

**Header: one component, two postures**

- **Room home** shows a calm large title (the room's name, or the perspective in Workspace) with the greeting under it. As you scroll it eases into the compact posture. That runs on the UI thread through Reanimated, so it never stutters, and the header stays on screen instead of vanishing.

- **Inside a room** is compact: back, title, and one context action.

- **Right side, always:** the notification bell (the count is spoken, not only shown) and your avatar. The avatar opens a "You" sheet holding settings, perspective, world, language and profile. That gets rid of the second floating circle and keeps notifications reachable from everywhere.

- **No floating wells.** Actions sit inside the header's own shape on its baseline, with 48 dp touch targets. The header pads itself for the status bar, and the status bar icons turn light or dark to match the world's ground.

- **It wears the world.** Edge, corner, ink and the lit mark come from the world: Spark's cut edge, Kandyan's ornament line, Sanctuary's soft paper, Standard's plain bar. In Middle and Rich tiers a thin band of the floor shows through, washed for contrast.

- **It replaces the four header styles** (adaptive, compact, classic, minimal) and the two legacy parts. Retiring the setting needs your sign-off (section 17).

**Tabs**

- The five tabs stay as they are (Library, Workspace, Self in the centre, Community, Profile), and so does the custom versus native A/B until the A52 numbers come in.

- The selected tab gets the world's lit mark: a pill, an underline, a lamp glow or a cut tab. The mark glides between tabs on the UI thread.

- Labels are always shown. Icons alone fail for new readers and people with low vision.

**FAB: one main action per room, declared as data**

- A route-to-actions map (`roomActions`) decides what the FAB offers, so it no longer depends on each screen remembering to register. A screen can still add context, like the class it is showing.

- It sits above the tab bar on the thumb side. A tap does the main action, and a long press or the chevron opens `FabMenu` with up to five more.

- It tucks away when you scroll down, the keyboard opens or a sheet is up, and comes back when you scroll up. The same actions are also reachable from the header, so a TalkBack user never has to hunt for a floating button.

- Proposed actions to confirm: Workspace (mark attendance, lesson note, message class), Self (breathe, journal, mood), Library (add, scan), Community (post). Profile has no FAB.

**Sheets and dialogs** wear the world's surface and enter with the world's motion. Each one has a close button as well as swipe-down, and the back button closes them.

## 7. Gateway and Sanctuary flows

The first five minutes become one walk from the gate into the room. The floor stays mounted the whole way, so nothing flashes or resets between screens.

| Step                                                 | Today                                               | Planned                                                                                                                                   |
|------------------------------------------------------|-----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| Splash to first frame                                | native splash, then the legacy phase canvas         | splash in the world's ground colour, handed straight to the floor (no white flash)                                                        |
| Welcome                                              | hand-built in raw React Native with its own colours | the floor at full presence, the world's sign and Tutii's perch, one line of welcome, two buttons (begin, I have an account)               |
| Language                                             | inside welcome                                      | its own first choice: සිංහල, தமிழ், English, each shown in its own script                                                                   |
| Sign in                                              | hand-built (673 lines), legacy PIN modal            | kit fields and buttons, device accounts as rows, Google as a linked row, PIN as a kit `Sheet`, every error said in words                  |
| Onboarding                                           | kit and scene already (name, role)                  | same steps on the kit, with `Steps` progress, plus one new step: choose how Gurudevi feels                                                |
| Choose a world (new)                                 | only inside settings                                | four live previews (Standard first, Sanctuary, and two from other families) plus "see all 12". Can be changed anytime from the You sheet. |
| Arrive                                               | jump into tabs                                      | the surfaces settle onto the floor that is already there, and the first room greets by name                                               |
| Recovery, version gate, public form, errors, offline | legacy and mixed                                    | the same kit and floor, with `Notice` for state and no hard-coded colours                                                                 |

**Sanctuary controls** means every control inside the app after the gate: rows, toggles, cards, chips, pickers, the breathing pulse overlay, the perspective switcher, the school invite modal, the feature catalog sheet and the settings screens. Each one moves to its kit equivalent so it follows the world. Section 11 lists the parts, and section 16 orders the screens.

## 8. Worlds: Standard plus the 11

Every world fills the same roles, so features never notice which one is on. What differs is the floor, the life in it, and how the controls feel to touch. The "life" column is my proposal for the moving layer. It runs only in the Middle and Rich tiers, and the Floor tier shows the still version.

**Standard (new, world 12).** A plain, familiar app: system fonts (Roboto with Noto Sinhala and Tamil, which loads no extra fonts), neutral ground, 12 dp corners, a solid primary button, no scene and no ornament. Its motion is short and clean. It follows light and dark mode but not the hour, unless the person turns that on. It is also the natural pick for floor phones and for anyone who just wants a normal app.

| World                   | Family   | Floor (still)                                             | Life (moving layer)                                  | Controls feel                        |
|-------------------------|----------|-----------------------------------------------------------|------------------------------------------------------|--------------------------------------|
| Sanctuary               | Quiet    | washi paper ground, open horizon, far ridges, light beams | slow breath of light, mist drifting along the ridges | soft paper, warm lamp, soft haptic   |
| Wewa                    | Quiet    | still tank water, moon, reeds                             | moon ripple on the water, a reed sway                | cool and deep, round, slow           |
| Gems and lace (Ratna)   | Quiet    | ivory with beeralu lace edge, one sapphire                | a single glint crossing the sapphire                 | fine lines, precise, light           |
| Forest canopy (Kele)    | Nature   | backlit leaves, dark branches, looking up                 | leaves sway, sun flecks fall through the canopy      | organic, leaf-shaped marks           |
| Tea country             | Nature   | tea rows on misty hills                                   | mist moving across the rows                          | open, airy, unhurried                |
| Temple walls (Kandyan)  | Cultural | lime plaster, mural earth, vine band                      | lamp flicker on the vine band                        | ornament line, framed                |
| Angampora               | Cultural | packed earth, brass                                       | brass catching light on press                        | square, grounded, firm haptic        |
| Perahera                | Cultural | festival night, torches, flags                            | torch flicker, flags rippling                        | ceremonial, bright, rhythmic         |
| Rose and pichcha (Rosa) | Bloom    | roses and jasmine on climbing stems                       | petals drifting, a light scent mist                  | gentle, warm, soft edges             |
| Colombo night           | Modern   | harbour lights, city line                                 | lights twinkle, a passing glint on the water         | clean, precise                       |
| Spark                   | Modern   | neon lines, hard light                                    | a neon pulse along the edge lines                    | cut corners, wide type, crisp haptic |

The hour, the season and the weather light every world the same way (one clock), so a rainy evening in Tea and a rainy evening in Spark feel like the same evening in different places.

Each world also gets its own **moments**: what a success, a streak or a finished task looks like (petals in Rosa, a brass chime-flash in Angampora, a neon burst in Spark), sized by verger's celebration level.

## 9. Graceful degradation tiers

There are four tiers, and every tier still looks finished and alive: we aim to amaze on low phones too, not play safe. A lower tier keeps the world's shape, colour and voice and removes only what costs memory, GPU or battery. Verger picks the tier, and the person can also choose a lower one in settings.

| Part                  | Rich                           | Middle                                             | Floor                                                                                                            | Bare                                             |
|-----------------------|--------------------------------|----------------------------------------------------|------------------------------------------------------------------------------------------------------------------|--------------------------------------------------|
| **When**              | high-end, cool, charged        | A52 class, or Rich under load                      | 2 GB phones, verger `essential`, battery saver                                                                   | reduce motion is on, power cut mode, overheating |
| Floor                 | full world scene, depth layers | full scene drawn once as a picture                 | baked pictures of the full world scene (WebP made from the same Skia scene at build time), shown with expo-image | the world's ground colour, tinted by the hour    |
| Moving layer          | 30 fps, all particles          | 15 fps, half the particles, paused while scrolling | 2 or 3 light overlays (mist, glow, petals) moved by native transforms on the UI thread, still alive              | none                                             |
| Surfaces              | wash, tinted shadow, grain     | wash, tinted shadow                                | flat fill with an edge line                                                                                      | flat fill with an edge line                      |
| Press and state light | spring scale, living light     | spring scale, living light                         | colour change only, no scale                                                                                     | colour change only                               |
| Screen transitions    | world's own enter motion       | short fade and slide                               | short fade                                                                                                       | instant                                          |
| Header band           | floor shows through            | floor shows through, still                         | tint only                                                                                                        | tint only                                        |
| Celebrations          | full world moment              | small moment                                       | one-line toast with haptic                                                                                       | toast without motion                             |
| Blur                  | none live; frost is baked once | none                                               | none                                                                                                             | none                                             |

Rules that hold across all tiers:

- **Moving between tiers is calm.** Changes happen at a screen change or after 2 s of idle, never in the middle of a gesture, and with a 400 ms crossfade.

- **Nothing moves when nobody sees it.** A hidden screen, the app in the background or the screen off costs nothing.

- **Words, contrast and touch targets never degrade.** Only decoration does.

## 10. Stack: what we use and what each part does for us

Everything needed is already installed in `apps/gurudevi-mobile`, so this plan adds no new dependency. The work is using these libraries well and retiring the old UI layer.

| Library (installed)                                              | What we use it for                                                                                                        | Where it stops                                                   |
|------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------|
| React Native 0.88                                                | native gradients in styles (Floor tier with no Skia), `fontVariationSettings`, edge-to-edge                               | no backdrop blur                                                 |
| `@shopify/react-native-skia` 3.9.1                               | the floor: still layers recorded once as a picture, moving layer, particles in one `Atlas` call, ornaments, world moments | each canvas is a GPU surface, so we keep one on screen, not many |
| `react-native-reanimated` 4.7.1 + `react-native-worklets` 0.13.1 | press, header collapse, tab mark glide, sheet motion, scene clock on the UI thread; `scheduleOnRN`, `.get()` / `.set()`   | no `runOnJS` / `runOnUI` (deprecated here)                       |
| `react-native-gesture-handler` 3.5                               | swipe rows, sheet drag, FAB long press                                                                                    | every gesture also has a button or accessibility action          |
| `@legendapp/list` 3.7 and `@shopify/flash-list` 2.3              | long lists and chat, recycled                                                                                             | no `ScrollView` plus `.map()` for data                           |
| `react-native-screens` 4.30                                      | native stack, frozen screens behind the top one                                                                           |                                                                  |
| `react-native-keyboard-controller` 1.23                          | forms that stay above the keyboard, FAB tucks away                                                                        |                                                                  |
| `expo-haptics`                                                   | the world's haptic voice through `useFeedback`                                                                            | silent when the system turns haptics off                         |
| `expo-image`                                                     | Tutii art, avatars, cached pictures                                                                                       |                                                                  |
| `expo-system-ui`, `expo-navigation-bar`, `expo-status-bar`       | status and navigation bars match the world's ground                                                                       |                                                                  |
| `react-native-mmkv` 4.3                                          | world choice, tier override and last room, read at start with no flash                                                    |                                                                  |
| `lucide-react-native`                                            | icons, passed into kit parts                                                                                              | the kit never picks an icon itself                               |
| NativeWind 5 (rc)                                                | screen layout only                                                                                                        | colours only through `w-*` classes                               |

To retire after sign-off: Gluestack-era `@repo/ui` primitives, `LotusPetalFAB`, `DomainSubHeader`, `ActiveSubTabStrip` and the legacy phase classes. `expo-blur` is not used in any tier, because live blur over a moving floor is the most expensive effect on an older GPU.

## 11. Primitives and components

Most controls already exist in the kit. The gap is the stage, the shell and screen framing, plus a pass that makes every existing part tier-aware.

**New: the stage (floor and budget)**

| Part               | What it does                                                                                       |
|--------------------|----------------------------------------------------------------------------------------------------|
| `WorldStage`       | one per app, at the root: owns the floor, the status and navigation bar colours, and the tier      |
| `WorldFloor`       | draws a world's scene spec: Skia picture plus moving layer, or a native gradient on the Floor tier |
| `useFloorPresence` | a screen says full, band or quiet, and the floor eases to it                                       |
| `useStage`         | one answer to "what can this phone afford now": tier, fps, particles, surface material             |
| scene specs × 12   | `theme/scene/worlds/<id>.ts`: the web's 11 scenes as data, plus Standard                           |

**New: shell and framing**

| Part             | What it does                                                                                                             |
|------------------|--------------------------------------------------------------------------------------------------------------------------|
| `WorldHeader`    | `AppHeader` grown into two postures (home and inside), safe-area aware, collapses on scroll                              |
| `WorldTabBar`    | the custom tab bar drawn from recipes, with the gliding lit mark                                                         |
| `WorldFab`       | `ActionFab` + `FabMenu` wired to `roomActions`, tucks away on scroll, keyboard or sheet                                  |
| `YouSheet`       | avatar menu: settings, perspective, world, language, profile                                                             |
| `ScreenFrame`    | every screen's frame: safe area, header space, world margins, readable width, scroll for header collapse, keyboard space |
| `WorldMoment`    | a world's celebration, sized by verger                                                                                   |
| `WorldPreview`   | a small live floor for the world chooser and settings                                                                    |
| `Standard` world | `theme/worlds/standard/` with one registry line                                                                          |

**Existing, to make tier-aware and check in every world:** `Surface`, `Card`, `Group`, `Row`, `Button`, `IconButton`, `TextField`, `Chip`, `Switch`, `Checkbox`, `Radio`, `Select`, `Segmented`, `Tabs`, `TaskTabs`, `Launcher`, `Sheet`, `Dialog`, `Toast`, `Notice`, `Steps`, `Empty` / `ErrorState`, `Waiting`, `Perch`, `List`, `SwipeRow`, settings rows, time pieces, media and agent pieces.

**Spacious workspace.** `ScreenFrame` sets the breathing room once: section gaps of at least 24 dp, 16 to 20 dp side margins, one primary thing per screen above the fold, and groups instead of walls of cards. Workspace home becomes a calm `Launcher` of rooms with today's one task strip, not a dashboard of tiles.

## 12. Motion, interaction and feedback

Motion explains what just happened. Decoration comes second, and every moving thing has a reason we can name.

- **One grammar.** Components name the event (press, select, commit, success, warning, error). The world picks the haptic, the spring and the sound of it (`useFeedback`, already built), so Spark taps crisply and Wewa lands softly.

- **Answer within 100 ms.** Every touch shows a pressed state on the next frame, before any network call. Saving shows as "saved here, sending" and then "sent", with the same words in every world.

- **Continuity.** The floor never resets between screens. Shared things (a class card opening into the class) grow from where they were. Tabs slide sideways and pushed screens come from the edge, so people always know where they are.

- **Hierarchy in time.** On arrival the floor is already there, then surfaces settle (120 to 240 ms, staggered by 40 ms), then the one primary action. Nothing makes the person wait for an animation before they can act.

- **Idle settle.** After 20 s without touch, the moving layer slows down to rest. That saves battery and lets the scene breathe.

- **Every gesture has a plain path.** Swipe-to-mark also has a button, drag-to-close also has a close button, and long press is also in a menu.

- **Each world's moments** (section 8) are the only big motion, and they never cover the content or block a tap.

## 13. Accessibility, language and contrast

Accessibility is part of the world contract. If a world can't meet it, the world changes; the rule never bends.

- **Contrast.** Text is 7:1 on the ground and 4.5:1 on raised surfaces, lit marks are 3:1, checked on every recipe pair in every world, phase and mode (the test exists). Text written on the floor sits on a wash, and the test covers the floor's brightest moment too. An open finding: Sanctuary's light lamp is at 1.9:1.

- **TalkBack first.** Every control has a role and a name. Counts are spoken ("Notifications, 3 new"). The floor and ornaments are hidden from the screen reader. Focus order follows the eye: header, content, FAB, tabs.

- **Touch.** Targets are at least 48 dp on Android, primary actions sit in the thumb zone, and nothing important lives only in the top corners.

- **Text size.** Layouts survive 200% font scale. Rows grow, headers wrap to two lines, and no text is cut off. Font scale also widens spacing (`gapFor`, already built).

- **System settings win.** Reduce motion sends the app to the Bare tier's motion. High contrast and darker colours make the world's recipes stronger, not plainer (already built).

- **Three scripts.** Sinhala and Tamil get taller line heights and are never letter-spaced. Labels are sized for the longest of the three languages. Numbers and dates come from `Intl` in the person's language.

- **Colour never works alone.** Attendance, errors and quiz answers always carry a word or a shape as well.

## 14. What you did not say, but a full team would raise

These are the things each role would put on the table in the first meeting.

**Product and BA**

- **Jobs before beauty.** Name the top three jobs per role (for example, a teacher marks attendance in under 20 seconds), and judge every screen by whether the world helps or slows that job.

- **Success measures.** Time to first useful action, attendance completion time, crash-free sessions, how many people change their world (and which), and how many turn the scene off. Without these, "pristine" can't be proven.

- **Defaults are decisions.** Most people never open settings, so the default world and default tier are the product for them (section 17).

- **Rollout.** Ship behind a flag to a small share first, with an easy way back to Standard. Never move everyone in one release.

**Design**

- **One screen fully finished beats twelve worlds half done.** Finish Workspace home in Standard and Sanctuary end to end, then widen.

- **Content design.** Words are part of the world's voice but not its meaning: the same message in every world, translated by people, not machines. Empty and error states teach the next step.

- **States for everything.** Each component and screen needs loading, empty, error, offline, partial, long text and no permission. The worlds make these visible, so they must all be drawn.

- **A visual reference per world** (a page of the World Atelier for each), so taste decisions are made once and not re-argued in code.

**Architecture and engineering**

- **Budgets, written down and tested** (section 15): start time, memory, frame time, app size.

- **App size.** 9.6 MB of fonts is a lot for a nearly full 16 GB phone. An Android App Bundle per device and on-demand world fonts (downloaded once over Wi-Fi) could cut first install sharply. That reopens your 26 Oct decision, so it is in section 17.

- **Start time.** The world choice is read from MMKV before the first frame, the Floor tier paints first, and richer tiers arrive later. The person should never see the world "switch" on launch.

- **Old Android quirks.** Android 9 and 10 GPUs can lose a Skia surface when the app is backgrounded, so the floor must redraw cleanly on return. Some cheap phones lie about their RAM class, so verger trusts measured frame times over the label.

- **One source of scenes for web and phone,** or the two will drift again within a month.

- **Deletion rule.** Retiring old parts and the header styles needs your sign-off each time (AGENTS.md).

## 15. How we prove it

A world counts as done when it passes the same checks as every other world on a real floor phone. The budgets below are my proposed starting numbers, to be checked against the first A52 and 2 GB readings.

| Budget (proposed)                     | Floor phone                          | A52                                    |
|---------------------------------------|--------------------------------------|----------------------------------------|
| Cold start to first useful screen     | 4 s or less                          | 2 s or less                            |
| Memory in use, app open on Workspace  | 180 MB or less                       | 260 MB or less                         |
| Scrolling a long list                 | no frame over 33 ms in 95% of frames | no frame over 16.7 ms in 95% of frames |
| Floor redraw when the minute changes  | under 8 ms                           | under 4 ms                             |
| Tab switch                            | under 150 ms                         | under 100 ms                           |
| Battery, 10 minutes idle on Self home | no more than with Standard + 10%     | same                                   |

Checks:

1.  **Pure tests** on every scene spec: shapes build once, stay in bounds, and the counts per tier fall as the tier falls.

2.  **Contrast test** (exists) extended to the 12th world and to text on the floor.

3.  **Screenshot grid** of 12 worlds × 4 tiers × day and night for the floor, header, tabs and a sample screen. Skia renders headless (`scripts/scene-shots.mjs` exists).

4.  **Kit tests** across all worlds for role, name and every state (the pattern exists).

5.  **Maestro flows** (folder exists) for the gate: welcome, language, sign-in, onboarding, choose a world, arrive. Run in Standard and one rich world.

6.  **On-phone gallery** (`app/(dev)/kit`): every part in every world with a tier switch, so you can judge taste on the device.

7.  **Two real phones:** your A52, plus one 2 GB Android 9 or 10 phone. A cloud session can't run a phone, so these readings come from you, through verger's lab screen.

## 16. Plan in phases

We build in five phases, and each one ends at a gate you check on your own phone before the next starts. Phases 0 and 1 fix what you feel every day (header, FAB, the floor), so they come first.

<figure data-embed="node/db12f323-bd6f">

<figcaption>build plan · 5 phases, 5 gates</figcaption>
</figure>

Each phase is its own set of commits on one branch, with the screenshot grid and kit tests run before every push. Nothing old is deleted without your yes.

## 16b. Your seeds from 10 Nov, explored

These are open, not decided. Two of them change the plan's shape: verger becomes the only source of performance choices, and the shell adapts instead of being one shell for everyone. The rest are options to try on the A52, the A24 and your tablet.

**1. The world is the mother, verger is the father.** The world decides how things look, and verger decides how much the phone can afford. Every visual-level or performance setting becomes an input to verger, never a switch inside a component. This already exists in part: verger takes a fidelity preference (auto, low, high) from the app's setting (`GurudeviVerger.tsx`). Settings would offer one "Visual detail" choice (Automatic, Lighter, Richer). That choice, the system's reduce motion, data saver and battery saver all feed verger, and the tiers in section 9 only ever come out of verger.

**2. An adaptive shell, not one for all.** The shell adapts on four axes:

| Axis        | What changes                                                                  |
|-------------|-------------------------------------------------------------------------------|
| World       | shape, lit mark, voice, tint                                                  |
| Screen size | small phone, regular phone, tablet (side rail and two panes at 600 dp and up) |
| Room        | home posture or inside posture                                                |
| Person      | a layout they pick in the You sheet                                           |

Each layout is drawn by the active world, and the person picks from these:

- **Header:** Greeting (avatar, greeting and room, Tutii, bell), Compact (room title, Tutii, bell), or Classic (title left, icons right, like a normal app).

- **Tab bar:** Docked (full-width with labels), Floating (a rounded island above the floor), and a side Rail on tablets.

"Classic" could also be the name of the plain 12th world (I called it Standard).

**3. What goes in the header.** On the left, your photo opens the You sheet (profile, settings, perspective, world, reading, help). In the middle is the greeting and room name. On the right are Tutii and the bell. My suggestion is that **the AI button is Tutii** rather than a separate sparkle icon, so there is one friend, not two. We test both (Tutii versus a separate AI button) with the A/B switch the shell already has. Settings leave the header.

**4. Where Tutii lives.** Tutii perches in the header, alive in each world's way. A tap opens Tutii's sheet with three doors:

- **Ask:** the AI companion.

- **Show me around:** a guided tour of the room you are in.

- **Help and support:** answers, contact, and report a problem.

Tutii also turns up in empty states and first-run moments, and never covers content.

**5. Your own pets.** I think this matters more than it looks, especially for students, because attachment brings people back. There are three steps of ambition:

- \(a\) Bring your own pet, from a photo or a drawing, cut out and kept on the phone.

- \(b\) Dress any companion with colours and small accessories.

- \(c\) Choose from companions we draw (Tutii and friends), each with a perch in every world.

Your call: start with people's own pets, and keep the set open-ended, not a hard-coded list. A companion is a registry entry like a world: its art (a drawing, a photo cut-out, a Rive or Lottie file, or one of ours), its moods (idle, greet, celebrate, sleep), and where it perches. People can add as many as they like. The only limits are safety (kept on the phone, never shared without a choice) and the tier (a still pose on floor phones). It takes Tutii's perch slot, so the cost stays the same.

**6. Kele as the default world.** This works. Its leaves-and-branches floor needs a strong still version for floor phones, and a contrast check under the canopy.

**7. Fonts and reading.**

- **Fonts on demand:** a world's fonts download once, over Wi-Fi or mobile data as the person chooses, with the size shown first. Classic needs none.

- **Reading settings:** text size, weight (the variable font's weight axis, for example 350 to 600) and line spacing, set per person and applied in every world.

- **What ships in the app:** only the default world's fonts plus the Noto fallback.

**8. Skia-first scenes on mobile.** Agreed, mobile can go further than SVG. Skia shaders (`RuntimeEffect`) can draw water, mist and light, `Atlas` can draw particles, and path effects can draw vines and lace. What phone and web would share is only the world's facts (palette, motifs, timing, proportions), not drawing code. Shaders run in the Rich and Middle tiers only, and floor phones get a baked picture or a gradient.

**9. FAB.** Its actions come from three sources: common ones (always there, such as Ask Tutii or a quick note), the room's own, and ones the person pins. This stays open, and we try it in the on-phone gallery first.

**10. Devices: A52, A24, your tablet.**

- **Size classes:** compact (under 360 dp), regular, large, and tablet (600 dp and up).

- **Tablets** get the side rail, two panes (list and detail), wider margins and a readable line length.

- The kit already lays parts out by their container width (`useContainerWidth`).

**11. Contrast and Reanimated.** You are right: Reanimated 4.7.1 exports `contrastColor`, which mirrors CSS `contrast-color()` and runs as a worklet (I checked its source). It returns white or black, whichever reads better. We use it where colours are only known on the UI thread: text and icons over a moving floor, a shader, a photo or a pet. World colours still come from the engine (`inkOn`, `legible`, and the test over every recipe pair), which can pick the world's own inks, not only white or black.

**12. Hardened, elegant primitives.** A part is "hardened" when all of these hold:

- every state is drawn

- it works in all 12 worlds and 4 tiers

- it survives 200% text

- it works in three scripts

- it works with TalkBack

- it works from a small phone to a tablet

- it doesn't re-render while scrolling

- it has tests for each of the above

It is "elegant" when it has one clear job, quiet defaults, the world's voice, and no surprise.

## 16c. Final round: tools, state, skills, and what else

**Rich and alive, even on the lowest phones.** We aim to amaze, not to play it safe. The cheapest way to look rich is to draw rich once and move it cheaply:

- **Floor tier:** pictures of each world baked at build time from the same Skia scene (the headless renderer exists, `scripts/scene-shots.mjs`), shipped as WebP per world and time of day. They are shown with expo-image, with 2 or 3 light overlays (mist, glow, petals) moved by native transforms. It looks like the rich scene and costs almost nothing.

- **Middle and Rich tiers:** live Skia with shaders, particles and depth.

- On Rich, a gentle **tilt parallax** from the phone's motion sensor is worth trying. It is cheap and feels magical.

**What Software Mansion and Expo give us (all already installed):**

| Tool                                                      | Use                                                                                                                                |
|-----------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Reanimated 4 CSS animations and transitions               | the default for component motion: keyframes and transitions declared in style, run on the UI thread, cheap enough for floor phones |
| Reanimated shared values and `contrastColor`              | gestures, scroll-linked header, ink over moving colour                                                                             |
| Worklets (separate runtime)                               | scene geometry and particle maths off the JS thread                                                                                |
| Skia `Picture`, `RuntimeEffect`, `Atlas`, image snapshots | still floor drawn once, shaders, particles, baking pictures                                                                        |
| Gesture Handler 3                                         | sheets, swipe rows, FAB long press                                                                                                 |
| `@expo/ui` (Jetpack Compose on Android)                   | native, accessible pickers, date and time, switches where native beats custom                                                      |
| expo-image                                                | baked floors, pets, avatars, cached and memory-safe                                                                                |
| enriched markdown                                         | lesson and AI text                                                                                                                 |
| Lottie (installed); Rive to check                         | companion moods. Rive needs a version check on the New Architecture before we add it.                                              |

**Who holds which state.** One owner per kind of state, so nothing fights:

| State                                                                                                 | Owner                                                                                                |
|-------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| Anything moving (press, scroll, glide, scene clock)                                                   | Reanimated shared values on the UI thread, never React state                                         |
| A component's own open, focus, pressed                                                                | the component                                                                                        |
| Flows with steps and rules (sign-in, onboarding, FAB menu, sheet lifecycle, guided tour, tier change) | XState v6 machines (`packages/ui/src/machines`). It is an alpha, so we pin it and test each machine. |
| Person's choices (world, layouts, reading, companion, visual detail)                                  | Zustand, persisted to MMKV and read before the first frame                                           |
| What the phone can afford                                                                             | verger's snapshot                                                                                    |
| Server data                                                                                           | TanStack Query and PowerSync                                                                         |
| Side-effect work (font downloads with retry, data saver, asset cache, telemetry)                      | Effect v4 services, kept out of the render path                                                      |

**Skills in the repo** cover this work: `ui-kit`, `verger`, `living-scene-artistry`, `gurudevi-mobile-director`, `gurudevi-quality-gate`, `react-native-skills`, `animate`, `improve-animations`, `review-animations`, `animation-vocabulary`, `emil-design-eng`, `expo-ui`, `mmkv-guidance`, `effect-ts-architecture`, `rn-terrain`, `canvas-design` and `ui-screen-audit`. I'll read the relevant ones before each phase.

**What else I would add:**

1.  **The cultural calendar.** The scene already knows Poya. Vesak lanterns, Avurudu, Deepavali, Christmas, Ramazan and exam season could each touch every world for a few days.

2.  **Ambient sound per world** (rain, birds, temple bell). It stays off by default, is opt-in, and is quiet.

3.  **The world reaches beyond the app:** splash, notification accent, Android widgets later, and maybe the app icon.

4.  **Your own Atelier page per world** as the visual reference, so taste is decided once.

5.  **A dev "stage panel" on the phone:** switch world, tier, hour, weather, size class and companion live, with the frame time shown.

6.  **Privacy for pets and photos:** on the phone by default, never sent without a clear choice.

**Ready to start?** Yes, with one short proving step first. Phase 0 builds the stage plus Kele's floor in all four tiers, and you check it on the A24, A52 and tablet. That proves the "amaze on low" idea with real numbers before we build everything on it.

## 17. Decisions for you

Updated after your 10 Nov notes. Four are settled, and the rest stay open while you explore.

| \#  | Decision                | Where it stands                                            | My recommendation                                                                                                      |
|-----|-------------------------|------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| 1   | Branch                  | settled: a new branch from `integrate/worlds-and-upstream` | `claude/project-thread-g4vy3a`, already created                                                                        |
| 2   | Default world           | leaning Kele                                               | Kele, with Classic first in the chooser                                                                                |
| 3   | Name of the plain world | open                                                       | Classic                                                                                                                |
| 4   | Shell rule              | settled: the shell wears the world                         | shape and tint always, artwork in richer tiers                                                                         |
| 5   | Header and tab layouts  | open                                                       | 3 headers (Greeting, Compact, Classic) and 3 tab styles (Docked, Floating, Rail on tablet), picked in the You sheet    |
| 6   | AI in the header        | open                                                       | Tutii is the AI button; settings move into the You sheet                                                               |
| 7   | Companions              | open                                                       | drawn companions with dressing first; own-photo pets later and on-device only                                          |
| 8   | Visual levels           | settled: verger owns them                                  | one "Visual detail" choice feeding verger                                                                              |
| 9   | Fonts                   | leaning on-demand                                          | default world bundled, others downloaded by choice on Wi-Fi or mobile data; reading settings for size, weight, spacing |
| 10  | Scenes                  | leaning Skia-first on mobile                               | Skia scenes with shaders on phone; share only world facts with the web                                                 |
| 11  | FAB actions             | open on purpose                                            | common, room and pinned; try in the gallery first                                                                      |
| 12  | Test devices            | settled                                                    | A52, A24 and your tablet                                                                                               |
