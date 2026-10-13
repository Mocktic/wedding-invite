// RSVP validation + submission. With config.rsvp.endpoint set (a Google Apps Script web app,
// see scripts/rsvp-apps-script.gs) each RSVP becomes a row in your Google Sheet.
export const MESSAGE_LIMIT = 500;

export function validateRsvp({ name = '', message = '', events = [] }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Please tell us your name';
  if (!events.length) errors.events = 'Please choose at least one event';
  if (message.length > MESSAGE_LIMIT) errors.message = `Please keep it under ${MESSAGE_LIMIT} characters`;
  return errors;
}

// data: { name, message, events, invited, invite, website }
//   events:  titles of the events the guest will attend
//   invited: titles of every event on this guest's invite
//   invite:  the guest-list preset the link was opened with
//   website: hidden anti-bot field (left empty by people)
export async function submitRsvp(data, endpoint) {
  const entry = {
    ...data,
    name: data.name.trim(),
    message: data.message.trim(),
    events: data.events || [],
    at: new Date().toISOString(),
  };
  if (endpoint) {
    // text/plain keeps this a "simple" request: Apps Script can't answer CORS preflights
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(`RSVP failed (${res.status})`);
    const reply = await res.json().catch(() => ({ ok: false, error: 'unreadable reply' }));
    if (!reply.ok) throw new Error(`RSVP not saved: ${reply.error}`);
    return entry;
  }
  // No sheet connected yet: keep a local copy so nothing typed is lost, and log it.
  try {
    const saved = JSON.parse(localStorage.getItem('rsvp-entries') || '[]');
    saved.push(entry);
    localStorage.setItem('rsvp-entries', JSON.stringify(saved));
  } catch {}
  console.info('[rsvp]', entry);
  await new Promise((r) => setTimeout(r, 700));
  return entry;
}
