import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Users,
  CheckCircle2,
  X,
  MessageSquare
} from 'lucide-react';
import { schoolStore } from '../lib/store';
import { formatDate } from '../lib/utils';
import type { Database } from '../types/database';

export const Notifications: React.FC = () => {
  const [, setTick] = useState(0);
  const [showComposeModal, setShowComposeModal] = useState(false);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<'all' | 'teachers'>('all');

  useEffect(() => {
    return schoolStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    schoolStore.addNotification({
      title: title.trim(),
      body: body.trim(),
      audience
    });

    setTitle('');
    setBody('');
    setShowComposeModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F1B2E]">In-App Staff Announcements</h1>
          <p className="text-xs text-[#6B6880] mt-0.5">
            Broadcast messages delivered instantly to teachers' mobile application screens.
          </p>
        </div>

        <button
          onClick={() => setShowComposeModal(true)}
          className="px-5 py-2.5 bg-[#7048E8] hover:bg-[#5E37D3] text-white text-xs font-bold rounded-full shadow-md shadow-[#7048E8]/20 flex items-center gap-2 self-start sm:self-auto transition"
        >
          <Send className="w-4 h-4" />
          <span>Compose Announcement</span>
        </button>
      </div>

      {/* Notifications History List */}
      <div className="space-y-3">
        {schoolStore.notifications.map((notif) => (
          <div
            key={notif.id}
            className="bg-white p-5 rounded-[22px] shadow-soft border border-white hover:border-[#EEE9FD] transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#EEE9FD] text-[#7048E8] flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1F1B2E]">{notif.title}</h3>
                  <p className="text-xs text-[#6B6880] mt-1 leading-relaxed">{notif.body}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="px-3 py-1 bg-[#2FA36B]/15 text-[#2FA36B] rounded-full text-[11px] font-bold">
                  Delivered ({schoolStore.teachers.length} Faculty)
                </span>
                <p className="text-[10px] text-[#6B6880] mt-1">Broadcast to all faculty</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compose Announcement Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F4F3F8]">
              <h3 className="text-lg font-bold text-[#1F1B2E]">Compose Broadcast</h3>
              <button onClick={() => setShowComposeModal(false)} className="p-1.5 text-[#6B6880]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4 my-6">
              <div>
                <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Announcement Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Urgent Faculty Meeting at 2:00 PM"
                  className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Target Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as any)}
                  className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] outline-none"
                >
                  <option value="all">All Faculty & Staff Members</option>
                  <option value="teachers">Class Teachers Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Announcement Body *</label>
                <textarea
                  rows={4}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type official circular message..."
                  className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#F4F3F8]">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-5 py-2 text-xs font-bold text-[#6B6880]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#7048E8] hover:bg-[#5E37D3] text-white text-xs font-bold rounded-full transition"
                >
                  Broadcast Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
