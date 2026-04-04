"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TableSkeletonProps = {
  columns: number;
  rows: number;
  showHeader?: boolean;
};

const columnSkeletonClass = (columnIndex: number, lastColumnIndex: number) => {
  if (columnIndex === lastColumnIndex) {
    return "h-8 w-16 rounded-md";
  }

  if (columnIndex === 0) {
    return "h-4 w-12";
  }

  const widthMap = ["h-4 w-20", "h-4 w-24", "h-4 w-16", "h-4 w-28", "h-4 w-20"];
  return widthMap[(columnIndex - 1) % widthMap.length];
};

export default function TableSkeleton({ columns, rows, showHeader = true }: TableSkeletonProps) {
  const lastColumnIndex = columns - 1;

  return (
    <Table>
      {showHeader ? (
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, index) => (
              <TableHead key={`header-${index}`}>
                <Skeleton className="h-4 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      ) : null}
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={`row-${rowIndex}`}>
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <TableCell key={`cell-${rowIndex}-${columnIndex}`}>
                {columnIndex === lastColumnIndex ? (
                  <div className="flex justify-end">
                    <Skeleton className={columnSkeletonClass(columnIndex, lastColumnIndex)} />
                  </div>
                ) : (
                  <Skeleton className={columnSkeletonClass(columnIndex, lastColumnIndex)} />
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
