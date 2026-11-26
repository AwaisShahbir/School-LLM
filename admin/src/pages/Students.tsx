import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  GraduationCap,
  UserPlus,
  FileSpreadsheet,
  Download,
  Search,
  Edit2,
  UserMinus,
  X,
  AlertCircle,
  CheckCircle2,
  Phone,
  FileText
} from 'lucide-react';
import { schoolStore } from '../lib/store';
import { formatDate } from '../lib/utils';
import type { Database } from '../types/database';

type Student = Database['public']['Tables']['students']['Row'];

const GRADES = [6, 7, 8, 9, 10];
const SECTIONS = ['A', 'B', 'C'];

export const Students: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [, setTick] = useState(0);

  const [selectedGrade, setSelectedGrade] = useState<number>(6);
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [markLeftConfirm, setMarkLeftConfirm] = useState<Student | null>(null);

  // Add/Edit Form State
  const [rollNo, setRollNo] = useState<number>(1);
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [bForm, setBForm] = useState('');
  const [dob, setDob] = useState('2012-05-10');
  const [phone1, setPhone1] = useState('');
  const [address, setAddress] = useState('Lahore, Pakistan');
  const [formError, setFormError] = useState<string | null>(null);

  // Bulk import feedback
  const [importStatus, setImportStatus] = useState<{ count: number; errors: string[] } | null>(null);

  useEffect(() => {
    return schoolStore.subscribe(() => setTick(t => t + 1));
  }, []);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearchTerm(q);
  }, [searchParams]);

  // Find target section
  const currentSection = schoolStore.sections.find(
    s => s.grade === selectedGrade && s.name === selectedSection
  );

  // Filter students
  const filteredStudents = schoolStore.students.filter(student => {
    // If search term is entered, search across ALL sections
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchesName = student.full_name.toLowerCase().includes(q);
      const matchesRoll = String(student.roll_no) === q;
      const matchesFather = student.father_name?.toLowerCase().includes(q);
      return (matchesName || matchesRoll || matchesFather);
    }
    // Otherwise filter by active grade & section
    return student.section_id === currentSection?.id;
  }).sort((a, b) => a.roll_no - b.roll_no);

  const handleOpenAdd = () => {
    // Find next available roll number in section
    const secStudents = schoolStore.students.filter(s => s.section_id === currentSection?.id && s.status === 'active');
    const maxRoll = secStudents.length ? Math.max(...secStudents.map(s => s.roll_no)) : 0;
    setRollNo(maxRoll + 1);
    setFullName('');
    setFatherName('');
    setBForm('');
    setDob('2012-05-10');
    setPhone1('0300');
    setAddress('Lahore, Pakistan');
    setFormError(null);
    setShowAddModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!currentSection) return;

    try {
      if (editingStudent) {
        schoolStore.updateStudent(editingStudent.id, {
          roll_no: Number(rollNo),
          full_name: fullName.trim(),
          father_name: fatherName.trim() || null,
          b_form: bForm.trim() || null,
          dob,
          phone1: phone1.trim() || null,
          address: address.trim() || null
        });
        setEditingStudent(null);
      } else {
        schoolStore.addStudent({
          section_id: currentSection.id,
          roll_no: Number(rollNo),
          full_name: fullName.trim(),
          father_name: fatherName.trim() || null,
          b_form: bForm.trim() || null,
          dob,
          phone1: phone1.trim() || null,
          phone2: null,
          address: address.trim() || null,
          admission_date: new Date().toISOString().split('T')[0],
          status: 'active',
          left_date: null
        });
        setShowAddModal(false);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error saving student');
    }
  };

  const handleEditClick = (stu: Student) => {
    setEditingStudent(stu);
    setRollNo(stu.roll_no);
    setFullName(stu.full_name);
    setFatherName(stu.father_name || '');
    setBForm(stu.b_form || '');
    setDob(stu.dob || '2012-05-10');
    setPhone1(stu.phone1 || '');
    setAddress(stu.address || '');
    setFormError(null);
  };

  const handleMarkLeft = (stu: Student) => {
    schoolStore.markStudentLeft(stu.id);
    setMarkLeftConfirm(null);
  };

  // Export current section to Excel
  const handleExportExcel = () => {
    const data = filteredStudents.map(s => {
      const sec = schoolStore.sections.find(sec => sec.id === s.section_id);
      return {
        'Class': `Grade ${sec?.grade}-${sec?.name}`,
        'Roll No': s.roll_no,
        'Student Name': s.full_name,
        'Father Name': s.father_name || '',
        'B-Form': s.b_form || '',
        'Date of Birth': s.dob || '',
        'Contact Number': s.phone1 || '',
        'Admission Date': s.admission_date,
        'Status': s.status
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Class_${selectedGrade}_${selectedSection}`);
    XLSX.writeFile(workbook, `Students_Grade_${selectedGrade}_${selectedSection}.xlsx`);
  };

  // Bulk Excel Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        const formatted = data.map((row: any) => ({
          grade: Number(row.Grade || row.grade || row.Class || selectedGrade),
          section: String(row.Section || row.section || selectedSection),
          roll_no: Number(row.RollNo || row['Roll No'] || row.roll_no),
          full_name: String(row.Name || row['Student Name'] || row.full_name || 'Student'),
          father_name: String(row.FatherName || row['Father Name'] || ''),
          b_form: String(row.BForm || row['B-Form'] || ''),
          dob: String(row.DOB || row['Date of Birth'] || '2012-01-01'),
          phone1: String(row.Phone || row['Contact Number'] || '')
        }));

        const res = schoolStore.bulkImportStudents(formatted);
        setImportStatus({ count: res.successCount, errors: res.errors });
      } catch (err: any) {
        alert(`Failed to process Excel file: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F1B2E]">Student Management</h1>
          <p className="text-xs text-[#6B6880] mt-0.5">
            Enrolment registers for Grades 6 through 10, sections A, B & C.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-white border border-[#E9E6F2] hover:border-[#7048E8] text-[#1F1B2E] text-xs font-bold rounded-full shadow-sm flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#2FA36B]" />
            <span>Excel Import</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-white border border-[#E9E6F2] hover:border-[#7048E8] text-[#1F1B2E] text-xs font-bold rounded-full shadow-sm flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-[#7048E8]" />
            <span>Export List</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-[#7048E8] hover:bg-[#5E37D3] text-white text-xs font-bold rounded-full shadow-md shadow-[#7048E8]/20 flex items-center gap-2 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Class & Section Navigation Tabs */}
      <div className="bg-white p-4 rounded-[22px] shadow-soft border border-white space-y-3">
        {/* Grade Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-[#6B6880] uppercase tracking-wider mr-2">Class:</span>
          {GRADES.map(grade => (
            <button
              key={grade}
              onClick={() => {
                setSelectedGrade(grade);
                setSearchTerm('');
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                selectedGrade === grade && !searchTerm
                  ? 'bg-[#7048E8] text-white shadow-sm'
                  : 'bg-[#F4F3F8] text-[#6B6880] hover:text-[#1F1B2E]'
              }`}
            >
              Grade {grade}
            </button>
          ))}
        </div>

        {/* Section Pills & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#F4F3F8]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#6B6880] uppercase tracking-wider mr-2">Section:</span>
            {SECTIONS.map(sec => (
              <button
                key={sec}
                onClick={() => {
                  setSelectedSection(sec);
                  setSearchTerm('');
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedSection === sec && !searchTerm
                    ? 'bg-[#EEE9FD] text-[#7048E8]'
                    : 'bg-[#F4F3F8] text-[#6B6880] hover:text-[#1F1B2E]'
                }`}
              >
                Section {sec}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6880]" />
            <input
              type="text"
              placeholder="Find by roll number or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F4F3F8] text-xs text-[#1F1B2E] placeholder-[#6B6880] pl-9 pr-4 py-1.5 rounded-full border border-transparent focus:border-[#7048E8] focus:bg-white outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-[24px] shadow-soft border border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F4F3F8] text-[11px] font-bold text-[#6B6880] uppercase tracking-wider bg-[#FAF9FD]">
                <th className="py-4 px-6">Roll No</th>
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6">Father's Name</th>
                <th className="py-4 px-6">Class / Sec</th>
                <th className="py-4 px-6">B-Form</th>
                <th className="py-4 px-6">Contact Number</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3F8] text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#6B6880]">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {
                  const sec = schoolStore.sections.find(s => s.id === stu.section_id);
                  return (
                    <tr key={stu.id} className="hover:bg-[#F8F7FC] transition">
                      <td className="py-3.5 px-6 font-bold text-[#7048E8]">
                        #{stu.roll_no}
                      </td>

                      <td className="py-3.5 px-6 font-bold text-[#1F1B2E]">
                        {stu.full_name}
                      </td>

                      <td className="py-3.5 px-6 text-xs text-[#6B6880]">
                        {stu.father_name || '-'}
                      </td>

                      <td className="py-3.5 px-6">
                        <span className="px-2.5 py-0.5 bg-[#EEE9FD] text-[#7048E8] text-xs font-bold rounded-full">
                          {sec?.grade}-{sec?.name}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 font-mono text-xs text-[#6B6880]">
                        {stu.b_form || '-'}
                      </td>

                      <td className="py-3.5 px-6 text-xs text-[#1F1B2E]">
                        {stu.phone1 || '-'}
                      </td>

                      <td className="py-3.5 px-6">
                        {stu.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#2FA36B]/15 text-[#2FA36B]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2FA36B]"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F27D8D]/15 text-[#F27D8D]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F27D8D]"></span>
                            Left School
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(stu)}
                            title="Edit Student"
                            className="p-1.5 rounded-full text-[#6B6880] hover:text-[#7048E8] hover:bg-[#EEE9FD] transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {stu.status === 'active' && (
                            <button
                              onClick={() => setMarkLeftConfirm(stu)}
                              title="Mark as Left School"
                              className="p-1.5 rounded-full text-[#6B6880] hover:text-[#F27D8D] hover:bg-[#F27D8D]/10 transition"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {(showAddModal || editingStudent) && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-[#F4F3F8]">
              <div>
                <h2 className="text-xl font-bold text-[#1F1B2E]">
                  {editingStudent ? 'Edit Student Details' : `Enrol Student in Class ${selectedGrade}-${selectedSection}`}
                </h2>
                <p className="text-xs text-[#6B6880] mt-0.5">Fill verified bio data and guardian contact information</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingStudent(null);
                }}
                className="p-1.5 text-[#6B6880]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-[#F27D8D]/10 border border-[#F27D8D]/20 rounded-xl text-xs text-[#F27D8D] font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="space-y-4 mt-6">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Roll No *</label>
                  <input
                    type="number"
                    required
                    value={rollNo}
                    onChange={(e) => setRollNo(Number(e.target.value))}
                    className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none transition"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Daniyal Khan"
                    className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Father's Name</label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">B-Form / CNIC</label>
                  <input
                    type="text"
                    value={bForm}
                    onChange={(e) => setBForm(e.target.value)}
                    placeholder="35202-1234567-1"
                    className="w-full font-mono bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Primary Phone</label>
                  <input
                    type="text"
                    value={phone1}
                    onChange={(e) => setPhone1(e.target.value)}
                    placeholder="03121234567"
                    className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Residential Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="City, District"
                    className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F4F3F8]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingStudent(null);
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-[#6B6880] hover:bg-[#F4F3F8] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#7048E8] hover:bg-[#5E37D3] text-white text-xs font-bold rounded-full shadow-md shadow-[#7048E8]/20 transition"
                >
                  {editingStudent ? 'Save Updates' : 'Enrol Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Left Confirmation Dialog */}
      {markLeftConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F27D8D]/15 text-[#F27D8D] flex items-center justify-center mx-auto mb-4">
              <UserMinus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1F1B2E]">Mark Student as Left?</h3>
            <p className="text-xs text-[#6B6880] mt-2 leading-relaxed">
              Are you sure you want to change status to <span className="font-bold text-[#F27D8D]">Left</span> for{' '}
              <span className="font-bold text-[#1F1B2E]">{markLeftConfirm.full_name}</span> (Roll #{markLeftConfirm.roll_no})?
              All historic marks, fees, and attendance records are permanently preserved in the database.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setMarkLeftConfirm(null)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-[#6B6880] hover:bg-[#F4F3F8] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMarkLeft(markLeftConfirm)}
                className="px-6 py-2.5 bg-[#F27D8D] hover:bg-[#e06878] text-white text-xs font-bold rounded-full shadow-md shadow-[#F27D8D]/20 transition"
              >
                Confirm Mark as Left
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#F4F3F8]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#2FA36B]" />
                <h3 className="text-lg font-bold text-[#1F1B2E]">Bulk Student Import from Excel</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-1.5 text-[#6B6880]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6B6880] my-4 leading-relaxed">
              Select an Excel spreadsheet (.xlsx or .xls) with columns: <b>Grade, Section, Roll No, Student Name, Father Name, B-Form, DOB, Phone</b>.
              The parser automatically verifies uniqueness and enrolls up to 800+ students in seconds.
            </p>

            <div className="p-6 border-2 border-dashed border-[#7048E8]/30 rounded-2xl bg-[#EEE9FD]/20 text-center hover:bg-[#EEE9FD]/40 transition cursor-pointer relative">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileSpreadsheet className="w-10 h-10 text-[#7048E8] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#1F1B2E]">Click to Choose Excel File or Drag Here</p>
              <p className="text-xs text-[#6B6880] mt-1">Accepts standard .xlsx and .csv files</p>
            </div>

            {importStatus && (
              <div className="mt-4 p-4 rounded-xl bg-[#F8F7FC] border border-[#E9E6F2] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2FA36B]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Successfully imported {importStatus.count} students!</span>
                </div>
                {importStatus.errors.length > 0 && (
                  <div className="text-[11px] text-[#F27D8D] space-y-1 max-h-32 overflow-y-auto">
                    {importStatus.errors.map((e, idx) => (
                      <p key={idx}>• {e}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportStatus(null);
                }}
                className="px-6 py-2.5 bg-[#7048E8] text-white text-xs font-bold rounded-full hover:bg-[#5E37D3] transition"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
