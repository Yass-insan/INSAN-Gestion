import React, { useState } from 'react';
import { User, Course, AttendanceRecord, UserRole, Homework, NewsItem, InstituteSettings, AttendanceStatus } from '../../types';
import { Card, Button, Badge, PageHeader, useToast } from '../../components/ui/DesignSystem';
import { Users, Clock, Check, X, ChevronRight, Save, UserCheck, AlertTriangle, BookOpen, Bell, Calendar, Plus, Trash2, FileText, AlertCircle } from 'lucide-react';

interface ProfessorDashboardProps {
    user: User;
    news: NewsItem[];
    courses: Course[];
    attendance: AttendanceRecord[];
    homework: Homework[];
    users: User[]; 
    settings?: InstituteSettings;
    onClockIn: (isExit: boolean) => void;
    onAddNews: (news: NewsItem) => void;
    onAddAttendance: (record: AttendanceRecord) => void;
    onManageHomework: (action: 'add' | 'delete', homework: Homework) => void;
}

const ProfessorDashboard: React.FC<ProfessorDashboardProps> = ({ 
    user, courses, attendance, users, onAddAttendance, news, homework, onManageHomework 
}) => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'homework' | 'planning'>('overview');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [tempAttendance, setTempAttendance] = useState<Record<string, AttendanceStatus>>({});

    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    // Homework states
    const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
    const [newHwTitle, setNewHwTitle] = useState('');
    const [newHwDesc, setNewHwDesc] = useState('');
    const [newHwDate, setNewHwDate] = useState('');
    const [newHwCourseId, setNewHwCourseId] = useState('');

    const myCourses = courses.filter(c => c.professorIds.includes(user.id));
    const myHomework = homework.filter(h => h.assignedBy === user.name);
    
    const getStudentsForCourse = (courseId: string) => users.filter(u => u.role === UserRole.STUDENT && u.classId === courseId);

    const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
        setTempAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const submitAttendance = () => {
        if (!selectedCourse) return;
        const entries = Object.entries(tempAttendance);
        
        if (entries.length === 0) {
            showToast("Veuillez marquer au moins un élève avant d'enregistrer.", "error");
            return;
        }

        entries.forEach(([studentId, status]) => {
            onAddAttendance({
                id: Date.now().toString() + Math.random(),
                studentId,
                courseId: selectedCourse.id,
                date: attendanceDate,
                entryTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: status
            });
        });

        showToast(`Appel enregistré pour ${entries.length} étudiants.`, "success");
        setTempAttendance({});
        setActiveTab('overview');
        setSelectedCourse(null);
    };

    const handleAddHomework = (e: React.FormEvent) => {
        e.preventDefault();
        if (onManageHomework) {
            onManageHomework('add', {
                id: Date.now().toString(),
                courseId: newHwCourseId,
                title: newHwTitle,
                description: newHwDesc,
                dueDate: newHwDate,
                assignedBy: user.name
            });
            setIsHomeworkModalOpen(false);
            setNewHwTitle(''); setNewHwDesc(''); setNewHwDate(''); setNewHwCourseId('');
            showToast("Devoir ajouté au cahier de textes.", "success");
        }
    };

    const markAllPresent = () => {
        if (!selectedCourse) return;
        const students = getStudentsForCourse(selectedCourse.id);
        const newAttendance: Record<string, AttendanceStatus> = {};
        students.forEach(s => {
            newAttendance[s.id] = AttendanceStatus.PRESENT;
        });
        setTempAttendance(newAttendance);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader 
                title={`Tableau de bord Enseignant`} 
                subtitle="Gestion de vos classes et vie pédagogique."
                action={
                    <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-insan-blue text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>Vue d'ensemble</button>
                        <button onClick={() => setActiveTab('planning')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'planning' ? 'bg-insan-blue text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>Mon Planning</button>
                        <button onClick={() => setActiveTab('homework')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'homework' ? 'bg-insan-blue text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>Cahier de Textes</button>
                    </div>
                }
            />

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-insan-blue dark:text-blue-400"><BookOpen size={20}/></div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Mes Classes Actives</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myCourses.map(c => {
                                const studentCount = getStudentsForCourse(c.id).length;
                                return (
                                    <Card key={c.id} className={`p-6 hover:shadow-lg transition-all border-l-4 cursor-pointer group ${c.isManualAttendance ? 'border-insan-orange' : 'border-insan-blue'}`} onClick={() => { setSelectedCourse(c); setActiveTab('attendance'); }}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-insan-blue dark:group-hover:text-blue-400 transition-colors">{c.name}</h3>
                                            <Badge color={c.isManualAttendance ? 'orange' : 'blue'}>{c.level || 'Général'}</Badge>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2"><Clock size={14}/> {c.schedule}</p>
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-700">
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1"><Users size={14}/> {studentCount} Élèves</span>
                                            <span className="text-xs font-bold text-insan-blue dark:text-blue-400 flex items-center gap-1">Faire l'appel <ChevronRight size={14}/></span>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"><Bell size={20}/></div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Actualités de l'Institut</h3>
                            </div>
                            <div className="space-y-4">
                                 {news.slice(0, 5).map(n => (
                                    <div key={n.id} className={`pb-4 border-b border-slate-50 dark:border-slate-800 last:border-0 last:pb-0 flex gap-4 items-start ${n.isUrgent ? 'animate-pulse-subtle' : ''}`}>
                                        {(n.coverUrl || n.mediaUrl) && (
                                            <img src={n.coverUrl || n.mediaUrl} className="w-16 h-16 rounded-lg object-cover border border-slate-100 dark:border-slate-700 shadow-sm shrink-0" alt="" referrerPolicy="no-referrer" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{n.date}</p>
                                                {n.isUrgent && <Badge color="red" className="scale-75 origin-right">URGENT</Badge>}
                                            </div>
                                            <h4 className={`font-bold text-sm truncate ${n.isUrgent ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>{n.title}</h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{n.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'attendance' && selectedCourse && (
                <div className="animate-fade-in space-y-6">
                    <button onClick={() => { setActiveTab('overview'); setSelectedCourse(null); }} className="flex items-center gap-2 text-slate-500 hover:text-insan-blue dark:text-slate-400 dark:hover:text-blue-400 font-bold transition-colors">
                        <ChevronRight size={18} className="rotate-180" /> Retour à la liste des cours
                    </button>

                    <Card className={`p-6 border-l-4 shadow-md ${selectedCourse.isManualAttendance ? 'border-insan-orange bg-orange-50/30 dark:bg-orange-900/10' : 'border-insan-blue bg-blue-50/50 dark:bg-blue-900/10'}`}>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${selectedCourse.isManualAttendance ? 'bg-insan-orange text-white' : 'bg-insan-blue text-white'}`}>
                                    <UserCheck size={28} />
                                </div>
                                <div>
                                    <h3 className={`font-bold text-xl ${selectedCourse.isManualAttendance ? 'text-insan-orange dark:text-orange-400' : 'text-insan-blue dark:text-blue-400'}`}>Feuille d'appel : {selectedCourse.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{selectedCourse.schedule} • {getStudentsForCourse(selectedCourse.id).length} Étudiants</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="flex-1 md:flex-none border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-white dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 shadow-sm outline-none" />
                                <Button variant="secondary" onClick={markAllPresent} size="sm">Tous présents</Button>
                                <Button onClick={submitAttendance} icon={<Save size={18}/>}>Enregistrer</Button>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {getStudentsForCourse(selectedCourse.id).map(student => (
                                <div key={student.id} className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${tempAttendance[student.id] ? 'border-insan-blue dark:border-blue-500 bg-blue-50/30 dark:bg-blue-900/10 shadow-inner' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600'}`}>
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="relative">
                                            <img src={student.avatar} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-600 shadow-sm" alt=""/>
                                            {tempAttendance[student.id] && (
                                                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-sm ${
                                                    tempAttendance[student.id] === AttendanceStatus.PRESENT ? 'bg-green-500' : 
                                                    tempAttendance[student.id] === AttendanceStatus.LATE ? 'bg-orange-500' : 'bg-red-500'
                                                }`}>
                                                    {tempAttendance[student.id] === AttendanceStatus.PRESENT ? <Check size={12}/> : 
                                                     tempAttendance[student.id] === AttendanceStatus.LATE ? <Clock size={12}/> : <X size={12}/>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{student.name}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Élève ID: {student.id}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button 
                                            onClick={() => handleAttendanceChange(student.id, AttendanceStatus.PRESENT)}
                                            className={`py-2 rounded-lg text-[10px] font-bold transition-all ${tempAttendance[student.id] === AttendanceStatus.PRESENT ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                                        >PRÉSENT</button>
                                        <button 
                                            onClick={() => handleAttendanceChange(student.id, AttendanceStatus.LATE)}
                                            className={`py-2 rounded-lg text-[10px] font-bold transition-all ${tempAttendance[student.id] === AttendanceStatus.LATE ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                                        >RETARD</button>
                                        <button 
                                            onClick={() => handleAttendanceChange(student.id, AttendanceStatus.ABSENT)}
                                            className={`py-2 rounded-lg text-[10px] font-bold transition-all ${tempAttendance[student.id] === AttendanceStatus.ABSENT ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                                        >ABSENT</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'planning' && (
                <div className="animate-fade-in space-y-6">
                    <Card className="p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-insan-blue/10 text-insan-blue rounded-lg"><Calendar size={20}/></div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Mon Emploi du Temps</h3>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Récapitulatif de vos cours hebdomadaires</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myCourses.map(c => (
                                <React.Fragment key={c.id}>
                                    {/* Main Schedule */}
                                    <div className="p-5 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 hover:border-insan-blue/30 transition-all">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="px-2 py-1 bg-insan-blue text-white text-[10px] font-bold rounded uppercase">{days[c.dayOfWeek]}</span>
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={10}/> {c.startTime} - {c.endTime}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 dark:text-white mb-1">{c.name}</h4>
                                        <div className="flex items-center gap-2 mt-3">
                                            <Badge color="gray" className="text-[9px]">Salle: {c.room}</Badge>
                                            <Badge color="blue" className="text-[9px]">{getStudentsForCourse(c.id).length} Élèves</Badge>
                                        </div>
                                    </div>

                                    {/* Additional Schedules */}
                                    {(c.schedules || []).map((s, idx) => (
                                        <div key={`${c.id}-extra-${idx}`} className="p-5 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 hover:border-insan-blue/30 transition-all">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="px-2 py-1 bg-insan-blue text-white text-[10px] font-bold rounded uppercase">{days[s.dayOfWeek]}</span>
                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={10}/> {s.startTime} - {s.endTime}</span>
                                            </div>
                                            <h4 className="font-bold text-slate-800 dark:text-white mb-1">{c.name}</h4>
                                            <div className="flex items-center gap-2 mt-3">
                                                <Badge color="gray" className="text-[9px]">Salle: {c.room}</Badge>
                                                <Badge color="blue" className="text-[9px]">{getStudentsForCourse(c.id).length} Élèves</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                            {myCourses.length === 0 && (
                                <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-3xl">
                                    <p className="text-slate-400 italic">Aucun cours ne vous est actuellement assigné.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'homework' && (
                <div className="animate-fade-in space-y-6">
                    <Card className="p-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-insan-orange/10 text-insan-orange rounded-lg"><FileText size={20}/></div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Cahier de Textes</h3>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Gestion des devoirs par classe</p>
                                </div>
                            </div>
                            <Button onClick={() => setIsHomeworkModalOpen(true)} icon={<Plus size={18}/>}>Nouveau Devoir</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {myHomework.map(h => {
                                const courseName = courses.find(c => c.id === h.courseId)?.name || 'Cours inconnu';
                                return (
                                    <div key={h.id} className="p-6 border border-slate-100 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all group relative">
                                        <button onClick={() => onManageHomework('delete', h)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                        <div className="flex justify-between items-start mb-3">
                                            <Badge color="blue">{courseName}</Badge>
                                            <span className="text-[10px] font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-100 dark:border-red-900/30">Échéance : {h.dueDate}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-2">{h.title}</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{h.description}</p>
                                        <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                                            <Calendar size={12} className="text-slate-400"/>
                                            <span className="text-[10px] text-slate-400 font-bold">Assigné par vous</span>
                                        </div>
                                    </div>
                                )
                            })}
                            {myHomework.length === 0 && (
                                <div className="md:col-span-2 py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-3xl">
                                    <p className="text-slate-400 italic">Vous n'avez pas encore ajouté de devoirs.</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* MODAL AJOUT DEVOIR */}
                    {isHomeworkModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                            <Card className="w-full max-w-lg animate-fade-in bg-white dark:bg-slate-900">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Ajouter un devoir</h3>
                                    <button onClick={() => setIsHomeworkModalOpen(false)} className="hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-full transition-colors text-slate-500 dark:text-slate-400"><X size={20} /></button>
                                </div>
                                <form onSubmit={handleAddHomework} className="p-8 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Classe / Cours cible</label>
                                        <select required value={newHwCourseId} onChange={e => setNewHwCourseId(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white shadow-sm outline-none focus:ring-2 focus:ring-insan-blue/20">
                                            <option value="">Sélectionner une de vos classes...</option>
                                            {myCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Titre du devoir</label>
                                        <input required type="text" placeholder="Ex: Étude de texte" value={newHwTitle} onChange={e => setNewHwTitle(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white shadow-sm outline-none focus:ring-2 focus:ring-insan-blue/20" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Date d'échéance</label>
                                            <input required type="date" value={newHwDate} onChange={e => setNewHwDate(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white shadow-sm outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Instructions détaillées</label>
                                        <textarea required placeholder="Précisez le travail à effectuer..." value={newHwDesc} onChange={e => setNewHwDesc(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white shadow-sm outline-none min-h-[120px] focus:ring-2 focus:ring-insan-blue/20"></textarea>
                                    </div>
                                    <Button type="submit" className="w-full mt-4">Publier dans le cahier de textes</Button>
                                </form>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfessorDashboard;