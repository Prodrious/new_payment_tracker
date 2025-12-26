
import React, { useState } from 'react';
import { UserPlus, Search, X, PlusCircle, History } from 'lucide-react';
import { Student, PaymentType, ClassSchedule } from '../types.ts';
import { CURRENCY_CONFIG } from '../constants.tsx';

interface StudentsPageProps {
  students: Student[];
  schedules: ClassSchedule[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
}

const StudentsPage: React.FC<StudentsPageProps> = ({ students, schedules, onAddStudent, onUpdateStudent }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<string | null>(null);
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
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">Manage Student Accounts & Balances</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-2xl font-black uppercase text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95"><UserPlus className="w-5 h-5" /> Enroll Student</button>
      </div>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-indigo-600 transition-all" />
        <input 
          type="text" placeholder="Search students by name..." 
          className="w-full pl-16 pr-8 py-6 bg-white border border-slate-200 rounded-[2.5rem] outline-none shadow-sm focus:ring-8 focus:ring-indigo-50 transition-all font-bold text-slate-700"
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map(s => {
          const balance = calculateBalance(s);
          const isNegative = balance < 0;
          return (
            <div key={s.id} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full relative overflow-hidden">
              <div className="flex justify-between items-start mb-10">
                <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-4xl group-hover:rotate-6 group-hover:scale-110 transition-all">{s.name.charAt(0)}</div>
                <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] ${s.paymentType === 'upfront' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {s.paymentType}
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1.5 tracking-tighter leading-none">{s.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-12">{s.className}</p>
              
              <div className="mt-auto space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hourly Rate</p>
                    <p className="font-black text-slate-800 tracking-tighter">{formatCurrency(s.hourlyRate)}</p>
                  </div>
                  <div className={`p-5 rounded-3xl border ${s.paymentType === 'upfront' ? (isNegative ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100') : 'bg-indigo-50 border-indigo-100'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${s.paymentType === 'upfront' ? (isNegative ? 'text-rose-500' : 'text-emerald-500') : 'text-indigo-500'}`}>
                      {s.paymentType === 'upfront' ? 'Balance' : 'Billing'}
                    </p>
                    <p className={`font-black tracking-tighter ${s.paymentType === 'upfront' ? (isNegative ? 'text-rose-600' : 'text-emerald-600') : 'text-indigo-600'}`}>
                      {s.paymentType === 'upfront' ? formatCurrency(balance) : 'Cycle'}
                    </p>
                  </div>
                </div>
                {s.paymentType === 'upfront' && (
                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setShowTopupModal(s.id)} className="flex-1 flex items-center justify-center gap-3 bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all tracking-[0.2em]"><PlusCircle className="w-4 h-4" /> Deposit</button>
                    <button onClick={() => setShowHistoryModal(s.id)} className="p-5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-[1.5rem] transition-all border border-slate-200"><History className="w-6 h-6" /></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enroll Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <form onSubmit={handleAdd} className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-slide-in border border-white/20">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-indigo-50/20">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">New Profile</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect to MongoDB Cluster</p>
              </div>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400 transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-10 space-y-6">
              <input required placeholder="Student Full Name" className="w-full px-6 py-5 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-8 focus:ring-indigo-50 font-bold transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required placeholder="Subject / Grade" className="w-full px-6 py-5 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-8 focus:ring-indigo-50 font-bold transition-all" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} />
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Rate (₹/hr)</label>
                  <input required type="number" className="w-full px-6 py-5 bg-slate-50 rounded-2xl border border-slate-100 outline-none font-black" value={formData.hourlyRate || ''} onChange={e => setFormData({...formData, hourlyRate: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Account Type</label>
                  <select className="w-full px-6 py-5 bg-slate-50 rounded-2xl border border-slate-100 outline-none font-black text-xs uppercase" value={formData.paymentType} onChange={e => setFormData({...formData, paymentType: e.target.value as PaymentType})}>
                    <option value="postpaid">Postpaid</option>
                    <option value="upfront">Prepaid</option>
                  </select>
                </div>
              </div>
              {formData.paymentType === 'upfront' && (
                <div className="animate-slide-in pt-2">
                   <label className="text-[10px] font-black uppercase text-emerald-500 ml-2 tracking-widest">Initial Credit Refill (₹)</label>
                   <input required type="number" className="w-full px-6 py-5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 outline-none font-black text-xl tracking-tighter" value={formData.advancePayment || ''} onChange={e => setFormData({...formData, advancePayment: Number(e.target.value)})} />
                </div>
              )}
              <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all mt-6 text-sm">Commit to Database</button>
            </div>
          </form>
        </div>
      )}

      {/* Deposit Modal */}
      {showTopupModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={handleTopup} className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl animate-slide-in border border-white/20">
            <div className="p-10 border-b border-slate-100 text-center bg-indigo-50/20">
              <h2 className="text-xl font-black uppercase tracking-[0.3em] text-indigo-900">Wallet Refill</h2>
            </div>
            <div className="p-10 space-y-10 text-center">
              <div className="space-y-2">
                <input required autoFocus type="number" className="w-full text-6xl font-black text-center py-10 bg-slate-50 rounded-[2.5rem] outline-none text-indigo-600 border border-slate-100 focus:ring-8 focus:ring-indigo-50" placeholder="0" value={topupAmount || ''} onChange={e => setTopupAmount(Number(e.target.value))} />
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Amount in INR (₹)</p>
              </div>
              <div className="flex gap-5">
                <button type="button" onClick={() => setShowTopupModal(null)} className="flex-1 py-5 bg-slate-100 rounded-2xl font-black uppercase text-xs text-slate-500 tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-2xl shadow-indigo-100 tracking-widest hover:bg-indigo-700">Refill</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-slide-in border border-white/20">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Audit Log</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Transaction History</p>
              </div>
              <button onClick={() => setShowHistoryModal(null)} className="p-3 hover:bg-white rounded-2xl shadow-sm text-slate-400 transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-10 max-h-[50vh] overflow-y-auto space-y-4 custom-scrollbar">
              {(students.find(s => s.id === showHistoryModal)?.topups || []).slice().reverse().map(t => (
                <div key={t.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-indigo-100 transition-all">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{new Date(t.date).toLocaleDateString('en-IN')}</p>
                    <p className="font-black text-slate-700 group-hover:text-indigo-600 transition-colors">Direct Deposit</p>
                  </div>
                  <p className="text-2xl font-black text-emerald-600 tracking-tighter">+{formatCurrency(t.amount)}</p>
                </div>
              ))}
              {(!(students.find(s => s.id === showHistoryModal)?.topups || []).length) && (
                <div className="py-24 text-center opacity-30 text-[10px] font-black uppercase tracking-[0.4em] italic">No transaction records</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
