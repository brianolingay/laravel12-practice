import { Head, Link } from '@inertiajs/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import statements from '@/routes/statements';
import { type BreadcrumbItem } from '@/types';

interface StatementItem {
    id: number;
    period_start: string;
    period_end: string;
    status: string;
    total_amount: string;
    currency: string;
}

interface StatementsPageProps {
    statements: StatementItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Statements',
        href: statements.index().url,
    },
];

const statusTone: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    reviewed:
        'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200',
    finalized:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
};

export default function StatementsIndex({ statements }: StatementsPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Statements" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Billing Statements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-2 font-medium">
                                            Period
                                        </th>
                                        <th className="py-2 font-medium">
                                            Status
                                        </th>
                                        <th className="py-2 font-medium">
                                            Total
                                        </th>
                                        <th className="py-2 font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {statements.map((statement) => (
                                        <tr key={statement.id}>
                                            <td className="py-3 font-medium">
                                                {statement.period_start} –{' '}
                                                {statement.period_end}
                                            </td>
                                            <td className="py-3">
                                                <Badge
                                                    className={
                                                        statusTone[
                                                            statement.status
                                                        ] ??
                                                        'bg-muted text-muted-foreground'
                                                    }
                                                >
                                                    {statement.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3">
                                                {statement.currency}{' '}
                                                {statement.total_amount}
                                            </td>
                                            <td className="py-3">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/statements/${statement.id}`}
                                                    >
                                                        View
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {statements.length === 0 && (
                                        <tr>
                                            <td
                                                className="py-8 text-center text-muted-foreground"
                                                colSpan={4}
                                            >
                                                No statements generated yet.
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
