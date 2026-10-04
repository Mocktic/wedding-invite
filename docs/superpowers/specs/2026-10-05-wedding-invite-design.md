# Aditi & Yashwant — "The Vermilion Thread" Wedding Invite

**Date:** 2026-10-05 · **Status:** approved in chat, implementation started

## Intent
A mobile-first wedding invitation + RSVP site for **Aditi & Yashwant**, wedding on
**Tuesday, 1 December 2026, Udaipur, Rajasthan**. Shared with family (WhatsApp link).
It should feel like a hand-painted short film that plays as you scroll and ends at the RSVP.
Not generic; painted / brush-on-canvas art form. RSVP storage is out of scope for now.

**Success:** a guest opening the link on a mid-range phone sees the first screen in ~2s,
the scroll feels like a film (smooth, scrubbed, no jank), and they reach and submit the RSVP.

## Concept
One long painted canvas; scrolling is the brush. A vermilion (alta) thread is drawn by
scroll through every scene, ending in a *gathbandhan* knot that opens the RSVP card.
Painted look = Mewar miniature crops (public domain) + watercolour + code-drawn brush
masks, ink bleed, paper grain. Green-screen clips add real motion, pre-keyed offline.

## Palette & type
| Token | Hex |
|---|---|
| canvas | `#F4EBDD` |
| alta (thread) | `#B3202A` |
| kumkum | `#6E1423` |
| saffron | `#E8A33D` |
| gold | `#B8893B` |
| dusk | `#2E3A5C` |
| ink (sepia text) | `#4A3426` |

Names: Pinyon Script + ink-bleed filter · Numerals/headings: Rozha One · Body: Cormorant
Garamond · Devanagari accents: Tiro Devanagari Hindi. All self-hosted.

## Scenes
0. **Unveil** (tap gate) — alta dot pulses, "शुभ विवाह", "Tap to unveil". Tap → dot bleeds
   across screen, gold-dust overlay, music fades in, scroll unlocks. Hands frames preload.
1. **Hands** (pinned ~300vh) — alta video as scroll-scrubbed frame sequence on canvas;
   caption "Every story begins with a little colour."; zoom into dots → dots become thread;
   red ink-splash transition.
2. **Names** (pinned ~200vh) — "Aditi" brush-paints in, thread draws the "&", "Yashwant"
   paints in; "Together with their families"; parallax watercolour blotches.
3. **Save the Date** (pinned ~300vh) — layered Udaipur dusk: sky wash saffron→rose→indigo,
   sun sets, palace layer, lake shimmer, birds + mist overlays; "01 · XII · 2026" paint-dab
   reveal, "Tuesday · Udaipur", live countdown, Add to Calendar (.ics + Google link), stars.
4. **The Day** (free scroll) — thread runs down centre; roundel miniatures bloom in with
   time/title/line. Placeholders: Baraat 4 PM, Varmala 6 PM, Pheras 8 PM, Dinner 9:30 PM.
   Petals at Varmala, diya flame at Pheras.
5. **Venue** (pinned ~200vh) — sepia ink-line lake palace floods into watercolour via brush
   mask; boat glides; venue name/address, Open in Maps; icon row (dress code, shawl note).
6. **RSVP** — thread ties knot → handmade-paper card: **Name (required)**, **Message
   (optional)**, "Send your blessings". Submit → petals + fireworks, card flips to
   "Thank you, {name}". Footer "With love, the Families".

Global: paper-grain overlay, floating mute toggle, thread as progress.

## Architecture
- Vite + vanilla JS, GSAP (ScrollTrigger, DrawSVG, SplitText), Lenis.
- `src/config.js` — all content (names, date, schedule, venue, map URL, music). Only file
  edited for content changes.
- `src/scenes/*.js` — one module per scene: `{ id, mount(root, ctx) }`, builds its DOM and
  its own ScrollTrigger timeline.
- `src/lib/` — `frameSequence` (canvas scrubber), `alphaVideo` (WebM-VP9-alpha vs
  HEVC-alpha pick), `loader` (scene-ahead preloading), `motion` (reduced-motion/low-power
  flags), `rsvp` (`submitRsvp()` stub), `calendar` (.ics/Google), `countdown`.
- `scripts/process-assets.sh` — ffmpeg chroma key → `.webm` (VP9 alpha) + `.mov`
  (HEVC alpha, videotoolbox), frame extraction → WebP, image resize/compress.
- Reduced motion → cross-fades, no scrubbing. Low-power → skip ambient overlays.
- Desktop: centred portrait stage on painted surround.

## Assets
Provided: alta hands video, sepia lake palace painting. Downloaded (license not a concern
per owner; prefer free sources): ambientCG/Unsplash textures, Wikimedia Mewar miniatures,
Pixabay/Mixkit/Pexels green-screen clips (ink splash, birds, mist, gold dust, petals, diya,
boat, fireworks), Pixabay Music instrumental. Missing assets → graceful placeholder + a
"please source" list with search terms. Budget ~12 MB total, first screen ~300 KB.

## Testing
Vitest: countdown/date maths, calendar output, RSVP validation, config shape.
Visual: Chrome DevTools mobile emulation screenshots of each scene; Lighthouse pass.
