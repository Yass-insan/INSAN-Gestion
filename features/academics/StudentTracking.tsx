import React, { useState, useMemo } from 'react';
import { User, Course, AttendanceRecord, UserRole, FollowUpRecord, FollowUpStatus, AttendanceStatus, FollowUpAction, RegistrationDossier, Homework } from '../../types';
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
    X,
    FileText,
    Inbox,
    Archive,
    Save,
    RotateCcw
} from 'lucide-react';

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

const FollowUpItem = ({ student, consecutiveAbsences, absenceDetails, followUp, courseName, onUpdate, onOpenProfile }: any) => {
    const [comment, setComment] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<FollowUpStatus>(followUp.status);

    const handleConfirmValidation = () => {
        if (selectedStatus === FollowUpStatus.TO_CONTACT && !comment.trim()) {
            alert("Veuillez choisir un nouveau statut (Contacté ou Sans réponse) avant de valider.");
            return;
        }

        const newAction: FollowUpAction = { 
            id: Date.now().toString(), 
            date: new Date().toISOString(), 
            status: selectedStatus, 
            comment: comment || (selectedStatus === FollowUpStatus.NO_ANSWER ? "Tentative d'appel infructueuse" : "Échange validé avec succès"), 
            performedBy: 'Staff' 
        };
        
        const updatedRecord: FollowUpRecord = { 
            ...followUp, 
            status: selectedStatus, 
            lastActionDate: new Date().toISOString(), 
            history: [newAction, ...followUp.history] 
        };
        
        onUpdate(updatedRecord);
        setComment('');
    };

    const isToContact = followUp.status === FollowUpStatus.TO_CONTACT;
    const isNoAnswer = followUp.status === FollowUpStatus.NO_ANSWER;
    const isArchived = followUp.status === FollowUpStatus.CONTACTED;

    return (
        <Card className={`p-0 overflow-hidden border-l-8 animate-fade-in transition-all ${
            isArchived ? 'border-l-slate-200 dark:border-l-slate-700 opacity-90' : 
            isNoAnswer ? 'border-l-red-500 shadow-lg shadow-red-500/5' :
            'border-l-insan-orange shadow-lg shadow-orange-500/5'
        }`}>
            <div className="flex flex-col lg:flex-row">
                {/* Volet Infos Élève (Cliquable pour voir profil) */}
                <div 
                    className="p-6 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer group/profile"
                    onClick={() => onOpenProfile(student.id)}
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                            <img src={student.avatar} className="w-16 h-16 rounded-2xl border-2 border-white dark:border-slate-700 shadow-sm group-hover/profile:scale-105 transition-transform" alt={student.name} />
                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm border border-slate-100 dark:border-slate-700">
                                <Search size={10} className="text-insan-blue"/>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 dark:text-white leading-tight group-hover/profile:text-insan-blue transition-colors">{student.name}</h3>
                            <p className="text-[10px] font-bold text-insan-blue dark:text-blue-400 uppercase tracking-wider">{courseName}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Cliquez pour voir profil</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm" onClick={e => e.stopPropagation()}>
                        <p className="text-[9px] font-black text-red-500 uppercase mb-2 flex items-center gap-1">
                            <AlertTriangle size={10}/> {consecutiveAbsences} Absences détectées
                        </p>
                        <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                            {absenceDetails.map((abs: any) => (
                                <div key={abs.id} className="flex justify-between items-center text-[10px] p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                                    <span className="font-bold text-slate-500">{new Date(abs.date).toLocaleDateString()}</span>
                                    <Badge color={abs.status === 'JUSTIFIED' ? 'blue' : 'red'}>{abs.status === 'JUSTIFIED' ? 'Justifié' : 'Absent'}</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Volet Actions de Suivi */}
                <div className="p-6 flex-1 flex flex-col justify-between bg-white dark:bg-slate-900">
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                                    <HeartHandshake size={16} className="text-insan-blue"/> 
                                    {isArchived ? "Détails du dossier clos" : 
                                     isNoAnswer ? "Relance : Famille injoignable" : 
                                     "Action requise : Premier contact"}
                                </h4>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
                                    {isArchived ? `Traité le ${new Date(followUp.lastActionDate).toLocaleDateString()}` : "Étape 1 : Quel est le résultat de l'appel ?"}
                                </p>
                            </div>
                            {isArchived && <Badge color="green" icon={<CheckCircle size={10}/>}>CONTACT ÉTABLI</Badge>}
                            {isNoAnswer && <Badge color="red" icon={<AlertCircle size={10}/>}>SANS RÉPONSE</Badge>}
                        </div>

                        {!isArchived ? (
                            <>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setSelectedStatus(FollowUpStatus.CONTACTED)} 
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all flex items-center justify-center gap-2 ${selectedStatus === FollowUpStatus.CONTACTED ? 'bg-green-50 border-green-500 text-green-700 shadow-md scale-[1.02]' : 'bg-white dark:bg-slate-800 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                    >
                                        <CheckCircle size={14}/> Famille Jointe
                                    </button>
                                    <button 
                                        onClick={() => setSelectedStatus(FollowUpStatus.NO_ANSWER)} 
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all flex items-center justify-center gap-2 ${selectedStatus === FollowUpStatus.NO_ANSWER ? 'bg-red-50 border-red-500 text-red-700 shadow-md scale-[1.02]' : 'bg-white dark:bg-slate-800 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                    >
                                        <XCircle size={14}/> Sans Réponse
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Étape 2 : Notez le retour de la famille</p>
                                    <textarea 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-insan-blue/20 min-h-[80px] dark:text-white" 
                                        placeholder="Notez ici les raisons de l'absence ou le motif du non-décrochage..." 
                                        value={comment} 
                                        onChange={(e) => setComment(e.target.value)} 
                                    />
                                </div>
                                <div className="pt-2">
                                    <button 
                                        onClick={handleConfirmValidation}
                                        disabled={selectedStatus === FollowUpStatus.TO_CONTACT}
                                        className="w-full bg-insan-blue text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 hover:bg-blue-900 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        <Save size={16}/> Valider et Déplacer dans le flux
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Historique du dernier échange :</p>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic">
                                        "{followUp.history[0]?.comment || "Dossier clôturé sans commentaire particulier."}"
                                    </p>
                                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase">
                                        <span>Par: {followUp.history[0]?.performedBy}</span>
                                        <button 
                                            onClick={() => {
                                                if(window.confirm("Ré-ouvrir le dossier de suivi pour cet élève ?")) {
                                                    onUpdate({ ...followUp, status: FollowUpStatus.TO_CONTACT });
                                                }
                                            }}
                                            className="text-insan-blue hover:underline flex items-center gap-1"
                                        >
                                            <RotateCcw size={10}/> Ré-ouvrir le dossier
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

const StudentDetailPanel = ({ student, stats, dossiers, isModal = false, onNavigateToDossier, courses }: { student: User, stats: any, dossiers: RegistrationDossier[], isModal?: boolean, onNavigateToDossier?: (id: string) => void, courses: Course[] }) => {
    
    const handleViewDossier = () => {
        if (!onNavigateToDossier) return;
        const dossier = dossiers.find(d => d.students.some(s => s.id === student.id));
        if (dossier) {
            onNavigateToDossier(dossier.id);
        } else {
            alert("Aucun dossier d'inscription trouvé pour cet élève.");
        }
    };

    const studentCourses = courses.filter(c => 
        dossiers.some(d => d.students.some(s => s.id === student.id) && d.enrollments.some(e => e.studentId === student.id && e.courseId === c.id))
    );

    return (
        <Card className={`p-8 animate-fade-in border-insan-blue/20 bg-gradient-to-br from-blue-50/50 to-white dark:from-slate-800 dark:to-slate-900 shadow-inner border-l-4 border-l-insan-blue rounded-[2.5rem] ${isModal ? 'my-0 border-0 shadow-2xl' : 'my-2'}`}>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative shrink-0 mx-auto md:mx-0">
                    <img src={student.avatar} className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white dark:border-slate-700 shadow-xl" alt={student.name}/>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap scale-90">
                        <Badge color={stats.rate >= 80 ? 'green' : 'red'}>{stats.rate}% Assiduité</Badge>
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left space-y-5">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{student.name}</h3>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                             <Badge color="gray" icon={<UserCircle size={12}/>}>ID: {student.id.substring(student.id.length - 6).toUpperCase()}</Badge>
                             <Badge color="blue" icon={<BookOpen size={12}/>}>{studentCourses.length} Cours actifs</Badge>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Présences</p>
                            <p className="text-lg font-black text-green-500">{stats.present}</p>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Retards</p>
                            <p className="text-lg font-black text-orange-500">{stats.late}</p>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Absences</p>
                            <p className="text-lg font-black text-red-500">{stats.absent}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Inscrit aux cours :</p>
                        <div className="flex flex-wrap gap-2">
                            {studentCourses.map(c => (
                                <span key={c.id} className="text-[10px] font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{c.name}</span>
                            ))}
                            {studentCourses.length === 0 && <p className="text-xs text-slate-400 italic">Aucun cours trouvé.</p>}
                        </div>
                    </div>

                    <div className="flex gap-2 justify-center md:justify-start pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button className="p-3 bg-white dark:bg-slate-900 text-slate-400 hover:text-insan-blue rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all"><Mail size={16}/></button>
                        <button className="p-3 bg-white dark:bg-slate-900 text-slate-400 hover:text-insan-blue rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all"><Phone size={16}/></button>
                        <Button 
                            variant="primary" 
                            className="px-6 rounded-xl text-xs flex items-center gap-2"
                            onClick={handleViewDossier}
                        >
                            <FileText size={14}/> Dossier de scolarité
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

// --- MAIN COMPONENT ---

interface StudentTrackingProps {
    users: User[];
    courses: Course[];
    attendance: AttendanceRecord[];
    dossiers: RegistrationDossier[];
    followUpRecords?: FollowUpRecord[];
    onUpdateFollowUp?: (record: FollowUpRecord) => void;
    onNavigateToStats?: (poleId: string, classId: string) => void;
    onNavigateToDossier?: (id: string) => void;
    homework?: Homework[];
    currentUser?: User;
    onManageUsers?: (action: 'add' | 'update' | 'delete', updatedUser: User) => void;
}

const StudentTracking: React.FC<StudentTrackingProps> = ({ users, attendance, courses, dossiers, followUpRecords = [], onUpdateFollowUp = () => {}, onNavigateToStats = (_poleId: string, _classId: string) => {}, onNavigateToDossier }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'classes' | 'trombi' | 'followup'>('classes');
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [focusedStudentId, setFocusedStudentId] = useState<string | null>(null);
    
    // Triple Flux de Suivi
    const [followUpFilter, setFollowUpFilter] = useState<'TO_CONTACT' | 'NO_ANSWER' | 'ARCHIVED'>('TO_CONTACT');

    // 1. Calcul des alertes d'absentéisme (3+ absences consécutives)
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
            
            return { 
                student, 
                consecutiveAbsences: count, 
                absenceDetails, 
                followUp, 
                courseName: course?.name || 'Classe inconnue' 
            };
        }).filter(item => item.consecutiveAbsences >= 3);
    }, [users, attendance, courses, followUpRecords]);

    // 2. Statistiques du workflow
    const stats = useMemo(() => {
        const total = allAlerts.length;
        const toContact = allAlerts.filter(i => i.followUp.status === FollowUpStatus.TO_CONTACT).length;
        const noAnswer = allAlerts.filter(i => i.followUp.status === FollowUpStatus.NO_ANSWER).length;
        const archived = allAlerts.filter(i => i.followUp.status === FollowUpStatus.CONTACTED).length;
        const progress = total > 0 ? Math.round((archived / total) * 100) : 100;
        return { total, toContact, noAnswer, archived, progress };
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
        return allAlerts.filter(i => {
            const matchesSearch = i.student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 i.courseName.toLowerCase().includes(searchTerm.toLowerCase());
            
            let matchesStatus = false;
            if (followUpFilter === 'TO_CONTACT') matchesStatus = i.followUp.status === FollowUpStatus.TO_CONTACT;
            if (followUpFilter === 'NO_ANSWER') matchesStatus = i.followUp.status === FollowUpStatus.NO_ANSWER;
            if (followUpFilter === 'ARCHIVED') matchesStatus = i.followUp.status === FollowUpStatus.CONTACTED;
            
            return matchesSearch && matchesStatus;
        });
    }, [allAlerts, searchTerm, followUpFilter]);

    const handleSelectClass = (classId: string) => {
        setSelectedClassId(classId);
        setFocusedStudentId(null);
        setSearchTerm('');
    };

    const resetClassFilter = () => {
        setSelectedClassId(null);
        setFocusedStudentId(null);
    };

    // Gestion de l'ouverture du profil rapide
    const openQuickProfile = (studentId: string) => {
        setFocusedStudentId(studentId);
        // Si on est dans le suivi, on reste dans le suivi mais on affiche la modale
        // Si on est ailleurs, idem.
    };

    const selectedCourse = useMemo(() => courses.find(c => c.id === selectedClassId), [courses, selectedClassId]);
    const classStats = useMemo(() => selectedClassId ? getClassStats(selectedClassId, users, attendance) : null, [selectedClassId, users, attendance]);

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <PageHeader 
                title={selectedClassId ? `Suivi : ${selectedCourse?.name}` : "Portail Étudiants"} 
                subtitle={
                    selectedClassId ? "Pilotage fin de l'assiduité de la classe." :
                    activeTab === 'classes' ? "Vue globale par promotion et pôle." :
                    activeTab === 'trombi' ? "Annuaire visuel et fiches rapides." :
                    "Traitement des décrochages (3+ absences)."
                }
                action={
                    selectedClassId ? (
                        <div className="flex gap-2">
                             <button 
                                onClick={() => { 
                                    if(selectedCourse) onNavigateToStats(selectedCourse.pole, selectedCourse.id);
                                }} 
                                className="bg-insan-orange hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 border-0 px-8 py-3 rounded-2xl flex items-center gap-3 group transition-all"
                            >
                                <BarChart3 size={20} className="group-hover:rotate-12 transition-transform" />
                                <span className="font-black text-sm uppercase tracking-widest">Statistiques</span>
                            </button>
                            <Button variant="secondary" size="sm" onClick={resetClassFilter} className="rounded-2xl px-6" icon={<ArrowLeft size={16}/>}>Retour</Button>
                        </div>
                    ) : (
                        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto max-w-[90vw]">
                            <button onClick={() => setActiveTab('classes')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'classes' ? 'bg-insan-blue text-white shadow-md' : 'text-slate-500'}`}><BookOpen size={14}/> Classes</button>
                            <button onClick={() => setActiveTab('trombi')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'trombi' ? 'bg-insan-blue text-white shadow-md' : 'text-slate-500'}`}><LayoutGrid size={14}/> Trombi</button>
                            <button onClick={() => setActiveTab('followup')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'followup' ? 'bg-insan-blue text-white shadow-md' : 'text-slate-500'}`}><AlertCircle size={14}/> Suivi Absences {stats.toContact > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 rounded-full animate-pulse">{stats.toContact}</span>}</button>
                        </div>
                    )
                }
            />

            {!selectedClassId && (
                <Card className="p-4 shadow-sm border-0">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                        <input type="text" placeholder={activeTab === 'classes' ? "Rechercher une classe..." : activeTab === 'trombi' ? "Rechercher un élève..." : "Rechercher un dossier de suivi..."} className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-insan-blue/10 dark:text-white transition-all shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </Card>
            )}

            {/* --- CONTENU --- */}

            {selectedClassId ? (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="p-5 border-l-4 border-insan-blue bg-blue-50/20 dark:bg-blue-900/10 shadow-sm">
                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Présence Moyenne</p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">{classStats?.avgPresence}%</p>
                        </Card>
                        <Card className="p-5 border-l-4 border-red-500 bg-red-50/20 dark:bg-red-900/10 shadow-sm">
                            <p className="text-[10px] font-black text-red-600 dark:text-blue-400 uppercase tracking-widest mb-1">Taux d'absence</p>
                            <p className="text-3xl font-black text-red-600">{classStats?.avgAbsence}%</p>
                        </Card>
                        <Card className="p-5 border-l-4 border-insan-orange bg-orange-50/20 dark:bg-orange-900/10 shadow-sm">
                            <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">Taux de Retard</p>
                            <p className="text-3xl font-black text-orange-600">{classStats?.avgLate}%</p>
                        </Card>
                        <Card className="p-5 border-l-4 border-green-500 bg-green-50/20 dark:bg-green-900/10 shadow-sm">
                            <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-1">Effectif</p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">{classStats?.totalStudents} Élèves</p>
                        </Card>
                    </div>

                    <div className="space-y-3">
                        {filteredStudents.map(student => {
                            const sStats = getStudentStats(student.id, selectedClassId, attendance);
                            const isFocused = focusedStudentId === student.id;
                            return (
                                <React.Fragment key={student.id}>
                                    <div 
                                        onClick={() => openQuickProfile(student.id)}
                                        className={`flex items-center p-4 rounded-[2rem] border-2 transition-all cursor-pointer group hover:shadow-xl ${
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
                                            <p className={`text-[10px] font-bold uppercase tracking-tight ${isFocused ? 'text-blue-200' : 'text-slate-400'}`}>Matricule: {student.id.substring(student.id.length-8).toUpperCase()}</p>
                                        </div>
                                        <div className="hidden md:flex w-64 px-4 flex-col gap-1.5">
                                            <div className={`h-2 w-full rounded-full overflow-hidden shadow-inner ${isFocused ? 'bg-white/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                                <div className={`h-full transition-all duration-1000 ${sStats.rate >= 80 ? 'bg-green-500' : sStats.rate >= 50 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${sStats.rate}%` }}></div>
                                            </div>
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase opacity-60"><span>Score Assiduité</span><span>{sStats.rate}%</span></div>
                                        </div>
                                        <div className="w-10 flex justify-center text-slate-300 group-hover:text-insan-blue transition-colors">
                                            {isFocused ? <ChevronDown size={22} className="text-white" /> : <ChevronRight size={22} />}
                                        </div>
                                    </div>
                                    {isFocused && (
                                        <div className="px-4 pb-2 animate-fade-in origin-top">
                                            <StudentDetailPanel student={student} stats={sStats} dossiers={dossiers} onNavigateToDossier={onNavigateToDossier} courses={courses} />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            ) : activeTab === 'classes' ? (
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
                                            <p className="text-xl font-black text-slate-800 dark:text-white">{cStats.totalStudents}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Absences</p>
                                            <p className="text-xl font-black text-red-500">{cStats.avgAbsence}%</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between group-hover:bg-insan-blue/5 transition-colors">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Accéder au suivi</span>
                                    <ArrowRight size={16} className="text-slate-300 group-hover:text-insan-blue group-hover:translate-x-1 transition-all"/>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : activeTab === 'trombi' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in relative">
                    {filteredStudents.map(student => {
                        const stats = getStudentStats(student.id, student.classId || '', attendance);
                        const course = courses.find(c => c.id === student.classId);
                        return (
                            <Card 
                                key={student.id} 
                                onClick={() => openQuickProfile(student.id)}
                                className="p-6 hover:shadow-2xl transition-all duration-300 group border-2 border-transparent hover:border-insan-blue/20 cursor-pointer bg-white dark:bg-slate-900 rounded-[2rem]"
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
                                        <div className="flex flex-col"><span className="text-xs font-black text-slate-800 dark:text-white">{stats.present}</span><span className="text-[8px] font-bold text-slate-400 uppercase">P</span></div>
                                        <div className="flex flex-col"><span className="text-xs font-black text-slate-800 dark:text-white">{stats.late}</span><span className="text-[8px] font-bold text-slate-400 uppercase">R</span></div>
                                        <div className="flex flex-col"><span className="text-xs font-black text-red-500">{stats.absent}</span><span className="text-[8px] font-bold text-slate-400 uppercase">A</span></div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}

                    {/* MODALE DE PROFIL RAPIDE (UTILISÉE PARTOUT) */}
                    {focusedStudentId && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setFocusedStudentId(null)}>
                            <div className="w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
                                <button onClick={() => setFocusedStudentId(null)} className="absolute -top-12 right-0 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"><X size={24}/></button>
                                {(() => {
                                    const student = users.find(u => u.id === focusedStudentId);
                                    if (!student) return null;
                                    const stats = getStudentStats(student.id, student.classId || '', attendance);
                                    return <StudentDetailPanel student={student} stats={stats} dossiers={dossiers} isModal={true} onNavigateToDossier={onNavigateToDossier} courses={courses} />;
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* --- VUE SUIVI DES ABSENCES (TRIPLE FLUX) --- */
                <div className="space-y-8 animate-fade-in">
                    {/* KPIs WORKFLOW */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="p-5 border-l-4 border-insan-orange bg-orange-50/30 dark:bg-orange-900/10 shadow-sm">
                            <p className="text-[10px] font-black text-orange-700 dark:text-orange-400 uppercase tracking-widest">Inbox : À Traiter</p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{stats.toContact}</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold flex items-center gap-1"><PhoneCall size={10}/> Appels prioritaires</p>
                        </Card>
                        <Card className="p-5 border-l-4 border-red-500 bg-red-50/30 dark:bg-red-900/10 shadow-sm">
                            <p className="text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-widest">Sans Réponse</p>
                            <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-1">{stats.noAnswer}</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold flex items-center gap-1"><AlertTriangle size={10}/> Relances à prévoir</p>
                        </Card>
                        <Card className="p-5 border-l-4 border-green-500 bg-green-50/30 dark:bg-green-900/10 shadow-sm">
                            <p className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest">Dossiers Clos</p>
                            <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-1">{stats.archived}</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold flex items-center gap-1"><CheckCircle size={10}/> Familles jointes</p>
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
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 flex items-center gap-1"><ListTodo size={10}/> {stats.total} alertes actives</p>
                        </Card>
                    </div>

                    {/* BARRE DE PILOTAGE DU FLUX */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm w-full md:w-auto overflow-x-auto">
                            <button 
                                onClick={() => setFollowUpFilter('TO_CONTACT')}
                                className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 whitespace-nowrap ${followUpFilter === 'TO_CONTACT' ? 'bg-insan-blue text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                            >
                                <Inbox size={16}/> Inbox ({stats.toContact})
                            </button>
                            <button 
                                onClick={() => setFollowUpFilter('NO_ANSWER')}
                                className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 whitespace-nowrap ${followUpFilter === 'NO_ANSWER' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                            >
                                <XCircle size={16}/> Sans Réponse ({stats.noAnswer})
                            </button>
                            <button 
                                onClick={() => setFollowUpFilter('ARCHIVED')}
                                className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 whitespace-nowrap ${followUpFilter === 'ARCHIVED' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                            >
                                <Archive size={16}/> Archivés ({stats.archived})
                            </button>
                        </div>

                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                            <input 
                                type="text" 
                                placeholder="Rechercher un dossier..." 
                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-insan-blue/10 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* LISTE DES ALERTES FILTRÉES */}
                    <div className="space-y-6">
                        {filteredAlerts.length === 0 ? (
                            <div className="py-24 text-center text-slate-400 italic bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle size={40} className="text-green-500 opacity-20" />
                                </div>
                                <p className="font-black text-lg text-slate-300 uppercase tracking-[0.2em]">Flux vide</p>
                                <p className="text-sm mt-2 font-medium">Tout est en ordre dans cette catégorie.</p>
                            </div>
                        ) : (
                            filteredAlerts.map(item => (
                                <FollowUpItem 
                                    key={item.student.id} 
                                    {...item} 
                                    onUpdate={onUpdateFollowUp} 
                                    onOpenProfile={openQuickProfile}
                                />
                            ))
                        )}
                    </div>

                    {/* MODALE DE PROFIL POUR LE SUIVI */}
                    {focusedStudentId && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setFocusedStudentId(null)}>
                            <div className="w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
                                <button onClick={() => setFocusedStudentId(null)} className="absolute -top-12 right-0 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"><X size={24}/></button>
                                {(() => {
                                    const student = users.find(u => u.id === focusedStudentId);
                                    if (!student) return null;
                                    const stats = getStudentStats(student.id, student.classId || '', attendance);
                                    return <StudentDetailPanel student={student} stats={stats} dossiers={dossiers} isModal={true} onNavigateToDossier={onNavigateToDossier} courses={courses} />;
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentTracking;