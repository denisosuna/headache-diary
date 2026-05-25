import type { HeadacheEntry, Intensidad } from '../types';

const INTENSIDAD_ORDER: Record<Intensidad, number> = {
  leve: 1,
  moderado: 2,
  intenso: 3,
};

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback (entornos sin crypto.randomUUID)
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Devuelve las entradas agrupadas por fecha (YYYY-MM-DD). */
export function groupByDate(
  entries: HeadacheEntry[]
): Record<string, HeadacheEntry[]> {
  const map: Record<string, HeadacheEntry[]> = {};
  for (const e of entries) {
    (map[e.date] ??= []).push(e);
  }
  for (const k of Object.keys(map)) {
    map[k].sort(compareEntries);
  }
  return map;
}

/** Orden cronológico ascendente dentro de un día (sin hora va al final). */
export function compareEntries(a: HeadacheEntry, b: HeadacheEntry): number {
  const ha = a.hora ?? '99:99';
  const hb = b.hora ?? '99:99';
  return ha.localeCompare(hb);
}

/** Orden descendente para listas mensuales: por fecha desc y hora desc. */
export function compareEntriesDesc(a: HeadacheEntry, b: HeadacheEntry): number {
  if (a.date !== b.date) return b.date.localeCompare(a.date);
  const ha = a.hora ?? '';
  const hb = b.hora ?? '';
  return hb.localeCompare(ha);
}

export function maxIntensidad(entries: HeadacheEntry[]): Intensidad | null {
  if (entries.length === 0) return null;
  let max: Intensidad = entries[0].intensidad;
  for (const e of entries) {
    if (INTENSIDAD_ORDER[e.intensidad] > INTENSIDAD_ORDER[max]) {
      max = e.intensidad;
    }
  }
  return max;
}
