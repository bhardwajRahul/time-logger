import { ConfirmationDialog } from '@/components/custom/dialog/ConfirmationDialog';
import { DEFAULT_API_PAGE_SIZE, SWR_CACHE_KEYS } from '@/config';
import { deleteTax } from '@/lib/data-access/tax';
import { useQueryState } from 'nuqs';
import type { PropsWithChildren } from 'react';
import { useSWRConfig } from 'swr';

type DeleteTaxActionProps = PropsWithChildren & {
  taxId: string;
};

export default function DeleteTaxAction({
  taxId,
  children,
}: DeleteTaxActionProps) {
  const { mutate } = useSWRConfig();
  const [pageNumber] = useQueryState('pageNumber', { defaultValue: '1' });
  const [pageSize] = useQueryState('pageSize', {
    defaultValue: DEFAULT_API_PAGE_SIZE.toString(),
  });

  return (
    <ConfirmationDialog
      title="Delete Tax"
      description="Are you sure you want to delete this tax? It will be detached from all time frames."
      ctaText="Delete"
      ctaVariant="destructive"
      successToastMessage="Tax deleted successfully"
      onConfirm={async () => {
        await deleteTax({ id: taxId });
        mutate([SWR_CACHE_KEYS.TAXES, pageNumber, pageSize]);
      }}
    >
      {children}
    </ConfirmationDialog>
  );
}
