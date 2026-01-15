import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import statements from '@/routes/statements';
import { type BreadcrumbItem } from '@/types';

interface StatementLineItem {
    id: number;
    description: string;
    quantity: number;
    unit_amount: string;
    total_amount: string;
    currency: string;
}

interface StatementDetail {
    id: number;
    period_start: string;
    period_end: string;
    status: string;
    total_amount: string;
    currency: string;
}

interface StatementShowProps {
    statement: StatementDetail;
    lineItems: StatementLineItem[];
}

export default function StatementShow({
    statement,
    lineItems,
}: StatementShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Statements',
            href: statements.index().url,
        },
        {
            title: `Statement ${statement.id}`,
            href: statements.show(statement.id).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Statement ${statement.id}`} />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Statement {statement.id}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {statement.period_start} –{' '}
                                {statement.period_end}
                            </p>
                        </div>
                        <Button asChild variant="outline">
                            <Link href={statements.index().url}>
                                Back to statements
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">
                                    Status:
                                </span>{' '}
                                <span className="font-medium">
                                    {statement.status}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Total:
                                </span>{' '}
                                <span className="font-medium">
                                    {statement.currency}{' '}
                                    {statement.total_amount}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Line Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-2 font-medium">
                                            Description
                                        </th>
                                        <th className="py-2 font-medium">
                                            Qty
                                        </th>
                                        <th className="py-2 font-medium">
                                            Unit
                                        </th>
                                        <th className="py-2 font-medium">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {lineItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-3 font-medium">
                                                {item.description}
                                            </td>
                                            <td className="py-3">
                                                {item.quantity}
                                            </td>
                                            <td className="py-3">
                                                {item.currency}{' '}
                                                {item.unit_amount}
                                            </td>
                                            <td className="py-3">
                                                {item.currency}{' '}
                                                {item.total_amount}
                                            </td>
                                        </tr>
                                    ))}
                                    {lineItems.length === 0 && (
                                        <tr>
                                            <td
                                                className="py-8 text-center text-muted-foreground"
                                                colSpan={4}
                                            >
                                                No line items yet.
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
