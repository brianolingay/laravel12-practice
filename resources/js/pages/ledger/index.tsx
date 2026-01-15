import { Head } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import ledger from '@/routes/ledger';
import { type BreadcrumbItem } from '@/types';

interface LedgerEventItem {
    id: number;
    event_type: string;
    external_reference_id: string;
    occurred_at: string;
    metadata: Record<string, unknown>;
}

interface LedgerPageProps {
    ledgerEvents: LedgerEventItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Ledger Explorer',
        href: ledger.index().url,
    },
];

export default function LedgerIndex({ ledgerEvents }: LedgerPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ledger Explorer" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <Input placeholder="Search by reference or event type" />
                            <Input placeholder="Date range (coming soon)" />
                            <Button variant="secondary">Apply</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-2 font-medium">
                                            Event Type
                                        </th>
                                        <th className="py-2 font-medium">
                                            Reference
                                        </th>
                                        <th className="py-2 font-medium">
                                            Occurred
                                        </th>
                                        <th className="py-2 font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {ledgerEvents.map((event) => (
                                        <tr key={event.id}>
                                            <td className="py-3 font-medium">
                                                {event.event_type}
                                            </td>
                                            <td className="py-3">
                                                {event.external_reference_id}
                                            </td>
                                            <td className="py-3">
                                                {new Date(
                                                    event.occurred_at,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="py-3">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            View details
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>
                                                                Ledger Event
                                                                Details
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                Event metadata
                                                                and references.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-3 text-sm">
                                                            <div>
                                                                <p className="text-muted-foreground">
                                                                    Event type
                                                                </p>
                                                                <p className="font-medium">
                                                                    {
                                                                        event.event_type
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground">
                                                                    External
                                                                    reference
                                                                </p>
                                                                <p className="font-medium">
                                                                    {
                                                                        event.external_reference_id
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground">
                                                                    Occurred at
                                                                </p>
                                                                <p className="font-medium">
                                                                    {new Date(
                                                                        event.occurred_at,
                                                                    ).toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground">
                                                                    Metadata
                                                                </p>
                                                                <pre className="mt-2 rounded-md bg-muted p-3 text-xs">
                                                                    {JSON.stringify(
                                                                        event.metadata,
                                                                        null,
                                                                        2,
                                                                    )}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </td>
                                        </tr>
                                    ))}
                                    {ledgerEvents.length === 0 && (
                                        <tr>
                                            <td
                                                className="py-8 text-center text-muted-foreground"
                                                colSpan={4}
                                            >
                                                No ledger events yet.
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
