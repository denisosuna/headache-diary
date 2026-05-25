import { useCallback, useEffect, useMemo, useState } from 'react';
import type { HeadacheEntry } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { enqueue, flushQueue, getPendingCount } from '../lib/syncQueue';
import { groupByDate } from '../utils/entries';

const STORAGE_KEY = 'diario-cefaleas:entries';
const TABLE = 'headache_entries';

function readLocal(): HeadacheEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return parsed as HeadacheEntry[];
  } catch {
    return [];
  }
}

function writeLocal(entries: HeadacheEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export interface UseEntries {
  entries: HeadacheEntry[];
  entriesByDate: Record<string, HeadacheEntry[]>;
  loading: boolean;
  error: string | null;
  saveEntry: (entry: HeadacheEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  backend: 'supabase' | 'localStorage';
  online: boolean;
  pendingCount: number;
}

export function useEntries(): UseEntries {
  const [entries, setEntries] = useState<HeadacheEntry[]>(() => readLocal());
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine
  );
  const [pendingCount, setPendingCount] = useState(() => getPendingCount());

  const backend: 'supabase' | 'localStorage' = isSupabaseConfigured
    ? 'supabase'
    : 'localStorage';

  // Persistir mirror local en cada cambio.
  useEffect(() => {
    writeLocal(entries);
  }, [entries]);

  const syncWithServer = useCallback(async () => {
    if (!supabase) return;
    try {
      const remaining = await flushQueue();
      setPendingCount(remaining);
      const { data, error: err } = await supabase
        .from(TABLE)
        .select('*')
        .order('date', { ascending: false });
      if (err) throw err;
      const rows: HeadacheEntry[] = (data ?? []).map((row) => ({
        id: row.id,
        date: row.date,
        hora: row.hora ?? undefined,
        intensidad: row.intensidad,
        tipo: row.tipo,
        zona: row.zona,
        desencadenantes: row.desencadenantes ?? [],
        notas: row.notas ?? '',
      }));
      setEntries(rows);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      setError(msg);
    }
  }, []);

  // Carga inicial.
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    syncWithServer().finally(() => setLoading(false));
  }, [syncWithServer]);

  // Online / offline / focus.
  useEffect(() => {
    function handleOnline() {
      setOnline(true);
      if (supabase) syncWithServer();
    }
    function handleOffline() {
      setOnline(false);
    }
    function handleFocus() {
      setPendingCount(getPendingCount());
      if (supabase && navigator.onLine) syncWithServer();
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleFocus);
    };
  }, [syncWithServer]);

  const saveEntry = useCallback(async (entry: HeadacheEntry) => {
    setError(null);
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === entry.id);
      if (idx === -1) return [...prev, entry];
      const next = prev.slice();
      next[idx] = entry;
      return next;
    });
    if (!supabase) return;
    enqueue({ kind: 'upsert', entry });
    const remaining = await flushQueue();
    setPendingCount(remaining);
    if (remaining > 0) {
      setError('Sin conexión: se sincronizará cuando vuelva la red.');
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    setError(null);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (!supabase) return;
    enqueue({ kind: 'delete', id });
    const remaining = await flushQueue();
    setPendingCount(remaining);
    if (remaining > 0) {
      setError('Sin conexión: se sincronizará cuando vuelva la red.');
    }
  }, []);

  const entriesByDate = useMemo(() => groupByDate(entries), [entries]);

  return {
    entries,
    entriesByDate,
    loading,
    error,
    saveEntry,
    deleteEntry,
    backend,
    online,
    pendingCount,
  };
}
