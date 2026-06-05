export interface EvolutionNode {
  readonly id: number;
  readonly name: string;
  readonly displayName: string;
  readonly sprite: string;
  readonly evolvesTo: readonly EvolutionNode[];
}

export interface EvolutionChain {
  readonly id: number;
  readonly chain: EvolutionNode;
}

/** Flattens the recursive evolution tree into a flat list of IDs. */
export function flattenChainIds(node: EvolutionNode): number[] {
  return [node.id, ...node.evolvesTo.flatMap(flattenChainIds)];
}

/** Flattens the recursive evolution tree into a flat list of names. */
export function flattenChainNames(node: EvolutionNode): string[] {
  return [node.name, ...node.evolvesTo.flatMap(flattenChainNames)];
}
