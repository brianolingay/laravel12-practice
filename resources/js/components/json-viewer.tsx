import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface JsonViewerProps {
    data: unknown;
    className?: string;
    maxHeightClassName?: string;
}

export function JsonViewer({
    data,
    className,
    maxHeightClassName,
}: JsonViewerProps) {
    const formatted =
        typeof data === 'string' ? data : JSON.stringify(data, null, 2);

    return (
        <ScrollArea
            className={cn('rounded-md border bg-muted', maxHeightClassName)}
        >
            <pre className={cn('p-3 text-xs leading-relaxed', className)}>
                {formatted}
            </pre>
        </ScrollArea>
    );
}
