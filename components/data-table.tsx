import { Panel } from "@/components/ui/panel";

export function DataTable({
  columns,
  rows,
  title
}: {
  columns: string[];
  rows: string[][];
  title?: string;
}) {
  return (
    <Panel>
      {title ? <h3 className="mb-4 text-lg font-semibold">{title}</h3> : null}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-3 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-[hsl(var(--border))]">
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`} className="px-3 py-3 text-slate-700 dark:text-slate-200">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

