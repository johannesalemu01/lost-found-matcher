// All dates are stored in UTC and shown in the viewer's local time zone.

const dateTime = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const timeOnly = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

/** "Mon 9 Nov, 12:00 – 17:00" for a window on one day, or "found Mon 9 Nov, 19:00". */
export function formatEventTime(r: { type: string; eventStart: string; eventEnd: string }): string {
  const start = new Date(r.eventStart);
  const end = new Date(r.eventEnd);
  if (r.type === "FOUND" || start.getTime() === end.getTime()) return formatDateTime(r.eventStart);
  if (start.toDateString() === end.toDateString()) return `${dateTime.format(start)} – ${timeOnly.format(end)}`;
  return `${dateTime.format(start)} – ${dateTime.format(end)}`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/** Value for <input type="datetime-local"> in the viewer's local time. */
export function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** A datetime-local string is interpreted in local time; send UTC to the API. */
export function localInputToIso(value: string): string {
  return new Date(value).toISOString();
}
