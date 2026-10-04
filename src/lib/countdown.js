// Remaining time until an ISO timestamp, split for display.
export function timeLeft(targetISO, now = new Date()) {
  const ms = new Date(targetISO).getTime() - now.getTime();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, done: true };
  const totalMinutes = Math.floor(ms / 60000);
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
    done: false,
  };
}
