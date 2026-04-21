import React, { useState, useMemo } from 'react';
import { 
  User, NewsItem, Course, AttendanceRecord, Homework, 
  InstituteSettings, LeaveRequest, LeaveType, LeaveStatus, 
  StudentFormRequest, StudentFormTemplate, FormFieldType, 
  RegistrationStatus, RegistrationDossier, Notification, GlobalHoliday, Pole 
} from '../../types';
import ClockIn from '../../components/ClockIn';
import StudentFormFiller from './StudentFormFiller';
import { Card, Button, Badge, PageHeader } from '../../components/ui/DesignSystem';
import { getStudentStats, getStatusColor } from '../../services/utils';
import { 
    History, Bell, BookOpen, Clock, MapPin, Upload, X, Check, Calendar, 
    AlertCircle, Phone, Mail, FileText, Paperclip, Image as ImageIcon, 
    File as FileIcon, ClipboardCheck, ArrowRight, CheckCircle, Eye, 
    User as UserIcon, ShieldCheck, Download, ExternalLink, Activity,
    MessageSquare, Wallet, Megaphone, Info, Settings
} from 'lucide-react';
import { 
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
    CartesianGrid, Tooltip, AreaChart, Area, Cell, BarChart, Bar
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface StudentDashboardProps {
  user: User;
  users: User[];
  poles: Pole[];
  news: NewsItem[];
  courses: Course[];
  attendance: AttendanceRecord[];
  homework: Homework[];
  leaveRequests?: LeaveRequest[];
  settings?: InstituteSettings;
  formRequests?: StudentFormRequest[];
  formTemplates?: StudentFormTemplate[];
  dossiers?: RegistrationDossier[];
  notifications?: Notification[];
  globalHolidays?: GlobalHoliday[];
  onClockIn: (isExit: boolean) => void;
  onJustify?: (recordId: string, text: string) => void;
  onManageLeave?: (action: 'add' | 'update', leave: LeaveRequest) => void;
  onReadMore?: (news: NewsItem) => void;
  onViewPdf?: (url: string, title: string) => void;
  onUpdateFormStatus?: (id: string, status: 'PENDING' | 'COMPLETED', data?: any) => void;
  onNavigate?: (view: string) => void;
  onAddNotification?: (notif: Omit<Notification, 'id' | 'read' | 'time'>) => void;
  onMarkNotifAsRead?: (id: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
    user, users = [], poles = [], news, courses, attendance, homework, leaveRequests = [], settings, 
    formRequests = [], formTemplates = [], dossiers = [], notifications = [],
    globalHolidays = [],
    onClockIn, onJustify, onManageLeave, onReadMore, onViewPdf, onUpdateFormStatus,
    onNavigate, onAddNotification, onMarkNotifAsRead
}) => {
    // Tab State
    const [activeTab, setActiveTab] = useState<'synthesis' | 'attendance' | 'homework' | 'folder'>('synthesis');

    const stats = getStudentStats(user.id, user.classId || '', attendance);
    const myHomework = homework.filter(h => h.courseId === user.classId);
    const myForms = formRequests.filter(r => r.studentId === user.id);
    const pendingForms = myForms.filter(r => r.status === 'PENDING');
    
    const myHistory = attendance.filter(r => r.studentId === user.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const myAbsenceRequests = leaveRequests.filter(l => l.userId === user.id).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    const studentCourse = courses.find(c => c.id === user.classId);

    // LOGIQUE FINANCIÈRE (Lien Admin)
    const myDossier = dossiers.find(d => d.students.some(s => s.id === user.id) && d.status !== RegistrationStatus.CANCELLED);
    
    const financialSummary = useMemo(() => {
        if (!myDossier) return null;
        const subtotal = myDossier.enrollments.reduce((acc, curr) => acc + (curr.isVolunteerTeacher ? 0 : (curr.basePrice || 0) + (curr.formulaSurcharge || 0)), 0);
        const total = subtotal + (myDossier.dossierFees || 0) + (myDossier.isMontessoriMandatory ? 80 : 0) - (myDossier.autoDiscount || 0) - (myDossier.manualDiscount || 0);
        const paid = myDossier.payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
        const balance = total - paid;
        return { total, paid, balance, percent: total > 0 ? (paid / total) * 100 : 0 };
    }, [myDossier]);

    const unreadNotifications = notifications.filter(n => !n.read);

    // Record du jour
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = attendance.find(r => r.studentId === user.id && r.date === today);

    // Justification Modal State
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [justificationText, setJustificationText] = useState('');
    const [selectedRequestForFill, setSelectedRequestForFill] = useState<StudentFormRequest | null>(null);
    const [selectedRequestForView, setSelectedRequestForView] = useState<StudentFormRequest | null>(null);

    // Future Absence Modal State
    const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
    const [absenceStart, setAbsenceStart] = useState('');
    const [absenceEnd, setAbsenceEnd] = useState('');
    const [absenceReason, setAbsenceReason] = useState('');

    const handleOpenJustify = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setJustificationText('');
    };

    const handleSubmitJustification = () => {
        if (onJustify && selectedRecord) {
            onJustify(selectedRecord.id, justificationText);
            alert("Justificatif envoyé à l'administration.");
            setSelectedRecord(null);
        }
    };

    const handleSubmitAbsence = (e: React.FormEvent) => {
        e.preventDefault();
        if (onManageLeave) {
            onManageLeave('add', {
                id: Date.now().toString(),
                userId: user.id,
                type: LeaveType.OTHER,
                startDate: absenceStart,
                endDate: absenceEnd,
                reason: absenceReason,
                status: LeaveStatus.PENDING,
                requestDate: new Date().toISOString().split('T')[0]
            });
            setIsAbsenceModalOpen(false);
            setAbsenceStart(''); setAbsenceEnd(''); setAbsenceReason('');
            // Toast notification would be better, but sticking to existing pattern for now or improving if possible
        }
    };

    // --- MINI COMPONENTS FOR DASHBOARD POLISH ---

    const StudentIDCard = () => (
        <Card className="relative overflow-hidden group border-none shadow-2xl shadow-blue-900/20 bg-gradient-to-br from-insan-blue to-blue-800 text-white p-8 rounded-[3rem]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-start gap-6 relative z-10">
                <div className="shrink-0 relative">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white/20 shadow-xl">
                        <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-xl shadow-lg border-2 border-blue-600">
                        <ShieldCheck size={14} />
                    </div>
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-black uppercase tracking-tight leading-tight mb-1">{user.name}</h2>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-4">Étudiant #{(user.id || '0').padStart(6, '0')}</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-2 rounded-xl border border-white/5">
                            <p className="text-white/40 text-[8px] font-black uppercase tracking-widest mb-0.5">Classe</p>
                            <p className="text-[10px] font-bold truncate">{studentCourse?.name || '---'}</p>
                        </div>
                        <div className="bg-white/10 p-2 rounded-xl border border-white/5">
                            <p className="text-white/40 text-[8px] font-black uppercase tracking-widest mb-0.5">Pôle</p>
                            <p className="text-[10px] font-bold truncate">{studentCourse?.pole || '---'}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 flex justify-between items-end relative z-10">
                <div className="flex gap-2">
                    <Badge color="green" className="bg-green-500/20 text-green-300 border-green-500/30">ACTIF</Badge>
                    <Badge color="blue" className="bg-blue-400/20 text-blue-200 border-blue-400/30">INSCRIT</Badge>
                </div>
                <div className="p-2 bg-white/10 rounded-xl hover:bg-white/20 cursor-pointer transition-colors backdrop-blur-sm">
                    <Download size={16} />
                </div>
            </div>
        </Card>
    );

    const FinancialBalance = () => {
        if (!financialSummary) return null;
        const currency = settings?.currency || '€';
        return (
            <Card className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <Wallet size={20} className="text-emerald-500" /> Solde Financier
                        </h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">État de vos réglements</p>
                    </div>
                    <Badge color={financialSummary.balance <= 0 ? 'green' : 'orange'}>
                        {financialSummary.balance <= 0 ? 'À JOUR' : 'RESTE À RÉGLER'}
                    </Badge>
                </div>
                
                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <p className="text-3xl font-black text-slate-800 dark:text-white">{financialSummary.paid.toLocaleString()} {currency}</p>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">sur {financialSummary.total.toLocaleString()} {currency}</p>
                    </div>
                    
                    <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-50 dark:border-slate-700">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${financialSummary.percent}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${financialSummary.percent >= 100 ? 'bg-emerald-500' : 'bg-insan-blue shadow-[0_0_15px_rgba(37,99,235,0.4)]'}`}
                        ></motion.div>
                    </div>

                    {financialSummary.balance > 0 && (
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex items-center gap-3">
                            <AlertCircle size={18} className="text-orange-600 shrink-0" />
                            <p className="text-[10px] font-bold text-orange-700 dark:text-orange-400 leading-tight">
                                Un solde de {financialSummary.balance.toLocaleString()} {currency} est encore attendu par la comptabilité.
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    const QuickActions = () => (
        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => onNavigate?.('chat')}
                className="p-6 bg-insan-blue/5 dark:bg-insan-blue/10 rounded-[2rem] border border-insan-blue/10 hover:border-insan-blue/40 transition-all flex flex-col items-center justify-center gap-3 group active:scale-95"
            >
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-insan-blue group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                    <MessageSquare size={24} />
                    {unreadNotifications.some(n => n.metadata?.type === 'chat') && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-bounce"></div>
                    )}
                </div>
                <span className="text-[10px] font-black text-insan-blue uppercase tracking-widest">Messagerie</span>
            </button>
            <button 
                onClick={() => setActiveTab('folder')}
                className="p-6 bg-orange-500/5 dark:bg-orange-500/10 rounded-[2rem] border border-orange-500/10 hover:border-orange-500/40 transition-all flex flex-col items-center justify-center gap-3 group active:scale-95"
            >
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-orange-500 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <FileText size={24} />
                </div>
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Dossier Digital</span>
            </button>
        </div>
    );

    const AttendanceTrend = () => {
        // Mock data based on stats
        const data = [
            { name: 'Lun', rate: stats.rate - 2 },
            { name: 'Mar', rate: stats.rate + 1 },
            { name: 'Mer', rate: stats.rate - 5 },
            { name: 'Jeu', rate: stats.rate },
            { name: 'Ven', rate: stats.rate + 3 },
        ];

        return (
            <Card className="p-6 h-[300px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Activity size={18} className="text-insan-blue" /> 
                        Tendance Assiduité
                    </h3>
                    <Badge color={stats.rate > 90 ? 'green' : 'orange'}>{stats.rate}% GLOBAL</Badge>
                </div>
                <div className="flex-1 -mx-4 -mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontWeight: 800, color: '#1e3a8a' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="rate" 
                                stroke="#1e3a8a" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorRate)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        );
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const config: Record<string, { color: string, icon: any }> = {
            'PRESENT': { color: 'green', icon: CheckCircle },
            'ABSENT': { color: 'red', icon: X },
            'LATE': { color: 'orange', icon: Clock },
            'JUSTIFIED': { color: 'blue', icon: ShieldCheck },
        };
        const { color, icon: Icon } = config[status] || { color: 'slate', icon: History };
        return <Badge color={color as any} icon={<Icon size={10}/>}>{status}</Badge>;
    };

    return (
        <div className="animate-fade-in space-y-6 pb-24 md:pb-0">
            {/* Header with User Profile / Actions */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-insan-blue to-blue-900 border-4 border-white dark:border-slate-800 shadow-2xl flex items-center justify-center text-2xl font-black text-white">
                            {user.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-slate-800 rounded-full"></div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-1">
                            {user.name.split(' ')[0]} <span className="text-insan-blue">{user.name.split(' ')[1] || ''}</span>
                        </h2>
                        <div className="flex items-center gap-2">
                            <Badge color="gray" className="text-[8px] py-0">{user.role}</Badge>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Matricule: #{user.id.slice(-5)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => onNavigate?.('chat')}
                        className="relative p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm transition-all group active:scale-95"
                    >
                        <MessageSquare size={20} className="text-slate-400 group-hover:text-insan-blue" />
                        {unreadNotifications.some(n => n.metadata?.type === 'chat') && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                        )}
                    </button>
                    <button 
                        onClick={() => {/* Settings logic */}}
                        className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm transition-all group active:scale-95"
                    >
                        <Settings size={20} className="text-slate-400 group-hover:text-insan-blue" />
                    </button>
                </div>
            </div>
            
            {/* Navigation Tabs - Unified School Record Style */}
            <nav className="flex sticky top-4 z-[100] backdrop-blur-xl bg-white/60 dark:bg-slate-950/60 p-2 rounded-[2.5rem] border border-white/20 shadow-2xl overflow-x-auto no-scrollbar gap-1 mb-10">
                {[
                    { id: 'synthesis', label: 'Synthèse', icon: UserIcon },
                    { id: 'attendance', label: 'Assiduité', icon: Activity, badge: `${stats.rate}%`, badgeColor: stats.rate < 80 ? 'bg-red-500' : 'bg-green-500' },
                    { id: 'homework', label: 'Devoirs', icon: BookOpen, badge: myHomework.length, badgeColor: 'bg-insan-blue' },
                    { id: 'folder', label: 'Dossier', icon: FileText, badge: pendingForms.length, badgeColor: 'bg-red-500', pulse: pendingForms.length > 0 }
                ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                relative px-6 py-4 rounded-3xl flex items-center gap-3 transition-all duration-500 outline-none whitespace-nowrap
                                ${isActive ? 'text-insan-blue' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}
                            `}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute inset-0 bg-white dark:bg-slate-800 shadow-xl shadow-blue-900/5 dark:shadow-none rounded-[1.5rem] border border-slate-100 dark:border-slate-700"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-3 font-black text-[10px] uppercase tracking-widest">
                                <Icon size={16} className={isActive ? 'text-insan-blue' : 'text-slate-400'} />
                                <span>{tab.label}</span>
                                {tab.badge !== undefined && (tab.badge > 0 || typeof tab.badge === 'string') && (
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] text-white font-black ${tab.badgeColor} ${tab.pulse ? 'animate-pulse' : ''}`}>
                                        {tab.badge}
                                    </span>
                                )}
                            </span>
                        </button>
                    );
                })}
            </nav>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >

            {/* --- TAB: SYNTHESIS --- */}
            {activeTab === 'synthesis' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* ID CARD REPLACING KPIS FOR STYLE */}
                        <StudentIDCard />

                        {/* QUICK STATS */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Card className="p-5 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 flex items-center gap-4 group hover:scale-[1.02] transition-transform">
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl text-green-600 shadow-sm group-hover:rotate-12 transition-transform"><CheckCircle size={24}/></div>
                                <div><p className="text-2xl font-black text-slate-800 dark:text-white leading-none">{stats.present}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Présences</p></div>
                            </Card>
                            <Card className="p-5 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 flex items-center gap-4 group hover:scale-[1.02] transition-transform">
                                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl text-orange-500 shadow-sm group-hover:rotate-12 transition-transform"><Clock size={24}/></div>
                                <div><p className="text-2xl font-black text-slate-800 dark:text-white leading-none">{stats.late}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Retards</p></div>
                            </Card>
                            <Card className="p-5 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 flex items-center gap-4 group hover:scale-[1.02] transition-transform">
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-500 shadow-sm group-hover:rotate-12 transition-transform"><AlertCircle size={24}/></div>
                                <div><p className="text-2xl font-black text-slate-800 dark:text-white leading-none">{stats.absent}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Absences</p></div>
                            </Card>
                        </div>

                         {/* News Grid */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-insan-blue/5 dark:bg-blue-900/20 rounded-2xl text-insan-blue"><Megaphone size={20}/></div>
                                    <div>
                                        <h3 className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-tight">Annonces & Actualités</h3>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Informations du pole administratif</p>
                                    </div>
                                </div>
                                <button onClick={() => onNavigate?.('dashboard')} className="text-[10px] font-black text-insan-blue hover:underline uppercase tracking-widest">Voir tout</button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {news.length > 0 ? news.map(n => (
                                    <Card 
                                        key={n.id} 
                                        onClick={() => onReadMore?.(n)}
                                        className={`flex flex-col overflow-hidden h-full group cursor-pointer hover:shadow-2xl transition-all ${n.isUrgent ? 'border-red-200 dark:border-red-900/50 ring-1 ring-red-100 dark:ring-red-900/30' : 'border-slate-100 dark:border-slate-800'}`}
                                    >
                                        {(n.coverUrl || n.mediaUrl) && (
                                            <div className="w-full h-48 overflow-hidden relative">
                                                <img src={n.coverUrl || n.mediaUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={n.title} referrerPolicy="no-referrer" />
                                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent"></div>
                                                {n.isUrgent && (
                                                    <div className="absolute top-3 right-3 animate-pulse">
                                                        <Badge color="red" icon={<AlertCircle size={10}/>}>URGENT</Badge>
                                                    </div>
                                                )}
                                                <div className="absolute bottom-3 left-4 flex gap-2">
                                                    <span className="text-[9px] font-bold text-white px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg uppercase tracking-widest">{n.category || 'INFO'}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{new Date(n.date).toLocaleDateString()}</span>
                                                {!(n.coverUrl || n.mediaUrl) && n.isUrgent && <Badge color="red">URGENT</Badge>}
                                            </div>
                                            <h4 className={`font-black text-lg mb-2 leading-tight ${n.isUrgent ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>{n.title}</h4>
                                            <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4 flex-1">{n.content}</p>
                                            
                                            <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                                <span className="flex items-center gap-1.5"><UserIcon size={12}/> {n.author}</span>
                                                <span className="text-insan-blue dark:text-blue-400 flex items-center gap-1">Lire l'annonce <ArrowRight size={12}/></span>
                                            </div>
                                        </div>
                                    </Card>
                                 )) : (
                                     <div className="col-span-2 p-12 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                                         <Megaphone className="text-slate-300 mb-4" size={48} />
                                         <p className="font-black text-slate-400 uppercase tracking-widest">Aucune actualité récente</p>
                                     </div>
                                 )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                         {/* URGENT NOTIFICATIONS (Lien logique Admin) */}
                         {unreadNotifications.length > 0 && (
                             <Card className="p-6 bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 overflow-hidden relative rounded-[2.5rem]">
                                 <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 scale-150 pointer-events-none">
                                     <Megaphone size={80} className="text-red-500" />
                                 </div>
                                 <h3 className="font-black text-red-700 dark:text-red-400 uppercase tracking-tight flex items-center gap-2 mb-4 relative z-10">
                                     <Bell size={18} /> Notifications
                                 </h3>
                                 <div className="space-y-3 relative z-10">
                                     {unreadNotifications.slice(0, 2).map(n => (
                                         <div key={n.id} className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-red-50 dark:border-red-900/30 flex items-start gap-3">
                                             <div className="p-1.5 bg-red-100 dark:bg-red-900/40 rounded-lg text-red-600 dark:text-red-400">
                                                 <Info size={14} />
                                             </div>
                                             <div className="flex-1">
                                                 <p className="text-[10px] font-black leading-tight text-slate-800 dark:text-white uppercase tracking-tight">{n.title}</p>
                                                 <p className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{n.message}</p>
                                             </div>
                                             <button onClick={() => onMarkNotifAsRead?.(n.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                                                 <Check size={14} />
                                             </button>
                                         </div>
                                     ))}
                                     <button onClick={() => onNavigate?.('chat')} className="w-full text-center text-[9px] font-black text-red-600 hover:underline uppercase tracking-widest mt-2">Accéder à la messagerie</button>
                                 </div>
                             </Card>
                         )}

                         <FinancialBalance />
                         
                         {/* CALENDRIER SCOLAIRE (Lien Admin) */}
                         <Card className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800">
                             <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2 mb-6">
                                 <Calendar size={20} className="text-insan-blue" /> Calendrier
                             </h4>
                             <div className="space-y-4">
                                 {globalHolidays.length > 0 ? globalHolidays.map(h => (
                                     <div key={h.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-all hover:translate-x-1">
                                         <div className="flex items-center gap-3">
                                             <div className="w-1.5 h-8 bg-insan-blue/40 rounded-full"></div>
                                             <div>
                                                 <p className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{h.name}</p>
                                                 <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Du {new Date(h.startDate).toLocaleDateString()}</p>
                                             </div>
                                         </div>
                                         <Badge color="blue" className="text-[8px] bg-blue-50 dark:bg-blue-900/30">VACANCES</Badge>
                                     </div>
                                 )) : (
                                     <p className="text-[10px] text-slate-400 italic font-bold uppercase tracking-widest text-center py-4">Prochaines vacances bientôt listées</p>
                                 )}
                             </div>
                         </Card>

                         <QuickActions />

                         {/* Next Course & Weekly Summary */}
                         <Card className="p-6 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                             <div className="flex items-center justify-between mb-4">
                                 <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                     <Clock size={18} className="text-insan-blue" /> 
                                     Prochain Cours
                                 </h3>
                                 <Badge color="blue">AUTO-POINTAGE</Badge>
                             </div>
                            {courses.filter(c => c.id === user.classId).slice(0,1).map(c => (
                                <div key={c.id} className="p-4 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight mb-1">{c.name}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-2 mb-1"><Clock size={12}/> {c.schedule}</p>
                                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={12}/> Salle {c.room}</p>
                                         <Badge color="green">PRÈS DU HUB</Badge>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="mt-6 space-y-3 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><History size={14}/> À venir cette semaine</p>
                                 {courses.filter(c => c.id === user.classId).length > 1 ? courses.filter(c => c.id === user.classId).slice(1, 4).map(c => (
                                     <div key={c.id} className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 group hover:border-insan-blue/20 transition-all">
                                         <div className="flex items-center gap-3">
                                             <div className="w-1 h-4 bg-slate-200 dark:bg-slate-700 rounded-full group-hover:bg-insan-blue transition-colors"></div>
                                             <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase truncate max-w-[120px]">{c.name}</span>
                                         </div>
                                         <span className="text-[9px] font-black text-slate-400 uppercase">{c.schedule.split(' ')[0]}</span>
                                     </div>
                                 )) : (
                                     <p className="text-[10px] text-slate-400 italic font-bold uppercase tracking-widest text-center py-4 bg-white/50 dark:bg-slate-800/20 rounded-2xl">Aucun autre cours programmé.</p>
                                 )}
                             </div>
                        </Card>

                         <AttendanceTrend />

                         <Card className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800">
                             <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2 mb-6">
                                 <BookOpen size={20} className="text-insan-blue" /> Ressources Utiles
                             </h4>
                             <div className="space-y-3">
                                 <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-insan-blue/40 transition-all group">
                                     <div className="flex items-center gap-3">
                                         <FileIcon size={18} className="text-slate-400 group-hover:text-insan-blue" />
                                         <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Règlement Intérieur</span>
                                     </div>
                                     <Download size={14} className="text-slate-300 group-hover:text-insan-blue" />
                                 </button>
                                 <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-insan-blue/40 transition-all group">
                                     <div className="flex items-center gap-3">
                                         <Calendar size={18} className="text-slate-400 group-hover:text-insan-blue" />
                                         <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Calendrier 2026/27</span>
                                     </div>
                                     <Download size={14} className="text-slate-300 group-hover:text-insan-blue" />
                                 </button>
                             </div>
                         </Card>
                    </div>
                </div>
            )}

            {/* --- TAB: ATTENDANCE --- */}
            {activeTab === 'attendance' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <ClockIn user={user} onClockIn={onClockIn} settings={settings} todayRecord={todayRecord} />
                            <AttendanceTrend />
                        </div>
                        <div className="flex flex-col gap-6">
                            <Card className="p-8 h-full bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-tight"><AlertCircle size={20} className="text-orange-500"/> Absences Signalées</h3>
                                    <Button size="sm" variant="secondary" onClick={() => setIsAbsenceModalOpen(true)} className="rounded-xl font-black text-[10px] uppercase tracking-widest px-4">Signaler</Button>
                                </div>
                                <div className="space-y-4">
                                    {myAbsenceRequests.map(req => (
                                        <div key={req.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:scale-[1.01]">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-slate-400 dark:text-slate-600"><Calendar size={20}/></div>
                                                <div>
                                                    <p className="font-black text-slate-800 dark:text-slate-200 text-xs uppercase tracking-tight">Du {req.startDate} au {req.endDate}</p>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-1">{req.reason}</p>
                                                </div>
                                            </div>
                                            <Badge color={req.status === 'APPROVED' ? 'green' : req.status === 'REJECTED' ? 'red' : 'orange'}>
                                                {req.status === 'APPROVED' ? 'Validé' : req.status === 'REJECTED' ? 'Refusé' : 'En attente'}
                                            </Badge>
                                        </div>
                                    ))}
                                    {myAbsenceRequests.length === 0 && (
                                        <div className="py-20 text-center flex flex-col items-center">
                                            <CheckCircle size={40} className="text-green-500/20 mb-3" />
                                            <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest italic">Aucun signalement</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>

                    <Card className="p-8 rounded-[3rem]">
                        <div className="flex justify-between items-center mb-8">
                             <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-3 uppercase tracking-tight"><History size={24} className="text-insan-blue"/> Historique de Pointage</h3>
                             <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-insan-blue transition-colors"><Download size={18}/></button>
                        </div>
                        <div className="overflow-x-auto rounded-[2rem] border-2 border-slate-50 dark:border-slate-800">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-[0.2em]">
                                    <tr>
                                        <th className="p-6">Date académique</th>
                                        <th className="p-6">Matière / Session</th>
                                        <th className="p-6">Entrée</th>
                                        <th className="p-6">Sortie</th>
                                        <th className="p-6 text-center">Décompte Statut</th>
                                        <th className="p-6 text-right">Justificatif</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {myHistory.map(record => {
                                        const courseName = courses.find(c => c.id === record.courseId)?.name || record.courseId;
                                        return (
                                            <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-6 font-black text-slate-800 dark:text-slate-200">{record.date}</td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-insan-blue"></div>
                                                        <span className="font-bold text-slate-600 dark:text-slate-300">{courseName}</span>
                                                    </div>
                                                </td>
                                                <td className="p-6 font-mono text-slate-500 dark:text-slate-400">{record.entryTimestamp || '--:--'}</td>
                                                <td className="p-6 font-mono text-slate-500 dark:text-slate-400">{record.exitTimestamp || '--:--'}</td>
                                                <td className="p-6 text-center">
                                                    <StatusBadge status={record.status} />
                                                </td>
                                                <td className="p-6 text-right">
                                                    {(record.status === 'ABSENT' || record.status === 'LATE') && !record.justification ? (
                                                        <button onClick={() => handleOpenJustify(record)} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-insan-blue shadow-sm hover:bg-slate-50 transition-all">Justifier</button>
                                                    ) : record.justification ? (
                                                        <div className="flex items-center justify-end gap-2 text-green-600 font-black text-[10px] uppercase">
                                                            <Check size={14}/> Transmis
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300 dark:text-slate-700 font-bold">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* --- TAB: HOMEWORK --- */}
            {activeTab === 'homework' && (
                <div className="animate-fade-in">
                    <Card className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"><BookOpen size={20}/></div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Cahier de Textes</h3>
                        </div>
                        <div className="space-y-4">
                            {myHomework.map(h => (
                                <div key={h.id} className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-insan-blue/40 dark:hover:border-blue-500/40 shadow-sm transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <Badge color="blue">{courses.find(c => c.id === h.courseId)?.name || 'Cours'}</Badge>
                                        {h.dueDate && (
                                            <span className="text-xs font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-100 dark:border-red-900/30">Pour le {h.dueDate}</span>
                                        )}
                                    </div>
                                    <h5 className="font-bold text-slate-800 dark:text-white text-lg mb-2">{h.title}</h5>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed">{h.description}</p>
                                    
                                    {h.attachmentUrl && (
                                        <div className="mb-4">
                                            {h.attachmentType === 'image' ? (
                                                <img src={h.attachmentUrl} className="w-full h-40 object-cover rounded-xl border border-slate-100 dark:border-slate-700" alt="Attachment" referrerPolicy="no-referrer" />
                                            ) : (
                                                <button 
                                                    onClick={() => onViewPdf?.(h.attachmentUrl!, h.title)}
                                                    className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    <FileIcon size={20} className="text-insan-blue" />
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 text-left">Consulter le document PDF</span>
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 pt-4 border-t border-slate-50 dark:border-slate-700">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400">{h.assignedBy.charAt(0)}</div>
                                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Donné par {h.assignedBy}</span>
                                    </div>
                                </div>
                            ))}
                            {myHomework.length === 0 && <p className="text-slate-400 dark:text-slate-500 text-sm italic text-center py-10">Aucun devoir à faire pour le moment.</p>}
                        </div>
                    </Card>
                </div>
            )}

            {/* --- TAB: ADMIN / FOLDER --- */}
            {activeTab === 'folder' && (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                     <div className="lg:col-span-2 space-y-8">
                        {/* Dossier Personnel Identité */}
                        <Card className="p-8 rounded-[3rem] border-none shadow-xl bg-white dark:bg-slate-900">
                             <div className="flex items-center gap-4 mb-8">
                                 <div className="p-4 bg-insan-blue/5 dark:bg-blue-900/20 rounded-[2rem] text-insan-blue">
                                     <UserIcon size={32}/>
                                 </div>
                                 <div className="flex-1">
                                     <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Informations Personnelles</h3>
                                     <div className="flex gap-2 mt-1">
                                         <Badge color="blue">VÉRIFIÉ PAR L'ADMIN</Badge>
                                         <Badge color="gray">ID: {user.id.toUpperCase()}</Badge>
                                     </div>
                                 </div>
                                 <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="rounded-xl flex items-center gap-2"
                                    onClick={() => alert("Pour modifier vos informations, veuillez contacter l'administration via le chat.")}
                                 >
                                     <Info size={14}/> Modifier
                                 </Button>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                 <div className="space-y-4">
                                     <div className="group">
                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nom Complet</p>
                                         <p className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">{user.name}</p>
                                     </div>
                                     <div className="group">
                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email de contact</p>
                                         <p className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">{user.email}</p>
                                     </div>
                                     <div className="group">
                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Téléphone</p>
                                         <p className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">{user.phone || '06 -- -- -- --'}</p>
                                     </div>
                                 </div>
                                 <div className="space-y-4">
                                     <div className="group">
                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Adresse de résidence</p>
                                         <p className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">{myDossier?.address}, {myDossier?.zipCode} {myDossier?.city}</p>
                                     </div>
                                     <div className="group">
                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Responsables Légaux</p>
                                         <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                                             {myDossier?.guardians.map((g, i) => (
                                                 <div key={i} className="flex justify-between items-center text-xs">
                                                     <span className="font-bold text-slate-700 dark:text-slate-300">{g.firstName} {g.lastName}</span>
                                                     <span className="text-slate-400 font-medium">{g.phone}</span>
                                                 </div>
                                             )) || <p className="text-xs text-slate-400 italic">Aucun responsable listé</p>}
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        </Card>

                        {/* PENDING FORMS SECTION */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-insan-blue dark:text-blue-400"><ClipboardCheck size={24}/></div>
                                    <div>
                                        <h3 className="font-black text-xl text-slate-800 dark:text-white uppercase tracking-tight">Documents Requis</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Actions administratives en attente</p>
                                    </div>
                                </div>
                                {pendingForms.length > 0 && <Badge color="orange" className="px-4 py-2 text-xs">{pendingForms.length} À TRAITER</Badge>}
                            </div>
                            
                            {pendingForms.length === 0 ? (
                                <Card className="p-16 text-center bg-slate-50/50 dark:bg-slate-800/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                                    <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
                                        <CheckCircle size={48} className="text-green-500 opacity-20" />
                                    </div>
                                    <h4 className="text-lg font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-2">Dossier Complet</h4>
                                    <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">Vous êtes parfaitement en règle avec l'administration de l'Institut Insan.</p>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {pendingForms.map(req => {
                                        const template = formTemplates.find(t => t.id === req.templateId);
                                        return (
                                            <Card key={req.id} className="p-6 border-transparent hover:border-insan-blue/20 bg-white dark:bg-slate-900 group shadow-sm hover:shadow-xl transition-all rounded-[2.5rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:bg-insan-blue group-hover:text-white transition-colors">
                                                        <FileText size={24}/>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-lg">{template?.title || 'Formulaire'}</h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{template?.description}</p>
                                                        <div className="flex items-center gap-4 mt-3">
                                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full uppercase">
                                                                <Clock size={10}/> Obligatoire
                                                            </div>
                                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Reçu le {new Date(req.requestedAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button 
                                                    onClick={() => setSelectedRequestForFill(req)}
                                                    className="w-full md:w-auto bg-insan-blue text-white py-4 rounded-2xl font-black uppercase tracking-widest px-8 shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                                                >
                                                    Compléter <ArrowRight size={18}/>
                                                </Button>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}

                            {/* COMPLETED FORMS SECTION (HISTORY) */}
                            {myForms.filter(r => r.status === 'COMPLETED').length > 0 && (
                                <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between mb-8">
                                        <h4 className="font-black text-slate-400 dark:text-slate-600 flex items-center gap-3 text-xs uppercase tracking-[0.2em]"><History size={20}/> Archives Numériques</h4>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{myForms.filter(r => r.status === 'COMPLETED').length} Documents</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {myForms.filter(r => r.status === 'COMPLETED').map(req => {
                                            const template = formTemplates.find(t => t.id === req.templateId);
                                            return (
                                                <Card 
                                                    key={req.id} 
                                                    onClick={() => setSelectedRequestForView(req)}
                                                    className="p-5 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all rounded-2xl"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-lg group-hover:scale-110 transition-transform">
                                                            <ClipboardCheck size={20}/>
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-xs text-slate-800 dark:text-slate-200 group-hover:text-insan-blue transition-colors uppercase tracking-tight">{template?.title}</p>
                                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Validé le {new Date(req.submittedAt!).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-slate-300 dark:text-slate-700 p-2 rounded-xl group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors group-hover:text-insan-blue">
                                                        <Eye size={18}/>
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* DIGITAL WALLET / DOCUMENTS */}
                        <Card className="p-8 rounded-[2.5rem] bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-slate-100 dark:border-slate-800">
                             <div className="flex items-center gap-3 mb-6">
                                 <div className="p-3 bg-insan-blue text-white rounded-2xl"><ShieldCheck size={20}/></div>
                                 <h4 className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-tight leading-none">Confidentialité</h4>
                             </div>
                             <div className="space-y-4">
                                 <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group cursor-pointer hover:border-insan-blue/40 transition-all">
                                     <div className="flex items-center gap-3">
                                         <ImageIcon className="text-slate-400" size={18} />
                                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Carte d'Identité</span>
                                     </div>
                                     <Badge color="green">VÉRIFIÉ</Badge>
                                 </div>
                                 <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group cursor-pointer hover:border-insan-blue/40 transition-all">
                                     <div className="flex items-center gap-3">
                                         <FileText className="text-slate-400" size={18} />
                                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Attestation Inscription</span>
                                     </div>
                                     <Download size={14} className="text-insan-blue group-hover:scale-110 transition-transform" />
                                 </div>
                                 <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 py-6 group hover:bg-white dark:hover:bg-slate-800 transition-all">
                                     <Upload className="text-slate-300 group-hover:text-insan-blue transition-colors" size={24} />
                                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Ajouter un justificatif</span>
                                 </div>
                             </div>

                             <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ClipboardCheck size={14}/> Certificats & Attestations</h4>
                                 <div className="grid grid-cols-1 gap-3">
                                     <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-emerald-500/20 shadow-sm group hover:border-emerald-500/40 transition-all cursor-pointer">
                                         <div className="flex items-center gap-3">
                                             <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                 <FileText size={16}/>
                                             </div>
                                             <div>
                                                 <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase transition-colors group-hover:text-emerald-500">Certificat de Scolarité</p>
                                                 <p className="text-[8px] text-slate-400 font-bold uppercase">Valable pour 2026/27</p>
                                             </div>
                                         </div>
                                         <button className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                                             <Download size={16}/>
                                         </button>
                                     </div>
                                 </div>
                             </div>
                        </Card>

                        <Card className="p-8">
                             <h4 className="font-black text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-widest opacity-50"><MapPin size={16}/> Localisation</h4>
                             <div className="space-y-4 text-xs">
                                 <div>
                                     <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Régime Scolaire</label>
                                     <p className="font-bold text-slate-700 dark:text-slate-200">Demi-pensionnaire (Repas Inclus)</p>
                                 </div>
                                 <div>
                                     <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Zone de transport</label>
                                     <p className="font-bold text-slate-700 dark:text-slate-200">Zone A - Carte Imagine R</p>
                                 </div>
                             </div>
                        </Card>
                     </div>
                 </div>
            )}

            </motion.div>
            </AnimatePresence>

            {/* Justification Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md animate-fade-in bg-white dark:bg-slate-900">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Justifier une absence</h3>
                            <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30 text-sm text-orange-800 dark:text-orange-300 mb-4">
                                <p><strong>Date :</strong> {selectedRecord.date}</p>
                                <p><strong>Statut :</strong> {selectedRecord.status}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Motif / Commentaire</label>
                                <textarea 
                                    className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-insan-blue/20 outline-none min-h-[100px] bg-white dark:bg-slate-800 dark:text-white"
                                    placeholder="Ex: Maladie, problème de transport..."
                                    value={justificationText || ''}
                                    onChange={e => setJustificationText(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                                <Upload className="mx-auto text-slate-400 dark:text-slate-500 mb-2" size={24} />
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Joindre un document (Certificat...)</p>
                            </div>
                            <Button onClick={handleSubmitJustification} className="w-full">Envoyer le justificatif</Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Absence Modal */}
            {isAbsenceModalOpen && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                     <Card className="w-full max-w-md animate-fade-in bg-white dark:bg-slate-900">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Signaler une absence future</h3>
                            <button onClick={() => setIsAbsenceModalOpen(false)} className="hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-full transition-colors text-slate-500 dark:text-slate-400"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmitAbsence} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Début</label><input required type="date" value={absenceStart || ''} onChange={e => setAbsenceStart(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none bg-white dark:bg-slate-800 dark:text-white" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Fin</label><input required type="date" value={absenceEnd || ''} onChange={e => setAbsenceEnd(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none bg-white dark:bg-slate-800 dark:text-white" /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Motif</label>
                                <textarea value={absenceReason || ''} onChange={e => setAbsenceReason(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none min-h-[80px] bg-white dark:bg-slate-800 dark:text-white" placeholder="Raison de l'absence..."></textarea>
                            </div>
                            <Button type="submit" className="w-full">Envoyer le signalement</Button>
                        </form>
                     </Card>
                 </div>
            )}

            {/* View Result Modal (Student Side) */}
            {selectedRequestForView && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4 animate-fade-in" onClick={() => setSelectedRequestForView(null)}>
                    <Card className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-green-500 text-white rounded-2xl">
                                    <ClipboardCheck size={28}/>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Document Consulté</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Soumis le {new Date(selectedRequestForView.submittedAt!).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRequestForView(null)} className="p-2 text-slate-300 hover:text-slate-500 transition-colors"><X size={24}/></button>
                        </div>

                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-6">
                                {(() => {
                                    const tpl = formTemplates.find(t => t.id === selectedRequestForView.templateId);
                                    if (!tpl) return null;
                                    return tpl.fields.map(field => (
                                        <div key={field.id} className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">
                                                {field.label}
                                            </label>
                                            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200">
                                                {field.type === FormFieldType.CHECKBOX ? (
                                                    selectedRequestForView.submittedData?.[field.id] ? 'Validé' : 'Non coché'
                                                ) : (
                                                    selectedRequestForView.submittedData?.[field.id] || '-'
                                                )}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            <Button variant="secondary" className="px-6 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2">
                                <Download size={16}/> Télécharger PDF
                            </Button>
                            <Button onClick={() => setSelectedRequestForView(null)} className="px-8 rounded-xl font-black uppercase tracking-widest bg-insan-blue shadow-lg shadow-blue-500/20">Fermer</Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Form Filler Modal */}
            {selectedRequestForFill && (
                <StudentFormFiller 
                    request={selectedRequestForFill}
                    template={formTemplates.find(t => t.id === selectedRequestForFill.templateId)!}
                    onClose={() => setSelectedRequestForFill(null)}
                    onSubmit={(id, data) => {
                        onUpdateFormStatus?.(id, 'COMPLETED', data);
                        // The StudentFormFiller handles its own "Success" state, then calls onClose
                    }}
                />
            )}
            {/* Mobile Bottom Navigation Bar (Hidden on Desktop) */}
            <div className="md:hidden fixed bottom-6 left-6 right-6 z-[200]">
                <nav className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] flex justify-between items-center px-2">
                    {[
                        { id: 'synthesis', icon: UserIcon, label: 'Accueil' },
                        { id: 'attendance', icon: Activity, label: 'Suivi' },
                        { id: 'homework', icon: BookOpen, label: 'Cours' },
                        { id: 'folder', icon: FileText, label: 'Dossier' }
                    ].map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;
                        
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex flex-col items-center gap-1 p-3 transition-colors relative ${isActive ? 'text-insan-blue' : 'text-slate-500'}`}
                            >
                                <Icon size={20} className={isActive ? 'scale-110' : 'scale-100'} />
                                <span className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-40'}`}>{tab.label}</span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="mobileActiveTab" 
                                        className="w-1 h-1 bg-insan-blue rounded-full absolute -bottom-1"
                                    />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default StudentDashboard;