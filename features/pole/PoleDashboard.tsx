import React from 'react';
import { User, Course, AttendanceRecord, Pole, InstituteSettings, NewsItem, UserRole } from '../../types';
import { Card, PageHeader, Badge } from '../../components/ui/DesignSystem';
import ClockIn from '../../components/ClockIn';
import { getClassStats } from '../../services/utils';
import { BookOpen, Users, PieChart as PieChartIcon, Bell, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PoleDashboardProps {
    user: User;
    news: NewsItem[];
    courses: Course[];
    attendance: AttendanceRecord[];
    users: User[];
    settings?: InstituteSettings;
    poles: Pole[];
    onClockIn: (isExit: boolean) => void;
}

const PoleDashboard: React.FC<PoleDashboardProps> = ({ user, courses, attendance, users, poles, news, onClockIn, settings }) => {
    const myPole = poles?.find(p => p.id === user.managedPole);
    const poleCourses = courses.filter(c => c.pole === user.managedPole);
    const poleStudents = users.filter(u => u.role === UserRole.STUDENT && poleCourses.some(c => c.id === u.classId));
    
    const totalSessions = attendance.filter(r => poleCourses.some(c => c.id === r.courseId)).length;
    const presentCount = attendance.filter(r => poleCourses.some(c => c.id === r.courseId) && (r.status === 'PRESENT' || r.status === 'LATE')).length;
    const poleRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    const data = [
        { name: 'Présent', value: presentCount, color: '#22c55e' },
        { name: 'Absent', value: totalSessions - presentCount, color: '#ef4444' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader title={`Pôle ${myPole?.name || 'Indéfini'}`} subtitle="Pilotage du département." />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-gradient-to-br from-insan-blue to-indigo-900 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <h2 className="text-3xl font-extrabold mb-2">Vue d'ensemble</h2>
                            <p className="opacity-80 max-w-md text-sm">Analysez la performance de vos classes et suivez l'assiduité globale de votre pôle.</p>
                        </div>
                        <div className="grid grid-cols-3 gap-6 mt-8">
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Cours Actifs</p>
                                <p className="text-3xl font-extrabold">{poleCourses.length}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                                 <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Étudiants</p>
                                <p className="text-3xl font-extrabold">{poleStudents.length}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                                 <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Taux Global</p>
                                <p className="text-3xl font-extrabold">{poleRate}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="p-6 flex flex-col justify-center items-center">
                    <h3 className="text-slate-800 dark:text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider"><PieChartIcon size={18}/> Répartition</h3>
                    <div className="w-full h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                                    {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Présence</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Absence</span>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="p-8">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2"><BookOpen size={20}/> Performance des Cours</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {poleCourses.map(c => {
                                const stats = getClassStats(c.id, users, attendance);
                                return (
                                    <div key={c.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-insan-blue/30 dark:hover:border-blue-500/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">{c.name}</h4>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${stats.avgPresence > 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'}`}>{stats.avgPresence}%</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">{c.schedule}</p>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                                            <div className="h-full bg-insan-blue dark:bg-blue-500" style={{width: `${stats.avgPresence}%`}}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>

                    <Card className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"><Bell size={20}/></div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Actualités du Département</h3>
                        </div>
                        <div className="space-y-4">
                            {news.slice(0, 4).map(n => (
                                <div key={n.id} className={`p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex gap-4 ${n.isUrgent ? 'bg-red-50/30 dark:bg-red-900/20 border-red-100 dark:border-red-900/30' : 'bg-white dark:bg-slate-800'}`}>
                                    {n.mediaUrl && <img src={n.mediaUrl} className="w-20 h-20 rounded-xl object-cover shrink-0" alt="" />}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{n.date}</span>
                                            {n.isUrgent && <Badge color="red" icon={<AlertCircle size={10}/>}>URGENT</Badge>}
                                        </div>
                                        <h4 className={`font-bold text-sm ${n.isUrgent ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>{n.title}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{n.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
                <div>
                    {/* Record du jour pour l'utilisateur pôle */}
                    <ClockIn user={user} onClockIn={onClockIn} settings={settings} todayRecord={attendance.find(r => r.studentId === user.id && r.date === new Date().toISOString().split('T')[0])} />
                </div>
            </div>
        </div>
    );
};

export default PoleDashboard;