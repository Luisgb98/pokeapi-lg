import { describe, it, expect, beforeEach } from 'vitest';
import { usePokemonStore } from '../../../presentation/store/pokemonStore';

describe('usePokemonStore', () => {
  beforeEach(() => {
    usePokemonStore.getState().reset();
  });

  it('initializes with empty state', () => {
    const state = usePokemonStore.getState();
    expect(state.search).toBe('');
    expect(state.types).toEqual([]);
    expect(state.generations).toEqual([]);
    expect(state.typeMatchMode).toBe('any');
    expect(state.scrollY).toBe(0);
    expect(state.restoreCount).toBe(0);
  });

  it('setTypeMatchMode updates the mode and resets scroll', () => {
    usePokemonStore.getState().setNavState(500, 24);
    usePokemonStore.getState().setTypeMatchMode('all');
    expect(usePokemonStore.getState().typeMatchMode).toBe('all');
    expect(usePokemonStore.getState().scrollY).toBe(0);
    expect(usePokemonStore.getState().restoreCount).toBe(0);
  });

  it('setSearch updates the search field', () => {
    usePokemonStore.getState().setSearch('pikachu');
    expect(usePokemonStore.getState().search).toBe('pikachu');
  });

  it('setTypes updates the types field', () => {
    usePokemonStore.getState().setTypes(['fire']);
    expect(usePokemonStore.getState().types).toEqual(['fire']);
  });

  it('setTypes supports multiple types', () => {
    usePokemonStore.getState().setTypes(['fire', 'water']);
    expect(usePokemonStore.getState().types).toEqual(['fire', 'water']);
  });

  it('setTypes with empty array clears the filter', () => {
    usePokemonStore.getState().setTypes(['water']);
    usePokemonStore.getState().setTypes([]);
    expect(usePokemonStore.getState().types).toEqual([]);
  });

  it('setGenerations updates the generations field', () => {
    usePokemonStore.getState().setGenerations(['generation-i']);
    expect(usePokemonStore.getState().generations).toEqual(['generation-i']);
  });

  it('setGenerations supports multiple generations', () => {
    usePokemonStore.getState().setGenerations(['generation-i', 'generation-ii']);
    expect(usePokemonStore.getState().generations).toEqual(['generation-i', 'generation-ii']);
  });

  it('setGenerations with empty array clears the filter', () => {
    usePokemonStore.getState().setGenerations(['generation-ii']);
    usePokemonStore.getState().setGenerations([]);
    expect(usePokemonStore.getState().generations).toEqual([]);
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

  it('setTypes resets scrollY and restoreCount', () => {
    usePokemonStore.getState().setNavState(800, 48);
    usePokemonStore.getState().setTypes(['fire']);
    expect(usePokemonStore.getState().scrollY).toBe(0);
    expect(usePokemonStore.getState().restoreCount).toBe(0);
  });

  it('setGenerations resets scrollY and restoreCount', () => {
    usePokemonStore.getState().setNavState(300, 24);
    usePokemonStore.getState().setGenerations(['generation-i']);
    expect(usePokemonStore.getState().scrollY).toBe(0);
    expect(usePokemonStore.getState().restoreCount).toBe(0);
  });

  it('reset clears all fields to initial values', () => {
    usePokemonStore.getState().setSearch('bulbasaur');
    usePokemonStore.getState().setTypes(['grass', 'poison']);
    usePokemonStore.getState().setGenerations(['generation-i']);
    usePokemonStore.getState().setTypeMatchMode('all');
    usePokemonStore.getState().setNavState(999, 72);

    usePokemonStore.getState().reset();

    const state = usePokemonStore.getState();
    expect(state.search).toBe('');
    expect(state.types).toEqual([]);
    expect(state.generations).toEqual([]);
    expect(state.typeMatchMode).toBe('any');
    expect(state.scrollY).toBe(0);
    expect(state.restoreCount).toBe(0);
  });
});
