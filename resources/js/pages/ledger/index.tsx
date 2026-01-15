import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { DataTable } from '@/components/data-table';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { JsonViewer } from '@/components/json-viewer';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
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
import { getLedgerEvents } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import ledger from '@/routes/ledger';
import { type BreadcrumbItem } from '@/types';
import { type LedgerEvent } from '@/types/financial-console';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Ledger',
        href: ledger.index().url,
    },
];

const eventTypeOptions = [
    'OrderPlaced',
    'KitAssigned',
    'ShipmentCreated',
    'LabelPurchased',
    'SpecimenReceived',
    'ResultFinalized',
    'ResultDelivered',
    'PortalUserAdded',
    'ModuleEnabled',
    'TelehealthReferralCreated',
];

interface LedgerIndexProps {
    ledgerEvents?: Array<{
        id: number;
        occurred_at: string;
        event_type: string;
        external_reference_id: string;
        metadata?: Record<string, unknown>;
        tenant_id?: number | null;
        account_id?: number | null;
        program_id?: number | null;
        status?: string | null;
    }>;
}

type LedgerEventRecord = NonNullable<LedgerIndexProps['ledgerEvents']>[number];

const normalizeEvent = (event: LedgerEventRecord): LedgerEvent => ({
    id: event.id,
    occurred_at: event.occurred_at,
    event_type: event.event_type,
    tenant: event.tenant_id ? `Tenant ${event.tenant_id}` : 'Tenant',
    account: event.account_id ? `Account ${event.account_id}` : 'Account',
    program: event.program_id ? `Program ${event.program_id}` : null,
    external_reference_id: event.external_reference_id,
    status: event.status ?? null,
    metadata: event.metadata ?? {},
});

export default function LedgerIndex({ ledgerEvents = [] }: LedgerIndexProps) {
    const [events, setEvents] = useState<LedgerEvent[]>(
        USE_MOCKS ? [] : ledgerEvents.map(normalizeEvent),
    );
    const [selectedEvent, setSelectedEvent] = useState<LedgerEvent | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(USE_MOCKS);
    const [hasError, setHasError] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [eventType, setEventType] = useState('all');

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const matchesSearch = event.external_reference_id
                .toLowerCase()
                .includes(searchValue.toLowerCase());
            const matchesType =
                eventType === 'all' || event.event_type === eventType;

            return matchesSearch && matchesType;
        });
    }, [events, searchValue, eventType]);

    const fetchEvents = async () => {
        setHasError(false);
        if (!USE_MOCKS) {
            setIsLoading(true);
            router.reload({ only: ['ledgerEvents'] });
            return;
        }

        setIsLoading(true);
        try {
            const response = await getLedgerEvents();
            setEvents(response);
        } catch {
            setHasError(true);
            toast.error('Unable to load ledger events');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (USE_MOCKS) {
            fetchEvents();
        }
    }, []);

    useEffect(() => {
        if (!USE_MOCKS) {
            setEvents(ledgerEvents.map(normalizeEvent));
            setIsLoading(false);
        }
    }, [ledgerEvents]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ledger Explorer" />
            <div className="flex flex-1 flex-col gap-6">
                <PageHeader
                    title="Ledger Explorer"
                    description="Track immutable events, references, and ledger metadata."
                    actions={
                        <Button variant="outline" onClick={fetchEvents}>
                            Refresh
                        </Button>
                    }
                />

                {isLoading ? (
                    <div className="grid gap-4">
                        <Skeleton className="h-24" />
                        <Skeleton className="h-80" />
                    </div>
                ) : hasError ? (
                    <ErrorState onRetry={fetchEvents} />
                ) : filteredEvents.length === 0 ? (
                    <EmptyState
                        icon={<span className="text-lg">⏱️</span>}
                        title="No ledger events yet"
                        description="Ingest your first event to see activity in the ledger."
                        action={
                            <Button
                                onClick={() => toast.message('Ingest flow')}
                            >
                                Ingest test event
                            </Button>
                        }
                    />
                ) : (
                    <DataTable
                        title="Ledger Events"
                        description="Search, filter, and inspect ledger events."
                        filters={
                            <>
                                <div className="flex flex-1 flex-col gap-2">
                                    <label className="text-sm font-medium">
                                        External reference
                                    </label>
                                    <Input
                                        value={searchValue}
                                        onChange={(event) =>
                                            setSearchValue(event.target.value)
                                        }
                                        placeholder="Search by reference id"
                                    />
                                </div>
                                <div className="flex flex-1 flex-col gap-2">
                                    <label className="text-sm font-medium">
                                        Event type
                                    </label>
                                    <Select
                                        value={eventType}
                                        onValueChange={setEventType}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All event types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All event types
                                            </SelectItem>
                                            {eventTypeOptions.map((type) => (
                                                <SelectItem
                                                    key={type}
                                                    value={type}
                                                >
                                                    {type}
                                                </SelectItem>
                                            ))}
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
                                <span>
                                    Showing {filteredEvents.length} events
                                </span>
                                <div className="flex items-center gap-2">
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
                                    <TableHead>Occurred at</TableHead>
                                    <TableHead>Event type</TableHead>
                                    <TableHead>
                                        Tenant / Account / Program
                                    </TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEvents.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell>
                                            {new Date(
                                                event.occurred_at,
                                            ).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {event.event_type}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{event.tenant}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {event.account}
                                                    {event.program
                                                        ? ` • ${event.program}`
                                                        : ''}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {event.external_reference_id}
                                        </TableCell>
                                        <TableCell>
                                            {event.status ? (
                                                <StatusBadge
                                                    status={event.status}
                                                />
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedEvent(event)
                                                }
                                            >
                                                View details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </DataTable>
                )}

                <Sheet
                    open={Boolean(selectedEvent)}
                    onOpenChange={(open) =>
                        setSelectedEvent(open ? selectedEvent : null)
                    }
                >
                    <SheetContent side="right" className="w-full sm:max-w-xl">
                        {selectedEvent ? (
                            <div className="flex h-full flex-col gap-6">
                                <SheetHeader>
                                    <SheetTitle>
                                        Ledger event details
                                    </SheetTitle>
                                    <SheetDescription>
                                        Review event metadata and references.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">
                                            Event type
                                        </p>
                                        <p className="font-medium">
                                            {selectedEvent.event_type}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">
                                            Occurred at
                                        </p>
                                        <p className="font-medium">
                                            {new Date(
                                                selectedEvent.occurred_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">
                                            References
                                        </p>
                                        <p className="font-medium">
                                            {
                                                selectedEvent.external_reference_id
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">
                                            Scope
                                        </p>
                                        <p className="font-medium">
                                            {selectedEvent.tenant} •{' '}
                                            {selectedEvent.account}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">
                                        Metadata
                                    </p>
                                    <JsonViewer
                                        data={selectedEvent.metadata}
                                        maxHeightClassName="h-[260px]"
                                    />
                                </div>
                            </div>
                        ) : null}
                    </SheetContent>
                </Sheet>
            </div>
        </AppLayout>
    );
}
