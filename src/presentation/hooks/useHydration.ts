import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

export function useHydration(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
