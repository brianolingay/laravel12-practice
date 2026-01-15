import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DataTable } from '@/components/data-table';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { JsonViewer } from '@/components/json-viewer';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { getAuditLogs } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import auditLog from '@/routes/audit-log';
import { type BreadcrumbItem } from '@/types';
import { type AuditLogEntry } from '@/types/financial-console';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Audit Log',
        href: auditLog.index().url,
    },
];

interface AuditLogProps {
    auditLogs?: Array<{
        id: number;
        action: string;
        created_at: string;
        metadata: Record<string, unknown>;
        user_id?: number | null;
    }>;
}

type AuditLogRecord = NonNullable<AuditLogProps['auditLogs']>[number];

const normalizeLog = (log: AuditLogRecord): AuditLogEntry => ({
    id: log.id,
    actor: log.user_id ? `User ${log.user_id}` : 'System',
    action: log.action,
    created_at: log.created_at,
    metadata: log.metadata,
});

export default function AuditLogIndex({ auditLogs = [] }: AuditLogProps) {
    const [logs, setLogs] = useState<AuditLogEntry[]>(
        USE_MOCKS ? [] : auditLogs.map(normalizeLog),
    );
    const [isLoading, setIsLoading] = useState(USE_MOCKS);
    const [hasError, setHasError] = useState(false);

    const fetchLogs = async () => {
        setHasError(false);
        if (!USE_MOCKS) {
            setIsLoading(true);
            router.reload({ only: ['auditLogs'] });
            return;
        }

        setIsLoading(true);
        try {
            const response = await getAuditLogs();
            setLogs(response);
        } catch (error) {
            setHasError(true);
            toast.error('Unable to load audit logs');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (USE_MOCKS) {
            fetchLogs();
        }
    }, []);

    useEffect(() => {
        if (!USE_MOCKS) {
            setLogs(auditLogs.map(normalizeLog));
            setIsLoading(false);
        }
    }, [auditLogs]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Log" />
            <div className="flex flex-1 flex-col gap-6">
                <PageHeader
                    title="Audit Log"
                    description="Review sensitive actions across the financial console."
                    actions={
                        <Button variant="outline" onClick={fetchLogs}>
                            Refresh
                        </Button>
                    }
                />

                {isLoading ? (
                    <Skeleton className="h-96" />
                ) : hasError ? (
                    <ErrorState onRetry={fetchLogs} />
                ) : logs.length === 0 ? (
                    <EmptyState
                        icon={<span className="text-lg">📜</span>}
                        title="No audit activity"
                        description="Audit events will appear here once actions are taken."
                        actionLabel="Refresh"
                        onAction={fetchLogs}
                    />
                ) : (
                    <DataTable
                        title="Audit entries"
                        description="Track who performed critical actions."
                        filters={
                            <>
                                <div className="flex flex-1 flex-col gap-2">
                                    <label className="text-sm font-medium">
                                        Actor
                                    </label>
                                    <Input placeholder="Search by user" />
                                </div>
                                <div className="flex flex-1 flex-col gap-2">
                                    <label className="text-sm font-medium">
                                        Action type
                                    </label>
                                    <Select defaultValue="all">
                                        <SelectTrigger>
                                            <SelectValue placeholder="All actions" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All actions
                                            </SelectItem>
                                            <SelectItem value="pricing">
                                                Pricing
                                            </SelectItem>
                                            <SelectItem value="statement">
                                                Statements
                                            </SelectItem>
                                            <SelectItem value="ledger">
                                                Ledger
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-1 flex-col gap-2">
                                    <label className="text-sm font-medium">
                                        Date range
                                    </label>
                                    <Input placeholder="Coming soon" disabled />
                                </div>
                            </>
                        }
                        pagination={
                            <>
                                <span>{logs.length} entries</span>
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
                                    <TableHead>Actor</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Metadata</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">
                                            {log.actor}
                                        </TableCell>
                                        <TableCell>{log.action}</TableCell>
                                        <TableCell>
                                            {new Date(
                                                log.created_at,
                                            ).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="min-w-[240px]">
                                            <JsonViewer
                                                data={log.metadata}
                                                maxHeightClassName="h-28"
                                            />
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
