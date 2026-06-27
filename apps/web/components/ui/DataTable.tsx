"use client";

import { useState, useMemo } from "react";

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "right";
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  defaultSort?: string;
  defaultSortDir?: "asc" | "desc";
}

export default function DataTable<T extends Record<string, any>>({ columns, data, defaultSort, defaultSortDir = "desc" }: Props<T>) {
  const [sortKey, setSortKey] = useState(defaultSort || columns[0]?.key);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSortDir);

  const sorted = useMemo(() => {
    const sorted = [...data];
    sorted.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      return av < bv ? (sortDir === "asc" ? -1 : 1) : av > bv ? (sortDir === "asc" ? 1 : -1) : 0;
    });
    return sorted;
  }, [data, sortKey, sortDir]);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-[#333]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3 px-3 text-[11px] font-medium text-zinc-400 uppercase tracking-wider ${col.sortable ? "cursor-pointer hover:text-zinc-200" : ""} ${col.align === "right" ? "text-right" : ""}`}
                onClick={() => col.sortable && toggleSort(col.key)}
              >
                {col.label}
                {col.sortable && sortKey === col.key && (sortDir === "asc" ? " ▲" : " ▼")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={i} className="border-b border-[#222] hover:bg-[#2a2a2a]">
              {columns.map((col) => (
                <td key={col.key} className={`py-2.5 px-3 ${col.align === "right" ? "text-right" : ""}`}>
                  {col.render ? col.render(row) : row[col.key] != null ? String(row[col.key]) : "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
