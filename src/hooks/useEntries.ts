import { useCallback, useEffect, useState } from 'react';
import type { HeadacheEntry } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'diario-cefaleas:entries';
const TABLE = 'headache_entries';

function readLocal(): Record<string, HeadacheEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, HeadacheEntry>;
  } catch {
    return {};
  }
}

function writeLocal(entries: Record<string, HeadacheEntry>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export interface UseEntries {
  entries: Record<string, HeadacheEntry>;
  loading: boolean;
  error: string | null;
  saveEntry: (entry: HeadacheEntry) => Promise<void>;
  deleteEntry: (date: string) => Promise<void>;
  backend: 'supabase' | 'localStorage';
}

export function useEntries(): UseEntries {
  const [entries, setEntries] = useState<Record<string, HeadacheEntry>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backend: 'supabase' | 'localStorage' = isSupabaseConfigured
    ? 'supabase'
    : 'localStorage';

  // Carga inicial
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (supabase) {
          const { data, error: err } = await supabase
            .from(TABLE)
            .select('*')
            .order('date', { ascending: false });
          if (err) throw err;
          const map: Record<string, HeadacheEntry> = {};
          for (const row of data ?? []) {
            map[row.date] = {
              date: row.date,
              intensidad: row.intensidad,
              tipo: row.tipo,
              zona: row.zona,
              desencadenantes: row.desencadenantes ?? [],
              notas: row.notas ?? '',
            };
          }
          if (!cancelled) setEntries(map);
        } else {
          if (!cancelled) setEntries(readLocal());
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error desconocido';
        if (!cancelled) {
          setError(msg);
          // Fallback a local si Supabase falla en runtime
          setEntries(readLocal());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveEntry = useCallback(async (entry: HeadacheEntry) => {
    setError(null);
    // Optimistic update
    setEntries((prev) => {
      const next = { ...prev, [entry.date]: entry };
      if (!supabase) writeLocal(next);
      return next;
    });
    if (supabase) {
      const { error: err } = await supabase
        .from(TABLE)
        .upsert(entry, { onConflict: 'date' });
      if (err) {
        setError(err.message);
        throw err;
      }
    }
  }, []);

  const deleteEntry = useCallback(async (date: string) => {
    setError(null);
    setEntries((prev) => {
      const next = { ...prev };
      delete next[date];
      if (!supabase) writeLocal(next);
      return next;
    });
    if (supabase) {
      const { error: err } = await supabase.from(TABLE).delete().eq('date', date);
      if (err) {
        setError(err.message);
        throw err;
      }
    }
  }, []);

  return { entries, loading, error, saveEntry, deleteEntry, backend };
}
