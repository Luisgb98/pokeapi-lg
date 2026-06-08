import { http, HttpResponse } from 'msw';
import {
  allPokemonList,
  bulbasaurRaw,
  electricTypeDetail,
  grassTypeDetail,
  pichuRaw,
  pichuSpecies,
  pikachuChain,
  pikachuRaw,
  pikachuSpecies,
  raichuRaw,
  thundershockMove,
} from './fixtures';

const BASE = 'https://pokeapi.co/api/v2';

export const handlers = [
  http.get(`${BASE}/pokemon`, ({ request }) => {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');
    if (limit === '10000') {
      return HttpResponse.json(allPokemonList);
    }
    return HttpResponse.json(allPokemonList);
  }),

  http.get(`${BASE}/pokemon/1`, () => HttpResponse.json(bulbasaurRaw)),
  http.get(`${BASE}/pokemon/25`, () => HttpResponse.json(pikachuRaw)),
  http.get(`${BASE}/pokemon/26`, () => HttpResponse.json(raichuRaw)),
  http.get(`${BASE}/pokemon/172`, () => HttpResponse.json(pichuRaw)),

  http.get(`${BASE}/pokemon-species/25`, () => HttpResponse.json(pikachuSpecies)),
  http.get(`${BASE}/pokemon-species/172`, () => HttpResponse.json(pichuSpecies)),
  http.get(`${BASE}/pokemon-species/26`, () =>
    HttpResponse.json({
      ...pikachuSpecies,
      id: 26,
      name: 'raichu',
    }),
  ),
  http.get(`${BASE}/pokemon-species/1`, () =>
    HttpResponse.json({
      id: 1,
      name: 'bulbasaur',
      generation: { name: 'generation-i', url: '' },
      evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/1/' },
    }),
  ),

  http.get(`${BASE}/evolution-chain/10`, () => HttpResponse.json(pikachuChain)),
  http.get(`${BASE}/evolution-chain/1`, () =>
    HttpResponse.json({
      id: 1,
      chain: {
        species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
        evolves_to: [],
      },
    }),
  ),

  http.get(`${BASE}/type/electric`, () => HttpResponse.json(electricTypeDetail)),
  http.get(`${BASE}/type/grass`, () => HttpResponse.json(grassTypeDetail)),

  http.get(`${BASE}/move/84`, () => HttpResponse.json(thundershockMove)),
];
