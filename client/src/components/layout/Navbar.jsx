import { useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useState } from 'react';
import DayModal from '../calendar/DayModal.jsx';
import { format } from 'date-fns';

const TITLES = {
  '/': 'Dashboard',
  '/calendar': 'Calendar',
  '/expenses': 'Expenses',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function Navbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const title = TITLES[location.pathname] || 'ExpenseTracker';
  const [addOpen, setAddOpen] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#1e2130]/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center justify-between h-14 px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu size={18} />
            </button>
            <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick add */}
            <button
              onClick={() => setAddOpen(true)}
              className="btn-primary py-2 px-3 text-sm"
              id="navbar-add-expense"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Add Expense</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Quick-add expense modal for today */}
      <DayModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        date={today}
        onUpdate={() => {}}
      />
    </>
  );
}
