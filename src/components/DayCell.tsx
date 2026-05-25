import type { HeadacheEntry } from '../types';
import { INTENSIDAD_META } from '../types';
import { maxIntensidad } from '../utils/entries';

interface Props {
  date: Date;
  inCurrentMonth: boolean;
  isToday: boolean;
  entries: HeadacheEntry[];
  onClick: () => void;
}

export function DayCell({ date, inCurrentMonth, isToday, entries, onClick }: Props) {
  const max = maxIntensidad(entries);
  const meta = max ? INTENSIDAD_META[max] : null;
  const count = entries.length;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group relative flex h-16 sm:h-20 flex-col items-start justify-start rounded-lg border p-1.5 text-left transition',
        'hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400',
        inCurrentMonth ? 'border-slate-200 bg-white' : 'border-transparent bg-slate-50/50 text-slate-400',
        isToday ? 'ring-2 ring-slate-900 ring-offset-1' : '',
      ].join(' ')}
      aria-label={`Día ${date.getDate()}${count ? `, ${count} entrada${count === 1 ? '' : 's'}` : ''}`}
    >
      <span
        className={[
          'text-xs sm:text-sm font-medium',
          isToday ? 'text-slate-900' : '',
        ].join(' ')}
      >
        {date.getDate()}
      </span>
      {meta && (
        <span className="mt-auto flex items-center gap-1">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${meta.dot}`}
            title={meta.label}
          />
          {count > 1 && (
            <span className="rounded-full bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
              {count}
            </span>
          )}
        </span>
      )}
    </button>
  );
}
