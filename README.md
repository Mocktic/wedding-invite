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
- **events**: title, optional subtitle, date, start/end (24-hour, IST), venue, one line, painting
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
| 0 | Unveil | Alta dot on raw canvas, शुभ विवाह. Tapping bleeds red ink across the screen and starts the music |
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
| Alta hands animation, sepia Lake Pichola painting | provided |
| Miniatures: *Wedding Procession of Rama* (Mewar Ramayana), *Marriage of Krishna and Rukmini* (Bikaner, Google Art Project), *Maharana Ari Singh at the Jagniwas Water Palace, 1767* (Met), *Maharana Ari Singh and his consort on a terrace* (Cleveland Museum of Art), *Ganesha with Riddhi and Siddhi* (Guler, late 18th c.) | Wikimedia Commons, public domain |
| Ink clips 470, 3995 (masks), 41999 (red bleed); gold glitter 46317; mist 50936; fireworks 45739; sparks 683; birds 9782 | Mixkit (free licence) |
| Music: "India" (track 21) | Mixkit (free licence). Swap `public/assets/audio/music.mp3` for your own song |
| Paper001, Fabric030 textures | ambientCG (CC0) |
| Icons | Phosphor Icons (MIT) |
| Fonts: Pinyon Script, Rozha One, Cormorant Garamond, Tiro Devanagari Hindi | Google Fonts via Fontsource (OFL) |
