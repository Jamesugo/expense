import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isToday, isSameMonth } from 'date-fns';
import { getMonthlyCalendar } from '../../api/index.js';
import { buildCalendarGrid, formatMonthYear } from '../../utils/dateHelpers.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import DayModal from './DayModal.jsx';
import { CalendarSkeleton } from '../ui/Skeleton.jsx';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MiniCalendar({ currency = 'USD' }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [totalsMap, setTotalsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const ym = `${year}-${String(month).padStart(2, '0')}`;
      const { data } = await getMonthlyCalendar(ym);
      setTotalsMap(data.data || {});
    } catch {
      setTotalsMap({});
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchCalendar();
    window.addEventListener('expense-updated', fetchCalendar);
    return () => window.removeEventListener('expense-updated', fetchCalendar);
  }, [fetchCalendar]);

  const navigate = (dir) => {
    if (dir === -1 && month === 1) { setMonth(12); setYear((y) => y - 1); }
    else if (dir === 1 && month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + dir);
  };

  const weeks = buildCalendarGrid(year, month);
  const currentMonth = new Date(year, month - 1, 1);

  return (
    <>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {formatMonthYear(year, month)}
          </h3>
          <div className="flex gap-1">
            <button onClick={() => navigate(-1)} className="btn-ghost p-1.5"><ChevronLeft size={15} /></button>
            <button onClick={() => navigate(1)} className="btn-ghost p-1.5"><ChevronRight size={15} /></button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <CalendarSkeleton />
        ) : (
          <div className="space-y-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((day, di) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const inMonth = isSameMonth(day, currentMonth);
                  const today = isToday(day);
                  const info = totalsMap[dateStr];
                  const hasExpenses = info && info.total > 0;

                  return (
                    <button
                      key={di}
                      onClick={() => inMonth && setSelectedDate(dateStr)}
                      disabled={!inMonth}
                      className={`
                        relative flex flex-col items-center justify-center rounded-lg p-1 min-h-[44px] text-xs transition-all duration-150
                        ${!inMonth ? 'opacity-25 cursor-default' : 'hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer'}
                        ${today ? 'bg-primary-500 text-white hover:bg-primary-600 dark:hover:bg-primary-500' : ''}
                        ${!today && inMonth ? 'text-slate-700 dark:text-slate-300' : ''}
                      `}
                    >
                      <span className="font-medium leading-none">{format(day, 'd')}</span>
                      {inMonth && hasExpenses && (
                        <span className={`text-[9px] leading-none mt-0.5 font-medium ${today ? 'text-blue-100' : 'text-primary-500 dark:text-primary-400'}`}>
                          {formatCurrency(info.total, currency, { maximumFractionDigits: 0 })}
                        </span>
                      )}
                      {inMonth && !hasExpenses && (
                        <span className={`text-[9px] leading-none mt-0.5 ${today ? 'text-blue-200' : 'text-slate-300 dark:text-slate-600'}`}>
                          $0
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <DayModal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        date={selectedDate}
        onUpdate={fetchCalendar}
      />
    </>
  );
}
