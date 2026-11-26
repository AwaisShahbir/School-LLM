import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Trophy,
  Download,
  UserPlus,
  Users,
  X,
  AlertCircle
} from 'lucide-react';
import { schoolStore } from '../lib/store';
import type { Database } from '../types/database';

export const Sports: React.FC = () => {
  const [, setTick] = useState(0);
  const [selectedGameId, setSelectedGameId] = useState<string>(schoolStore.games[0]?.id || 'game-1');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const [studentRoll, setStudentRoll] = useState('');
  const [studentGrade, setStudentGrade] = useState('6');
  const [studentSection, setStudentSection] = useState('A');
  const [sportSlotId, setSportSlotId] = useState('');
  const [roleDetails, setRoleDetails] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    return schoolStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const activeGame = schoolStore.games.find(g => g.id === selectedGameId);
  const gameSlots = schoolStore.gameSlots.filter(s => s.game_id === selectedGameId);

  // Registrations for this game
  const registrations = schoolStore.sportRegistrations.filter(r => 
    gameSlots.some(s => s.id === r.slot_id)
  );

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const targetSec = schoolStore.sections.find(
      sec => sec.grade === Number(studentGrade) && sec.name === studentSection
    );
    if (!targetSec) {
      setErrorMsg("Section not found");
      return;
    }

    const student = schoolStore.students.find(
      s => s.section_id === targetSec.id && s.roll_no === Number(studentRoll) && s.status === 'active'
    );
    if (!student) {
      setErrorMsg(`Student with Roll #${studentRoll} not found in Grade ${studentGrade}-${studentSection}`);
      return;
    }

    try {
      schoolStore.registerStudentSport(sportSlotId || gameSlots[0].id, student.id, roleDetails || 'Squad player');
      setShowRegisterModal(false);
      setStudentRoll('');
      setRoleDetails('');
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Export Per-Game List to Excel
  const handleExportGameExcel = () => {
    const data = registrations.map(reg => {
      const stu = schoolStore.students.find(s => s.id === reg.student_id);
      const sec = schoolStore.sections.find(s => s.id === stu?.section_id);
      const slot = schoolStore.gameSlots.find(s => s.id === reg.slot_id);
      return {
        'Sport': activeGame?.name,
        'Team / Slot': slot?.label,
        'Class': `Grade ${sec?.grade}-${sec?.name}`,
        'Roll No': stu?.roll_no,
        'Student Name': stu?.full_name,
        'Father Name': stu?.father_name || '',
        'Player Role': reg.details || '',
        'Contact Phone': stu?.phone1 || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${activeGame?.name}_Roster`);
    XLSX.writeFile(workbook, `Sports_Roster_${activeGame?.name}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F1B2E]">Sports & Athletic Clubs</h1>
          <p className="text-xs text-[#6B6880] mt-0.5">
            Manage sports teams, slot capacities, squad rosters & per-game player exports.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportGameExcel}
            className="px-4 py-2 bg-white border border-[#E9E6F2] hover:border-[#7048E8] text-[#1F1B2E] text-xs font-bold rounded-full shadow-sm flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-[#7048E8]" />
            <span>Export Game Roster</span>
          </button>

          <button
            onClick={() => {
              setSportSlotId(gameSlots[0]?.id || '');
              setShowRegisterModal(true);
            }}
            className="px-5 py-2.5 bg-[#7048E8] hover:bg-[#5E37D3] text-white text-xs font-bold rounded-full shadow-md shadow-[#7048E8]/20 flex items-center gap-2 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enrol Player in Squad</span>
          </button>
        </div>
      </div>

      {/* Game Selector Pills */}
      <div className="bg-white p-4 rounded-[22px] shadow-soft border border-white flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-[#6B6880] uppercase mr-2">Sport:</span>
        {schoolStore.games.map(g => (
          <button
            key={g.id}
            onClick={() => setSelectedGameId(g.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              selectedGameId === g.id ? 'bg-[#7048E8] text-white shadow-sm' : 'bg-[#F4F3F8] text-[#6B6880]'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Game Slots Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {gameSlots.map(slot => {
          const regCount = schoolStore.sportRegistrations.filter(r => r.slot_id === slot.id).length;
          return (
            <div key={slot.id} className="bg-white p-5 rounded-[22px] shadow-soft border border-white">
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 bg-[#EEE9FD] text-[#7048E8] rounded-full text-xs font-bold">
                  {slot.label}
                </span>
                <span className="text-xs font-bold text-[#6B6880]">
                  Capacity: {regCount} / {slot.capacity}
                </span>
              </div>
              <div className="w-full bg-[#F4F3F8] h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-[#7048E8] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((regCount / slot.capacity) * 100))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Enrolled Players Table */}
      <div className="bg-white rounded-[24px] shadow-soft border border-white overflow-hidden">
        <div className="p-4 bg-[#FAF9FD] border-b border-[#F4F3F8] text-xs font-bold text-[#6B6880]">
          Active {activeGame?.name} Squad Roster ({registrations.length} Players Registered)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F4F3F8] text-[11px] font-bold text-[#6B6880] uppercase tracking-wider bg-white">
                <th className="py-4 px-6">Class / Sec</th>
                <th className="py-4 px-6">Roll No</th>
                <th className="py-4 px-6">Player Name</th>
                <th className="py-4 px-6">Father Name</th>
                <th className="py-4 px-6">Position / Role</th>
                <th className="py-4 px-6">Slot Group</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3F8] text-sm">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#6B6880]">
                    No students currently registered in {activeGame?.name}.
                  </td>
                </tr>
              ) : (
                registrations.map(r => {
                  const stu = schoolStore.students.find(s => s.id === r.student_id);
                  const sec = schoolStore.sections.find(s => s.id === stu?.section_id);
                  const slot = schoolStore.gameSlots.find(s => s.id === r.slot_id);
                  return (
                    <tr key={r.id} className="hover:bg-[#F8F7FC] transition">
                      <td className="py-3.5 px-6">
                        <span className="px-2.5 py-0.5 bg-[#EEE9FD] text-[#7048E8] text-xs font-bold rounded-full">
                          {sec?.grade}-{sec?.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-bold text-[#7048E8]">#{stu?.roll_no}</td>
                      <td className="py-3.5 px-6 font-bold text-[#1F1B2E]">{stu?.full_name}</td>
                      <td className="py-3.5 px-6 text-xs text-[#6B6880]">{stu?.father_name || '-'}</td>
                      <td className="py-3.5 px-6 font-medium text-xs text-[#1F1B2E]">{r.details || 'Squad member'}</td>
                      <td className="py-3.5 px-6 text-xs text-[#6B6880]">{slot?.label}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enrol Player Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F4F3F8]">
              <h3 className="text-lg font-bold text-[#1F1B2E]">Register for {activeGame?.name}</h3>
              <button onClick={() => setShowRegisterModal(false)} className="p-1.5 text-[#6B6880]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="my-4 p-3 bg-[#F27D8D]/10 border border-[#F27D8D]/20 rounded-xl text-xs text-[#F27D8D] font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4 my-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Grade *</label>
                  <select
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value)}
                    className="w-full bg-[#F4F3F8] text-xs font-bold text-[#1F1B2E] px-3 py-2.5 rounded-[14px] outline-none"
                  >
                    {[6, 7, 8, 9, 10].map(g => (
                      <option key={g} value={g}>Class {g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Section *</label>
                  <select
                    value={studentSection}
                    onChange={(e) => setStudentSection(e.target.value)}
                    className="w-full bg-[#F4F3F8] text-xs font-bold text-[#1F1B2E] px-3 py-2.5 rounded-[14px] outline-none"
                  >
                    {['A', 'B', 'C'].map(s => (
                      <option key={s} value={s}>Section {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Roll Number *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                  className="w-full bg-[#F4F3F8] text-sm font-bold text-[#1F1B2E] px-4 py-2.5 rounded-[14px] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Select Team Slot *</label>
                <select
                  value={sportSlotId}
                  onChange={(e) => setSportSlotId(e.target.value)}
                  className="w-full bg-[#F4F3F8] text-xs font-bold text-[#1F1B2E] px-3 py-2.5 rounded-[14px] outline-none"
                >
                  {gameSlots.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Player Position / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Fast Bowler / Striker"
                  value={roleDetails}
                  onChange={(e) => setRoleDetails(e.target.value)}
                  className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#F4F3F8]">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-5 py-2 text-xs font-bold text-[#6B6880]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#7048E8] hover:bg-[#5E37D3] text-white text-xs font-bold rounded-full transition"
                >
                  Enrol in Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
