
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, CalendarDays, 
  Menu, LogOut, Bell, Loader2, CloudUpload, CheckCircle2, 
  Database, AlertTriangle, ExternalLink, RefreshCw
} from 'lucide-react';
import Dashboard from './components/Dashboard.tsx';
import StudentsPage from './components/StudentsPage.tsx';
import SchedulePage from './components/SchedulePage.tsx';
import { Student, ClassSchedule } from './types.ts';
import ApiService from './api.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'schedule'>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Initial Data Load from MongoDB
  const fetchData = async () => {
    setIsLoading(true);
    setDbError(null);
    try {
      const [loadedStudents, loadedSchedules] = await Promise.all([
        ApiService.getStudents(),
        ApiService.getSchedules()
      ]);
      setStudents(loadedStudents);
      setSchedules(loadedSchedules);
    } catch (error: any) {
      console.error("Critical: Database connection failed", error);
      setDbError(error.message || "Failed to connect to MongoDB. Check your environment variables.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync Logic: Push to MongoDB on changes
  useEffect(() => {
    if (!isLoading && !dbError) {
      const sync = async () => {
        setIsSyncing(true);
        try {
          await ApiService.saveStudents(students);
        } catch (e) {
          console.error("Sync Error:", e);
        } finally {
          setTimeout(() => setIsSyncing(false), 800);
        }
      };
      sync();
    }
  }, [students, isLoading, dbError]);

  useEffect(() => {
    if (!isLoading && !dbError) {
      const sync = async () => {
        setIsSyncing(true);
        try {
          await ApiService.saveSchedules(schedules);
        } catch (e) {
          console.error("Sync Error:", e);
        } finally {
          setTimeout(() => setIsSyncing(false), 800);
        }
      };
      sync();
    }
  }, [schedules, isLoading, dbError]);

  const addStudent = (student: Student) => setStudents(prev => [...prev, student]);
  const updateStudent = (updated: Student) => setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
  const addSchedule = (schedule: ClassSchedule) => setSchedules(prev => [schedule, ...prev]);
  const updateScheduleStatus = (id: string, status: 'completed' | 'cancelled', paymentStatus: 'pending' | 'paid') => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status, paymentStatus } : s));
  };

  const handleClearData = async () => {
    if (confirm("This will permanently erase all MongoDB records. Continue?")) {
      setStudents([]);
      setSchedules([]);
      localStorage.clear();
      window.location.reload();
    }
  };

  // Loading State
  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
      <p className="text-sm font-black uppercase tracking-[0.3em] opacity-50">Handshaking with MongoDB...</p>
    </div>
  );

  // Database Connection Error State
  if (dbError) return (
    <div className="h-screen flex items-center justify-center bg-[#f8fafc] p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-rose-100 p-10 text-center animate-slide-in">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Database className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter">Database Connectivity Error</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          We couldn't reach your MongoDB instance. If you've just deployed to Vercel, please ensure you've added the 
          <code className="mx-1 px-1.5 py-0.5 bg-slate-100 rounded text-rose-600 font-bold">MONGODB_URI</code> 
          to your environment variables.
        </p>
        <div className="space-y-4">
          <button 
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <a 
            href="https://vercel.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
          >
            <ExternalLink className="w-4 h-4" /> Vercel Settings
          </a>
        </div>
        <p className="mt-8 text-[10px] font-bold text-rose-400 uppercase tracking-widest">Error: {dbError}</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard students={students} schedules={schedules} onUpdateStatus={updateScheduleStatus} />;
      case 'students':
        return <StudentsPage students={students} schedules={schedules} onAddStudent={addStudent} onUpdateStudent={updateStudent} />;
      case 'schedule':
        return <SchedulePage students={students} schedules={schedules} onAddSchedule={addSchedule} onUpdateStatus={updateScheduleStatus} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0f172a] text-slate-300 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight italic">TutorTrack <span className="text-indigo-400">Pro</span></h1>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
            <button onClick={handleClearData} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all text-xs font-bold uppercase tracking-widest">
              <LogOut className="w-4 h-4" />
              Reset Data
            </button>
            <div className="flex items-center gap-3 px-2 bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center font-bold text-white shadow-sm shadow-indigo-500/30">A</div>
              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate uppercase tracking-tighter">Academic Admin</p>
                <p className="text-[10px] text-slate-500 truncate uppercase font-bold">Vercel Backend</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button className="p-2 lg:hidden text-slate-500 hover:bg-slate-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">{activeTab}</h2>
              {isSyncing ? (
                <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  <CloudUpload className="w-3 h-3 text-indigo-500 animate-pulse" />
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Syncing</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Saved</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-4">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">MongoDB Atlas: Online</span>
              <span className="text-xs font-bold text-slate-400">{new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
             <button className="relative p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
              <Bell className="w-6 h-6" />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
