import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DataTable } from '@/components/data-table';
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
import AppLayout from '@/layouts/app-layout';
import { getStatementDetail } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import statements from '@/routes/statements';
import { type BreadcrumbItem } from '@/types';
import { type StatementDetail } from '@/types/financial-console';

interface StatementShowProps {
    statement?: {
        id: number;
        period_start: string;
        period_end: string;
        status: string;
        total_amount: string;
        currency: string;
        account_id?: number | null;
    };
    lineItems?: Array<{
        id: number;
        description: string;
        quantity: number;
        unit_amount: string;
        total_amount: string;
        currency: string;
    }>;
}

type StatementRecord = NonNullable<StatementShowProps['statement']>;

type LineItemRecord = NonNullable<StatementShowProps['lineItems']>[number];

const normalizeStatement = (
    statement: StatementRecord,
    lineItems: LineItemRecord[] = [],
): StatementDetail => ({
    id: statement.id,
    account: statement.account_id
        ? `Account ${statement.account_id}`
        : 'Account',
    period_start: statement.period_start,
    period_end: statement.period_end,
    status: statement.status,
    total_amount: statement.total_amount,
    currency: statement.currency,
    line_items: lineItems.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit_amount: item.unit_amount,
        total_amount: item.total_amount,
        currency: item.currency,
    })),
});

export default function StatementShow({
    statement: serverStatement,
    lineItems = [],
}: StatementShowProps) {
    const [statement, setStatement] = useState<StatementDetail | null>(
        USE_MOCKS || !serverStatement
            ? null
            : normalizeStatement(serverStatement, lineItems),
    );
    const [isLoading, setIsLoading] = useState(USE_MOCKS);
    const [hasError, setHasError] = useState(false);

    const fetchStatement = async () => {
        setHasError(false);
        if (!USE_MOCKS) {
            setIsLoading(true);
            router.reload({ only: ['statement', 'lineItems'] });
            return;
        }

        setIsLoading(true);
        try {
            const response = await getStatementDetail(serverStatement?.id ?? 0);
            setStatement(response);
        } catch (error) {
            setHasError(true);
            toast.error('Unable to load statement details');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (USE_MOCKS) {
            fetchStatement();
        }
    }, []);

    useEffect(() => {
        if (!USE_MOCKS && serverStatement) {
            setStatement(normalizeStatement(serverStatement, lineItems));
            setIsLoading(false);
        }
    }, [serverStatement, lineItems]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Statements',
            href: statements.index().url,
        },
        {
            title: statement
                ? `Statement ${statement.id}`
                : 'Statement details',
            href: statement
                ? statements.show(statement.id).url
                : statements.index().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Statement detail" />
            <div className="flex flex-1 flex-col gap-6">
                <PageHeader
                    title={
                        statement
                            ? `Statement ${statement.id}`
                            : 'Statement details'
                    }
                    description={
                        statement
                            ? `${statement.account} • ${statement.period_start} – ${statement.period_end}`
                            : 'Detailed billing statement breakdown.'
                    }
                    actions={
                        <Button variant="outline" asChild>
                            <a href={statements.index().url}>
                                Back to statements
                            </a>
                        </Button>
                    }
                />

                {isLoading ? (
                    <Skeleton className="h-80" />
                ) : hasError ? (
                    <ErrorState onRetry={fetchStatement} />
                ) : statement ? (
                    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                        <DataTable title="Line items">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {statement.line_items.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="py-6 text-center text-muted-foreground"
                                            >
                                                No line items.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        statement.line_items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    {item.description}
                                                </TableCell>
                                                <TableCell>
                                                    {item.quantity}
                                                </TableCell>
                                                <TableCell>
                                                    {item.currency}{' '}
                                                    {item.unit_amount}
                                                </TableCell>
                                                <TableCell>
                                                    {item.currency}{' '}
                                                    {item.total_amount}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </DataTable>
                        <Card>
                            <CardHeader>
                                <CardTitle>Totals</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Status
                                        </span>
                                        <StatusBadge
                                            status={statement.status}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Account
                                        </span>
                                        <span className="font-medium">
                                            {statement.account}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Period
                                        </span>
                                        <span className="font-medium">
                                            {statement.period_start} –{' '}
                                            {statement.period_end}
                                        </span>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-muted p-4">
                                    <div className="text-sm text-muted-foreground">
                                        Total due
                                    </div>
                                    <div className="text-2xl font-semibold">
                                        {statement.currency}{' '}
                                        {statement.total_amount}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : null}
            </div>
        </AppLayout>
    );
}
