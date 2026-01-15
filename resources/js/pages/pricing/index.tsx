import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DataTable } from '@/components/data-table';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { getPricingModules } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import pricing from '@/routes/pricing';
import { type BreadcrumbItem } from '@/types';
import { type PricingModule } from '@/types/financial-console';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pricing',
        href: pricing.index().url,
    },
];

interface PricingIndexProps {
    pricingModules?: Array<{
        id: number;
        code: string;
        name: string;
        description?: string | null;
        rules_count?: number;
    }>;
}

type PricingModuleRecord = NonNullable<
    PricingIndexProps['pricingModules']
>[number];

const normalizeModule = (module: PricingModuleRecord): PricingModule & {
    rules_count?: number;
} => ({
    id: module.id,
    code: module.code,
    name: module.name,
    description: module.description ?? 'Module pricing configuration.',
    rules_count: module.rules_count ?? 0,
});

export default function PricingIndex({
    pricingModules = [],
}: PricingIndexProps) {
    const [modules, setModules] = useState<
        Array<PricingModule & { rules_count?: number }>
    >(USE_MOCKS ? [] : pricingModules.map(normalizeModule));
    const [isLoading, setIsLoading] = useState(USE_MOCKS);
    const [hasError, setHasError] = useState(false);

    const fetchModules = async () => {
        setHasError(false);
        if (!USE_MOCKS) {
            setIsLoading(true);
            router.reload({ only: ['pricingModules'] });
            return;
        }

        setIsLoading(true);
        try {
            const response = await getPricingModules();
            setModules(
                response.map((module) => ({
                    ...module,
                    rules_count: 0,
                })),
            );
        } catch {
            setHasError(true);
            toast.error('Unable to load pricing modules');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (USE_MOCKS) {
            fetchModules();
        }
    }, []);

    useEffect(() => {
        if (!USE_MOCKS) {
            setModules(pricingModules.map(normalizeModule));
            setIsLoading(false);
        }
    }, [pricingModules]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pricing" />
            <div className="flex flex-1 flex-col gap-6">
                <PageHeader
                    title="Pricing"
                    description="Review modules and drill into their pricing rules."
                />

                {isLoading ? (
                    <Skeleton className="h-96" />
                ) : hasError ? (
                    <ErrorState onRetry={fetchModules} />
                ) : modules.length === 0 ? (
                    <EmptyState
                        icon={<span className="text-lg">💳</span>}
                        title="No pricing modules"
                        description="Add pricing modules to configure rules."
                        actionLabel="Contact support"
                        onAction={() => toast.message('Contacting support')}
                    />
                ) : (
                    <DataTable
                        title="Pricing modules"
                        description="View module status and navigate to rule details."
                        pagination={
                            <>
                                <span>{modules.length} modules</span>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled
                                    >
                                        Next
                                    </Button>
                                </div>
                            </>
                        }
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Module</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Rules</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {modules.map((module) => (
                                    <TableRow key={module.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{module.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {module.code}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {module.description}
                                        </TableCell>
                                        <TableCell>
                                            {module.rules_count ?? 0}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                asChild
                                            >
                                                <Link
                                                    href={
                                                        pricing.show(module.id)
                                                            .url
                                                    }
                                                >
                                                    View
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </DataTable>
                )}
            </div>
        </AppLayout>
    );
}
