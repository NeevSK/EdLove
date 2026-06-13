import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';

export interface UseSanctuaryTableOptions<TData>
  extends Omit<TableOptions<TData>, 'getCoreRowModel'> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
}

/**
 * useSanctuaryTable - A shared headless hook that configures TanStack Table
 * for sorting, filtering, selection, and pagination.
 */
export function useSanctuaryTable<TData>({
  data,
  columns,
  enableSorting = true,
  enableFiltering = true,
  ...options
}: UseSanctuaryTableOptions<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
      ...options.state,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: getPaginationRowModel(),
    ...options,
  });

  return {
    table,
    globalFilter,
    setGlobalFilter,
    sorting,
    setSorting,
    rowSelection,
    setRowSelection,
  };
}
