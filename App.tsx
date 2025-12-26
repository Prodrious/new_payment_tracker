
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Users, CalendarDays, 
  Menu, LogOut, Bell, Loader2, CloudUpload, CheckCircle2, 
  RefreshCw, CloudOff, Cloud
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import StudentsPage from './components/StudentsPage';
import SchedulePage from './components/SchedulePage';
import { Student, ClassSchedule } from './types';
import ApiService from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'schedule'>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'offline'>('connected');

  const initialLoadDone = useRef(false);

  // Initial Data Bootstrap
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loadedStudents, loadedSchedules] = await Promise.all([
          ApiService.getStudents(),
          ApiService.getSchedules()
        ]);
        setStudents(loadedStudents || []);
        setSchedules(loadedSchedules || []);
        setCloudStatus('connected');
      } catch (error: any) {
        console.warn("Starting in Local Mode:", error.message);
        setCloudStatus('offline');
        // Start with empty arrays if fetch fails
        setStudents([]);
        setSchedules([]);
      } finally {
        setIsLoading(false);
        initialLoadDone.current = true;
      }
    };
    fetchData();
  }, []);

  // Background Sync
  useEffect(() => {
    if (!initialLoadDone.current || isLoading) return;

    const syncData = async () => {
      setIsSyncing(true);
      try {
        await Promise.all([
          ApiService.saveStudents(students),
          ApiService.saveSchedules(schedules)
        ]);
        setCloudStatus('connected');
      } catch (e: any) {
        setCloudStatus('offline');
      } finally {
        setTimeout(() => setIsSyncing(false), 1000);
      }
    };

    const timer = setTimeout(syncData, 2000);
    return () => clearTimeout(timer);
  }, [students, schedules, isLoading]);

  const addStudent = (student: Student) => setStudents(prev => [...prev, student]);
  const updateStudent = (updated: Student) => setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
  const addSchedule = (schedule: ClassSchedule) => setSchedules(prev => [schedule, ...prev]);
  const updateScheduleStatus = (id: string, status: 'completed' | 'cancelled', paymentStatus: 'pending' | 'paid') => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status, paymentStatus } : s));
  };

  const handleClearData = async () => {
    if (confirm("Clear all data?")) {
      setStudents([]);
      setSchedules([]);
      try {
        await Promise.all([ApiService.saveStudents([]), ApiService.saveSchedules([])]);
      } catch (e) {}
    }
  };

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Initializing Dashboard...</p>
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
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
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
              Reset
            </button>
            <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-[2rem] border border-slate-700/30">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg text-lg">A</div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-white truncate uppercase tracking-widest">Admin</p>
                <p className={`text-[9px] font-black uppercase tracking-tighter ${cloudStatus === 'connected' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {cloudStatus === 'connected' ? 'Online' : 'Local'}
                </p>
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
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Saving...</span>
                </div>
              ) : cloudStatus === 'connected' ? (
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Synced</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 group relative cursor-help">
                  <CloudOff className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Local Only</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <button className="relative p-4 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
              <Bell className="w-6 h-6" />
              <span className="absolute top-4 right-4 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></span>
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
