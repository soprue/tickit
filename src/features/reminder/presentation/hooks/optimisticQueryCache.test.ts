import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { createOptimisticCache, type QueryResponse } from './optimisticQueryCache';

interface Item {
  id: number;
  text: string;
}

type ItemResponse = QueryResponse<Item>;

const queryKey = ['items'];

const emptyResponse = (): ItemResponse => ({
  data: [],
  status: 200,
  headers: new Headers(),
});

function createCache(queryClient: QueryClient) {
  return createOptimisticCache<Item, ItemResponse>(queryClient, queryKey, emptyResponse);
}

describe('createOptimisticCache', () => {
  it('updates query data with fallback response', async () => {
    const queryClient = new QueryClient();
    const cache = createCache(queryClient);

    await cache.update((items) => [...items, { id: 1, text: 'First' }]);

    expect(queryClient.getQueryData<ItemResponse>(queryKey)?.data).toEqual([
      { id: 1, text: 'First' },
    ]);
  });

  it('rolls back to previous query data', async () => {
    const queryClient = new QueryClient();
    const cache = createCache(queryClient);
    const previous = { ...emptyResponse(), data: [{ id: 1, text: 'Before' }] };

    queryClient.setQueryData<ItemResponse>(queryKey, previous);
    const context = await cache.update((items) => [...items, { id: 2, text: 'After' }]);

    cache.rollback(context);

    expect(queryClient.getQueryData<ItemResponse>(queryKey)).toEqual(previous);
  });

  it('replaces a matching item or appends when there is no match', () => {
    const queryClient = new QueryClient();
    const cache = createCache(queryClient);

    queryClient.setQueryData<ItemResponse>(queryKey, {
      ...emptyResponse(),
      data: [{ id: 1, text: 'Before' }],
    });

    cache.replaceOrAppend((item) => item.id === 1, { id: 1, text: 'Updated' });
    cache.replaceOrAppend((item) => item.id === 2, { id: 2, text: 'Added' });

    expect(queryClient.getQueryData<ItemResponse>(queryKey)?.data).toEqual([
      { id: 1, text: 'Updated' },
      { id: 2, text: 'Added' },
    ]);
  });
});
