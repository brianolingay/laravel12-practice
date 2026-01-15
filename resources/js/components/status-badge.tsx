import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    reviewed:
        'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200',
    finalized:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
    inactive: 'bg-muted text-muted-foreground',
    pending:
        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
    failed: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
};

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const normalized = status.toLowerCase();
    const label = status.replaceAll('_', ' ');

    return (
        <Badge
            className={cn(
                'capitalize',
                statusStyles[normalized] ?? 'bg-muted text-muted-foreground',
                className,
            )}
        >
            {label}
        </Badge>
    );
}
