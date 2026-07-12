import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target, BarChart3 } from 'lucide-react';
import { getSummary } from '../api/index.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { format } from 'date-fns';
import { CardSkeleton } from '../components/ui/Skeleton.jsx';
import MiniCalendar from '../components/calendar/MiniCalendar.jsx';
import toast from 'react-hot-toast';

function SummaryCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  const colorMap = {
    blue:   'bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400',
    green:  'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400',
    purple: 'bg-purple-50 text-purple-500 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400',
    red:    'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400',
    slate:  'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  };
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={18} strokeWidth={2} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const currency = user?.currency || 'USD';
  const fc = (v) => formatCurrency(v, currency);

  useEffect(() => {
    getSummary()
      .then(({ data }) => setSummary(data.data))
      .catch(() => toast.error('Failed to load summary'))
      .finally(() => setLoading(false));
  }, []);

  const today = format(new Date(), 'EEEE, MMMM d');

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="skeleton h-7 w-48 mb-2 rounded-xl" />
          <div className="skeleton h-4 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h2 className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="page-subtitle">{today}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <SummaryCard
          icon={DollarSign}
          label="Today's Spending"
          value={fc(summary?.today?.total || 0)}
          sub={`${summary?.today?.count || 0} transactions`}
          color="blue"
          delay={0}
        />
        <SummaryCard
          icon={Calendar}
          label="This Month's Total"
          value={fc(summary?.month?.total || 0)}
          sub={`${summary?.month?.count || 0} expenses`}
          color="purple"
          delay={0.05}
        />
        <SummaryCard
          icon={BarChart3}
          label="This Year's Total"
          value={fc(summary?.year?.total || 0)}
          sub="Yearly spending"
          color="orange"
          delay={0.1}
        />
        <SummaryCard
          icon={TrendingUp}
          label="Weekly Spending"
          value={fc(summary?.week?.total || 0)}
          sub="Current week"
          color="green"
          delay={0.15}
        />
        <SummaryCard
          icon={BarChart3}
          label="Total Expenses"
          value={summary?.month?.count || 0}
          sub="This month"
          color="slate"
          delay={0.2}
        />
        <SummaryCard
          icon={TrendingDown}
          label="Avg. Daily Spend"
          value={fc(summary?.avgDailyThisMonth || 0)}
          sub="This month"
          color="blue"
          delay={0.25}
        />
      </div>

      {/* Category Breakdown + Mini Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Top Categories This Month
          </h3>
          {summary?.byCategory?.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No expenses this month</p>
          ) : (
            <div className="space-y-3">
              {(summary?.byCategory || []).slice(0, 6).map((cat) => {
                const pct = summary?.month?.total
                  ? Math.round((cat.total / summary.month.total) * 100)
                  : 0;
                return (
                  <div key={cat._id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{cat._id}</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{fc(cat.total)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Mini Calendar */}
        <motion.div
          className="card p-0 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <MiniCalendar currency={currency} />
        </motion.div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
