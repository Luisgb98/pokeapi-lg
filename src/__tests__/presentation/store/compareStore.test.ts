import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCompareStore } from '@/presentation/store/compareStore';

vi.mock('@/presentation/lib/cookieStorage', () => ({
  cookieStorage: { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() },
}));

const EMPTY_SLOTS = { a: null, b: null, c: null };

beforeEach(() => {
  useCompareStore.setState({ slots: { ...EMPTY_SLOTS } });
});

describe('initial state', () => {
  it('starts with all slots empty', () => {
    expect(useCompareStore.getState().slots).toEqual(EMPTY_SLOTS);
  });
});

describe('setSlot', () => {
  it('sets a pokemon id in slot a', () => {
    useCompareStore.getState().setSlot('a', 25);
    expect(useCompareStore.getState().slots.a).toBe(25);
  });

  it('sets different pokemon in different slots independently', () => {
    useCompareStore.getState().setSlot('a', 25);
    useCompareStore.getState().setSlot('b', 26);
    const { slots } = useCompareStore.getState();
    expect(slots.a).toBe(25);
    expect(slots.b).toBe(26);
    expect(slots.c).toBeNull();
  });

  it('overwrites an existing slot', () => {
    useCompareStore.getState().setSlot('a', 25);
    useCompareStore.getState().setSlot('a', 1);
    expect(useCompareStore.getState().slots.a).toBe(1);
  });
});

describe('clearSlot', () => {
  it('sets the slot back to null', () => {
    useCompareStore.getState().setSlot('b', 26);
    useCompareStore.getState().clearSlot('b');
    expect(useCompareStore.getState().slots.b).toBeNull();
  });

  it('does not affect other slots', () => {
    useCompareStore.getState().setSlot('a', 25);
    useCompareStore.getState().setSlot('b', 26);
    useCompareStore.getState().clearSlot('a');
    expect(useCompareStore.getState().slots.b).toBe(26);
  });
});

describe('clearAll', () => {
  it('sets all slots to null', () => {
    useCompareStore.getState().setSlot('a', 25);
    useCompareStore.getState().setSlot('b', 26);
    useCompareStore.getState().setSlot('c', 1);
    useCompareStore.getState().clearAll();
    expect(useCompareStore.getState().slots).toEqual(EMPTY_SLOTS);
  });
});
