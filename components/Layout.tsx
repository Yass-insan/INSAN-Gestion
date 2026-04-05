
import React, { useState } from 'react';
import { User, UserRole, InstituteSettings } from '../types';
import { 
  LayoutDashboard, Users, ClipboardList, LogOut, MessageSquare, 
  ChevronRight, Home as HomeIcon, UserCheck, 
  GraduationCap, TrendingUp, Sun, Moon, Info, Phone, Globe, Lock, 
  PlayCircle, Building2, BookOpen, Layers, Briefcase, Euro, Settings, HeartHandshake,
  FileText
} from 'lucide-react';
import { getTranslation } from '../services/i18n';
import { Logo } from './Logo';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  children: React.ReactNode;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  settings: InstituteSettings;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, currentView, setCurrentView, children, isDarkMode, toggleTheme, settings }) => {
  const lang = settings.language || 'fr';
  const t = (key: string) => getTranslation(key, lang);

  const handleDashboardEntry = () => {
    if (user) setCurrentView('dashboard');
    else setCurrentView('login');
  };

  const hasAccess = (itemRoles: UserRole[]) => {
      if (!user) return false;
      if (itemRoles.includes(user.role)) return true;
      if (user.secondaryRoles && user.secondaryRoles.some(role => itemRoles.includes(role))) return true;
      return false;
  };

  const dashboardNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT, UserRole.EMPLOYEE, UserRole.RESPONSIBLE] },
    { id: 'inscriptions', label: 'Inscriptions', icon: UserCheck, roles: [UserRole.ADMIN, UserRole.EMPLOYEE] },
    { id: 'students', label: 'Suivi Étudiants', icon: Users, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.RESPONSIBLE] },
    { id: 'manage-courses', label: 'Académie', icon: BookOpen, roles: [UserRole.ADMIN, UserRole.RESPONSIBLE] },
    { id: 'employees', label: 'Staff & RH', icon: Briefcase, roles: [UserRole.ADMIN] },
    { id: 'tarification', label: 'Tarifs & Règles', icon: Euro, roles: [UserRole.ADMIN] },
    { id: 'stats', label: 'Statistiques CA', icon: TrendingUp, roles: [UserRole.ADMIN] },
    { id: 'class-attendance', label: 'Appel des classes', icon: UserCheck, roles: [UserRole.PROFESSOR] },
    { id: 'attendance', label: 'Pointage', icon: ClipboardList, roles: [UserRole.STUDENT, UserRole.EMPLOYEE, UserRole.PROFESSOR, UserRole.RESPONSIBLE] },
    { id: 'chat', label: 'Messagerie', icon: MessageSquare, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.EMPLOYEE, UserRole.RESPONSIBLE] },
    { id: 'settings', label: 'Paramètres', icon: Settings, roles: [UserRole.ADMIN] },
  ];

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300 ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      
      <header className="sticky top-0 z-[100] w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="cursor-pointer group flex items-center gap-3" onClick={() => user ? setCurrentView('dashboard') : setCurrentView('login')}>
                <Logo className="h-10" />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button onClick={toggleTheme} className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             
             {user ? (
               <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                 <div className="w-8 h-8 rounded-full bg-insan-blue flex items-center justify-center text-white text-xs font-black">
                   {user.name.charAt(0)}
                 </div>
                 <div className="hidden sm:block">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{user.role}</p>
                   <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-none">{user.name}</p>
                 </div>
               </div>
             ) : (
               <button 
                  onClick={() => setCurrentView('login')}
                  className="px-6 py-2.5 rounded-2xl text-sm font-black transition-all flex items-center gap-3 shadow-xl bg-insan-orange text-white shadow-orange-500/20 hover:scale-105 active:scale-95"
               >
                  <Lock size={16}/> Connexion
               </button>
             )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {user && (
            <aside className="hidden lg:flex w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex-col shadow-xl z-40">
                <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                    <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 mt-4">Menu Gestion</p>
                    {dashboardNav.filter(item => hasAccess(item.roles)).map(item => (
                        <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${currentView === item.id ? 'bg-insan-blue text-white shadow-lg shadow-blue-500/20 font-black' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-insan-blue'}`}
                        >
                            <item.icon size={18} />
                            <span className="text-sm">{item.label}</span>
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 p-3 text-xs font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all uppercase tracking-widest"><LogOut size={16}/> Déconnexion</button>
                </div>
            </aside>
        )}

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950 p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
