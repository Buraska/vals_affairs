/** Sorts archived affairs after active ones, then applies the requested ordering. */
export function sortAffairs<T extends { archived?: boolean | null }>(
  affairs: readonly T[],
  compare?: (a: T, b: T) => number,
  isArchived: (affair: T) => boolean = (affair) => affair.archived === true,
): T[] {
  return [...affairs].sort((a, b) => {
    const archivedOrder = Number(isArchived(a)) - Number(isArchived(b))
    return archivedOrder || compare?.(a, b) || 0
  })
}
