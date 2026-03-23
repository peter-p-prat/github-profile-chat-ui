export function formatDate(dateString: string): string {
  // Append T12:00:00 to avoid UTC vs local timezone shifts when parsing date-only strings
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
