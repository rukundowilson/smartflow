export function formatPrefixedId(prefix: string, id: number, pad: number = 3): string {
  return `${prefix}${String(id).padStart(pad, "0")}`;
}

export function extractId(prefixedId: string, prefix: string): number {
  return parseInt(prefixedId.replace(prefix, ""), 10);
}
