// "Add to calendar" helpers: an .ics file for Apple devices, a link for Google Calendar.
const stamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const escapeText = (s) => s.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');

const vevent = ({ title, start, end, location, details }) => [
  'BEGIN:VEVENT',
  `UID:${stamp(start)}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}@aditi-yashwant`,
  `DTSTAMP:${stamp(new Date().toISOString())}`,
  `DTSTART:${stamp(start)}`,
  `DTEND:${stamp(end)}`,
  `SUMMARY:${escapeText(title)}`,
  `LOCATION:${escapeText(location)}`,
  `DESCRIPTION:${escapeText(details)}`,
  'END:VEVENT',
];

// One event or a list of them in a single calendar file.
export function buildICS(events) {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aditi & Yashwant//Wedding Invite//EN',
    'CALSCALE:GREGORIAN',
    ...[].concat(events).flatMap(vevent),
    'END:VCALENDAR',
  ].join('\r\n');
}

export function googleCalendarUrl({ title, start, end, location, details }) {
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', title);
  url.searchParams.set('dates', `${stamp(start)}/${stamp(end)}`);
  url.searchParams.set('location', location);
  url.searchParams.set('details', details);
  return url.toString();
}

const prefersICS = () => /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);

// Apple devices get every event in one .ics; elsewhere Google Calendar opens the main event.
export function addToCalendar(events, main = [].concat(events)[0]) {
  if (!prefersICS()) {
    window.open(googleCalendarUrl(main), '_blank', 'noopener');
    return;
  }
  const blob = new Blob([buildICS(events)], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'aditi-yashwant-wedding.ics';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
