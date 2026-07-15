import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Pencil, Trash2, ChevronLeft, ChevronRight, X, SlidersHorizontal } from 'lucide-react';
import { getExpenses, deleteExpense } from '../api/index.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { CategoryBadge } from '../components/ui/Badge.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { ExpenseSkeleton } from '../components/ui/Skeleton.jsx';
import Modal from '../components/ui/Modal.jsx';
import ExpenseForm from '../components/expenses/ExpenseForm.jsx';
import { updateExpense } from '../api/index.js';
import { CATEGORIES } from '../utils/categories.js';
import { exportToPDF, exportToCSV, exportToExcel } from '../utils/exportHelpers.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const LIMIT = 15;

export default function Expenses() {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const [filters, setFilters] = useState({
    search: '', category: '', startDate: '', endDate: '',
    minAmount: '', maxAmount: '', page: 1,
  });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, ...filters };
      Object.keys(params).forEach((k) => { if (!params[k] && params[k] !== 0) delete params[k]; });
      const { data } = await getExpenses(params);
      setExpenses(data.data || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchExpenses();
    window.addEventListener('expense-updated', fetchExpenses);
    return () => window.removeEventListener('expense-updated', fetchExpenses);
  }, [fetchExpenses]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteExpense(deleteTarget._id);
      toast.success('Expense deleted');
      setDeleteTarget(null);
      fetchExpenses();
      window.dispatchEvent(new CustomEvent('expense-updated'));
    } catch {
      toast.error('Failed to delete expense');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = async (formData) => {
    setEditLoading(true);
    try {
      await updateExpense(editTarget._id, formData);
      toast.success('Expense updated!');
      setEditTarget(null);
      fetchExpenses();
      window.dispatchEvent(new CustomEvent('expense-updated'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update expense');
    } finally {
      setEditLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const { data } = await getExpenses({ ...filters, limit: 5000, page: 1 });
      const all = data.data || [];
      if (type === 'pdf') exportToPDF(all, currency, 'Expenses');
      else if (type === 'csv') exportToCSV(all, currency);
      else exportToExcel(all, currency);
      setShowExport(false);
    } catch {
      toast.error('Export failed');
    }
  };

  const clearFilters = () => setFilters({ search: '', category: '', startDate: '', endDate: '', minAmount: '', maxAmount: '', page: 1 });
  const hasActiveFilters = filters.search || filters.category || filters.startDate || filters.endDate || filters.minAmount || filters.maxAmount;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Expenses</h2>
        <p className="page-subtitle">Manage and filter all your expenses</p>
      </div>

      {/* Search + Filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mb-4 p-4"
      >
        <div className="flex gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              className="input pl-9 py-2 text-sm"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
            />
          </div>

          {/* Category filter */}
          <select
            className="input py-2 text-sm w-auto"
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value, page: 1 }))}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`btn-secondary py-2 text-sm gap-1.5 ${showFilters ? 'bg-primary-50 border-primary-200 text-primary-600' : ''}`}
          >
            <SlidersHorizontal size={14} />
            Filters
            {hasActiveFilters && <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />}
          </button>

          <div className="relative">
            <button onClick={() => setShowExport((v) => !v)} className="btn-secondary py-2 text-sm">
              <Download size={14} />
              Export
            </button>
            <AnimatePresence>
              {showExport && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-slate-700 rounded-xl shadow-card-lg z-10 py-1 min-w-[130px]"
                >
                  {['PDF', 'CSV', 'Excel'].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleExport(t.toLowerCase())}
                      className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-ghost py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50">
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        {/* Advanced filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <div>
                  <label className="label text-xs">Start Date</label>
                  <input type="date" className="input text-sm py-2" value={filters.startDate}
                    onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value, page: 1 }))} />
                </div>
                <div>
                  <label className="label text-xs">End Date</label>
                  <input type="date" className="input text-sm py-2" value={filters.endDate}
                    onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value, page: 1 }))} />
                </div>
                <div>
                  <label className="label text-xs">Min Amount</label>
                  <input type="number" step="0.01" min="0" placeholder="0.00" className="input text-sm py-2" value={filters.minAmount}
                    onChange={(e) => setFilters((f) => ({ ...f, minAmount: e.target.value, page: 1 }))} />
                </div>
                <div>
                  <label className="label text-xs">Max Amount</label>
                  <input type="number" step="0.01" min="0" placeholder="Any" className="input text-sm py-2" value={filters.maxAmount}
                    onChange={(e) => setFilters((f) => ({ ...f, maxAmount: e.target.value, page: 1 }))} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Expenses list */}
      <motion.div
        className="card p-0 overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {loading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
            {Array.from({ length: 8 }).map((_, i) => <ExpenseSkeleton key={i} />)}
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No expenses found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
            {expenses.map((expense, idx) => (
              <motion.div
                key={expense._id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
              >
                {/* Category icon */}
                <div className="flex-shrink-0">
                  <CategoryBadge category={expense.category} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{expense.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {format(new Date(expense.date), 'MMM d, yyyy')} · {expense.time || '00:00'}
                    {expense.notes && <span className="ml-2 text-slate-300 dark:text-slate-600">· {expense.notes}</span>}
                  </p>
                </div>

                {/* Amount */}
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex-shrink-0">
                  {formatCurrency(expense.amount, currency)}
                </p>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => setEditTarget(expense)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(expense)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-700/50">
            <p className="text-xs text-slate-400">
              Showing {((pagination.page - 1) * LIMIT) + 1}–{Math.min(pagination.page * LIMIT, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                disabled={pagination.page <= 1}
                className="btn-ghost p-1.5 disabled:opacity-30"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-xs text-slate-600 dark:text-slate-400 px-2 py-1.5">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="btn-ghost p-1.5 disabled:opacity-30"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Expense">
        {editTarget && (
          <ExpenseForm
            defaultValues={editTarget}
            onSubmit={handleEdit}
            loading={editLoading}
            submitLabel="Update Expense"
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        loading={deleteLoading}
      />
    </div>
  );
}
