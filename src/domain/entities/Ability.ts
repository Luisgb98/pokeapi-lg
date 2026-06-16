export interface Ability {
  /** PokeAPI slug. */
  readonly name: string;
  /** Localized name (falls back to English, then formatted slug). */
  readonly displayName: string;
  /** Localized short effect text; empty string when unavailable. */
  readonly effect: string;
  readonly isHidden: boolean;
}
