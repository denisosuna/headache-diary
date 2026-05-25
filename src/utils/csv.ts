import type { HeadacheEntry } from '../types';
import { INTENSIDAD_META } from '../types';

function escape(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function entriesToCSV(entries: HeadacheEntry[]): string {
  const header = ['Fecha', 'Hora', 'Intensidad', 'Tipo', 'Zona', 'Desencadenantes', 'Notas'];
  const rows = entries
    .slice()
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.hora ?? '').localeCompare(b.hora ?? '');
    })
    .map((e) =>
      [
        e.date,
        e.hora ?? '',
        INTENSIDAD_META[e.intensidad].label,
        e.tipo,
        e.zona,
        e.desencadenantes.join('; '),
        e.notas.replace(/\r?\n/g, ' '),
      ]
        .map(escape)
        .join(',')
    );
  return [header.join(','), ...rows].join('\n');
}

export function downloadCSV(filename: string, csv: string): void {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
