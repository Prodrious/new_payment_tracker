
'use client';
import React, { useMemo, useState } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Wallet, Clock, UserCheck, 
  ChevronLeft, ChevronRight, FileText, Share2,
  CheckCircle, Calendar, X
} from 'lucide-react';
import { Student, ClassSchedule } from '../types';
import { MONTHS, CURRENCY_CONFIG } from '../constants';

interface DashboardProps {
  students: Student[];
  schedules: ClassSchedule[];
  onUpdateStatus: (id: string, status: 'completed' | 'cancelled', paymentStatus: 'pending' | 'paid') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ students, schedules, onUpdateStatus }) => {
  const [showDuesModal, setShowDuesModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
      style: 'currency', currency: CURRENCY_CONFIG.currency, maximumFractionDigits: 0
    }).format(val || 0);
  };

  const getDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    return Math.max(0, (eH + eM / 60) - (sH + sM / 60));
  };

  const financials = useMemo(() => {
    let totalRevenue = 0;
    let pendingDuesTotal = 0;
    const pendingList: any[] = [];

    students.forEach(s => {
      const topups = s.topups || [];
      const deposited = topups.reduce((acc, t) => acc + (t.amount || 0), 0);
      totalRevenue += deposited;

      const consumedVal = schedules
        .filter(sc => sc.studentId === s.id && sc.status === 'completed')
        .reduce((acc, sc) => acc + (getDuration(sc.startTime, sc.endTime) * (s.hourlyRate || 0)), 0);
      
      const balance = deposited - consumedVal;
      if (s.paymentType === 'upfront' && balance < 0) {
        pendingDuesTotal += Math.abs(balance);
        pendingList.push({ id: s.id, name: s.name, amount: Math.abs(balance), type: 'Overdraft' });
      }
    });

    schedules.forEach(sc => {
      const student = students.find(s => s.id === sc.studentId);
      if (!student) return;
      const cost = getDuration(sc.startTime, sc.endTime) * (student.hourlyRate || 0);
      
      if (student.paymentType === 'postpaid' && sc.status === 'completed') {
        if (sc.paymentStatus === 'paid') {
          totalRevenue += cost;
        } else {
          pendingDuesTotal += cost;
          const existing = pendingList.find(p => p.id === student.id);
          if (existing) existing.amount += cost;
          else pendingList.push({ id: student.id, name: student.name, amount: cost, type: 'Postpaid' });
        }
      }
    });

    return { totalRevenue, pendingDuesTotal, pendingList };
  }, [students, schedules]);

  const chartData = useMemo(() => {
    return MONTHS.map((m, i) => {
      let income = 0;
      students.forEach(s => {
        (s.topups || []).forEach(t => {
          const d = new Date(t.date);
          if (d.getMonth() === i && d.getFullYear() === year) income += (t.amount || 0);
        });
      });
      schedules.forEach(sc => {
        const student = students.find(st => st.id === sc.studentId);
        if (student?.paymentType === 'postpaid' && sc.status === 'completed' && sc.paymentStatus === 'paid') {
          const d = new Date(sc.date);
          if (d.getMonth() === i && d.getFullYear() === year) {
            income += getDuration(sc.startTime, sc.endTime) * (student.hourlyRate || 0);
          }
        }
      });
      return { name: m, amount: income };
    });
  }, [students, schedules, year]);

  const upcomingSessions = useMemo(() => {
    return schedules
      .filter(s => s.status === 'scheduled' && new Date(s.date).getTime() >= new Date().setHours(0,0,0,0))
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [schedules]);

  const invoice = useMemo(() => {
    if (!selectedInvoiceId) return null;
    const student = students.find(s => s.id === selectedInvoiceId);
    if (!student) return null;
    
    const sessions = schedules.filter(s => 
      s.studentId === student.id && 
      s.status === 'completed' && 
      (student.paymentType === 'postpaid' ? s.paymentStatus === 'pending' : true)
    );

    const consumed = sessions.reduce((acc, s) => acc + (getDuration(s.startTime, s.endTime) * (student.hourlyRate || 0)), 0);
    const totalDeposited = (student.topups || []).reduce((acc, t) => acc + (t.amount || 0), 0);
    const lifetimeConsumed = schedules
      .filter(s => s.studentId === student.id && s.status === 'completed')
      .reduce((acc, s) => acc + (getDuration(s.startTime, s.endTime) * (student.hourlyRate || 0)), 0);
    
    const balance = totalDeposited - lifetimeConsumed;

    return { student, sessions, consumed, balance };
  }, [selectedInvoiceId, students, schedules]);

  return (
    <div className="space-y-8 animate-slide-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Collections', value: financials.totalRevenue, icon: TrendingUp, color: 'indigo' },
          { label: 'Receivables', value: financials.pendingDuesTotal, icon: Wallet, color: 'rose', onClick: () => setShowDuesModal(true) },
          { label: 'Active Students', value: students.length, icon: UserCheck, color: 'emerald' },
          { label: 'Sessions Completed', value: schedules.filter(s => s.status === 'completed').length, icon: Clock, color: 'slate' },
        ].map((stat, i) => (
          <div key={i} onClick={stat.onClick} className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all ${stat.onClick ? 'cursor-pointer hover:shadow-xl hover:border-rose-200 active:scale-95' : 'hover:scale-[1.02]'}`}>
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center mb-5`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
              {typeof stat.value === 'number' && (stat.label.includes('Collections') || stat.label.includes('Receivables')) 
                ? formatCurrency(stat.value) 
                : stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-xl text-slate-900 tracking-tight">Income Analytics</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Monthly collection history</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
              <button onClick={() => setYear(y => y - 1)} className="p-2 hover:bg-white rounded-xl shadow-sm text-slate-400 hover:text-indigo-600"><ChevronLeft className="w-5 h-5" /></button>
              <span className="px-4 font-black text-sm text-indigo-900">{year}</span>
              <button onClick={() => setYear(y => y + 1)} className="p-2 hover:bg-white rounded-xl shadow-sm text-slate-400 hover:text-indigo-600"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '800'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '800'}} />
                <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px'}} />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={4} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-xl text-slate-900 tracking-tight">Queue</h3>
            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">{upcomingSessions.length} Scheduled</span>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {upcomingSessions.map(s => {
              const student = students.find(st => st.id === s.studentId);
              return (
                <div key={s.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl group border border-transparent hover:border-indigo-100 transition-all">
                  <div className="min-w-0">
                    <p className="font-black text-sm text-slate-900 truncate">{student?.name || 'Deleted'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{s.date} • {s.startTime}</p>
                  </div>
                  <button onClick={() => onUpdateStatus(s.id, 'completed', student?.paymentType === 'upfront' ? 'paid' : 'pending')} className="p-3 bg-white text-indigo-600 rounded-2xl shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 hover:text-white">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showDuesModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-slide-in border border-slate-100">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Receivables</h2>
              <button onClick={() => setShowDuesModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {financials.pendingList.map(p => (
                <div key={p.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-rose-200 transition-all">
                  <div>
                    <p className="font-black text-slate-900">{p.name}</p>
                    <p className="text-[10px] font-black uppercase text-rose-500 tracking-widest">{p.type}</p>
                  </div>
                  <p className="text-xl font-black text-rose-600 tracking-tighter">{formatCurrency(p.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
