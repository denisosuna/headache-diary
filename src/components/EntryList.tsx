import type { HeadacheEntry } from '../types';
import { INTENSIDAD_META } from '../types';
import { formatLargo } from '../utils/date';

interface Props {
  entries: HeadacheEntry[];
  onSelect: (entry: HeadacheEntry) => void;
}

export function EntryList({ entries, onSelect }: Props) {
  if (entries.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        No hay entradas este mes. Pulsa cualquier día del calendario para registrar una.
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Entradas del mes
      </h2>
      <ul className="space-y-2">
        {entries.map((e) => {
          const meta = INTENSIDAD_META[e.intensidad];
          return (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => onSelect(e)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${meta.badge}`}
                  >
                    <span className={`inline-block h-2 w-2 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {formatLargo(e.date)}
                  </span>
                  {e.hora && (
                    <span className="font-mono text-xs text-slate-500">· {e.hora}</span>
                  )}
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs text-slate-600">{e.tipo}</span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs text-slate-600">{e.zona}</span>
                </div>

                {e.desencadenantes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {e.desencadenantes.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {e.notas && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{e.notas}</p>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
