"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function VisitorFormSkeleton() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 dark:bg-background">
			<div className="w-full max-w-4xl bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
				<div className="mb-6 space-y-2">
					<div className="flex items-center gap-3">
						<Skeleton className="h-12 w-12 rounded-full" />
						<div className="space-y-2 w-full max-w-md">
							<Skeleton className="h-4 w-1/2" />
							<Skeleton className="h-4 w-1/3" />
						</div>
					</div>
					<Skeleton className="h-4 w-2/3" />
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2 md:col-span-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2 md:col-span-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>

				<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
				</div>
			</div>
		</div>
	);
}
