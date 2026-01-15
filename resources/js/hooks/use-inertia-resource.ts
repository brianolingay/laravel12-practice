import { router } from '@inertiajs/react';
import {
    useCallback,
    useEffect,
    useState,
    type Dispatch,
    type SetStateAction,
} from 'react';

interface UseInertiaResourceOptions<T> {
    initialData: T;
    mockData: T;
    useMocks: boolean;
    reloadOnly?: string[];
    fetcher?: () => Promise<T>;
    fetchOnMount?: boolean;
    onError?: (error: unknown) => void;
}

interface InertiaResourceState<T> {
    data: T;
    setData: Dispatch<SetStateAction<T>>;
    isLoading: boolean;
    hasError: boolean;
    refresh: () => Promise<void>;
}

export function useInertiaResource<T>({
    initialData,
    mockData,
    useMocks,
    reloadOnly = [],
    fetcher,
    fetchOnMount = true,
    onError,
}: UseInertiaResourceOptions<T>): InertiaResourceState<T> {
    const [data, setData] = useState<T>(useMocks ? mockData : initialData);
    const [isLoading, setIsLoading] = useState(useMocks);
    const [hasError, setHasError] = useState(false);

    const refresh = useCallback(async () => {
        setHasError(false);

        if (!useMocks) {
            setIsLoading(true);
            router.reload(reloadOnly.length ? { only: reloadOnly } : {});
            return;
        }

        if (!fetcher) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetcher();
            setData(response);
        } catch (error) {
            setHasError(true);
            onError?.(error);
        } finally {
            setIsLoading(false);
        }
    }, [fetcher, onError, reloadOnly, useMocks]);

    useEffect(() => {
        if (useMocks && fetchOnMount) {
            refresh();
        }
    }, [fetchOnMount, refresh, useMocks]);

    useEffect(() => {
        if (!useMocks) {
            setData(initialData);
            setIsLoading(false);
        }
    }, [initialData, useMocks]);

    return {
        data,
        setData,
        isLoading,
        hasError,
        refresh,
    };
}
