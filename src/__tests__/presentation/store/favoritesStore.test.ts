import { beforeEach, describe, expect, it } from 'vitest';
import { useFavoritesStore } from '@/presentation/store/favoritesStore';

beforeEach(() => {
  useFavoritesStore.setState({ ids: [] });
});

describe('initial state', () => {
  it('starts with no favorites', () => {
    expect(useFavoritesStore.getState().ids).toHaveLength(0);
  });

  it('isFavorite returns false for any id before toggling', () => {
    expect(useFavoritesStore.getState().isFavorite(25)).toBe(false);
  });
});

describe('toggle', () => {
  it('adds id on first toggle and isFavorite returns true', () => {
    useFavoritesStore.getState().toggle(25);
    expect(useFavoritesStore.getState().isFavorite(25)).toBe(true);
  });

  it('removes id on second toggle and isFavorite returns false', () => {
    useFavoritesStore.getState().toggle(25);
    useFavoritesStore.getState().toggle(25);
    expect(useFavoritesStore.getState().isFavorite(25)).toBe(false);
  });

  it('toggling one id does not affect others', () => {
    useFavoritesStore.getState().toggle(25);
    expect(useFavoritesStore.getState().isFavorite(1)).toBe(false);
  });
});

describe('count', () => {
  it('returns 0 when no favorites', () => {
    expect(useFavoritesStore.getState().count()).toBe(0);
  });

  it('returns the number of favorited ids', () => {
    useFavoritesStore.getState().toggle(25);
    useFavoritesStore.getState().toggle(26);
    expect(useFavoritesStore.getState().count()).toBe(2);
  });

  it('decrements after removing a favorite', () => {
    useFavoritesStore.getState().toggle(25);
    useFavoritesStore.getState().toggle(25);
    expect(useFavoritesStore.getState().count()).toBe(0);
  });
});
