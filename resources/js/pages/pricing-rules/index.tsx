import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { getPricingModules, getPricingRules } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import pricingRules from '@/routes/pricing-rules';
import { type BreadcrumbItem } from '@/types';
import {
    type PricingModule,
    type PricingRule,
} from '@/types/financial-console';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pricing',
        href: pricingRules.index().url,
    },
];

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

interface PricingRulesProps {
    initialPricingRules?: Array<{
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
    pricingModules?: Array<{
        id: number;
        code: string;
        name: string;
        description?: string | null;
    }>;
}

type PricingModuleRecord = NonNullable<
    PricingRulesProps['pricingModules']
>[number];

type PricingRuleRecord = NonNullable<
    PricingRulesProps['initialPricingRules']
>[number];

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

export default function PricingRulesIndex({
    initialPricingRules = [],
    pricingModules = [],
}: PricingRulesProps) {
    const [modules, setModules] = useState<PricingModule[]>(
        USE_MOCKS ? [] : pricingModules.map(normalizeModule),
    );
    const [rules, setRules] = useState<PricingRule[]>(
        USE_MOCKS ? [] : initialPricingRules.map(normalizeRule),
    );
    const [isLoading, setIsLoading] = useState(USE_MOCKS);
    const [hasError, setHasError] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        module_id: '',
        rule_type: '',
        amount: '',
        effective_from: '',
        effective_to: '',
        event_type: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const activeModuleId = modules[0]?.id ?? null;

    const groupedRules = useMemo(() => {
        return modules.reduce<Record<number, PricingRule[]>>((acc, module) => {
            acc[module.id] = rules.filter(
                (rule) => rule.module_id === module.id,
            );
            return acc;
        }, {});
    }, [modules, rules]);

    const fetchRules = async () => {
        setHasError(false);
        if (!USE_MOCKS) {
            setIsLoading(true);
            router.reload({ only: ['initialPricingRules', 'pricingModules'] });
            return;
        }

        setIsLoading(true);
        try {
            const [moduleResponse, ruleResponse] = await Promise.all([
                getPricingModules(),
                getPricingRules(),
            ]);
            setModules(moduleResponse);
            setRules(ruleResponse);
        } catch (error) {
            setHasError(true);
            toast.error('Unable to load pricing rules');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (USE_MOCKS) {
            fetchRules();
        }
    }, []);

    useEffect(() => {
        if (!USE_MOCKS) {
            setModules(pricingModules.map(normalizeModule));
            setRules(initialPricingRules.map(normalizeRule));
            setIsLoading(false);
        }
    }, [pricingModules, initialPricingRules]);

    useEffect(() => {
        if (isDialogOpen && activeModuleId && !formData.module_id) {
            setFormData((prev) => ({
                ...prev,
                module_id: String(activeModuleId),
            }));
        }
    }, [isDialogOpen, activeModuleId]);

    const handleCreateRule = () => {
        const errors: Record<string, string> = {};

        if (!formData.module_id) {
            errors.module_id = 'Select a module.';
        }
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

        if (USE_MOCKS) {
            const newRule: PricingRule = {
                id: Date.now(),
                rule_type: formData.rule_type,
                amount: formData.amount,
                currency: 'USD',
                effective_from: formData.effective_from,
                effective_to: formData.effective_to || null,
                event_type: formData.event_type || null,
                status: 'active',
                module_id: Number(formData.module_id),
            };
            setRules((prev) => [newRule, ...prev]);
            toast.success('Pricing rule created.');
            setIsDialogOpen(false);
            setFormData({
                module_id: '',
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
            setRules((prev) =>
                prev.map((rule) =>
                    rule.id === ruleId ? { ...rule, status: 'inactive' } : rule,
                ),
            );
            toast.success('Rule deactivated.');
            return;
        }

        toast.message('Deactivate request sent.');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pricing Rules" />
            <div className="flex flex-1 flex-col gap-6">
                <PageHeader
                    title="Pricing Rules"
                    description="Configure module pricing rules and effective periods."
                    actions={
                        <Dialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button>Create rule</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>
                                        Create pricing rule
                                    </DialogTitle>
                                    <DialogDescription>
                                        Configure flat or per-event pricing for
                                        a module.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Module
                                        </label>
                                        <Select
                                            value={formData.module_id}
                                            onValueChange={(value) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    module_id: value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select module" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {modules.map((module) => (
                                                    <SelectItem
                                                        key={module.id}
                                                        value={String(
                                                            module.id,
                                                        )}
                                                    >
                                                        {module.code}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formErrors.module_id && (
                                            <p className="text-sm text-destructive">
                                                {formErrors.module_id}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
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
                                            <label className="text-sm font-medium">
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
                                            <label className="text-sm font-medium">
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
                                            <label className="text-sm font-medium">
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
                                        <label className="text-sm font-medium">
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
                    <ErrorState onRetry={fetchRules} />
                ) : modules.length === 0 ? (
                    <EmptyState
                        icon={<span className="text-lg">💳</span>}
                        title="No pricing modules"
                        description="Add pricing modules to configure rules."
                        actionLabel="Contact support"
                        onAction={() => toast.message('Contacting support')}
                    />
                ) : (
                    <Tabs defaultValue={String(activeModuleId ?? '')}>
                        <TabsList className="flex flex-wrap justify-start">
                            {modules.map((module) => (
                                <TabsTrigger
                                    key={module.id}
                                    value={String(module.id)}
                                >
                                    {module.code}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {modules.map((module) => (
                            <TabsContent
                                key={module.id}
                                value={String(module.id)}
                            >
                                <DataTable
                                    title={module.name}
                                    description={module.description}
                                    filters={
                                        <>
                                            <div className="flex flex-1 flex-col gap-2">
                                                <label className="text-sm font-medium">
                                                    Search rule
                                                </label>
                                                <Input placeholder="Search by type" />
                                            </div>
                                            <div className="flex flex-1 flex-col gap-2">
                                                <label className="text-sm font-medium">
                                                    Status
                                                </label>
                                                <Select defaultValue="all">
                                                    <SelectTrigger>
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
                                            <span>
                                                {groupedRules[module.id]
                                                    ?.length ?? 0}{' '}
                                                rules
                                            </span>
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
                                    {groupedRules[module.id]?.length ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        Rule type
                                                    </TableHead>
                                                    <TableHead>
                                                        Amount
                                                    </TableHead>
                                                    <TableHead>
                                                        Effective
                                                    </TableHead>
                                                    <TableHead>
                                                        Status
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {groupedRules[module.id].map(
                                                    (rule) => (
                                                        <TableRow key={rule.id}>
                                                            <TableCell className="font-medium">
                                                                {rule.rule_type.replaceAll(
                                                                    '_',
                                                                    ' ',
                                                                )}
                                                                {rule.event_type
                                                                    ? ` (${rule.event_type})`
                                                                    : ''}
                                                            </TableCell>
                                                            <TableCell>
                                                                {rule.currency}{' '}
                                                                {rule.amount}
                                                            </TableCell>
                                                            <TableCell>
                                                                {
                                                                    rule.effective_from
                                                                }
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
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
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
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <EmptyState
                                            icon={
                                                <span className="text-lg">
                                                    🧾
                                                </span>
                                            }
                                            title="No rules configured"
                                            description="Create a pricing rule for this module."
                                            actionLabel="Create rule"
                                            onAction={() =>
                                                setIsDialogOpen(true)
                                            }
                                        />
                                    )}
                                </DataTable>
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </div>
        </AppLayout>
    );
}
