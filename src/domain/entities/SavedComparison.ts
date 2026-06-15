export interface SavedComparison {
  readonly id: string;
  readonly name: string | null;
  readonly slotA: number | null;
  readonly slotB: number | null;
  readonly slotC: number | null;
  readonly createdAt: Date;
}
