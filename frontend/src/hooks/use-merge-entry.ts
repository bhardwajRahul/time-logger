import type { MergeData, TimeEntryResource } from '@/interfaces/entity/time-entry';
import { useCallback, useState } from 'react';

interface UseMergeEntryReturn {
  mergeData: MergeData | null;
  handleMergeNeeded: (existingEntry: TimeEntryResource, newEntry: TimeEntryResource) => void;
  clearMergeData: () => void;
}

export default function useMergeEntry(): UseMergeEntryReturn {
  const [mergeData, setMergeData] = useState<MergeData | null>(null);

  const handleMergeNeeded = useCallback(
    (existingEntry: TimeEntryResource, newEntry: TimeEntryResource) => {
      setMergeData({ existingEntry, newEntry });
    },
    [],
  );

  const clearMergeData = useCallback(() => setMergeData(null), []);

  return { mergeData, handleMergeNeeded, clearMergeData };
}
