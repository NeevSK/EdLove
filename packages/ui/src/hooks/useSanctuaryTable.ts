import type { RowData, SortingState } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type LegacyColumnDef,
  type LegacyTableOptions,
  useLegacyTable,
} from '@tanstack/react-table/legacy';
import { useState } from 'react';

export interface UseSanctuaryTableOptions<TData extends RowData>
  extends Omit<LegacyTableOptions<TData>, 'getCoreRowModel'> {
  data: TData[];
  columns: LegacyColumnDef<TData, any>[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
}

/**
 * useSanctuaryTable - A shared headless hook that configures TanStack Table
 * for sorting, filtering, selection, and pagination.
 */
export function useSanctuaryTable<TData extends RowData>({
  data,
  columns,
  enableSorting = true,
  enableFiltering = true,
  ...options
}: UseSanctuaryTableOptions<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});

  const table = useLegacyTable({
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
