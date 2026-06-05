import { NextRequest, NextResponse } from 'next/server';
import { getRepository } from '@/application/container';
import { getPokemonById, PokemonNotFoundError } from '@/application/usecases/getPokemonById';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);

  if (isNaN(id) || id < 1) {
    return NextResponse.json({ success: false, error: 'Invalid Pokémon ID' }, { status: 400 });
  }

  try {
    const repository = getRepository();
    const { pokemon, evolutionChain } = await getPokemonById(repository, id);

    return NextResponse.json({ success: true, data: { pokemon, evolutionChain } });
  } catch (error) {
    if (error instanceof PokemonNotFoundError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }

    console.error(`[GET /api/pokemon/${id}]`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Pokémon details' },
      { status: 500 },
    );
  }
}
