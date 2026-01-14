import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole, Notification } from '../types';
import { 
  LayoutDashboard, Users, ClipboardList, LogOut, MessageSquare, 
  Bell, Briefcase, BookOpen, Search, Settings, BarChart3, 
  ChevronRight, Home, Palmtree, UserCheck, Calculator, FileText,
  GraduationCap, TrendingUp, HeartHandshake, Sun, Moon, AlertTriangle
} from 'lucide-react';
import { NOTIFICATIONS } from '../services/mockData';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface LayoutProps {
  user: User;
  onLogout: () => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  children: React.ReactNode;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, currentView, setCurrentView, children, isDarkMode, toggleTheme }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [logoError, setLogoError] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const encodedLogoUrl = encodeURIComponent("https://institut-insan.com/wp-content/uploads/2023/07/Logo-Institut-Insan-1.png");
  const LOGO_URL = `https://wsrv.nl/?url=${encodedLogoUrl}&w=200&output=png`;

  useEffect(() => {
    const userNotifs = NOTIFICATIONS.filter(n => {
        if (user.role === UserRole.STUDENT) return n.userId === '3' || n.type === 'info';
        if (user.role === UserRole.PROFESSOR) return n.userId === '2';
        return true; 
    });
    setNotifications(userNotifs);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasAccess = (itemRoles: UserRole[]) => {
      if (itemRoles.includes(user.role)) return true;
      if (user.secondaryRoles && user.secondaryRoles.some(role => itemRoles.includes(role))) return true;
      return false;
  };

  const navStructure: NavSection[] = [
    {
      title: "Vue d'ensemble",
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT, UserRole.EMPLOYEE, UserRole.RESPONSIBLE] },
      ]
    },
    {
      title: "Scolarité & Pédagogie",
      items: [
        { id: 'inscriptions', label: 'Inscriptions', icon: UserCheck, roles: [UserRole.ADMIN, UserRole.EMPLOYEE] },
        { id: 'manage-courses', label: 'Gestion des Cours', icon: BookOpen, roles: [UserRole.ADMIN] },
        { id: 'tarification', label: 'Tarifs & Règles', icon: Calculator, roles: [UserRole.ADMIN] },
        { id: 'attendance', label: 'Pointage / Appel', icon: ClipboardList, roles: [UserRole.STUDENT, UserRole.EMPLOYEE, UserRole.PROFESSOR, UserRole.RESPONSIBLE] },
        { id: 'students', label: 'Suivi Étudiants', icon: Users, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.RESPONSIBLE] },
      ]
    },
    {
      title: "Ressources Humaines",
      items: [
        { id: 'employees', label: 'Annuaire Staff', icon: Briefcase, roles: [UserRole.ADMIN] },
        { id: 'my-rh', label: 'Mes Congés', icon: Palmtree, roles: [UserRole.PROFESSOR, UserRole.EMPLOYEE, UserRole.RESPONSIBLE] },
        { id: 'chat', label: 'Chat Interne', icon: MessageSquare, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.EMPLOYEE, UserRole.RESPONSIBLE] },
      ]
    },
    {
      title: "Pilotage",
      items: [
        { id: 'stats', label: 'Statistiques CA', icon: TrendingUp, roles: [UserRole.ADMIN] },
        { id: 'settings', label: 'Paramètres', icon: Settings, roles: [UserRole.ADMIN] },
      ]
    }
  ];

  const filteredStructure = navStructure.map(section => ({
    ...section,
    items: section.items.filter(item => hasAccess(item.roles))
  })).filter(section => section.items.length > 0);

  const getCurrentLabel = () => {
    for (const section of navStructure) {
      const item = section.items.find(i => i.id === currentView);
      if (item) return item.label;
    }
    return 'Accueil';
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 flex-col shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border-r border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="p-8 flex items-center justify-center cursor-pointer" onClick={() => setCurrentView('dashboard')}>
          {logoError ? (
            <div className="flex flex-col items-center justify-center">
              <span className="font-extrabold text-insan-blue dark:text-blue-400 tracking-tighter text-2xl leading-none">INSTITUT</span>
              <span className="font-bold text-insan-orange tracking-[0.2em] text-sm leading-none mt-1">INSAN</span>
            </div>
          ) : (
            <img src={LOGO_URL} alt="Institut Insan" className="h-12 w-auto object-contain" onError={() => setLogoError(true)} />
          )}
        </div>

        <nav className="px-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar pb-8">
          {filteredStructure.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{section.title}</p>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                    currentView === item.id 
                      ? 'bg-insan-blue text-white shadow-md shadow-blue-900/20 font-bold' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-insan-blue dark:hover:text-blue-400'
                  }`}
                >
                  <item.icon size={18} className={`transition-transform duration-200 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110 group-hover:text-insan-orange'}`} />
                  <span className="text-sm tracking-wide">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <div className="relative">
                <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-600 shadow-sm object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-600 rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-slate-800 dark:text-slate-100">{user.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate uppercase font-bold">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 border border-slate-200 dark:border-slate-700 hover:border-red-100 dark:hover:border-red-900/30 rounded-xl transition-colors group"
          >
            <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
            DÉCONNEXION
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-72 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                <Home size={12}/> 
                <ChevronRight size={10} />
                <span className="text-slate-800 dark:text-slate-100">{getCurrentLabel()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 w-64 shadow-sm focus-within:ring-2 focus-within:ring-insan-blue/10 dark:focus-within:ring-blue-500/20 transition-colors">
                <Search size={16} className="text-slate-400 mr-2" />
                <input type="text" placeholder="Recherche rapide..." className="bg-transparent text-sm outline-none w-full font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400" />
            </div>

            {toggleTheme && (
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-full transition-all bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-insan-blue dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700"
                    title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            )}

            <div className="relative" ref={notifRef}>
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2.5 rounded-full transition-all ${showNotifications ? 'bg-insan-orange text-white shadow-md' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-insan-blue dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700'}`}
                >
                    <Bell size={20} />
                    {notifications.filter(n => !n.read).length > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    )}
                </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;