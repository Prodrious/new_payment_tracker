
import React, { useState } from 'react';
import { Plus, CheckCircle, XCircle, Clock, Search, ChevronRight } from 'lucide-react';
import { Student, ClassSchedule } from '../types.ts';
import { TIME_SLOTS } from '../constants.tsx';

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Calendar</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Session Management</p>
        </div>
        <button onClick={() => setShowForm(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold uppercase text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"><Plus className="w-4 h-4" /> Book Session</button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" placeholder="Filter by student..." 
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50/50 font-semibold text-sm"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
             <Clock className="w-4 h-4 text-slate-400" />
             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">History log</span>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Student / Class</th>
                <th className="px-8 py-5">Date & Time</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map(s => {
                const student = students.find(st => st.id === s.studentId);
                const isScheduled = s.status === 'scheduled';
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900">{student?.name || '---'}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{student?.className}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-semibold text-slate-700 text-sm">{s.date}</div>
                      <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {s.startTime} - {s.endTime}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                        s.status === 'scheduled' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        s.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>{s.status}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {isScheduled ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            title="Complete session"
                            onClick={() => onUpdateStatus(s.id, 'completed', student?.paymentType === 'upfront' ? 'paid' : 'pending')} 
                            className="p-2.5 bg-white text-emerald-500 rounded-xl shadow-sm border border-emerald-100 hover:bg-emerald-50 transition-all active:scale-90"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            title="Cancel session"
                            onClick={() => onUpdateStatus(s.id, 'cancelled', 'pending')} 
                            className="p-2.5 bg-white text-slate-400 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-90"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Settled <ChevronRight className="w-3 h-3" />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center opacity-40 font-bold uppercase text-xs tracking-[0.3em] italic">No active schedules</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-slide-in">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/10">
              <h2 className="text-xl font-bold tracking-tight text-indigo-950 uppercase tracking-widest">Schedule session</h2>
              <button type="button" onClick={() => setShowForm(false)} className="p-2 hover:bg-white rounded-xl shadow-sm text-slate-400"><XCircle className="w-6 h-6" /></button>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Student</label>
                <select required className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none font-bold text-sm" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})}>
                  <option value="">Select Account...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.className})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Date</label>
                <input required type="date" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none font-bold text-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Start Time</label>
                  <select className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none font-bold text-sm" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})}>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">End Time</label>
                  <select className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none font-bold text-sm" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})}>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all mt-6 text-sm">Add to calendar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
