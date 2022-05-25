export function areRegExpsEqual(a: RegExp, b: RegExp) {
  return a.source === b.source && a.flags === b.flags;
}
