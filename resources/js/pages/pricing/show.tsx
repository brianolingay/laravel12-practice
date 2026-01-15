import { Head, useRemember } from '@inertiajs/react';
import { Fragment, useMemo, useState } from 'react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useInertiaResource } from '@/hooks/use-inertia-resource';
import AppLayout from '@/layouts/app-layout';
import { getPricingModules, getPricingRules } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import pricing from '@/routes/pricing';
import { type BreadcrumbItem } from '@/types';
import { type PricingModule, type PricingRule } from '@/types/financial-console';

const eventTypes = [
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

const ruleTypeOptions = [
    { value: 'flat', label: 'Flat' },
    { value: 'per_event', label: 'Per event' },
    { value: 'tiered', label: 'Tiered (coming soon)', disabled: true },
];

interface PricingShowProps {
    pricingModuleId: number;
    pricingModule?: {
        id: number;
        code: string;
        name: string;
        description?: string | null;
    };
    pricingRules?: Array<{
        id: number;
        rule_type: string;
        amount: string;
        currency: string;
        event_type?: string | null;
        effective_from?: string;
        effective_to?: string | null;
        pricing_module_id?: number;
        pricing_module?: {
            id: number;
            code: string;
            name: string;
        };
        status?: string;
    }>;
}

type PricingModuleRecord = NonNullable<PricingShowProps['pricingModule']>;

type PricingRuleRecord = NonNullable<PricingShowProps['pricingRules']>[number];

const normalizeModule = (module: PricingModuleRecord): PricingModule => ({
    id: module.id,
    code: module.code,
    name: module.name,
    description: module.description ?? 'Module pricing configuration.',
});

const normalizeRule = (rule: PricingRuleRecord): PricingRule => ({
    id: rule.id,
    rule_type: rule.rule_type,
    amount: rule.amount,
    currency: rule.currency,
    effective_from: rule.effective_from ?? '—',
    effective_to: rule.effective_to ?? null,
    event_type: rule.event_type ?? null,
    status: rule.status ?? 'active',
    module_id: rule.pricing_module_id ?? rule.pricing_module?.id ?? 0,
});

interface PricingShowState {
    module: PricingModule | null;
    rules: PricingRule[];
}

export default function PricingShow({
    pricingModuleId,
    pricingModule,
    pricingRules = [],
}: PricingShowProps) {
    const normalizedState = useMemo<PricingShowState>(() => {
        return {
            module: pricingModule ? normalizeModule(pricingModule) : null,
            rules: pricingRules.map(normalizeRule),
        };
    }, [pricingModule, pricingRules]);

    const {
        data: pricingState,
        setData: setPricingState,
        isLoading,
        hasError,
        refresh: fetchModule,
    } = useInertiaResource<PricingShowState>({
        initialData: normalizedState,
        mockData: { module: null, rules: [] },
        useMocks: USE_MOCKS,
        reloadOnly: ['pricingModule', 'pricingRules'],
        fetcher: async () => {
            const [moduleResponse, rulesResponse] = await Promise.all([
                getPricingModules(),
                getPricingRules(pricingModuleId),
            ]);
            const selectedModule =
                moduleResponse.find((item) => item.id === pricingModuleId) ??
                moduleResponse[0];

            return {
                module: selectedModule ?? null,
                rules: rulesResponse,
            };
        },
        onError: () => toast.error('Unable to load pricing rules'),
    });

    const { module, rules } = pricingState;
    const [filters, setFilters] = useRemember(
        { query: '', status: 'all' },
        `Pricing/Rules:${pricingModuleId}`,
    );
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        rule_type: '',
        amount: '',
        effective_from: '',
        effective_to: '',
        event_type: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [expandedRuleIds, setExpandedRuleIds] = useRemember<number[]>(
        [],
        `Pricing/Rules:Expanded:${pricingModuleId}`,
    );

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
        if (!module) {
            return [
                {
                    title: 'Pricing',
                    href: pricing.index().url,
                },
            ];
        }

        return [
            {
                title: 'Pricing',
                href: pricing.index().url,
            },
            {
                title: module.code,
                href: pricing.show(module.id).url,
            },
        ];
    }, [module]);

    const handleCreateRule = () => {
        const errors: Record<string, string> = {};

        if (!formData.rule_type) {
            errors.rule_type = 'Select a rule type.';
        }
        if (!formData.amount) {
            errors.amount = 'Enter an amount.';
        }
        if (!formData.effective_from) {
            errors.effective_from = 'Set an effective start date.';
        }
        if (formData.rule_type === 'per_event' && !formData.event_type) {
            errors.event_type = 'Select an event type.';
        }

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast.error('Please fix the highlighted fields.');
            return;
        }

        if (USE_MOCKS && module) {
            const newRule: PricingRule = {
                id: Date.now(),
                rule_type: formData.rule_type,
                amount: formData.amount,
                currency: 'USD',
                effective_from: formData.effective_from,
                effective_to: formData.effective_to || null,
                event_type: formData.event_type || null,
                status: 'active',
                module_id: module.id,
            };
            setPricingState((prev) => ({
                ...prev,
                rules: [newRule, ...prev.rules],
            }));
            toast.success('Pricing rule created.');
            setIsDialogOpen(false);
            setFormData({
                rule_type: '',
                amount: '',
                effective_from: '',
                effective_to: '',
                event_type: '',
            });
            setFormErrors({});
            return;
        }

        toast.message('Submitting pricing rule...');
    };

    const handleDeactivate = (ruleId: number) => {
        if (USE_MOCKS) {
            setPricingState((prev) => ({
                ...prev,
                rules: prev.rules.map((rule) =>
                    rule.id === ruleId
                        ? { ...rule, status: 'inactive' }
                        : rule,
                ),
            }));
            toast.success('Rule deactivated.');
            return;
        }

        toast.message('Deactivate request sent.');
    };

    const expandedRuleSet = useMemo(
        () => new Set(expandedRuleIds),
        [expandedRuleIds],
    );

    const filteredRules = useMemo(() => {
        const query = filters.query.trim().toLowerCase();

        return rules.filter((rule) => {
            const matchesStatus =
                filters.status === 'all' || rule.status === filters.status;
            const matchesQuery = query
                ? `${rule.rule_type} ${rule.event_type ?? ''}`
                      .toLowerCase()
                      .includes(query)
                : true;

            return matchesStatus && matchesQuery;
        });
    }, [filters.query, filters.status, rules]);

    const toggleRuleDetails = (ruleId: number) => {
        setExpandedRuleIds((prev) =>
            prev.includes(ruleId)
                ? prev.filter((id) => id !== ruleId)
                : [...prev, ruleId],
        );
    };

    const activeRules = rules.filter((rule) => rule.status === 'active').length;
    const perEventRules = rules.filter(
        (rule) => rule.rule_type === 'per_event',
    ).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pricing Module" />
            <div className="relative flex flex-1 flex-col gap-8">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute -top-24 right-10 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.25),_transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.18),_transparent_70%)]" />
                    <div className="absolute -bottom-24 left-6 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.22),_transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.16),_transparent_70%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(0,0,0,0.06),_transparent_55%)] dark:bg-[linear-gradient(135deg,_rgba(255,255,255,0.05),_transparent_55%)]" />
                </div>
                <PageHeader
                    className="border-border/40 pb-6"
                    title={module?.name ?? 'Pricing rules'}
                    description={
                        module?.description ??
                        'Configure pricing rules and effective periods.'
                    }
                    actions={
                        <Dialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button className="shadow-sm">
                                    Create rule
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>
                                        Create pricing rule
                                    </DialogTitle>
                                    <DialogDescription>
                                        Configure flat or per-event pricing for
                                        this module.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                            Module
                                        </label>
                                        <Input
                                            value={module?.code ?? ''}
                                            disabled
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                            Rule type
                                        </label>
                                        <Select
                                            value={formData.rule_type}
                                            onValueChange={(value) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    rule_type: value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select rule type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ruleTypeOptions.map(
                                                    (option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                            disabled={
                                                                option.disabled
                                                            }
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {formErrors.rule_type && (
                                            <p className="text-sm text-destructive">
                                                {formErrors.rule_type}
                                            </p>
                                        )}
                                    </div>
                                    {formData.rule_type === 'per_event' && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                                Event type
                                            </label>
                                            <Select
                                                value={formData.event_type}
                                                onValueChange={(value) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        event_type: value,
                                                    }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select event type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {eventTypes.map(
                                                        (eventType) => (
                                                            <SelectItem
                                                                key={eventType}
                                                                value={
                                                                    eventType
                                                                }
                                                            >
                                                                {eventType}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {formErrors.event_type && (
                                                <p className="text-sm text-destructive">
                                                    {formErrors.event_type}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                                Amount
                                            </label>
                                            <Input
                                                value={formData.amount}
                                                onChange={(event) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        amount: event.target
                                                            .value,
                                                    }))
                                                }
                                                placeholder="$0.00"
                                            />
                                            {formErrors.amount && (
                                                <p className="text-sm text-destructive">
                                                    {formErrors.amount}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                                Effective from
                                            </label>
                                            <Input
                                                type="date"
                                                value={formData.effective_from}
                                                onChange={(event) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        effective_from:
                                                            event.target.value,
                                                    }))
                                                }
                                            />
                                            {formErrors.effective_from && (
                                                <p className="text-sm text-destructive">
                                                    {formErrors.effective_from}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                            Effective to (optional)
                                        </label>
                                        <Input
                                            type="date"
                                            value={formData.effective_to}
                                            onChange={(event) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    effective_to:
                                                        event.target.value,
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
                                    <Button onClick={handleCreateRule}>
                                        Save rule
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    }
                />

                {isLoading ? (
                    <Skeleton className="h-96" />
                ) : hasError ? (
                    <ErrorState onRetry={fetchModule} />
                ) : !module ? (
                    <EmptyState
                        icon={<span className="text-lg">💳</span>}
                        title="Module unavailable"
                        description="We could not load this pricing module."
                        actionLabel="Retry"
                        onAction={fetchModule}
                    />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.35)]">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                    Total rules
                                </p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight">
                                    {rules.length}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {module.name}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.35)]">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                    Active rules
                                </p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight">
                                    {activeRules}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Live configurations
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.35)]">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                    Per event
                                </p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight">
                                    {perEventRules}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Event-driven pricing
                                </p>
                            </div>
                        </div>
                        <DataTable
                            title="Rules"
                            description="Expand a row to review more detail about pricing logic."
                            className="border-border/60 bg-card/80 shadow-[0_24px_70px_-50px_rgba(15,23,42,0.45)]"
                            filters={
                                <>
                                    <div className="flex flex-1 flex-col gap-2">
                                        <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                            Search rule
                                        </label>
                                        <Input
                                            placeholder="Search by type"
                                            value={filters.query}
                                            onChange={(event) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    query: event.target.value,
                                                }))
                                            }
                                            className="h-10 bg-background/70"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col gap-2">
                                        <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                            Status
                                        </label>
                                        <Select
                                            value={filters.status}
                                            onValueChange={(value) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    status: value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger className="h-10 bg-background/70">
                                                <SelectValue placeholder="All statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All
                                                </SelectItem>
                                                <SelectItem value="active">
                                                    Active
                                                </SelectItem>
                                                <SelectItem value="inactive">
                                                    Inactive
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            }
                            pagination={
                                <>
                                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                        {filteredRules.length} rules
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled
                                            className="h-8 px-3"
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled
                                            className="h-8 px-3"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </>
                            }
                        >
                            {filteredRules.length ? (
                                <Table className="text-sm">
                                    <TableHeader>
                                        <TableRow className="border-border/60">
                                            <TableHead className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                                Rule type
                                            </TableHead>
                                            <TableHead className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                                Amount
                                            </TableHead>
                                            <TableHead className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                                Effective
                                            </TableHead>
                                            <TableHead className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                                Status
                                            </TableHead>
                                            <TableHead className="text-right text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRules.map((rule) => {
                                            const isExpanded =
                                                expandedRuleSet.has(rule.id);

                                            return (
                                                <Fragment key={rule.id}>
                                                    <TableRow className="border-border/50">
                                                        <TableCell className="font-medium">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleRuleDetails(
                                                                        rule.id,
                                                                    )
                                                                }
                                                                className="flex items-center gap-3 text-left"
                                                            >
                                                                <span
                                                                    className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                                                                        isExpanded
                                                                            ? 'text-foreground'
                                                                            : 'text-muted-foreground'
                                                                    }`}
                                                                >
                                                                    {isExpanded
                                                                        ? '-'
                                                                        : '+'}
                                                                </span>
                                                                <span>
                                                                    {rule.rule_type.replaceAll(
                                                                        '_',
                                                                        ' ',
                                                                    )}
                                                                    {rule.event_type
                                                                        ? ` (${rule.event_type})`
                                                                        : ''}
                                                                </span>
                                                            </button>
                                                        </TableCell>
                                                        <TableCell>
                                                            {rule.currency}{' '}
                                                            {rule.amount}
                                                        </TableCell>
                                                        <TableCell>
                                                            {rule.effective_from}
                                                            {rule.effective_to
                                                                ? ` → ${rule.effective_to}`
                                                                : ''}
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge
                                                                status={
                                                                    rule.status
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8"
                                                                    onClick={() =>
                                                                        toggleRuleDetails(
                                                                            rule.id,
                                                                        )
                                                                    }
                                                                >
                                                                    Details
                                                                </Button>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-8"
                                                                        >
                                                                            Actions
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem
                                                                            onSelect={() =>
                                                                                toast.message(
                                                                                    'Edit flow coming soon',
                                                                                )
                                                                            }
                                                                        >
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onSelect={() =>
                                                                                handleDeactivate(
                                                                                    rule.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            Deactivate
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                    {isExpanded && (
                                                        <TableRow className="border-border/50 bg-muted/30">
                                                            <TableCell
                                                                colSpan={5}
                                                                className="p-0"
                                                            >
                                                                <div className="grid gap-4 px-6 py-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                                                                    <div className="space-y-1">
                                                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                                                            Rule id
                                                                        </p>
                                                                        <p className="font-medium">
                                                                            {
                                                                                rule.id
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                                                            Currency
                                                                        </p>
                                                                        <p className="font-medium">
                                                                            {
                                                                                rule.currency
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                                                            Event type
                                                                        </p>
                                                                        <p className="font-medium">
                                                                            {rule.event_type ??
                                                                                '—'}
                                                                        </p>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                                                            Effective
                                                                        </p>
                                                                        <p className="font-medium">
                                                                            {
                                                                                rule.effective_from
                                                                            }
                                                                            {rule.effective_to
                                                                                ? ` → ${rule.effective_to}`
                                                                                : ''}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </Fragment>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            ) : (
                                <EmptyState
                                    icon={<span className="text-lg">🧾</span>}
                                    title={
                                        rules.length === 0
                                            ? 'No rules configured'
                                            : 'No matching rules'
                                    }
                                    description={
                                        rules.length === 0
                                            ? 'Create a pricing rule for this module.'
                                            : 'Try adjusting your filters to see more results.'
                                    }
                                    actionLabel="Create rule"
                                    onAction={() => setIsDialogOpen(true)}
                                />
                            )}
                        </DataTable>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
