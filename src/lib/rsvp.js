// RSVP validation + submission. Storage is wired later via config.rsvp.endpoint.
export const MESSAGE_LIMIT = 500;

export function validateRsvp({ name = '', message = '' }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Please tell us your name';
  if (message.length > MESSAGE_LIMIT) errors.message = `Please keep it under ${MESSAGE_LIMIT} characters`;
  return errors;
}

// data: { name, message, invite } — `invite` is the guest-list preset the link was opened with.
export async function submitRsvp(data, endpoint) {
  const entry = { ...data, name: data.name.trim(), message: data.message.trim(), at: new Date().toISOString() };
  if (endpoint) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(`RSVP failed (${res.status})`);
    return entry;
  }
  // No backend yet: keep a local copy so nothing typed is lost, and log it.
  try {
    const saved = JSON.parse(localStorage.getItem('rsvp-entries') || '[]');
    saved.push(entry);
    localStorage.setItem('rsvp-entries', JSON.stringify(saved));
  } catch {}
  console.info('[rsvp]', entry);
  await new Promise((r) => setTimeout(r, 700));
  return entry;
}
