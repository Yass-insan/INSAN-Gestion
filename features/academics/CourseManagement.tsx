import React, { useState, useMemo } from 'react';
import { Course, User, Pole, InstituteSettings, UserRole, Room, RegistrationDossier, CourseFormula, RegistrationStatus } from '../../types';
import { Card, Button, Badge, PageHeader, useToast } from '../../components/ui/DesignSystem';
import { 
    Plus, 
    X, 
    Edit2, 
    Trash2, 
    Clock, 
    BookOpen, 
    Monitor, 
    Users, 
    Save, 
    Layers,
    Palette,
    Check,
    AlertTriangle
} from 'lucide-react';

interface CourseManagementProps {
  courses: Course[];
  users: User[];
  poles: Pole[];
  dossiers: RegistrationDossier[];
  settings?: InstituteSettings;
  currentUser?: User;
  onManage: (action: 'add' | 'update' | 'delete', course: Course) => void;
  onManagePoles: (action: 'add' | 'update' | 'delete', pole: Pole) => void;
}

const CourseManagement: React.FC<CourseManagementProps> = ({ courses, users, poles, dossiers, settings, currentUser, onManage, onManagePoles }) => {
    // UI State
    const [activeTab, setActiveTab] = useState<'planning' | 'poles'>('planning');
    const { showToast } = useToast();

    const isResponsible = currentUser?.role === UserRole.RESPONSIBLE || currentUser?.secondaryRoles?.includes(UserRole.RESPONSIBLE);

    // Filtrage initial par rôle (Responsable de pôle)
    const accessiblePoles = useMemo(() => {
        if (currentUser?.role === UserRole.ADMIN) return poles;
        if (isResponsible) {
            return poles.filter(p => currentUser.managedPoleIds?.includes(p.id));
        }
        return poles;
    }, [poles, currentUser, isResponsible]);

    const accessibleCourses = useMemo(() => {
        if (currentUser?.role === UserRole.ADMIN) return courses;
        if (isResponsible) {
            return courses.filter(c => currentUser.managedPoleIds?.includes(c.pole));
        }
        return courses;
    }, [courses, currentUser, isResponsible]);
    
    // Course Modal State
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [newCourse, setNewCourse] = useState<Partial<Course>>({});
    
    // Pole Modal State
    const [isPoleModalOpen, setIsPoleModalOpen] = useState(false);
    const [editingPole, setEditingPole] = useState<Pole | null>(null);
    const [newPole, setNewPole] = useState<Partial<Pole>>({ color: '#262262' });

    // Error & Confirmation States
    const [formError, setFormError] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'course' | 'pole' | null, item: any }>({ type: null, item: null });

    // Planning States
    const [planningMode, setPlanningMode] = useState<'by-day' | 'by-room' | 'global'>('global');
    const [selectedDayIdx, setSelectedDayIdx] = useState(new Date().getDay()); 
    const [selectedRoomName, setSelectedRoomName] = useState<string>('');
    const [zoomLevel, setZoomLevel] = useState(1); // 0.5 to 1.5

    const days = [
        { label: 'Dimanche', id: 0 }, { label: 'Lundi', id: 1 }, { label: 'Mardi', id: 2 },
        { label: 'Mercredi', id: 3 }, { label: 'Jeudi', id: 4 }, { label: 'Vendredi', id: 5 },
        { label: 'Samedi', id: 6 }
    ];

    const professors = users.filter(u => u.role === UserRole.PROFESSOR || u.secondaryRoles?.includes(UserRole.PROFESSOR));
    const rooms = settings?.rooms || [];

    // Initialize selectedRoomName if empty
    if (!selectedRoomName && rooms.length > 0) {
        setSelectedRoomName(rooms[0].name);
    }

    // --- GRID GEOMETRY ---
    const START_HOUR = 8;
    const END_HOUR = 21;
    const BASE_HOUR_HEIGHT = 60; 
    const HOUR_HEIGHT = BASE_HOUR_HEIGHT * zoomLevel;

    const courseInstances = useMemo(() => {
        const instances: { course: Course; startTime: string; endTime: string; dayOfWeek: number; id: string }[] = [];
        accessibleCourses.forEach(c => {
            // Add primary schedule
            instances.push({ course: c, startTime: c.startTime, endTime: c.endTime, dayOfWeek: c.dayOfWeek, id: `${c.id}-0` });
            // Add extra schedules
            if (c.schedules) {
                c.schedules.forEach((s, idx) => {
                    instances.push({ course: c, startTime: s.startTime, endTime: s.endTime, dayOfWeek: s.dayOfWeek, id: `${c.id}-${idx + 1}` });
                });
            }
        });
        return instances;
    }, [accessibleCourses]);

    const calculatePosition = (startTime: string, endTime: string) => {
        const timeToMin = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };
        const startMin = timeToMin(startTime);
        const endMin = timeToMin(endTime);
        const dayStartMin = START_HOUR * 60;
        return {
            top: ((startMin - dayStartMin) / 60) * HOUR_HEIGHT,
            height: ((endMin - startMin) / 60) * HOUR_HEIGHT
        };
    };

    const getPhysicalOccupancy = (courseId: string) => {
        return dossiers
            .filter(d => d.status !== RegistrationStatus.CANCELLED)
            .reduce((total, d) => {
                const count = d.enrollments.filter(e => 
                    e.courseId === courseId && 
                    e.status !== RegistrationStatus.CANCELLED &&
                    (e.formula === CourseFormula.ON_SITE || e.formula === CourseFormula.HYBRID)
                ).length;
                return total + count;
            }, 0);
    };

    // --- HANDLERS COURS ---
    const openEditCourse = (course: Course) => {
        setEditingCourse(course);
        setNewCourse({ ...course, schedules: course.schedules || [] });
        setIsCourseModalOpen(true);
    };

    const handleSaveCourse = () => {
        if (!newCourse.name || !newCourse.pole) {
            setFormError("Veuillez remplir au moins le nom et le pôle.");
            return;
        }
        setFormError(null);

        const schedules = newCourse.schedules || [];
        const firstDayLabel = days.find(d => d.id === (newCourse.dayOfWeek ?? 1))?.label;
        let scheduleLabel = `${firstDayLabel} ${newCourse.startTime}-${newCourse.endTime}`;
        
        if (schedules.length > 0) {
            scheduleLabel += ` (+${schedules.length} créneaux)`;
        }

        const courseData: Course = {
            id: editingCourse?.id || Date.now().toString(),
            name: newCourse.name,
            professorIds: newCourse.professorIds || [],
            schedule: scheduleLabel,
            dayOfWeek: newCourse.dayOfWeek ?? 1,
            startTime: newCourse.startTime || '09:00',
            endTime: newCourse.endTime || '10:00',
            room: newCourse.room || (rooms[0]?.name || 'Salle A'),
            pole: newCourse.pole,
            level: newCourse.level || 'Général',
            recurrenceType: newCourse.recurrenceType || 'WEEKLY',
            capacity: newCourse.capacity || 20,
            schedules: schedules
        };
        onManage(editingCourse ? 'update' : 'add', courseData);
        showToast(editingCourse ? "Cours mis à jour !" : "Nouveau cours créé !", "success");
        setIsCourseModalOpen(false);
        setEditingCourse(null);
    };

    const addSchedule = () => {
        const currentSchedules = newCourse.schedules || [];
        setNewCourse({
            ...newCourse,
            schedules: [
                ...currentSchedules,
                { dayOfWeek: newCourse.dayOfWeek ?? 1, startTime: '14:00', endTime: '15:30' }
            ]
        });
    };

    const removeSchedule = (index: number) => {
        const currentSchedules = newCourse.schedules || [];
        setNewCourse({
            ...newCourse,
            schedules: currentSchedules.filter((_, i) => i !== index)
        });
    };

    const updateSchedule = (index: number, field: string, value: any) => {
        const currentSchedules = newCourse.schedules || [];
        const updated = currentSchedules.map((s, i) => {
            if (i === index) return { ...s, [field]: value };
            return s;
        });
        setNewCourse({ ...newCourse, schedules: updated });
    };

    // --- HANDLERS POLES ---
    const openEditPole = (pole: Pole) => {
        setEditingPole(pole);
        setNewPole({ ...pole });
        setIsPoleModalOpen(true);
    };

    const handleSavePole = () => {
        if (!newPole.name || !newPole.id) {
            setFormError("L'identifiant et le nom du pôle sont obligatoires.");
            return;
        }
        setFormError(null);
        const poleData: Pole = {
            id: newPole.id.toUpperCase().replace(/\s+/g, '_'),
            name: newPole.name,
            color: newPole.color || '#262262',
            managerIds: newPole.managerIds || []
        };
        onManagePoles(editingPole ? 'update' : 'add', poleData);
        showToast(editingPole ? "Pôle mis à jour !" : "Nouveau pôle créé !", "success");
        setIsPoleModalOpen(false);
        setEditingPole(null);
        setNewPole({ color: '#262262' });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <PageHeader 
                title="Académie" 
                subtitle="Gestion du catalogue de cours et des départements (pôles)."
                action={
                    <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                        <button 
                            onClick={() => setActiveTab('planning')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'planning' ? 'bg-insan-blue text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            <Monitor size={16}/> PLANNING & COURS
                        </button>
                        <button 
                            onClick={() => setActiveTab('poles')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'poles' ? 'bg-insan-blue text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            <Layers size={16}/> GESTION DES PÔLES
                        </button>
                    </div>
                }
            />

            {activeTab === 'planning' ? (
                <div className="space-y-10">
                    {/* PLANNING GRID */}
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm w-fit">
                                    <button 
                                        onClick={() => setPlanningMode('global')}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 ${planningMode === 'global' ? 'bg-insan-blue text-white shadow-sm' : 'text-slate-400'}`}
                                    >
                                        VUE GLOBALE
                                    </button>
                                    <button 
                                        onClick={() => setPlanningMode('by-day')}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 ${planningMode === 'by-day' ? 'bg-insan-blue text-white shadow-sm' : 'text-slate-400'}`}
                                    >
                                        PAR JOUR
                                    </button>
                                    <button 
                                        onClick={() => setPlanningMode('by-room')}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 ${planningMode === 'by-room' ? 'bg-insan-blue text-white shadow-sm' : 'text-slate-400'}`}
                                    >
                                        PAR SALLE
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <button onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400"><X size={14} className="rotate-45"/></button>
                                    <span className="text-[10px] font-black text-slate-500 w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                                    <button onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400"><Plus size={14}/></button>
                                </div>

                                {planningMode === 'by-day' && (
                                    <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-x-auto custom-scrollbar max-w-full">
                                        {days.map(d => (
                                            <button 
                                                key={d.id} 
                                                onClick={() => setSelectedDayIdx(d.id)}
                                                className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all whitespace-nowrap ${selectedDayIdx === d.id ? 'bg-insan-blue text-white shadow-sm' : 'text-slate-400'}`}
                                            >
                                                {d.label.substring(0,3).toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                {planningMode === 'by-room' && (
                                    <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-x-auto custom-scrollbar max-w-full">
                                        {rooms.map(room => (
                                            <button 
                                                key={room.name} 
                                                onClick={() => setSelectedRoomName(room.name)}
                                                className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all whitespace-nowrap ${selectedRoomName === room.name ? 'bg-insan-blue text-white shadow-sm' : 'text-slate-400'}`}
                                            >
                                                {room.name.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Button onClick={() => { setEditingCourse(null); setNewCourse({ professorIds: [], dayOfWeek: selectedDayIdx, startTime: '09:00', endTime: '10:30', capacity: 25 }); setIsCourseModalOpen(true); }} icon={<Plus size={18}/>}>
                                Nouveau Cours
                            </Button>
                        </div>

                        <Card className="overflow-x-auto border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] custom-scrollbar">
                            <div className="min-w-[1000px]">
                                <div className="flex bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-30">
                                <div className="w-16 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center sticky left-0 z-40"><Clock size={14} className="text-slate-300"/></div>
                                <div className="flex-1 flex overflow-x-auto custom-scrollbar">
                                    {planningMode === 'by-day' ? (
                                        rooms.map(room => (
                                            <div key={room.name} className="min-w-[180px] flex-1 p-4 text-center border-r border-slate-200 dark:border-slate-700 last:border-0 font-black text-[10px] text-insan-blue dark:text-blue-400 uppercase tracking-widest">{room.name}</div>
                                        ))
                                    ) : planningMode === 'by-room' ? (
                                        days.map(day => (
                                            <div key={day.id} className="min-w-[180px] flex-1 p-4 text-center border-r border-slate-200 dark:border-slate-700 last:border-0 font-black text-[10px] text-insan-blue dark:text-blue-400 uppercase tracking-widest">{day.label}</div>
                                        ))
                                    ) : (
                                        days.map(day => {
                                            const activeRooms = rooms.filter(room => 
                                                courseInstances.some(ci => ci.dayOfWeek === day.id && ci.course.room === room.name)
                                            );
                                            
                                            if (activeRooms.length === 0) return null;

                                            return (
                                                <div key={day.id} className="flex flex-col border-r border-slate-200 dark:border-slate-700 last:border-0">
                                                    <div className="p-2 text-center bg-insan-blue/5 dark:bg-blue-900/10 border-b border-slate-100 dark:border-slate-800 font-black text-[10px] text-insan-blue dark:text-blue-400 uppercase tracking-widest">{day.label}</div>
                                                    <div className="flex">
                                                        {activeRooms.map(room => (
                                                            <div key={room.name} className="min-w-[100px] p-2 text-center border-r border-slate-100 dark:border-slate-800 last:border-0 font-bold text-[8px] text-slate-400 uppercase">{room.name}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="flex relative overflow-y-auto max-h-[700px] custom-scrollbar">
                                <div className="w-16 shrink-0 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 sticky left-0 z-20">
                                    {Array.from({ length: (END_HOUR - START_HOUR) * 2 + 1 }).map((_, i) => {
                                        const hour = START_HOUR + Math.floor(i / 2);
                                        const min = (i % 2) * 30;
                                        const isFullHour = min === 0;
                                        return (
                                            <div key={i} style={{ height: HOUR_HEIGHT / 2 }} className={`flex items-start justify-center pt-1 border-b border-slate-100 dark:border-slate-800/50 text-[8px] font-black ${isFullHour ? 'text-slate-500' : 'text-slate-300'}`}>
                                                {isFullHour ? `${hour.toString().padStart(2, '0')}h` : `${hour.toString().padStart(2, '0')}h30`}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex-1 flex relative bg-white dark:bg-slate-900" style={{ minHeight: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT}px` }}>
                                    {planningMode === 'by-day' ? (
                                        rooms.map(room => (
                                            <div key={room.name} className="min-w-[180px] flex-1 border-r border-slate-50 dark:border-slate-800 last:border-0 relative">
                                                {courseInstances.filter(ci => ci.dayOfWeek === selectedDayIdx && ci.course.room === room.name).map(instance => {
                                                    const { top, height } = calculatePosition(instance.startTime, instance.endTime);
                                                    const pole = accessiblePoles.find(p => p.id === instance.course.pole);
                                                    return (
                                                        <div 
                                                            key={instance.id}
                                                            onClick={() => openEditCourse(instance.course)}
                                                            className="absolute inset-x-1 rounded-xl shadow-lg cursor-pointer hover:scale-[1.02] active:scale-95 transition-all p-2 flex flex-col justify-between border border-white/20 group overflow-hidden"
                                                            style={{ top: `${top}px`, height: `${height}px`, backgroundColor: pole?.color || '#262262', zIndex: 10 }}
                                                        >
                                                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                            <p className="text-[9px] font-black text-white leading-tight uppercase relative z-10 truncate">{instance.course.name}</p>
                                                            <p className="text-[8px] font-bold text-white/70 relative z-10">{instance.startTime} - {instance.endTime}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))
                                    ) : planningMode === 'by-room' ? (
                                        days.map(day => (
                                            <div key={day.id} className="min-w-[180px] flex-1 border-r border-slate-50 dark:border-slate-800 last:border-0 relative">
                                                {courseInstances.filter(ci => ci.dayOfWeek === day.id && ci.course.room === selectedRoomName).map(instance => {
                                                    const { top, height } = calculatePosition(instance.startTime, instance.endTime);
                                                    const pole = accessiblePoles.find(p => p.id === instance.course.pole);
                                                    return (
                                                        <div 
                                                            key={instance.id}
                                                            onClick={() => openEditCourse(instance.course)}
                                                            className="absolute inset-x-1 rounded-xl shadow-lg cursor-pointer hover:scale-[1.02] active:scale-95 transition-all p-2 flex flex-col justify-between border border-white/20 group overflow-hidden"
                                                            style={{ top: `${top}px`, height: `${height}px`, backgroundColor: pole?.color || '#262262', zIndex: 10 }}
                                                        >
                                                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                            <p className="text-[9px] font-black text-white leading-tight uppercase relative z-10 truncate">{instance.course.name}</p>
                                                            <p className="text-[8px] font-bold text-white/70 relative z-10">{instance.startTime} - {instance.endTime}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))
                                    ) : (
                                        days.map(day => {
                                            const activeRooms = rooms.filter(room => 
                                                courseInstances.some(ci => ci.dayOfWeek === day.id && ci.course.room === room.name)
                                            );
                                            
                                            if (activeRooms.length === 0) return null;

                                            return (
                                                <div key={day.id} className="flex border-r border-slate-200 dark:border-slate-700 last:border-0">
                                                    {activeRooms.map(room => (
                                                        <div key={room.name} className="min-w-[100px] border-r border-slate-50 dark:border-slate-800 last:border-0 relative">
                                                            {courseInstances.filter(ci => ci.dayOfWeek === day.id && ci.course.room === room.name).map(instance => {
                                                                const { top, height } = calculatePosition(instance.startTime, instance.endTime);
                                                                const pole = accessiblePoles.find(p => p.id === instance.course.pole);
                                                                return (
                                                                    <div 
                                                                        key={instance.id}
                                                                        onClick={() => openEditCourse(instance.course)}
                                                                        className="absolute inset-x-1 rounded-lg shadow-md cursor-pointer hover:scale-[1.02] active:scale-95 transition-all p-1 flex flex-col justify-between border border-white/20 group overflow-hidden"
                                                                        style={{ top: `${top}px`, height: `${height}px`, backgroundColor: pole?.color || '#262262', zIndex: 10 }}
                                                                    >
                                                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                                        <p className="text-[8px] font-black text-white leading-tight uppercase relative z-10 truncate">{instance.course.name}</p>
                                                                        <p className="text-[7px] font-bold text-white/70 relative z-10">{instance.startTime} - {instance.endTime}</p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                    {/* CATALOGUE CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                        {accessibleCourses.map(course => {
                            const pole = accessiblePoles.find(p => p.id === course.pole);
                            const occ = getPhysicalOccupancy(course.id);
                            return (
                                <Card key={course.id} className="p-8 border-2 border-slate-50 dark:border-slate-800 hover:border-insan-blue/20 transition-all cursor-pointer group" onClick={() => openEditCourse(course)}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-4 rounded-2xl" style={{ backgroundColor: `${pole?.color}15`, color: pole?.color }}><BookOpen size={28}/></div>
                                        <div className="flex gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); openEditCourse(course); }} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-insan-blue transition-colors"><Edit2 size={16}/></button>
                                            <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'course', item: course }); }} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 group-hover:text-insan-blue transition-colors">{course.name}</h3>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <Badge color="gray">{course.room}</Badge>
                                        <Badge color="blue">{pole?.name || course.pole}</Badge>
                                    </div>
                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                <Clock size={10}/> {days.find(d => d.id === course.dayOfWeek)?.label} {course.startTime}-{course.endTime}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{occ} / {course.capacity} places</span>
                                        </div>
                                        {course.schedules && course.schedules.length > 0 && (
                                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                {course.schedules.map((s, idx) => (
                                                    <span key={idx} className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                                        <Plus size={8}/> {days.find(d => d.id === s.dayOfWeek)?.label} {s.startTime}-{s.endTime}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* GESTION DES PÔLES */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fade-in">
                    <div className="lg:col-span-1">
                        <Card className="p-10 border-l-8 border-insan-blue bg-blue-50/20 dark:bg-blue-900/10">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-4"><Layers size={28} className="text-insan-blue"/> Nouveau Pôle</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Identifiant Unique (ID)</label>
                                    <input 
                                        className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-black text-sm outline-none focus:ring-2 focus:ring-insan-blue/20" 
                                        placeholder="EX: ADULTE_FRERE"
                                        value={newPole.id || ''}
                                        onChange={e => setNewPole({...newPole, id: e.target.value})}
                                        disabled={!!editingPole}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Nom du Pôle</label>
                                    <input 
                                        className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-black text-sm outline-none focus:ring-2 focus:ring-insan-blue/20" 
                                        placeholder="Ex: Pôle Enfance"
                                        value={newPole.name || ''}
                                        onChange={e => setNewPole({...newPole, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 flex items-center gap-2"><Palette size={12}/> Couleur d'identification</label>
                                    <div className="flex gap-4 items-center">
                                        <input 
                                            type="color" 
                                            className="w-16 h-16 rounded-2xl border-0 bg-transparent cursor-pointer"
                                            value={newPole.color || '#2563eb'}
                                            onChange={e => setNewPole({...newPole, color: e.target.value})}
                                        />
                                        <div className="flex-1 font-mono text-xs font-bold text-slate-400">{newPole.color?.toUpperCase()}</div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 flex items-center gap-2"><Users size={12}/> Responsables du Pôle</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                        {users.filter(u => u.role !== UserRole.STUDENT).map(u => {
                                            const isSelected = newPole.managerIds?.includes(u.id);
                                            return (
                                                <div 
                                                    key={u.id}
                                                    onClick={() => {
                                                        const current = newPole.managerIds || [];
                                                        setNewPole({
                                                            ...newPole,
                                                            managerIds: isSelected ? current.filter(id => id !== u.id) : [...current, u.id]
                                                        });
                                                    }}
                                                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${isSelected ? 'bg-blue-50 border-insan-blue dark:bg-blue-900/30' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
                                                >
                                                    <img src={u.avatar} alt="" className="w-6 h-6 rounded-full" />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{u.name}</span>
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase">{u.function || u.role}</span>
                                                    </div>
                                                    {isSelected && <Check size={14} className="ml-auto text-insan-blue" />}
                                                </div>
                                            );
                                        })}
                                        {users.filter(u => u.role !== UserRole.STUDENT).length === 0 && (
                                            <p className="text-[10px] text-slate-400 italic">Aucun utilisateur trouvé.</p>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <Button className="w-full py-5" onClick={handleSavePole}>
                                        {editingPole ? 'Mettre à jour' : 'Créer le pôle'}
                                    </Button>
                                    {editingPole && (
                                        <button onClick={() => { setEditingPole(null); setNewPole({ color: '#262262' }); }} className="w-full mt-4 text-xs font-bold text-slate-400 hover:underline">Annuler l'édition</button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center px-4">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider">Liste des Pôles Existants</h3>
                            <Badge color="gray">{poles.length} Pôles</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {accessiblePoles.map(p => (
                                <Card key={p.id} className="p-6 flex items-center justify-between group hover:shadow-xl transition-all border-l-8" style={{ borderLeftColor: p.color }}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-lg" style={{ backgroundColor: p.color }}>{p.name.charAt(0)}</div>
                                        <div>
                                            <p className="font-black text-slate-800 dark:text-white">{p.name}</p>
                                            <p className="text-[10px] font-mono text-slate-400 font-bold uppercase">{p.id}</p>
                                            {p.managerIds && p.managerIds.length > 0 && (
                                                <div className="flex -space-x-2 mt-1">
                                                    {p.managerIds.map(mid => {
                                                        const manager = users.find(u => u.id === mid);
                                                        if (!manager) return null;
                                                        return (
                                                            <img 
                                                                key={mid} 
                                                                src={manager.avatar} 
                                                                title={manager.name}
                                                                className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-800"
                                                                alt={manager.name}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditPole(p)} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-insan-blue"><Edit2 size={16}/></button>
                                        {currentUser?.role === UserRole.ADMIN && (
                                            <button onClick={() => setDeleteConfirm({ type: 'pole', item: p })} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL COURS (RESTAURÉ ET COMPLET) */}
            {isCourseModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-fade-in overflow-y-auto py-10">
                    <Card className="w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl rounded-[3rem] overflow-hidden">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-insan-blue text-white rounded-2xl shadow-lg"><BookOpen size={24}/></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white">{editingCourse ? 'Modifier le cours' : 'Nouveau cours'}</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Paramètres Académiques</p>
                                </div>
                            </div>
                            <button onClick={() => setIsCourseModalOpen(false)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500"><X/></button>
                        </div>

                        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {formError && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-bold animate-shake">
                                    <AlertTriangle size={16}/> {formError}
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Nom du cours</label>
                                    <input className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-black text-sm outline-none dark:text-white focus:ring-2 focus:ring-insan-blue/20" value={newCourse.name || ''} onChange={e => setNewCourse({...newCourse, name: e.target.value})} placeholder="Ex: Tafsir & Langue Arabe" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Pôle de rattachement</label>
                                    <select className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-black text-sm outline-none dark:text-white" value={newCourse.pole || ''} onChange={e => setNewCourse({...newCourse, pole: e.target.value})}>
                                        <option value="">-- Choisir un pôle --</option>
                                        {accessiblePoles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Salle</label>
                                    <select className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-black text-sm outline-none dark:text-white" value={newCourse.room || ''} onChange={e => setNewCourse({...newCourse, room: e.target.value})}>
                                        {rooms.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Jour</label>
                                    <select className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-black text-sm outline-none dark:text-white" value={newCourse.dayOfWeek || 0} onChange={e => setNewCourse({...newCourse, dayOfWeek: Number(e.target.value)})}>
                                        {days.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Début</label><input type="time" className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-black text-sm outline-none dark:text-white" value={newCourse.startTime || ''} onChange={e => setNewCourse({...newCourse, startTime: e.target.value})} /></div>
                                    <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Fin</label><input type="time" className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-black text-sm outline-none dark:text-white" value={newCourse.endTime || ''} onChange={e => setNewCourse({...newCourse, endTime: e.target.value})} /></div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Niveau</label>
                                    <input className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-black text-sm outline-none dark:text-white" value={newCourse.level || ''} onChange={e => setNewCourse({...newCourse, level: e.target.value})} placeholder="Débutant, Hifz..." />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Capacité Phys.</label>
                                    <div className="relative"><Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input type="number" className="w-full border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 bg-slate-50 dark:bg-slate-800 font-black text-sm outline-none dark:text-white" value={newCourse.capacity || 20} onChange={e => setNewCourse({...newCourse, capacity: Number(e.target.value)})} /></div>
                                </div>
                            </div>

                            {/* MULTIPLE SCHEDULES SECTION */}
                            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-center mb-6">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase">Horaires & Jours Supplémentaires</label>
                                    <Button variant="secondary" size="sm" onClick={addSchedule} icon={<Plus size={14}/>}>
                                        Ajouter un créneau
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {/* Primary Schedule (Read-only reference or just the first one) */}
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center gap-4 opacity-60">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black">1</div>
                                        <div className="flex-1 grid grid-cols-3 gap-4">
                                            <div className="text-xs font-black">{days.find(d => d.id === newCourse.dayOfWeek)?.label}</div>
                                            <div className="text-xs font-bold">{newCourse.startTime}</div>
                                            <div className="text-xs font-bold">{newCourse.endTime}</div>
                                        </div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase">Principal</div>
                                    </div>

                                    {/* Extra Schedules */}
                                    {newCourse.schedules?.map((s, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 flex items-center gap-4 animate-scale-in">
                                            <div className="w-8 h-8 rounded-full bg-insan-blue text-white flex items-center justify-center text-[10px] font-black">{idx + 2}</div>
                                            <div className="flex-1 grid grid-cols-3 gap-4">
                                                <select 
                                                    className="bg-transparent font-black text-xs outline-none"
                                                    value={s.dayOfWeek ?? 1}
                                                    onChange={e => updateSchedule(idx, 'dayOfWeek', Number(e.target.value))}
                                                >
                                                    {days.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                                                </select>
                                                <input 
                                                    type="time" 
                                                    className="bg-transparent font-bold text-xs outline-none"
                                                    value={s.startTime || ''}
                                                    onChange={e => updateSchedule(idx, 'startTime', e.target.value)}
                                                />
                                                <input 
                                                    type="time" 
                                                    className="bg-transparent font-bold text-xs outline-none"
                                                    value={s.endTime || ''}
                                                    onChange={e => updateSchedule(idx, 'endTime', e.target.value)}
                                                />
                                            </div>
                                            <button onClick={() => removeSchedule(idx)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                <X size={16}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-6 flex items-center justify-between">Assigner des Enseignants <Badge color="blue">{newCourse.professorIds?.length || 0}</Badge></label>
                                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {professors.map(p => {
                                        const isSel = newCourse.professorIds?.includes(p.id);
                                        return (
                                            <div key={p.id} onClick={() => {
                                                const current = newCourse.professorIds || [];
                                                setNewCourse({...newCourse, professorIds: isSel ? current.filter(id => id !== p.id) : [...current, p.id]});
                                            }} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${isSel ? 'bg-blue-50 border-insan-blue dark:bg-blue-900/30' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                                                <img src={p.avatar} className="w-8 h-8 rounded-full"/>
                                                <span className="text-xs font-black text-slate-700 dark:text-slate-200">{p.name}</span>
                                                {isSel && <Check size={14} className="ml-auto text-insan-blue"/>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => { setIsCourseModalOpen(false); setFormError(null); }}>Annuler</Button>
                            {editingCourse && (
                                <Button variant="danger" onClick={() => { setIsCourseModalOpen(false); setDeleteConfirm({ type: 'course', item: editingCourse }); }} icon={<Trash2 size={18}/>}>Supprimer</Button>
                            )}
                            <Button onClick={handleSaveCourse} icon={<Save size={18}/>}>Sauvegarder le cours</Button>
                        </div>
                    </Card>
                </div>
            )}
            {/* MODAL CONFIRMATION SUPPRESSION */}
            {deleteConfirm.type && (
                <div className="fixed inset-0 z-[200] flex items-start justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in overflow-y-auto py-10">
                    <Card className="w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl rounded-[2.5rem] overflow-hidden">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <Trash2 size={40}/>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Confirmer la suppression</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
                                    Êtes-vous sûr de vouloir supprimer {deleteConfirm.type === 'course' ? `le cours "${deleteConfirm.item?.name}"` : `le pôle "${deleteConfirm.item?.name}"`} ?
                                    Cette action est irréversible.
                                </p>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm({ type: null, item: null })}>Annuler</Button>
                                <Button variant="danger" className="flex-1" onClick={() => {
                                    if (deleteConfirm.type === 'course') {
                                        onManage('delete', deleteConfirm.item);
                                    } else {
                                        onManagePoles('delete', deleteConfirm.item);
                                    }
                                    setDeleteConfirm({ type: null, item: null });
                                }}>Supprimer</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default CourseManagement;