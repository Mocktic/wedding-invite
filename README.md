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
- **venues**: name, address, Google Maps link (no link → no directions button), and a `tagline`, the
  script line in the place scene ("the land of Mewar")
- **events**: title, optional subtitle, date, start/end (24-hour, IST), venue, one line, painting
- **headline**: which event gets the big "Save the Date", the countdown and the place scene
- "Good to know" notes, music file, RSVP endpoint

Lines marked `PLACEHOLDER` are waiting on real details.

### Different invites for different guests

Each event has `show: true | false` in `src/config.js`, which controls what the **plain link** (no
`?invite=`) shows. Right now all six events have `show: true`.

For other guest lists, add a preset under `invites` and share its link. The presets in the config today:

```js
invites: {
  family:    { events: ['ganesh', 'haldi', 'engagement', 'baraat', 'lagan', 'reception'] },
  wedding:   { events: ['engagement', 'baraat', 'lagan', 'reception'] },
  reception: { events: ['reception'], headline: 'reception' },

  // Friends only: the After Party (Fri 4 Dec, Pushkar) has `show: false`, so it appears only on these three
  'after-party':           { events: ['afterparty'], headline: 'afterparty' },
  'wedding-after-party':   { events: ['ganesh', 'haldi', 'engagement', 'baraat', 'lagan', 'reception', 'afterparty'] },
  'reception-after-party': { events: ['reception', 'afterparty'], headline: 'reception' },
}
```

| Link | Events on this invite | Headline (Save the Date, countdown, place scene) |
|---|---|---|
| `/` (plain link) | every event with `show: true` (currently all six) | Wedding Ceremony · Wed 2 Dec · Badi Sadri |
| `/?invite=family` | all six: Ganesh Sthapana, Haldi & Mehendi, Engagement, Baraat/Toran/Varmala, Wedding Ceremony, Reception | Wedding Ceremony · Wed 2 Dec · Badi Sadri |
| `/?invite=wedding` | 1–3 December: Engagement, Baraat/Toran/Varmala, Wedding Ceremony, Reception | Wedding Ceremony · Wed 2 Dec · Badi Sadri |
| `/?invite=reception` | Wedding Reception only | Wedding Reception · Thu 3 Dec · RTDC Ajmer |
| `/?invite=after-party` | After Party only | After Party · Fri 4 Dec, 6:00 PM – Midnight · Pushkar |
| `/?invite=wedding-after-party` | all six events + After Party | Wedding Ceremony · Wed 2 Dec · Badi Sadri |
| `/?invite=reception-after-party` | Wedding Reception + After Party | Wedding Reception · Thu 3 Dec · RTDC Ajmer |

The After Party is for friends only. Its `show` is `false`, so it never appears on the plain link or on
`family`, `wedding` or `reception`; only the three `…after-party` links show it.

What changes with the preset:
- the headline date, the countdown and the place scene ("will be held in … the land of Mewar / the city of Ajmer")
- the opening screen's date
- the events listed in the RSVP form's "Events you'll attend"
- "Add to Calendar" (every event on the invite goes into the calendar file on iPhone/Mac)
- the "See you in …" line on the RSVP thank-you card
- the event cards and the "Good to know" venues note, when the cards are switched on

Each RSVP records which preset it came from (the "Invite link" column in the sheet).

Good to know:
- Preset names are case-sensitive (`?invite=reception`, not `Reception`). An unknown name falls back to the plain link.
- A preset may include events whose `show` is `false`.
- If a preset's headline isn't on it, the first event on that invite becomes the headline.
- Anyone who edits the link by hand could see another preset, so treat presets as a convenience, not a secret.

## Link options

All the options the invite understands. Combine them with `&` in any order, e.g. `?invite=reception&autoplay=1`.

| Option | Values | Default | What it does |
|---|---|---|---|
| `invite` | `family` · `wedding` · `reception` · `after-party` · `wedding-after-party` · `reception-after-party` (any preset in config) | plain link | Which events this guest sees (see above) |
| `autoplay` | `1` (any value except `0`) | off | **The film plays itself** after the tap at a calm pace. It rests on the painted names (about 2.5 s), on the night Save the Date (about 3.5 s), and on each event card (about 3.5 s) when the cards are switched on, then stops at the RSVP. A ❚❚/▶ button (bottom-left) pauses and resumes; any scroll, swipe or arrow key pauses it too. Ignored for guests whose phone asks for reduced motion |
| `cover` | `video` · `meadow` | photos | **Preview:** `video` shows the walking video (sky removed, meadow kept) on the opening screen instead of the two photos; it plays once and rests on its last frame. `meadow` shows one photo of the two of them laughing and holding hands in the meadow, with the grass fading into the paper |
| `entrance` | `walk` | fade in | **Preview:** the two cover photos glide in from either side instead of fading in (ignored with `cover=video`) |
| `cards` | `1` | config | **Preview:** shows the event-card deck even though `sections.celebrations` is `false` in config |

Without `autoplay`, a "Swipe up to begin" cue ("Scroll to begin" on laptops) appears after the tap and
disappears on the first scroll. Then "Swipe up to continue" fades in whenever the guest stops mid-way for
4 seconds. It never shows while the film is playing itself, while typing, or once the RSVP form is in view.

### Ready-to-share links

Replace `your-site.vercel.app` with the real address.

| For | Link |
|---|---|
| Close family (all six events) | `https://your-site.vercel.app/?invite=family` |
| Close family, plays itself | `https://your-site.vercel.app/?invite=family&autoplay=1` |
| Wedding guests (1–3 Dec) | `https://your-site.vercel.app/?invite=wedding` |
| Wedding guests, plays itself | `https://your-site.vercel.app/?invite=wedding&autoplay=1` |
| Reception only | `https://your-site.vercel.app/?invite=reception` |
| Reception only, plays itself | `https://your-site.vercel.app/?invite=reception&autoplay=1` |
| Friends: After Party only | `https://your-site.vercel.app/?invite=after-party` |
| Friends: After Party only, plays itself | `https://your-site.vercel.app/?invite=after-party&autoplay=1` |
| Friends: whole wedding + After Party | `https://your-site.vercel.app/?invite=wedding-after-party` |
| Friends: whole wedding + After Party, plays itself | `https://your-site.vercel.app/?invite=wedding-after-party&autoplay=1` |
| Friends: Reception + After Party | `https://your-site.vercel.app/?invite=reception-after-party` |
| Friends: Reception + After Party, plays itself | `https://your-site.vercel.app/?invite=reception-after-party&autoplay=1` |

Previews for the couple to compare (not for guests yet):

| Preview | Link |
|---|---|
| Video cover | `https://your-site.vercel.app/?cover=video` |
| Meadow photo cover | `https://your-site.vercel.app/?cover=meadow` |
| Photos gliding in | `https://your-site.vercel.app/?entrance=walk` |
| Event cards switched back on | `https://your-site.vercel.app/?cards=1` |
| Everything together | `https://your-site.vercel.app/?invite=family&cover=video&cards=1&autoplay=1` |

## Switching sections off

`config.sections.celebrations` is `false`: the event-card deck (and the "Good to know" notes on its last
card) is hidden and the RSVP follows the date scene directly. The code is untouched; set it to `true` to
bring the deck back. The RSVP form still lists every event to tick.

## RSVP data

The form collects **name** (required), **events attending** (at least one; pre-filled from the events
the guest tapped on the cards, editable in the form) and **message** (optional), plus the invite preset.
Until `config.rsvp.endpoint` is set, entries are kept in the guest's browser and logged to the console.

### RSVPs into Google Sheets

1. Create an empty Google Sheet. **File → Settings → Time zone → (GMT+05:30) India Standard Time.**
2. **Extensions → Apps Script**, replace the sample code with `scripts/rsvp-apps-script.gs`, **Save**.
3. **Deploy → New deployment → Web app** · Execute as: **Me** · Who has access: **Anyone** → **Deploy**,
   then authorize (Advanced → Go to … → Allow; it is your own script).
4. Copy the **Web app URL** (`https://script.google.com/macros/s/…/exec`) into `config.rsvp.endpoint`.

Leave the sheet empty: on the first RSVP the script creates
- **RSVPs**: Submitted at · Name · Events attending (`A | B | C`) · Message · Invite link
- **Summary**: every event with a live count (`=COUNTIF(RSVPs!C:C,"*Event name*")`)

To see who is coming to one event, filter the "Events attending" column by *Text contains* that event's full name.

Privacy: keep the sheet's sharing on **Restricted**. The web app only *adds* rows and never returns sheet
data, so the public link can't be used to read anything. A hidden anti-bot field, a per-minute limit and
formula-injection escaping guard against junk. After editing the script, use **Deploy → Manage deployments →
Edit → New version** so the URL stays the same.

## The film, scene by scene

| # | Scene | What happens |
|---|---|---|
| 0 | Unveil | Alta dot on raw canvas with शुभ विवाह, names and date; below, Aditi and Yashwant stand side by side greeting with folded hands. Tapping fades them away as red ink bleeds across the screen, and starts the music. (Add `?entrance=walk` to the link to preview them walking in from either side.) |
| 1–2 | Hands → Names (one pinned shot) | The painted alta animation plays with scroll, the camera pushes into the dots and the thread runs out. The names' paper floods in over the hands while *Aditi* starts painting; the thread underlines her name, loops round the "&", runs down the margin past *Yashwant*, underlines his name and rests on a bead |
| 3 | Place & date | A pen sketch of a Rajasthani lake palace fills with watercolour (headline venue), the sun sets over it (headline date), palace lights and stars come on (countdown, Add to Calendar) |
| 4 | The Celebrations | A deck of function cards, one per day, in a single pinned screen. Each scroll step peels the top card away while the sky drifts to the hour of the next day's events (dawn, afternoon, sunset, night). Tapping an event marks it "attending". The thread ties the deck's corner and the last card turns over to show "Good to know". Each flick settles on a card |
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
| Alta hands animation, sepia Lake Pichola painting, bride and groom namaste photos (cover) | provided |
| Miniatures: *Wedding Procession of Rama* (Mewar Ramayana), *Marriage of Krishna and Rukmini* (Bikaner, Google Art Project), *Maharana Ari Singh at the Jagniwas Water Palace, 1767* (Met), *Maharana Ari Singh and his consort on a terrace* (Cleveland Museum of Art), *Ganesha with Riddhi and Siddhi* (Guler, late 18th c.) | Wikimedia Commons, public domain |
| Ink clips 470, 3995 (masks), 41999 (red bleed); gold glitter 46317; mist 50936; fireworks 45739; sparks 683; birds 9782 | Mixkit (free licence) |
| Music: "India" (track 21) | Mixkit (free licence). Swap `public/assets/audio/music.mp3` for your own song |
| Paper001, Fabric030 textures | ambientCG (CC0) |
| Icons | Phosphor Icons (MIT) |
| Fonts: Pinyon Script, Rozha One, Cormorant Garamond, Tiro Devanagari Hindi | Google Fonts via Fontsource (OFL) |
