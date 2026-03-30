import React, { useState, useMemo, useEffect } from 'react';
import { Course, AttendanceRecord, User, Pole, RegistrationDossier, RegistrationStatus } from '../../types';
import { Card, Badge, Button } from '../../components/ui/DesignSystem';
import { 
    FileText, 
    Download, 
    TrendingUp, 
    Layers, 
    PieChart as PieChartIcon, 
    Filter, 
    X, 
    Activity, 
    Euro, 
    Users, 
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    CreditCard,
    Target,
    BarChart3,
    Clock,
    UserX,
    ClipboardList,
    Search,
    BookOpen,
    AlertCircle,
    Ban
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell, 
    BarChart, 
    Bar,
    Legend
} from 'recharts';
import { getTranslation } from '../../services/i18n';

interface StatisticsPageProps {
    courses: Course[];
    attendance: AttendanceRecord[];
    users: User[];
    poles: Pole[];
    dossiers: RegistrationDossier[];
    initialFilters?: { poleId: string; classId: string };
    settings?: any;
}

export const StatisticsPage: React.FC<StatisticsPageProps> = ({ courses, attendance, users, poles, dossiers, initialFilters, settings }) => {
    // --- ÉTAT DES FILTRES ---
    const [selectedPole, setSelectedPole] = useState('ALL');
    const [selectedClass, setSelectedClass] = useState('ALL');

    const lang = settings?.language || 'fr';
    const currency = settings?.currency || '€';
    const t = (key: string) => getTranslation(key, lang);

    // Sync initial filters if provided
    useEffect(() => {
        if (initialFilters) {
            setSelectedPole(initialFilters.poleId);
            setSelectedClass(initialFilters.classId);
        }
    }, [initialFilters]);

    // --- LOGIQUE DE FILTRAGE ---
    const filteredCourses = useMemo(() => {
        return courses.filter(c => selectedPole === 'ALL' || c.pole === selectedPole);
    }, [courses, selectedPole]);

    const filteredDossiers = useMemo(() => {
        return dossiers.filter(d => {
            const matchesPole = selectedPole === 'ALL' || d.enrollments.some(e => {
                const c = courses.find(course => course.id === e.courseId);
                return c?.pole === selectedPole;
            });
            const matchesClass = selectedClass === 'ALL' || d.enrollments.some(e => e.courseId === selectedClass);
            return matchesPole && matchesClass;
        });
    }, [dossiers, courses, selectedPole, selectedClass]);

    const filteredAttendance = useMemo(() => {
        return attendance.filter(r => {
            const course = courses.find(c => c.id === r.courseId);
            const matchesPole = selectedPole === 'ALL' || course?.pole === selectedPole;
            const matchesClass = selectedClass === 'ALL' || r.courseId === selectedClass;
            return matchesPole && matchesClass;
        });
    }, [attendance, courses, selectedPole, selectedClass]);

    // --- CALCULS ABSENTÉISME ---
    const attendanceStats = useMemo(() => {
        const total = filteredAttendance.length;
        const present = filteredAttendance.filter(r => r.status === 'PRESENT').length;
        const late = filteredAttendance.filter(r => r.status === 'LATE').length;
        const absent = filteredAttendance.filter(r => r.status === 'ABSENT').length;
        const justified = filteredAttendance.filter(r => r.status === 'JUSTIFIED').length;
        const rate = total > 0 ? Math.round(((present + late + justified) / total) * 100) : 100;

        return { total, present, late, absent, justified, rate };
    }, [filteredAttendance]);

    // --- CALCULS FINANCES ---
    const financeStats = useMemo(() => {
        let totalToPay = 0;
        let totalPaid = 0;
        let caPerdu = 0;
        
        let countDossiersActifs = 0;
        let countDossiersAnnules = 0;
        let countCoursAnnules = 0;

        const segmentMap: Record<string, { label: string, count: number, totalAmount: number }> = {
            '1': { label: 'Comptant (1X)', count: 0, totalAmount: 0 },
            '2': { label: 'Paiement 2X', count: 0, totalAmount: 0 },
            '3': { label: 'Paiement 3X', count: 0, totalAmount: 0 },
            '4': { label: 'Paiement 4X', count: 0, totalAmount: 0 },
            '5': { label: 'Paiement 5X', count: 0, totalAmount: 0 },
            '10': { label: 'Mensuel', count: 0, totalAmount: 0 }
        };

        filteredDossiers.forEach(d => {
            const isDossierCancelled = d.status === RegistrationStatus.CANCELLED;
            const paid = d.payments.reduce((acc, p) => acc + p.amount, 0);
            totalPaid += paid;

            let activeEnrollmentsSum = 0;
            let cancelledEnrollmentsSum = 0;

            d.enrollments.forEach(e => {
                const price = e.isVolunteerTeacher ? 0 : e.basePrice + (e.formulaSurcharge || 0);
                if (e.status === RegistrationStatus.CANCELLED || isDossierCancelled) {
                    cancelledEnrollmentsSum += price;
                    if (e.status === RegistrationStatus.CANCELLED) countCoursAnnules++;
                } else {
                    activeEnrollmentsSum += price;
                }
            });

            if (isDossierCancelled) {
                countDossiersAnnules++;
                const theoreticalTotal = cancelledEnrollmentsSum + d.dossierFees + (d.montessoriFees || 0) - (d.autoDiscount || 0) - (d.manualDiscount || 0);
                caPerdu += Math.max(0, theoreticalTotal - paid);
                countCoursAnnules += d.enrollments.length; 
            } else {
                countDossiersActifs++;
                const activeTotal = activeEnrollmentsSum + d.dossierFees + (d.montessoriFees || 0) - (d.autoDiscount || 0) - (d.manualDiscount || 0);
                totalToPay += Math.max(0, activeTotal);
                caPerdu += cancelledEnrollmentsSum;

                const n = d.installmentCount || 1;
                const key = n.toString();
                if (segmentMap[key]) {
                    segmentMap[key].count++;
                    segmentMap[key].totalAmount += Math.max(0, activeTotal);
                }
            }
        });

        const totalCourses = filteredDossiers.reduce((acc, d) => acc + d.enrollments.length, 0);
        const cancellationRate = totalCourses > 0 ? (countCoursAnnules / totalCourses) * 100 : 0;

        return {
            totalToPay,
            totalPaid,
            totalMissing: totalToPay - totalPaid,
            totalActiveDossiers: countDossiersActifs,
            totalCancelledCourses: countCoursAnnules,
            cancellationRate,
            caPerdu,
            panierMoyen: countDossiersActifs > 0 ? totalToPay / countDossiersActifs : 0,
            segmentMap
        };
    }, [filteredDossiers]);

    // --- GRAPH DATA ---
    const attendancePieData = [
        { name: t('present'), value: attendanceStats.present, color: '#10b981' },
        { name: t('late'), value: attendanceStats.late, color: '#f59e0b' },
        { name: t('absent'), value: attendanceStats.absent, color: '#ef4444' },
        { name: t('justified'), value: attendanceStats.justified, color: '#3b82f6' }
    ];

    const timelineData = useMemo(() => {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
        return months.map((m, i) => ({
            name: m,
            inscriptions: filteredDossiers.filter(d => (d.status === RegistrationStatus.ACTIVE || !d.status) && new Date(d.createdAt || '').getMonth() === i).length,
            ca: filteredDossiers.filter(d => new Date(d.createdAt || '').getMonth() === i).reduce((acc, d) => acc + (d.payments.reduce((a,p) => a+p.amount, 0)), 0)
        }));
    }, [filteredDossiers]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700 shadow-xl rounded-xl">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-xs mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">{entry.name}:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* EN-TÊTE ET FILTRES */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800">
                <div className="flex-1">
                    <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter flex items-center gap-4">
                        <BarChart3 size={36} className="text-insan-blue dark:text-blue-400"/> {t('pilotage')}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Analyse granulaire des performances académiques et financières.</p>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <div className="flex-1 lg:flex-none">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 px-2">Segmenter par Pôle</label>
                        <select 
                            value={selectedPole}
                            onChange={e => { setSelectedPole(e.target.value); setSelectedClass('ALL'); }}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-black shadow-inner outline-none focus:ring-2 focus:ring-insan-blue/20 dark:text-white"
                        >
                            <option value="ALL">Tous les pôles</option>
                            {poles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 lg:flex-none">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 px-2">Filtrer par Classe</label>
                        <select 
                            value={selectedClass}
                            onChange={e => setSelectedClass(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-black shadow-inner outline-none focus:ring-2 focus:ring-insan-blue/20 dark:text-white"
                        >
                            <option value="ALL">Toutes les classes</option>
                            {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <Button variant="secondary" onClick={() => { setSelectedPole('ALL'); setSelectedClass('ALL'); }} className="h-[46px] mt-auto">
                        <X size={16}/>
                    </Button>
                </div>
            </div>

            {/* SECTION 1: KPIS FINANCIERS & CROISSANCE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-insan-blue/5 dark:bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Euro size={12}/> {t('total_ca')} Actif</p>
                    <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">{financeStats.totalToPay.toLocaleString()} {currency}</p>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-lg flex items-center gap-1">
                            <TrendingUp size={10}/> +12% vs N-1
                        </span>
                    </div>
                </Card>

                <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Wallet size={12}/> {t('cash_flow')}</p>
                    <p className="text-4xl font-black text-green-600 dark:text-green-400 tracking-tighter">{financeStats.totalPaid.toLocaleString()} {currency}</p>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${financeStats.totalToPay > 0 ? (financeStats.totalPaid / financeStats.totalToPay * 100) : 0}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-2 text-right">{financeStats.totalToPay > 0 ? Math.round(financeStats.totalPaid / financeStats.totalToPay * 100) : 0}% Recouvré</p>
                </Card>

                <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><CreditCard size={12}/> Reste à Recouvrer</p>
                    <p className="text-4xl font-black text-red-500 dark:text-red-400 tracking-tighter">{financeStats.totalMissing.toLocaleString()} {currency}</p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2">Soit {Math.round(financeStats.totalToPay > 0 ? (financeStats.totalMissing / financeStats.totalToPay * 100) : 0)}% du CA global</p>
                </Card>

                <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Target size={12}/> Panier Moyen</p>
                    <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">{Math.round(financeStats.panierMoyen).toLocaleString()} {currency}</p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2">Par famille inscrite</p>
                </Card>
            </div>

            {/* SECTION 2: GRAPHIQUES ET ANALYSE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* GRAPHIQUE ÉVOLUTION FINANCIÈRE */}
                <Card className="lg:col-span-2 p-8 border-0 shadow-lg bg-white dark:bg-slate-900">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <TrendingUp className="text-insan-blue dark:text-blue-400"/> Dynamique des Inscriptions & CA
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">Évolution mensuelle cumulée</p>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineData}>
                                <defs>
                                    <linearGradient id="colorCa" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f7941d" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f7941d" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorIns" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#262262" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#262262" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area yAxisId="left" type="monotone" dataKey="ca" name={`CA (${currency})`} stroke="#f7941d" strokeWidth={3} fillOpacity={1} fill="url(#colorCa)" />
                                <Area yAxisId="right" type="monotone" dataKey="inscriptions" name="Inscrits" stroke="#262262" strokeWidth={3} fillOpacity={1} fill="url(#colorIns)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* GRAPHIQUE PRÉSENCE */}
                <Card className="p-8 border-0 shadow-lg bg-white dark:bg-slate-900 flex flex-col">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                        <Activity className="text-green-500"/> {t('attendance_rate')} Global
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mb-6">Répartition des statuts de présence</p>
                    
                    <div className="flex-1 min-h-[200px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={attendancePieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {attendancePieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{attendanceStats.rate}%</span>
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">{t('attendance_rate')}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {attendancePieData.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{item.name}</span>
                                <span className="ml-auto text-[10px] font-black text-slate-800 dark:text-white">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* SECTION 3: SEGMENTATION & PERTE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SEGMENTATION PAIEMENT */}
                <Card className="p-8 border-0 shadow-lg bg-white dark:bg-slate-900">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Layers className="text-slate-400"/> Segmentation des Paiements
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(financeStats.segmentMap).map(([key, dataVal]) => {
                            // Fix: Type casting 'dataVal' to resolve TS 'unknown' error in Object.entries
                            const data = dataVal as { label: string; count: number; totalAmount: number };
                            return (
                                <div key={key} className="flex items-center gap-4 group">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-inner ${data.count > 0 ? 'bg-slate-100 dark:bg-slate-800 text-insan-blue dark:text-blue-400' : 'bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-600'}`}>
                                        {key === '10' ? 'M' : `${key}X`}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{data.label}</span>
                                            <span className="font-black text-slate-800 dark:text-white text-sm">{data.count} Familles</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-insan-blue dark:bg-blue-500 transition-all duration-1000" style={{ width: `${financeStats.totalActiveDossiers > 0 ? (data.count / financeStats.totalActiveDossiers * 100) : 0}%` }}></div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1 text-right">Volume CA: {data.totalAmount.toLocaleString()}{currency}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* ANALYSE PERTE & ANNULATION */}
                <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-red-50 to-white dark:from-red-900/10 dark:to-slate-900 border-l-4 border-red-500">
                    <h3 className="text-lg font-black text-red-800 dark:text-red-400 mb-6 flex items-center gap-2">
                        <Ban size={20}/> Analyse du "Churn" (Perte)
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl backdrop-blur-sm border border-red-100 dark:border-red-900/30 text-center">
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Taux d'annulation</p>
                            <p className="text-3xl font-black text-red-600 dark:text-red-400">{financeStats.cancellationRate.toFixed(1)}%</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Sur total inscriptions</p>
                        </div>
                        <div className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl backdrop-blur-sm border border-red-100 dark:border-red-900/30 text-center">
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Manque à gagner</p>
                            <p className="text-3xl font-black text-red-600 dark:text-red-400">{financeStats.caPerdu.toLocaleString()} {currency}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">CA théorique perdu</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-white/80 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Cours annulés (Unitaires)</span>
                            <span className="font-black text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">{financeStats.totalCancelledCourses}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
