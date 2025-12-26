
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Users, CalendarDays, 
  Menu, LogOut, Bell, Loader2, CloudUpload, CheckCircle2, 
  RefreshCw, AlertCircle, WifiOff
} from 'lucide-react';
import Dashboard from '../components/Dashboard';
import StudentsPage from '../components/StudentsPage';
import SchedulePage from '../components/SchedulePage';
import { Student, ClassSchedule } from '../types';
import ApiService from '../api';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'schedule'>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const initialLoadDone = useRef(false);

  // Core Data Fetching
  const fetchData = async () => {
    setIsLoading(true);
    setDbError(null);
    try {
      const [loadedStudents, loadedSchedules] = await Promise.all([
        ApiService.getStudents(),
        ApiService.getSchedules()
      ]);
      setStudents(loadedStudents || []);
      setSchedules(loadedSchedules || []);
      initialLoadDone.current = true;
    } catch (error: any) {
      console.error("Initial load failed:", error.message);
      setDbError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Intelligent Sync Logic (Debounced to save API calls)
  useEffect(() => {
    if (!initialLoadDone.current || isLoading || dbError) return;

    const syncData = async () => {
      setIsSyncing(true);
      try {
        await Promise.all([
          ApiService.saveStudents(students),
          ApiService.saveSchedules(schedules)
        ]);
      } catch (e: any) {
        console.error("Background sync failed:", e.message);
        // We don't block the UI for background sync errors, but we log them
      } finally {
        // Keep the sync indicator visible for a moment to reassure the user
        setTimeout(() => setIsSyncing(false), 1200);
      }
    };

    const timer = setTimeout(syncData, 1500);
    return () => clearTimeout(timer);
  }, [students, schedules, isLoading, dbError]);

  const addStudent = (student: Student) => setStudents(prev => [...prev, student]);
  const updateStudent = (updated: Student) => setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
  const addSchedule = (schedule: ClassSchedule) => setSchedules(prev => [schedule, ...prev]);
  const updateScheduleStatus = (id: string, status: 'completed' | 'cancelled', paymentStatus: 'pending' | 'paid') => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status, paymentStatus } : s));
  };

  const handleClearData = async () => {
    if (confirm("Permanently erase all cloud data for this tuition center? This action cannot be undone.")) {
      try {
        setIsLoading(true);
        await Promise.all([ApiService.saveStudents([]), ApiService.saveSchedules([])]);
        window.location.reload();
      } catch (e) {
        alert("Failed to reset remote database. Check connection.");
        setIsLoading(false);
      }
    }
  };

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
      <div className="relative mb-6">
        <Loader2 className="w-14 h-14 text-indigo-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Secure Handshake...</p>
    </div>
  );

  if (dbError) return (
    <div className="h-screen flex items-center justify-center bg-[#f8fafc] p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border border-rose-100 p-12 text-center animate-slide-in">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
          {dbError === 'NETWORK_TIMEOUT' ? <WifiOff className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter italic">Cloud Link Offline</h1>
        
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 mb-8">
          <p className="text-slate-600 text-[11px] font-mono leading-relaxed">
            {dbError === 'MONGODB_URI_MISSING' 
              ? 'Environment Variable "MONGODB_URI" is not configured in Vercel.' 
              : dbError === 'AUTH_FAILED' 
              ? 'Database credentials rejected. Check your password.'
              : `System Message: ${dbError}`}
          </p>
        </div>

        <button onClick={() => window.location.reload()} className="group w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] transition-all active:scale-95">
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> 
          Re-establish Connection
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0f172a] text-slate-300 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center gap-3 mb-16 px-2">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20 rotate-3">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight italic">TutorTrack <span className="text-indigo-400">Pro</span></h1>
          </div>

          <nav className="flex-1 space-y-2.5">
            {[
              { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
              { id: 'schedule', label: 'Calendar', icon: CalendarDays },
              { id: 'students', label: 'Students', icon: Users },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold group ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                    : 'hover:bg-slate-800/50 hover:text-white text-slate-400'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-sm tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-slate-800/50 space-y-6">
            <button onClick={handleClearData} className="w-full flex items-center gap-3 px-5 py-2 rounded-xl text-slate-500 hover:text-rose-400 transition-all text-[10px] font-black uppercase tracking-[0.2em]">
              <LogOut className="w-3.5 h-3.5" />
              Wipe Data
            </button>
            <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-[2rem] border border-slate-700/30">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-black text-white shadow-lg text-lg">A</div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-white truncate uppercase tracking-widest">Admin Panel</p>
                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-tighter">Verified Agent</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-24 bg-white/60 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-10 shrink-0 z-30">
          <div className="flex items-center gap-6">
            <button className="p-3 lg:hidden text-slate-500 hover:bg-slate-100 rounded-2xl transition-all" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 border-l-4 border-indigo-600 pl-4">{activeTab}</h2>
              <div className="h-4 w-px bg-slate-200 hidden sm:block" />
              {isSyncing ? (
                <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 animate-pulse">
                  <CloudUpload className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Synchronizing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Encrypted & Saved</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Cloud Relay Active</span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">ID: TU-PRO-NODE-01</span>
            </div>
             <button className="relative p-4 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all group">
              <Bell className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span className="absolute top-4 right-4 w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-sm animate-bounce"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'dashboard' && <Dashboard students={students} schedules={schedules} onUpdateStatus={updateScheduleStatus} />}
            {activeTab === 'students' && <StudentsPage students={students} schedules={schedules} onAddStudent={addStudent} onUpdateStudent={updateStudent} />}
            {activeTab === 'schedule' && <SchedulePage students={students} schedules={schedules} onAddSchedule={addSchedule} onUpdateStatus={updateScheduleStatus} />}
          </div>
        </div>
      </main>
    </div>
  );
}
