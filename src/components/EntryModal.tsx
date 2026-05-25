import { useEffect, useState } from 'react';
import type {
  Desencadenante,
  HeadacheEntry,
  Intensidad,
  TipoDolor,
  Zona,
} from '../types';
import {
  DESENCADENANTES,
  INTENSIDAD_META,
  TIPOS_DOLOR,
  TIPOS_DOLOR_DESC,
  ZONAS,
  ZONAS_DESC,
} from '../types';
import { formatLargo } from '../utils/date';

interface Props {
  date: string;
  existing?: HeadacheEntry;
  onClose: () => void;
  onSave: (entry: HeadacheEntry) => Promise<void> | void;
  onDelete: (date: string) => Promise<void> | void;
}

const DEFAULT: Omit<HeadacheEntry, 'date'> = {
  intensidad: 'moderado',
  tipo: 'Tensional',
  zona: 'Frente',
  desencadenantes: [],
  notas: '',
};

export function EntryModal({ date, existing, onClose, onSave, onDelete }: Props) {
  const [intensidad, setIntensidad] = useState<Intensidad>(
    existing?.intensidad ?? DEFAULT.intensidad
  );
  const [tipo, setTipo] = useState<TipoDolor>(existing?.tipo ?? DEFAULT.tipo);
  const [zona, setZona] = useState<Zona>(existing?.zona ?? DEFAULT.zona);
  const [desencadenantes, setDesencadenantes] = useState<Desencadenante[]>(
    existing?.desencadenantes ?? []
  );
  const [notas, setNotas] = useState(existing?.notas ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function toggleTrigger(t: Desencadenante) {
    setDesencadenantes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ date, intensidad, tipo, zona, desencadenantes, notas });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existing) return;
    if (!confirm('¿Eliminar esta entrada?')) return;
    setSaving(true);
    try {
      await onDelete(date);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4"
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
            <p className="text-xs uppercase tracking-wide text-slate-500">Entrada</p>
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

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 space-y-5">
          <Field label="Intensidad">
            <div className="flex gap-2">
              {(Object.keys(INTENSIDAD_META) as Intensidad[]).map((key) => {
                const meta = INTENSIDAD_META[key];
                const active = intensidad === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIntensidad(key)}
                    className={[
                      'flex-1 rounded-lg border px-3 py-2 text-sm transition',
                      active
                        ? `border-transparent ring-2 ${meta.ring} ${meta.badge}`
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${meta.dot}`} />
                    {meta.label}
                    <span className="ml-1 text-xs opacity-70">({meta.range})</span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Tipo de dolor" hint={TIPOS_DOLOR_DESC[tipo]}>
            <Select
              value={tipo}
              onChange={(v) => setTipo(v as TipoDolor)}
              options={TIPOS_DOLOR}
              descriptions={TIPOS_DOLOR_DESC}
            />
          </Field>

          <Field label="Zona" hint={ZONAS_DESC[zona]}>
            <Select
              value={zona}
              onChange={(v) => setZona(v as Zona)}
              options={ZONAS}
              descriptions={ZONAS_DESC}
            />
          </Field>

          <Field label="Desencadenantes">
            <div className="flex flex-wrap gap-2">
              {DESENCADENANTES.map((t) => {
                const active = desencadenantes.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTrigger(t)}
                    className={[
                      'rounded-full border px-3 py-1 text-xs transition',
                      active
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Notas">
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Medicación, duración, contexto..."
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-base sm:text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </Field>
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
          <div>
            {existing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                Eliminar
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs leading-snug text-slate-500">{hint}</p>}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  descriptions,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  descriptions?: Record<string, string>;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full min-h-[44px] appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-10 text-base sm:text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {descriptions?.[o] ? `${o} — ${descriptions[o]}` : o}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
