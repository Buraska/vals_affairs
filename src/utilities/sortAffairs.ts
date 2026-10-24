/** Sorts archived affairs after active ones, then applies the requested ordering. */
export function sortAffairs<T extends { archived?: boolean | null }>(
  affairs: readonly T[],
  compare?: (a: T, b: T) => number,
): T[] {
  return [...affairs].sort((a, b) => {
    const archivedOrder = Number(a.archived === true) - Number(b.archived === true)
    return archivedOrder || compare?.(a, b) || 0
  })
}
