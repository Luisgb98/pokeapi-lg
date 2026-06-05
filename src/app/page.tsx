import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { FilterBar } from '@/presentation/components/organisms/FilterBar';
import { PokemonGrid } from '@/presentation/components/organisms/PokemonGrid';
import { getRepository } from '@/application/container';
import { getPokemonList } from '@/application/usecases/getPokemonList';

export default async function HomePage() {
  const queryClient = new QueryClient();
  const repository = getRepository();

  const { pokemon, total } = await getPokemonList(repository);
  queryClient.setQueryData(
    ['pokemon', 'list', { type: undefined, generation: undefined, search: undefined }],
    { success: true, data: pokemon, meta: { total } },
  );

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <header className="mx-auto max-w-7xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
              Pokédex
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Explore, filter, and discover Pokémon across all generations
            </p>
          </div>
          <div className="hidden select-none text-4xl opacity-15 sm:block">◉</div>
        </div>
      </header>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <FilterBar />
        <PokemonGrid />
      </HydrationBoundary>
    </div>
  );
}
