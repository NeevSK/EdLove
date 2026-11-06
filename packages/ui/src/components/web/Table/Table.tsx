import type { TableContract } from '../../../theme/contracts';
import { ScrollArea } from '../ScrollArea/ScrollArea';
import { cx } from '../cx';

export interface TableProps<R> extends TableContract<R> {
  className?: string;
}

/**
 * A grid of values with named columns: a real <table> with a caption and
 * column headers. Wide tables scroll inside a labelled region that keyboard
 * users can focus and scroll.
 */
export function Table<R>({ caption, columns, rows, rowKey, empty, className }: TableProps<R>) {
  return (
    <ScrollArea
      orientation="horizontal"
      variant="auto"
      label={caption}
      className={cx('gd-table-wrap', className)}
      showEdgeGradients={false}
    >
      <table className="gd-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" data-align={col.align}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && empty ? (
            <tr>
              <td colSpan={columns.length} className="gd-table-empty">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((col) => (
                  <td key={col.key} data-align={col.align}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </ScrollArea>
  );
}
