import { type ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface DataTableProps {
    title: string;
    description?: string;
    filters?: ReactNode;
    pagination?: ReactNode;
    children: ReactNode;
    className?: string;
}

export function DataTable({
    title,
    description,
    filters,
    pagination,
    children,
    className,
}: DataTableProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {filters && (
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        {filters}
                    </div>
                )}
                {filters && <Separator />}
                <div className={cn(filters ? 'mt-2' : undefined)}>
                    {children}
                </div>
                {pagination && (
                    <>
                        <Separator />
                        <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                            {pagination}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
