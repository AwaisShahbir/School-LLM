import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Teachers } from './pages/Teachers';
import { Students } from './pages/Students';
import { Attendance } from './pages/Attendance';
import { Marks } from './pages/Marks';
import { Fees } from './pages/Fees';
import { Timetable } from './pages/Timetable';
import { Events } from './pages/Events';
import { Notifications } from './pages/Notifications';
import { Sports } from './pages/Sports';
import { Expenses } from './pages/Expenses';
import { AuditLog } from './pages/AuditLog';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Shell */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="students" element={<Students />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="marks" element={<Marks />} />
          <Route path="fees" element={<Fees />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="events" element={<Events />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="sports" element={<Sports />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="audit" element={<AuditLog />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
