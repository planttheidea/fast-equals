function areRegExpsEqualStandard(a: RegExp, b: RegExp) {
  return a.source === b.source && a.flags === b.flags;
}

function areRegExpsEqualFallback(a: RegExp, b: RegExp) {
  return (
    a.source === b.source &&
    a.global === b.global &&
    a.ignoreCase === b.ignoreCase &&
    a.multiline === b.multiline &&
    a.unicode === b.unicode &&
    a.sticky === b.sticky &&
    a.lastIndex === b.lastIndex
  );
}

export const areRegExpsEqual =
  /foo/g.flags === "g" ? areRegExpsEqualStandard : areRegExpsEqualFallback;
