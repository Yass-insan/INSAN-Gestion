import React from 'react';
import { User, WorkSchedule, AttendanceRecord, InstituteSettings } from '../../types';
import ClockIn from '../../components/ClockIn';
import { Card, PageHeader, Badge } from '../../components/ui/DesignSystem';
import { Clock, Calendar, CheckCircle, AlertTriangle, History } from 'lucide-react';

interface PointagePageProps {
    user: User;
    schedules: WorkSchedule[];
    attendance: AttendanceRecord[];
    settings: InstituteSettings;
    onClockIn: (isExit: boolean) => void;
}

const PointagePage: React.FC<PointagePageProps> = ({ user, schedules, attendance, settings, onClockIn }) => {
    const today = new Date().toISOString().split('T')[0];
    const todayDayOfWeek = new Date().getDay();

    const todaySchedules = schedules.filter(s => {
        if (s.userId !== user.id) return false;
        if (s.type === 'EXCEPTION' && s.date === today) return true;
        if (s.type === 'RECURRING' && s.dayOfWeek === todayDayOfWeek) return true;
        return false;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Record du jour pour l'utilisateur
    const todayRecord = attendance.find(r => r.studentId === user.id && r.date === today);

    const history = attendance
        .filter(r => r.studentId === user.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <PageHeader 
                title="Ma Présence" 
                subtitle="Pointer mon arrivée et mon départ pour valider ma journée."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <ClockIn user={user} onClockIn={onClockIn} settings={settings} todayRecord={todayRecord} />
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8 h-full bg-white dark:bg-slate-900 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Clock size={120} />
                        </div>
                        
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-insan-orange/10 text-insan-orange rounded-lg"><Calendar size={20}/></div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Planning du jour</h3>
                            </div>
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        </div>

                        <div className="space-y-6 relative z-10">
                            {todaySchedules.length > 0 ? todaySchedules.map((s) => {
                                return (
                                    <div key={s.id} className={`flex items-stretch gap-4 p-5 rounded-2xl border transition-all ${todayRecord ? 'bg-green-50/50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                                        <div className="flex flex-col items-center justify-center pr-4 border-r border-slate-200 dark:border-slate-700 min-w-[80px]">
                                            <span className="text-lg font-extrabold text-insan-blue dark:text-blue-400">{s.startTime}</span>
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Début</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className="font-bold text-slate-800 dark:text-white">{s.activityTitle || 'Activité'}</p>
                                                {todayRecord ? (
                                                    <Badge color="green" icon={<CheckCircle size={10}/>}>Service commencé</Badge>
                                                ) : (
                                                    <Badge color="gray">À venir</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Fin prévue à {s.endTime}</p>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="p-10 text-center flex flex-col items-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-3xl">
                                    <AlertTriangle size={32} className="text-slate-200 dark:text-slate-600 mb-3" />
                                    <p className="text-slate-400 dark:text-slate-500 font-medium">Aucune activité planifiée pour vous aujourd'hui.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"><History size={20}/></div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Historique de mes pointages</h3>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Arrivée</th>
                                <th className="p-4">Départ</th>
                                <th className="p-4">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {history.map(record => (
                                <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 font-bold text-slate-700 dark:text-slate-200">{new Date(record.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                    <td className="p-4 font-mono font-bold text-insan-blue dark:text-blue-400">{record.entryTimestamp || '--:--'}</td>
                                    <td className="p-4 font-mono font-bold text-slate-400 dark:text-slate-500">{record.exitTimestamp || '--:--'}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                            record.status === 'PRESENT' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 
                                            record.status === 'LATE' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                        }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default PointagePage;