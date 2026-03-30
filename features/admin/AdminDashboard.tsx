
import React, { useState, useMemo } from 'react';
import { User, NewsItem, Course, AttendanceRecord, InstituteSettings, UserRole, WorkSchedule, Pole, RegistrationDossier } from '../../types';
import { Card, Button, Badge, PageHeader } from '../../components/ui/DesignSystem';
import { Users, Check, Euro, Activity, UserCheck, BarChart3, PieChart as PieChartIcon, MessageSquare, Image as ImageIcon, ChevronRight, Settings, FileText, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getTranslation } from '../../services/i18n';

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
    user, news, courses, attendance, users, settings, poles, dossiers, onAddNews, onNavigate 
}) => {
    const lang = settings.language || 'fr';
    const currency = settings.currency || '€';
    const t = (key: string) => getTranslation(key, lang);

    const financialStats = useMemo(() => {
        const stats = {
            totalCA: 0,
            totalPaid: 0,
            caByPole: {} as Record<string, number>,
            totalInscriptions: dossiers.length
        };

        dossiers.forEach(d => {
            const dossierTotal = d.enrollments.reduce((acc, e) => acc + (e.isVolunteerTeacher ? 0 : e.basePrice + (e.formulaSurcharge || 0)), 0) + 
                               d.dossierFees + (d.montessoriFees || 0) - (d.autoDiscount || 0) - (d.manualDiscount || 0);
            const paid = d.payments.reduce((acc, p) => acc + p.amount, 0);
            stats.totalCA += dossierTotal;
            stats.totalPaid += paid;

            d.enrollments.forEach(e => {
                const course = courses.find(c => c.id === e.courseId);
                if (course) {
                    const price = e.isVolunteerTeacher ? 0 : e.basePrice + (e.formulaSurcharge || 0);
                    stats.caByPole[course.pole] = (stats.caByPole[course.pole] || 0) + price;
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

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <PageHeader 
                title="Pilotage" 
                subtitle="Tableau de bord stratégique de l'Institut." 
                action={
                    <Button onClick={() => onNavigate('stats')} variant="secondary" icon={<BarChart3 size={18}/>}>Analyses détaillées</Button>
                }
            />

            {/* QUICK KPIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Dossiers</p>
                    <Card className="p-8 border-0 shadow-lg hover:translate-y-[-4px] transition-all cursor-pointer group" onClick={() => onNavigate('inscriptions')}>
                        <div className="flex justify-between items-center">
                            <p className="text-4xl font-black text-slate-800 dark:text-white group-hover:text-insan-blue transition-colors">{financialStats.totalInscriptions}</p>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-insan-blue dark:text-blue-400 rounded-2xl"><UserCheck size={24}/></div>
                        </div>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-4 uppercase">Familles actives</p>
                    </Card>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Chiffre d'Affaires</p>
                    <Card className="p-8 border-0 shadow-lg">
                        <div className="flex justify-between items-center">
                            <p className="text-4xl font-black text-slate-800 dark:text-white">{financialStats.totalCA.toLocaleString()}<span className="text-xl ml-1 opacity-20">{currency}</span></p>
                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-insan-orange dark:text-orange-400 rounded-2xl"><Euro size={24}/></div>
                        </div>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-4 uppercase">Volume total estimé</p>
                    </Card>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Trésorerie</p>
                    <Card className="p-8 border-0 shadow-lg">
                        <div className="flex justify-between items-center">
                            <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{financialStats.totalPaid.toLocaleString()}<span className="text-xl ml-1 opacity-20">{currency}</span></p>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl"><Check size={24}/></div>
                        </div>
                        <p className="text-xs font-bold text-emerald-700/50 dark:text-emerald-500/50 mt-4 uppercase">Montant encaissé</p>
                    </Card>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Taux d'Assiduité</p>
                    <Card className="p-8 border-0 shadow-lg">
                        <div className="flex justify-between items-center">
                            <p className="text-4xl font-black text-slate-800 dark:text-white">84%</p>
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl"><Activity size={24}/></div>
                        </div>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-4 uppercase">Moyenne établissement</p>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Analytics Section */}
                <div className="lg:col-span-2 space-y-10">
                    <Card className="p-10 shadow-xl border-0">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Répartition par Pôle</h3>
                                <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">Volume de CA par département d'enseignement.</p>
                            </div>
                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300"><BarChart3 size={24}/></div>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={poleChartData} layout="vertical" margin={{ left: 0 }}>
                                    <CartesianGrid strokeDasharray="5 5" horizontal={false} stroke="#e2e8f0" opacity={0.3} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} width={100} />
                                    <Tooltip 
                                        cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}
                                    />
                                    <Bar dataKey="value" name="C.A" radius={[0, 10, 10, 0]} barSize={24}>
                                        {poleChartData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#262262' : '#f7941d'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Announcement Form Redirection */}
                    <Card className="p-10 shadow-xl border-0 bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center text-insan-blue dark:text-blue-400 shadow-xl">
                                <FileText size={32}/>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Espace Rédaction</h3>
                                <p className="text-slate-500 font-medium max-w-sm">Publiez des articles de blog, des annonces urgentes ou des photos d'événements.</p>
                            </div>
                        </div>
                        <Button className="px-10 py-5 bg-insan-blue shadow-blue-500/20" onClick={() => onNavigate('manage-blog')} icon={<Globe size={18}/>}>Gérer le Blog</Button>
                    </Card>
                </div>

                {/* Sidebar Info Section */}
                <div className="space-y-10">
                    <Card className="p-0 border-0 shadow-2xl bg-insan-blue text-white overflow-hidden group">
                        <div className="p-8 pb-4">
                            <h3 className="text-xl font-black flex items-center gap-3"><Activity size={24} className="text-insan-orange"/> Inscriptions</h3>
                            <p className="text-xs text-blue-200/60 uppercase font-black mt-2 tracking-widest">Activités Récentes</p>
                        </div>
                        <div className="p-8 pt-4 space-y-8">
                            {dossiers.slice(0, 4).map(d => (
                                <div key={d.id} className="flex items-center gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0 hover:translate-x-2 transition-transform cursor-pointer" onClick={() => onNavigate('inscriptions')}>
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-insan-orange text-lg">
                                        {d.lastName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black truncate">{d.firstName} {d.lastName}</p>
                                        <p className="text-[10px] text-blue-200/40 font-bold uppercase tracking-tighter">le {new Date(d.createdAt || '').toLocaleDateString()}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-white/20"/>
                                </div>
                            ))}
                            {dossiers.length === 0 && <p className="text-center py-10 text-white/40 italic text-xs">Aucune donnée.</p>}
                        </div>
                        <div className="p-6 bg-black/20 text-center">
                             <button onClick={() => onNavigate('inscriptions')} className="text-[10px] font-black text-insan-orange hover:underline tracking-widest uppercase">Gérer tous les dossiers</button>
                        </div>
                    </Card>

                    <Card className="p-8 bg-slate-50 dark:bg-slate-800/50 border-0 shadow-inner">
                        <h4 className="font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3 uppercase text-xs tracking-widest">
                            <Settings size={18} className="text-slate-400"/> Pilotage Rapide
                        </h4>
                        <div className="space-y-3">
                            {[
                                { id: 'tarification', label: 'Tarifs & Règles', icon: Euro },
                                { id: 'manage-courses', label: 'Catalogue Cours', icon: BarChart3 },
                                { id: 'employees', label: 'Ressources Humaines', icon: Users }
                            ].map(link => (
                                <button key={link.id} onClick={() => onNavigate(link.id)} className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-insan-blue transition-all group shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-insan-blue transition-colors"><link.icon size={18}/></div>
                                        <span className="text-sm font-black text-slate-600 dark:text-slate-300 group-hover:text-insan-blue transition-colors">{link.label}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-all"/>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
