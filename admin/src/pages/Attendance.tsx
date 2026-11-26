import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  CalendarCheck,
  Calendar,
  Download,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Users
} from 'lucide-react';
import { schoolStore } from '../lib/store';
import { formatDate } from '../lib/utils';
import type { Database, AttendanceStatus } from '../types/database';

const GRADES = [6, 7, 8, 9, 10];
const SECTIONS = ['A', 'B', 'C'];

export const Attendance: React.FC = () => {
  const [, setTick] = useState(0);

  const [selectedGrade, setSelectedGrade] = useState<number>(6);
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-26');

  // Local working state for the attendance grid
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    return schoolStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const currentSection = schoolStore.sections.find(
    s => s.grade === selectedGrade && s.name === selectedSection
  );

  // Load attendance whenever section or date changes
  useEffect(() => {
    if (!currentSection) return;
    const records = schoolStore.getAttendanceForSection(currentSection.id, selectedDate);
    const map: Record<string, AttendanceStatus> = {};
    records.forEach(r => {
      map[r.student.id] = r.status;
    });
    setAttendanceMap(map);
    setHasChanges(false);
    setSaveSuccess(false);
  }, [currentSection, selectedDate]);

  const students = currentSection
    ? schoolStore.students.filter(s => s.section_id === currentSection.id && s.status === 'active')
    : [];

  const handleToggleStatus = (studentId: string) => {
    const order: AttendanceStatus[] = ['present', 'absent', 'late', 'leave'];
    const current = attendanceMap[studentId] || 'present';
    const nextIdx = (order.indexOf(current) + 1) % order.length;
    const nextStatus = order[nextIdx];

    setAttendanceMap(prev => ({ ...prev, [studentId]: nextStatus }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      updated[s.id] = 'present';
    });
    setAttendanceMap(updated);
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = () => {
    const records = Object.entries(attendanceMap).map(([student_id, status]) => ({
      student_id,
      status
    }));
    schoolStore.saveAttendance(selectedDate, records);
    setHasChanges(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Live counters
  const total = students.length;
  const presentCount = students.filter(s => (attendanceMap[s.id] || 'present') === 'present').length;
  const absentCount = students.filter(s => attendanceMap[s.id] === 'absent').length;
  const lateCount = students.filter(s => attendanceMap[s.id] === 'late').length;
  const leaveCount = students.filter(s => attendanceMap[s.id] === 'leave').length;

  // Export to Excel
  const handleExportExcel = () => {
    const data = students.map(s => {
      const st = attendanceMap[s.id] || 'present';
      return {
        'Date': selectedDate,
        'Class': `Grade ${selectedGrade}-${selectedSection}`,
        'Roll No': s.roll_no,
        'Student Name': s.full_name,
        'Father Name': s.father_name || '',
        'Attendance Status': st.toUpperCase()
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Attendance_${selectedDate}`);
    XLSX.writeFile(workbook, `Attendance_Grade_${selectedGrade}_${selectedSection}_${selectedDate}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F1B2E]">Daily Attendance Register</h1>
          <p className="text-xs text-[#6B6880] mt-0.5">
            View, mark, and rectify daily student roll-call with audit trail logging.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-white border border-[#E9E6F2] hover:border-[#7048E8] text-[#1F1B2E] text-xs font-bold rounded-full shadow-sm flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-[#7048E8]" />
            <span>Export Register (.xlsx)</span>
          </button>

          <button
            onClick={handleMarkAllPresent}
            className="px-4 py-2 bg-[#EEE9FD] text-[#7048E8] text-xs font-bold rounded-full hover:bg-[#7048E8] hover:text-white transition"
          >
            Mark All Present
          </button>

          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-6 py-2.5 bg-[#7048E8] hover:bg-[#5E37D3] disabled:opacity-50 text-white text-xs font-bold rounded-full shadow-md shadow-[#7048E8]/20 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Register</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-[#2FA36B]/15 border border-[#2FA36B]/30 rounded-2xl text-xs font-bold text-[#2FA36B] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Attendance saved for Class {selectedGrade}-{selectedSection} on {formatDate(selectedDate)} successfully!</span>
        </div>
      )}

      {/* Class, Section, and Date Selector */}
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

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#7048E8]" />
          <span className="text-xs font-bold text-[#6B6880]">Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#F4F3F8] text-xs font-bold text-[#1F1B2E] px-3 py-1.5 rounded-full border border-transparent focus:border-[#7048E8] focus:bg-white outline-none"
          />
        </div>
      </div>

      {/* Live Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-[20px] shadow-soft border border-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#6B6880]">Present</p>
            <p className="text-xl font-extrabold text-[#7048E8] mt-0.5">{presentCount} / {total}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#EEE9FD] text-[#7048E8] flex items-center justify-center font-bold text-xs">
            {total ? Math.round((presentCount / total) * 100) : 0}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-[20px] shadow-soft border border-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#6B6880]">Absent</p>
            <p className="text-xl font-extrabold text-[#F27D8D] mt-0.5">{absentCount}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#F27D8D]/15 text-[#F27D8D] flex items-center justify-center font-bold text-xs">
            {absentCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-[20px] shadow-soft border border-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#6B6880]">Late</p>
            <p className="text-xl font-extrabold text-[#F6C177] mt-0.5">{lateCount}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#F6C177]/20 text-[#D97706] flex items-center justify-center font-bold text-xs">
            {lateCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-[20px] shadow-soft border border-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#6B6880]">Leave</p>
            <p className="text-xl font-extrabold text-[#64748B] mt-0.5">{leaveCount}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#64748B]/15 text-[#64748B] flex items-center justify-center font-bold text-xs">
            {leaveCount}
          </div>
        </div>
      </div>

      {/* Attendance Interactive Table */}
      <div className="bg-white rounded-[24px] shadow-soft border border-white overflow-hidden">
        <div className="p-4 bg-[#FAF9FD] border-b border-[#F4F3F8] flex items-center justify-between text-xs text-[#6B6880]">
          <span>Click status pill to cycle: <b>Present → Absent → Late → Leave</b></span>
          {hasChanges && (
            <span className="text-[#F27D8D] font-bold">Unsaved modifications exist</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F4F3F8] text-[11px] font-bold text-[#6B6880] uppercase tracking-wider bg-white">
                <th className="py-4 px-6">Roll No</th>
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6">Father Name</th>
                <th className="py-4 px-6 text-center">Status (Click to toggle)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3F8] text-sm">
              {students.map((stu) => {
                const status = attendanceMap[stu.id] || 'present';
                return (
                  <tr key={stu.id} className="hover:bg-[#F8F7FC] transition">
                    <td className="py-3 px-6 font-bold text-[#7048E8]">
                      #{stu.roll_no}
                    </td>

                    <td className="py-3 px-6 font-bold text-[#1F1B2E]">
                      {stu.full_name}
                    </td>

                    <td className="py-3 px-6 text-xs text-[#6B6880]">
                      {stu.father_name || '-'}
                    </td>

                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => handleToggleStatus(stu.id)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm ${
                          status === 'present'
                            ? 'bg-[#7048E8] text-white hover:bg-[#5E37D3]'
                            : status === 'absent'
                            ? 'bg-[#F27D8D] text-white hover:bg-[#e06878]'
                            : status === 'late'
                            ? 'bg-[#F6C177] text-[#1F1B2E] hover:bg-[#e5b066]'
                            : 'bg-[#64748B] text-white hover:bg-[#515f72]'
                        }`}
                      >
                        {status === 'present' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {status === 'absent' && <XCircle className="w-3.5 h-3.5" />}
                        {status === 'late' && <Clock className="w-3.5 h-3.5" />}
                        {status === 'leave' && <HelpCircle className="w-3.5 h-3.5" />}
                        <span className="capitalize">{status}</span>
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
