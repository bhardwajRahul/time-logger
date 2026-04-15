import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import usePersistedStopWatch from '@/hooks/use-persisted-stopwatch';
import { formatSeconds } from '@/utils/date-time';
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
} from '@tabler/icons-react';
import StopwatchDisplay from './StopwatchDisplay';

export default function Stopwatch() {
  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    reset,
    previousTotalSeconds,
  } = usePersistedStopWatch();

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {/* Time Display */}
      <Card className="w-full px-4 py-6 bg-muted/30">
        <StopwatchDisplay
          days={days}
          hours={hours}
          minutes={minutes}
          seconds={seconds}
        />
        <div className="mt-2 text-center text-xs text-muted-foreground font-medium tracking-wide">
          {days > 0 && 'DAYS : '}
          HOURS : MINUTES : SECONDS
        </div>
      </Card>

      <div className='space-y-2'>
        {!!previousTotalSeconds && (
          <div className="font-mono text-center text-xs text-muted-foreground font-semibold">
            Previous Stopwatch: {formatSeconds(previousTotalSeconds)}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Closing this popup will pause the stopwatch.
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2 w-full">
        <Button
          onClick={isRunning ? pause : start}
          size="lg"
          variant={isRunning ? 'outline' : 'default'}
          className="flex-1"
        >
          {isRunning ? (
            <>
              <IconPlayerPause className="size-5" />
              Pause
            </>
          ) : (
            <>
              <IconPlayerPlay className="size-5" />
              Start
            </>
          )}
        </Button>
        <Button
          onClick={() => reset()}
          size="lg"
          variant="outline"
          className="flex-1"
          disabled={hours === 0 && minutes === 0 && seconds === 0 && days === 0}
        >
          <IconRefresh className="size-5" />
          Reset
        </Button>
      </div>
    </div>
  );
}
