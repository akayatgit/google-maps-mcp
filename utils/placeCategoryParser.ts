/**
 * Parses optional `placeCategories` JSON from the model reply and strips it from chat display text.
 */

import type { PlaceCategoriesPayload, PlaceCategoryTab } from '../types.js';

function sanitizeCategories(
  raw: unknown,
  placeCount: number,
): PlaceCategoriesPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as { placeCategories?: unknown };
  const arr = obj.placeCategories;
  if (!Array.isArray(arr) || arr.length === 0) return null;

  const categories: PlaceCategoryTab[] = [];
  for (const item of arr) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const id = typeof row.id === 'string' && row.id.trim() ? row.id.trim() : null;
    const label = typeof row.label === 'string' && row.label.trim() ? row.label.trim() : null;
    const indicesRaw = row.placeIndices;
    if (!id || !label || !Array.isArray(indicesRaw)) continue;

    const placeIndices: number[] = [];
    for (const v of indicesRaw) {
      const n = typeof v === 'number' ? v : parseInt(String(v), 10);
      if (!Number.isInteger(n) || n < 0 || n >= placeCount) continue;
      if (!placeIndices.includes(n)) placeIndices.push(n);
    }
    if (placeIndices.length === 0) continue;
    categories.push({ id, label, placeIndices });
  }

  return categories.length > 0 ? { categories } : null;
}

export function buildFallbackPlaceCategories(placeCount: number): PlaceCategoriesPayload {
  return {
    categories: [
      {
        id: 'all',
        label: 'Places',
        placeIndices: Array.from({ length: placeCount }, (_, i) => i),
      },
    ],
  };
}

/**
 * Extract JSON with `placeCategories` from the end of the model message (fenced or raw) and return cleaned text.
 */
function extractTrailingFencedJson(text: string): { jsonStr: string; before: string } | null {
  const trimmed = text.trimEnd();
  const fenceJson = trimmed.lastIndexOf('```json');
  const fencePlain = trimmed.lastIndexOf('```');
  const start =
    fenceJson !== -1
      ? fenceJson
      : fencePlain !== -1 && trimmed.slice(fencePlain).match(/^```\s*\{/)
        ? fencePlain
        : -1;
  if (start === -1) {
    return null;
  }
  const nl = trimmed.indexOf('\n', start);
  if (nl === -1) {
    return null;
  }
  const contentStart = nl + 1;
  const endFence = trimmed.indexOf('```', contentStart);
  if (endFence === -1) {
    return null;
  }
  const jsonStr = trimmed.slice(contentStart, endFence).trim();
  const before = trimmed.slice(0, start).trimEnd();
  return { jsonStr, before };
}

export function parsePlaceCategoriesFromModelText(
  text: string,
  placeCount: number,
): { payload: PlaceCategoriesPayload | null; displayText: string } {
  if (!text || placeCount <= 0) {
    return { payload: null, displayText: text };
  }

  let trimmed = text.trimEnd();
  let jsonStr: string | null = null;

  const fenced = extractTrailingFencedJson(text);
  if (fenced && fenced.jsonStr.includes('"placeCategories"')) {
    jsonStr = fenced.jsonStr;
    trimmed = fenced.before;
  }

  if (!jsonStr) {
    const rawTail = trimmed.match(
      /\{[\s\n\r\t]*"placeCategories"[\s\S]*\}\s*$/,
    );
    if (rawTail) {
      jsonStr = rawTail[0].trim();
      trimmed = trimmed.slice(0, trimmed.length - rawTail[0].length).trimEnd();
    }
  }

  if (!jsonStr) {
    return { payload: null, displayText: text };
  }

  try {
    const parsed = JSON.parse(jsonStr) as unknown;
    const payload = sanitizeCategories(parsed, placeCount);
    return {
      payload,
      displayText: trimmed,
    };
  } catch {
    return { payload: null, displayText: text };
  }
}
