import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Calendar,
  Clock,
  X,
  Tag
} from 'lucide-react';
import { schoolStore } from '../lib/store';
import { formatDate } from '../lib/utils';
import type { Database } from '../types/database';

type Event = Database['public']['Tables']['events']['Row'];

export const Events: React.FC = () => {
  const [, setTick] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-12-01');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    return schoolStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    schoolStore.addEvent({
      title: title.trim(),
      description: description.trim() || null,
      start_date: startDate,
      end_date: endDate || null
    });

    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F1B2E]">Calendar & School Events</h1>
          <p className="text-xs text-[#6B6880] mt-0.5">
            Academic calendar, exam periods, sports galas, and school holidays.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-[#7048E8] hover:bg-[#5E37D3] text-white text-xs font-bold rounded-full shadow-md shadow-[#7048E8]/20 flex items-center gap-2 self-start sm:self-auto transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {schoolStore.events.map((ev) => (
          <div
            key={ev.id}
            className="bg-white p-6 rounded-[24px] shadow-soft border border-white hover:border-[#EEE9FD] flex flex-col justify-between transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-[#EEE9FD] text-[#7048E8] rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(ev.start_date)} {ev.end_date ? `to ${formatDate(ev.end_date)}` : ''}
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#1F1B2E] mt-2">{ev.title}</h3>
              <p className="text-xs text-[#6B6880] mt-1.5 leading-relaxed">
                {ev.description || 'No additional details provided.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#F4F3F8] flex items-center justify-between text-[11px] text-[#6B6880]">
              <span>Official School Event</span>
              <span className="text-[#2FA36B] font-bold">Published</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F4F3F8]">
              <h3 className="text-lg font-bold text-[#1F1B2E]">Publish School Event</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-[#6B6880]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4 my-6">
              <div>
                <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Event Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Winter Break / Inter-School Debate"
                  className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#F4F3F8] text-xs font-bold text-[#1F1B2E] px-3 py-2 rounded-[14px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#F4F3F8] text-xs font-bold text-[#1F1B2E] px-3 py-2 rounded-[14px] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1B2E] uppercase mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed schedule or guidelines..."
                  className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] px-4 py-2.5 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#F4F3F8]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2 text-xs font-bold text-[#6B6880]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#7048E8] hover:bg-[#5E37D3] text-white text-xs font-bold rounded-full transition"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
