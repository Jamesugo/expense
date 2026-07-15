import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Pencil, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getExpensesByDate, createExpense, updateExpense, deleteExpense } from '../../api/index.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { format, parseISO } from 'date-fns';
import { CategoryBadge } from '../ui/Badge.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import ExpenseForm from '../expenses/ExpenseForm.jsx';
import { ExpenseSkeleton } from '../ui/Skeleton.jsx';

export default function DayModal({ isOpen, onClose, date, onUpdate }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currency = user?.currency || 'USD';
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const displayDate = date ? format(parseISO(date), 'EEEE, MMMM d, yyyy') : '';

  const fetchExpenses = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    try {
      const { data } = await getExpensesByDate(date);
      setExpenses(data.data || []);
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    if (isOpen) {
      fetchExpenses();
      setView('list');
    }
  }, [isOpen, fetchExpenses]);

  const handleCreate = async (formData) => {
    setFormLoading(true);
    try {
      await createExpense({ ...formData, date });
      toast.success('Expense added!');
      await fetchExpenses();
      onUpdate?.();
      window.dispatchEvent(new CustomEvent('expense-updated'));
      setView('list');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    setFormLoading(true);
    try {
      await updateExpense(editTarget._id, formData);
      toast.success('Expense updated!');
      await fetchExpenses();
      onUpdate?.();
      window.dispatchEvent(new CustomEvent('expense-updated'));
      setView('list');
      setEditTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update expense');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteExpense(deleteTarget._id);
      toast.success('Expense deleted');
      await fetchExpenses();
      onUpdate?.();
      window.dispatchEvent(new CustomEvent('expense-updated'));
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete expense');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={onClose}
            />

            {/* Side Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#1e2130] z-50 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                      {view === 'list' ? 'Day Summary' : view === 'add' ? 'Add Expense' : 'Edit Expense'}
                    </p>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{displayDate}</h2>
                    {view === 'list' && (
                      <p className="text-sm text-slate-500 mt-0.5">
                        Total: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(total, currency)}</span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (view !== 'list') { setView('list'); setEditTarget(null); }
                      else onClose();
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5">
                <AnimatePresence mode="wait">
                  {view === 'list' && (
                    <motion.div key="list" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                      {loading ? (
                        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <ExpenseSkeleton key={i} />)}</div>
                      ) : expenses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="text-5xl mb-4">💸</div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No expenses for this day</p>
                          <p className="text-xs text-slate-400 mt-1">Tap the button below to add one</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {expenses.map((expense) => (
                            <motion.div
                              key={expense._id}
                              layout
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{expense.title}</p>
                                  <CategoryBadge category={expense.category} />
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                  <Clock size={11} />
                                  <span>{expense.time || '00:00'}</span>
                                  {expense.notes && <span className="ml-2 truncate text-slate-400">· {expense.notes}</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mr-1">
                                  {formatCurrency(expense.amount, currency)}
                                </p>
                                <button
                                  onClick={() => { setEditTarget(expense); setView('edit'); }}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-white dark:hover:bg-slate-700 transition-all"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(expense)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 transition-all"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {view === 'add' && (
                    <motion.div key="add" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                      <ExpenseForm
                        defaultValues={{ date }}
                        onSubmit={handleCreate}
                        loading={formLoading}
                        submitLabel="Add Expense"
                      />
                    </motion.div>
                  )}

                  {view === 'edit' && editTarget && (
                    <motion.div key="edit" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                      <ExpenseForm
                        defaultValues={editTarget}
                        onSubmit={handleUpdate}
                        loading={formLoading}
                        submitLabel="Update Expense"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              {view === 'list' && (
                <div className="p-5 border-t border-slate-100 dark:border-slate-700/50">
                  <button
                    onClick={() => setView('add')}
                    className="btn-primary w-full justify-center"
                    id="day-modal-add-btn"
                  >
                    <Plus size={16} />
                    Add Expense
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </>
  );
}
