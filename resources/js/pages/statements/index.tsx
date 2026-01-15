import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DataTable } from '@/components/data-table';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
import {
    finalizeStatement,
    generateStatement,
    getStatements,
    reviewStatement,
} from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import statements from '@/routes/statements';
import { type BreadcrumbItem } from '@/types';
import { type StatementSummary } from '@/types/financial-console';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Statements',
        href: statements.index().url,
    },
];

interface StatementsProps {
    statements?: Array<{
        id: number;
        period_start: string;
        period_end: string;
        status: string;
        total_amount: string;
        currency: string;
        account_id?: number | null;
    }>;
}

type StatementRecord = NonNullable<StatementsProps['statements']>[number];

const normalizeStatement = (statement: StatementRecord): StatementSummary => ({
    id: statement.id,
    period_start: statement.period_start,
    period_end: statement.period_end,
    account: statement.account_id
        ? `Account ${statement.account_id}`
        : 'Account',
    total_amount: statement.total_amount,
    currency: statement.currency,
    status: statement.status,
});

export default function StatementsIndex({
    statements: serverStatements = [],
}: StatementsProps) {
    const [statementsList, setStatementsList] = useState<StatementSummary[]>(
        USE_MOCKS ? [] : serverStatements.map(normalizeStatement),
    );
    const [isLoading, setIsLoading] = useState(USE_MOCKS);
    const [hasError, setHasError] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [period, setPeriod] = useState({
        start: '',
        end: '',
    });

    const fetchStatements = async () => {
        setHasError(false);
        if (!USE_MOCKS) {
            setIsLoading(true);
            router.reload({ only: ['statements'] });
            return;
        }

        setIsLoading(true);
        try {
            const response = await getStatements();
            setStatementsList(response);
        } catch {
            setHasError(true);
            toast.error('Unable to load statements');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (USE_MOCKS) {
            fetchStatements();
        }
    }, []);

    useEffect(() => {
        if (!USE_MOCKS) {
            setStatementsList(serverStatements.map(normalizeStatement));
            setIsLoading(false);
        }
    }, [serverStatements]);

    const handleGenerate = async () => {
        if (!period.start || !period.end) {
            toast.error('Select a start and end period.');
            return;
        }

        try {
            await generateStatement({
                period_start: period.start,
                period_end: period.end,
            });
            toast.success('Statement generation started.');
            setIsDialogOpen(false);
            setPeriod({ start: '', end: '' });
            if (USE_MOCKS) {
                fetchStatements();
            }
        } catch {
            toast.error('Statement generation failed.');
        }
    };

    const handleStatusChange = async (
        statementId: number,
        action: 'review' | 'finalize',
    ) => {
        try {
            if (action === 'review') {
                await reviewStatement(statementId);
                toast.success('Statement moved to reviewed.');
            } else {
                await finalizeStatement(statementId);
                toast.success('Statement finalized.');
            }

            if (USE_MOCKS) {
                setStatementsList((prev) =>
                    prev.map((statement) => {
                        if (statement.id !== statementId) return statement;
                        const status =
                            action === 'review' ? 'reviewed' : 'finalized';
                        return { ...statement, status };
                    }),
                );
            } else {
                await fetchStatements();
            }
        } catch {
            toast.error('Unable to update status.');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Statements" />
            <div className="flex flex-1 flex-col gap-6">
                <PageHeader
                    title="Statements"
                    description="Generate, review, and finalize billing statements."
                    actions={
                        <Dialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button>Generate statement</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Generate statement
                                    </DialogTitle>
                                    <DialogDescription>
                                        Choose the billing period for the new
                                        statement.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Period start
                                        </label>
                                        <Input
                                            type="date"
                                            value={period.start}
                                            onChange={(event) =>
                                                setPeriod((prev) => ({
                                                    ...prev,
                                                    start: event.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Period end
                                        </label>
                                        <Input
                                            type="date"
                                            value={period.end}
                                            onChange={(event) =>
                                                setPeriod((prev) => ({
                                                    ...prev,
                                                    end: event.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleGenerate}>
                                        Generate
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    }
                />

                {isLoading ? (
                    <Skeleton className="h-96" />
                ) : hasError ? (
                    <ErrorState onRetry={fetchStatements} />
                ) : statementsList.length === 0 ? (
                    <EmptyState
                        icon={<span className="text-lg">📄</span>}
                        title="No statements yet"
                        description="Generate a statement to start billing."
                        actionLabel="Generate statement"
                        onAction={() => setIsDialogOpen(true)}
                    />
                ) : (
                    <DataTable
                        title="Billing statements"
                        description="Track statement status and totals."
                        pagination={
                            <>
                                <span>{statementsList.length} statements</span>
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
                                    <TableHead>Period</TableHead>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {statementsList.map((statement) => (
                                    <TableRow key={statement.id}>
                                        <TableCell className="font-medium">
                                            {statement.period_start} –{' '}
                                            {statement.period_end}
                                        </TableCell>
                                        <TableCell>
                                            {statement.account}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge
                                                status={statement.status}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {statement.currency}{' '}
                                            {statement.total_amount}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex flex-col gap-2 md:flex-row md:justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <Link
                                                        href={
                                                            statements.show(
                                                                statement.id,
                                                            ).url
                                                        }
                                                    >
                                                        View
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    disabled={
                                                        statement.status !==
                                                        'draft'
                                                    }
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            statement.id,
                                                            'review',
                                                        )
                                                    }
                                                >
                                                    Mark reviewed
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    disabled={
                                                        statement.status !==
                                                        'reviewed'
                                                    }
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            statement.id,
                                                            'finalize',
                                                        )
                                                    }
                                                >
                                                    Finalize
                                                </Button>
                                            </div>
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
