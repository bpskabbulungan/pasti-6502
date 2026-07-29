import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export const renderTableSkeletonRows = (rowCount: number, colCount: number, keyPrefix: string) =>
  Array.from({ length: rowCount }).map((_, rowIndex) => (
    <TableRow key={`${keyPrefix}-${rowIndex}`}>
      {Array.from({ length: colCount }).map((__, colIndex) => (
        <TableCell key={`${keyPrefix}-${rowIndex}-${colIndex}`}>
          <Skeleton className="h-4 w-full max-w-[160px]" />
        </TableCell>
      ))}
    </TableRow>
  ));
