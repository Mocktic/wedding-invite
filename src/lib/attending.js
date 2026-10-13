// Which events this guest has tapped "attending" on. Shared by the cards and the RSVP form,
// and remembered on the device so a reload doesn't lose it.
const KEY = 'attending-events';

export function createAttending(eventIds, storage = safeStorage()) {
  const order = new Map(eventIds.map((id, i) => [id, i]));
  let chosen = new Set();
  try {
    const saved = JSON.parse(storage?.getItem(KEY) || '[]');
    chosen = new Set(saved.filter((id) => order.has(id)));
  } catch {}
  const listeners = new Set();
  const list = () => [...chosen].sort((a, b) => order.get(a) - order.get(b));

  function toggle(id) {
    if (!order.has(id)) return;
    if (chosen.has(id)) chosen.delete(id);
    else chosen.add(id);
    try { storage?.setItem(KEY, JSON.stringify(list())); } catch {}
    listeners.forEach((fn) => fn(list()));
  }

  return {
    has: (id) => chosen.has(id),
    list,
    toggle,
    onChange: (fn) => listeners.add(fn),
  };
}

function safeStorage() {
  try { return window.localStorage; } catch { return null; }
}
