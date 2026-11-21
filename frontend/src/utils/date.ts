export function dateInputToIso(dateStr: string): string | null {
  if (!dateStr) return null;
  return new Date(`${dateStr}T12:00:00.000Z`).toISOString();
}

export function formatTimeShort(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatDurationCompact(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}min`;
  return `${hours}h${minutes > 0 ? ` ${minutes}min` : ""}`;
}

export function getLocalDayStart(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
