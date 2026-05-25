import type { HeadacheEntry } from '../types';
import { supabase } from './supabase';

const TABLE = 'headache_entries';
const QUEUE_KEY = 'diario-cefaleas:pending-ops';

export type PendingOp =
  | { kind: 'upsert'; entry: HeadacheEntry; ts: number }
  | { kind: 'delete'; id: string; ts: number };

export type PendingOpInput =
  | { kind: 'upsert'; entry: HeadacheEntry }
  | { kind: 'delete'; id: string };

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

/** Colapsa operaciones por id: solo la última cuenta. */
function dedupe(ops: PendingOp[]): PendingOp[] {
  const byId = new Map<string, PendingOp>();
  for (const op of ops) {
    const key = op.kind === 'upsert' ? op.entry.id : op.id;
    byId.set(key, op);
  }
  return [...byId.values()].sort((a, b) => a.ts - b.ts);
}

export function enqueue(op: PendingOpInput): void {
  const ops = readQueue();
  ops.push({ ...op, ts: Date.now() } as PendingOp);
  writeQueue(dedupe(ops));
}

export function getPendingCount(): number {
  return readQueue().length;
}

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
          .upsert(op.entry, { onConflict: 'id' });
        if (error) throw error;
      } else {
        const { error } = await supabase.from(TABLE).delete().eq('id', op.id);
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
