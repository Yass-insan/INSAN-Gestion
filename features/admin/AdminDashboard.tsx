import React, { useState, useMemo } from 'react';
import { User, NewsItem, Course, AttendanceRecord, InstituteSettings, UserRole, WorkSchedule, Pole, RegistrationDossier } from '../../types';
import { Card, Button, Badge, PageHeader } from '../../components/ui/DesignSystem';
import Stats from '../../components/Stats';
import { Users, Check, Briefcase, BookOpen, Activity, Euro, MessageSquare, ChevronRight, TrendingUp, Clock, Image as ImageIcon, AlertCircle, FileText, UserCheck, BarChart3, PieChart as PieChartIcon, Settings } from 'lucide-react';
import { getStatusColor } from '../../services/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface AdminDashboardProps {
    user: User;
    news: NewsItem[];
    courses: Course[];
    attendance: AttendanceRecord[];
    users: User[];
    settings: InstituteSettings;
    schedules: WorkSchedule[];
    poles: Pole[];
    dossiers: RegistrationDossier[];
    onAddNews: (news: NewsItem) => void;
    onNavigate: (view: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    user, news, courses, attendance, users, settings, schedules, poles, dossiers, onAddNews, onNavigate 
}) => {
    const [newNewsTitle, setNewNewsTitle] = useState('');
    const [newNewsContent, setNewNewsContent] = useState('');
    const [newNewsMediaUrl, setNewNewsMediaUrl] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);

    // --- FINANCIAL ANALYTICS ---

    const financialStats = useMemo(() => {
        const stats = {
            totalCA: 0,
            totalPaid: 0,
            caByPole: {} as Record<string, number>,
            caByCourse: [] as { name: string, value: number }[],
            totalInscriptions: dossiers.length
        };

        dossiers.forEach(d => {
            const dossierTotal = d.enrollments.reduce((acc, e) => acc + (e.isVolunteerTeacher ? 0 : e.basePrice + e.formulaSurcharge), 0) + 
                               d.dossierFees + (d.montessoriFees || 0) - (d.autoDiscount || 0) - (d.manualDiscount || 0);
            const paid = d.payments.reduce((acc, p) => acc + p.amount, 0);
            
            stats.totalCA += dossierTotal;
            stats.totalPaid += paid;

            // Split CA by Pole
            d.enrollments.forEach(e => {
                const course = courses.find(c => c.id === e.courseId);
                if (course) {
                    const price = e.isVolunteerTeacher ? 0 : e.basePrice + e.formulaSurcharge;
                    stats.caByPole[course.pole] = (stats.caByPole[course.pole] || 0) + price;
                    
                    // Specific Course Entry
                    const existingCourse = stats.caByCourse.find(c => c.name === course.name);
                    if (existingCourse) existingCourse.value += price;
                    else stats.caByCourse.push({ name: course.name, value: price });
                }
            });
        });

        return stats;
    }, [dossiers, courses]);

    const poleChartData = useMemo(() => {
        return Object.entries(financialStats.caByPole).map(([id, value]) => ({
            name: poles.find(p => p.id === id)?.name || id,
            value: value as number
        })).sort((a: any, b: any) => b.value - a.value);
    }, [financialStats.caByPole, poles]);

    // --- END ANALYTICS ---

    const handlePublishNews = (e: React.FormEvent) => {
        e.preventDefault();
        onAddNews({
            id: Date.now().toString(),
            title: newNewsTitle,
            content: newNewsContent,
            date: new Date().toLocaleDateString('fr-FR'),
            author: user.name,
            mediaUrl: newNewsMediaUrl || undefined,
            mediaType: newNewsMediaUrl ? 'image' : undefined,
            isUrgent: isUrgent
        });
        setNewNewsTitle('');
        setNewNewsContent('');
        setNewNewsMediaUrl('');
        setIsUrgent(false);
    };

    const presentCount = attendance.filter(r => r.date === new Date().toISOString().split('T')[0] && (r.status === 'PRESENT' || r.status === 'LATE')).length;
    const totalStudents = users.filter(u => u.role === UserRole.STUDENT).length;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
             <PageHeader title="Pilotage de l'Institut" subtitle="Suivi en temps réel des inscriptions et de la santé financière." />

             {/* KPIs Principaux */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 border-l-4 border-insan-blue shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => onNavigate('inscriptions')}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Base de Données</p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">{financialStats.totalInscriptions}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1">Dossiers Familles</p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-insan-blue dark:text-blue-400 rounded-2xl shadow-inner"><UserCheck size={24}/></div>
                    </div>
                </Card>
                 <Card className="p-6 border-l-4 border-insan-orange shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">C.A Global</p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">{financialStats.totalCA.toLocaleString()} €</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1">Estimé sur inscriptions</p>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-insan-orange dark:text-orange-400 rounded-2xl shadow-inner"><Euro size={24}/></div>
                    </div>
                </Card>
                <Card className="p-6 border-l-4 border-green-500 shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Liquidités (Encais.)</p>
                            <p className="text-3xl font-black text-green-600 dark:text-green-400">{financialStats.totalPaid.toLocaleString()} €</p>
                            <p className="text-[10px] text-green-700 dark:text-green-500 font-bold mt-1">En caisse / banque</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl shadow-inner"><Check size={24}/></div>
                    </div>
                </Card>
                 <Card className="p-6 border-l-4 border-purple-500 shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Assiduité</p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">{Math.round((presentCount / (totalStudents || 1)) * 100)}%</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1">Présence ce jour</p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl shadow-inner"><Activity size={24}/></div>
                    </div>
                </Card>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-8">
                    
                    {/* CHART CA PAR PÔLE */}
                    <Card className="p-8 shadow-xl border-0">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-insan-blue dark:text-blue-400"><BarChart3 size={20}/></div>
                                    Chiffre d'Affaires par Pôle
                                </h3>
                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Répartition des revenus bruts par département.</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={poleChartData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.1} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} width={100} />
                                    <Tooltip 
                                        cursor={{ fill: '#f8fafc', opacity: 0.1 }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                                    />
                                    <Bar dataKey="value" name="Chiffre d'affaires (€)" radius={[0, 8, 8, 0]}>
                                        {poleChartData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#262262' : '#f7941d'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="p-8 shadow-xl border-0 bg-slate-900 text-white overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-insan-blue opacity-20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                         <div className="relative z-10 flex flex-col md:flex-row justify-between gap-12">
                             <div className="flex-1">
                                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                    <PieChartIcon className="text-insan-orange"/> CA par Cours (Top 5)
                                </h3>
                                <div className="space-y-4">
                                    {financialStats.caByCourse.sort((a,b) => b.value - a.value).slice(0, 5).map((course, idx) => (
                                        <div key={idx} className="flex justify-between items-center group">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${idx % 2 === 0 ? 'bg-insan-orange' : 'bg-blue-400'}`}></div>
                                                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{course.name}</span>
                                            </div>
                                            <span className="font-mono font-black">{course.value.toLocaleString()} €</span>
                                        </div>
                                    ))}
                                </div>
                             </div>
                             <div className="w-full md:w-48 flex flex-col justify-center items-center">
                                 <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Solde Global Restant</p>
                                 <p className="text-3xl font-black text-red-400">{(financialStats.totalCA - financialStats.totalPaid).toLocaleString()} €</p>
                                 <div className="w-full h-2 bg-white/10 rounded-full mt-4 overflow-hidden">
                                     <div className="h-full bg-green-400 rounded-full" style={{ width: `${Math.round((financialStats.totalPaid / (financialStats.totalCA || 1)) * 100)}%` }}></div>
                                 </div>
                                 <p className="text-[10px] font-bold text-slate-400 mt-2">{Math.round((financialStats.totalPaid / (financialStats.totalCA || 1)) * 100)}% encaissés</p>
                             </div>
                         </div>
                    </Card>

                    <Card className="p-8 shadow-xl border-0">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400"><MessageSquare size={20}/></div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Publier une annonce portail</h3>
                        </div>
                        <form onSubmit={handlePublishNews} className="space-y-6">
                            <input 
                                placeholder="Titre accrocheur..." 
                                className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-insan-blue/20 outline-none font-bold text-slate-800 dark:text-white transition-colors"
                                value={newNewsTitle}
                                onChange={e => setNewNewsTitle(e.target.value)}
                                required
                            />
                            <textarea 
                                placeholder="Contenu du message..." 
                                className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-insan-blue/20 outline-none min-h-[120px] font-medium text-slate-800 dark:text-white transition-colors"
                                value={newNewsContent}
                                onChange={e => setNewNewsContent(e.target.value)}
                                required
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                    <input 
                                        type="url"
                                        placeholder="URL image (optionnel)" 
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-insan-blue/20 outline-none text-sm font-medium text-slate-800 dark:text-white transition-colors"
                                        value={newNewsMediaUrl}
                                        onChange={e => setNewNewsMediaUrl(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-3 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => setIsUrgent(!isUrgent)}>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isUrgent ? 'bg-red-500 border-red-500 text-white' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'}`}>
                                        {isUrgent && <Check size={12} strokeWidth={3}/>}
                                    </div>
                                    <span className={`text-xs font-black uppercase tracking-widest ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>Urgente / Alerte</span>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button type="submit" className="px-10 py-4 shadow-lg shadow-blue-900/10">Publier</Button>
                            </div>
                        </form>
                    </Card>
                 </div>
                 
                 <div className="space-y-8">
                    <Card className="p-0 overflow-hidden shadow-xl border-0">
                        <div className="p-6 bg-insan-blue text-white">
                            <h3 className="font-bold text-lg flex items-center gap-2"><Activity size={20} className="text-insan-orange"/> Inscriptions Récentes</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            {dossiers.slice(0, 6).map(d => {
                                const total = d.enrollments.reduce((acc, e) => acc + (e.isVolunteerTeacher ? 0 : e.basePrice + e.formulaSurcharge), 0) + d.dossierFees + d.montessoriFees - d.autoDiscount - (d.manualDiscount || 0);
                                const paid = d.payments.reduce((acc, p) => acc + p.amount, 0);
                                return (
                                    <div key={d.id} className="flex items-center gap-4 pb-4 border-b border-slate-50 dark:border-slate-800 last:border-0 last:pb-0 group cursor-pointer" onClick={() => onNavigate('inscriptions')}>
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center group-hover:bg-insan-blue group-hover:text-white transition-colors">
                                            <Users size={18}/>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{d.firstName} {d.lastName}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">ID: {d.id.substring(d.id.length - 6)} • {new Date(d.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-slate-800 dark:text-white">{total.toFixed(0)}€</p>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${total <= paid ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                                                {total <= paid ? 'SOLDÉ' : 'RESTE'}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                            {dossiers.length === 0 && <p className="text-center py-10 text-slate-400 dark:text-slate-500 italic text-sm">Aucun dossier d'inscription enregistré.</p>}
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 text-center">
                            <button onClick={() => onNavigate('inscriptions')} className="text-[10px] font-black text-insan-blue dark:text-blue-400 hover:underline tracking-[0.2em] uppercase">Voir toutes les inscriptions</button>
                        </div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 shadow-lg">
                        <h4 className="font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2 uppercase text-xs tracking-[0.2em]"><Settings size={16}/> Accès Rapides</h4>
                        <div className="space-y-3">
                            <button onClick={() => onNavigate('tarification')} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-insan-blue dark:hover:border-blue-500 transition-all group">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-insan-blue dark:group-hover:text-blue-400">Paramètres Tarifs</span>
                                <Euro size={16} className="text-slate-300 dark:text-slate-500 group-hover:text-insan-blue dark:group-hover:text-blue-400"/>
                            </button>
                            <button onClick={() => onNavigate('manage-courses')} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-insan-blue dark:hover:border-blue-500 transition-all group">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-insan-blue dark:group-hover:text-blue-400">Salles & Cours</span>
                                <BookOpen size={16} className="text-slate-300 dark:text-slate-500 group-hover:text-insan-blue dark:group-hover:text-blue-400"/>
                            </button>
                            <button onClick={() => onNavigate('employees')} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-insan-blue dark:hover:border-blue-500 transition-all group">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-insan-blue dark:group-hover:text-blue-400">Ressources Humaines</span>
                                <Briefcase size={16} className="text-slate-300 dark:text-slate-500 group-hover:text-insan-blue dark:group-hover:text-blue-400"/>
                            </button>
                        </div>
                    </Card>
                 </div>
             </div>
        </div>
    );
};

export default AdminDashboard;