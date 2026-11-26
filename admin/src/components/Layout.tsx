import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  FileSpreadsheet,
  Banknote,
  CalendarDays,
  Bell,
  Trophy,
  Receipt,
  History,
  LogOut,
  Menu,
  X,
  Search,
  School
} from 'lucide-react';
import { schoolStore } from '../lib/store';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Teachers', path: '/teachers', icon: Users },
  { name: 'Students', path: '/students', icon: GraduationCap },
  { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { name: 'Exams & Marks', path: '/marks', icon: FileSpreadsheet },
  { name: 'Fee Management', path: '/fees', icon: Banknote },
  { name: 'Timetable', path: '/timetable', icon: CalendarDays },
  { name: 'Events & Calendar', path: '/events', icon: CalendarDays },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Sports & Games', path: '/sports', icon: Trophy },
  { name: 'School Expenses', path: '/expenses', icon: Receipt },
  { name: 'Audit Trail', path: '/audit', icon: History },
];

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/students?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F3F8] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E9E6F2] py-6 px-4 shrink-0 shadow-sm">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7048E8] to-[#997BF8] flex items-center justify-center text-white shadow-md">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#1F1B2E] tracking-tight leading-tight">Cadet College</h1>
            <p className="text-xs text-[#6B6880] font-medium">Admin Portal</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#EEE9FD] text-[#7048E8] shadow-sm'
                    : 'text-[#6B6880] hover:text-[#1F1B2E] hover:bg-[#F8F7FC]'
                }`
              }
            >
              {({ isActive }) => {
                const Icon = item.icon;
                return (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#7048E8]' : 'text-[#6B6880]'}`} />
                    <span>{item.name}</span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="pt-4 border-t border-[#E9E6F2] mt-4">
          <div className="flex items-center justify-between px-3 py-2 bg-[#F8F7FC] rounded-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#EEE9FD] text-[#7048E8] font-bold text-xs flex items-center justify-center">
                AD
              </div>
              <div>
                <p className="text-xs font-bold text-[#1F1B2E]">Principal Office</p>
                <p className="text-[10px] text-[#6B6880]">Super Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-[#6B6880] hover:text-[#F27D8D] rounded-full hover:bg-white transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[#E9E6F2] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#6B6880] hover:bg-[#EEE9FD]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Quick Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative w-64 md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6880]" />
              <input
                type="text"
                placeholder="Search student by name or roll..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] placeholder-[#6B6880] pl-9 pr-4 py-2 rounded-full border border-transparent focus:border-[#7048E8] focus:bg-white outline-none transition"
              />
            </form>
          </div>

          <div className="flex items-center gap-4">
            <NavLink
              to="/notifications"
              className="relative p-2 rounded-full text-[#6B6880] hover:bg-[#EEE9FD] hover:text-[#7048E8] transition"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F27D8D] rounded-full ring-2 ring-white"></span>
            </NavLink>
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E9E6F2]">
              <span className="text-xs font-semibold text-[#6B6880]">Academic Year 2026-27</span>
              <span className="w-2 h-2 rounded-full bg-[#2FA36B]"></span>
            </div>
          </div>
        </header>

        {/* Mobile Slide-Out Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-64 h-full bg-white p-6 shadow-xl space-y-2 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between pb-4 border-b border-[#E9E6F2] mb-4">
                <span className="font-bold text-[#1F1B2E]">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-[#6B6880]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold text-[#6B6880] hover:bg-[#EEE9FD] hover:text-[#7048E8]"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
