import { Head } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import auditLog from '@/routes/audit-log';
import { type BreadcrumbItem } from '@/types';

interface AuditLogItem {
    id: number;
    action: string;
    created_at: string;
    metadata: Record<string, unknown>;
}

interface AuditLogPageProps {
    auditLogs: AuditLogItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Audit Log',
        href: auditLog.index().url,
    },
];

export default function AuditLogIndex({ auditLogs }: AuditLogPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Log" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Audit Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <Input placeholder="Filter by action" />
                            <Input placeholder="Date range (coming soon)" />
                            <Button variant="secondary">Apply</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Audit Entries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-2 font-medium">
                                            Action
                                        </th>
                                        <th className="py-2 font-medium">
                                            Timestamp
                                        </th>
                                        <th className="py-2 font-medium">
                                            Metadata
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {auditLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="py-3 font-medium">
                                                {log.action}
                                            </td>
                                            <td className="py-3">
                                                {new Date(
                                                    log.created_at,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="py-3">
                                                <pre className="rounded-md bg-muted p-2 text-xs">
                                                    {JSON.stringify(
                                                        log.metadata,
                                                        null,
                                                        2,
                                                    )}
                                                </pre>
                                            </td>
                                        </tr>
                                    ))}
                                    {auditLogs.length === 0 && (
                                        <tr>
                                            <td
                                                className="py-8 text-center text-muted-foreground"
                                                colSpan={3}
                                            >
                                                No audit entries yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
