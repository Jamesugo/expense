import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { formatCurrency } from './formatCurrency.js';

const HEADERS = ['Date', 'Time', 'Title', 'Category', 'Amount', 'Notes'];

const toRows = (expenses, currency) =>
  expenses.map((e) => [
    e.date,
    e.time || '',
    e.title,
    e.category,
    formatCurrency(e.amount, currency),
    e.notes || '',
  ]);

// ── PDF ───────────────────────────────────────────────────────────────────────
export const exportToPDF = (expenses, currency = 'USD', title = 'Expenses') => {
  const doc = new jsPDF();
  const now = format(new Date(), 'yyyy-MM-dd HH:mm');

  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.text('ExpenseTracker', 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(`${title} · Generated ${now}`, 14, 28);

  autoTable(doc, {
    startY: 36,
    head: [HEADERS],
    body: toRows(expenses, currency),
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: { 4: { halign: 'right' } },
  });

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const finalY = doc.lastAutoTable.finalY + 6;
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(`Total: ${formatCurrency(total, currency)}`, 14, finalY);

  doc.save(`expenses-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

// ── CSV ───────────────────────────────────────────────────────────────────────
export const exportToCSV = (expenses, currency = 'USD') => {
  const rows = [HEADERS, ...toRows(expenses, currency)];
  const csvContent = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Excel ─────────────────────────────────────────────────────────────────────
export const exportToExcel = (expenses, currency = 'USD') => {
  const data = [HEADERS, ...toRows(expenses, currency)];
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
  XLSX.writeFile(wb, `expenses-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
