import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  DollarSign,
  Calendar,
  X,
  CreditCard
} from 'lucide-react';
import { schoolStore } from '../lib/store';
import { formatCurrency, formatDate } from '../lib/utils';
import type { Database } from '../types/database';

export const Expenses: React.FC = () => {
  const [, setTick] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  const [category, setCategory] = useState('Stationery & Printing');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [expenseDate, setExpenseDate] = useState('2026-11-26');

  useEffect(() => {
    return schoolStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const totalSpent = schoolStore.expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) return;

    schoolStore.addExpense({
      category,
      amount: amt,
      note: note.trim() || null,
      date: expenseDate
    });

    setAmount('');
    setNote('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F1B2E]">Institutional Expenses Ledger</h1>
          <p className="text-xs text-[#6B6880] mt-0.5">
            Admin ledger for school operations, utilities, maintenance, and supplies disbursements.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-[#7048E8] hover:bg-[#5E37D3] text-white text-xs font-bold rounded-full shadow-md shadow-[#7048E8]/20 flex items-center gap-2 self-start sm:self-auto transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* KPI Total Card */}
      <div className="bg-white p-6 rounded-[24px] shadow-soft border border-white flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-[#6B6880]">Total Monthly Expenditure</p>
          <p className="text-3xl font-black text-[#1F1B2E] mt-1">{formatCurrency(totalSpent)}</p>
          <p className="text-xs text-[#2FA36B] font-semibold mt-1">November 2026 Accounting Period</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-[#EEE9FD] text-[#7048E8] flex items-center justify-center">
          <Receipt className="w-7 h-7" />
        </div>
      </div>

      {/* Expense Entries Table */}
      <div className="bg-white rounded-[24px] shadow-soft border border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F4F3F8] text-[11px] font-bold text-[#6B6880] uppercase tracking-wider bg-[#FAF9FD]">
                <th className="py-4 px-6">Disbursement Date</th>
                <th className="py-4 px-6">Expense Category</th>
                <th className="py-4 px-6">Description / Memo</th>
                <th className="py-4 px-6 text-right">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3F8] text-sm">
              {schoolStore.expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-[#F8F7FC] transition">
                  <td className="py-4 px-6 text-xs text-[#6B6880]">
                    {formatDate(exp.date)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-[#EEE9FD] text-[#7048E8] text-xs font-bold rounded-full">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs font-medium text-[#1F1B2E]">
                    {exp.note || '-'}
                  </td>
                  <td className="py-4 px-6 text-right font-extrabold text-sm text-[#1F1B2E]">
                    {formatCurrency(Number(exp.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F4F3F8]">
              <h3 className="text-lg font-bold text-[#1F1B2E]">Log Institutional Expense</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-[#6B6880]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 my-6">
              <div>
                <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#F4F3F8] text-xs font-bold text-[#1F1B2E] px-4 py-2.5 rounded-[14px] outline-none"
                >
                  <option value="Stationery & Printing">Stationery & Printing</option>
                  <option value="Utilities">Utilities (Electricity, Gas, Water)</option>
                  <option value="Lab Equipment">Lab & Science Equipment</option>
                  <option value="Maintenance & Repairs">Maintenance & Generator Servicing</option>
                  <option value="Sports Supplies">Sports Supplies & Kits</option>
                  <option value="Hospitality & Refreshment">Hospitality & Refreshments</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Amount (PKR) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 15000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#F4F3F8] text-base font-bold text-[#1F1B2E] px-4 py-2.5 rounded-[14px] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Expense Date *</label>
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full bg-[#F4F3F8] text-xs font-bold text-[#1F1B2E] px-4 py-2 rounded-[14px] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Memo / Invoice Note</label>
                <input
                  type="text"
                  placeholder="Receipt or bill reference..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#F4F3F8]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2 text-xs font-bold text-[#6B6880]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#7048E8] hover:bg-[#5E37D3] text-white text-xs font-bold rounded-full transition"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
