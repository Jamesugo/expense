import {
  format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isToday, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek,
} from 'date-fns';

export {
  format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isToday, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek,
};

/** Returns "YYYY-MM-DD" string for today */
export const todayStr = () => format(new Date(), 'yyyy-MM-dd');

/** Returns "YYYY-MM" string for current month */
export const currentYearMonth = () => format(new Date(), 'yyyy-MM');

/** Generates calendar grid rows (6 rows × 7 cols) for a given month */
export const buildCalendarGrid = (year, month) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDay = startOfWeek(firstDay, { weekStartsOn: 1 }); // Mon
  const endDay = endOfWeek(lastDay, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDay, end: endDay });

  // Chunk into weeks
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
};

/** Format display month/year: "July 2025" */
export const formatMonthYear = (year, month) =>
  format(new Date(year, month - 1, 1), 'MMMM yyyy');

/** "2025-07" → { year: 2025, month: 7 } */
export const parseYearMonth = (ym) => {
  const [year, month] = ym.split('-').map(Number);
  return { year, month };
};

/** Get week range label: "Jul 7 – Jul 13" */
export const getWeekLabel = (date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
};
