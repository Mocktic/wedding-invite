// All invitation content lives here. Edit this file only to change text, timings or venue.
// Items marked PLACEHOLDER are waiting on real details.

export default {
  couple: {
    bride: 'Aditi',
    groom: 'Yashwant',
    hashtag: '#AditiWedsYashwant',
  },

  date: {
    // Start/end of the celebrations, Indian Standard Time.
    start: '2026-12-01T16:00:00+05:30', // PLACEHOLDER start time
    end: '2026-12-01T23:30:00+05:30', // PLACEHOLDER end time
    weekday: 'Tuesday',
    long: 'Tuesday, 1 December 2026',
    day: '01',
    month: 'XII',
    year: '2026',
  },

  city: 'Udaipur, Rajasthan',

  venue: {
    name: 'Lake Pichola', // PLACEHOLDER venue name
    address: 'Udaipur, Rajasthan 313001', // PLACEHOLDER address
    mapUrl: 'https://maps.google.com/?q=Lake+Pichola+Udaipur', // PLACEHOLDER map link
  },

  // The wedding-day schedule. Each item becomes a painted roundel on the thread.
  // image: file in public/assets/img · effect: 'petals' | 'flame' | null
  schedule: [
    {
      time: '4:00 PM', // PLACEHOLDER
      title: 'Baraat',
      note: 'The groom arrives with music, dance and a very happy procession.',
      image: 'roundel-baraat.webp',
      effect: null,
    },
    {
      time: '6:00 PM', // PLACEHOLDER
      title: 'Varmala',
      note: 'Garlands are exchanged as two families become one.',
      image: 'roundel-varmala.webp',
      effect: 'petals',
    },
    {
      time: '8:00 PM', // PLACEHOLDER
      title: 'Pheras',
      note: 'Seven vows around the sacred fire.',
      image: 'roundel-pheras.webp',
      effect: 'flame',
    },
    {
      time: '9:30 PM', // PLACEHOLDER
      title: 'Dinner & Celebrations',
      note: 'A feast under the stars by the lake.',
      image: 'roundel-dinner.webp',
      effect: null,
    },
  ],

  // "Good to know" row at the end of the day. icon: dress | wind | map
  notes: [
    { icon: 'dress', title: 'Dress code', text: 'Festive Indian. Jewel tones for the evening.' }, // PLACEHOLDER
    { icon: 'wind', title: 'December nights', text: 'Udaipur evenings are cool, bring a shawl.' },
    { icon: 'map', title: 'Getting there', text: 'Tap for directions', link: 'venue' },
  ],

  music: {
    src: '/assets/audio/music.mp3',
    volume: 0.55,
  },

  rsvp: {
    // Set to a URL later (Google Apps Script, Formspree, your API…) to store responses.
    endpoint: null,
  },
};
