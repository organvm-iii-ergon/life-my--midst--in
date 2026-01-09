import type { Mask } from "@in-midst-my-life/schema";

const normalize = (value: string) => value.trim().toLowerCase();

export const obfuscateDateString = (value?: string): string | undefined => {
  if (!value) return value;
  const yearMatch = value.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? yearMatch[0] : value;
};

export const shouldRedactEntity = (
  entity: { id: string; tags?: string[] },
  mask?: Mask
): boolean => {
  if (!mask?.redaction) return false;
  const { private_tags: privateTags, excluded_entities: excludedEntities } = mask.redaction;
  if (excludedEntities?.includes(entity.id)) return true;
  if (!privateTags?.length) return false;
  const tagSet = new Set((entity.tags ?? []).map(normalize));
  return privateTags.some((tag) => tagSet.has(normalize(tag)));
};

export const applyMaskRedaction = <T extends { id: string; tags?: string[] }>(
  items: T[],
  mask?: Mask,
  options?: { dateKeys?: Array<keyof T> }
): T[] => {
  if (!mask?.redaction) return items;
  const filtered = items.filter((item) => !shouldRedactEntity(item, mask));
  if (!mask.redaction.obfuscate_dates || !options?.dateKeys?.length) {
    return filtered;
  }
  return filtered.map((item) => {
    const next = { ...item } as T;
    options.dateKeys?.forEach((key) => {
      const value = next[key];
      if (typeof value === "string") {
        (next as Record<keyof T, unknown>)[key] = obfuscateDateString(value);
      }
    });
    return next;
  });
};
