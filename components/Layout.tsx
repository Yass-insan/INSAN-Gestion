
import React, { useState, useRef } from 'react';
import { User, UserRole, InstituteSettings, Notification } from '../types';
import { 
  LayoutDashboard, Users, ClipboardList, LogOut, MessageSquare, 
  ChevronRight, ChevronLeft, Home as HomeIcon, UserCheck, 
  GraduationCap, TrendingUp, Sun, Moon, Info, Phone, Globe, Lock, 
  PlayCircle, Building2, BookOpen, Layers, Briefcase, Euro, Settings, HeartHandshake,
  FileText, Menu, X, Bell, Trash2, Check, Key
} from 'lucide-react';
import { getTranslation } from '../services/i18n';
import { Logo } from './Logo';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  children: React.ReactNode;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  settings: InstituteSettings;
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onClearNotifications?: () => void;
  onNotificationClick?: (notif: Notification) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  user, onLogout, currentView, setCurrentView, children, 
  isDarkMode, toggleTheme, settings, 
  notifications = [], onMarkAsRead, onClearNotifications, onNotificationClick
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const lang = settings.language || 'fr';
  const t = (key: string) => getTranslation(key, lang);
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  
  const bgX = useTransform(smoothX, [0, 300], [-10, 10]);
  const bgY = useTransform(smoothY, [0, 800], [-10, 10]);
  const bgX2 = useTransform(smoothX, [0, 300], [10, -10]);
  const bgY2 = useTransform(smoothY, [0, 800], [10, -10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sidebarRef.current) return;
    const rect = sidebarRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

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
    { id: 'manage-courses', label: 'Académie', icon: BookOpen, roles: [UserRole.ADMIN] },
    { id: 'employees', label: 'Staff & RH', icon: Briefcase, roles: [UserRole.ADMIN] },
    { id: 'keys', label: 'Gestion des Clés', icon: Key, roles: [UserRole.ADMIN] },
    { id: 'tarification', label: 'Tarifs & Règles', icon: Euro, roles: [UserRole.ADMIN] },
    { id: 'stats', label: 'Statistiques CA', icon: TrendingUp, roles: [UserRole.ADMIN, UserRole.RESPONSIBLE] },
    { id: 'class-attendance', label: 'Appel des classes', icon: UserCheck, roles: [UserRole.PROFESSOR] },
    { id: 'attendance', label: 'Pointage', icon: ClipboardList, roles: [UserRole.STUDENT, UserRole.EMPLOYEE, UserRole.PROFESSOR, UserRole.RESPONSIBLE] },
    { id: 'chat', label: 'Messagerie', icon: MessageSquare, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.EMPLOYEE, UserRole.RESPONSIBLE, UserRole.STUDENT] },
    { id: 'my-documents', label: 'Mes Documents RH', icon: FileText, roles: [UserRole.PROFESSOR, UserRole.EMPLOYEE, UserRole.RESPONSIBLE] },
    { id: 'settings', label: 'Paramètres', icon: Settings, roles: [UserRole.ADMIN] },
  ];

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300 ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      
      <header className="sticky top-0 z-[100] w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="cursor-pointer group flex items-center gap-3" onClick={() => user ? setCurrentView('dashboard') : setCurrentView('login')}>
                <Logo className="h-10" logoUrl={settings.logo} logoUrlDark={settings.logoDark} isDarkMode={isDarkMode} />
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* NOTIFICATIONS */}
             {user && (
               <div className="relative">
                 <button 
                   onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                   className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-white border border-transparent hover:border-slate-200 transition-all relative"
                 >
                   <Bell size={20} />
                   {unreadCount > 0 && (
                     <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                       {unreadCount}
                     </span>
                   )}
                 </button>

                 {isNotificationsOpen && (
                   <div className="absolute top-full right-0 mt-4 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-[200] animate-fade-in">
                     <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                       <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-widest">Notifications</h3>
                       {notifications.length > 0 && (
                         <button 
                           onClick={onClearNotifications}
                           className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest"
                         >
                           Tout effacer
                         </button>
                       )}
                     </div>
                     <div className="max-h-96 overflow-y-auto custom-scrollbar">
                       {notifications.length > 0 ? (
                         <div className="divide-y divide-slate-50 dark:divide-slate-800">
                           {notifications.map(n => (
                             <div 
                               key={n.id} 
                               onClick={() => {
                                 onNotificationClick?.(n);
                                 setIsNotificationsOpen(false);
                               }}
                               className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative group cursor-pointer ${!n.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                             >
                               <div className="flex justify-between items-start gap-2">
                                 <div className="flex-1">
                                   <p className={`text-xs font-black ${!n.read ? 'text-insan-blue dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{n.title}</p>
                                   <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                                   <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase">{new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                 </div>
                                 {!n.read && (
                                   <button 
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       onMarkAsRead?.(n.id);
                                     }}
                                     className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-insan-blue dark:text-blue-400 rounded-lg hover:bg-insan-blue hover:text-white transition-all"
                                     title="Marquer comme lu"
                                   >
                                     <Check size={12} />
                                   </button>
                                 )}
                               </div>
                             </div>
                           ))}
                         </div>
                       ) : (
                         <div className="p-12 text-center">
                           <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                             <Bell size={20} />
                           </div>
                           <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Aucune notification</p>
                         </div>
                       )}
                     </div>
                   </div>
                 )}
               </div>
             )}

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

      <div className="flex-1 flex">
        {user && (
            <>
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-[120] w-72 bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <Logo className="h-8" logoUrl={settings.logo} logoUrlDark={settings.logoDark} isDarkMode={isDarkMode} />
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-2">
                    <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Menu Gestion</p>
                    {dashboardNav.filter(item => hasAccess(item.roles)).map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setCurrentView(item.id);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${currentView === item.id ? 'bg-insan-blue text-white shadow-lg shadow-blue-500/20 font-black' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-insan-blue'}`}
                        >
                            <item.icon size={18} />
                            <span className="text-sm font-bold">{item.label}</span>
                        </button>
                    ))}
                </div>
                <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                    <button 
                        onClick={() => {
                            onLogout();
                            setIsMobileMenuOpen(false);
                        }} 
                        className="w-full flex items-center justify-center gap-2 p-4 text-xs font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all uppercase tracking-widest"
                    >
                        <LogOut size={16}/> 
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>
            
            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
                <button 
                    onClick={() => setCurrentView('dashboard')}
                    className={`flex flex-col items-center gap-1 p-2 transition-all ${currentView === 'dashboard' ? 'text-insan-blue' : 'text-slate-400 dark:text-slate-500'}`}
                >
                    <LayoutDashboard size={20} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Accueil</span>
                </button>
                
                {/* Role Specific Item 1 */}
                {user.role === UserRole.ADMIN && (
                    <button 
                        onClick={() => setCurrentView('inscriptions')}
                        className={`flex flex-col items-center gap-1 p-2 transition-all ${currentView === 'inscriptions' ? 'text-insan-blue' : 'text-slate-400 dark:text-slate-500'}`}
                    >
                        <UserCheck size={20} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Inscriptions</span>
                    </button>
                )}
                {user.role === UserRole.PROFESSOR && (
                    <button 
                        onClick={() => setCurrentView('class-attendance')}
                        className={`flex flex-col items-center gap-1 p-2 transition-all ${currentView === 'class-attendance' ? 'text-insan-blue' : 'text-slate-400 dark:text-slate-500'}`}
                    >
                        <UserCheck size={20} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Appel</span>
                    </button>
                )}
                {(user.role === UserRole.STUDENT || user.role === UserRole.EMPLOYEE || user.role === UserRole.RESPONSIBLE) && (
                    <button 
                        onClick={() => setCurrentView('attendance')}
                        className={`flex flex-col items-center gap-1 p-2 transition-all ${currentView === 'attendance' ? 'text-insan-blue' : 'text-slate-400 dark:text-slate-500'}`}
                    >
                        <ClipboardList size={20} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Pointage</span>
                    </button>
                )}

                {/* Role Specific Item 2 */}
                {user.role === UserRole.ADMIN && (
                    <button 
                        onClick={() => setCurrentView('stats')}
                        className={`flex flex-col items-center gap-1 p-2 transition-all ${currentView === 'stats' ? 'text-insan-blue' : 'text-slate-400 dark:text-slate-500'}`}
                    >
                        <TrendingUp size={20} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Stats</span>
                    </button>
                )}
                {(user.role === UserRole.PROFESSOR || user.role === UserRole.RESPONSIBLE || user.role === UserRole.EMPLOYEE || user.role === UserRole.STUDENT) && (
                    <button 
                        onClick={() => setCurrentView('chat')}
                        className={`flex flex-col items-center gap-1 p-2 transition-all ${currentView === 'chat' ? 'text-insan-blue' : 'text-slate-400 dark:text-slate-500'}`}
                    >
                        <MessageSquare size={20} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Messages</span>
                    </button>
                )}
                {user.role === UserRole.STUDENT && (
                    <button 
                        onClick={() => setCurrentView('dashboard')} // Or another relevant view for student
                        className={`flex flex-col items-center gap-1 p-2 transition-all ${currentView === 'dashboard' ? 'text-insan-blue' : 'text-slate-400 dark:text-slate-500'}`}
                    >
                        <GraduationCap size={20} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Cursus</span>
                    </button>
                )}

                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className={`flex flex-col items-center gap-1 p-2 transition-all ${isMobileMenuOpen ? 'text-insan-blue' : 'text-slate-400 dark:text-slate-500'}`}
                >
                    <Menu size={20} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Menu</span>
                </button>
            </nav>

            {/* Desktop Sidebar */}
            <aside 
                ref={sidebarRef}
                onMouseMove={handleMouseMove}
                className="hidden lg:flex sticky top-20 h-[calc(100vh-5rem)] relative overflow-hidden w-20 hover:w-72 bg-[#262262] border-r border-white/10 flex-col shadow-2xl z-40 transition-all duration-300 group"
            >
                {/* Parallax Background Elements */}
                <motion.div 
                    style={{ x: bgX, y: bgY }}
                    className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                <motion.div 
                    style={{ x: bgX2, y: bgY2 }}
                    className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 custom-scrollbar">
                        <motion.p 
                            className="px-4 text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
                        >
                            Menu Gestion
                        </motion.p>
                        
                        {dashboardNav.filter(item => hasAccess(item.roles)).map((item, index) => (
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={item.id}
                                onClick={() => setCurrentView(item.id)}
                                className={`w-full flex items-center px-3.5 py-3.5 rounded-2xl transition-all duration-300 ${currentView === item.id ? 'bg-white text-[#262262] shadow-xl font-black' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center justify-center w-6 h-6 shrink-0">
                                    <item.icon size={20} className={currentView === item.id ? 'text-[#262262]' : 'text-white'} />
                                </div>
                                <span className="text-sm font-bold truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-4 whitespace-nowrap">{item.label}</span>
                            </motion.button>
                        ))}
                    </div>
                    <div className="p-4 border-t border-white/10">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onLogout} 
                            className="w-full flex items-center px-3.5 py-4 text-xs font-black text-white/70 hover:text-white hover:bg-red-500/20 rounded-2xl transition-all duration-300 uppercase tracking-widest"
                        >
                            <div className="flex items-center justify-center w-6 h-6 shrink-0">
                                <LogOut size={18} className="text-white" /> 
                            </div>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-4 whitespace-nowrap">Déconnexion</span>
                        </motion.button>
                    </div>
                </div>
            </aside>
            </>
        )}

        <main className={`flex-1 bg-slate-50 dark:bg-slate-950 p-6 lg:p-10 ${user ? 'pb-24 lg:pb-10' : ''}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
