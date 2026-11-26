import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Banknote,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bell
} from 'lucide-react';
import { schoolStore } from '../lib/store';
import { formatCurrency } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return schoolStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const totalStudents = schoolStore.students.filter(s => s.status === 'active').length;
  const totalTeachers = schoolStore.teachers.filter(t => t.active).length;
  
  // Attendance calculations for today (2026-11-26)
  const todayAtt = schoolStore.attendance.filter(a => a.date === '2026-11-26');
  const presentCount = todayAtt.filter(a => a.status === 'present').length;
  const absentCount = todayAtt.filter(a => a.status === 'absent').length;
  const lateCount = todayAtt.filter(a => a.status === 'late').length;
  const leaveCount = todayAtt.filter(a => a.status === 'leave').length;
  const totalMarked = todayAtt.length || 1;
  const attendanceRate = Math.round((presentCount / totalMarked) * 100);

  // Fee calculation for current month
  const currentMonthFees = schoolStore.fees.filter(f => f.month === '2026-11-01');
  const paidFeesCount = currentMonthFees.filter(f => f.status === 'paid').length;
  const pendingFeesCount = currentMonthFees.filter(f => f.status === 'pending').length;
  const pendingAmount = pendingFeesCount * schoolStore.monthlyFeeAmount;

  // 3+ consecutive days absent alerts
  const consecutiveAbsentees = schoolStore.getConsecutiveAbsentStudents();

  // Monthly Expenses
  const totalExpenses = schoolStore.expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-8">
      {/* Lavender Gradient Greeting Banner */}
      <div className="p-8 rounded-[24px] gradient-header shadow-soft border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 bg-[#EEE9FD] text-[#7048E8] rounded-full text-xs font-bold uppercase tracking-wider">
            Academic Term 2026-2027
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1F1B2E] mt-2">
            Welcome back, Headmaster Office
          </h1>
          <p className="text-sm text-[#6B6880] mt-1">
            System running normally. 15 Sections active with {totalStudents} enrolled students.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/attendance"
            className="px-5 py-2.5 bg-[#7048E8] text-white text-sm font-semibold rounded-full shadow-md shadow-[#7048E8]/20 hover:bg-[#5E37D3] transition flex items-center gap-2"
          >
            <span>Review Today's Attendance</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 6 Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-[22px] shadow-soft border border-white hover:border-[#EEE9FD] transition">
          <div className="w-10 h-10 rounded-2xl bg-[#EEE9FD] text-[#7048E8] flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-[#6B6880]">Active Students</p>
          <p className="text-2xl font-extrabold text-[#1F1B2E] mt-0.5">{totalStudents}</p>
          <p className="text-[11px] text-[#2FA36B] font-semibold mt-1">Grades 6 to 10 (15 Sec)</p>
        </div>

        {/* Teaching Faculty */}
        <div className="bg-white p-5 rounded-[22px] shadow-soft border border-white hover:border-[#EEE9FD] transition">
          <div className="w-10 h-10 rounded-2xl bg-[#EEE9FD] text-[#7048E8] flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-[#6B6880]">Teaching Faculty</p>
          <p className="text-2xl font-extrabold text-[#1F1B2E] mt-0.5">{totalTeachers}</p>
          <p className="text-[11px] text-[#6B6880] font-semibold mt-1">Subject Specialists</p>
        </div>

        {/* Attendance Today */}
        <div className="bg-white p-5 rounded-[22px] shadow-soft border border-white hover:border-[#EEE9FD] transition">
          <div className="w-10 h-10 rounded-2xl bg-[#7048E8]/10 text-[#7048E8] flex items-center justify-center mb-3">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-[#6B6880]">Today's Attendance</p>
          <p className="text-2xl font-extrabold text-[#7048E8] mt-0.5">{attendanceRate}%</p>
          <p className="text-[11px] text-[#6B6880] font-semibold mt-1">{presentCount} Present / {absentCount} Absent</p>
        </div>

        {/* Pending Fee Amount */}
        <div className="bg-white p-5 rounded-[22px] shadow-soft border border-white hover:border-[#EEE9FD] transition">
          <div className="w-10 h-10 rounded-2xl bg-[#F27D8D]/15 text-[#F27D8D] flex items-center justify-center mb-3">
            <Banknote className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-[#6B6880]">Pending Fees</p>
          <p className="text-2xl font-extrabold text-[#F27D8D] mt-0.5">{formatCurrency(pendingAmount)}</p>
          <p className="text-[11px] text-[#6B6880] font-semibold mt-1">{pendingFeesCount} students pending</p>
        </div>

        {/* 3+ Days Absent Alert */}
        <div className="bg-white p-5 rounded-[22px] shadow-soft border border-white hover:border-[#EEE9FD] transition">
          <div className="w-10 h-10 rounded-2xl bg-[#F6C177]/20 text-[#D97706] flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-[#6B6880]">3+ Days Absent Alert</p>
          <p className="text-2xl font-extrabold text-[#D97706] mt-0.5">{consecutiveAbsentees.length}</p>
          <p className="text-[11px] text-[#D97706] font-semibold mt-1">Requires follow-up</p>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white p-5 rounded-[22px] shadow-soft border border-white hover:border-[#EEE9FD] transition">
          <div className="w-10 h-10 rounded-2xl bg-[#2FA36B]/15 text-[#2FA36B] flex items-center justify-center mb-3">
            <Receipt className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-[#6B6880]">Total Expenses</p>
          <p className="text-2xl font-extrabold text-[#1F1B2E] mt-0.5">{formatCurrency(totalExpenses)}</p>
          <p className="text-[11px] text-[#2FA36B] font-semibold mt-1">This month recorded</p>
        </div>
      </div>

      {/* Middle Grid: Attendance Breakdown + 3+ Days Absent Attention Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Ring & Summary Card */}
        <div className="bg-white p-6 rounded-[24px] shadow-soft border border-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-[#1F1B2E]">Attendance Breakdown</h2>
              <span className="text-xs font-semibold text-[#6B6880]">Today</span>
            </div>

            {/* Circular summary visual */}
            <div className="flex items-center justify-center my-6">
              <div className="relative w-40 h-40 rounded-full border-8 border-[#7048E8] flex items-center justify-center bg-[#EEE9FD]/30 shadow-inner">
                <div className="text-center">
                  <span className="text-3xl font-black text-[#1F1B2E]">{attendanceRate}%</span>
                  <p className="text-[11px] font-semibold text-[#6B6880] uppercase tracking-wider">Overall</p>
                </div>
              </div>
            </div>

            {/* Attendance Legends */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8F7FC]">
                <div className="w-3 h-3 rounded-full bg-[#7048E8]" />
                <div>
                  <p className="text-xs font-bold text-[#1F1B2E]">{presentCount} Present</p>
                  <p className="text-[10px] text-[#6B6880]">In class</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8F7FC]">
                <div className="w-3 h-3 rounded-full bg-[#F27D8D]" />
                <div>
                  <p className="text-xs font-bold text-[#1F1B2E]">{absentCount} Absent</p>
                  <p className="text-[10px] text-[#6B6880]">Unexcused</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8F7FC]">
                <div className="w-3 h-3 rounded-full bg-[#F6C177]" />
                <div>
                  <p className="text-xs font-bold text-[#1F1B2E]">{lateCount} Late</p>
                  <p className="text-[10px] text-[#6B6880]">Tardy arrivals</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8F7FC]">
                <div className="w-3 h-3 rounded-full bg-[#64748B]" />
                <div>
                  <p className="text-xs font-bold text-[#1F1B2E]">{leaveCount} Leave</p>
                  <p className="text-[10px] text-[#6B6880]">Approved</p>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/attendance"
            className="mt-6 text-center text-xs font-bold text-[#7048E8] hover:underline"
          >
            Open Complete Attendance Register →
          </Link>
        </div>

        {/* 3+ Days Consecutive Absent List (P2 Requirement) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[24px] shadow-soft border border-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#F27D8D]" />
                <h2 className="font-bold text-lg text-[#1F1B2E]">Persistent Absence Alerts (3+ Days)</h2>
              </div>
              <span className="px-2.5 py-1 bg-[#F27D8D]/10 text-[#F27D8D] rounded-full text-xs font-bold">
                {consecutiveAbsentees.length} Students
              </span>
            </div>

            <p className="text-xs text-[#6B6880] mb-4">
              Automated SQL gap-and-island detection for students absent on 3 or more consecutive school sessions.
            </p>

            <div className="space-y-2.5">
              {consecutiveAbsentees.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#6B6880]">
                  <CheckCircle2 className="w-8 h-8 text-[#2FA36B] mx-auto mb-2" />
                  No students with 3 or more consecutive absences.
                </div>
              ) : (
                consecutiveAbsentees.map((item) => (
                  <div
                    key={item.student.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E9E6F2] hover:bg-white hover:shadow-sm transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F27D8D]/15 text-[#F27D8D] font-bold text-xs flex items-center justify-center">
                        R{item.student.roll_no}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1F1B2E]">{item.student.full_name}</p>
                        <p className="text-xs text-[#6B6880]">
                          Class {item.section.grade}-{item.section.name} • Father: {item.student.father_name} • Tel: {item.student.phone1}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-[#F27D8D] text-white text-xs font-bold rounded-full">
                        {item.consecutiveDays} Consecutive Days
                      </span>
                      <Link
                        to={`/students?search=${encodeURIComponent(item.student.full_name)}`}
                        className="px-3 py-1.5 bg-[#EEE9FD] text-[#7048E8] text-xs font-bold rounded-full hover:bg-[#7048E8] hover:text-white transition"
                      >
                        Profile
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#F4F3F8] flex items-center justify-between text-xs text-[#6B6880]">
            <span>School policy mandates telephonic guardian confirmation on day 3.</span>
            <Link to="/students" className="font-bold text-[#7048E8] hover:underline">
              View All Enrolled Students →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Tasks */}
      <div className="bg-white p-6 rounded-[24px] shadow-soft border border-white">
        <h2 className="font-bold text-lg text-[#1F1B2E] mb-4">Quick Administrative Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <Link
            to="/teachers"
            className="p-4 rounded-2xl bg-[#F8F7FC] hover:bg-[#EEE9FD] text-center group transition"
          >
            <Users className="w-6 h-6 text-[#7048E8] mx-auto mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-[#1F1B2E]">Add Teacher</p>
            <p className="text-[10px] text-[#6B6880]">CNIC credentials</p>
          </Link>

          <Link
            to="/students"
            className="p-4 rounded-2xl bg-[#F8F7FC] hover:bg-[#EEE9FD] text-center group transition"
          >
            <GraduationCap className="w-6 h-6 text-[#7048E8] mx-auto mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-[#1F1B2E]">Excel Import</p>
            <p className="text-[10px] text-[#6B6880]">Batch enrolments</p>
          </Link>

          <Link
            to="/attendance"
            className="p-4 rounded-2xl bg-[#F8F7FC] hover:bg-[#EEE9FD] text-center group transition"
          >
            <CalendarCheck className="w-6 h-6 text-[#7048E8] mx-auto mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-[#1F1B2E]">Attendance</p>
            <p className="text-[10px] text-[#6B6880]">Correct or export</p>
          </Link>

          <Link
            to="/fees"
            className="p-4 rounded-2xl bg-[#F8F7FC] hover:bg-[#EEE9FD] text-center group transition"
          >
            <Banknote className="w-6 h-6 text-[#7048E8] mx-auto mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-[#1F1B2E]">Fees Register</p>
            <p className="text-[10px] text-[#6B6880]">Collect & settings</p>
          </Link>

          <Link
            to="/timetable"
            className="p-4 rounded-2xl bg-[#F8F7FC] hover:bg-[#EEE9FD] text-center group transition"
          >
            <Clock className="w-6 h-6 text-[#7048E8] mx-auto mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-[#1F1B2E]">Timetable</p>
            <p className="text-[10px] text-[#6B6880]">Schedule master</p>
          </Link>

          <Link
            to="/notifications"
            className="p-4 rounded-2xl bg-[#F8F7FC] hover:bg-[#EEE9FD] text-center group transition"
          >
            <Bell className="w-6 h-6 text-[#7048E8] mx-auto mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-[#1F1B2E]">Announcement</p>
            <p className="text-[10px] text-[#6B6880]">Send in-app notice</p>
          </Link>
        </div>
      </div>
    </div>
  );
};
