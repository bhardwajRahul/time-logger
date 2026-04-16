import { z } from 'zod';

export const TAX_SCHEMA = z
  .object({
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
    // User-facing value: 0–100 for percentage, flat amount for fixed
    rate: z.number().min(0, 'Rate must be non-negative'),
    type: z.enum(['percentage', 'fixed']),
    is_compound: z.boolean(),
    is_inclusive: z.boolean(),
    enabled_by_default: z.boolean(),
  })
  .refine((data) => data.type !== 'percentage' || data.rate <= 100, {
    message: 'Percentage rate cannot exceed 100%',
    path: ['rate'],
  });

export type TaxFormType = z.infer<typeof TAX_SCHEMA>;
