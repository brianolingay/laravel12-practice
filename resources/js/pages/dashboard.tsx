import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import { toast } from 'sonner';

import { DataTable } from '@/components/data-table';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useInertiaResource } from '@/hooks/use-inertia-resource';
import AppLayout from '@/layouts/app-layout';
import { getDashboardSnapshot } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { type DashboardSnapshot } from '@/types/financial-console';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    metrics?: {
        ledgerEvents: number;
        pricingRules: number;
        statements: number;
    };
}

const mapMetrics = (metrics: DashboardProps['metrics']): DashboardSnapshot => ({
    metrics: {
        events_mtd: metrics?.ledgerEvents ?? 0,
        rated_amount_mtd: '$0.00',
        statements_draft: metrics?.statements ?? 0,
        active_accounts: 0,
    },
    recent_events: [],
    billing_status: [],
});

export default function Dashboard({ metrics }: DashboardProps) {
    const normalizedMetrics = useMemo(() => mapMetrics(metrics), [metrics]);

    const {
        data: snapshot,
        isLoading,
        hasError,
        refresh: fetchSnapshot,
    } = useInertiaResource<DashboardSnapshot | null>({
        initialData: normalizedMetrics,
        mockData: null,
        useMocks: USE_MOCKS,
        reloadOnly: ['metrics'],
        fetcher: getDashboardSnapshot,
        onError: () => toast.error('Unable to load dashboard data'),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6">
                <PageHeader
                    title="Financial Console"
                    description="Monitor month-to-date activity, billing readiness, and recent ledger events."
                    actions={
                        <Button variant="outline" onClick={fetchSnapshot}>
                            Refresh
                        </Button>
                    }
                />

                {isLoading ? (
                    <div className="grid gap-4 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="h-28" />
                        ))}
                        <Skeleton className="h-72 lg:col-span-2" />
                        <Skeleton className="h-72 lg:col-span-2" />
                    </div>
                ) : hasError ? (
                    <ErrorState onRetry={fetchSnapshot} />
                ) : !snapshot ? (
                    <EmptyState
                        icon={<span className="text-lg">📭</span>}
                        title="No dashboard data"
                        description="Start ingesting events to unlock dashboard metrics."
                        action={
                            <Button
                                onClick={() => toast.message('Ingest flow')}
                            >
                                Ingest events
                            </Button>
                        }
                    />
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Events (MTD)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-semibold">
                                        {snapshot.metrics.events_mtd}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Ledger activity month-to-date
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Rated Amount (MTD)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-semibold">
                                        {snapshot.metrics.rated_amount_mtd}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Rated transactions this month
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Statements (Draft)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-semibold">
                                        {snapshot.metrics.statements_draft}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Drafts awaiting review
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Active Accounts
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-semibold">
                                        {snapshot.metrics.active_accounts}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Accounts with billable activity
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <DataTable
                                title="Recent activity"
                                description="Last 10 ledger events ingested."
                            >
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Event</TableHead>
                                            <TableHead>Account</TableHead>
                                            <TableHead>Occurred</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {snapshot.recent_events.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={3}
                                                    className="py-6 text-center text-muted-foreground"
                                                >
                                                    No recent events.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            snapshot.recent_events.map(
                                                (event) => (
                                                    <TableRow key={event.id}>
                                                        <TableCell className="font-medium">
                                                            {event.event_type}
                                                        </TableCell>
                                                        <TableCell>
                                                            {event.account}
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(
                                                                event.occurred_at,
                                                            ).toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </DataTable>

                            <DataTable
                                title="Billing status"
                                description="Latest statements awaiting action."
                            >
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Account</TableHead>
                                            <TableHead>Period</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {snapshot.billing_status.length ===
                                        0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={3}
                                                    className="py-6 text-center text-muted-foreground"
                                                >
                                                    No statements yet.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            snapshot.billing_status.map(
                                                (statement) => (
                                                    <TableRow
                                                        key={statement.id}
                                                    >
                                                        <TableCell className="font-medium">
                                                            {statement.account}
                                                        </TableCell>
                                                        <TableCell>
                                                            {
                                                                statement.period_start
                                                            }{' '}
                                                            –{' '}
                                                            {
                                                                statement.period_end
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge
                                                                status={
                                                                    statement.status
                                                                }
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </DataTable>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
