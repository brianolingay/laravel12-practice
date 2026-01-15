import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import pricingRules from '@/routes/pricing-rules';
import { type BreadcrumbItem } from '@/types';

interface PricingModuleInfo {
    id: number;
    code: string;
    name: string;
}

interface PricingRuleDetail {
    id: number;
    rule_type: string;
    amount: string;
    currency: string;
    event_type: string | null;
    pricing_module: PricingModuleInfo;
}

interface PricingRulesEditProps {
    pricingRule: PricingRuleDetail;
    pricingModules: PricingModuleInfo[];
}

export default function PricingRulesEdit({
    pricingRule,
}: PricingRulesEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pricing Rules', href: pricingRules.index().url },
        {
            title: `Edit ${pricingRule.id}`,
            href: pricingRules.edit(pricingRule.id).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Pricing Rule ${pricingRule.id}`} />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Edit Pricing Rule</CardTitle>
                        <Button asChild variant="outline">
                            <Link href={pricingRules.index().url}>Back</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">
                                    Module:
                                </span>{' '}
                                <span className="font-medium">
                                    {pricingRule.pricing_module?.code}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Rule type:
                                </span>{' '}
                                <span className="font-medium">
                                    {pricingRule.rule_type.replaceAll('_', ' ')}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Amount:
                                </span>{' '}
                                <span className="font-medium">
                                    {pricingRule.currency} {pricingRule.amount}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Event type:
                                </span>{' '}
                                <span className="font-medium">
                                    {pricingRule.event_type ?? '—'}
                                </span>
                            </div>
                            <p className="pt-4 text-sm text-muted-foreground">
                                Editing is coming soon. Use the create dialog
                                for new rules.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
