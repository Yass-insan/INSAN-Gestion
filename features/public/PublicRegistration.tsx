
import React, { useState } from 'react';
import { Card, Button, Badge } from '../../components/ui/DesignSystem';
import { Course, CourseFormula, RegistrationDossier, RegistrationStatus, PricingSettings } from '../../types';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

interface PublicRegistrationProps {
    courses: Course[];
    dossiers: RegistrationDossier[];
    pricing: PricingSettings;
    onComplete: (dossier: RegistrationDossier) => void;
    onBack: () => void;
}

const PublicRegistration: React.FC<PublicRegistrationProps> = ({ courses, dossiers, pricing, onComplete, onBack }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', birthDate: '', email: '', phone: '', address: '', city: '', zipCode: '',
        selectedCourseId: '', formula: CourseFormula.ON_SITE
    });

    const isCourseFull = (cid: string) => {
        const course = courses.find(c => c.id === cid);
        if (!course) return false;
        const capacity = course.capacity || 20;
        const occupied = dossiers
            .filter(d => d.status !== RegistrationStatus.CANCELLED)
            .reduce((total, d) => {
                const count = d.enrollments.filter(e => 
                    e.courseId === cid && 
                    e.status !== RegistrationStatus.CANCELLED &&
                    (e.formula === CourseFormula.ON_SITE || e.formula === CourseFormula.HYBRID)
                ).length;
                return total + count;
            }, 0);
        return occupied >= capacity;
    };

    const handleFinish = () => {
        const studentId = `pub-${Date.now()}`;
        const newDossier: RegistrationDossier = {
            id: `doss-${Date.now()}`,
            status: RegistrationStatus.ACTIVE,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: 'Site Vitrine',
            firstName: formData.firstName, lastName: formData.lastName,
            email: formData.email, phone: formData.phone,
            address: formData.address, city: formData.city, zipCode: formData.zipCode,
            isMontessoriMandatory: false, dossierFees: pricing.dossierFees, montessoriFees: 0, autoDiscount: 0, multiChildDiscount: 0,
            installmentCount: 1, isInstallmentPlan: false, payments: [],
            students: [{ id: studentId, firstName: formData.firstName, lastName: formData.lastName, birthDate: formData.birthDate, genre: 'M' }],
            enrollments: [{ studentId, courseId: formData.selectedCourseId, formula: formData.formula, basePrice: 350, isVolunteerTeacher: false, status: RegistrationStatus.ACTIVE }],
            guardians: []
        };
        onComplete(newDossier);
        setStep(3);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-6">
            <div className="max-w-4xl mx-auto">
                {step < 3 && (
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-black text-xs uppercase mb-12 hover:text-insan-blue transition-colors">
                        <ArrowLeft size={16}/> Retour
                    </button>
                )}

                {step === 1 && (
                    <div className="animate-fade-in space-y-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Étape 1 : Choisir ma Formation</h2>
                            <p className="text-slate-500 font-medium">Sélectionnez le cursus que vous souhaitez rejoindre.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {courses.map(c => {
                                const full = isCourseFull(c.id);
                                return (
                                    <button 
                                        key={c.id} 
                                        disabled={full}
                                        onClick={() => setFormData({...formData, selectedCourseId: c.id})}
                                        className={`p-6 rounded-[2.5rem] border-2 text-left transition-all ${full ? 'opacity-40 grayscale cursor-not-allowed' : formData.selectedCourseId === c.id ? 'bg-insan-blue border-insan-blue text-white shadow-xl scale-[1.02]' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <BookOpen size={24} className={formData.selectedCourseId === c.id ? 'text-white/60' : 'text-insan-blue'}/>
                                            <Badge color={full ? 'red' : 'green'}>{full ? 'Complet' : 'Disponible'}</Badge>
                                        </div>
                                        <p className="font-black text-lg mb-1">{c.name}</p>
                                        <p className={`text-[10px] font-bold uppercase ${formData.selectedCourseId === c.id ? 'text-blue-200' : 'text-slate-400'}`}>{c.pole}</p>
                                    </button>
                                );
                            })}
                        </div>
                        {formData.selectedCourseId && (
                            <Card className="p-8 rounded-[2.5rem] shadow-xl border-0 bg-white dark:bg-slate-900 animate-fade-in">
                                <p className="text-xs font-black text-slate-400 uppercase mb-6 tracking-widest text-center">Formule souhaitée</p>
                                <div className="flex gap-4">
                                    {Object.values(CourseFormula).map(f => (
                                        <button key={f} onClick={() => setFormData({...formData, formula: f})} className={`flex-1 py-4 px-6 rounded-2xl font-black text-xs uppercase border-2 transition-all ${formData.formula === f ? 'bg-insan-orange border-insan-orange text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500'}`}>{f}</button>
                                    ))}
                                </div>
                            </Card>
                        )}
                        <Button disabled={!formData.selectedCourseId} onClick={() => setStep(2)} className="w-full py-6 text-lg rounded-[2rem]">Étape suivante <ArrowRight/></Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in space-y-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Étape 2 : Vos Informations</h2>
                            <p className="text-slate-500 font-medium">Saisissez vos coordonnées pour créer votre dossier scolaire.</p>
                        </div>
                        <Card className="p-10 shadow-2xl border-0 bg-white dark:bg-slate-900 rounded-[3rem]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl font-bold dark:text-white outline-none" placeholder="Prénom" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                                <input className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl font-bold dark:text-white outline-none" placeholder="Nom" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value.toUpperCase()})} />
                                <input className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl font-bold dark:text-white outline-none" type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                                <input className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl font-bold dark:text-white outline-none" type="email" placeholder="E-mail" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                        </Card>
                        <Button disabled={!formData.email || !formData.firstName} onClick={handleFinish} className="w-full py-6 text-lg bg-insan-orange rounded-[2rem]">Finaliser mon inscription <CheckCircle/></Button>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in py-20 text-center space-y-12">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl"><CheckCircle size={48}/></div>
                        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Inscription enregistrée !</h1>
                        <p className="text-xl text-slate-500 font-medium max-w-xl mx-auto">Votre dossier est maintenant entre les mains de notre administration. Un membre de l'équipe vous contactera pour valider vos accès.</p>
                        <button onClick={() => window.location.reload()} className="px-10 py-5 bg-insan-blue text-white rounded-[2rem] font-black text-lg shadow-2xl hover:scale-105 transition-all">RETOUR À L'ACCUEIL</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicRegistration;
