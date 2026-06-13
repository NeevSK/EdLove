import React from 'react';
import { flexRender, type Table } from '@tanstack/react-table';

export interface SanctuaryTableWebProps<TData> {
  table: Table<TData>;
}

/**
 * SanctuaryTable.web - Clean, semantic HTML/Tailwind table component for Web dashboards.
 * Consumes a TanStack Table instance.
 */
export function SanctuaryTable<TData>({ table }: SanctuaryTableWebProps<TData>) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
      <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
        <thead className="bg-slate-50 dark:bg-slate-900 text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
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
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="whitespace-nowrap px-6 py-4 font-medium text-slate-900 dark:text-slate-100"
                  style={{ width: cell.column.columnDef.size }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SanctuaryTable;
