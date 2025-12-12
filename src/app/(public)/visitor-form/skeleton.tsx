"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function SkeletonForm() {
    return (
        <div className="flex justify-center items-center bg-background p-4 min-h-screen">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">                    <CardTitle className="text-primary">
                    <div className="bg-secondary mx-auto rounded w-3/4 h-8 animate-pulse"></div>
                </CardTitle>
                    <CardDescription>
                        <div className="bg-secondary mt-2 rounded w-full h-6 animate-pulse"></div>
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6 py-4">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />                    <div className="space-y-8 w-full">
                        <div className="bg-secondary rounded w-full h-12 animate-pulse"></div>
                        <div className="bg-secondary rounded w-full h-12 animate-pulse"></div>
                        <div className="bg-secondary rounded w-full h-12 animate-pulse"></div>
                        <div className="bg-secondary rounded w-full h-12 animate-pulse"></div>
                    </div>
                    <p className="mt-4 text-muted-foreground text-center">
                        Memuat data, mohon tunggu sebentar...
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
