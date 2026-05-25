import { useCallback, useEffect, useState } from 'react';
import type { HeadacheEntry } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { enqueue, flushQueue, getPendingCount } from '../lib/syncQueue';

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
  online: boolean;
  pendingCount: number;
}

export function useEntries(): UseEntries {
  // Mirror local: render inmediato y soporte offline incluso con Supabase activo.
  const [entries, setEntries] = useState<Record<string, HeadacheEntry>>(() => readLocal());
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine
  );
  const [pendingCount, setPendingCount] = useState(() => getPendingCount());

  const backend: 'supabase' | 'localStorage' = isSupabaseConfigured
    ? 'supabase'
    : 'localStorage';

  // Persiste el mirror cada vez que cambien las entradas.
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
      setEntries(map);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      setError(msg);
    }
  }, []);

  // Carga inicial: si hay Supabase, intenta sincronizar; si no, ya tenemos local.
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    syncWithServer().finally(() => setLoading(false));
  }, [syncWithServer]);

  // Online/offline + focus → reintenta sincronización.
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
    setEntries((prev) => ({ ...prev, [entry.date]: entry }));
    if (!supabase) return;
    enqueue({ kind: 'upsert', entry });
    const remaining = await flushQueue();
    setPendingCount(remaining);
    if (remaining > 0) {
      setError('Sin conexión: se sincronizará cuando vuelva la red.');
    }
  }, []);

  const deleteEntry = useCallback(async (date: string) => {
    setError(null);
    setEntries((prev) => {
      const next = { ...prev };
      delete next[date];
      return next;
    });
    if (!supabase) return;
    enqueue({ kind: 'delete', date });
    const remaining = await flushQueue();
    setPendingCount(remaining);
    if (remaining > 0) {
      setError('Sin conexión: se sincronizará cuando vuelva la red.');
    }
  }, []);

  return {
    entries,
    loading,
    error,
    saveEntry,
    deleteEntry,
    backend,
    online,
    pendingCount,
  };
}
