import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { getRepository } from '@/application/container';
import type { PokemonType } from '@/domain/entities/Pokemon';

export const runtime = 'nodejs';
export const revalidate = 3600;

const W = 1200;
const H = 630;

const TYPE_COLORS: Record<PokemonType, { accent: string; light: string; badge: string }> = {
  normal: { accent: '#6b7280', light: '#f3f4f6', badge: '#6b7280' },
  fire: { accent: '#f97316', light: '#fff7ed', badge: '#ea580c' },
  water: { accent: '#3b82f6', light: '#eff6ff', badge: '#2563eb' },
  electric: { accent: '#eab308', light: '#fefce8', badge: '#ca8a04' },
  grass: { accent: '#22c55e', light: '#f0fdf4', badge: '#16a34a' },
  ice: { accent: '#06b6d4', light: '#ecfeff', badge: '#0891b2' },
  fighting: { accent: '#dc2626', light: '#fef2f2', badge: '#b91c1c' },
  poison: { accent: '#a855f7', light: '#faf5ff', badge: '#9333ea' },
  ground: { accent: '#d97706', light: '#fffbeb', badge: '#b45309' },
  flying: { accent: '#818cf8', light: '#eef2ff', badge: '#6366f1' },
  psychic: { accent: '#ec4899', light: '#fdf2f8', badge: '#db2777' },
  bug: { accent: '#84cc16', light: '#f7fee7', badge: '#65a30d' },
  rock: { accent: '#92400e', light: '#fef3c7', badge: '#78350f' },
  ghost: { accent: '#7c3aed', light: '#f5f3ff', badge: '#6d28d9' },
  dragon: { accent: '#4f46e5', light: '#eef2ff', badge: '#4338ca' },
  dark: { accent: '#374151', light: '#f9fafb', badge: '#1f2937' },
  steel: { accent: '#64748b', light: '#f8fafc', badge: '#475569' },
  fairy: { accent: '#ec4899', light: '#fdf2f8', badge: '#db2777' },
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = parseInt(id, 10);

  if (!Number.isFinite(numericId) || numericId < 1) {
    return new Response('Not found', { status: 404 });
  }

  const repository = getRepository();
  const pokemon = await repository.findById(numericId).catch(() => null);

  if (!pokemon) {
    return new Response('Not found', { status: 404 });
  }

  const bst = Object.values(pokemon.stats).reduce((s, v) => s + v, 0);
  const primaryType = pokemon.types[0];
  const colors = TYPE_COLORS[primaryType] ?? TYPE_COLORS.normal;
  const paddedId = String(pokemon.id).padStart(3, '0');
  const nameFontSize =
    pokemon.displayName.length > 10 ? 58 : pokemon.displayName.length > 8 ? 68 : 80;

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: W,
        height: H,
        background: '#fafaf9',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Left: info panel */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 56px',
          width: 630,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 18,
            fontWeight: 700,
            color: colors.accent,
            letterSpacing: 3,
            marginBottom: 12,
          }}
        >
          #{paddedId}
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: nameFontSize,
            fontWeight: 900,
            color: '#1c1917',
            lineHeight: 1,
            marginBottom: 24,
          }}
        >
          {pokemon.displayName}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 36 }}>
          {pokemon.types.map((type) => (
            <div
              key={type}
              style={{
                display: 'flex',
                background: TYPE_COLORS[type]?.badge ?? colors.badge,
                color: 'white',
                borderRadius: 100,
                padding: '8px 24px',
                fontSize: 18,
                fontWeight: 700,
                textTransform: 'capitalize',
              }}
            >
              {type}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 13,
              fontWeight: 700,
              color: '#a8a29e',
              letterSpacing: 2,
            }}
          >
            BASE STAT TOTAL
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 56,
              fontWeight: 800,
              color: colors.accent,
              lineHeight: 1,
            }}
          >
            {bst}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 40,
            fontSize: 15,
            fontWeight: 600,
            color: '#d6d3d1',
            letterSpacing: 1,
          }}
        >
          PokéDex
        </div>
      </div>

      {/* Right: artwork panel */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          background: `radial-gradient(circle at 50% 48%, ${colors.light} 0%, #fafaf9 72%)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pokemon.artwork}
          width={360}
          height={360}
          alt=""
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>,
    { width: W, height: H },
  );
}
