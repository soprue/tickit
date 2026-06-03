import type { QueryClient, QueryKey } from '@tanstack/react-query';

export type QueryResponse<TItem> = {
  data: TItem[];
  status: number;
  headers: Headers;
};

export type MutationContext<TResponse> = {
  previous: TResponse | undefined;
};

export function createOptimisticCache<TItem, TResponse extends QueryResponse<TItem>>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  fallback: () => TResponse
) {
  const update = async (updater: (items: TItem[]) => TItem[]) => {
    await queryClient.cancelQueries({ queryKey });

    const previous = queryClient.getQueryData<TResponse>(queryKey);
    queryClient.setQueryData<TResponse>(queryKey, (old) => {
      const current = old ?? fallback();

      return {
        ...current,
        data: updater(current.data),
      };
    });

    return { previous };
  };

  const rollback = (context: MutationContext<TResponse> | undefined) => {
    if (context?.previous) {
      queryClient.setQueryData(queryKey, context.previous);
    }
  };

  const replaceOrAppend = (predicate: (item: TItem) => boolean, item: TItem) => {
    queryClient.setQueryData<TResponse>(queryKey, (old) => {
      const current = old ?? fallback();
      const hasMatch = current.data.some(predicate);

      return {
        ...current,
        data: hasMatch
          ? current.data.map((currentItem) => (predicate(currentItem) ? item : currentItem))
          : [...current.data, item],
      };
    });
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    update,
    rollback,
    replaceOrAppend,
    invalidate,
  };
}
