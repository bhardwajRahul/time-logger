import { z } from 'zod';

export const MERGE_TIME_ENTRY_SCHEMA = z.object({
  description: z.string().optional(),
});

export type MergeTimeEntryFormType = z.infer<typeof MERGE_TIME_ENTRY_SCHEMA>;
