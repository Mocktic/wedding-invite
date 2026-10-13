// All invitation content lives here. Edit this file only to change text, events or venues.
// Items marked PLACEHOLDER are waiting on real details.

export default {
  couple: {
    bride: 'Aditi',
    groom: 'Yashwant',
    hashtag: '#AditiWedsYashwant',
  },

  // tagline: the script line under "… will be held in" when this venue hosts the headline event
  venues: {
    residence: {
      name: 'Our Residence',
      city: 'home',
      tagline: 'our home',
      address: 'Address to be shared', // PLACEHOLDER
      mapUrl: null, // PLACEHOLDER: paste a Google Maps link to show a directions button
    },
    badiSadri: {
      name: 'Badi Sadri',
      city: 'Badi Sadri',
      tagline: 'the land of Mewar',
      address: 'Chittorgarh, Rajasthan',
      mapUrl: 'https://maps.google.com/?q=Badi+Sadri,+Rajasthan', // swap for the exact venue's link
    },
    rtdcAjmer: {
      name: 'RTDC Ajmer',
      city: 'Ajmer',
      tagline: 'the city of Ajmer',
      address: 'Ajmer, Rajasthan',
      mapUrl: 'https://maps.google.com/?q=RTDC+Hotel+Ajmer', // swap for the exact venue's link
    },
  },

  // Every event. `show: true/false` decides what the default link (no ?invite=) shows.
  // date: YYYY-MM-DD · start/end: 24-hour HH:MM, Indian Standard Time · venue: a key from `venues`
  // image: painting shown on the day's card (public/assets/img)
  // The sky behind each day's card follows the time of its events automatically.
  events: [
    {
      id: 'ganesh',
      show: true,
      title: 'Ganesh Sthapana',
      subtitle: 'Baan',
      date: '2026-11-26',
      start: '06:00',
      venue: 'residence',
      note: 'We begin by seeking Lord Ganesha’s blessings.',
      image: 'roundel-ganesh.webp',
    },
    {
      id: 'haldi',
      show: true,
      title: 'Haldi & Mehendi',
      date: '2026-11-30',
      start: '13:00',
      end: '16:00',
      venue: 'rtdcAjmer',
      note: 'Turmeric, henna and a lot of laughter.',
      image: 'roundel-haldi.webp',
    },
    {
      id: 'engagement',
      show: true,
      title: 'Engagement Ceremony',
      date: '2026-12-01',
      start: '14:30',
      end: '16:00',
      venue: 'badiSadri',
      note: 'Rings are exchanged and a promise is made.',
      image: 'roundel-engagement.webp',
    },
    {
      id: 'baraat',
      show: true,
      title: 'Baraat, Toran & Varmala',
      date: '2026-12-01',
      start: '17:00',
      end: '19:00',
      venue: 'badiSadri',
      note: 'The groom arrives with music and dance, and garlands are exchanged.',
      image: 'roundel-baraat.webp',
    },
    {
      id: 'lagan',
      show: true,
      title: 'Wedding Ceremony',
      subtitle: 'Lagan Phere',
      date: '2026-12-02',
      start: '09:00',
      end: '12:00',
      venue: 'badiSadri',
      note: 'Seven vows around the sacred fire.',
      image: 'roundel-pheras.webp',
    },
    {
      id: 'reception',
      show: true,
      title: 'Wedding Reception',
      date: '2026-12-03',
      start: '18:00',
      end: '22:00',
      venue: 'rtdcAjmer',
      note: 'An evening of dinner, music and celebration.',
      image: 'roundel-dinner.webp',
    },
  ],

  // The event used for the big "Save the Date", the countdown and the place scene.
  headline: 'lagan',

  // Guest-list presets. Share a link with ?invite=<name> to show only those events, e.g.
  //   https://your-site.vercel.app/?invite=reception
  // headline is optional (falls back to `headline` above, or the first event shown).
  invites: {
    family: { events: ['ganesh', 'haldi', 'engagement', 'baraat', 'lagan', 'reception'] },
    wedding: { events: ['engagement', 'baraat', 'lagan', 'reception'] },
    reception: { events: ['reception'], headline: 'reception' },
  },

  // "Good to know" row after the schedule. icon: dress | wind | map
  // A note with `venues: true` lists the venues on this guest's invite.
  notes: [
    { icon: 'dress', title: 'Dress code', text: 'Festive Indian. Jewel tones for the evening.' }, // PLACEHOLDER
    { icon: 'wind', title: 'Winter nights', text: 'Rajasthan evenings are cool, bring a shawl.' },
    { icon: 'map', title: 'Venues', venues: true },
  ],

  music: {
    src: '/assets/audio/music.mp3',
    volume: 0.55,
  },

  rsvp: {
    // Google Apps Script web app (scripts/rsvp-apps-script.gs) → rows in the RSVP Google Sheet.
    // null = keep RSVPs only in the guest's browser (handy for testing).
    endpoint: 'https://script.google.com/macros/s/AKfycbwT0SRyM5UQXaihBD2qsQ1nVW-8LP64LjIm0wlSZyesqz3UM3ZFaNZ5Me5EDO-uiRd6zQ/exec',
  },
};
