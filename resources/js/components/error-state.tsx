import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
    title?: string;
    description?: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorState({
    title = 'Something went wrong',
    description = 'We ran into an unexpected error. Please try again.',
    onRetry,
    className,
}: ErrorStateProps) {
    const handleRetry = () => {
        toast.message('Retrying request...');
        onRetry?.();
    };

    return (
        <div
            className={cn(
                'flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center shadow-sm',
                className,
            )}
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/70 text-muted-foreground">
                <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {onRetry && (
                <Button variant="secondary" onClick={handleRetry}>
                    Retry
                </Button>
            )}
        </div>
    );
}
