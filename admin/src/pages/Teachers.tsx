import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  KeyRound,
  UserX,
  UserCheck,
  Search,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  GraduationCap,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { schoolStore } from '../lib/store';
import { formatCurrency, formatDate } from '../lib/utils';
import type { Database } from '../types/database';

type Teacher = Database['public']['Tables']['profiles']['Row'];

export const Teachers: React.FC = () => {
  const [, setTick] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState<Teacher | null>(null);
  const [tempPasswordGenerated, setTempPasswordGenerated] = useState<string | null>(null);
  const [showSalaryModal, setShowSalaryModal] = useState<Teacher | null>(null);

  // Form states for Add Teacher
  const [fullName, setFullName] = useState('');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [qualification, setQualification] = useState('');
  const [joiningDate, setJoiningDate] = useState('2026-11-01');
  const [salary, setSalary] = useState('65000');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    return schoolStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const teachers = schoolStore.teachers.filter(t => {
    const q = searchTerm.toLowerCase();
    return (
      t.full_name.toLowerCase().includes(q) ||
      (t.subject && t.subject.toLowerCase().includes(q)) ||
      (t.cnic && t.cnic.includes(q))
    );
  });

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanCnic = cnic.replace(/\D/g, '');
    if (cleanCnic.length !== 13) {
      setFormError('CNIC must be exactly 13 numeric digits (e.g. 3520112345671)');
      return;
    }

    if (!fullName.trim() || !subject.trim()) {
      setFormError('Full Name and Subject are required.');
      return;
    }

    try {
      const newTeacher = schoolStore.addTeacher({
        full_name: fullName.trim(),
        cnic: cleanCnic,
        phone: phone.trim() || null,
        email: email.trim() || `${cleanCnic}@teachers.school.app`,
        address: 'Lahore, Pakistan',
        qualification: qualification.trim() || null,
        photo_path: null,
        subject: subject.trim(),
        joining_date: joiningDate,
        resignation_date: null,
        active: true
      });

      // Clear & Close
      setFullName('');
      setCnic('');
      setPhone('');
      setEmail('');
      setSubject('');
      setQualification('');
      setShowAddModal(false);
      setTempPasswordGenerated(`Teach#${cleanCnic.slice(-4)}`);
      setShowResetModal(newTeacher);
    } catch (err: any) {
      setFormError(err.message || 'Error creating teacher');
    }
  };

  const handleResetPassword = (teacher: Teacher) => {
    const pwd = schoolStore.resetTeacherPassword(teacher.id);
    setTempPasswordGenerated(pwd);
    setShowResetModal(teacher);
  };

  const handleToggleActive = (teacher: Teacher) => {
    const nextState = !teacher.active;
    const confirmMsg = nextState
      ? `Re-activate ${teacher.full_name}?`
      : `Are you sure you want to deactivate ${teacher.full_name}? They will lose access to the teacher mobile app.`;
    
    if (window.confirm(confirmMsg)) {
      schoolStore.updateTeacher(teacher.id, {
        active: nextState,
        resignation_date: nextState ? null : new Date().toISOString().split('T')[0]
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F1B2E]">Faculty & Teachers</h1>
          <p className="text-xs text-[#6B6880] mt-0.5">
            Manage teaching faculty, CNIC synthetic logins, salary details & account status.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-[#7048E8] hover:bg-[#5E37D3] text-white text-sm font-semibold rounded-full shadow-md shadow-[#7048E8]/20 flex items-center gap-2 self-start sm:self-auto transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-[20px] shadow-soft border border-white flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6880]" />
          <input
            type="text"
            placeholder="Search teachers by name, subject or 13-digit CNIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] placeholder-[#6B6880] pl-10 pr-4 py-2 rounded-full border border-transparent focus:border-[#7048E8] focus:bg-white outline-none transition"
          />
        </div>
        <div className="text-xs font-semibold text-[#6B6880] px-3">
          Showing {teachers.length} teachers
        </div>
      </div>

      {/* Teachers Table / Cards */}
      <div className="bg-white rounded-[24px] shadow-soft border border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F4F3F8] text-[11px] font-bold text-[#6B6880] uppercase tracking-wider bg-[#FAF9FD]">
                <th className="py-4 px-6">Teacher Profile</th>
                <th className="py-4 px-6">CNIC Login ID</th>
                <th className="py-4 px-6">Subject / Specialization</th>
                <th className="py-4 px-6">Contact & Email</th>
                <th className="py-4 px-6">Joining Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3F8] text-sm">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-[#F8F7FC] transition">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#EEE9FD] text-[#7048E8] font-bold text-xs flex items-center justify-center">
                        {teacher.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-[#1F1B2E]">{teacher.full_name}</p>
                        <p className="text-xs text-[#6B6880]">{teacher.qualification || 'Educator'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span className="font-mono text-xs font-semibold bg-[#F4F3F8] px-2.5 py-1 rounded-full text-[#1F1B2E]">
                      {teacher.cnic || 'N/A'}
                    </span>
                    <p className="text-[10px] text-[#6B6880] mt-0.5">
                      {teacher.cnic ? `${teacher.cnic}@teachers.school.app` : ''}
                    </p>
                  </td>

                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-[#EEE9FD] text-[#7048E8] text-xs font-bold rounded-full">
                      {teacher.subject}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <p className="text-xs font-medium text-[#1F1B2E]">{teacher.phone || 'No phone'}</p>
                    <p className="text-[11px] text-[#6B6880]">{teacher.email}</p>
                  </td>

                  <td className="py-4 px-6 text-xs text-[#6B6880]">
                    {formatDate(teacher.joining_date)}
                  </td>

                  <td className="py-4 px-6">
                    {teacher.active ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#2FA36B]/15 text-[#2FA36B]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2FA36B]"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#F27D8D]/15 text-[#F27D8D]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F27D8D]"></span>
                        Deactivated
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setShowSalaryModal(teacher)}
                        title="Salary History"
                        className="p-2 rounded-full text-[#6B6880] hover:text-[#7048E8] hover:bg-[#EEE9FD] transition"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleResetPassword(teacher)}
                        title="Reset Temporary Password"
                        className="p-2 rounded-full text-[#6B6880] hover:text-[#7048E8] hover:bg-[#EEE9FD] transition"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleActive(teacher)}
                        title={teacher.active ? 'Deactivate Teacher' : 'Activate Teacher'}
                        className={`p-2 rounded-full transition ${
                          teacher.active
                            ? 'text-[#6B6880] hover:text-[#F27D8D] hover:bg-[#F27D8D]/10'
                            : 'text-[#6B6880] hover:text-[#2FA36B] hover:bg-[#2FA36B]/10'
                        }`}
                      >
                        {teacher.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-[#F4F3F8]">
              <div>
                <h2 className="text-xl font-bold text-[#1F1B2E]">Add Teaching Faculty</h2>
                <p className="text-xs text-[#6B6880] mt-0.5">Enrolls teacher and creates synthetic CNIC login</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-[#6B6880] hover:text-[#1F1B2E]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-[#F27D8D]/10 border border-[#F27D8D]/20 rounded-xl text-xs text-[#F27D8D] font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddTeacher} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Muhammad Aslam"
                  className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">
                  13-Digit National CNIC * (Used as Mobile Login ID)
                </label>
                <input
                  type="text"
                  required
                  maxLength={13}
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  placeholder="3520112345679 (no dashes)"
                  className="w-full font-mono bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none transition"
                />
                <p className="text-[11px] text-[#6B6880] mt-1">
                  Synthetic Auth ID: {cnic ? `${cnic}@teachers.school.app` : '13-digit-cnic@teachers.school.app'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Subject *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Physics / Mathematics"
                    className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. M.Sc, M.Phil"
                    className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Monthly Salary (Rs.)</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="65000"
                    className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F4F3F8]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-[#6B6880] hover:bg-[#F4F3F8] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#7048E8] hover:bg-[#5E37D3] text-white text-xs font-bold rounded-full shadow-md shadow-[#7048E8]/20 transition"
                >
                  Enroll Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Notification Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#EEE9FD] text-[#7048E8] flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1F1B2E]">Temporary Password Set</h3>
            <p className="text-xs text-[#6B6880] mt-1">
              Provide these temporary login credentials to <span className="font-bold text-[#1F1B2E]">{showResetModal.full_name}</span>:
            </p>

            <div className="my-6 p-4 bg-[#F8F7FC] rounded-2xl border border-[#E9E6F2] text-left space-y-2">
              <div>
                <span className="text-[10px] text-[#6B6880] uppercase font-bold">CNIC (Username):</span>
                <p className="font-mono text-sm font-bold text-[#1F1B2E]">{showResetModal.cnic}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#6B6880] uppercase font-bold">Temporary Password:</span>
                <p className="font-mono text-base font-extrabold text-[#7048E8]">{tempPasswordGenerated}</p>
              </div>
            </div>

            <p className="text-[11px] text-[#F27D8D] font-medium mb-6">
              Teacher will be forced to change password upon their first login in the mobile app.
            </p>

            <button
              onClick={() => {
                setShowResetModal(null);
                setTempPasswordGenerated(null);
              }}
              className="w-full py-2.5 bg-[#7048E8] hover:bg-[#5E37D3] text-white text-xs font-bold rounded-full transition"
            >
              Done & Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Salary History Modal */}
      {showSalaryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F4F3F8]">
              <div>
                <h3 className="text-lg font-bold text-[#1F1B2E]">Salary Disbursals</h3>
                <p className="text-xs text-[#6B6880]">{showSalaryModal.full_name} • {showSalaryModal.subject}</p>
              </div>
              <button onClick={() => setShowSalaryModal(null)} className="p-1.5 text-[#6B6880]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F7FC]">
                <div>
                  <p className="text-xs font-bold text-[#1F1B2E]">November 2026</p>
                  <p className="text-[10px] text-[#6B6880]">Disbursed via Bank Transfer</p>
                </div>
                <span className="text-sm font-extrabold text-[#2FA36B]">Rs. 65,000</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F7FC]">
                <div>
                  <p className="text-xs font-bold text-[#1F1B2E]">October 2026</p>
                  <p className="text-[10px] text-[#6B6880]">Disbursed via Bank Transfer</p>
                </div>
                <span className="text-sm font-extrabold text-[#2FA36B]">Rs. 65,000</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F7FC]">
                <div>
                  <p className="text-xs font-bold text-[#1F1B2E]">September 2026</p>
                  <p className="text-[10px] text-[#6B6880]">Disbursed via Bank Transfer</p>
                </div>
                <span className="text-sm font-extrabold text-[#2FA36B]">Rs. 65,000</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F4F3F8] text-right">
              <button
                onClick={() => setShowSalaryModal(null)}
                className="px-5 py-2 bg-[#F4F3F8] hover:bg-[#EEE9FD] text-xs font-bold text-[#1F1B2E] rounded-full transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
