/**
 * Time-based greeting helper for Sanctuary personas.
 * Evaluates current wall-clock hour in Asia/Colombo timezone.
 */
export function timeGreeting(name: string): string {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      hourCycle: 'h23',
      timeZone: 'Asia/Colombo',
    }).format(new Date()),
  );
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${greeting}, ${name}`;
}
