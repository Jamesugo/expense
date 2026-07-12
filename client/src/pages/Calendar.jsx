import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isToday, isSameMonth } from 'date-fns';
import { getMonthlyCalendar } from '../api/index.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { buildCalendarGrid, formatMonthYear } from '../utils/dateHelpers.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import DayModal from '../components/calendar/DayModal.jsx';
import { CalendarSkeleton } from '../components/ui/Skeleton.jsx';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Calendar() {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
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

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  const navigate = (dir) => {
    if (dir === -1 && month === 1) { setMonth(12); setYear((y) => y - 1); }
    else if (dir === 1 && month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + dir);
  };

  const goToToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1); };
  const weeks = buildCalendarGrid(year, month);
  const currentMonth = new Date(year, month - 1, 1);

  return (
    <div>
      <div className="page-header flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="page-title">Calendar</h2>
          <p className="page-subtitle">Click any day to view or add expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToToday} className="btn-secondary text-sm py-2">Today</button>
          <button onClick={() => navigate(-1)} className="btn-secondary p-2"><ChevronLeft size={16} /></button>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-[130px] text-center">
            {formatMonthYear(year, month)}
          </span>
          <button onClick={() => navigate(1)} className="btn-secondary p-2"><ChevronRight size={16} /></button>
        </div>
      </div>

      <motion.div
        className="card p-0 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-700/50">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 py-3">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="p-4"><CalendarSkeleton /></div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 divide-x divide-slate-100 dark:divide-slate-700/30">
                {week.map((day, di) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const inMonth = isSameMonth(day, currentMonth);
                  const today = isToday(day);
                  const info = totalsMap[dateStr];
                  const hasExpenses = info && info.total > 0;

                  return (
                    <motion.button
                      key={di}
                      onClick={() => inMonth && setSelectedDate(dateStr)}
                      disabled={!inMonth}
                      whileHover={inMonth ? { backgroundColor: 'rgba(59,130,246,0.04)' } : {}}
                      whileTap={inMonth ? { scale: 0.98 } : {}}
                      className={`
                        relative flex flex-col p-2 sm:p-3 min-h-[70px] sm:min-h-[90px] text-left transition-colors duration-150
                        ${!inMonth ? 'opacity-30 cursor-default bg-slate-50/50 dark:bg-slate-800/20' : 'cursor-pointer'}
                        ${today ? 'bg-primary-50/80 dark:bg-primary-900/20' : ''}
                      `}
                    >
                      {/* Day number */}
                      <span className={`
                        inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium leading-none mb-1.5
                        ${today ? 'bg-primary-500 text-white' : 'text-slate-600 dark:text-slate-400'}
                      `}>
                        {format(day, 'd')}
                      </span>

                      {/* Amount */}
                      {inMonth && (
                        <span className={`text-xs font-semibold ${hasExpenses ? 'text-primary-600 dark:text-primary-400' : 'text-slate-300 dark:text-slate-600'}`}>
                          {hasExpenses
                            ? formatCurrency(info.total, currency, { maximumFractionDigits: 0 })
                            : '$0.00'}
                        </span>
                      )}

                      {/* Expense count dot */}
                      {inMonth && hasExpenses && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-auto">
                          {info.count} {info.count === 1 ? 'item' : 'items'}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <DayModal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        date={selectedDate}
        onUpdate={fetchCalendar}
      />
    </div>
  );
}
