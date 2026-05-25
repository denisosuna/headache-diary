import { useMemo, useState } from 'react';
import { Calendar } from './components/Calendar';
import { DaySheet } from './components/DaySheet';
import { EntryList } from './components/EntryList';
import { EntryModal } from './components/EntryModal';
import { UpdateBanner } from './components/UpdateBanner';
import { useEntries } from './hooks/useEntries';
import type { HeadacheEntry } from './types';
import { downloadCSV, entriesToCSV } from './utils/csv';
import { MESES, parseISODate } from './utils/date';
import { compareEntriesDesc } from './utils/entries';

interface EditTarget {
  date: string;
  entry?: HeadacheEntry;
}

export default function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [daySheetDate, setDaySheetDate] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  const {
    entries,
    entriesByDate,
    loading,
    error,
    saveEntry,
    deleteEntry,
    backend,
    online,
    pendingCount,
  } = useEntries();

  function shiftMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  function goToday() {
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(n.getMonth());
  }

  function handleSelectDate(iso: string) {
    const dayEntries = entriesByDate[iso] ?? [];
    if (dayEntries.length === 0) {
      setEditTarget({ date: iso });
    } else {
      setDaySheetDate(iso);
    }
  }

  const monthEntries = useMemo(() => {
    return entries
      .filter((e) => {
        const d = parseISODate(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .sort(compareEntriesDesc);
  }, [entries, year, month]);

  function handleExport() {
    if (entries.length === 0) {
      alert('No hay entradas para exportar.');
      return;
    }
    const csv = entriesToCSV(entries);
    downloadCSV(`diario-cefaleas-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Diario de Cefaleas</h1>
            <p className="text-xs text-slate-500">
              Registra tus episodios y consulta patrones a lo largo del tiempo.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Exportar CSV
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        <Calendar
          year={year}
          month={month}
          entriesByDate={entriesByDate}
          onPrev={() => shiftMonth(-1)}
          onNext={() => shiftMonth(1)}
          onToday={goToday}
          onSelectDate={handleSelectDate}
        />

        {loading ? (
          <p className="text-sm text-slate-500">Cargando entradas…</p>
        ) : (
          <EntryList
            entries={monthEntries}
            onSelect={(entry) => setEditTarget({ date: entry.date, entry })}
          />
        )}

        <footer className="pt-4 text-center text-xs text-slate-400">
          {MESES[month]} {year} · Almacenamiento:{' '}
          <span className="font-medium text-slate-500">
            {backend === 'supabase' ? 'Supabase' : 'localStorage'}
          </span>
          {backend === 'supabase' && (
            <>
              {' · '}
              <span className={online ? 'text-emerald-600' : 'text-amber-600'}>
                {online ? 'En línea' : 'Sin conexión'}
              </span>
              {pendingCount > 0 && (
                <>
                  {' · '}
                  <span className="text-amber-600">
                    {pendingCount} cambio{pendingCount === 1 ? '' : 's'} por sincronizar
                  </span>
                </>
              )}
            </>
          )}
        </footer>
      </main>

      {daySheetDate && !editTarget && (
        <DaySheet
          date={daySheetDate}
          entries={entriesByDate[daySheetDate] ?? []}
          onClose={() => setDaySheetDate(null)}
          onAdd={() => setEditTarget({ date: daySheetDate })}
          onEdit={(entry) => setEditTarget({ date: entry.date, entry })}
        />
      )}

      {editTarget && (
        <EntryModal
          date={editTarget.date}
          existing={editTarget.entry}
          onClose={() => setEditTarget(null)}
          onSave={saveEntry}
          onDelete={deleteEntry}
        />
      )}

      <UpdateBanner />
    </div>
  );
}
