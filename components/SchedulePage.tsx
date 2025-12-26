
'use client';
import React, { useState } from 'react';
import { Plus, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { Student, ClassSchedule } from '../types';
import { TIME_SLOTS } from '../constants';

interface SchedulePageProps {
  students: Student[];
  schedules: ClassSchedule[];
  onAddSchedule: (schedule: ClassSchedule) => void;
  onUpdateStatus: (id: string, status: 'completed' | 'cancelled', paymentStatus: 'pending' | 'paid') => void;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ students, schedules, onAddSchedule, onUpdateStatus }) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) return;
    onAddSchedule({
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      status: 'scheduled',
      paymentStatus: 'pending'
    });
    setShowForm(false);
  };

  const filtered = schedules.filter(s => {
    const student = students.find(st => st.id === s.studentId);
    return student?.name.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 animate-slide-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Calendar</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-indigo-700 transition-all">
          <Plus className="w-4 h-4" /> Book Session
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center">
          <Search className="w-4 h-4 text-slate-400 mr-4" />
          <input type="text" placeholder="Filter log..." className="flex-1 bg-transparent outline-none font-bold text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="px-8 py-5">Student</th>
                <th className="px-8 py-5">Time</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(s => {
                const student = students.find(st => st.id === s.studentId);
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-900">{student?.name || '---'}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student?.className}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-700 text-sm">{s.date}</div>
                      <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{s.startTime} - {s.endTime}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        s.status === 'scheduled' ? 'bg-indigo-50 text-indigo-600' :
                        s.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                      }`}>{s.status}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {s.status === 'scheduled' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => onUpdateStatus(s.id, 'completed', student?.paymentType === 'upfront' ? 'paid' : 'pending')} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] w-full max-w-md p-10 shadow-2xl animate-slide-in">
            <h2 className="text-xl font-black mb-8 uppercase tracking-widest">Book Slot</h2>
            <div className="space-y-4">
              <select required className="w-full p-5 bg-slate-50 rounded-xl border outline-none font-bold" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})}>
                <option value="">Select Student...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input type="date" className="w-full p-5 bg-slate-50 rounded-xl border outline-none font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <select className="p-5 bg-slate-50 rounded-xl border font-bold" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})}>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="p-5 bg-slate-50 rounded-xl border font-bold" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})}>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 mt-4">Confirm Slot</button>
              <button type="button" onClick={() => setShowForm(false)} className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Close</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
