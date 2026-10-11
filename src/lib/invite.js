// Works out which events this guest sees (from config + ?invite=…) and formats them.
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const IST = '+05:30';

export function formatDay(date) {
  const [year, month, day] = date.split('-').map(Number);
  return {
    weekday: WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()],
    day,
    month: MONTHS[month - 1],
    year,
  };
}

const clock = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return { text: `${h % 12 || 12}:${String(m).padStart(2, '0')}`, meridiem: h < 12 ? 'AM' : 'PM' };
};

// "6:00 AM", "1:00 – 4:00 PM", "9:00 AM – 12:00 PM"
export function formatTimeRange(start, end) {
  const a = clock(start);
  if (!end) return `${a.text} ${a.meridiem}`;
  const b = clock(end);
  return a.meridiem === b.meridiem
    ? `${a.text} – ${b.text} ${b.meridiem}`
    : `${a.text} ${a.meridiem} – ${b.text} ${b.meridiem}`;
}

const plusOneHour = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${String(Math.min(h + 1, 23)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

function resolveEvent(event, venues) {
  const d = formatDay(event.date);
  return {
    ...event,
    venue: venues[event.venue] || { name: event.venue, city: event.venue, address: '', mapUrl: null },
    startISO: `${event.date}T${event.start}:00${IST}`,
    endISO: `${event.date}T${event.end || plusOneHour(event.start)}:00${IST}`,
    time: formatTimeRange(event.start, event.end),
    dayLabel: `${d.weekday}, ${d.day} ${d.month}`,
    dayParts: d,
  };
}

export function resolveInvite(config, search = '') {
  const requested = new URLSearchParams(search).get('invite');
  const preset = requested && config.invites?.[requested];
  const wanted = preset?.events;
  const all = [...config.events].sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));
  const picked = all.filter((e) => (wanted ? wanted.includes(e.id) : e.show !== false));
  const events = (picked.length ? picked : all.filter((e) => e.show !== false)).map((e) => resolveEvent(e, config.venues));

  const headlineId = preset?.headline || config.headline;
  const headline = events.find((e) => e.id === headlineId) || events[0];

  const days = [];
  for (const e of events) {
    const last = days[days.length - 1];
    if (last && last.date === e.date) last.events.push(e);
    else days.push({ date: e.date, label: e.dayLabel, events: [e] });
  }

  const venues = [...new Map(events.map((e) => [e.venue.name, e.venue])).values()];

  const first = events[0].dayParts;
  const lastDay = events[events.length - 1].dayParts;
  const span = days.length === 1
    ? `${first.weekday}, ${first.day} ${first.month} ${first.year}`
    : `${first.day}${first.month === lastDay.month ? '' : ` ${first.month}`} – ${lastDay.day} ${lastDay.month} ${lastDay.year}`;

  return { name: preset ? requested : 'default', events, headline, days, venues, span };
}
