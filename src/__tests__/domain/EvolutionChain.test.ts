import { describe, expect, it } from 'vitest';
import { flattenChainIds, flattenChainNames } from '../../domain/entities/EvolutionChain';
import type { EvolutionNode } from '../../domain/entities/EvolutionChain';

const pikachuChain: EvolutionNode = {
  id: 172,
  name: 'pichu',
  displayName: 'Pichu',
  sprite: '',
  evolvesTo: [
    {
      id: 25,
      name: 'pikachu',
      displayName: 'Pikachu',
      sprite: '',
      evolvesTo: [
        {
          id: 26,
          name: 'raichu',
          displayName: 'Raichu',
          sprite: '',
          evolvesTo: [],
        },
      ],
    },
  ],
};

const eeveeChain: EvolutionNode = {
  id: 133,
  name: 'eevee',
  displayName: 'Eevee',
  sprite: '',
  evolvesTo: [
    { id: 134, name: 'vaporeon', displayName: 'Vaporeon', sprite: '', evolvesTo: [] },
    { id: 135, name: 'jolteon', displayName: 'Jolteon', sprite: '', evolvesTo: [] },
    { id: 136, name: 'flareon', displayName: 'Flareon', sprite: '', evolvesTo: [] },
  ],
};

describe('flattenChainIds', () => {
  it('returns all IDs from a linear chain', () => {
    expect(flattenChainIds(pikachuChain)).toEqual([172, 25, 26]);
  });

  it('returns all IDs from a branching chain', () => {
    expect(flattenChainIds(eeveeChain)).toEqual([133, 134, 135, 136]);
  });

  it('returns single ID for non-evolving pokemon', () => {
    const node: EvolutionNode = {
      id: 143,
      name: 'snorlax',
      displayName: 'Snorlax',
      sprite: '',
      evolvesTo: [],
    };
    expect(flattenChainIds(node)).toEqual([143]);
  });
});

describe('flattenChainNames', () => {
  it('returns all names from a linear chain', () => {
    expect(flattenChainNames(pikachuChain)).toEqual(['pichu', 'pikachu', 'raichu']);
  });

  it('returns all names from a branching chain', () => {
    expect(flattenChainNames(eeveeChain)).toEqual(['eevee', 'vaporeon', 'jolteon', 'flareon']);
  });
});
