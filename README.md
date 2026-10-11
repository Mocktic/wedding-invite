# Aditi & Yashwant · The Vermilion Thread

A hand-painted, scroll-driven wedding invitation. The celebrations run **26 November – 3 December 2026**
(Badi Sadri and Ajmer, Rajasthan), with the **Lagan Phere on Wednesday, 2 December** as the headline.
Mobile first. Scrolling plays it like a short film and it ends at the RSVP.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173 (and on your Wi-Fi, so you can test on a phone)
npm test           # small logic tests (countdown, calendar, RSVP validation, config)
npm run build      # production build in dist/
npm run preview    # serve the production build
```

`dist/` is a static site that can be deployed to Vercel, Netlify, Cloudflare Pages or GitHub Pages.
It is set to `noindex` so search engines stay out. Only people with the link will find it.

## Changing content

Everything editable lives in **`src/config.js`**:
- **venues**: name, address, Google Maps link (no link → no directions button)
- **events**: title, optional subtitle, date, start/end (24-hour, IST), venue, one line, roundel image, effect
- **headline**: which event gets the big "Save the Date", the countdown and the place scene
- "Good to know" notes, music file, RSVP endpoint

Lines marked `PLACEHOLDER` are waiting on real details.

### Different invites for different guests

Each event has `show: true | false`, which controls what the plain link shows.
For other guest lists, add a preset under `invites` and share its link:

```js
invites: {
  family:    { events: ['ganesh', 'haldi', 'engagement', 'baraat', 'lagan', 'reception'] },
  wedding:   { events: ['engagement', 'baraat', 'lagan', 'reception'] },
  reception: { events: ['reception'], headline: 'reception' },
}
```

| Link | Shows |
|---|---|
| `https://your-site.vercel.app/` | events with `show: true` |
| `https://your-site.vercel.app/?invite=family` | all six events |
| `https://your-site.vercel.app/?invite=wedding` | 1–3 December |
| `https://your-site.vercel.app/?invite=reception` | only the reception; its date and venue become the headline |

The page adapts to whatever is shown: the headline date, the countdown, the venue scene,
"Add to Calendar" (every shown event goes into the calendar file on iPhone/Mac), the venues note
and the "See you in …" line. Each RSVP records which invite link it came from.
Anyone who edits the link by hand could see another preset, so treat presets as a convenience, not a secret.

## RSVP data

The form collects **name** (required) and **message** (optional), plus the invite preset.
Until `config.rsvp.endpoint` is set, each entry is kept in the guest's browser and logged to the console.
Set `endpoint` to any URL that accepts a JSON `POST` `{ name, message, invite, at }`
(for example a Google Apps Script web app, Formspree or Supabase) and it will be stored there.

## The film, scene by scene

| # | Scene | What happens |
|---|---|---|
| 0 | Unveil | Alta dot on raw canvas, शुभ विवाह. Tapping bleeds red ink across the screen and starts the music |
| 1 | Hands | The painted alta animation plays with scroll, the camera pushes into the dots, the thread runs out, paper floods in |
| 2 | Names | The thread underlines *Aditi*, loops round the "&", underlines *Yashwant*; the names are brush-painted in |
| 3 | Place & date | A pen sketch of a Rajasthani lake palace fills with watercolour (headline venue), the sun sets over it (headline date), palace lights and stars come on (countdown, Add to Calendar) |
| 4 | The Celebrations | Night. Events grouped by day. The thread winds between miniature-painting roundels, with petals for Haldi and Varmala and diyas for Ganesh Sthapana and the Pheras |
| 5 | RSVP | The thread ties a knot, then a paper card. Sending it flips the card and sets off petals, fireworks and sparks |

Reduced-motion users get the same content without pinning or scrubbing. Low-power or data-saver
devices skip the ambient video layers.

## Code map

```
src/config.js            content
src/main.js              boot: fonts, Lenis + GSAP ScrollTrigger, scenes, sound toggle
src/scenes/*.js          one file per scene, each builds its DOM + its own scroll timeline
src/lib/                 frameSequence (scroll-scrubbed frames), inkMask (ink-sprite masks),
                         thread, brushText, overlayVideo (blend-mode clips), petals, music,
                         countdown, calendar, rsvp
src/styles/main.css      palette, type, every scene's look
scripts/process-assets.sh  raw downloads → web-ready files in public/assets/
```

## Assets

Raw sources go in `assets-src/` and `npm run assets` regenerates `public/assets/`
(needs `brew install ffmpeg webp`). `assets-src/downloads/` is git-ignored. Re-download the clips with
the IDs below if you need to rebuild.

| Asset | Source |
|---|---|
| Alta hands animation, sepia Lake Pichola painting | provided |
| Miniatures: *Wedding Procession of Rama* (Mewar Ramayana), *Marriage of Krishna and Rukmini* (Bikaner, Google Art Project), *Maharana Ari Singh at the Jagniwas Water Palace, 1767* (Met), *Maharana Ari Singh and his consort on a terrace* (Cleveland Museum of Art), *Ganesha with Riddhi and Siddhi* (Guler, late 18th c.) | Wikimedia Commons, public domain |
| Ink clips 470, 3995 (masks), 41999 (red bleed); gold glitter 46317; mist 50936; candle 6925; fireworks 45739; sparks 683; birds 9782 | Mixkit (free licence) |
| Music: "India" (track 21) | Mixkit (free licence). Swap `public/assets/audio/music.mp3` for your own song |
| Paper001, Fabric030 textures | ambientCG (CC0) |
| Icons | Phosphor Icons (MIT) |
| Fonts: Pinyon Script, Rozha One, Cormorant Garamond, Tiro Devanagari Hindi | Google Fonts via Fontsource (OFL) |
