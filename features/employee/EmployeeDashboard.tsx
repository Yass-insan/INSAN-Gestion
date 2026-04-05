
import React, { useState } from 'react';
import { User, WorkSchedule, InstituteSettings, LeaveRequest, LeaveType, LeaveStatus, NewsItem } from '../../types';
import { Card, Button, Badge } from '../../components/ui/DesignSystem';
import { CalendarRange, Palmtree, Plus, X, AlertCircle, CheckCircle, Bell, Megaphone } from 'lucide-react';

const SectionHeader = ({ title, icon: Icon }: { title: string, icon?: any }) => (
    <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            {Icon && <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-insan-orange border border-slate-100 dark:border-slate-700"><Icon size={20} /></div>}
            {title}
        </h3>
    </div>
);

interface EmployeeDashboardProps {
    user: User;
    news?: NewsItem[];
    schedules?: WorkSchedule[];
    leaveRequests?: LeaveRequest[];
    settings?: InstituteSettings;
    onClockIn: (late: boolean) => void;
    onManageLeave?: (action: 'add' | 'update', leave: LeaveRequest) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user, news = [], schedules = [], leaveRequests = [], onClockIn, settings, onManageLeave }) => {
    const mySchedule = schedules.filter(s => s.userId === user.id).sort((a,b) => (a.dayOfWeek||0) - (b.dayOfWeek||0));
    const myLeaves = leaveRequests.filter(l => l.userId === user.id).sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    // Leave Form State
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [leaveType, setLeaveType] = useState<LeaveType>(LeaveType.VACATION);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmitLeave = (e: React.FormEvent) => {
        e.preventDefault();
        if (onManageLeave) {
            onManageLeave('add', {
                id: Date.now().toString(),
                userId: user.id,
                type: leaveType,
                startDate,
                endDate,
                reason,
                status: LeaveStatus.PENDING,
                requestDate: new Date().toISOString().split('T')[0]
            });
            setIsLeaveModalOpen(false);
            setReason(''); setStartDate(''); setEndDate('');
        }
    };

    return (
        <div className="animate-fade-in space-y-8">
            {/* Summary Statistics for Leaves */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-insan-blue">
                    <p className="text-xs font-bold text-slate-400 uppercase">Congés restants</p>
                    <p className="text-3xl font-extrabold text-slate-800">12 Jours</p>
                </Card>
                <Card className="p-6 border-l-4 border-insan-orange">
                    <p className="text-xs font-bold text-slate-400 uppercase">Demandes en attente</p>
                    <p className="text-3xl font-extrabold text-slate-800">{myLeaves.filter(l => l.status === LeaveStatus.PENDING).length}</p>
                </Card>
                <Card className="p-6 border-l-4 border-green-500">
                    <p className="text-xs font-bold text-slate-400 uppercase">Absences ce mois</p>
                    <p className="text-3xl font-extrabold text-slate-800">0</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* PLANNING */}
                    <Card className="p-8">
                        <SectionHeader title="Mon Emploi du Temps" icon={CalendarRange} />
                        <div className="space-y-4">
                            {mySchedule.map(s => (
                                <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-slate-700 text-sm border border-slate-100">
                                            {s.type === 'RECURRING' ? days[s.dayOfWeek || 0].substring(0,3) : new Date(s.date || '').getDate()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 flex items-center gap-2">
                                                {s.type === 'RECURRING' ? days[s.dayOfWeek || 0] : `Exception: ${s.date}`}
                                                {s.type === 'EXCEPTION' && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 rounded-full">Ponctuel</span>}
                                            </p>
                                            <p className="text-xs text-slate-500">{s.activityTitle}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-insan-blue">{s.startTime} - {s.endTime}</span>
                                    </div>
                                </div>
                            ))}
                            {mySchedule.length === 0 && <p className="text-slate-400 italic">Aucun horaire défini.</p>}
                        </div>
                    </Card>

                    {/* CONGES */}
                    <Card className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <SectionHeader title="Mes Absences & Congés" icon={Palmtree} />
                            <Button size="sm" onClick={() => setIsLeaveModalOpen(true)} icon={<Plus size={16}/>}>Nouvelle Demande</Button>
                        </div>
                        
                        <div className="space-y-4">
                            {myLeaves.map(l => (
                                <div key={l.id} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge color={l.status === 'APPROVED' ? 'green' : l.status === 'REJECTED' ? 'red' : 'orange'}>
                                                {l.status === 'APPROVED' ? 'Validé' : l.status === 'REJECTED' ? 'Refusé' : 'En attente'}
                                            </Badge>
                                            <span className="text-sm font-bold text-slate-700">{l.type}</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Du {l.startDate} au {l.endDate}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {l.status === 'PENDING' && <AlertCircle className="text-orange-400" size={20}/>}
                                        {l.status === 'APPROVED' && <CheckCircle className="text-green-500" size={20}/>}
                                        {l.status === 'REJECTED' && <X className="text-red-500" size={20}/>}
                                    </div>
                                </div>
                            ))}
                            {myLeaves.length === 0 && <p className="text-slate-400 italic text-center py-6">Aucune demande récente.</p>}
                        </div>
                    </Card>
                </div>
                
                {/* Info Card instead of ClockIn */}
                <div className="space-y-6">
                    <Card className="p-8">
                        <SectionHeader title="Actualités" icon={Bell} />
                        <div className="space-y-4">
                            {news.slice(0, 3).map(n => (
                                <div key={n.id} className={`p-4 rounded-2xl border border-slate-100 dark:border-slate-800 ${n.isUrgent ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20' : 'bg-white dark:bg-slate-900'}`}>
                                    {(n.coverUrl || n.mediaUrl) && (
                                        <img src={n.coverUrl || n.mediaUrl} className="w-full h-24 rounded-xl object-cover mb-3" alt="" referrerPolicy="no-referrer" />
                                    )}
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{n.date}</span>
                                        {n.isUrgent && <Badge color="red" className="text-[8px]">URGENT</Badge>}
                                    </div>
                                    <h4 className={`font-bold text-sm mb-1 ${n.isUrgent ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>{n.title}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{n.content}</p>
                                </div>
                            ))}
                            {news.length === 0 && <p className="text-center py-6 text-slate-400 italic">Aucune actualité.</p>}
                        </div>
                    </Card>

                    <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20">
                        <h4 className="font-bold text-insan-blue mb-2">Informations RH</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Pour toute modification de vos horaires contractuels, veuillez contacter la direction administrative via le chat interne.
                        </p>
                        <div className="mt-4 pt-4 border-t border-blue-100">
                             <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Prochain jour férié</p>
                             <p className="text-sm font-bold text-slate-700">1er Janvier - Jour de l'an</p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Leave Request Modal */}
            {isLeaveModalOpen && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                     <Card className="w-full max-w-md animate-fade-in">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-lg text-slate-800">Demander une absence</h3>
                            <button onClick={() => setIsLeaveModalOpen(false)} className="hover:bg-slate-200 p-2 rounded-full transition-colors text-slate-500"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmitLeave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                                <select value={leaveType} onChange={e => setLeaveType(e.target.value as LeaveType)} className="w-full border-slate-200 rounded-xl p-3 bg-white outline-none">
                                    {Object.values(LeaveType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Début</label><input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border-slate-200 rounded-xl p-3 outline-none" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fin</label><input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border-slate-200 rounded-xl p-3 outline-none" /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Motif (Optionnel)</label>
                                <textarea value={reason} onChange={e => setReason(e.target.value)} className="w-full border-slate-200 rounded-xl p-3 outline-none min-h-[80px]" placeholder="Raison de l'absence..."></textarea>
                            </div>
                            <Button type="submit" className="w-full">Envoyer la demande</Button>
                        </form>
                     </Card>
                 </div>
            )}
        </div>
    );
}
