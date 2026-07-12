import { useForm } from 'react-hook-form';
import { CATEGORIES } from '../../utils/categories.js';
import { format } from 'date-fns';

export default function ExpenseForm({ defaultValues, onSubmit, loading, submitLabel = 'Save Expense' }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: defaultValues?.title || '',
      amount: defaultValues?.amount || '',
      category: defaultValues?.category || 'Food',
      date: defaultValues?.date || format(new Date(), 'yyyy-MM-dd'),
      time: defaultValues?.time || format(new Date(), 'HH:mm'),
      notes: defaultValues?.notes || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="expense-form">
      {/* Title */}
      <div>
        <label className="label" htmlFor="expense-title">Title *</label>
        <input
          id="expense-title"
          className={`input ${errors.title ? 'border-red-400 focus:ring-red-400' : ''}`}
          placeholder="e.g. Lunch at restaurant"
          {...register('title', { required: 'Title is required', maxLength: { value: 100, message: 'Max 100 characters' } })}
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      {/* Amount */}
      <div>
        <label className="label" htmlFor="expense-amount">Amount *</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
          <input
            id="expense-amount"
            type="number"
            step="0.01"
            min="0.01"
            className={`input pl-7 ${errors.amount ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="0.00"
            {...register('amount', {
              required: 'Amount is required',
              min: { value: 0.01, message: 'Amount must be greater than 0' },
              valueAsNumber: true,
            })}
          />
        </div>
        {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="label" htmlFor="expense-category">Category *</label>
        <select
          id="expense-category"
          className="input"
          {...register('category', { required: 'Category is required' })}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Date + Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="expense-date">Date *</label>
          <input
            id="expense-date"
            type="date"
            className="input"
            {...register('date', { required: 'Date is required' })}
          />
        </div>
        <div>
          <label className="label" htmlFor="expense-time">Time</label>
          <input
            id="expense-time"
            type="time"
            className="input"
            {...register('time')}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label" htmlFor="expense-notes">Notes (optional)</label>
        <textarea
          id="expense-notes"
          rows={3}
          className="input resize-none"
          placeholder="Add any additional details..."
          {...register('notes', { maxLength: { value: 500, message: 'Max 500 characters' } })}
        />
        {errors.notes && <p className="text-xs text-red-500 mt-1">{errors.notes.message}</p>}
      </div>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2 justify-center">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving...
          </span>
        ) : submitLabel}
      </button>
    </form>
  );
}
