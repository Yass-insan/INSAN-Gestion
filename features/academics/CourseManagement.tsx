import React, { useState, useMemo } from 'react';
import { Course, User, Pole, InstituteSettings, UserRole } from '../../types';
import { Card, Button, Badge, PageHeader } from '../../components/ui/DesignSystem';
import { 
    Layers, 
    Plus, 
    X, 
    Edit2, 
    Trash2, 
    Clock, 
    Check, 
    BookOpen, 
    UserCheck,
    Calendar,
    Map,
    ChevronLeft,
    ChevronRight,
    Monitor,
    Maximize2,
    Palette
} from 'lucide-react';

interface CourseManagementProps {
  courses: Course[];
  users: User[];
  poles: Pole[];
  settings?: InstituteSettings;
  onManage: (action: 'add' | 'update' | 'delete', course: Course) => void;
  onManagePoles: (action: 'add' | 'delete', pole: Pole) => void;
}

const CourseManagement: React.FC<CourseManagementProps> = ({ courses, users, poles, settings, onManage, onManagePoles }) => {
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [newCourse, setNewCourse] = useState<Partial<Course>>({});
    
    // Pole Management States
    const [newPoleName, setNewPoleName] = useState('');
    const [selectedPoleColor, setSelectedPoleColor] = useState('#262262');
    
    // Colors Palette for Poles
    const POLE_COLORS = [
        { name: 'Bleu Insan', hex: '#262262' },
        { name: 'Orange Insan', hex: '#f7941d' },
        { name: 'Emeraude', hex: '#10b981' },
        { name: 'Indigo', hex: '#6366f1' },
        { name: 'Rose', hex: '#ec4899' },
        { name: 'Violet', hex: '#8b5cf6' },
        { name: 'Rouge', hex: '#ef4444' },
        { name: 'Ambre', hex: '#f59e0b' }
    ];
    
    // Planning States
    const [selectedDayIdx, setSelectedDayIdx] = useState(new Date().getDay()); 
    const days = [
        { label: 'Dimanche', id: 0 },
        { label: 'Lundi', id: 1 },
        { label: 'Mardi', id: 2 },
        { label: 'Mercredi', id: 3 },
        { label: 'Jeudi', id: 4 },
        { label: 'Vendredi', id: 5 },
        { label: 'Samedi', id: 6 }
    ];

    const professors = users.filter(u => u.role === UserRole.PROFESSOR);
    const rooms = settings?.rooms || ['Salle A', 'Salle B', 'Salle C', 'Bibliothèque'];

    // --- GEOMETRIC LOGIC ---
    const START_HOUR = 8;
    const END_HOUR = 21;
    const TOTAL_HOURS = END_HOUR - START_HOUR;
    const HOUR_HEIGHT = 50; 

    const timeToMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    const calculatePosition = (startTime: string, endTime: string) => {
        const startMin = timeToMinutes(startTime);
        const endMin = timeToMinutes(endTime);
        const dayStartMin = START_HOUR * 60;
        
        const top = ((startMin - dayStartMin) / 60) * HOUR_HEIGHT;
        const height = ((endMin - startMin) / 60) * HOUR_HEIGHT;
        
        return { top, height };
    };

    const planningData = useMemo(() => {
        return courses.filter(c => c.dayOfWeek === selectedDayIdx);
    }, [courses, selectedDayIdx]);

    // --- ACTIONS ---
    const openEditModal = (course: Course) => {
        setEditingCourse(course);
        setNewCourse({ ...course });
        setIsCourseModalOpen(true);
    };

    const handleSaveCourse = () => {
        if(newCourse.name) {
            const courseData: Course = {
                id: editingCourse ? editingCourse.id : Date.now().toString(),
                name: newCourse.name!,
                professorIds: newCourse.professorIds || [],
                schedule: `${days.find(d => d.id === (newCourse.dayOfWeek ?? 1))?.label} ${newCourse.startTime}-${newCourse.endTime}`,
                dayOfWeek: newCourse.dayOfWeek ?? 1,
                startTime: newCourse.startTime || '09:00',
                endTime: newCourse.endTime || '10:00',
                room: newCourse.room || (rooms[0] || 'Salle A'),
                pole: newCourse.pole || (poles[0]?.id || 'ADULTE'),
                level: newCourse.level,
                recurrenceType: newCourse.recurrenceType || 'WEEKLY',
                isManualAttendance: newCourse.isManualAttendance || false
            };
            onManage(editingCourse ? 'update' : 'add', courseData);
            setIsCourseModalOpen(false);
            setNewCourse({});
            setEditingCourse(null);
        }
    };

    const handleAddPole = () => {
        if (!newPoleName.trim()) return;
        const poleId = newPoleName.toUpperCase().replace(/\s+/g, '_');
        onManagePoles('add', { id: poleId, name: newPoleName, color: selectedPoleColor });
        setNewPoleName('');
    }

    const toggleProfessor = (profId: string) => {
        const currentIds = newCourse.professorIds || [];
        if (currentIds.includes(profId)) {
            setNewCourse({ ...newCourse, professorIds: currentIds.filter(id => id !== profId) });
        } else {
            setNewCourse({ ...newCourse, professorIds: [...currentIds, profId] });
        }
    };

    return (
       <div className="space-y-8 animate-fade-in pb-20">
           <PageHeader 
                title="Planning & Académique" 
                subtitle="Gérez l'occupation des salles et le catalogue des cours."
                action={
                    <Button onClick={() => { setEditingCourse(null); setNewCourse({ professorIds: [], recurrenceType: 'WEEKLY', isManualAttendance: false, dayOfWeek: 1 }); setIsCourseModalOpen(true); }} icon={<Plus size={18} />}>
                        Nouveau Cours
                    </Button>
                }
           />

           {/* 1. Pole Management (Updated with Color Picker) */}
           <Card className="p-8 bg-slate-900 text-white border-0 shadow-2xl overflow-hidden relative">
               <div className="absolute top-0 right-0 w-64 h-64 bg-insan-orange opacity-5 rounded-full blur-3xl -mr-32 -mt-32"></div>
               
               <div className="flex flex-col lg:flex-row gap-10 items-start relative z-10">
                   {/* Creation Form */}
                   <div className="flex-1 space-y-6">
                       <div>
                           <h3 className="font-black text-2xl flex items-center gap-3"><Layers className="text-insan-orange"/> Nouveau Pôle</h3>
                           <p className="text-sm text-slate-400 mt-1">Créez un département avec son identité propre.</p>
                       </div>
                       
                       <div className="space-y-4">
                           <input 
                                value={newPoleName} 
                                onChange={e => setNewPoleName(e.target.value)} 
                                placeholder="Nom du pôle (ex: Pôle Langues)" 
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-white/10 focus:ring-2 focus:ring-insan-orange/30 transition-all text-white" 
                           />
                           
                           <div className="space-y-3">
                               <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Palette size={12}/> Choisir une couleur</p>
                               <div className="flex flex-wrap gap-2">
                                   {POLE_COLORS.map(c => (
                                       <button 
                                            key={c.hex} 
                                            onClick={() => setSelectedPoleColor(c.hex)}
                                            className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${selectedPoleColor === c.hex ? 'ring-4 ring-white shadow-lg scale-110' : 'hover:scale-105 opacity-60 hover:opacity-100'}`}
                                            style={{ backgroundColor: c.hex }}
                                            title={c.name}
                                       >
                                           {selectedPoleColor === c.hex && <Check size={20} className="text-white"/>}
                                       </button>
                                   ))}
                               </div>
                           </div>
                           
                           <Button onClick={handleAddPole} className="w-full bg-insan-orange hover:bg-orange-600 border-0 py-4 rounded-2xl font-black">
                               CRÉER LE PÔLE
                           </Button>
                       </div>
                   </div>

                   {/* Active Poles List */}
                   <div className="lg:w-2/3">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Pôles actifs ({poles.length})</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {poles.map(p => (
                                <div key={p.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: p.color }}></div>
                                        <span className="font-bold text-sm">{p.name}</span>
                                    </div>
                                    <button onClick={() => onManagePoles('delete', p)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                        <X size={14}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                   </div>
               </div>
           </Card>

           {/* 2. MASTER PLANNING (COLORIZED) */}
           <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-end px-4 gap-4">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-4"><Monitor size={28} className="text-insan-blue dark:text-blue-400"/> Emploi du Temps Global</h3>
                        <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">Les couleurs correspondent aux pôles d'enseignement.</p>
                    </div>
                    
                    <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-x-auto">
                        {days.map(d => (
                            <button 
                                key={d.id} 
                                onClick={() => setSelectedDayIdx(d.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${selectedDayIdx === d.id ? 'bg-insan-blue text-white shadow-md' : 'text-slate-400 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            >
                                {d.label.substring(0, 3).toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <Card className="overflow-hidden border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-[2rem] transition-colors duration-300">
                    {/* Header: Salles (X axis) */}
                    <div className="flex bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                        <div className="w-16 shrink-0 border-r border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                            <Clock size={14} className="text-slate-400 dark:text-slate-500" />
                        </div>
                        <div className="flex-1 flex overflow-x-auto custom-scrollbar">
                            {rooms.map(room => (
                                <div key={room} className="min-w-[150px] flex-1 p-3 text-center border-r border-slate-200 dark:border-slate-700 last:border-0 bg-white dark:bg-slate-900 sticky top-0 z-10">
                                    <p className="text-[10px] font-black text-insan-blue dark:text-blue-400 uppercase tracking-widest">{room}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Body: Hours (Y axis) & Grid */}
                    <div className="flex relative overflow-y-auto max-h-[600px] custom-scrollbar">
                        <div className="w-16 shrink-0 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 relative z-20">
                            {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => (
                                <div key={i} style={{ height: HOUR_HEIGHT }} className="flex items-start justify-center pt-1 border-b border-slate-100 dark:border-slate-700/50">
                                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">{(START_HOUR + i).toString().padStart(2, '0')}h</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 flex relative bg-white dark:bg-slate-900">
                            <div className="absolute inset-0 pointer-events-none">
                                {Array.from({ length: TOTAL_HOURS * 2 }).map((_, i) => (
                                    <div key={i} style={{ height: HOUR_HEIGHT / 2 }} className="border-b border-slate-100/50 dark:border-slate-800 w-full"></div>
                                ))}
                            </div>

                            {rooms.map(room => (
                                <div key={room} className="min-w-[150px] flex-1 border-r border-slate-100 dark:border-slate-800 last:border-0 relative h-[650px]">
                                    {planningData.filter(c => c.room === room).map(course => {
                                        const { top, height } = calculatePosition(course.startTime, course.endTime);
                                        const pole = poles.find(p => p.id === course.pole);
                                        return (
                                            <div 
                                                key={course.id}
                                                onClick={() => openEditModal(course)}
                                                className="absolute inset-x-1.5 rounded-xl border border-white/20 shadow-xl cursor-pointer hover:scale-[1.03] active:scale-95 transition-all p-2 overflow-hidden group flex flex-col justify-between"
                                                style={{ 
                                                    top: `${top}px`, 
                                                    height: `${height}px`, 
                                                    backgroundColor: pole?.color || '#262262',
                                                    color: 'white',
                                                    zIndex: 10
                                                }}
                                            >
                                                <div className="overflow-hidden">
                                                    <p className="text-[8px] font-black uppercase mb-0.5 opacity-80">{pole?.name || 'Cours'}</p>
                                                    <p className="text-[10px] font-black leading-none truncate drop-shadow-sm">{course.name}</p>
                                                </div>
                                                <div className="flex justify-between items-end mt-1">
                                                    <p className="text-[8px] font-bold opacity-80 tracking-tighter leading-none">{course.startTime}</p>
                                                    <Maximize2 size={8} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
           </div>

           {/* 3. Catalog View (List with Themed Colors) */}
           <div className="space-y-6 pt-10">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-4 px-4"><BookOpen size={28} className="text-insan-orange"/> Catalogue des Cours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => {
                        const pole = poles.find(p => p.id === course.pole);
                        return (
                            <Card key={course.id} className="p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group border-2 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-insan-blue/5 dark:bg-blue-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform"></div>
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl group-hover:text-white transition-all shadow-inner" style={{ backgroundColor: pole?.color ? `${pole.color}15` : undefined, color: pole?.color || '#262262' }}>
                                        <BookOpen size={28}/>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEditModal(course)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-insan-blue dark:hover:text-blue-400 hover:shadow-md border border-slate-100 dark:border-slate-700 rounded-xl transition-all"><Edit2 size={16} /></button>
                                        <button onClick={() => onManage('delete', course)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:shadow-md border border-slate-100 dark:border-slate-700 rounded-xl transition-all"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                
                                <h3 className="font-black text-slate-800 dark:text-white text-lg mb-2 relative z-10 tracking-tight">{course.name}</h3>
                                <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mb-6 font-bold uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5"><Calendar size={12} className="text-insan-orange"/> {days.find(d => d.id === course.dayOfWeek)?.label}</div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1.5"><Clock size={12} className="text-insan-orange"/> {course.startTime} - {course.endTime}</div>
                                </div>
                                
                                <div className="flex gap-2 mb-6 flex-wrap relative z-10">
                                    <Badge color="gray" className="px-2 py-1 rounded-lg border-slate-200 dark:border-slate-700">{course.room}</Badge>
                                    <span 
                                        className="px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-black border"
                                        style={{ backgroundColor: `${pole?.color}15`, color: pole?.color, borderColor: `${pole?.color}30` }}
                                    >
                                        {pole?.name || course.pole}
                                    </span>
                                </div>
                                
                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between relative z-10">
                                    <div className="flex -space-x-3 overflow-hidden">
                                        {course.professorIds.length > 0 ? (
                                            course.professorIds.map(pid => {
                                                const prof = users.find(u => u.id === pid);
                                                return (
                                                    <img key={pid} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm object-cover" src={prof?.avatar} alt={prof?.name} title={prof?.name}/>
                                                );
                                            })
                                        ) : <span className="text-[10px] text-slate-300 dark:text-slate-600 font-black uppercase tracking-widest italic">Non assigné</span>}
                                    </div>
                                    <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-[0.2em]">{course.recurrenceType}</span>
                                </div>
                            </Card>
                        );
                    })}
                </div>
           </div>
           
           {/* COURSE MODAL */}
           {isCourseModalOpen && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4">
                   <Card className="w-full max-w-2xl animate-fade-in max-h-[90vh] overflow-y-auto rounded-[3rem] border-0 shadow-2xl bg-white dark:bg-slate-900">
                       <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                           <div>
                               <h3 className="font-black text-2xl text-slate-800 dark:text-white">{editingCourse ? 'Édition du Cours' : 'Nouveau Cours'}</h3>
                               <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Paramétrage académique</p>
                           </div>
                           <button onClick={() => setIsCourseModalOpen(false)} className="hover:bg-slate-200 dark:hover:bg-slate-700 p-3 rounded-2xl transition-all text-slate-500 dark:text-slate-400"><X size={24} /></button>
                       </div>
                       
                       <div className="p-10 space-y-8">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Nom du cours</label>
                                    <input placeholder="Ex: Sciences Islamiques" className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-black text-lg shadow-inner bg-slate-50/50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-insan-blue/5 dark:text-white outline-none transition-all" value={newCourse.name || ''} onChange={e => setNewCourse({...newCourse, name: e.target.value})} />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Jour</label>
                                    <select className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 dark:text-white font-bold shadow-sm" value={newCourse.dayOfWeek ?? 1} onChange={e => setNewCourse({...newCourse, dayOfWeek: Number(e.target.value)})}>
                                        {days.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Salle</label>
                                    <select className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 dark:text-white font-bold shadow-sm" value={newCourse.room || ''} onChange={e => setNewCourse({...newCourse, room: e.target.value})}>
                                        <option value="">Sélectionner...</option>
                                        {rooms.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Heure Début</label>
                                    <input type="time" className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-black shadow-sm bg-white dark:bg-slate-800 dark:text-white" value={newCourse.startTime || ''} onChange={e => setNewCourse({...newCourse, startTime: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Heure Fin</label>
                                    <input type="time" className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-black shadow-sm bg-white dark:bg-slate-800 dark:text-white" value={newCourse.endTime || ''} onChange={e => setNewCourse({...newCourse, endTime: e.target.value})} />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Pôle</label>
                                    <select className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 dark:text-white font-bold shadow-sm" value={newCourse.pole || ''} onChange={e => setNewCourse({...newCourse, pole: e.target.value})}>
                                        {poles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Récurrence</label>
                                    <select className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 dark:text-white font-bold shadow-sm" value={newCourse.recurrenceType || 'WEEKLY'} onChange={e => setNewCourse({...newCourse, recurrenceType: e.target.value as any})}>
                                        <option value="WEEKLY">Hebdomadaire</option>
                                        <option value="MONTHLY">Mensuel</option>
                                    </select>
                                </div>
                           </div>

                           <div className="bg-orange-50/50 dark:bg-orange-900/10 p-8 rounded-[2rem] border-2 border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
                               <div>
                                   <label className="block text-lg font-black text-orange-800 dark:text-orange-400">Appel manuel requis</label>
                                   <p className="text-xs text-orange-600 dark:text-orange-500 font-bold uppercase tracking-wider">Oblige le professeur à faire l'appel</p>
                               </div>
                               <button 
                                    onClick={() => setNewCourse({...newCourse, isManualAttendance: !newCourse.isManualAttendance})}
                                    className={`w-14 h-8 rounded-full transition-all relative shadow-inner ${newCourse.isManualAttendance ? 'bg-insan-orange' : 'bg-slate-300 dark:bg-slate-600'}`}
                               >
                                   <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow-md ${newCourse.isManualAttendance ? 'left-7' : 'left-1'}`}></div>
                               </button>
                           </div>

                           <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Enseignants</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar p-1">
                                    {professors.map(p => (
                                        <div 
                                            key={p.id} 
                                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${newCourse.professorIds?.includes(p.id) ? 'bg-insan-blue border-insan-blue text-white' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-insan-blue/20 dark:hover:border-blue-500/30'}`}
                                            onClick={() => toggleProfessor(p.id)}
                                        >
                                            <img src={p.avatar} className="w-10 h-10 rounded-xl object-cover"/>
                                            <span className={`font-black text-sm ${newCourse.professorIds?.includes(p.id) ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>{p.name}</span>
                                            {newCourse.professorIds?.includes(p.id) && <Check size={18} className="ml-auto"/>}
                                        </div>
                                    ))}
                                </div>
                           </div>

                           <Button onClick={handleSaveCourse} className="w-full py-6 bg-insan-blue text-white text-xl font-black rounded-[2rem] shadow-2xl hover:bg-blue-950 mt-6 active:scale-95 transition-all">
                               {editingCourse ? 'METTRE À JOUR' : 'CRÉER LE COURS'}
                           </Button>
                       </div>
                   </Card>
               </div>
           )}
       </div>
    );
};

export default CourseManagement;