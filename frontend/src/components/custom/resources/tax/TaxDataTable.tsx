import { TaxDialog } from '@/components/custom/dialog/TaxDialog';
import TableRowLink from '@/components/custom/table/TableRowLink';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DEFAULT_API_PAGE_SIZE, SWR_CACHE_KEYS } from '@/config';
import type { TaxResource } from '@/interfaces/entity/tax';
import { rearrangeTaxes } from '@/lib/data-access/tax';
import { formatTaxRate } from '@/utils/tax';
import {
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react';
import { type ColumnDef } from '@tanstack/react-table';
import { useQueryState } from 'nuqs';
import { useSWRConfig } from 'swr';
import { GenericTable } from '../../table/GenericTable';
import type { ComponentPropsWithoutRef } from 'react';
import DeleteTaxAction from './DeleteTaxAction';

const columns: ColumnDef<TaxResource>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <TableRowLink to={`/taxes/${row.original.id}`}>
        {row.original.attributes.name}
      </TableRowLink>
    ),
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: 'Type',
    enableHiding: true,
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.attributes.type === 'percentage' ? 'outline' : 'secondary'
        }
      >
        {row.original.attributes.type === 'percentage' ? 'Percentage' : 'Fixed'}
      </Badge>
    ),
  },
  {
    id: 'rate',
    accessorKey: 'rate',
    header: 'Rate',
    enableHiding: true,
    cell: ({ row }) =>
      formatTaxRate(row.original.attributes.rate, row.original.attributes.type),
  },
  {
    id: 'isCompound',
    accessorKey: 'isCompound',
    header: 'Compound',
    enableHiding: true,
    cell: ({ row }) =>
      row.original.attributes.isCompound ? (
        <Badge variant="outline" className="text-xs">Yes</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">No</span>
      ),
  },
  {
    id: 'isInclusive',
    accessorKey: 'isInclusive',
    header: 'Inclusive',
    enableHiding: true,
    cell: ({ row }) =>
      row.original.attributes.isInclusive ? (
        <Badge variant="outline" className="text-xs">Yes</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">No</span>
      ),
  },
  {
    id: 'isEnabledByDefault',
    accessorKey: 'isEnabledByDefault',
    header: 'Default',
    enableHiding: true,
    cell: ({ row }) =>
      row.original.attributes.isEnabledByDefault ? (
        <Badge className="text-xs">Default</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">No</span>
      ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <TableRowLink to={`/taxes/${row.original.id}`}>
          <IconEye size={16} />
        </TableRowLink>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <TaxDialog mode="edit" tax={row.original}>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <IconPencil size={14} />
                Edit
              </DropdownMenuItem>
            </TaxDialog>
            <DeleteTaxAction taxId={row.original.id}>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <IconTrash size={14} />
                Delete
              </DropdownMenuItem>
            </DeleteTaxAction>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

type TableProps = Omit<
  ComponentPropsWithoutRef<typeof GenericTable<TaxResource>>,
  'columns'
>;

export function TaxDataTable({ ...props }: TableProps) {
  const { mutate } = useSWRConfig();
  const [pageNumber] = useQueryState('pageNumber', { defaultValue: '1' });
  const [pageSize] = useQueryState('pageSize', {
    defaultValue: DEFAULT_API_PAGE_SIZE.toString(),
  });

  async function onReorder(reordered: TaxResource[]) {
    await rearrangeTaxes({
      taxes: reordered.map((tax, index) => ({
        id: tax.id,
        sort: (index + 1) * 100,
      })),
    });
    mutate([SWR_CACHE_KEYS.TAXES, pageNumber, pageSize]);
  }

  return <GenericTable columns={columns} onReorder={onReorder} {...props} />;
}
