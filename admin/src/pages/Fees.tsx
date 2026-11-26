import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Banknote,
  Download,
  Settings,
  CheckCircle2,
  AlertCircle,
  Calendar,
  X
} from 'lucide-react';
import { schoolStore } from '../lib/store';
import { formatCurrency, formatDate } from '../lib/utils';
import type { Database } from '../types/database';

const GRADES = [6, 7, 8, 9, 10];
const SECTIONS = ['A', 'B', 'C'];

export const Fees: React.FC = () => {
  const [, setTick] = useState(0);

  const [selectedGrade, setSelectedGrade] = useState<number>(6);
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11-01');
  const [activeTab, setActiveTab] = useState<'grid' | 'pending'>('grid');

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [feeInput, setFeeInput] = useState(String(schoolStore.monthlyFeeAmount));

  useEffect(() => {
    return schoolStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const currentSection = schoolStore.sections.find(
    s => s.grade === selectedGrade && s.name === selectedSection
  );

  const students = currentSection
    ? schoolStore.students.filter(s => s.section_id === currentSection.id && s.status === 'active')
    : [];

  const handleToggleFee = (studentId: string) => {
    schoolStore.toggleFeeStatus(studentId, selectedMonth);
  };

  const handleSaveFeeSetting = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(feeInput);
    if (val > 0) {
      schoolStore.updateMonthlyFeeAmount(val);
      setShowSettingsModal(false);
    }
  };

  // Fee calculation for current selection
  const feeStatusMap: Record<string, { status: 'paid' | 'pending'; paid_on: string | null }> = {};
  students.forEach(s => {
    const fee = schoolStore.fees.find(f => f.student_id === s.id && f.month === selectedMonth);
    feeStatusMap[s.id] = {
      status: fee?.status || 'pending',
      paid_on: fee?.paid_on || null
    };
  });

  const paidCount = students.filter(s => feeStatusMap[s.id]?.status === 'paid').length;
  const pendingCount = students.filter(s => feeStatusMap[s.id]?.status === 'pending').length;
  const collectedTotal = paidCount * schoolStore.monthlyFeeAmount;
  const pendingTotal = pendingCount * schoolStore.monthlyFeeAmount;

  // Pending List (All students across school with pending fees for selected month)
  const allPendingStudents = schoolStore.students
    .filter(s => s.status === 'active')
    .map(s => {
      const fee = schoolStore.fees.find(f => f.student_id === s.id && f.month === selectedMonth);
      const isPaid = fee?.status === 'paid';
      const sec = schoolStore.sections.find(sec => sec.id === s.section_id);
      return { student: s, section: sec, isPaid };
    })
    .filter(item => !item.isPaid);

  // Export Fee Register to Excel
  const handleExportExcel = () => {
    const data = students.map(s => {
      const info = feeStatusMap[s.id];
      return {
        'Month': selectedMonth,
        'Class': `Grade ${selectedGrade}-${selectedSection}`,
        'Roll No': s.roll_no,
        'Student Name': s.full_name,
        'Father Name': s.father_name || '',
        'Amount Due': schoolStore.monthlyFeeAmount,
        'Fee Status': info?.status.toUpperCase(),
        'Paid Date': info?.paid_on || 'UNPAID'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Fees_${selectedMonth}`);
    XLSX.writeFile(workbook, `Fee_Register_Grade_${selectedGrade}_${selectedSection}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F1B2E]">Monthly Tuition & Fee Management</h1>
          <p className="text-xs text-[#6B6880] mt-0.5">
            Fixed monthly fee of {formatCurrency(schoolStore.monthlyFeeAmount)} per student with real-time collection status.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-2 bg-white border border-[#E9E6F2] hover:border-[#7048E8] text-[#1F1B2E] text-xs font-bold rounded-full shadow-sm flex items-center gap-2 transition"
          >
            <Settings className="w-4 h-4 text-[#7048E8]" />
            <span>Fee Amount Setting</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-white border border-[#E9E6F2] hover:border-[#7048E8] text-[#1F1B2E] text-xs font-bold rounded-full shadow-sm flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-[#7048E8]" />
            <span>Export Register (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Tabs & Class Selector */}
      <div className="bg-white p-4 rounded-[22px] shadow-soft border border-white space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === 'grid' ? 'bg-[#7048E8] text-white shadow-sm' : 'bg-[#F4F3F8] text-[#6B6880]'
              }`}
            >
              Class-wise Grid
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === 'pending' ? 'bg-[#7048E8] text-white shadow-sm' : 'bg-[#F4F3F8] text-[#6B6880]'
              }`}
            >
              All Pending Defaulters ({allPendingStudents.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#7048E8]" />
            <span className="text-xs font-bold text-[#6B6880]">Billing Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-[#F4F3F8] text-xs font-bold text-[#1F1B2E] px-3 py-1.5 rounded-full border border-transparent focus:border-[#7048E8] outline-none"
            >
              <option value="2026-11-01">November 2026</option>
              <option value="2026-10-01">October 2026</option>
              <option value="2026-09-01">September 2026</option>
            </select>
          </div>
        </div>

        {activeTab === 'grid' && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#F4F3F8] overflow-x-auto">
            <span className="text-xs font-bold text-[#6B6880] uppercase mr-2">Class:</span>
            {GRADES.map(g => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  selectedGrade === g ? 'bg-[#EEE9FD] text-[#7048E8]' : 'bg-[#F4F3F8] text-[#6B6880]'
                }`}
              >
                Grade {g}
              </button>
            ))}
            <div className="h-4 w-px bg-[#E9E6F2] mx-2" />
            <span className="text-xs font-bold text-[#6B6880] uppercase mr-2">Section:</span>
            {SECTIONS.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSection(s)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  selectedSection === s ? 'bg-[#EEE9FD] text-[#7048E8]' : 'bg-[#F4F3F8] text-[#6B6880]'
                }`}
              >
                Section {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[22px] shadow-soft border border-white">
          <p className="text-xs font-bold text-[#6B6880]">Total Fee Rate</p>
          <p className="text-2xl font-extrabold text-[#1F1B2E] mt-1">{formatCurrency(schoolStore.monthlyFeeAmount)}</p>
          <p className="text-[11px] text-[#6B6880] mt-0.5">Fixed per student / month</p>
        </div>

        <div className="bg-white p-5 rounded-[22px] shadow-soft border border-white">
          <p className="text-xs font-bold text-[#6B6880]">Fee Recovery Rate</p>
          <p className="text-2xl font-extrabold text-[#7048E8] mt-1">
            {students.length ? Math.round((paidCount / students.length) * 100) : 0}%
          </p>
          <p className="text-[11px] text-[#6B6880] mt-0.5">{paidCount} Paid • {pendingCount} Pending</p>
        </div>

        <div className="bg-white p-5 rounded-[22px] shadow-soft border border-white">
          <p className="text-xs font-bold text-[#6B6880]">Collected Amount</p>
          <p className="text-2xl font-extrabold text-[#2FA36B] mt-1">{formatCurrency(collectedTotal)}</p>
          <p className="text-[11px] text-[#2FA36B] font-semibold mt-0.5">Cleared dues</p>
        </div>

        <div className="bg-white p-5 rounded-[22px] shadow-soft border border-white">
          <p className="text-xs font-bold text-[#6B6880]">Outstanding Receivables</p>
          <p className="text-2xl font-extrabold text-[#F27D8D] mt-1">{formatCurrency(pendingTotal)}</p>
          <p className="text-[11px] text-[#F27D8D] font-semibold mt-0.5">Awaiting settlement</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[24px] shadow-soft border border-white overflow-hidden">
        {activeTab === 'grid' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F4F3F8] text-[11px] font-bold text-[#6B6880] uppercase tracking-wider bg-[#FAF9FD]">
                  <th className="py-4 px-6">Roll No</th>
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Father Name</th>
                  <th className="py-4 px-6">Monthly Amount</th>
                  <th className="py-4 px-6">Paid On</th>
                  <th className="py-4 px-6 text-right">Status (Click to toggle)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F3F8] text-sm">
                {students.map((stu) => {
                  const info = feeStatusMap[stu.id];
                  const isPaid = info?.status === 'paid';
                  return (
                    <tr key={stu.id} className="hover:bg-[#F8F7FC] transition">
                      <td className="py-3.5 px-6 font-bold text-[#7048E8]">#{stu.roll_no}</td>
                      <td className="py-3.5 px-6 font-bold text-[#1F1B2E]">{stu.full_name}</td>
                      <td className="py-3.5 px-6 text-xs text-[#6B6880]">{stu.father_name || '-'}</td>
                      <td className="py-3.5 px-6 font-semibold text-xs text-[#1F1B2E]">{formatCurrency(schoolStore.monthlyFeeAmount)}</td>
                      <td className="py-3.5 px-6 text-xs text-[#6B6880]">{info?.paid_on ? formatDate(info.paid_on) : '-'}</td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleToggleFee(stu.id)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition shadow-sm ${
                            isPaid
                              ? 'bg-[#2FA36B] text-white hover:bg-[#288b5b]'
                              : 'bg-[#F27D8D] text-white hover:bg-[#e06878]'
                          }`}
                        >
                          {isPaid ? 'Paid (Rs. 3,500)' : 'Pending Due'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F4F3F8] text-[11px] font-bold text-[#6B6880] uppercase tracking-wider bg-[#FAF9FD]">
                  <th className="py-4 px-6">Class / Sec</th>
                  <th className="py-4 px-6">Roll No</th>
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Father Name</th>
                  <th className="py-4 px-6">Guardian Phone</th>
                  <th className="py-4 px-6">Pending Due</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F3F8] text-sm">
                {allPendingStudents.map(({ student: stu, section: sec }) => (
                  <tr key={stu.id} className="hover:bg-[#F8F7FC] transition">
                    <td className="py-3.5 px-6">
                      <span className="px-2.5 py-0.5 bg-[#EEE9FD] text-[#7048E8] text-xs font-bold rounded-full">
                        {sec?.grade}-{sec?.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-[#7048E8]">#{stu.roll_no}</td>
                    <td className="py-3.5 px-6 font-bold text-[#1F1B2E]">{stu.full_name}</td>
                    <td className="py-3.5 px-6 text-xs text-[#6B6880]">{stu.father_name || '-'}</td>
                    <td className="py-3.5 px-6 text-xs font-mono text-[#1F1B2E]">{stu.phone1 || '-'}</td>
                    <td className="py-3.5 px-6 font-bold text-xs text-[#F27D8D]">{formatCurrency(schoolStore.monthlyFeeAmount)}</td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleToggleFee(stu.id)}
                        className="px-4 py-1.5 bg-[#2FA36B] hover:bg-[#288b5b] text-white text-xs font-bold rounded-full transition"
                      >
                        Mark As Paid
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F4F3F8]">
              <h3 className="text-lg font-bold text-[#1F1B2E]">Configure Fixed Monthly Fee</h3>
              <button onClick={() => setShowSettingsModal(false)} className="p-1.5 text-[#6B6880]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFeeSetting} className="space-y-4 my-6">
              <div>
                <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">
                  Monthly Tuition Amount (PKR)
                </label>
                <input
                  type="number"
                  required
                  value={feeInput}
                  onChange={(e) => setFeeInput(e.target.value)}
                  className="w-full bg-[#F4F3F8] text-base font-bold text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none"
                />
                <p className="text-[11px] text-[#6B6880] mt-1">
                  Updates school-wide flat fee schedule for all classes 6 to 10.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#F4F3F8]">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-5 py-2 text-xs font-bold text-[#6B6880]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#7048E8] text-white text-xs font-bold rounded-full hover:bg-[#5E37D3] transition"
                >
                  Update Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
