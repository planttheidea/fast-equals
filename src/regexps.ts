/**
 * Whether the regexps passed are equal in value.
 *
 * @NOTE
 * This is a standalone function instead of done inline in the comparator
 * to allow for overrides in case supporting a pre-ES2015 environment where
 * `flags` is not available.
 */
export function areRegExpsEqual(a: RegExp, b: RegExp) {
  return a.source === b.source && a.flags === b.flags;
}
