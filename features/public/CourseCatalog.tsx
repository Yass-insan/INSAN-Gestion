
import React, { useState } from 'react';
import { Card, Badge, Button } from '../../components/ui/DesignSystem';
import { Course, RegistrationDossier, RegistrationStatus, CourseFormula } from '../../types';
import { Search, PlayCircle, Building2, Clock, BookOpen, ArrowRight, AlertCircle, X, CheckCircle2, UserCircle2, GraduationCap, ListChecks, Target } from 'lucide-react';

interface CourseCatalogProps {
    mode: 'remote' | 'on-site';
    courses: Course[];
    dossiers: RegistrationDossier[];
    onRegister: (courseId: string) => void;
}

const CourseCatalog: React.FC<CourseCatalogProps> = ({ mode, courses, dossiers, onRegister }) => {
    const [search, setSearch] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const isCourseFull = (courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return false;
        const capacity = course.capacity || 20;
        const occupied = dossiers
            .filter(d => d.status !== RegistrationStatus.CANCELLED)
            .reduce((acc, d) => {
                const count = d.enrollments.filter(e => 
                    e.courseId === courseId && 
                    e.status !== RegistrationStatus.CANCELLED &&
                    (e.formula === CourseFormula.ON_SITE || e.formula === CourseFormula.HYBRID)
                ).length;
                return acc + count;
            }, 0);
        return occupied >= capacity;
    };

    const filtered = courses.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.pole.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-fade-in min-h-screen pb-32 pt-16 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <Badge color={mode === 'remote' ? 'blue' : 'orange'} className="mb-6 px-4 py-2">
                        {mode === 'remote' ? <PlayCircle size={14}/> : <Building2 size={14}/>}
                        {mode === 'remote' ? 'FORMATIONS EN LIGNE' : 'FORMATIONS À LYON (GERLAND)'}
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-8 leading-none">
                        Cultivez votre <br/> <span className="text-insan-blue dark:text-blue-400">Excellence.</span>
                    </h1>
                    <div className="max-w-xl mx-auto relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-insan-blue transition-colors" size={24}/>
                        <input 
                            type="text" 
                            placeholder="Rechercher un cursus..." 
                            className="w-full pl-16 pr-8 py-6 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-insan-blue/20 rounded-[2.5rem] outline-none font-bold text-lg shadow-xl transition-all dark:text-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filtered.map(course => {
                        const full = isCourseFull(course.id);

                        return (
                            <Card key={course.id} className="p-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 border-0 flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2.5rem]">
                                <div className="h-64 overflow-hidden relative">
                                    <img src={course.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={course.name} />
                                    <div className="absolute top-6 right-6">
                                        <Badge color={full ? 'red' : 'green'} className="shadow-lg backdrop-blur-md">
                                            {full ? 'COMPLET' : 'INSCRIPTIONS OUVERTES'}
                                        </Badge>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                        <button 
                                            onClick={() => setSelectedCourse(course)}
                                            className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-insan-orange hover:text-white transition-all shadow-xl"
                                        >
                                            En savoir plus <ArrowRight size={14}/>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-10 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-4 leading-tight group-hover:text-insan-blue transition-colors">{course.name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-3 mb-8 leading-relaxed">
                                        {course.description}
                                    </p>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-10 mt-auto">
                                        <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                            <Clock size={16} className="text-insan-orange"/> {course.schedule.split(' ')[0]}
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                            <BookOpen size={16} className="text-insan-blue"/> {course.level || 'Tous niveaux'}
                                        </div>
                                    </div>

                                    <button 
                                        disabled={full}
                                        onClick={() => onRegister(course.id)}
                                        className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-xl ${full ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-insan-blue text-white hover:bg-blue-900 shadow-blue-500/20 active:scale-95'}`}
                                    >
                                        {full ? <AlertCircle size={18}/> : <ArrowRight size={18}/>}
                                        {full ? 'INSCRIPTIONS CLOSES' : 'S\'INSCRIRE'}
                                    </button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* DETAIL MODAL */}
            {selectedCourse && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 animate-fade-in">
                    <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row bg-white dark:bg-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-0 rounded-[3rem]">
                        <button onClick={() => setSelectedCourse(null)} className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors z-10 backdrop-blur-md">
                            <X size={24}/>
                        </button>

                        <div className="md:w-2/5 relative h-64 md:h-auto shrink-0">
                            <img src={selectedCourse.imageUrl} className="w-full h-full object-cover" alt={selectedCourse.name} />
                            <div className="absolute inset-0 bg-gradient-to-t from-insan-blue/80 to-transparent"></div>
                            <div className="absolute bottom-10 left-10 text-white space-y-4">
                                <Badge color="orange">{selectedCourse.pole}</Badge>
                                <h2 className="text-4xl font-black tracking-tighter leading-none">{selectedCourse.name}</h2>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-12">
                            {/* OBJECTIFS */}
                            <section>
                                <h4 className="text-xs font-black text-insan-orange uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                    <Target size={18}/> Objectifs de la formation
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {selectedCourse.objectives?.map((obj, i) => (
                                        <div key={i} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <CheckCircle2 className="text-emerald-500 shrink-0" size={20}/>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{obj}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* PROGRAMME */}
                            <section>
                                <h4 className="text-xs font-black text-insan-orange uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                    <ListChecks size={18}/> Programme détaillé
                                </h4>
                                <div className="space-y-4">
                                    {selectedCourse.curriculum?.map((module, i) => (
                                        <div key={i} className="p-6 border-l-4 border-insan-blue bg-white dark:bg-slate-800 shadow-sm rounded-r-2xl">
                                            <h5 className="font-black text-slate-800 dark:text-white mb-1">{module.title}</h5>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{module.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* PRÉREQUIS & AUDIENCE */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                                    <h5 className="font-black text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-2"><UserCircle2 size={16}/> Public Visé</h5>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{selectedCourse.audience}</p>
                                </div>
                                <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                                    <h5 className="font-black text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-2"><GraduationCap size={16}/> Prérequis</h5>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{selectedCourse.prerequisites}</p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <button 
                                    disabled={isCourseFull(selectedCourse.id)}
                                    onClick={() => { onRegister(selectedCourse.id); setSelectedCourse(null); }}
                                    className="px-12 py-5 bg-insan-orange text-white rounded-[2rem] font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
                                >
                                    S'inscrire maintenant <ArrowRight size={24}/>
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default CourseCatalog;
