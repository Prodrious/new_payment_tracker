import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Users, CalendarDays, 
  Menu, LogOut, Bell, Loader2, CloudUpload, CheckCircle2, 
  CloudOff, Settings, Sparkles, X, Wallet
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
  const [cloudStatus, setCloudStatus] = useState<'online' | 'local'>('local');

  const initialLoadDone = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loadedStudents, loadedSchedules] = await Promise.all([
          ApiService.getStudents(),
          ApiService.getSchedules()
        ]);
        setStudents(loadedStudents);
        setSchedules(loadedSchedules);
        setCloudStatus('online');
      } catch (e) {
        setCloudStatus('local');
      } finally {
        setIsLoading(false);
        initialLoadDone.current = true;
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!initialLoadDone.current || isLoading) return;

    const syncData = async () => {
      setIsSyncing(true);
      try {
        await Promise.all([
          ApiService.saveStudents(students),
          ApiService.saveSchedules(schedules)
        ]);
        setCloudStatus('online');
      } catch (e) {
        setCloudStatus('local');
      } finally {
        setTimeout(() => setIsSyncing(false), 800);
      }
    };

    const timer = setTimeout(syncData, 1500);
    return () => clearTimeout(timer);
  }, [students, schedules, isLoading]);

  const addStudent = (student: Student) => setStudents(prev => [...prev, student]);
  const updateStudent = (updated: Student) => setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
  const addSchedule = (schedule: ClassSchedule) => setSchedules(prev => [schedule, ...prev]);
  const updateScheduleStatus = (id: string, status: 'completed' | 'cancelled', paymentStatus: 'pending' | 'paid') => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status, paymentStatus } : s));
  };

  const handleClearData = () => {
    if (confirm("DANGER: This will permanently erase all local and cloud tuition data. Proceed?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <div className="relative mb-6">
        <Loader2 className="w-14 h-14 text-indigo-500 animate-spin" />
        <Sparkles className="absolute -top-3 -right-3 w-6 h-6 text-indigo-300 animate-pulse" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.6em] text-indigo-400">Syncing Workspace</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-400 transform transition-transform duration-300 ease-in-out border-r border-white/5 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center gap-4 mb-14 px-2">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-indigo-600/20 text-white">
              <Wallet className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-white tracking-tighter leading-none italic">TutorTrack</h1>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mt-1">Professional</span>
            </div>
            <button className="lg:hidden ml-auto text-slate-600 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'schedule', label: 'Calendar', icon: CalendarDays },
              { id: 'students', label: 'Students', icon: Users },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold group ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 scale-[1.02]' 
                    : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-sm tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-slate-900 space-y-6">
            <button onClick={handleClearData} className="w-full flex items-center gap-4 px-6 py-2 rounded-xl text-slate-500 hover:text-rose-400 transition-colors text-[10px] font-black uppercase tracking-widest group">
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Wipe Data
            </button>
            <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800/50 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg">T</div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">Tutor Panel</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className={`w-1.5 h-1.5 rounded-full ${cloudStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                   <p className="text-[9px] font-bold uppercase tracking-tighter opacity-60">
                    {cloudStatus === 'online' ? 'Connected' : 'Local Mode'}
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 relative">
        <header className="h-24 lg:h-28 bg-white/70 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-6 lg:px-12 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button className="p-3 lg:hidden text-slate-500 hover:bg-slate-100 rounded-2xl" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight italic">{activeTab}</h2>
              <div className="h-4 w-px bg-slate-200 hidden sm:block" />
              
              {isSyncing ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                  <CloudUpload className="w-3.5 h-3.5 animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Saving</span>
                </div>
              ) : (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${cloudStatus === 'online' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                  {cloudStatus === 'online' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5" />}
                  <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[60px] md:max-w-none">
                    {cloudStatus === 'online' ? 'Live Sync' : 'Offline'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="relative p-3.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all group">
              <Bell className="w-6 h-6 group-hover:scale-110" />
              <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="hidden sm:flex p-3.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all group">
              <Settings className="w-6 h-6 group-hover:rotate-45 transition-transform" />
            </button>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar bg-slate-50">
          <div className="max-w-6xl mx-auto h-full animate-slide-up">
            {activeTab === 'dashboard' && <Dashboard students={students} schedules={schedules} onUpdateStatus={updateScheduleStatus} />}
            {activeTab === 'students' && <StudentsPage students={students} schedules={schedules} onAddStudent={addStudent} onUpdateStudent={updateStudent} />}
            {activeTab === 'schedule' && <SchedulePage students={students} schedules={schedules} onAddSchedule={addSchedule} onUpdateStatus={updateScheduleStatus} />}
          </div>
        </div>
      </main>
    </div>
  );
}