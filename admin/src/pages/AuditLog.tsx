import React, { useState, useEffect } from 'react';
import {
  History,
  ShieldAlert,
  Database,
  ArrowRight,
  Clock
} from 'lucide-react';
import { schoolStore } from '../lib/store';

export const AuditLog: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return schoolStore.subscribe(() => setTick(t => t + 1));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1F1B2E]">System Audit Trail</h1>
        <p className="text-xs text-[#6B6880] mt-0.5">
          Row-level change tracking for marks, attendance, fees, and student profile mutations.
        </p>
      </div>

      <div className="bg-white rounded-[24px] shadow-soft border border-white overflow-hidden">
        <div className="p-4 bg-[#FAF9FD] border-b border-[#F4F3F8] flex items-center gap-2 text-xs font-bold text-[#6B6880]">
          <Database className="w-4 h-4 text-[#7048E8]" />
          <span>Real-time Audit Ledger ({schoolStore.auditLogs.length} events logged in this session)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F4F3F8] text-[11px] font-bold text-[#6B6880] uppercase tracking-wider bg-white">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Table Mutated</th>
                <th className="py-4 px-6">Action</th>
                <th className="py-4 px-6">Record ID</th>
                <th className="py-4 px-6">Changed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3F8] text-sm">
              {schoolStore.auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#6B6880]">
                    Audit triggers active. Make any edit in attendance, marks, fees, or students to inspect logged mutations.
                  </td>
                </tr>
              ) : (
                schoolStore.auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8F7FC] transition font-mono text-xs">
                    <td className="py-3 px-6 text-[#6B6880]">
                      {new Date(log.changed_at).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-6">
                      <span className="px-2.5 py-0.5 bg-[#EEE9FD] text-[#7048E8] font-bold rounded-full">
                        {log.table_name}
                      </span>
                    </td>
                    <td className="py-3 px-6 font-bold">
                      <span className={`px-2 py-0.5 rounded-full ${
                        log.action === 'INSERT'
                          ? 'bg-[#2FA36B]/15 text-[#2FA36B]'
                          : log.action === 'UPDATE'
                          ? 'bg-[#F6C177]/20 text-[#D97706]'
                          : 'bg-[#F27D8D]/15 text-[#F27D8D]'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-[#1F1B2E] truncate max-w-xs">
                      {log.row_id}
                    </td>
                    <td className="py-3 px-6 text-[#6B6880]">
                      Admin User
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
