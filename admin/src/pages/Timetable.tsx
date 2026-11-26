import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Save,
  Users,
  ShieldCheck
} from 'lucide-react';
import { schoolStore } from '../lib/store';
import type { Database } from '../types/database';

const GRADES = [6, 7, 8, 9, 10];
const SECTIONS = ['A', 'B', 'C'];
const DAYS = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
];

const PERIODS = [
  { no: 1, time: '08:00 - 08:45' },
  { no: 2, time: '08:45 - 09:30' },
  { no: 3, time: '09:30 - 10:15' },
  { no: 4, time: '10:30 - 11:15' }, // Break 10:15 - 10:30
  { no: 5, time: '11:15 - 12:00' },
  { no: 6, time: '12:00 - 12:45' },
  { no: 7, time: '12:45 - 01:30' },
];

export const Timetable: React.FC = () => {
  const [, setTick] = useState(0);

  const [selectedGrade, setSelectedGrade] = useState<number>(6);
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [isApproved, setIsApproved] = useState(true);

  // Cell editing modal / popover
  const [editingCell, setEditingCell] = useState<{ day: number; period: number } | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [subjectInput, setSubjectInput] = useState<string>('');
  const [conflictError, setConflictError] = useState<string | null>(null);

  useEffect(() => {
    return schoolStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const currentSection = schoolStore.sections.find(
    s => s.grade === selectedGrade && s.name === selectedSection
  );

  const handleCellClick = (day: number, period: number) => {
    if (!currentSection) return;
    const existing = schoolStore.timetableEntries.find(
      e => e.section_id === currentSection.id && e.day === day && e.period_no === period
    );

    setEditingCell({ day, period });
    setSelectedTeacherId(existing?.teacher_id || schoolStore.teachers[0]?.id || '');
    setSubjectInput(existing?.subject || schoolStore.teachers[0]?.subject || 'Mathematics');
    setConflictError(null);
  };

  const handleSaveCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSection || !editingCell) return;

    try {
      schoolStore.setTimetableEntry(
        currentSection.id,
        editingCell.day,
        editingCell.period,
        subjectInput,
        selectedTeacherId
      );
      setEditingCell(null);
      setConflictError(null);
    } catch (err: any) {
      setConflictError(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F1B2E]">Master Timetable Editor</h1>
          <p className="text-xs text-[#6B6880] mt-0.5">
            Admin grid scheduler with automated database-level double-booking prevention across sections.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            isApproved ? 'bg-[#2FA36B]/15 text-[#2FA36B]' : 'bg-[#F6C177]/20 text-[#D97706]'
          }`}>
            <ShieldCheck className="w-4 h-4" />
            <span>{isApproved ? 'Master Schedule: Approved' : 'Draft Version'}</span>
          </span>

          <button
            onClick={() => setIsApproved(!isApproved)}
            className="px-5 py-2 bg-[#7048E8] hover:bg-[#5E37D3] text-white text-xs font-bold rounded-full shadow-md shadow-[#7048E8]/20 transition"
          >
            {isApproved ? 'Set As Draft' : 'Approve Master Timetable'}
          </button>
        </div>
      </div>

      {/* Class Selector */}
      <div className="bg-white p-4 rounded-[22px] shadow-soft border border-white flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-[#6B6880] uppercase mr-2">Target Section:</span>
        {GRADES.map(g => (
          <div key={g} className="flex items-center gap-1">
            {SECTIONS.map(s => {
              const isActive = selectedGrade === g && selectedSection === s;
              return (
                <button
                  key={`${g}-${s}`}
                  onClick={() => {
                    setSelectedGrade(g);
                    setSelectedSection(s);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    isActive ? 'bg-[#7048E8] text-white shadow-sm' : 'bg-[#F4F3F8] text-[#6B6880] hover:text-[#1F1B2E]'
                  }`}
                >
                  {g}-{s}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-[24px] shadow-soft border border-white p-6 overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 gap-2 mb-2 pb-3 border-b border-[#F4F3F8] text-center">
            <div className="text-xs font-bold text-[#6B6880] py-2">Day / Period</div>
            {PERIODS.map(p => (
              <div key={p.no} className="p-2 bg-[#F8F7FC] rounded-xl text-center">
                <p className="text-xs font-bold text-[#1F1B2E]">Period {p.no}</p>
                <p className="text-[10px] text-[#6B6880]">{p.time}</p>
              </div>
            ))}
          </div>

          {DAYS.map(day => (
            <div key={day.id} className="grid grid-cols-8 gap-2 py-2 items-center">
              <div className="font-bold text-xs text-[#1F1B2E] px-2">
                {day.name}
              </div>

              {PERIODS.map(p => {
                const entry = schoolStore.timetableEntries.find(
                  e => e.section_id === currentSection?.id && e.day === day.id && e.period_no === p.no
                );
                const teacher = schoolStore.teachers.find(t => t.id === entry?.teacher_id);

                return (
                  <button
                    key={p.no}
                    onClick={() => handleCellClick(day.id, p.no)}
                    className="p-3 min-h-[72px] rounded-2xl bg-[#F8F7FC] border border-[#E9E6F2] hover:bg-[#EEE9FD] hover:border-[#7048E8] text-left transition flex flex-col justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#1F1B2E] line-clamp-1 group-hover:text-[#7048E8]">
                        {entry?.subject || 'Free Period'}
                      </p>
                      <p className="text-[10px] text-[#6B6880] line-clamp-1">
                        {teacher?.full_name || 'No Teacher'}
                      </p>
                    </div>
                    <span className="text-[9px] text-[#7048E8] font-bold opacity-0 group-hover:opacity-100 transition">
                      Edit →
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Cell Modal */}
      {editingCell && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl p-6">
            <h3 className="text-lg font-bold text-[#1F1B2E]">
              Schedule Period {editingCell.period} ({DAYS.find(d => d.id === editingCell.day)?.name})
            </h3>
            <p className="text-xs text-[#6B6880] mt-0.5">
              Class {selectedGrade}-{selectedSection}
            </p>

            {conflictError && (
              <div className="my-4 p-3 bg-[#F27D8D]/10 border border-[#F27D8D]/30 rounded-xl text-xs text-[#F27D8D] font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{conflictError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCell} className="space-y-4 my-6">
              <div>
                <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Assign Teacher</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none"
                >
                  {schoolStore.teachers.filter(t => t.active).map(t => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} ({t.subject})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#6B6880] mt-1">
                  Database uniqueness rule prevents double booking teacher in another section in this period.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#F4F3F8]">
                <button
                  type="button"
                  onClick={() => setEditingCell(null)}
                  className="px-5 py-2 text-xs font-bold text-[#6B6880]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#7048E8] hover:bg-[#5E37D3] text-white text-xs font-bold rounded-full transition"
                >
                  Assign Period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
