import { type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center',
                className,
            )}
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                {icon}
            </div>
            <div className="space-y-1">
                <h3 className="text-base font-semibold">{title}</h3>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {action ??
                (actionLabel && onAction ? (
                    <Button onClick={onAction}>{actionLabel}</Button>
                ) : null)}
        </div>
    );
}
