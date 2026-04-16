import { TaxDialog } from '@/components/custom/dialog/TaxDialog';
import FormErrors from '@/components/custom/forms/FormErrors';
import BackToLink from '@/components/custom/generic/BackToLink';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getTax } from '@/lib/data-access/tax';
import { formatTaxRate } from '@/utils/tax';
import { IconPencil } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/taxes/$taxId/')({
  component: RouteComponent,
  loader: async ({ params: { taxId } }) => {
    const tax = await getTax({ identifier: taxId });
    return { tax };
  },
  pendingComponent: () => <Skeleton className="h-96 w-full" />,
  errorComponent: ({ error }) => (
    <FormErrors errors={error?.message ?? ['An unexpected error occurred.']} />
  ),
});

function RouteComponent() {
  const { tax } = Route.useLoaderData();
  const { name, rate, type, isCompound, isInclusive, isEnabledByDefault } =
    tax.attributes;

  return (
    <>
      <BackToLink to="/taxes" text="Back to Taxes" />
      <div className="space-y-6 max-w-2xl">
        <div className="flex max-md:flex-col items-start justify-between w-full gap-2">
          <div className="space-y-1">
            <h1 className="title">{name}</h1>
            <p className="text-muted-foreground">
              Tax details and configuration.
            </p>
          </div>
          <TaxDialog mode="edit" tax={tax}>
            <Button variant="outline">
              <IconPencil size={16} />
              Edit Tax
            </Button>
          </TaxDialog>
        </div>

        <div className="rounded-lg border divide-y">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-muted-foreground">Name</span>
            <span className="text-sm">{name}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-muted-foreground">Type</span>
            <Badge variant="outline">
              {type === 'percentage' ? 'Percentage' : 'Fixed'}
            </Badge>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-muted-foreground">Rate</span>
            <span className="text-sm font-medium">
              {formatTaxRate(rate, type)}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Compound</span>
              <p className="text-xs text-muted-foreground">
                Applied on top of subtotal plus all prior taxes.
              </p>
            </div>
            <Badge variant={isCompound ? 'default' : 'outline'}>
              {isCompound ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Inclusive</span>
              <p className="text-xs text-muted-foreground">
                Already baked into the price; does not increase the total.
              </p>
            </div>
            <Badge variant={isInclusive ? 'default' : 'outline'}>
              {isInclusive ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Enabled by default
              </span>
              <p className="text-xs text-muted-foreground">
                Auto-attached to every new Time Frame.
              </p>
            </div>
            <Badge variant={isEnabledByDefault ? 'default' : 'outline'}>
              {isEnabledByDefault ? 'Default' : 'No'}
            </Badge>
          </div>
        </div>
      </div>
    </>
  );
}
