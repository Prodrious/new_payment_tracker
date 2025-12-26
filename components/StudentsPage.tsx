
'use client';
import React, { useState } from 'react';
import { UserPlus, Search, X, PlusCircle, History } from 'lucide-react';
import { Student, PaymentType, ClassSchedule } from '../types';
import { CURRENCY_CONFIG } from '../constants';

interface StudentsPageProps {
  students: Student[];
  schedules: ClassSchedule[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
}

const StudentsPage: React.FC<StudentsPageProps> = ({ students, schedules, onAddStudent, onUpdateStudent }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [topupAmount, setTopupAmount] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    name: '',
    className: '',
    hourlyRate: 0,
    paymentType: 'postpaid' as PaymentType,
    advancePayment: 0
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(CURRENCY_CONFIG.locale, { style: 'currency', currency: CURRENCY_CONFIG.currency, maximumFractionDigits: 0 }).format(val || 0);
  };

  const calculateBalance = (student: Student) => {
    if (student.paymentType !== 'upfront') return 0;
    const totalFunds = (student.topups || []).reduce((acc, t) => acc + (t.amount || 0), 0);
    const totalConsumed = schedules
      .filter(s => s.studentId === student.id && s.status === 'completed')
      .reduce((acc, s) => {
        const [sH, sM] = s.startTime.split(':').map(Number);
        const [eH, eM] = s.endTime.split(':').map(Number);
        const dur = (eH + eM / 60) - (sH + sM / 60);
        return acc + (dur * (student.hourlyRate || 0));
      }, 0);
    return totalFunds - totalConsumed;
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    onAddStudent({
      id, ...formData,
      topups: formData.paymentType === 'upfront' ? [{ id: 'init-' + id, amount: formData.advancePayment, date: now }] : [],
      createdAt: now
    });
    setShowAddModal(false);
    setFormData({ name: '', className: '', hourlyRate: 0, paymentType: 'postpaid', advancePayment: 0 });
  };

  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === showTopupModal);
    if (!student) return;
    onUpdateStudent({
      ...student,
      topups: [...(student.topups || []), { id: Date.now().toString(), amount: topupAmount, date: new Date().toISOString() }]
    });
    setShowTopupModal(null);
    setTopupAmount(0);
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-slide-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Directory</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">Manage Student Accounts</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-indigo-700 transition-all">
          <UserPlus className="w-5 h-5" /> Enroll Student
        </button>
      </div>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
        <input type="text" placeholder="Search students..." className="w-full pl-16 pr-8 py-6 bg-white border border-slate-200 rounded-[2.5rem] outline-none shadow-sm focus:ring-8 focus:ring-indigo-50 font-bold" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map(s => {
          const balance = calculateBalance(s);
          return (
            <div key={s.id} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-2xl">{s.name.charAt(0)}</div>
                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${s.paymentType === 'upfront' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {s.paymentType}
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1 tracking-tighter">{s.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">{s.className}</p>
              
              <div className="mt-auto space-y-4">
                <div className="bg-slate-50 p-6 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="font-black text-slate-900 tracking-tighter">
                    {s.paymentType === 'upfront' ? formatCurrency(balance) : 'Active Billing'}
                  </p>
                </div>
                {s.paymentType === 'upfront' && (
                  <button onClick={() => setShowTopupModal(s.id)} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700">
                    <PlusCircle className="w-4 h-4" /> Deposit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={handleAdd} className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-slide-in">
            <h2 className="text-2xl font-black mb-8 text-slate-900 uppercase">New Enrollment</h2>
            <div className="space-y-4">
              <input required placeholder="Name" className="w-full p-5 bg-slate-50 rounded-xl border outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required placeholder="Class" className="w-full p-5 bg-slate-50 rounded-xl border outline-none font-bold" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Rate" className="p-5 bg-slate-50 rounded-xl border outline-none font-bold" value={formData.hourlyRate || ''} onChange={e => setFormData({...formData, hourlyRate: Number(e.target.value)})} />
                <select className="p-5 bg-slate-50 rounded-xl border outline-none font-bold text-xs uppercase" value={formData.paymentType} onChange={e => setFormData({...formData, paymentType: e.target.value as PaymentType})}>
                  <option value="postpaid">Postpaid</option>
                  <option value="upfront">Prepaid</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black mt-4">Save Profile</button>
              <button type="button" onClick={() => setShowAddModal(false)} className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showTopupModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={handleTopup} className="bg-white rounded-[3rem] w-full max-w-sm p-10 text-center animate-slide-in">
            <h2 className="text-xl font-black mb-8 text-slate-900">DEPOSIT FUNDS</h2>
            <input required type="number" autoFocus className="w-full text-5xl font-black text-center mb-10 outline-none text-indigo-600" value={topupAmount || ''} onChange={e => setTopupAmount(Number(e.target.value))} />
            <div className="flex gap-4">
              <button type="button" onClick={() => setShowTopupModal(null)} className="flex-1 py-4 bg-slate-100 rounded-xl font-black uppercase text-xs">Cancel</button>
              <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs">Confirm</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
