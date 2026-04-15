import { padWithZero } from '@/utils/date-time';

interface StopwatchDisplayProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function StopwatchDisplay({
  days,
  hours,
  minutes,
  seconds,
}: StopwatchDisplayProps) {
  return (
    <div className="flex items-center justify-center gap-1 font-mono text-5xl font-bold tabular-nums tracking-tight">
      {days > 0 && (
        <>
          <span className="text-primary">{padWithZero(days)}</span>
          <span className="text-muted-foreground">:</span>
        </>
      )}
      <span className="text-foreground">{padWithZero(hours)}</span>
      <span className="text-muted-foreground">:</span>
      <span className="text-foreground">{padWithZero(minutes)}</span>
      <span className="text-muted-foreground">:</span>
      <span className="text-foreground">{padWithZero(seconds)}</span>
    </div>
  );
}
