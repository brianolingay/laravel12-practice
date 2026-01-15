import { Head } from '@inertiajs/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    metrics: {
        ledgerEvents: number;
        pricingRules: number;
        statements: number;
    };
}

export default function Dashboard({ metrics }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ledger Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">
                                {metrics.ledgerEvents}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Total events ingested
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing Rules</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">
                                {metrics.pricingRules}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Active configuration rules
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Statements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">
                                {metrics.statements}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Generated billing statements
                            </p>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Financial Console</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Pricing and billing workflows are active. Use the
                            sidebar to explore ledger events, pricing rules,
                            statements, and audit logs.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
