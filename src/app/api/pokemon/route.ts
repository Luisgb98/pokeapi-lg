import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRepository } from '@/application/container';
import { getPokemonList } from '@/application/usecases/getPokemonList';
import { GENERATIONS, POKEMON_TYPES } from '@/domain/entities/Pokemon';

const querySchema = z.object({
  type: z.enum(POKEMON_TYPES).optional(),
  generation: z.enum(GENERATIONS).optional(),
  search: z.string().min(1).max(100).optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const parsed = querySchema.safeParse({
    type: searchParams.get('type') ?? undefined,
    generation: searchParams.get('generation') ?? undefined,
    search: searchParams.get('search') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const repository = getRepository();
    const { pokemon, total } = await getPokemonList(repository, {
      filters: {
        type: parsed.data.type,
        generation: parsed.data.generation,
      },
      search: parsed.data.search,
    });

    return NextResponse.json({ success: true, data: pokemon, meta: { total } });
  } catch (error) {
    console.error('[GET /api/pokemon]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Pokémon list' },
      { status: 500 },
    );
  }
}
