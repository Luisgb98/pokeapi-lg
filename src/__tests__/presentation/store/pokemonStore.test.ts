import { describe, it, expect, beforeEach } from 'vitest';
import { usePokemonStore } from '../../../presentation/store/pokemonStore';

describe('usePokemonStore', () => {
  beforeEach(() => {
    usePokemonStore.getState().reset();
  });

  it('initializes with empty state', () => {
    const state = usePokemonStore.getState();
    expect(state.search).toBe('');
    expect(state.type).toBeUndefined();
    expect(state.generation).toBeUndefined();
    expect(state.scrollY).toBe(0);
    expect(state.restoreCount).toBe(0);
  });

  it('setSearch updates the search field', () => {
    usePokemonStore.getState().setSearch('pikachu');
    expect(usePokemonStore.getState().search).toBe('pikachu');
  });

  it('setType updates the type field', () => {
    usePokemonStore.getState().setType('fire');
    expect(usePokemonStore.getState().type).toBe('fire');
  });

  it('setType accepts undefined to clear the filter', () => {
    usePokemonStore.getState().setType('water');
    usePokemonStore.getState().setType(undefined);
    expect(usePokemonStore.getState().type).toBeUndefined();
  });

  it('setGeneration updates the generation field', () => {
    usePokemonStore.getState().setGeneration('generation-i');
    expect(usePokemonStore.getState().generation).toBe('generation-i');
  });

  it('setGeneration accepts undefined to clear the filter', () => {
    usePokemonStore.getState().setGeneration('generation-ii');
    usePokemonStore.getState().setGeneration(undefined);
    expect(usePokemonStore.getState().generation).toBeUndefined();
  });

  it('setNavState updates scrollY and restoreCount', () => {
    usePokemonStore.getState().setNavState(1200, 48);
    expect(usePokemonStore.getState().scrollY).toBe(1200);
    expect(usePokemonStore.getState().restoreCount).toBe(48);
  });

  it('setSearch resets scrollY and restoreCount', () => {
    usePokemonStore.getState().setNavState(500, 24);
    usePokemonStore.getState().setSearch('bulbasaur');
    expect(usePokemonStore.getState().scrollY).toBe(0);
    expect(usePokemonStore.getState().restoreCount).toBe(0);
  });

  it('setType resets scrollY and restoreCount', () => {
    usePokemonStore.getState().setNavState(800, 48);
    usePokemonStore.getState().setType('fire');
    expect(usePokemonStore.getState().scrollY).toBe(0);
    expect(usePokemonStore.getState().restoreCount).toBe(0);
  });

  it('setGeneration resets scrollY and restoreCount', () => {
    usePokemonStore.getState().setNavState(300, 24);
    usePokemonStore.getState().setGeneration('generation-i');
    expect(usePokemonStore.getState().scrollY).toBe(0);
    expect(usePokemonStore.getState().restoreCount).toBe(0);
  });

  it('reset clears all fields to initial values', () => {
    usePokemonStore.getState().setSearch('bulbasaur');
    usePokemonStore.getState().setType('grass');
    usePokemonStore.getState().setGeneration('generation-i');
    usePokemonStore.getState().setNavState(999, 72);

    usePokemonStore.getState().reset();

    const state = usePokemonStore.getState();
    expect(state.search).toBe('');
    expect(state.type).toBeUndefined();
    expect(state.generation).toBeUndefined();
    expect(state.scrollY).toBe(0);
    expect(state.restoreCount).toBe(0);
  });
});
