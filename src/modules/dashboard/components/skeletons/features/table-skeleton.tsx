"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableSkeletonProps {
    columns: number;
    rows: number;
    showHeader?: boolean;
}

export default function TableSkeleton({ columns, rows, showHeader = true }: TableSkeletonProps) {
    return (
        <Table>
            {showHeader && (
                <TableHeader>
                    <TableRow>
                        {Array.from({ length: columns }).map((_, index) => (
                            <TableHead key={`header-${index}`}>
                                <Skeleton className="w-full h-4" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
            )}
            <TableBody>
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <TableRow key={`row-${rowIndex}`}>
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <TableCell key={`cell-${rowIndex}-${colIndex}`}>                                {colIndex === columns - 1 ? (
                                // Last column (usually actions) - show button-like skeleton
                                <div className="flex justify-end">
                                    <Skeleton className="rounded-md w-16 h-8" />
                                </div>) : colIndex === 0 ? (
                                    // First column (usually ID or number) - smaller width
                                    <Skeleton className="w-12 h-4" />
                                ) : (
                                // Other columns with fixed widths - using direct tailwind classes instead of dynamic ones
                                <Skeleton className={colIndex === 1 ? "h-4 w-20" :
                                    colIndex === 2 ? "h-4 w-24" :
                                        colIndex === 3 ? "h-4 w-16" :
                                            colIndex === 4 ? "h-4 w-28" :
                                                colIndex === 5 ? "h-4 w-20" : "h-4 w-24"} />
                            )}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
