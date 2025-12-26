
'use client';
import React, { useState } from 'react';
import { Plus, CheckCircle, Search, Calendar, History, Trash2 } from 'lucide-react';
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
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Calendar</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">Manage Session Logs</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100" disabled={students.length === 0}>
          <Plus className="w-5 h-5" /> Book Session
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="p-8 border-b border-slate-100 flex items-center bg-slate-50/30">
          <Search className="w-5 h-5 text-slate-400 mr-4" />
          <input type="text" placeholder="Filter session history..." className="flex-1 bg-transparent outline-none font-bold text-sm tracking-tight" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-40">
            <History className="w-16 h-16 mb-4 text-slate-300" />
            <p className="text-xs font-black uppercase tracking-[0.3em]">Session log is empty</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-10 py-6">Student Account</th>
                  <th className="px-10 py-6">Timeline</th>
                  <th className="px-10 py-6">Current Status</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(s => {
                  const student = students.find(st => st.id === s.studentId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-10 py-8">
                        <div className="font-black text-slate-900 tracking-tight">{student?.name || '---'}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{student?.className || 'General'}</div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="font-bold text-slate-700 text-sm">{new Date(s.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}</div>
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">{s.startTime} - {s.endTime}</div>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                          s.status === 'scheduled' ? 'bg-indigo-50 text-indigo-600' :
                          s.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        }`}>{s.status}</span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        {s.status === 'scheduled' && (
                          <button onClick={() => onUpdateStatus(s.id, 'completed', student?.paymentType === 'upfront' ? 'paid' : 'pending')} className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                            <CheckCircle className="w-3.5 h-3.5" /> Mark Done
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-slide-in">
            <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter italic">Book Session</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Student</label>
                <select required className="w-full p-5 bg-slate-50 rounded-2xl border outline-none font-bold focus:bg-white transition-colors" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})}>
                  <option value="">Select Account...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Date</label>
                <input type="date" className="w-full p-5 bg-slate-50 rounded-2xl border outline-none font-bold focus:bg-white transition-colors" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Start</label>
                  <select className="w-full p-5 bg-slate-50 rounded-2xl border font-bold focus:bg-white transition-colors" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})}>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">End</label>
                  <select className="w-full p-5 bg-slate-50 rounded-2xl border font-bold focus:bg-white transition-colors" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})}>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all mt-6 active:scale-95">Confirm Booking</button>
              <button type="button" onClick={() => setShowForm(false)} className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Back to Calendar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
