import type { HeadacheEntry } from '../types';
import { supabase } from './supabase';

const TABLE = 'headache_entries';
const QUEUE_KEY = 'diario-cefaleas:pending-ops';

export type PendingOp =
  | { kind: 'upsert'; entry: HeadacheEntry; ts: number }
  | { kind: 'delete'; date: string; ts: number };

function readQueue(): PendingOp[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PendingOp[];
  } catch {
    return [];
  }
}

function writeQueue(ops: PendingOp[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(ops));
}

/**
 * Colapsa operaciones por fecha: si hay varias para el mismo `date`,
 * solo la última cuenta. Mantiene el orden temporal por `ts`.
 */
function dedupe(ops: PendingOp[]): PendingOp[] {
  const byDate = new Map<string, PendingOp>();
  for (const op of ops) {
    const key = op.kind === 'upsert' ? op.entry.date : op.date;
    byDate.set(key, op);
  }
  return [...byDate.values()].sort((a, b) => a.ts - b.ts);
}

export type PendingOpInput =
  | { kind: 'upsert'; entry: HeadacheEntry }
  | { kind: 'delete'; date: string };

export function enqueue(op: PendingOpInput): void {
  const ops = readQueue();
  ops.push({ ...op, ts: Date.now() } as PendingOp);
  writeQueue(dedupe(ops));
}

export function getPendingCount(): number {
  return readQueue().length;
}

/**
 * Intenta vaciar la cola contra Supabase. Devuelve el nº de ops pendientes
 * tras el intento (0 = todo sincronizado). Se detiene en el primer fallo
 * de red para reintentar en la próxima ocasión.
 */
export async function flushQueue(): Promise<number> {
  if (!supabase) return 0;
  const ops = readQueue();
  if (ops.length === 0) return 0;

  const remaining: PendingOp[] = [];
  let failed = false;

  for (const op of ops) {
    if (failed) {
      remaining.push(op);
      continue;
    }
    try {
      if (op.kind === 'upsert') {
        const { error } = await supabase
          .from(TABLE)
          .upsert(op.entry, { onConflict: 'date' });
        if (error) throw error;
      } else {
        const { error } = await supabase.from(TABLE).delete().eq('date', op.date);
        if (error) throw error;
      }
    } catch {
      failed = true;
      remaining.push(op);
    }
  }

  writeQueue(remaining);
  return remaining.length;
}
