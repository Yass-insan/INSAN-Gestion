import React, { useState, useMemo } from 'react';
import { User, Course, AttendanceRecord, UserRole, FollowUpRecord, FollowUpStatus, AttendanceStatus, FollowUpAction } from '../../types';
import { Card, PageHeader, Badge, Button } from '../../components/ui/DesignSystem';
import { getStudentStats, getClassStats } from '../../services/utils';
import { 
    Search, 
    Mail, 
    Phone, 
    History, 
    LayoutGrid, 
    AlertCircle, 
    PhoneCall, 
    AlertTriangle, 
    CheckCircle, 
    ListTodo, 
    HeartHandshake,
    Calendar,
    BookOpen,
    Users as UsersIcon,
    ArrowRight,
    XCircle,
    ArrowLeft,
    TrendingUp,
    ChevronRight,
    BarChart3,
    ExternalLink,
    ChevronDown,
    UserCircle,
    Info,
    X
} from 'lucide-react';

interface StudentTrackingProps { 
    users: User[]; 
    courses: Course[]; 
    attendance: AttendanceRecord[];
    followUpRecords?: FollowUpRecord[];
    onUpdateFollowUp?: (record: FollowUpRecord) => void;
    onNavigateToStats?: (poleId: string, classId: string) => void;
    homework?: any;
    currentUser?: User;
    onManageUsers?: any;
}

// --- HELPERS ---
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
        } else { break; }
    }
    return { count, absenceDetails };
};

// --- SUB-COMPONENTS ---

const FollowUpItem = ({ student, consecutiveAbsences, absenceDetails, followUp, courseName, onUpdate }: any) => {
    const [comment, setComment] = useState('');
    const handleAction = (status: FollowUpStatus) => {
        const newAction: FollowUpAction = { 
            id: Date.now().toString(), 
            date: new Date().toISOString(), 
            status: status, 
            comment: comment, 
            performedBy: 'Staff' 
        };
        const updatedRecord: FollowUpRecord = { 
            ...followUp, 
            status: status, 
            lastActionDate: new Date().toISOString(), 
            history: [newAction, ...followUp.history] 
        };
        onUpdate(updatedRecord);
        setComment('');
    };

    return (
        <Card className={`p-0 overflow-hidden border-l-8 animate-fade-in ${
            followUp.status === FollowUpStatus.CONTACTED ? 'border-l-green-500' : 
            followUp.status === FollowUpStatus.NO_ANSWER ? 'border-l-red-500' : 'border-l-insan-orange'
        }`}>
            <div className="flex flex-col lg:flex-row">
                <div className="p-6 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center gap-4 mb-4">
                        <img src={student.avatar} className="w-14 h-14 rounded-2xl border-2 border-white dark:border-slate-700 shadow-sm" alt={student.name} />
                        <div>
                            <h3 className="font-black text-slate-800 dark:text-white leading-tight">{student.name}</h3>
                            <p className="text-[10px] font-bold text-insan-blue dark:text-blue-400 uppercase tracking-wider">{courseName}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <p className="text-[9px] font-black text-red-500 uppercase mb-2 flex items-center gap-1"><AlertTriangle size={10}/> {consecutiveAbsences} Absences consécutives</p>
                        <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                            {absenceDetails.map((abs: any) => (
                                <div key={abs.id} className="flex justify-between items-center text-[10px] p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                                    <span className="font-bold text-slate-500">{new Date(abs.date).toLocaleDateString()}</span>
                                    <Badge color={abs.status === 'JUSTIFIED' ? 'blue' : 'red'}>{abs.status === 'JUSTIFIED' ? 'Justif' : 'Injust'}</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2"><HeartHandshake size={16} className="text-insan-blue"/> Suivi d'absence</h4>
                            <span className="text-[9px] text-slate-400 italic">Dernière maj: {new Date(followUp.lastActionDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2 mb-4">
                            <button onClick={() => handleAction(FollowUpStatus.TO_CONTACT)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${followUp.status === FollowUpStatus.TO_CONTACT ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-400'}`}>À Contacter</button>
                            <button onClick={() => handleAction(FollowUpStatus.CONTACTED)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${followUp.status === FollowUpStatus.CONTACTED ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-400'}`}>Contacté</button>
                            <button onClick={() => handleAction(FollowUpStatus.NO_ANSWER)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${followUp.status === FollowUpStatus.NO_ANSWER ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-400'}`}>Sans réponse</button>
                        </div>
                        <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-insan-blue/10 min-h-[60px] dark:text-white" placeholder="Note d'échange..." value={comment} onChange={(e) => setComment(e.target.value)} />
                    </div>
                </div>
            </div>
        </Card>
    );
};

const StudentDetailPanel = ({ student, stats, isModal = false }: { student: User, stats: any, isModal?: boolean }) => {
    return (
        <Card className={`p-8 animate-fade-in border-insan-blue/20 bg-gradient-to-br from-blue-50/50 to-white dark:from-slate-800 dark:to-slate-900 shadow-inner border-l-4 border-l-insan-blue rounded-3xl ${isModal ? 'my-0 border-0' : 'my-2'}`}>
            <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="relative">
                    <img src={student.avatar} className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white dark:border-slate-700 shadow-xl" alt={student.name}/>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <Badge color={stats.rate >= 80 ? 'green' : 'red'}>{stats.rate}% Assiduité</Badge>
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{student.name}</h3>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center justify-center md:justify-start gap-2">
                           <UserCircle size={14}/> ID: {student.id.padStart(10, '0')}
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 py-2">
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Présences</p>
                            <p className="text-lg font-black text-green-500">{stats.present}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Retards</p>
                            <p className="text-lg font-black text-orange-500">{stats.late}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Absences</p>
                            <p className="text-lg font-black text-red-500">{stats.absent}</p>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-center md:justify-start pt-2">
                        <button className="p-2.5 bg-white dark:bg-slate-900 text-slate-400 hover:text-insan-blue rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all"><Mail size={16}/></button>
                        <button className="p-2.5 bg-white dark:bg-slate-900 text-slate-400 hover:text-insan-blue rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all"><Phone size={16}/></button>
                        <button className="p-2.5 bg-white dark:bg-slate-900 text-slate-400 hover:text-insan-blue rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all"><History size={16}/></button>
                        <Button size="sm" variant="secondary" className="px-5 rounded-xl text-xs">Dossier complet</Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

// --- MAIN COMPONENT ---

const StudentTracking: React.FC<StudentTrackingProps> = ({ users, attendance, courses, followUpRecords = [], onUpdateFollowUp = () => {}, onNavigateToStats = (_poleId: string, _classId: string) => {} }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'classes' | 'trombi' | 'followup'>('classes');
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [focusedStudentId, setFocusedStudentId] = useState<string | null>(null);

    // 1. Calcul des alertes d'absentéisme (3+ absences)
    const allAlerts = useMemo(() => {
        return users.filter(u => u.role === UserRole.STUDENT).map(student => {
            const { count, absenceDetails } = getConsecutiveAbsences(student.id, attendance);
            const course = courses.find(c => c.id === student.classId);
            const courseId = student.classId || 'unknown';
            const existing = followUpRecords.find(f => f.studentId === student.id && f.courseId === courseId);
            const followUp: FollowUpRecord = existing || {
                id: `${student.id}-${courseId}`,
                studentId: student.id,
                courseId: courseId,
                status: FollowUpStatus.TO_CONTACT,
                lastActionDate: new Date().toISOString(),
                history: []
            };
            return { student, consecutiveAbsences: count, absenceDetails, followUp, courseName: course?.name || 'Classe inconnue' };
        }).filter(item => item.consecutiveAbsences >= 3);
    }, [users, attendance, courses, followUpRecords]);

    // 2. Statistiques de charge
    const stats = useMemo(() => {
        const total = allAlerts.length;
        const toContact = allAlerts.filter(i => i.followUp.status === FollowUpStatus.TO_CONTACT).length;
        const contacted = allAlerts.filter(i => i.followUp.status === FollowUpStatus.CONTACTED).length;
        const noAnswer = allAlerts.filter(i => i.followUp.status === FollowUpStatus.NO_ANSWER).length;
        const progress = total > 0 ? Math.round(((contacted + noAnswer) / total) * 100) : 100;
        return { total, toContact, contacted, noAnswer, progress };
    }, [allAlerts]);

    // 3. Filtrage
    const filteredStudents = useMemo(() => {
        return users.filter(u => u.role === UserRole.STUDENT).filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 courses.find(c => c.id === u.classId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesClass = !selectedClassId || u.classId === selectedClassId;
            return matchesSearch && matchesClass;
        });
    }, [users, searchTerm, courses, selectedClassId]);

    const filteredAlerts = useMemo(() => {
        return allAlerts.filter(i => 
            i.student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            i.courseName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allAlerts, searchTerm]);

    const handleSelectClass = (classId: string) => {
        setSelectedClassId(classId);
        setFocusedStudentId(null);
        setSearchTerm('');
    };

    const resetClassFilter = () => {
        setSelectedClassId(null);
        setFocusedStudentId(null);
    };

    const selectedCourse = useMemo(() => courses.find(c => c.id === selectedClassId), [courses, selectedClassId]);
    const classStats = useMemo(() => selectedClassId ? getClassStats(selectedClassId, users, attendance) : null, [selectedClassId, users, attendance]);

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <PageHeader 
                title={selectedClassId ? `Pilotage : ${selectedCourse?.name}` : "Suivi des Étudiants"} 
                subtitle={
                    selectedClassId ? "Vue détaillée de l'assiduité par élève." :
                    activeTab === 'classes' ? "Vue d'ensemble de l'assiduité par classe." :
                    activeTab === 'trombi' ? "Annuaire complet et statistiques individuelles." :
                    "Gestion des alertes d'absentéisme (3+ absences)."
                }
                action={
                    selectedClassId ? (
                        <div className="flex gap-2">
                             <button 
                                onClick={() => { 
                                    if(selectedCourse) onNavigateToStats(selectedCourse.pole, selectedCourse.id);
                                }} 
                                className="bg-gradient-to-r from-insan-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-xl shadow-orange-500/30 border-0 px-8 py-3 rounded-2xl flex items-center gap-3 group transition-all transform hover:scale-[1.02] active:scale-95"
                            >
                                <BarChart3 size={22} className="group-hover:rotate-12 transition-transform" />
                                <span className="font-black text-sm uppercase tracking-widest">Analyses Statistiques</span>
                                <ExternalLink size={14} className="opacity-50" />
                            </button>
                            <Button variant="secondary" size="sm" onClick={resetClassFilter} className="rounded-2xl border-slate-200 px-6" icon={<ArrowLeft size={16}/>}>Retour</Button>
                        </div>
                    ) : (
                        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto max-w-[90vw]">
                            <button onClick={() => setActiveTab('classes')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'classes' ? 'bg-insan-blue text-white shadow-md' : 'text-slate-500'}`}><BookOpen size={14}/> Vue Classes</button>
                            <button onClick={() => setActiveTab('trombi')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'trombi' ? 'bg-insan-blue text-white shadow-md' : 'text-slate-500'}`}><LayoutGrid size={14}/> Trombinoscope</button>
                            <button onClick={() => setActiveTab('followup')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'followup' ? 'bg-insan-blue text-white shadow-md' : 'text-slate-500'}`}><AlertCircle size={14}/> Suivi Absences {stats.toContact > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 rounded-full">{stats.toContact}</span>}</button>
                        </div>
                    )
                }
            />

            {!selectedClassId && (
                <Card className="p-4 shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                        <input type="text" placeholder={activeTab === 'classes' ? "Rechercher une classe..." : activeTab === 'trombi' ? "Rechercher un élève..." : "Rechercher une alerte..."} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold focus:ring-2 focus:ring-insan-blue/10 dark:text-white transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </Card>
            )}

            {/* --- AFFICHAGE SELON ÉTAT --- */}

            {selectedClassId ? (
                /* --- VUE FOCUS CLASSE --- */
                <div className="space-y-8 animate-fade-in">
                    {/* EN-TÊTE STATISTIQUES CLASSE */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="p-5 border-l-4 border-insan-blue bg-blue-50/20 dark:bg-blue-900/10 shadow-sm">
                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Présence Moyenne</p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">{classStats?.avgPresence}%</p>
                        </Card>
                        <Card className="p-5 border-l-4 border-red-500 bg-red-50/20 dark:bg-red-900/10 shadow-sm">
                            <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">Taux d'absence</p>
                            <p className="text-3xl font-black text-red-600">{classStats?.avgAbsence}%</p>
                        </Card>
                        <Card className="p-5 border-l-4 border-insan-orange bg-orange-50/20 dark:bg-orange-900/10 shadow-sm">
                            <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">Taux de Retard</p>
                            <p className="text-3xl font-black text-orange-600">{classStats?.avgLate}%</p>
                        </Card>
                        <Card className="p-5 border-l-4 border-green-500 bg-green-50/20 dark:bg-green-900/10 shadow-sm">
                            <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-1">Effectif Total</p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">{classStats?.totalStudents} Élèves</p>
                        </Card>
                    </div>

                    {/* LISTE DES ÉLÈVES */}
                    <div className="space-y-3">
                        <div className="flex items-center px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
                            <div className="w-14"></div>
                            <div className="flex-1 ml-4">Fiche Étudiant</div>
                            <div className="w-64 px-4 text-center">Taux Assiduité</div>
                            <div className="w-48 grid grid-cols-3 text-center">
                                <span>P</span>
                                <span>R</span>
                                <span>A</span>
                            </div>
                            <div className="w-10"></div>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            {filteredStudents.map(student => {
                                const sStats = getStudentStats(student.id, selectedClassId, attendance);
                                const isFocused = focusedStudentId === student.id;
                                return (
                                    <React.Fragment key={student.id}>
                                        <div 
                                            onClick={() => setFocusedStudentId(isFocused ? null : student.id)}
                                            className={`flex items-center p-4 rounded-3xl border-2 transition-all cursor-pointer group hover:shadow-xl ${
                                                isFocused 
                                                ? 'bg-insan-blue border-insan-blue text-white shadow-xl shadow-blue-900/20' 
                                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-insan-blue/20'
                                            }`}
                                        >
                                            <div className="relative shrink-0">
                                                <img src={student.avatar} className={`w-12 h-12 rounded-2xl object-cover border-2 transition-all ${isFocused ? 'border-white/50' : 'border-slate-100 dark:border-slate-700 shadow-sm'}`} alt={student.name} />
                                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[7px] font-black text-white shadow-lg ${sStats.rate >= 90 ? 'bg-green-500' : sStats.rate >= 75 ? 'bg-orange-500' : 'bg-red-500'}`}>
                                                    {sStats.rate}%
                                                </div>
                                            </div>

                                            <div className="flex-1 ml-4 overflow-hidden">
                                                <h4 className={`text-sm font-black truncate leading-tight ${isFocused ? 'text-white' : 'text-slate-800 dark:text-white group-hover:text-insan-blue transition-colors'}`}>{student.name}</h4>
                                                <p className={`text-[10px] font-bold uppercase tracking-tight ${isFocused ? 'text-blue-200' : 'text-slate-400'}`}>Matricule: {student.id.padStart(8, '0')}</p>
                                            </div>

                                            <div className="hidden md:flex w-64 px-4 flex-col gap-1.5">
                                                <div className={`h-2 w-full rounded-full overflow-hidden shadow-inner ${isFocused ? 'bg-white/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                                    <div className={`h-full transition-all duration-1000 ${sStats.rate >= 80 ? 'bg-green-500' : sStats.rate >= 50 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${sStats.rate}%` }}></div>
                                                </div>
                                                <div className="flex justify-between items-center text-[9px] font-black uppercase opacity-60">
                                                    <span className="flex items-center gap-1"><TrendingUp size={10}/> Performance</span>
                                                    <span>{sStats.rate}%</span>
                                                </div>
                                            </div>

                                            <div className="w-48 grid grid-cols-3 gap-2 px-4 text-center">
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-black ${isFocused ? 'text-white' : 'text-green-500'}`}>{sStats.present}</span>
                                                    <span className={`text-[8px] font-bold uppercase opacity-60`}>Prés</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-black ${isFocused ? 'text-white' : 'text-orange-500'}`}>{sStats.late}</span>
                                                    <span className={`text-[8px] font-bold uppercase opacity-60`}>Ret</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-black ${isFocused ? 'text-white' : 'text-red-500'}`}>{sStats.absent}</span>
                                                    <span className={`text-[8px] font-bold uppercase opacity-60`}>Abs</span>
                                                </div>
                                            </div>

                                            <div className="w-10 flex justify-center text-slate-300 group-hover:text-insan-blue transition-colors">
                                                {isFocused ? <ChevronDown size={22} className="text-white animate-bounce-slow" /> : <ChevronRight size={22} />}
                                            </div>
                                        </div>
                                        
                                        {isFocused && (
                                            <div className="px-4 pb-2 animate-fade-in origin-top">
                                                <StudentDetailPanel student={student} stats={sStats} />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : activeTab === 'classes' ? (
                /* --- VUE GRILLE DES CLASSES --- */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {courses.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(course => {
                        const cStats = getClassStats(course.id, users, attendance);
                        return (
                            <Card key={course.id} className="p-0 overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer border-2 border-transparent hover:border-insan-blue/10 flex flex-col" onClick={() => handleSelectClass(course.id)}>
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-insan-blue dark:text-blue-400 group-hover:bg-insan-blue group-hover:text-white transition-colors">
                                            <BookOpen size={24}/>
                                        </div>
                                        <Badge color={cStats.avgPresence >= 80 ? 'green' : 'orange'}>
                                            {cStats.avgPresence}% Présence
                                        </Badge>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1 group-hover:text-insan-blue transition-colors">{course.name}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{course.pole}</p>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Effectif</p>
                                            <p className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                                <UsersIcon size={16} className="text-insan-blue"/> {cStats.totalStudents}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Absences Moy.</p>
                                            <p className="text-xl font-black text-red-500">{cStats.avgAbsence}%</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between group-hover:bg-insan-blue/5 transition-colors">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Gérer les élèves</span>
                                    <ArrowRight size={16} className="text-slate-300 group-hover:text-insan-blue group-hover:translate-x-1 transition-all"/>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : activeTab === 'trombi' ? (
                /* --- VUE TROMBINOSCOPE AVEC CLIC PROFIL --- */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in relative">
                    {filteredStudents.map(student => {
                        const stats = getStudentStats(student.id, student.classId || '', attendance);
                        const course = courses.find(c => c.id === student.classId);
                        return (
                            <Card 
                                key={student.id} 
                                onClick={() => setFocusedStudentId(student.id)}
                                className="p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group border-2 border-transparent hover:border-insan-blue/20 cursor-pointer bg-white dark:bg-slate-900"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative mb-4">
                                        <img src={student.avatar} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white dark:border-slate-800 shadow-lg group-hover:scale-110 transition-transform duration-500" alt={student.name} />
                                        <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-2xl flex items-center justify-center text-white font-black text-[10px] shadow-lg ${stats.rate >= 90 ? 'bg-green-500' : stats.rate >= 75 ? 'bg-orange-500' : 'bg-red-500'}`}>
                                            {stats.rate}%
                                        </div>
                                    </div>
                                    <h3 className="font-black text-slate-800 dark:text-white text-lg leading-tight group-hover:text-insan-blue transition-colors">{student.name}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 mb-4">{course?.name || 'Sans classe'}</p>
                                    
                                    <div className="grid grid-cols-3 gap-2 w-full pt-4 border-t border-slate-50 dark:border-slate-800">
                                        <div className="flex flex-col"><span className="text-xs font-black text-slate-800 dark:text-white">{stats.present}</span><span className="text-[8px] font-bold text-slate-400 uppercase">Prés.</span></div>
                                        <div className="flex flex-col"><span className="text-xs font-black text-slate-800 dark:text-white">{stats.late}</span><span className="text-[8px] font-bold text-slate-400 uppercase">Ret.</span></div>
                                        <div className="flex flex-col"><span className="text-xs font-black text-red-500">{stats.absent}</span><span className="text-[8px] font-bold text-slate-400 uppercase">Abs.</span></div>
                                    </div>

                                    <div className="flex gap-2 w-full mt-5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-insan-blue rounded-xl transition-colors"><Mail size={14} className="mx-auto"/></button>
                                        <button className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-insan-blue rounded-xl transition-colors"><Phone size={14} className="mx-auto"/></button>
                                        <button className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-insan-blue rounded-xl transition-colors"><History size={14} className="mx-auto"/></button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}

                    {/* MODALE DE PROFIL POUR TROMBINOSCOPE */}
                    {focusedStudentId && (
                        <div 
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in"
                            onClick={() => setFocusedStudentId(null)}
                        >
                            <div 
                                className="w-full max-w-2xl relative"
                                onClick={e => e.stopPropagation()}
                            >
                                <button 
                                    onClick={() => setFocusedStudentId(null)}
                                    className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                                >
                                    <X size={24}/>
                                </button>
                                {(() => {
                                    const student = users.find(u => u.id === focusedStudentId);
                                    if (!student) return null;
                                    const stats = getStudentStats(student.id, student.classId || '', attendance);
                                    return <StudentDetailPanel student={student} stats={stats} isModal={true} />;
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* --- VUE SUIVI DES ABSENCES --- */
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="p-5 border-l-4 border-insan-orange bg-orange-50/30 dark:bg-orange-900/10 shadow-sm">
                            <p className="text-[10px] font-black text-orange-700 dark:text-orange-400 uppercase tracking-widest">À contacter</p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{stats.toContact}</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold flex items-center gap-1"><PhoneCall size={10}/> Urgence moyenne</p>
                        </Card>
                        <Card className="p-5 border-l-4 border-red-500 bg-red-50/30 dark:bg-red-900/10 shadow-sm">
                            <p className="text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-widest">Sans réponse</p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{stats.noAnswer}</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold flex items-center gap-1"><AlertTriangle size={10}/> Rappels prioritaires</p>
                        </Card>
                        <Card className="p-5 border-l-4 border-green-500 bg-green-50/30 dark:bg-green-900/10 shadow-sm">
                            <p className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest">Dossiers clos</p>
                            <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-1">{stats.contacted}</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold flex items-center gap-1"><CheckCircle size={10}/> Success stories</p>
                        </Card>
                        <Card className="p-5 flex flex-col justify-between shadow-sm">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Résolution</p>
                                    <span className="text-[10px] font-black text-insan-blue">{stats.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full bg-insan-blue dark:bg-blue-500" style={{ width: `${stats.progress}%` }}></div>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 flex items-center gap-1"><ListTodo size={10}/> {stats.total} total alertes</p>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {filteredAlerts.length === 0 ? (
                            <div className="py-20 text-center text-slate-400 italic bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center">
                                <CheckCircle size={48} className="text-green-500 mb-4 opacity-20" />
                                Aucun étudiant en situation de décrochage critique (3+ absences).
                            </div>
                        ) : (
                            filteredAlerts.map(item => (
                                <FollowUpItem 
                                    key={item.student.id} 
                                    {...item} 
                                    onUpdate={onUpdateFollowUp} 
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentTracking;