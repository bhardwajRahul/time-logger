import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconChevronDown,
  IconGripVertical,
  IconLayoutColumns,
} from '@tabler/icons-react';
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row as TanStackRow,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DEFAULT_API_PAGE_SIZE } from '@/config';
import type { ApiResource, Links, Meta } from '@/interfaces/global';
import { tryCatch } from '@/utils/error-handling';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Paginator from './Paginator';
import { Row } from './Row';

const DRAG_COLUMN_ID = '__drag__';

const dragHandleColumn: ColumnDef<ApiResource<unknown, unknown, unknown>> = {
  id: DRAG_COLUMN_ID,
  header: '',
  enableHiding: false,
};

function SortableRow<T>({ row }: { row: TanStackRow<T> }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={row.getIsSelected() && 'selected'}
    >
      <TableCell className="w-8">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1"
          aria-label="Drag to reorder"
        >
          <IconGripVertical size={16} />
        </button>
      </TableCell>
      {row
        .getVisibleCells()
        .filter((cell) => cell.column.id !== DRAG_COLUMN_ID)
        .map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
    </TableRow>
  );
}

interface GenericTableProps<
  Resource extends ApiResource<unknown, unknown, unknown>,
> {
  data?: { data: Resource[]; links: Links; meta: Meta };
  onPageChange: (page: string) => void;
  onPageSizeChange: (size: string) => void;
  columns: ColumnDef<Resource>[];
  TabsNode?: React.ReactNode;
  onReorder?: (reordered: Resource[]) => Promise<void>;
}

export function GenericTable<
  Resource extends ApiResource<unknown, unknown, unknown>,
>({
  data,
  columns,
  onPageChange,
  onPageSizeChange,
  TabsNode,
  onReorder,
}: GenericTableProps<Resource>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [items, setItems] = useState<Resource[]>(data?.data ?? []);

  useEffect(() => {
    setItems(data?.data ?? []);
  }, [data]);

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const effectiveColumns = onReorder
    ? [dragHandleColumn as ColumnDef<Resource>, ...columns]
    : columns;

  const pagination = {
    pageIndex: (data?.meta.current_page || 1) - 1,
    pageSize: data?.meta.per_page ?? DEFAULT_API_PAGE_SIZE,
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: items,
    columns: effectiveColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === 'function' ? updater(pagination) : updater;
      onPageChange((newState.pageIndex + 1).toString());
      onPageSizeChange(newState.pageSize.toString());
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    rowCount: data?.meta?.total,
  });

  async function handleDragEnd(event: DragEndEvent) {
    if (!onReorder) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const oldIndex = items.findIndex((item) => item.id === activeId);
    const newIndex = items.findIndex((item) => item.id === overId);
    const reordered = arrayMove(items, oldIndex, newIndex);
    const previousItems = items;

    setItems(reordered);

    const [, error] = await tryCatch(onReorder(reordered));
    if (error) {
      setItems(previousItems);
      toast.error('Failed to reorder. Please try again.');
    }
  }

  const rows = table.getRowModel().rows;

  return (
    <>
      <div className="flex items-center justify-between w-full min-h-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <IconLayoutColumns />
              <span className="hidden lg:inline py-2">Customize Columns</span>
              <span className="lg:hidden">Columns</span>
              <IconChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== 'undefined' &&
                  column.getCanHide(),
              )
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) =>
                    column.toggleVisibility(!!value)
                  }
                >
                  {(column.columnDef.header as string) || column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {TabsNode}
      </div>

      <div className="overflow-hidden rounded-lg border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {rows.length > 0 ? (
                onReorder ? (
                  <SortableContext
                    items={rows.map((r) => r.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {rows.map((row) => (
                      <SortableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  rows.map((row) => <Row key={row.id} row={row} />)
                )
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={effectiveColumns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
      <Paginator table={table} />
    </>
  );
}
