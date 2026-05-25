import { useEffect } from 'react';
import type { HeadacheEntry } from '../types';
import { INTENSIDAD_META } from '../types';
import { formatLargo } from '../utils/date';
import { compareEntries } from '../utils/entries';

interface Props {
  date: string;
  entries: HeadacheEntry[];
  onClose: () => void;
  onAdd: () => void;
  onEdit: (entry: HeadacheEntry) => void;
}

export function DaySheet({ date, entries, onClose, onAdd, onEdit }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const ordered = entries.slice().sort(compareEntries);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {entries.length} episodio{entries.length === 1 ? '' : 's'}
            </p>
            <h3 className="text-base font-semibold text-slate-900">{formatLargo(date)}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        <ul className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
          {ordered.map((e) => {
            const meta = INTENSIDAD_META[e.intensidad];
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onEdit(e)}
                  className="flex w-full items-start gap-3 px-5 py-3 text-left transition hover:bg-slate-50"
                >
                  <span
                    className={`mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      {e.hora && (
                        <span className="font-mono text-sm font-medium text-slate-900">
                          {e.hora}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${meta.badge}`}
                      >
                        {meta.label}
                      </span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-sm text-slate-700">{e.tipo}</span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-sm text-slate-700">{e.zona}</span>
                    </div>
                    {e.desencadenantes.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {e.desencadenantes.map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {e.notas && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">{e.notas}</p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <footer className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Añadir episodio
          </button>
        </footer>
      </div>
    </div>
  );
}
