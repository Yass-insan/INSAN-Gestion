
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

  const publicViews = ['home', 'formations-online', 'formations-presence', 'about', 'news', 'contact', 'public-register', 'login'];
  const isPublicView = publicViews.includes(currentView);

  const publicMenu = [
    { id: 'home', label: 'Accueil', icon: HomeIcon },
    { id: 'formations', label: 'Formations', icon: GraduationCap, sub: [
        { id: 'formations-online', label: 'En ligne', icon: PlayCircle },
        { id: 'formations-presence', label: 'Présentiel', icon: Building2 }
    ]},
    { id: 'about', label: 'À propos', icon: Info },
    { id: 'news', label: 'Actualité', icon: Globe },
    { id: 'contact', label: 'Nous contacter', icon: Phone },
  ];

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
    { id: 'manage-blog', label: 'Gestion Blog', icon: FileText, roles: [UserRole.ADMIN] },
    { id: 'employees', label: 'Staff & RH', icon: Briefcase, roles: [UserRole.ADMIN] },
    { id: 'tarification', label: 'Tarifs & Règles', icon: Euro, roles: [UserRole.ADMIN] },
    { id: 'stats', label: 'Statistiques CA', icon: TrendingUp, roles: [UserRole.ADMIN] },
    { id: 'attendance', label: 'Pointage', icon: ClipboardList, roles: [UserRole.STUDENT, UserRole.EMPLOYEE, UserRole.PROFESSOR, UserRole.RESPONSIBLE] },
    { id: 'chat', label: 'Messagerie', icon: MessageSquare, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.EMPLOYEE, UserRole.RESPONSIBLE] },
    { id: 'settings', label: 'Paramètres', icon: Settings, roles: [UserRole.ADMIN] },
  ];

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300 ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      
      <header className="sticky top-0 z-[100] w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="cursor-pointer group flex items-center gap-3" onClick={() => setCurrentView('home')}>
                <Logo className="h-10" />
            </div>

            <nav className="hidden md:flex items-center gap-1">
                {publicMenu.map(item => (
                    <div key={item.id} className="relative group">
                        <button 
                            onClick={() => !item.sub && setCurrentView(item.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${currentView === item.id || (item.sub && item.sub.some(s => s.id === currentView)) ? 'text-insan-blue dark:text-white bg-slate-100 dark:bg-slate-800' : 'text-slate-500 hover:text-insan-blue hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            {item.label}
                            {item.sub && <ChevronRight size={14} className="rotate-90 opacity-50"/>}
                        </button>
                        {item.sub && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                {item.sub.map(s => (
                                    <button key={s.id} onClick={() => setCurrentView(s.id)} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-insan-blue transition-colors flex items-center gap-3">
                                        <s.icon size={14}/> {s.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
             <button onClick={toggleTheme} className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             
             <button 
                onClick={handleDashboardEntry}
                className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all flex items-center gap-3 shadow-xl ${!isPublicView ? 'bg-insan-blue text-white shadow-blue-500/20' : 'bg-insan-orange text-white shadow-orange-500/20 hover:scale-105 active:scale-95'}`}
             >
                <Lock size={16}/> {user ? 'Mon Espace ✅' : 'Espace Formation ✅'}
             </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {user && !isPublicView && (
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

        <main className={`flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950 ${isPublicView ? '' : 'p-6 lg:p-10'}`}>
          <div className={`${isPublicView ? '' : 'max-w-7xl mx-auto'}`}>
            {children}
          </div>
          
          {isPublicView && (
              <footer className="bg-slate-900 text-white py-20 px-6 border-t border-slate-800 mt-20">
                  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
                      <div className="col-span-1 md:col-span-2">
                          <Logo className="h-12 mb-6" light={true} />
                          <p className="text-slate-400 max-w-sm text-sm leading-relaxed mx-auto md:mx-0">
                              L'Institut Insan est un pôle d'excellence dédié à l'enseignement, l'épanouissement et l'accompagnement spirituel et intellectuel de l'étudiant.
                          </p>
                      </div>
                      <div>
                          <h4 className="font-black text-lg mb-6 text-insan-orange uppercase tracking-widest text-sm">Navigation</h4>
                          <ul className="space-y-4 text-slate-400 font-bold text-sm">
                              <li><button onClick={() => setCurrentView('home')} className="hover:text-white transition-colors">Accueil</button></li>
                              <li><button onClick={() => setCurrentView('about')} className="hover:text-white transition-colors">À propos</button></li>
                              <li><button onClick={() => setCurrentView('news')} className="hover:text-white transition-colors">Actualité</button></li>
                          </ul>
                      </div>
                      <div>
                          <h4 className="font-black text-lg mb-6 text-insan-orange uppercase tracking-widest text-sm">Contact</h4>
                          <p className="text-slate-400 text-sm font-bold mb-2">99 rue de Gerland, 69007 Lyon</p>
                          <button onClick={() => setCurrentView('contact')} className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase shadow-xl hover:bg-insan-orange hover:text-white transition-all">Nous écrire</button>
                      </div>
                  </div>
              </footer>
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;
