import localforage from 'localforage';
import { useCallback, useEffect, useState } from 'react';
import { useStopwatch } from 'react-timer-hook';
const MS_STORE_NAME = 'tl-stopwatch-ms';
const MS_STORE_PREVIOUS_NAME = 'tl-stopwatch-previous-ms';

const usePersistedStopWatch = ({ interval = 500 } = {}) => {
  const {
    totalSeconds,
    milliseconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    reset,
  } = useStopwatch({
    autoStart: false,
    interval,
  });

  const [previousTotalSeconds, setPreviousSeconds] = useState<number | undefined>(undefined);

  // On mount, load the persisted time and previous reference from localforage
  useEffect(() => {
    Promise.all([
      localforage.getItem<number>(MS_STORE_NAME),
      localforage.getItem<number>(MS_STORE_PREVIOUS_NAME),
    ])
      .then(([storedMs, storedPreviousMs]) => {
        if (storedMs) {
          const stopwatchOffset = new Date();
          stopwatchOffset.setSeconds(
            stopwatchOffset.getSeconds() + storedMs / 1000,
          );
          reset(stopwatchOffset, false);
        }
        if (storedPreviousMs) {
          setPreviousSeconds(storedPreviousMs / 1000);
        }
      })
      .catch((err) => console.error('Failed to load stopwatch:', err));
  }, [reset]);

  // Persist the stopwatch time to localforage whenever totalSeconds changes
  useEffect(() => {
    if (!isRunning) return;
    localforage.setItem(MS_STORE_NAME, totalSeconds * 1000);
  }, [totalSeconds, isRunning]);

  // A hard reset that also clears the persisted time in localforage
  const hardReset = useCallback(
    (offset?: Date | undefined, newAutoStart: boolean | undefined = false) => {
      localforage.removeItem(MS_STORE_NAME);
      reset(offset, newAutoStart);
    },
    [reset],
  );

  // Resets and persists the current value as the "previous" reference before clearing
  const resetWithReference = useCallback(
    (offset?: Date | undefined, newAutoStart: boolean | undefined = false) => {
      localforage.setItem(MS_STORE_PREVIOUS_NAME, totalSeconds * 1000);
      localforage.removeItem(MS_STORE_NAME);
      setPreviousSeconds(totalSeconds);
      reset(offset, newAutoStart);
    },
    [reset, totalSeconds],
  );

  return {
    totalSeconds,
    milliseconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    reset: hardReset,
    resetWithReference,
    previousTotalSeconds,
  };
};

export default usePersistedStopWatch;
