import type { HeadacheEntry } from '../types';
import { DIAS_SEMANA, MESES, buildMonthMatrix, isSameDay, toISODate } from '../utils/date';
import { DayCell } from './DayCell';

interface Props {
  year: number;
  month: number; // 0-11
  entries: Record<string, HeadacheEntry>;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onSelectDate: (iso: string) => void;
}

export function Calendar({ year, month, entries, onPrev, onNext, onToday, onSelectDate }: Props) {
  const days = buildMonthMatrix(year, month);
  const today = new Date();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
          {MESES[month]} <span className="text-slate-500 font-normal">{year}</span>
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            aria-label="Mes anterior"
          >
            ←
          </button>
          <button
            type="button"
            onClick={onToday}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={onNext}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            aria-label="Mes siguiente"
          >
            →
          </button>
        </div>
      </header>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] sm:text-xs font-medium uppercase tracking-wide text-slate-500">
        {DIAS_SEMANA.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const iso = toISODate(d);
          return (
            <DayCell
              key={iso}
              date={d}
              inCurrentMonth={d.getMonth() === month}
              isToday={isSameDay(d, today)}
              entry={entries[iso]}
              onClick={() => onSelectDate(iso)}
            />
          );
        })}
      </div>

      <Legend />
    </section>
  );
}

function Legend() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-600">
      <LegendDot color="bg-emerald-500" label="Leve (1-3)" />
      <LegendDot color="bg-amber-500" label="Moderado (4-6)" />
      <LegendDot color="bg-red-500" label="Intenso (7-10)" />
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
