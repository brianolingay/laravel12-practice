import { Head, useRemember } from '@inertiajs/react';
import { useMemo } from 'react';
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
import { useInertiaResource } from '@/hooks/use-inertia-resource';
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
    const normalizedLogs = useMemo(
        () => auditLogs.map(normalizeLog),
        [auditLogs],
    );

    const {
        data: logs,
        isLoading,
        hasError,
        refresh: fetchLogs,
    } = useInertiaResource<AuditLogEntry[]>({
        initialData: normalizedLogs,
        mockData: [],
        useMocks: USE_MOCKS,
        reloadOnly: ['auditLogs'],
        fetcher: getAuditLogs,
        onError: () => toast.error('Unable to load audit logs'),
    });

    const [filters, setFilters] = useRemember(
        { actor: '', action: 'all' },
        'AuditLog/Filters',
    );

    const filteredLogs = useMemo(() => {
        const actorQuery = filters.actor.trim().toLowerCase();
        const actionFilter = filters.action.toLowerCase();

        return logs.filter((log) => {
            const matchesActor = actorQuery
                ? log.actor.toLowerCase().includes(actorQuery)
                : true;
            const matchesAction =
                actionFilter === 'all'
                    ? true
                    : log.action.toLowerCase().includes(actionFilter);

            return matchesActor && matchesAction;
        });
    }, [filters.action, filters.actor, logs]);

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
                ) : filteredLogs.length === 0 ? (
                    <EmptyState
                        icon={<span className="text-lg">📜</span>}
                        title={
                            logs.length === 0
                                ? 'No audit activity'
                                : 'No matching audit activity'
                        }
                        description={
                            logs.length === 0
                                ? 'Audit events will appear here once actions are taken.'
                                : 'Try adjusting your filters to see more results.'
                        }
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
                                    <Input
                                        value={filters.actor}
                                        onChange={(event) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                actor: event.target.value,
                                            }))
                                        }
                                        placeholder="Search by user"
                                    />
                                </div>
                                <div className="flex flex-1 flex-col gap-2">
                                    <label className="text-sm font-medium">
                                        Action type
                                    </label>
                                    <Select
                                        value={filters.action}
                                        onValueChange={(value) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                action: value,
                                            }))
                                        }
                                    >
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
                                <span>{filteredLogs.length} entries</span>
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
                                {filteredLogs.map((log) => (
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
