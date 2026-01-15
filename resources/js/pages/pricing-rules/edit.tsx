import { Head, Link } from '@inertiajs/react';

import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
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
    status: string;
    effective_from: string;
    effective_to: string | null;
}

interface PricingRulesEditProps {
    pricingRule: PricingRuleDetail;
}

export default function PricingRulesEdit({
    pricingRule,
}: PricingRulesEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pricing Rules', href: pricingRules.index().url },
        {
            title: `Rule ${pricingRule.id}`,
            href: pricingRules.edit(pricingRule.id).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pricing Rule ${pricingRule.id}`} />
            <div className="flex flex-1 flex-col gap-6">
                <PageHeader
                    title={`Pricing Rule ${pricingRule.id}`}
                    description="Review pricing rule details and current status."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={pricingRules.index().url}>
                                Back to rules
                            </Link>
                        </Button>
                    }
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Rule summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
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
                                Event type:
                            </span>{' '}
                            <span className="font-medium">
                                {pricingRule.event_type ?? '—'}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">
                                Effective:
                            </span>{' '}
                            <span className="font-medium">
                                {pricingRule.effective_from}
                                {pricingRule.effective_to
                                    ? ` → ${pricingRule.effective_to}`
                                    : ''}
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
                                Status:
                            </span>{' '}
                            <StatusBadge status={pricingRule.status} />
                        </div>
                        <p className="pt-4 text-sm text-muted-foreground">
                            Editing is coming soon. Use the create dialog for
                            new rules.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
