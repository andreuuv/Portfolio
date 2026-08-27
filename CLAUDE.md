# Andreu Virgil — Portfolio

Static HTML/CSS/JS portfolio site for **Andreu Virgil** (Spanish director of
photography / cinematographer / photographer / colorist, based in
Barcelona). No backend, no build step, no framework — plain files, meant to
deploy straight to Netlify/Vercel/Cloudflare Pages from Git (auto-deploy on
push). **No git repo has been initialized yet** — offer to `git init` when
the user is ready to deploy, don't do it unassisted.

Full user-facing instructions (how to add photos/videos/projects, how to
preview locally, how to deploy) are in [README.md](README.md) — read that
too, it's kept up to date and is the source of truth for content editing.
This file (`CLAUDE.md`) is the *working/design* memory: decisions made,
why, and known gotchas — for continuing the build, not for the end user.

## Who the user is / how they work

Andreu is not a developer — he directs by describing what he wants in
plain, sometimes fragmented Spanish, often mid-message ("y borra el
selected work"), and iterates a lot: he'll approve something, then a few
turns later reverse it, then partially re-reverse it. Take each instruction
literally and locally (don't assume it also applies to other pages unless
he says so or it's clearly a site-wide convention already established).
When two of his instructions conflict (e.g. "match my real site exactly"
vs. "always put Film before Photography site-wide"), prefer the more
recent, more specific one, and say plainly what you kept/changed instead of
silently guessing.

He has a real Instagram (`@andreuuv_`) and a real old portfolio site at
**https://andreuuv.xyz** (built with **Readymag**, absolute-pixel-positioned
canvas — see the Info page section below for what that means practically).
When he references "my site" or pastes a screenshot of it, the live URL is
more trustworthy than eyeballing a screenshot — navigate to it and read
computed styles/positions directly rather than guessing from pixels.

## Site structure

```
home.html             Home — full-bleed background video + overlay menu
                        (this is the site's actual landing page — was
                        `index.html` until Andreu asked for the rename)
index.html             Index — a separate "album sheet" page: metadata
                        header + tracklist of selected work + two stills.
                        Reached from the word "Index" in every nav on the
                        site (see Nav system below). WORK IN PROGRESS —
                        basic structure only, no animation spec yet.
photography.html       Photography — two auto-scrolling filmstrips (Analog / Digital)
photo-collection.html   One photo collection (?id=slug), grid of images
film.html               Film — scrolling list (static images) + hover-preview video stage
film-project.html       One film project (?id=slug), Vimeo embed + credits
info.html                Bio/contact page, composition matches andreuuv.xyz/info/

css/style.css           Shared: reset, design tokens, nav system, overlay menu, footer
css/home.css            Home-page-only (the hero/video/big-menu styles)
css/index-sheet.css     Index-page-only (the tracklist/album-sheet styles) —
                        filename doesn't match index.html 1:1 (kept its
                        original name from before the page was renamed;
                        low-risk to leave, rename later if it bothers you)
css/photography.css, film.css, info.css   Page-specific
js/nav.js               Shared: mobile/Index overlay menu open-close
js/media-placeholder.js Shared: swaps missing <img>/<video> for a visible gray
                         placeholder block (shows the expected file path) instead
                         of a broken-image icon — see "Placeholder system" below
js/home.js, photography.js, film.js, film-project.js, photo-collection.js, info.js
js/index-track.js       Index page only: fetches data/projects.json and
                         renders the tracklist rows
data/projects.json      Film projects (title, category, role, client, year,
                         vimeoId/Hash, thumbnail, preview, description, credits[])
data/photos.json         Photography collections (id, title, cover, year, photos[])
assets/fonts/            Self-hosted webfonts (see Typography below)
assets/video/home-reel.mp4   Andreu's REAL uploaded home background video (~37MB)
```

## Typography — self-hosted, all under `assets/fonts/`

| Variable | Font | Used for | License note |
|---|---|---|---|
| `--font-geist` | **Geist Mono** | All nav/menu text, site-wide (the main UI typeface) | OFL, fine |
| `--font-display` | **Epoch** (fallback: Oswald) | Home page's big bottom-left menu only | EULA: personal/non-commercial/**commercial** OK, just don't rename/redistribute the file. Used directly. |
| `--font-hand` | **Zeyada** | The handwritten "Bio" mark on Info | Matches the real andreuuv.xyz exactly (measured from live site) |
| `--font-courier` | Courier Prime | **Currently unused** — was on the home page's top texts, later everything there moved to Geist Mono for consistency. `@font-face` + files still present; safe to remove or repurpose. | OFL |
| `--font-mono` | JetBrains Mono | Body default fallback (Google Fonts, not self-hosted) | — |

**Licensing lesson learned**: always check the EULA before installing a
downloaded display font as a webfont. **Coolvetica** (also supplied by
Andreu) was rejected for this reason — its free desktop license explicitly
excludes "serving/embedding the font in a website" (static/print/video use
only); Oswald was used as a free substitute, then later swapped for Epoch
once its EULA confirmed commercial + implicitly web use is fine.

## Nav system (`.site-nav` in `css/style.css`)

One shared component, several modifier classes combined per page:

- **Base `.site-nav`**: flex row, Geist Mono, the gradient hover effect
  (see below). `position: absolute` by default.
- **`.site-nav--overlay`**: light text (for dark/photo backgrounds — home).
- **`.site-nav--light`**: dark text (white backgrounds — inner pages).
- **`.site-nav--corner`**: brand + links grouped as one unit, vertically
  centered (`top:50%`), right-edge margin.
- **`.site-nav--pin-viewport`**: `position:fixed !important` — stays on
  screen through scroll (Photography, Film use this).
- **`.site-nav--absolute-center`**: `position:absolute !important` —
  centered like `--pin-viewport` visually, but **scrolls away** with the
  page instead of tracking scroll (Info page uses this specifically, per
  explicit request: "que se quede ahí fijo pero si hago scroll no me
  siga" — looks centered at rest, is not sticky).
- **`.site-nav--brand-end` / `.site-nav__brand--grouped`**: brand joins the
  link group (first or last in DOM — reorder the markup, the CSS just
  removes the `margin-right:auto` that normally pins brand to the far
  left).
- **`.site-nav--inline`**: brand+links inline, no absolute positioning
  (legacy variant, still used nowhere important currently — check before
  reusing).

**Hover effect**: no more underline. Each link has a gradient
(`var(--nav-hover-base)` → strong blue `#4d8dff`→`#1440d6`) painted on it
via `background-clip:text`, and hovering slides `background-position` from
0% to 100% — reads as the word gradually turning blue. `--nav-hover-base`
is set per background context (`--overlay` = near-white, `--light` = near-
black) so the resting color matches what's behind it.
`aria-current="page"` also gets the hover-blue state permanently (current-
page indicator).

**Known Chromium quirk** (already fixed, don't reintroduce): a `position:
fixed` element using `background-clip:text` can fail to repaint while the
page scrolls (scrolling is compositor-only and can skip it). Fix in place:
`will-change:transform` + a `translateZ(0)` hitch on the fixed nav classes.
Also: `<body>` must set **both** `overflow-x` and `overflow-y` explicitly
(never just `overflow-x: hidden` alone) — the UA auto-computes the other
axis to `auto` otherwise, which turns `<body>` into its own scroll
container and can break `position:fixed` reliability. Current rule:
`overflow-x:hidden; overflow-y:visible;` on `body`.

**Nav link order & wording** — standardized site-wide (every page's main
`.site-nav`, every page's overlay menu, and Home's big bottom-left menu
all use the exact same 5 labels in the exact same order now):
```
Andreu Virgil (brand) → Cinematography → Photography → About Me → Index
```
Earlier revisions had inner pages saying "Film"/"Info" instead of
"Cinematography"/"About Me" — that inconsistency is gone, everything reads
the same everywhere now. Film/Cinematography still comes before
Photography site-wide per the original explicit instruction, even though
the real andreuuv.xyz has Photography before Film. Film page keeps its own
`--grouped` visual treatment (brand joins the link row instead of being
pinned far left with `margin-right:auto`) — that's a styling difference
only, the order/wording is the same as everywhere else.

**"Index" is a real link everywhere, not an overlay trigger anymore** —
it now points straight to `index.html` (the tracklist/album-sheet page,
see below) on every page's main nav, Home's big menu, and the overlay
menu's own top-left "Index" heading. Before this it opened the fullscreen
overlay menu (`data-menu-open`). Practical effect: the overlay is still
fully reachable on mobile via the separate "Menu" hamburger toggle
(`.site-nav__menu-toggle`, only visible `<720px`), but on **desktop there
is no longer any way to open the overlay menu** — "Index" now navigates
instead. This was intentional per Andreu's request; flag it if that turns
out to be unwanted.

## Home page (`home.html`)

- Full-bleed `<video>` background = **Andreu's real footage**
  (`assets/video/home-reel.mp4`), muted/loop/autoplay with heavy
  cross-browser autoplay hardening in `js/home.js` (retries on
  `loadedmetadata`/`canplay`/`load`/`pageshow`/`visibilitychange`/first
  interaction — muted autoplay is usually reliable but this belt-and-
  braces approach was requested explicitly). Native browser overlays
  (Safari's center "tap to play", Chrome's cast/PiP icons) are hidden via
  CSS pseudo-elements + `disablePictureInPicture`/`disableRemotePlayback`.
  No grayscale filter — video plays in its original color.
- Top-left: "Available International" label.
- Top-right: small nav, **pinned to the right edge**, vertically centered
  at the *exact same height* as "Available International" (both sit on
  the viewport's vertical center line).
- Bottom-left: big stacked menu, numbers **001–004 at the top of each
  label** (not baseline-aligned), Epoch font, weight **400** (Epoch.otf
  only ships weight 400 — 500 was forcing a synthetic/fake bold that
  masked the real typeface's strokes, fixed after Andreu couldn't see the
  font change and asked to remove the fake bold). Hover: the hovered item
  scales **1.16×** from its own center (`transform-origin: center`), its
  number fades out (would otherwise be covered), items **after** it ease
  down `0.55em`, items **before** it ease up `0.55em` (via `:has()` —
  modern CSS, no JS needed for this part).
- Bottom-right: Play/Pause control (its own standalone element, not part
  of the big menu).

## Index page (`index.html`) — album-sheet layout, site's own visual language

A separate page from Home, reached from the word "Index" everywhere in the
site's navs (see Nav system above). Originally built to match a specific
reference screenshot pixel-for-pixel (a thick black rounded frame around
a cream sheet, Inter Bold typography, per an explicit "hazlo exactamente
como esta referencia" request) — then simplified back toward the site's
own established visual language one message later, per explicit
"mantener esa coherencia estética": plain white background, the standard
inner-page nav in its usual spot, no frame. The reference's grid/typography
ideas (header/tracklist layout, Inter Bold for this page specifically)
survived; the frame device and the custom nav treatment didn't. If a
future request says "like the reference image" again, that means the
grid/typography system, not the black frame — that part was explicitly
reverted.

- **Background**: plain `var(--bg)` white, same as every other page —
  no dark mat, no black frame (both were tried and reverted).
- **Layout**: `.index-sheet` is a flex column, two pieces —
  `.index-sheet__top` (metadata header + tracklist, normal `--edge`
  margins, `min-height: 52svh`, `justify-content: flex-start` so content
  sits at the top of that block rather than centered) and `.index-stills`
  (`flex: 1`) below it. The nav sits in between the two, `position:fixed`,
  and isn't actually part of that flex flow. No footer/label line anymore
  — deleted entirely per explicit request, along with its CSS rule.
- **Nav**: standard inner-page nav — exact same classes as Photography/
  Film (`site-nav site-nav--light site-nav--corner site-nav--pin-viewport`,
  fixed, vertically centered, right edge), no custom color overrides.
  Floats in the gap between the top metadata block and the stills below,
  same idea as Photography's nav floating between its two filmstrips.
  `.index-sheet__top`'s `min-height` is tuned so the big title doesn't
  collide with it — verified via real `getBoundingClientRect()` overlap
  checks, not eyeballed.
- **Typography — three different faces on this one page now, each used
  deliberately for a specific piece of text** (this has gone through
  several rounds — Inter, then Geist Mono, then split further — track
  which selector owns which face if this changes again):
  - **Geist Mono** (`var(--font-geist)`, matches the nav) — Role/Based/
    Available in the header (`.index-meta__row`), and the tracklist's
    No/Director/Role/Client columns (`.index-track`, with `.index-track__title`
    overridden separately, see below).
  - **Epoch** (`var(--font-display)`, fallback Oswald — same face as
    Home's bottom-left menu) — the big "Andreu Virgil" name
    (`.index-meta__title h1`) and every project title in the tracklist
    (`.index-track__title`).
  - **Geist Mono** again — "Portfolio — 2026" (`.index-meta__year`).
  - All of the above are pinned to **`font-weight: 400`** everywhere,
    even where the CSS used to say 700/800 for a bolder look — both
    Geist Mono's and Epoch's self-hosted `@font-face` rules here only
    register a Regular instance (see `css/style.css`), so requesting a
    heavier weight forces a synthetic/fake bold instead of a real one
    (the same lesson already learned elsewhere on this site — check this
    first if bold text on this page ever looks visually off).
- **Tracklist** (`No / Title / Director / Role / Client`) — populated
  from `data/projects.json`'s real film projects. Real data now (not
  placeholders): Director names, `role` (all "DOP, Colorist" — Andreu's
  actual role on every one of these), and `client` per project are filled
  in `data/projects.json`, with `—` shown only where a project genuinely
  has no director (Tikitaka x Input). Role/Client columns were widened
  (`15ch`/`22ch`) after real values like "DOP, Colorist" and "Dreta de
  l'Eixample" were clipping behind the ellipsis at the old narrower
  widths — Title still shrinks first via `minmax(0, 1fr)` to make room.
  First row gets `.is-active` by default (full opacity, rest dimmed to
  0.4); hovering any other row temporarily takes over that highlight.
  Click-through still goes to `film-project.html?id=...`. **Hovering (or
  focusing) a row also drives the two stills below** — per explicit
  request: left swaps to that project's own `preview` clip, right swaps
  to a static `thumbnail` still (not a second video), both reverting to
  the default single Home-reel video on mouseleave/blur (see the stills
  bullet below). Same reused-element src-swap technique as the Film
  page's hover stage (`js/film.js`) — no `data-fallback-label` on the
  swapped elements, since `media-placeholder.js` would delete them from
  the DOM on the first missing source and break every subsequent hover.
  Thumbnails are real now (see Current asset state below) — extracted as
  actual frames from each project's own `preview` clip via macOS's
  `qlmanage -t` (QuickLook's thumbnail generator works on video files,
  no ffmpeg needed), converted to JPG via `sips`. Checked all 7 visually
  before saving — none landed on a black/blank leader frame.
- **Two large stills → real muted video now**, edge-to-edge on all three
  outer sides (left/right/bottom — no page margin at all). At rest
  (nothing hovered) this whole area is **one single video**,
  `assets/video/home-reel.mp4` — the same reel as Home's background, per
  explicit "me gusta más así" request — absolutely positioned over the
  two-box hover stage underneath it (`.index-stills__default`, fades out
  via opacity on `.index-stills.is-previewing`, doesn't unmount/reload).
  Hovering/focusing a tracklist row fades it out and reveals the
  underlying two-box stage: left plays that project's own `preview` clip,
  right shows a static `thumbnail` still. `assets/video/index/
  lineup-horizontal.mp4` / `.../capsula-2.mp4` (copied from Andreu's
  `AAAA PORTFOLIO CONTENT/etalonaje/` source folder, a Nexiastudio ×
  Brandays "Lineup" campaign color grade) are no longer used as this
  area's *default* content since that switch — they're still on disk, not
  referenced anywhere currently. `<video muted loop playsinline
  autoplay>`, same convention as Home's hero video — `muted` is what
  actually satisfies "sin audio", not stripping the audio track from the
  file. **Vertical/portrait preview clips aren't cropped to fill their
  box** — per explicit "no lo escales de ancho" request, only the height
  is forced to match the box (`.is-portrait`, toggled in JS once
  `loadedmetadata` reports the real dimensions — can't know from the
  filename alone); width follows the video's own native aspect ratio and
  sits centered, narrower than the column. Confirmed against the Brandays
  capsule clips (1080×1920): height matched the box exactly, width came
  out narrower and centered, landscape clips unaffected. (A follow-up
  request tried showing two vertical clips side by side in Capsule 3's
  left box specifically — `#index-stills-left-video-2` + a `preview2`
  field — but that was reverted one message later, "vuelve a como
  estábamos antes", after Andreu saw 3 videos at once instead of what
  he'd asked for. Back to one clip per box, no `preview2` mechanism.) A
  decorative expand button (`.index-stills__btn`, bottom-right corner)
  sits over them — **no behaviour wired up yet**, purely visual.
- **Two more Nexiastudio × Brandays projects, colorist-only** — added as
  `brandays-convention-capsula-1` / `-3` in `data/projects.json`
  (`Capsula3.mp4` from `etalonaje/`, copied to `assets/video/film/`).
  Client: Brandays, Production: Nexiastudio, role: Colorist only (no
  DP/Director credit, per explicit "solo he trabajado de colorista"),
  category "Commercial". **Titles are placeholder-constructed**
  ("Brandays Advertising — Capsule 1"/"— Capsule 3") from what Andreu
  described (advertising for Brandays, not a corporate convention —
  corrected after an initial wrong guess) since he didn't give exact
  project names — flag/confirm with him and rename if he wants something
  different. (The `-convention-` in the id slugs is a leftover from that
  first wrong guess — harmless internally, not shown anywhere, not worth
  a churny rename.) **Capsule 1's preview is `Intro_Lineup_Horizontal.mp4`**,
  not `Capsula1.mp4` — swapped per explicit request ("cambia el video de
  capsule one por el que hay en la misma carpeta pero es horizontal"),
  confirmed via matching MD5 checksum + real browser playback
  (`videoWidth`/`videoHeight` 1920×1080) since `mdls`/Spotlight metadata
  lagged behind the file swap and briefly showed stale (wrong) dimensions
  — trust the browser/checksum over `mdls` right after an overwrite.
  `v3_Anna_FashionFilm.mov` and `Intro_Lineup_vertical.mp4` from the same
  folder are still unused. (A follow-up attempt to also show 2 vertical
  clips side by side in Capsule 3's box was tried and reverted — see the
  `.is-portrait` note above; don't reintroduce that without checking
  first.)

**Interaction spec still mostly undecided** — the `.is-active` default
row and the decorative expand button are the only things implemented
beyond the page's static look. Andreu hasn't explained what the rest of
this page's behavior (scroll behavior, what the expand button should
actually do) should be yet. Don't invent further behavior beyond what's
here without checking first.

## Photography page

Two horizontal filmstrips — **Analog** on top, **Digital** on bottom —
that auto-scroll sideways forever (CSS `@keyframes` translateX loop,
content duplicated for a seamless wrap), **opposite directions**,
**identical speed** (computed in JS as `scrollWidth / SPEED_PX_PER_SEC`,
not a fixed duration — so adding more items to one row later won't change
its speed relative to the other). Pauses on hover/focus. Nav = `--corner`
+ `--pin-viewport` (fixed, vertically centered, right edge). A
`.page-contact` element mirrors it on the **left** edge — "Contact", links
to `https://www.instagram.com/andreuuv_/`.

Data = **collections**, not individual photos: each card in a filmstrip is
a collection (`cover` image + `title`), linking to
`photo-collection.html?id=slug`, which lists that collection's `photos[]`.
Both rows now hold **real photos** (see the TODO checklist below for
exactly which collections/counts) instead of the original empty
placeholders.

**Card sizing is fully formula-driven** (`css/photography.css`), not fixed
px, per two explicit requests — "que en pantalla solo veamos 4 proyectos"
and "las imágenes [con] altura maxima hasta [el] espacio de el centro [del
menú] ... el sangreado de pagina ... minimo, 5-10 px":
- **Width**: `calc((100vw - 2×edge - (visible-1)×gap) / visible)` via a
  `--strip-visible` custom property on `.photo-strip` (4 on desktop, 2
  below 720px) — always exactly that many full cards fit on screen, no
  partial card peeking in.
- **Height**: `calc((100svh - 2×page-bleed - menu-gap - 2×chrome) / 2)` on
  `.photo-page`, where `--page-bleed` is the minimal 8px top/bottom
  margin, `--menu-gap` is the empty band the fixed nav floats in between
  the two rows, and `--chrome` is the measured (not guessed) height of
  each row's label + caption + spacing — get `--chrome` wrong and the
  page over/undershoots `100svh` by a few px. Verified by measuring
  `.photo-page`'s real `getBoundingClientRect().height` against
  `window.innerHeight` after any change to these variables.
- `.photo-strip__cover` is a `<span>` — **must** keep `display:block`, or
  none of its width/height/overflow-clipping styling applies at all (a
  non-replaced inline box ignores those properties) and the `<img>` inside
  falls back to its native pixel size. Hit this exact regression once
  already when the old fixed-width rule was removed; don't reintroduce it.

**Infinite-loop padding** (`js/photography.js`): a filmstrip with very few
real items (Analog only has 3 categories) is narrower per lap than the
visible strip itself once cards are sized to show 4 on screen — the loop
was visibly "jumping"/repeating almost immediately. Fixed by padding the
underlying item list out to `MIN_LAP_ITEMS` (8) by repeating it *before*
the standard seamless ×2 duplication, so one lap is always comfortably
wider than the screen regardless of how few real collections exist.

**Lesson learned**: don't `loading="lazy"` images inside a continuously-
moving marquee — "offscreen" is only ever a momentary transform state
there, and lazy-loading caused a broken-icon flash each time a card
scrolled into view. Load them eager.

## Film page

Left column = normal-flow scrolling list, **each item plays its own small
looping preview clip** (`<video muted loop playsinline autoplay>`, same
belt-and-braces play()-retry pattern as the home hero video — one attempt
right after creating the element isn't reliable, so it also retries on
`loadedmetadata`/`loadeddata`/`canplay`/`visibilitychange`/first pointer
interaction). This flip-flopped once already: was small looping clips
originally → changed to static images ("para centralizar la atención" on
the one big preview) → **changed back to small looping clips** per later
request, now with real preview footage for all 5 projects to actually loop.
If a project has no `preview` yet, `itemMedia()` in `js/film.js` falls back
to a static `<img>` of `thumbnail` — don't assume every card is always a
`<video>`. Right side = a `position:fixed` **white** stage (`--bg`, matches
the rest of the site — was black originally, changed on request) that plays
that project's `preview` clip **large** on hover/focus of a list item
(`js/film.js` swaps the stage `<video>`'s `src`). Below 900px width the
stage hides and the list goes full-width.

Nav = `--light` (dark text — was `--overlay`/white text back when the stage
was black) + `--corner` + `--pin-viewport`, **brand first** in the DOM
(differs from other pages, via `--grouped`).

`data/projects.json` has both `vimeoId`/`vimeoHash` (full video, only
loaded on the individual project page) **and** a `preview` field (short,
light local `.mp4` for the list/hover-stage) — keeps the list fast, the
heavy Vimeo embed only loads when someone opens a project. Two projects
(`brandays-convention-capsula-1`/`-3`) also have `hideFromFilmList: true`
— they stay in the data (Index tracklist still shows them) but are
filtered out of this page's list specifically, per explicit "no quiero
que estén los videos de brandays en el cinematography" request.

**Real bug found and fixed here**: `.site-nav`'s base rule is `left:0;
right:0` (full viewport width) even though its visible content only sits
at the right edge via `justify-content:flex-end` — with
`--pin-viewport` (`position:fixed`), that empty left-hand strip sat on
top of (and silently ate hover on) any scrolling list content that
happened to cross the nav's fixed vertical band, since a block's full box
captures pointer events even where nothing is visibly rendered. Fixed
site-wide (not just here) with `pointer-events: none` on `.site-nav`
itself and `pointer-events: auto` on the actual interactive children
(`.site-nav__brand`, `.site-nav__links a`, `.site-nav__menu-toggle`) —
see `css/style.css`. Worth remembering if a future hover/click report on
any page turns out to be this same invisible-hitbox issue rather than
caching.

### Individual project page (`film-project.html`)

Rebuilt to match a reference layout Andreu sent (a framed page: dark
margin around a white "card" — same device as the Index page's earlier
black-frame experiment, applied fresh here, independent of that page's
history) per explicit "vamos a hacer un layout algo parecido a esto"
request. `.project-frame` uses the same `min-height: 0` flex-item fix as
the Index page's stills (`css/index-sheet.css` has the fuller writeup) so
the right column's video area correctly fills the remaining height
instead of being pushed around by intrinsic sizing.

- **Top bar** (`.project-top`, 3-column grid): left = back link + category
  + title; center = "AV" brand mark (plain text — no icon/logo file
  exists for this site); right = email + the standard 5-link nav (same
  order/wording as every other page, current page marked via
  `aria-current`). Rendered as a plain link list in `js/film-project.js`
  rather than reusing the shared `.site-nav` component, since this page's
  3-column top bar (brand centered) doesn't match how that component is
  normally composed.
- **Body** (`.project-columns`, 2 columns): left stacks `.project-info`
  blocks bottom-aligned (Project description, Credits, Details —
  client/year) via `justify-content: flex-end`; right is the Vimeo embed
  (or the `media-placeholder` fallback when `vimeoId` is still a
  `REPLACE_...` placeholder, which is every project right now).
- Prev/next project nav kept at the bottom of the frame, same as before —
  cycles through the **full** project list (including the two
  `hideFromFilmList` Brandays ones), not just what's shown on the Film
  list page.
- Mobile (`820px`): top bar stacks to a single column, body drops to one
  column with the video first (`aspect-ratio: 16/9`) and info below.

## Info page — iterated heavily; final state matches the real site's *system*, not its exact pixels

The real `andreuuv.xyz/info/` is a **Readymag** export: every element is
individually, absolutely pixel-positioned on a fixed canvas — there is no
underlying grid/flex logic to copy, just hand-placed coordinates (e.g.
"Available for" and "Editorial/Commercial/…" don't even share a right
edge). **True pixel-for-pixel cloning is not achievable while staying
responsive** (an explicit project requirement) — say so plainly if asked
again rather than chasing impossible precision. What *was* replicated
exactly, measured live from the real site via browser devtools:
- All text is **Geist Mono**; "Bio" specifically is **Zeyada**.
- "Available for"/"Editorial…" were measured at `font-weight:400` on the
  real site, but Andreu then explicitly asked to make them **bold (700)**
  here — a deliberate departure, keep it.
- Portrait aspect ratio: exactly `262/386` (measured, not guessed).

Current layout:
- `.info-top` ("Based in Barcelona…" + email) is **`position:fixed`**,
  stays visible through scroll, opaque white background. Its height is
  tracked in a custom property **`--topbar-h`** (`calc(2 * var(--edge) +
  15px)` desktop, `6.5rem` mobile, redefined inside the `820px` media
  query) — **any element that uses a fixed (non-%) `top`/`margin-top` and
  needs to clear this bar must add `var(--topbar-h)` explicitly**;
  percentage-based positioning (nav, portrait) doesn't need it since the
  hero section's box is already the full `100svh` regardless of the fixed
  bar. This bit past — got it wrong twice (available block, then tagline
  on mobile) before catching both; check any new absolutely-positioned
  child against this rule.
- `.info-tagline` ("Spanish · Cinematographer, Photographer & Colorist")
  is `.page-contact` reused — **`position:fixed`**, pinned left, vertically
  centered, single line (`white-space:nowrap`), same font/gradient-hover
  styling as the nav.
- The **nav** is `.site-nav--absolute-center` — visually sits at the same
  height as the tagline at rest, but is **not** fixed: it scrolls away
  with the page (explicit request, see Nav system above).
- Portrait: dead center of `.info-hero` (`top:50%;left:50%`). Hover:
  rotate `-4deg` + scale `1.08`, plain CSS `:hover` — eases back to normal
  on mouseleave. Transition is slow: `1.6s`. This flip-flopped a few times
  during earlier sessions between plain hover and a **sticky** version
  (`js/info.js` added `.is-activated` on first hover/tap and never removed
  it, so it stayed tilted forever) — currently back to plain hover per
  explicit request ("que vuelva como estaba antes" on mouseleave).
  `js/info.js` is an intentionally-empty stub now, not deleted, in case
  this flip-flops again.
- "Available for" top-right, bold, centered, exactly 2 lines ("Available
  for" / the rest), extra right margin (`var(--edge) + 2.5rem`). The
  "Available for" line itself (just the `<h2>`, not the line below) uses
  `--font-display` (Epoch/Oswald) — same face as Home's big bottom-left
  menu — everything else on this page stays on `--font-geist`.
- "Bio" bottom-right, `Zeyada` mark + paragraph.
- **"Selected Work" / CV list section was deleted entirely** (HTML, CSS,
  and its inline JSON-rendering script) — don't recreate it unless asked.
- No footer on `.info-hero` itself (nor on Photography/Film) — dropped
  project-wide in favor of a cleaner single-viewport composition. The
  page does end in a real closing section now though, see below.

### Contact section (`.info-contact`, bottom of the page)

Rebuilt from scratch to match a reference layout screenshot Andreu sent
(a "CONTACT" block: big title + arrow icon, divider, label/value rows for
phone/address/mail, social links row) — replaced an earlier version of
this section entirely (a giant Bebas-Neue-then-Geist-Mono email + "Let's
Bring Your Ideas — To Life" CTA statement; check git history if that's
ever wanted back). Also folded in the standalone `.info-socials` nav that
used to sit just above this section — its 3 links live here now instead,
so they only appear once on the page.

Deliberate departures from the reference, all per explicit request:
- **No phone or address rows** — just two: `Mail` (mailto link) and
  `Instagram` (an `ig.me/m/andreuuv_` deep link straight to Instagram's
  DM composer, not just the profile). Andreu asked for "email o un link
  a instagram" — included both rather than picking one, since there was
  no clear signal to drop either.
- **No photo** in this section (the reference has one bottom-left).
- **Everything left-justified** — the reference right-aligns each row's
  value against the row's label; this deliberately doesn't, values just
  follow the label on the left.
- Title is Andreu's own tagline ("Spanish · Cinematographer, Photographer
  & Colorist") instead of the reference's literal "CONTACT" wordmark.
- Typography is Geist Mono throughout (not the reference's font), keeping
  this section consistent with the same "matches the portfolio" direction
  the giant email statement was just moved to.

`js/info-fit.js` is no longer `<script>`-included on this page (it only
ever targeted the old email/CTA elements, which are gone) — the file
itself is left on disk, not deleted, in case that section comes back.
LinkedIn/Behance still use `href="#"` placeholders — real URLs still
needed from Andreu.

## Placeholder system (`js/media-placeholder.js`)

Generic, shared: any `<img>` or `<video>` with `data-fallback-label="path"`
that fails to load gets swapped for a `.media-placeholder` div showing that
path as text, instead of a broken-image icon. Must be `<script>`-included
in `<head>` (not before `</body>`) so its capture-phase `error` listener is
registered before any matching element starts fetching. Also sweeps
already-failed media on `DOMContentLoaded` plus a 1.2s timeout safety net
(some browsers never fire `error` for a video with a missing source).
**Exception**: the Film page's hover-preview `<video>` (a single reused
element whose `src` keeps changing) deliberately does **not** get a
`data-fallback-label` — the placeholder swap would delete it from the DOM
on the first missing source and break every subsequent hover.

## Current asset state (as of last check)

Mixed now — some real content has landed, the rest is still intentionally
empty placeholder:
- **Real**: `assets/video/home-reel.mp4` (Andreu's real footage, home
  background, **also now the Index page's default stills video** — see
  Index page section above). `assets/images/photography/analog/*` (4
  collections, 22 photos — TwoJeys X Kiimu, AlemanBeatz, Places,
  Lifestyle) and `assets/images/photography/digital/*` (6 collections, 40
  photos) — see the Photography page section above and the TODO
  checklist below for exact collection names/counts.
  `assets/images/favicon.png` (the site's favicon on all 7 pages,
  generated from `assets/images/info/contact.jpg`).
  `assets/video/film/*-preview.mp4` — real content for all 7 projects.
  `assets/images/film/*-thumb.jpg` — **now real too**, a still frame
  extracted from each project's own preview clip (via `qlmanage -t` +
  `sips`, see the Index page section above) — no longer the gray
  placeholder. `assets/video/index/lineup-horizontal.mp4` and
  `capsula-2.mp4` still exist on disk but are **no longer referenced
  anywhere** — they were the Index stills' original default before that
  switched to `home-reel.mp4`; harmless leftovers, not worth deleting
  unless they start causing confusion.
- **Still empty on purpose**: `assets/images/home-poster.jpg`,
  `assets/images/info/portrait.jpg`. `assets/images/home/still-0{1,2}.jpg`
  is no longer referenced anywhere either — the Index page's bottom
  section uses real video now instead (see above), so those two files
  are effectively dead/unused now, not "empty on purpose"
  placeholders anymore. Every image path still listed above shows the gray
  placeholder block — expected, not a bug.

Earlier in the project Andreu had test/stock images added temporarily to
preview layouts, then asked for all of them to be deleted again
("borra todas las imágenes de muestra... vuelve a como estaba antes") — so
**don't re-add stock/sample media without asking first**; only add real
files Andreu actually supplies (as happened with the Analog/Digital photos
above).

## Testing/verification gotchas (this sandbox specifically)

Encountered repeatedly this session — not real site bugs, just this
preview tool's quirks:
- **Aggressive caching**: after editing a CSS/JS/HTML file, the preview
  browser can keep serving the old version even on a fresh navigation.
  Fix: append a throwaway query string to the specific resource URL(s)
  that changed (`style.css?v=2`) to force a refetch, verify, then revert
  the query string before leaving the file in that state. This has hit
  the **top-level HTML document itself**, not just its CSS/JS — a plain
  `navigate` (even with `force: true`) can still render a stale cached
  copy of the `.html` file. If a change isn't showing up anywhere at all
  (not just one resource), put the cache-busting query string on the page
  URL itself (`home.html?nocache=1`) rather than only on the changed
  asset.
- **`document.hidden`/0×0 viewport**: the preview tab occasionally reports
  as backgrounded or briefly has a `0x0` `window.innerWidth/innerHeight` —
  this pauses `requestAnimationFrame` and can make CSS transitions/
  animations appear completely frozen in `getComputedStyle()` even though
  the underlying rule/class is 100% correct (confirmed this by forcing
  `transition:none` and seeing the target value apply instantly). Prefer
  `setTimeout` over `rAF` for any "run once after layout settles" logic
  in production code (already the pattern in `js/photography.js`). When
  a test result looks impossible (e.g. an `!important` inline style not
  reflecting in computed style), suspect this before assuming the CSS is
  wrong — re-check `window.innerWidth`/`document.hidden` first.
- Always verify with real numbers (`getBoundingClientRect`,
  `getComputedStyle`) rather than trusting the screenshot tool's pixel
  positions alone — its scaling/cropping has been inconsistent across
  calls in this environment.

## Local preview

```bash
cd /Users/andreuuv/Desktop/PaginaWEB
python3 -m http.server 8811
```
Then open `http://localhost:8811`. Opening the `.html` files directly via
`file://` breaks every page that `fetch()`s JSON data (Photography, Film,
and now Index too — `js/index-track.js` fetches `data/projects.json`).

## Open TODOs (also tracked in README.md)

- [x] Real photos → `data/photos.json` — **done**: Analog has 3 real
      collections (2jeys x Kiimu, AlemanBeatz, PLACES — 16 photos), Digital
      has 6 (Club, Amore, Little Things, Marina Vestido, Reflections of
      Memory, Sheila — 40 photos). Both replaced the old empty placeholder
      collections entirely.
- [ ] Real Vimeo IDs → `data/projects.json` — `preview` clips and
      `thumbnail` images are already real for all 7 projects now (the
      thumbnails are frames extracted from each project's own preview
      clip), this is just the Vimeo embed IDs left
- [ ] Portrait image → `assets/images/info/portrait.jpg`
- [ ] `assets/images/home-poster.jpg` (poster frame, currently missing)
- [x] Index page (`index.html`) bottom stills — **done**: real muted video
      now (`assets/video/index/lineup-horizontal.mp4` + `capsula-2.mp4`),
      not the old empty `still-01/02.jpg` placeholders.
- [x] 2 more Nexiastudio × Brandays projects (colorist-only) — **done**,
      added to `data/projects.json` (`brandays-convention-capsula-1`/`-3`)
      — but titles were constructed, not given verbatim by Andreu; confirm
      the real names with him (see "Index page" section above).
- [ ] Index page: Andreu still needs to explain the intended interaction
      behavior — the expand button on the stills and general page
      behavior beyond what's already built (see "Index page" section
      above).
- [ ] Domain/hosting decision (deferred by Andreu)
- [ ] Decap CMS — deferred to a later phase, only once design is settled
- [ ] `git init` + first commit — not done yet, do when Andreu is ready to deploy
