import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { TaxResource } from '@/interfaces/entity/tax';
import { formatTaxRate } from '@/utils/tax';
import { IconReceipt } from '@tabler/icons-react';

interface TaxesAppliedBadgeProps {
  taxes: TaxResource[];
}

export default function TaxesAppliedBadge({ taxes }: TaxesAppliedBadgeProps) {
  if (taxes.length === 0) return null;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground cursor-default select-none">
            <IconReceipt className="size-3" />
            {taxes.length} {taxes.length === 1 ? 'Tax' : 'Taxes'} Applied
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs p-0 overflow-hidden">
          <div className="px-3 py-2 border-b border-muted-foreground/50 font-bold">
            Applied taxes
          </div>
          <div className="divide-y divide-muted-foreground/50">
            {taxes.map((tax) => (
              <div
                key={tax.id}
                className="flex items-center justify-between gap-6 px-3 py-1.5"
              >
                <span>{tax.attributes.name}</span>
                <span className="text-muted font-medium">
                  {formatTaxRate(tax.attributes.rate, tax.attributes.type)}
                  {tax.attributes.isInclusive && ' (incl.)'}
                  {tax.attributes.isCompound && ' (comp.)'}
                </span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
