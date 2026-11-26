import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Download,
  Save,
  CheckCircle2,
  Trophy,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { schoolStore } from '../lib/store';
import { formatDate } from '../lib/utils';
import type { Database } from '../types/database';

const GRADES = [6, 7, 8, 9, 10];
const SECTIONS = ['A', 'B', 'C'];

export const Marks: React.FC = () => {
  const [, setTick] = useState(0);

  const [selectedGrade, setSelectedGrade] = useState<number>(6);
  const [selectedSection, setSelectedSection] = useState<string>('A');

  const [marksState, setMarksState] = useState<Record<string, { obtained: number | null; absent: boolean }>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    return schoolStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const currentSection = schoolStore.sections.find(
    s => s.grade === selectedGrade && s.name === selectedSection
  );

  const currentExam = schoolStore.exams[0]; // November Monthly Assessment

  const students = currentSection
    ? schoolStore.students.filter(s => s.section_id === currentSection.id && s.status === 'active')
    : [];

  useEffect(() => {
    if (!currentExam) return;
    const map: Record<string, { obtained: number | null; absent: boolean }> = {};
    students.forEach(s => {
      const existing = schoolStore.marks.find(m => m.exam_id === currentExam.id && m.student_id === s.id);
      if (existing) {
        map[s.id] = { obtained: existing.obtained, absent: existing.absent };
      } else {
        map[s.id] = { obtained: 30 + ((s.roll_no * 7) % 20), absent: false };
      }
    });
    setMarksState(map);
    setHasChanges(false);
  }, [currentSection, currentExam]);

  const handleScoreChange = (studentId: string, val: string) => {
    const num = val === '' ? null : Number(val);
    if (num !== null && (num < 0 || num > (currentExam?.total_marks || 100))) return;

    setMarksState(prev => ({
      ...prev,
      [studentId]: { obtained: num, absent: false }
    }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleToggleAbsent = (studentId: string) => {
    setMarksState(prev => {
      const cur = prev[studentId] || { obtained: null, absent: false };
      return {
        ...prev,
        [studentId]: {
          obtained: cur.absent ? 35 : null,
          absent: !cur.absent
        }
      };
    });
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSaveMarks = () => {
    if (!currentExam) return;
    const records = Object.entries(marksState).map(([student_id, rec]) => ({
      student_id,
      obtained: rec.obtained,
      absent: rec.absent
    }));
    schoolStore.saveMarks(currentExam.id, records);
    setHasChanges(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Calculations
  const total = students.length || 1;
  const scored = Object.values(marksState).filter(m => !m.absent && m.obtained !== null);
  const avg = scored.length ? Math.round(scored.reduce((s, m) => s + (m.obtained || 0), 0) / scored.length) : 0;
  const highest = scored.length ? Math.max(...scored.map(m => m.obtained || 0)) : 0;
  const passCount = scored.filter(m => (m.obtained || 0) >= (currentExam?.total_marks || 50) * 0.4).length;
  const passRate = scored.length ? Math.round((passCount / scored.length) * 100) : 0;

  // Export Marks to Excel
  const handleExportExcel = () => {
    const data = students.map(s => {
      const m = marksState[s.id] || { obtained: null, absent: false };
      return {
        'Class': `Grade ${selectedGrade}-${selectedSection}`,
        'Roll No': s.roll_no,
        'Student Name': s.full_name,
        'Subject': currentExam?.subject || 'Mathematics',
        'Exam Type': currentExam?.type || 'monthly',
        'Total Marks': currentExam?.total_marks || 50,
        'Obtained Marks': m.absent ? 'ABSENT' : m.obtained,
        'Percentage': m.absent || m.obtained === null ? '0%' : `${Math.round(((m.obtained) / (currentExam?.total_marks || 50)) * 100)}%`
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Marks_${selectedGrade}_${selectedSection}`);
    XLSX.writeFile(workbook, `Marks_Grade_${selectedGrade}_${selectedSection}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F1B2E]">Exams & Marks Register</h1>
          <p className="text-xs text-[#6B6880] mt-0.5">
            Subject assessments: Weekly tests, Monthly assessments, Mid-Term and Final examinations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-white border border-[#E9E6F2] hover:border-[#7048E8] text-[#1F1B2E] text-xs font-bold rounded-full shadow-sm flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-[#7048E8]" />
            <span>Export Marks Sheet</span>
          </button>

          <button
            onClick={handleSaveMarks}
            disabled={!hasChanges}
            className="px-6 py-2.5 bg-[#7048E8] hover:bg-[#5E37D3] disabled:opacity-50 text-white text-xs font-bold rounded-full shadow-md shadow-[#7048E8]/20 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Marks</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-[#2FA36B]/15 border border-[#2FA36B]/30 rounded-2xl text-xs font-bold text-[#2FA36B] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Marks updated and saved to audit ledger!</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-[22px] shadow-soft border border-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#6B6880] uppercase">Grade:</span>
            {GRADES.map(g => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  selectedGrade === g ? 'bg-[#7048E8] text-white' : 'bg-[#F4F3F8] text-[#6B6880]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-[#E9E6F2] hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#6B6880] uppercase">Section:</span>
            {SECTIONS.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSection(s)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  selectedSection === s ? 'bg-[#EEE9FD] text-[#7048E8]' : 'bg-[#F4F3F8] text-[#6B6880]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#1F1B2E]">
          <span className="px-3 py-1 bg-[#EEE9FD] text-[#7048E8] rounded-full">Subject: Mathematics</span>
          <span className="px-3 py-1 bg-[#F4F3F8] text-[#6B6880] rounded-full">Total Marks: 50</span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-[22px] shadow-soft border border-white">
          <p className="text-xs font-bold text-[#6B6880]">Class Average</p>
          <p className="text-2xl font-extrabold text-[#7048E8] mt-1">{avg} / 50</p>
          <p className="text-[11px] text-[#6B6880] mt-0.5">{Math.round((avg / 50) * 100)}% overall score</p>
        </div>

        <div className="bg-white p-5 rounded-[22px] shadow-soft border border-white">
          <p className="text-xs font-bold text-[#6B6880]">Highest Score</p>
          <p className="text-2xl font-extrabold text-[#2FA36B] mt-1">{highest} / 50</p>
          <p className="text-[11px] text-[#2FA36B] font-semibold mt-0.5">Top performing student</p>
        </div>

        <div className="bg-white p-5 rounded-[22px] shadow-soft border border-white">
          <p className="text-xs font-bold text-[#6B6880]">Passing Rate (≥ 40%)</p>
          <p className="text-2xl font-extrabold text-[#1F1B2E] mt-1">{passRate}%</p>
          <p className="text-[11px] text-[#6B6880] mt-0.5">{passCount} out of {scored.length} passed</p>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-[24px] shadow-soft border border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F4F3F8] text-[11px] font-bold text-[#6B6880] uppercase tracking-wider bg-[#FAF9FD]">
                <th className="py-4 px-6">Roll No</th>
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6">Marks Obtained (Out of 50)</th>
                <th className="py-4 px-6">Percentage</th>
                <th className="py-4 px-6 text-right">Absent Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3F8] text-sm">
              {students.map((stu) => {
                const mark = marksState[stu.id] || { obtained: null, absent: false };
                const pct = mark.absent || mark.obtained === null ? 0 : Math.round((mark.obtained / 50) * 100);
                return (
                  <tr key={stu.id} className="hover:bg-[#F8F7FC] transition">
                    <td className="py-3.5 px-6 font-bold text-[#7048E8]">
                      #{stu.roll_no}
                    </td>

                    <td className="py-3.5 px-6 font-bold text-[#1F1B2E]">
                      {stu.full_name}
                    </td>

                    <td className="py-3.5 px-6">
                      {mark.absent ? (
                        <span className="px-3 py-1 bg-[#F27D8D]/15 text-[#F27D8D] font-bold text-xs rounded-full">
                          ABSENT
                        </span>
                      ) : (
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={mark.obtained !== null ? mark.obtained : ''}
                          onChange={(e) => handleScoreChange(stu.id, e.target.value)}
                          className="w-24 bg-[#F4F3F8] text-sm font-bold text-[#1F1B2E] px-3 py-1 rounded-xl border border-transparent focus:border-[#7048E8] focus:bg-white outline-none"
                        />
                      )}
                    </td>

                    <td className="py-3.5 px-6">
                      <span className={`text-xs font-bold ${pct >= 40 ? 'text-[#2FA36B]' : 'text-[#F27D8D]'}`}>
                        {mark.absent ? '-' : `${pct}%`}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleToggleAbsent(stu.id)}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition ${
                          mark.absent
                            ? 'bg-[#F27D8D] text-white'
                            : 'bg-[#F4F3F8] text-[#6B6880] hover:text-[#1F1B2E]'
                        }`}
                      >
                        {mark.absent ? 'Marked Absent' : 'Mark Absent'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
