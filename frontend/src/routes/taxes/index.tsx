import { TaxDialog } from '@/components/custom/dialog/TaxDialog';
import FormErrors from '@/components/custom/forms/FormErrors';
import { TaxDataTable } from '@/components/custom/resources/tax/TaxDataTable';
import DataTableSkeleton from '@/components/custom/skeleton/DataTableSkeleton';
import { Button } from '@/components/ui/button';
import { DEFAULT_API_PAGE_SIZE, SWR_CACHE_KEYS } from '@/config';
import { getTaxes } from '@/lib/data-access/tax';
import { IconPlus } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { useQueryState } from 'nuqs';
import useSWR from 'swr';

export const Route = createFileRoute('/taxes/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [pageNumber, setPageNumber] = useQueryState('pageNumber', {
    defaultValue: '1',
  });
  const [pageSize, setPageSize] = useQueryState('pageSize', {
    defaultValue: DEFAULT_API_PAGE_SIZE.toString(),
  });

  const fetcher = () =>
    getTaxes({
      sort: 'sort',
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
    });

  const {
    data: taxes,
    error,
    isLoading,
  } = useSWR([SWR_CACHE_KEYS.TAXES, pageNumber, pageSize], fetcher);

  return (
    <div className="space-y-4">
      <div className="flex max-md:flex-col items-start justify-between w-full gap-2">
        <div className="space-y-1">
          <h1 className="title">Taxes</h1>
          <p className="text-muted-foreground">
            Manage your tax rates. Taxes are applied to time frames when
            generating invoices. Drag rows to set the application order.
          </p>
          <p className="text-muted-foreground">
            Order only matters when{' '}
            <a
              href="https://www.zoho.com/books/kb/taxes/compound-tax.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              compound taxes
            </a>{' '}
            are present, since they stack on top of the subtotal plus all prior
            exclusive taxes.
          </p>
        </div>
        <TaxDialog mode="create">
          <Button>
            <IconPlus />
            Create Tax
          </Button>
        </TaxDialog>
      </div>
      {error && <FormErrors title="Fetch Error" errors={error.message} />}
      {!error && isLoading && !taxes && <DataTableSkeleton />}
      {!error && taxes && (
        <TaxDataTable
          data={taxes}
          onPageChange={setPageNumber}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
