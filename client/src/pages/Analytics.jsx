import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart,
} from 'recharts';
import { getSummary, getExpenses } from '../api/index.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { CATEGORY_COLORS } from '../utils/categories.js';
import { CardSkeleton } from '../components/ui/Skeleton.jsx';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CHART_MARGIN = { top: 5, right: 20, bottom: 5, left: 0 };

function ChartCard({ title, subtitle, children, delay = 0 }) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 shadow-card-lg text-xs">
      {label && <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-medium">
          {p.name}: {formatCurrency(p.value, currency)}
        </p>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSummary()
      .then(({ data }) => setSummary(data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header skeleton h-7 w-36 rounded-xl mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  // Prepare Pie chart data
  const pieData = (summary?.byCategory || []).map((cat) => ({
    name: cat._id,
    value: parseFloat(cat.total.toFixed(2)),
    color: CATEGORY_COLORS[cat._id] || '#94a3b8',
  }));

  // Prepare Bar chart data (daily this month)
  const barData = (summary?.dailyThisMonth || []).map((d) => ({
    date: format(new Date(d._id), 'MMM d'),
    amount: parseFloat(d.total.toFixed(2)),
  }));

  // Prepare Line chart data (last 6 months)
  const lineData = (summary?.last6Months || []).map((m) => ({
    month: format(new Date(`${m._id}-01`), 'MMM yy'),
    amount: parseFloat(m.total.toFixed(2)),
  }));

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Analytics</h2>
        <p className="page-subtitle">Visual breakdown of your spending patterns</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Today', value: summary?.today?.total || 0 },
          { label: 'This Week', value: summary?.week?.total || 0 },
          { label: 'This Month', value: summary?.month?.total || 0 },
          { label: 'This Year', value: summary?.year?.total || 0 },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            className="card py-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <p className="text-xs text-slate-400 font-medium">{item.label}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
              {formatCurrency(item.value, currency)}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <ChartCard
          title="Spending by Category"
          subtitle="This month's breakdown"
          delay={0.1}
        >
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data for this month</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-slate-600 dark:text-slate-400">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Line Chart - 6 month trend */}
        <ChartCard
          title="Spending Trend"
          subtitle="Last 6 months"
          delay={0.15}
        >
          {lineData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={lineData} margin={CHART_MARGIN}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${formatCurrency(v, currency, { maximumFractionDigits: 0 })}`}
                  width={60}
                />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name="Total"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#areaGrad)"
                  dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#3b82f6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Bar Chart - daily this month */}
        <ChartCard
          title="Daily Spending"
          subtitle="Current month"
          delay={0.2}
        >
          {barData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data for this month</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={CHART_MARGIN} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${formatCurrency(v, currency, { maximumFractionDigits: 0 })}`}
                  width={60}
                />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Bar dataKey="amount" name="Spent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Category breakdown table */}
        <ChartCard
          title="Category Totals"
          subtitle="This month's spending by category"
          delay={0.25}
        >
          {(summary?.byCategory || []).length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data for this month</div>
          ) : (
            <div className="space-y-2.5">
              {(summary?.byCategory || []).map((cat) => {
                const pct = summary?.month?.total
                  ? Math.round((cat.total / summary.month.total) * 100)
                  : 0;
                const color = CATEGORY_COLORS[cat._id] || '#94a3b8';
                return (
                  <div key={cat._id}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{cat._id}</span>
                        <span className="text-xs text-slate-400">{cat.count} items</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(cat.total, currency)}
                        </span>
                        <span className="text-xs text-slate-400 ml-2">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
