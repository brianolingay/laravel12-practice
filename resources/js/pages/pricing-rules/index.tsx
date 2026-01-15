import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import pricingRules from '@/routes/pricing-rules';
import { type BreadcrumbItem } from '@/types';

interface PricingModuleInfo {
    id: number;
    code: string;
    name: string;
}

interface PricingRuleItem {
    id: number;
    rule_type: string;
    amount: string;
    currency: string;
    event_type: string | null;
    pricing_module: PricingModuleInfo;
}

interface PricingRulesPageProps {
    initialPricingRules: PricingRuleItem[];
    pricingModules: PricingModuleInfo[];
}

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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pricing Rules',
        href: pricingRules.index().url,
    },
];

export default function PricingRulesIndex({
    initialPricingRules,
    pricingModules,
}: PricingRulesPageProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        pricing_module_id: '',
        rule_type: '',
        amount: '',
        event_type: '',
    });

    const handleCreate = () => {
        post(pricingRules.store().url, {
            onSuccess: () => {
                reset();
                setIsCreateOpen(false);
            },
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pricing Rules" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Pricing Rules</CardTitle>
                        <Dialog
                            open={isCreateOpen}
                            onOpenChange={setIsCreateOpen}
                        >
                            <DialogTrigger asChild>
                                <Button>Create rule</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Create pricing rule
                                    </DialogTitle>
                                    <DialogDescription>
                                        Configure a flat or per-event rule.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Module
                                        </label>
                                        <Select
                                            value={data.pricing_module_id}
                                            onValueChange={(value) =>
                                                setData(
                                                    'pricing_module_id',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select module" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {pricingModules.map(
                                                    (module) => (
                                                        <SelectItem
                                                            key={module.id}
                                                            value={String(
                                                                module.id,
                                                            )}
                                                        >
                                                            {module.code}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Rule type
                                        </label>
                                        <Select
                                            value={data.rule_type}
                                            onValueChange={(value) =>
                                                setData('rule_type', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select rule type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="flat">
                                                    Flat
                                                </SelectItem>
                                                <SelectItem value="per_event">
                                                    Per event
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Event type
                                        </label>
                                        <Select
                                            value={data.event_type}
                                            onValueChange={(value) =>
                                                setData('event_type', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select event type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {eventTypes.map((eventType) => (
                                                    <SelectItem
                                                        key={eventType}
                                                        value={eventType}
                                                    >
                                                        {eventType}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Amount
                                        </label>
                                        <Input
                                            placeholder="$0.00"
                                            value={data.amount}
                                            onChange={(event) =>
                                                setData(
                                                    'amount',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="secondary"
                                            onClick={handleCreate}
                                            disabled={processing}
                                        >
                                            Save draft
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-2 font-medium">
                                            Module
                                        </th>
                                        <th className="py-2 font-medium">
                                            Rule type
                                        </th>
                                        <th className="py-2 font-medium">
                                            Event type
                                        </th>
                                        <th className="py-2 font-medium">
                                            Amount
                                        </th>
                                        <th className="py-2 font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {initialPricingRules.map((rule) => (
                                        <tr key={rule.id}>
                                            <td className="py-3 font-medium">
                                                {rule.pricing_module?.code}
                                            </td>
                                            <td className="py-3 capitalize">
                                                {rule.rule_type.replaceAll(
                                                    '_',
                                                    ' ',
                                                )}
                                            </td>
                                            <td className="py-3">
                                                {rule.event_type ?? '—'}
                                            </td>
                                            <td className="py-3">
                                                {rule.currency} {rule.amount}
                                            </td>
                                            <td className="py-3">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.visit(
                                                            pricingRules.edit(
                                                                rule.id,
                                                            ).url,
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {initialPricingRules.length === 0 && (
                                        <tr>
                                            <td
                                                className="py-8 text-center text-muted-foreground"
                                                colSpan={5}
                                            >
                                                No pricing rules yet.
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
