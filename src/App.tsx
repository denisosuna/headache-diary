import { useMemo, useState } from 'react';
import { Calendar } from './components/Calendar';
import { EntryList } from './components/EntryList';
import { EntryModal } from './components/EntryModal';
import { useEntries } from './hooks/useEntries';
import { downloadCSV, entriesToCSV } from './utils/csv';
import { MESES, parseISODate } from './utils/date';

export default function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { entries, loading, error, saveEntry, deleteEntry, backend } = useEntries();

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

  const monthEntries = useMemo(() => {
    return Object.values(entries)
      .filter((e) => {
        const d = parseISODate(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, year, month]);

  function handleExport() {
    const all = Object.values(entries);
    if (all.length === 0) {
      alert('No hay entradas para exportar.');
      return;
    }
    const csv = entriesToCSV(all);
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
            No se pudo sincronizar con Supabase ({error}). Usando almacenamiento local.
          </div>
        )}

        <Calendar
          year={year}
          month={month}
          entries={entries}
          onPrev={() => shiftMonth(-1)}
          onNext={() => shiftMonth(1)}
          onToday={goToday}
          onSelectDate={(iso) => setSelectedDate(iso)}
        />

        {loading ? (
          <p className="text-sm text-slate-500">Cargando entradas…</p>
        ) : (
          <EntryList entries={monthEntries} onSelect={(iso) => setSelectedDate(iso)} />
        )}

        <footer className="pt-4 text-center text-xs text-slate-400">
          {MESES[month]} {year} · Almacenamiento:{' '}
          <span className="font-medium text-slate-500">
            {backend === 'supabase' ? 'Supabase' : 'localStorage'}
          </span>
        </footer>
      </main>

      {selectedDate && (
        <EntryModal
          date={selectedDate}
          existing={entries[selectedDate]}
          onClose={() => setSelectedDate(null)}
          onSave={saveEntry}
          onDelete={deleteEntry}
        />
      )}
    </div>
  );
}
