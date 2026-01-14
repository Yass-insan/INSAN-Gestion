import React, { useMemo, useState } from 'react';
import { User, AttendanceRecord, UserRole, FollowUpRecord, FollowUpStatus, Course, AttendanceStatus, FollowUpAction } from '../../types';
import { Card, PageHeader, Badge } from '../../components/ui/DesignSystem';
import { HeartHandshake, Phone, MessageSquare, Calendar, CheckCircle, XCircle, AlertTriangle, Search, History, PhoneCall, ListTodo } from 'lucide-react';

interface StudentFollowUpProps {
    users: User[];
    attendance: AttendanceRecord[];
    courses: Course[];
    followUpRecords: FollowUpRecord[];
    onUpdateFollowUp: (record: FollowUpRecord) => void;
}

// Helper pour calculer les absences consécutives
const getConsecutiveAbsences = (studentId: string, allAttendance: AttendanceRecord[]) => {
    const studentRecords = allAttendance
        .filter(r => r.studentId === studentId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let count = 0;
    let absenceDetails: AttendanceRecord[] = [];

    for (const record of studentRecords) {
        if (record.status === AttendanceStatus.ABSENT || record.status === AttendanceStatus.JUSTIFIED) {
            count++;
            absenceDetails.push(record);
        } else {
            break;
        }
    }
    return { count, absenceDetails };
};

const FollowUpItem = ({ student, consecutiveAbsences, absenceDetails, followUp, courseName, onUpdate }: any) => {
    const [comment, setComment] = useState('');
    const handleAction = (status: FollowUpStatus) => {
        const newAction: FollowUpAction = { id: Date.now().toString(), date: new Date().toISOString(), status: status, comment: comment, performedBy: 'Staff' };
        const updatedRecord: FollowUpRecord = { ...followUp, status: status, lastActionDate: new Date().toISOString(), history: [newAction, ...followUp.history] };
        onUpdate(updatedRecord);
        setComment('');
    };

    return (
        <Card className={`p-0 overflow-hidden border-l-8 ${
            followUp.status === FollowUpStatus.CONTACTED ? 'border-l-green-500' : 
            followUp.status === FollowUpStatus.NO_ANSWER ? 'border-l-red-500' : 'border-l-insan-orange'
        }`}>
            <div className="flex flex-col lg:flex-row">
                <div className="p-8 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-start gap-4 mb-6">
                        <img src={student.avatar} className="w-16 h-16 rounded-2xl border-4 border-white dark:border-slate-700 shadow-sm" alt={student.name} />
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">{student.name}</h3>
                            <p className="text-sm font-bold text-insan-blue dark:text-blue-400 mb-1">{courseName}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <p className="text-[10px] font-black uppercase text-red-500 mb-3 tracking-widest flex items-center gap-2"><AlertTriangle size={12}/> Alerte Décrochage</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                            {absenceDetails.map((abs: any) => (
                                <div key={abs.id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                                    <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Calendar size={12}/>{new Date(abs.date).toLocaleDateString()}</span>
                                    <Badge color={abs.status === 'JUSTIFIED' ? 'blue' : 'red'}>{abs.status === 'JUSTIFIED' ? 'Justif' : 'Absence'}</Badge>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                            <span className="text-red-600 dark:text-red-400 font-black text-sm">{consecutiveAbsences} Absences de suite</span>
                        </div>
                    </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <h4 className="font-black text-slate-800 dark:text-white flex items-center gap-2"><HeartHandshake className="text-insan-blue"/> Suivi d'assiduité</h4>
                            <span className="text-[10px] text-slate-400 italic">Dernière maj: {new Date(followUp.lastActionDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2 mb-6">
                            <button onClick={() => handleAction(FollowUpStatus.TO_CONTACT)} className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border transition-all ${followUp.status === FollowUpStatus.TO_CONTACT ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-400'}`}>À Contacter</button>
                            <button onClick={() => handleAction(FollowUpStatus.CONTACTED)} className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border transition-all ${followUp.status === FollowUpStatus.CONTACTED ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-400'}`}>Contacté</button>
                            <button onClick={() => handleAction(FollowUpStatus.NO_ANSWER)} className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border transition-all ${followUp.status === FollowUpStatus.NO_ANSWER ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-400'}`}>Sans réponse</button>
                        </div>
                        <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm font-medium outline-none min-h-[100px] dark:text-white" placeholder="Note d'échange..." value={comment} onChange={(e) => setComment(e.target.value)}/>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const StudentFollowUp: React.FC<StudentFollowUpProps> = ({ users, attendance, courses, followUpRecords = [], onUpdateFollowUp }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const allAlerts = useMemo(() => {
        return users.filter(u => u.role === UserRole.STUDENT).map(student => {
            const { count, absenceDetails } = getConsecutiveAbsences(student.id, attendance);
            const course = courses.find(c => c.id === student.classId);
            const courseId = student.classId || 'unknown';
            const existing = followUpRecords.find(f => f.studentId === student.id && f.courseId === courseId);
            const followUp: FollowUpRecord = existing || { id: `${student.id}-${courseId}`, studentId: student.id, courseId: courseId, status: FollowUpStatus.TO_CONTACT, lastActionDate: new Date().toISOString(), history: [] };
            return { student, consecutiveAbsences: count, absenceDetails, followUp, courseName: course?.name || 'Classe inconnue' };
        }).filter(item => item.consecutiveAbsences >= 3);
    }, [users, attendance, courses, followUpRecords]);

    const stats = useMemo(() => {
        const total = allAlerts.length;
        const toContact = allAlerts.filter(i => i.followUp.status === FollowUpStatus.TO_CONTACT).length;
        const contacted = allAlerts.filter(i => i.followUp.status === FollowUpStatus.CONTACTED).length;
        const noAnswer = allAlerts.filter(i => i.followUp.status === FollowUpStatus.NO_ANSWER).length;
        const progress = total > 0 ? Math.round(((contacted + noAnswer) / total) * 100) : 100;
        return { total, toContact, contacted, noAnswer, progress };
    }, [allAlerts]);

    const filteredAlerts = allAlerts.filter(i => 
        i.student.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <PageHeader title="Suivi des Absences" subtitle="Gestion des étudiants en situation de décrochage." />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-5 border-l-4 border-insan-orange bg-orange-50/30 dark:bg-orange-900/10">
                    <p className="text-[10px] font-black text-orange-700 dark:text-orange-400 uppercase tracking-widest">À contacter</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{stats.toContact}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold flex items-center gap-1"><PhoneCall size={10}/> Charge de travail</p>
                </Card>
                <Card className="p-5 border-l-4 border-red-500 bg-red-50/30 dark:bg-red-900/10">
                    <p className="text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-widest">Sans réponse</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{stats.noAnswer}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold flex items-center gap-1"><AlertTriangle size={10}/> Rappels à faire</p>
                </Card>
                <Card className="p-5 border-l-4 border-green-500 bg-green-50/30 dark:bg-green-900/10">
                    <p className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest">Traités</p>
                    <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-1">{stats.contacted}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold flex items-center gap-1"><CheckCircle size={10}/> Dossiers clos</p>
                </Card>
                <Card className="p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progression</p>
                            <span className="text-[10px] font-black text-insan-blue">{stats.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-insan-blue dark:bg-blue-500" style={{ width: `${stats.progress}%` }}></div>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 flex items-center gap-1"><ListTodo size={10}/> {stats.total} total</p>
                </Card>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input type="text" placeholder="Rechercher une alerte..." className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold focus:ring-2 focus:ring-insan-blue/10 dark:text-white transition-all shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="space-y-6">
                {filteredAlerts.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 italic bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800">Aucun étudiant à contacter actuellement.</div>
                ) : (
                    filteredAlerts.map(item => (
                        <FollowUpItem key={item.student.id} {...item} onUpdate={onUpdateFollowUp} />
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentFollowUp;