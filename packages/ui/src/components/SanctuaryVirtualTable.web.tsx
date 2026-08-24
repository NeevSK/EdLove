import { flexRender, type Table } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export interface SanctuaryVirtualTableWebProps<TData> {
  table: Table<TData>;
  /** The height of the scrolling viewport container */
  height?: number | string;
  /** Estimated row height in pixels */
  estimateRowHeight?: number;
}

/**
 * SanctuaryVirtualTable.web - A high-performance, virtualized HTML/Tailwind table for Web dashboards.
 * Couples TanStack Table state with TanStack Virtual scroll windowing.
 */
export function SanctuaryVirtualTable<TData>({
  table,
  height = 400,
  estimateRowHeight = 45,
}: SanctuaryVirtualTableWebProps<TData>) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();

  // Initialize the virtualizer
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualItems.length > 0 ? (virtualItems[0]?.start ?? 0) : 0;
  const paddingBottom =
    virtualItems.length > 0 ? totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0) : 0;

  return (
    <div
      ref={tableContainerRef}
      className="w-full overflow-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950"
      style={{ height }}
    >
      <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
        <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className="px-6 py-4 font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer"
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ width: header.column.columnDef.size }}
                >
                  <div className="flex items-center gap-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: `${paddingTop}px` }} colSpan={table.getFlatHeaders().length} />
            </tr>
          )}
          {virtualItems.map((virtualRow: any) => {
            const row = rows[virtualRow.index];
            if (!row) return null;
            return (
              <tr
                key={row.id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-colors"
                style={{ height: `${virtualRow.size}px` }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="whitespace-nowrap px-6 py-3 font-medium text-slate-900 dark:text-slate-100"
                    style={{ width: cell.column.columnDef.size }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td
                style={{ height: `${paddingBottom}px` }}
                colSpan={table.getFlatHeaders().length}
              />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SanctuaryVirtualTable;
