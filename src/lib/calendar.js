// "Add to calendar" helpers: an .ics file for Apple devices, a link for Google Calendar.
const stamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const escapeText = (s) => s.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');

export function buildICS({ title, start, end, location, details }) {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aditi & Yashwant//Wedding Invite//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${stamp(start)}-aditi-yashwant@invite`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escapeText(title)}`,
    `LOCATION:${escapeText(location)}`,
    `DESCRIPTION:${escapeText(details)}`,
    'END:VEVENT',
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

export function addToCalendar(event) {
  if (!prefersICS()) {
    window.open(googleCalendarUrl(event), '_blank', 'noopener');
    return;
  }
  const blob = new Blob([buildICS(event)], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'aditi-yashwant-wedding.ics';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
