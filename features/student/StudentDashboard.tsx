import React, { useState } from 'react';
import { User, NewsItem, Course, AttendanceRecord, Homework, InstituteSettings, LeaveRequest, LeaveType, LeaveStatus } from '../../types';
import ClockIn from '../../components/ClockIn';
import { Card, Button, Badge, PageHeader } from '../../components/ui/DesignSystem';
import { getStudentStats, getStatusColor } from '../../services/utils';
import { History, Bell, BookOpen, Clock, MapPin, Upload, X, Check, Calendar, AlertCircle, Phone, Mail, FileText } from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  news: NewsItem[];
  courses: Course[];
  attendance: AttendanceRecord[];
  homework: Homework[];
  leaveRequests?: LeaveRequest[];
  settings?: InstituteSettings;
  onClockIn: (isExit: boolean) => void;
  onJustify?: (recordId: string, text: string) => void;
  onManageLeave?: (action: 'add' | 'update', leave: LeaveRequest) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, news, courses, attendance, homework, leaveRequests = [], settings, onClockIn, onJustify, onManageLeave }) => {
    // Tab State
    const [activeTab, setActiveTab] = useState<'synthesis' | 'attendance' | 'homework' | 'admin'>('synthesis');

    const stats = getStudentStats(user.id, user.classId || '', attendance);
    const myHomework = homework.filter(h => h.courseId === user.classId);
    
    const myHistory = attendance.filter(r => r.studentId === user.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const myAbsenceRequests = leaveRequests.filter(l => l.userId === user.id).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    const studentCourse = courses.find(c => c.id === user.classId);

    // Record du jour
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = attendance.find(r => r.studentId === user.id && r.date === today);

    // Justification Modal State
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [justificationText, setJustificationText] = useState('');

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
            alert("Absence signalée à la scolarité.");
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <PageHeader title={`Bonjour, ${user.name.split(' ')[0]}`} subtitle="Mon Dossier Scolaire Numérique." />
            
            {/* Navigation Tabs - Unified School Record Style */}
            <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 mb-6">
                <button onClick={() => setActiveTab('synthesis')} className={`px-4 py-3 font-bold text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'synthesis' ? 'text-insan-blue dark:text-blue-400 border-b-2 border-insan-blue dark:border-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                    Synthèse
                </button>
                <button onClick={() => setActiveTab('attendance')} className={`px-4 py-3 font-bold text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'attendance' ? 'text-insan-blue dark:text-blue-400 border-b-2 border-insan-blue dark:border-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                    Assiduité & Pointage <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${stats.rate < 80 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>{stats.rate}%</span>
                </button>
                <button onClick={() => setActiveTab('homework')} className={`px-4 py-3 font-bold text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'homework' ? 'text-insan-blue dark:text-blue-400 border-b-2 border-insan-blue dark:border-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                    Devoirs <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full text-[10px]">{myHomework.length}</span>
                </button>
                <button onClick={() => setActiveTab('admin')} className={`px-4 py-3 font-bold text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'admin' ? 'text-insan-blue dark:text-blue-400 border-b-2 border-insan-blue dark:border-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                    Administratif
                </button>
            </div>

            {/* --- TAB: SYNTHESIS --- */}
            {activeTab === 'synthesis' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* KPIs */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30 text-center"><p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.present}</p><p className="text-xs uppercase font-bold text-green-800 dark:text-green-300">Présences</p></div>
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-900/30 text-center"><p className="text-3xl font-bold text-orange-500 dark:text-orange-400">{stats.late}</p><p className="text-xs uppercase font-bold text-orange-700 dark:text-orange-300">Retards</p></div>
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 text-center"><p className="text-3xl font-bold text-red-500 dark:text-red-400">{stats.absent}</p><p className="text-xs uppercase font-bold text-red-700 dark:text-red-300">Absences</p></div>
                        </div>

                         {/* News Grid */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"><Bell size={20}/></div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Actualités de l'Institut</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {news.map(n => (
                                    <Card key={n.id} className={`flex flex-col overflow-hidden h-full group ${n.isUrgent ? 'border-red-200 dark:border-red-900/50 ring-1 ring-red-100 dark:ring-red-900/30' : ''}`}>
                                        {(n.coverUrl || n.mediaUrl) && (
                                            <div className="w-full h-48 overflow-hidden relative">
                                                <img src={n.coverUrl || n.mediaUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={n.title} referrerPolicy="no-referrer" />
                                                {n.isUrgent && (
                                                    <div className="absolute top-3 right-3 animate-pulse">
                                                        <Badge color="red" icon={<AlertCircle size={10}/>}>URGENT</Badge>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{n.date}</span>
                                                {!(n.coverUrl || n.mediaUrl) && n.isUrgent && <Badge color="red">URGENT</Badge>}
                                            </div>
                                            <h4 className={`font-bold text-lg mb-2 leading-tight ${n.isUrgent ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>{n.title}</h4>
                                            <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4 flex-1">{n.content}</p>
                                            
                                            {n.galleryUrls && n.galleryUrls.length > 0 && (
                                                <div className="grid grid-cols-4 gap-2 mb-4">
                                                    {n.galleryUrls.map((url, idx) => (
                                                        <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
                                                            <img src={url} className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer" alt={`Gallery ${idx}`} referrerPolicy="no-referrer" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                                <span>Par {n.author}</span>
                                                <button className="text-insan-blue dark:text-blue-400 hover:underline">Lire plus</button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                         {/* Next Course */}
                         <Card className="p-6 bg-insan-blue dark:bg-blue-900/50 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <h3 className="text-lg font-bold mb-2 relative z-10">Prochain Cours</h3>
                            {courses.filter(c => c.id === user.classId).slice(0,1).map(c => (
                                <div key={c.id} className="relative z-10">
                                    <p className="text-2xl font-extrabold mb-1">{c.name}</p>
                                    <p className="opacity-80 flex items-center gap-2 text-sm"><Clock size={16}/> {c.schedule}</p>
                                    <p className="opacity-80 flex items-center gap-2 mt-1 text-sm"><MapPin size={16}/> {c.room}</p>
                                </div>
                            ))}
                            {courses.filter(c => c.id === user.classId).length === 0 && (
                                <div className="relative z-10 text-white/70 italic text-sm">Aucun cours planifié.</div>
                            )}
                        </Card>

                        <Card className="p-6">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Phone size={18}/> Ma Classe</h4>
                            <div className="space-y-4 text-sm">
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg"><BookOpen size={14} className="text-slate-500 dark:text-slate-400"/></div>
                                    <span className="font-medium">{studentCourse?.name || 'Non assigné'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg"><MapPin size={14} className="text-slate-500 dark:text-slate-400"/></div>
                                    <span className="font-medium">{studentCourse?.room || '-'}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* --- TAB: ATTENDANCE --- */}
            {activeTab === 'attendance' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <ClockIn user={user} onClockIn={onClockIn} settings={settings} todayRecord={todayRecord} />
                        </div>
                        <div className="flex-1">
                            <Card className="p-6 h-full border-l-4 border-insan-orange">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2"><Calendar size={20}/> Signalements</h3>
                                    <Button size="sm" variant="secondary" onClick={() => setIsAbsenceModalOpen(true)} icon={<AlertCircle size={16}/>}>Signaler une absence</Button>
                                </div>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {myAbsenceRequests.map(req => (
                                        <div key={req.id} className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Du {req.startDate} au {req.endDate}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">{req.reason}</p>
                                            </div>
                                            <Badge color={req.status === 'APPROVED' ? 'green' : req.status === 'REJECTED' ? 'red' : 'orange'}>
                                                {req.status === 'APPROVED' ? 'Validé' : req.status === 'REJECTED' ? 'Refusé' : 'En attente'}
                                            </Badge>
                                        </div>
                                    ))}
                                    {myAbsenceRequests.length === 0 && <p className="text-slate-400 dark:text-slate-500 italic text-sm">Aucun signalement en cours.</p>}
                                </div>
                            </Card>
                        </div>
                    </div>

                    <Card className="p-8">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2"><History size={20}/> Historique de Pointage</h3>
                        <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Cours</th>
                                        <th className="p-4">Entrée</th>
                                        <th className="p-4">Sortie</th>
                                        <th className="p-4 text-center">Statut</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {myHistory.map(record => {
                                        const courseName = courses.find(c => c.id === record.courseId)?.name || record.courseId;
                                        return (
                                            <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4 font-bold text-slate-700 dark:text-slate-200">{record.date}</td>
                                                <td className="p-4 font-medium text-slate-600 dark:text-slate-300">{courseName}</td>
                                                <td className="p-4 font-mono text-slate-500 dark:text-slate-400">{record.entryTimestamp || '-'}</td>
                                                <td className="p-4 font-mono text-slate-500 dark:text-slate-400">{record.exitTimestamp || '-'}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(record.status)}`}>{record.status}</span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {(record.status === 'ABSENT' || record.status === 'LATE') && !record.justification ? (
                                                        <button onClick={() => handleOpenJustify(record)} className="text-xs text-insan-blue dark:text-blue-400 hover:underline font-bold">Justifier</button>
                                                    ) : record.justification ? (
                                                        <span className="text-xs text-green-600 dark:text-green-400 font-bold flex items-center justify-end gap-1"><Check size={12}/> Envoyé</span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 dark:text-slate-600">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {myHistory.length === 0 && (
                                        <tr><td colSpan={6} className="p-6 text-center text-slate-400 dark:text-slate-500 italic">Aucun historique disponible.</td></tr>
                                    )}
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
                                        <span className="text-xs font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-100 dark:border-red-900/30">Pour le {h.dueDate}</span>
                                    </div>
                                    <h5 className="font-bold text-slate-800 dark:text-white text-lg mb-2">{h.title}</h5>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed">{h.description}</p>
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

            {/* --- TAB: ADMIN --- */}
            {activeTab === 'admin' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                     <Card className="p-6">
                         <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2"><FileText size={20}/> Informations Légales</h4>
                         <div className="space-y-4 text-sm">
                             <div>
                                 <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Nom Complet</label>
                                 <p className="font-medium text-slate-700 dark:text-slate-200">{user.name}</p>
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Email</label>
                                 <p className="font-medium text-slate-700 dark:text-slate-200">{user.email}</p>
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">INE (Numéro Étudiant)</label>
                                 <p className="font-medium text-slate-700 dark:text-slate-200">{user.id.padStart(10, '0')}</p>
                             </div>
                         </div>
                     </Card>
                     <Card className="p-6">
                         <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2"><MapPin size={20}/> Adresse & Transport</h4>
                         <div className="space-y-4 text-sm">
                             <div>
                                 <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Adresse Postale</label>
                                 <p className="font-medium text-slate-700 dark:text-slate-200">12 Rue de l'Exemple, 69007 Lyon</p>
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Régime</label>
                                 <p className="font-medium text-slate-700 dark:text-slate-200">Demi-pensionnaire</p>
                             </div>
                         </div>
                     </Card>
                 </div>
            )}

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
                                    value={justificationText}
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
                                <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Début</label><input required type="date" value={absenceStart} onChange={e => setAbsenceStart(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none bg-white dark:bg-slate-800 dark:text-white" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Fin</label><input required type="date" value={absenceEnd} onChange={e => setAbsenceEnd(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none bg-white dark:bg-slate-800 dark:text-white" /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Motif</label>
                                <textarea value={absenceReason} onChange={e => setAbsenceReason(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none min-h-[80px] bg-white dark:bg-slate-800 dark:text-white" placeholder="Raison de l'absence..."></textarea>
                            </div>
                            <Button type="submit" className="w-full">Envoyer le signalement</Button>
                        </form>
                     </Card>
                 </div>
            )}
        </div>
    );
};

export default StudentDashboard;