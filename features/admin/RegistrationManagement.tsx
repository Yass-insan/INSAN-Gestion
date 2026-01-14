"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    RegistrationDossier, 
    Course, 
    PaymentMethod, 
    CourseFormula, 
    EnrollmentItem, 
    PaymentEntry, 
    PricingSettings, 
    Pole, 
    StudentInfo, 
    LegalGuardian, 
    RegistrationStatus 
} from '../../types';
import { Card, Button, Badge, PageHeader } from '../../components/ui/DesignSystem';
import { 
    Plus, 
    Search, 
    Trash2, 
    Edit3, 
    Users, 
    UserPlus, 
    X, 
    Check, 
    Banknote, 
    Camera, 
    User as UserPlaceholder, 
    MapPin, 
    Phone, 
    Mail, 
    ShieldAlert, 
    StickyNote, 
    ArrowRight, 
    BookOpen, 
    Fingerprint, 
    Ban, 
    Settings2, 
    MessageCircle, 
    CalendarClock, 
    CreditCard, 
    ArrowLeftRight, 
    ClipboardCheck,
    RotateCcw,
    AlertCircle
} from 'lucide-react';

interface RegistrationManagementProps {
    dossiers: RegistrationDossier[];
    courses: Course[];
    poles: Pole[];
    pricing: PricingSettings;
    currentUser: { name: string };
    onSaveDossier: (dossier: RegistrationDossier) => void;
    onDeleteDossier: (id: string) => void;
}

const RegistrationManagement: React.FC<RegistrationManagementProps> = ({ 
    dossiers, courses, poles, pricing, currentUser, onSaveDossier, onDeleteDossier 
}) => {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingDossier, setEditingDossier] = useState<RegistrationDossier | null>(null);
    const [previewDossier, setPreviewDossier] = useState<RegistrationDossier | null>(null);
    
    // Form State
    const [formData, setFormData] = useState<Partial<RegistrationDossier>>({
        status: RegistrationStatus.ACTIVE,
        students: [],
        enrollments: [],
        payments: [],
        guardians: [
            { firstName: '', lastName: '', email: '', phone: '' },
            { firstName: '', lastName: '', email: '', phone: '' }
        ],
        isMontessoriMandatory: false,
        isInstallmentPlan: false,
        installmentCount: 1,
        dossierFees: pricing.dossierFees,
        manualDiscount: 0,
        address: '',
        city: '',
        zipCode: '',
        comments: ''
    });

    const [paymentAmount, setPaymentAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

    // Camera States
    const [activeCameraIdx, setActiveCameraIdx] = useState<number | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // --- CAMERA LOGIC ---
    useEffect(() => {
        if (activeCameraIdx !== null) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [activeCameraIdx]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user', width: 400, height: 400 } 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Erreur caméra:", err);
            setActiveCameraIdx(null);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current && activeCameraIdx !== null) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
                canvasRef.current.width = 300;
                canvasRef.current.height = 300;
                context.drawImage(videoRef.current, (videoRef.current.videoWidth - size) / 2, (videoRef.current.videoHeight - size) / 2, size, size, 0, 0, 300, 300);
                const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
                
                setFormData(prev => {
                    if (!prev.students) return prev;
                    const newStudents = [...prev.students];
                    if (newStudents[activeCameraIdx]) {
                        newStudents[activeCameraIdx] = { ...newStudents[activeCameraIdx], avatar: imageData };
                    }
                    return { ...prev, students: newStudents };
                });
                setActiveCameraIdx(null);
            }
        }
    };

    // --- LOGIC HELPERS ---
    const totals = useMemo(() => {
        const enrollments = formData.enrollments || [];
        // Only count active enrollments for the price (ignore CANCELLED)
        const activeEnrollments = enrollments.filter(e => e.status !== RegistrationStatus.CANCELLED);
        
        // Base price + Formula surcharge
        const subtotal = activeEnrollments.reduce((acc, curr) => acc + (curr.isVolunteerTeacher ? 0 : curr.basePrice + (curr.formulaSurcharge || 0)), 0);
        
        // Discounts - Multi-course only
        let autoDiscount = activeEnrollments.length >= 2 ? subtotal * (pricing.discounts.multiCourse / 100) : 0;
        
        // Total Calculation including Manual Discount
        const totalToPay = subtotal 
            + (formData.dossierFees || 0) 
            + (formData.isMontessoriMandatory ? pricing.montessoriFees : 0) 
            - autoDiscount 
            - (formData.manualDiscount || 0);

        const totalPaid = (formData.payments || []).reduce((acc, curr) => acc + curr.amount, 0);
        
        return {
            subtotal, 
            autoDiscount, 
            totalToPay: Math.max(0, totalToPay),
            totalPaid, 
            balance: Math.max(0, totalToPay) - totalPaid
        };
    }, [formData, pricing]);

    const showRLBlock = useMemo(() => {
        return (formData.enrollments || []).some(enr => {
            const c = courses.find(course => course.id === enr.courseId);
            return c && ['ENFANCE', 'JEUNESSE_FRERE', 'JEUNESSE_SOEUR', 'CORAN_FRERE', 'CORAN_SOEUR'].includes(c.pole);
        });
    }, [formData.enrollments, courses]);

    const filteredDossiers = useMemo(() => {
        return dossiers.filter(d => {
            const search = searchTerm.toLowerCase();
            return d.students.some(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(search)) ||
                   d.lastName.toLowerCase().includes(search);
        });
    }, [dossiers, searchTerm]);

    const handleStartNew = () => {
        setEditingDossier(null);
        setFormData({
            id: Date.now().toString(),
            status: RegistrationStatus.ACTIVE,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser.name,
            students: [{ id: `s-${Date.now()}`, firstName: '', lastName: '', birthDate: '', genre: 'M', email: '', phone: '', avatar: '' }],
            enrollments: [],
            payments: [],
            address: '', city: '', zipCode: '',
            guardians: [{ firstName: '', lastName: '', email: '', phone: '' }, { firstName: '', lastName: '', email: '', phone: '' }],
            isMontessoriMandatory: false,
            isInstallmentPlan: false,
            installmentCount: 1,
            dossierFees: pricing.dossierFees,
            manualDiscount: 0,
            comments: ''
        });
        setView('form');
    };

    const handleAddPerson = () => {
        // Robust unique ID to avoid collision
        const newStudent: StudentInfo = { 
            id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, 
            firstName: '', lastName: '', birthDate: '', genre: 'M', email: '', phone: '', avatar: '' 
        };
        setFormData(prev => ({ 
            ...prev, 
            students: [...(prev.students || []), newStudent] 
        }));
    };

    const handleRemovePerson = (studentId: string) => {
        if ((formData.students || []).length <= 1) {
            alert("Un dossier doit contenir au moins un élève. Vous ne pouvez pas supprimer le dernier.");
            return;
        }

        const student = formData.students?.find(s => s.id === studentId);
        const isEmpty = student && !student.firstName && !student.lastName && !student.email && !student.phone;
        
        if (isEmpty || window.confirm("Voulez-vous vraiment retirer cet élève du dossier ?\nToutes ses inscriptions seront également supprimées.")) {
            setFormData(prev => ({
                ...prev,
                students: (prev.students || []).filter(s => s.id !== studentId),
                enrollments: (prev.enrollments || []).filter(e => e.studentId !== studentId)
            }));
        }
    };

    const updateGuardian = (index: number, field: keyof LegalGuardian, value: string) => {
        const newGuardians = [...(formData.guardians || [])];
        if (newGuardians[index]) {
            newGuardians[index] = { ...newGuardians[index], [field]: value };
            setFormData(prev => ({ ...prev, guardians: newGuardians }));
        }
    };

    const updateEnrollmentFormula = (studentId: string, courseId: string, formula: CourseFormula) => {
        const config = pricing.coursePrices[courseId] || { onSite: 0, remote: 0 };
        // Select base price based on formula
        const basePrice = formula === CourseFormula.REMOTE ? config.remote : config.onSite;
        // Hybrid surcharge applies on top of base price (usually base is OnSite for Hybrid)
        // If Hybrid, we use OnSite price + Surcharge
        const surcharge = formula === CourseFormula.HYBRID ? (pricing.hybridSurcharge || 50) : 0;
        
        setFormData(prev => ({
            ...prev,
            enrollments: (prev.enrollments || []).map(e => 
                (e.studentId === studentId && e.courseId === courseId) 
                ? { ...e, formula, basePrice, formulaSurcharge: surcharge } 
                : e
            )
        }));
    };

    // --- LOGIQUE D'ANNULATION DU COURS (CORRECTION MAJEURE) ---
    const handleToggleEnrollmentStatus = (studentId: string, courseId: string) => {
        console.log("Tentative de bascule du statut pour:", studentId, courseId);
        
        setFormData(prev => {
            // Création d'une copie profonde pour forcer le re-render
            const newEnrollments = (prev.enrollments || []).map(enr => {
                // Comparaison stricte des chaînes pour éviter les erreurs de type
                if (String(enr.studentId) === String(studentId) && String(enr.courseId) === String(courseId)) {
                    const isCurrentlyCancelled = enr.status === RegistrationStatus.CANCELLED;
                    
                    console.log("Statut actuel:", enr.status, "-> Nouveau statut:", isCurrentlyCancelled ? "ACTIVE" : "CANCELLED");

                    return {
                        ...enr,
                        status: isCurrentlyCancelled ? RegistrationStatus.ACTIVE : RegistrationStatus.CANCELLED,
                        cancelledAt: isCurrentlyCancelled ? undefined : new Date().toISOString()
                    };
                }
                return enr;
            });

            return {
                ...prev,
                enrollments: newEnrollments
            };
        });
    };

    // Suppression définitive (pour les lignes en brouillon) - FIXÉE
    const handleDeleteEnrollment = (studentId: string, courseId: string) => {
        setFormData(prev => ({
            ...prev,
            enrollments: (prev.enrollments || []).filter(e => !(String(e.studentId) === String(studentId) && String(e.courseId) === String(courseId)))
        }));
    };

    const handleAddPayment = () => {
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) return;
        const newPayment: PaymentEntry = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('fr-FR'),
            amount,
            method: paymentMethod,
            recordedBy: currentUser.name,
            isConfirmed: true
        };
        setFormData(prev => ({ ...prev, payments: [...(prev.payments || []), newPayment] }));
        setPaymentAmount('');
    };

    const handleSave = () => {
        if ((formData.students?.length || 0) === 0) {
            alert("Veuillez ajouter au moins une inscription.");
            return;
        }
        const firstStudent = formData.students![0];
        const dossier = {
            ...formData,
            firstName: firstStudent.firstName,
            lastName: firstStudent.lastName,
            email: firstStudent.email || '',
            phone: firstStudent.phone || '',
            createdAt: formData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser.name,
            autoDiscount: totals.autoDiscount,
            multiChildDiscount: 0,
            montessoriFees: formData.isMontessoriMandatory ? pricing.montessoriFees : 0
        } as RegistrationDossier;
        onSaveDossier(dossier);
        setView('list');
    };

    const handleCancelDossier = (dossier: RegistrationDossier) => {
        if (window.confirm(`Êtes-vous sûr de vouloir ANNULER l'inscription de la famille ${dossier.lastName} ? Le dossier sera conservé pour l'historique mais marqué comme annulé.`)) {
            const updatedDossier: RegistrationDossier = {
                ...dossier,
                status: RegistrationStatus.CANCELLED,
                cancelledAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                updatedBy: currentUser.name
            };
            onSaveDossier(updatedDossier);
        }
    };

    const totalStudentsEnrolled = useMemo(() => dossiers.filter(d => d.status === RegistrationStatus.ACTIVE).reduce((acc, d) => acc + d.students.length, 0), [dossiers]);

    // --- PREVIEW MODAL ---
    const renderPreview = () => {
        if (!previewDossier) return null;
        
        const pEnrollments = previewDossier.enrollments || [];
        const activeEnrs = pEnrollments.filter(e => e.status !== RegistrationStatus.CANCELLED);
        const subtotal = activeEnrs.reduce((acc, curr) => acc + (curr.isVolunteerTeacher ? 0 : curr.basePrice + (curr.formulaSurcharge || 0)), 0);
        const autoDiscount = activeEnrs.length >= 2 ? subtotal * (pricing.discounts.multiCourse / 100) : 0;
        const totalToPay = subtotal 
            + (previewDossier.dossierFees || 0) 
            + (previewDossier.isMontessoriMandatory ? pricing.montessoriFees : 0) 
            - autoDiscount 
            - (previewDossier.manualDiscount || 0);
        const totalPaid = (previewDossier.payments || []).reduce((acc, curr) => acc + curr.amount, 0);
        const balance = totalToPay - totalPaid;

        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                <Card className="w-full max-w-4xl animate-fade-in max-h-[90vh] overflow-y-auto relative bg-white dark:bg-slate-900">
                    <button onClick={() => setPreviewDossier(null)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"><X size={20}/></button>
                    
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                            <div>
                                <Badge color={previewDossier.status === RegistrationStatus.CANCELLED ? 'red' : 'blue'}>{previewDossier.status === RegistrationStatus.CANCELLED ? 'DOSSIER ANNULÉ' : 'DOSSIER ACTIF'}</Badge>
                                <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-3">{previewDossier.lastName} {previewDossier.firstName}</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2 mt-1">
                                    <CalendarClock size={16}/> Créé le {new Date(previewDossier.createdAt || '').toLocaleString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                </p>
                            </div>
                            <Button onClick={() => { setEditingDossier(previewDossier); setFormData(previewDossier); setView('form'); setPreviewDossier(null); }} icon={<Edit3 size={16}/>}>Modifier le dossier</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h4 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest mb-4">Coordonnées</h4>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2 text-sm">
                                    <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><MapPin size={16} className="text-slate-400"/> {previewDossier.address}, {previewDossier.zipCode} {previewDossier.city}</p>
                                    <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><Phone size={16} className="text-slate-400"/> {previewDossier.phone}</p>
                                    <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><Mail size={16} className="text-slate-400"/> {previewDossier.email}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest mb-4">Synthèse Financière</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-center">
                                        <p className="text-xs font-bold text-blue-400 uppercase">Total Dû</p>
                                        <p className="text-2xl font-black text-insan-blue dark:text-blue-300">{totalToPay.toFixed(0)}€</p>
                                    </div>
                                    <div className={`p-4 rounded-2xl text-center ${balance <= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                        <p className={`text-xs font-bold uppercase ${balance <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>Reste à Payer</p>
                                        <p className={`text-2xl font-black ${balance <= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>{balance.toFixed(0)}€</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {previewDossier.students.map((student) => (
                                <div key={student.id} className="border border-slate-100 dark:border-slate-800 rounded-3xl p-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <img src={student.avatar || `https://ui-avatars.com/api/?name=${student.firstName}`} className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-600 shadow-md"/>
                                        <div>
                                            <h3 className="font-black text-xl text-slate-800 dark:text-white">{student.firstName} {student.lastName}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">{student.birthDate}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {previewDossier.enrollments.filter(e => e.studentId === student.id).map((enr, idx) => {
                                            const c = courses.find(course => course.id === enr.courseId);
                                            const isCancelled = enr.status === RegistrationStatus.CANCELLED;
                                            return (
                                                <div key={idx} className={`flex justify-between items-center p-4 rounded-xl ${isCancelled ? 'bg-red-50 dark:bg-red-900/10 opacity-75' : 'bg-slate-50 dark:bg-slate-800'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <BookOpen size={18} className={isCancelled ? 'text-red-400' : 'text-insan-blue dark:text-blue-400'}/>
                                                        <span className={`font-bold ${isCancelled ? 'text-red-800 dark:text-red-300 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{c?.name}</span>
                                                        <span className="text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 dark:text-slate-300">{enr.formula}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        {isCancelled ? (
                                                            <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase">Annulé le {new Date(enr.cancelledAt!).toLocaleDateString()}</span>
                                                        ) : (
                                                            <span className="font-black text-slate-800 dark:text-white">{enr.basePrice + (enr.formulaSurcharge || 0)}€</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <PageHeader 
                title="Scolarité" 
                subtitle="Gestion administrative et financière des familles."
                action={view === 'list' ? <Button onClick={handleStartNew} icon={<UserPlus size={18}/>}>Nouveau Dossier</Button> : <Button variant="secondary" onClick={() => setView('list')} icon={<X size={18}/>}>Quitter</Button>}
            />

            {renderPreview()}

            {view === 'list' ? (
                <div className="space-y-6">
                    {/* STATS RAPIDES */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="p-6 border-l-4 border-insan-blue shadow-lg">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Dossiers Actifs</p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">{dossiers.filter(d => d.status === RegistrationStatus.ACTIVE || !d.status).length}</p>
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase"><Users size={12}/> Familles inscrites</div>
                        </Card>
                        <Card className="p-6 border-l-4 border-insan-orange shadow-lg">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Élèves</p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">{totalStudentsEnrolled}</p>
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase"><Fingerprint size={12}/> Identités scolaires</div>
                        </Card>
                        <Card className="p-6 border-l-4 border-red-500 shadow-lg">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Annulations</p>
                            <p className="text-3xl font-black text-red-500 dark:text-red-400">{dossiers.filter(d => d.status === RegistrationStatus.CANCELLED).length}</p>
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase"><Ban size={12}/> Dossiers archivés</div>
                        </Card>
                    </div>

                    <Card className="p-5 shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                            <input type="text" placeholder="Rechercher par nom d'élève ou famille..." className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold focus:ring-2 focus:ring-insan-blue/10 dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </Card>

                    <Card className="overflow-hidden shadow-2xl border-0">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] border-b border-slate-800">
                                <tr>
                                    <th className="p-5">Dossier / Famille</th>
                                    <th className="p-5 text-center">Nb Inscrits</th>
                                    <th className="p-5 text-center">Paiement</th>
                                    <th className="p-5 text-center">Statut</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredDossiers.map(d => {
                                    // Calculate total strictly on non-cancelled courses
                                    const activeEnrollments = d.enrollments.filter(e => e.status !== RegistrationStatus.CANCELLED);
                                    const subtotal = activeEnrollments.reduce((acc, e) => acc + (e.isVolunteerTeacher ? 0 : e.basePrice + (e.formulaSurcharge || 0)), 0);
                                    const autoDiscount = activeEnrollments.length >= 2 ? subtotal * (pricing.discounts.multiCourse / 100) : 0;
                                    
                                    const dossierTotal = subtotal + d.dossierFees + d.montessoriFees - autoDiscount - (d.manualDiscount || 0);
                                    const dossierPaid = d.payments.reduce((acc, p) => acc + p.amount, 0);
                                    const balance = dossierTotal - dossierPaid;
                                    const isCancelled = d.status === RegistrationStatus.CANCELLED;

                                    return (
                                        <tr key={d.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer ${isCancelled ? 'bg-red-50/20 dark:bg-red-900/10' : ''}`} onClick={() => setPreviewDossier(d)}>
                                            <td className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-inner ${isCancelled ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500' : 'bg-slate-100 dark:bg-slate-800 text-insan-blue dark:text-blue-400'}`}>
                                                        {d.lastName.charAt(0)}
                                                    </div>
                                                    <div className={isCancelled ? 'opacity-50' : ''}>
                                                        <p className="font-black text-slate-800 dark:text-white text-sm">{d.lastName} {d.firstName}</p>
                                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                                            <CalendarClock size={10}/> {d.createdAt ? new Date(d.createdAt).toLocaleString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm ${isCancelled ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-insan-blue/5 dark:bg-blue-500/10 text-insan-blue dark:text-blue-400'}`}>
                                                    {d.students.length}
                                                </div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <Badge color="gray" className="rounded-full">{d.isInstallmentPlan ? `${d.installmentCount}X` : '1X (Comptant)'}</Badge>
                                            </td>
                                            <td className="p-5 text-center">
                                                {isCancelled ? (
                                                    <span className="text-red-700 dark:text-red-400 font-black text-[9px] uppercase bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-full border border-red-200 dark:border-red-900/50">
                                                        ANNULÉ LE {d.cancelledAt ? new Date(d.cancelledAt).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                ) : balance <= 0 ? (
                                                    <span className="text-green-600 dark:text-green-400 font-black text-[9px] uppercase bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-full border border-green-100 dark:border-green-900/50">Intégralement Payé</span>
                                                ) : (
                                                    <span className="text-red-500 dark:text-red-400 font-black text-[9px] uppercase bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-full border border-red-100 dark:border-red-900/50">Reste {balance.toFixed(0)}€</span>
                                                )}
                                            </td>
                                            <td className="p-5 text-right" onClick={e => e.stopPropagation()}>
                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!isCancelled && (
                                                        <button onClick={() => { setEditingDossier(d); setFormData(d); setView('form'); }} className="p-2.5 text-slate-400 hover:text-insan-blue dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl shadow-sm transition-all" title="Modifier"><Edit3 size={16}/></button>
                                                    )}
                                                    {!isCancelled ? (
                                                        <button onClick={() => handleCancelDossier(d)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-xl shadow-sm transition-all" title="Annuler l'inscription"><Ban size={16}/></button>
                                                    ) : (
                                                        <button onClick={() => onDeleteDossier(d.id)} className="p-2.5 text-slate-400 hover:text-red-900 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl shadow-sm transition-all" title="Supprimer définitivement"><Trash2 size={16}/></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredDossiers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center text-slate-400 italic font-medium">Aucun dossier trouvé correspondant à votre recherche.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </Card>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-12">
                        {/* ADRESSE */}
                        <Card className="p-10 border-l-8 border-insan-blue bg-blue-50/20 dark:bg-blue-900/10 shadow-sm rounded-[2.5rem]">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-4"><MapPin size={28} className="text-insan-blue dark:text-blue-400"/> 1. Adresse du Foyer</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-3"><label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Adresse Postale</label><input className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-insan-blue/20" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Rue, n°, bâtiment..." /></div>
                                <div><label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Code Postal</label><input className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-insan-blue/20" value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} placeholder="69XXX" /></div>
                                <div className="md:col-span-2"><label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Ville</label><input className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-insan-blue/20" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Lyon..." /></div>
                            </div>
                        </Card>

                        {/* ÉTUDIANTS */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center px-4">
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-4"><Users size={28} className="text-insan-orange"/> 2. Étudiants à inscrire</h3>
                                <Button onClick={handleAddPerson} className="bg-slate-900 border-0 shadow-lg" icon={<Plus size={18}/>}>Ajouter un élève</Button>
                            </div>

                            {(formData.students || []).map((student, sIdx) => (
                                // FORCE OVERFLOW VISIBLE TO ENSURE DELETE BUTTON IS NOT CLIPPED
                                <Card key={student.id} className="p-0 border-2 border-slate-100 dark:border-slate-700 relative group isolate animate-fade-in rounded-[2.5rem]" style={{ overflow: 'visible' }}>
                                    {/* FIXED: Button moved to absolute with high z-index and pointer events */}
                                    <button 
                                        type="button" 
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemovePerson(student.id); }} 
                                        className="absolute top-6 right-6 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all z-50 pointer-events-auto shadow-sm border border-red-100 dark:border-red-900/30 flex items-center gap-2 group/btn" 
                                        title="Retirer cet élève"
                                    >
                                        <Trash2 size={16}/>
                                        <span className="text-xs font-black uppercase tracking-wider">Supprimer Fiche</span>
                                    </button>
                                    
                                    <div className="absolute -left-4 top-8 w-16 h-16 rounded-3xl bg-insan-orange text-white flex flex-col items-center justify-center shadow-xl z-10 pointer-events-none">
                                        <span className="text-[10px] font-black uppercase mb-1">Élève</span>
                                        <span className="text-3xl font-black">{sIdx + 1}</span>
                                    </div>
                                    <div className="p-10 border-b border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 pl-20">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                                            <div className="md:col-span-1 flex flex-col items-center gap-4">
                                                <div className="relative group/photo">
                                                    <div className="w-28 h-28 rounded-[2.5rem] bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 overflow-hidden flex items-center justify-center shadow-md">
                                                        {student.avatar ? <img src={student.avatar} className="w-full h-full object-cover" /> : <UserPlaceholder size={48} className="text-slate-200 dark:text-slate-600" />}
                                                    </div>
                                                    <button onClick={() => setActiveCameraIdx(sIdx)} className="absolute -bottom-3 -right-3 p-3 bg-insan-blue text-white rounded-2xl shadow-xl hover:bg-blue-900 hover:scale-110 active:scale-95 transition-all"><Camera size={20} /></button>
                                                </div>
                                            </div>
                                            <div className="md:col-span-3 grid grid-cols-2 gap-x-6 gap-y-4">
                                                <div><label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block mb-1">Prénom</label><input className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold outline-none" value={student.firstName} onChange={e => { 
                                                    const newList = [...(formData.students || [])]; 
                                                    // Ensure update uses index correctly
                                                    if(newList[sIdx]) newList[sIdx] = { ...newList[sIdx], firstName: e.target.value };
                                                    setFormData(prev => ({...prev, students: newList})); 
                                                }} placeholder="Prénom" /></div>
                                                <div><label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block mb-1">Nom</label><input className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold outline-none" value={student.lastName} onChange={e => { 
                                                    const newList = [...(formData.students || [])]; 
                                                    if(newList[sIdx]) newList[sIdx] = { ...newList[sIdx], lastName: e.target.value.toUpperCase() };
                                                    setFormData(prev => ({...prev, students: newList})); 
                                                }} placeholder="NOM" /></div>
                                                <div><label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block mb-1">Date de Naissance</label><input type="date" className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold text-sm" value={student.birthDate} onChange={e => { 
                                                    const newList = [...(formData.students || [])]; 
                                                    if(newList[sIdx]) newList[sIdx] = { ...newList[sIdx], birthDate: e.target.value };
                                                    setFormData(prev => ({...prev, students: newList})); 
                                                }} /></div>
                                                <div><label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block mb-1">Genre</label><select className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold" value={student.genre} onChange={e => { 
                                                    const newList = [...(formData.students || [])]; 
                                                    if(newList[sIdx]) newList[sIdx] = { ...newList[sIdx], genre: e.target.value as any };
                                                    setFormData(prev => ({...prev, students: newList})); 
                                                }}><option value="M">Homme</option><option value="F">Femme</option></select></div>
                                                
                                                <div><label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block mb-1">E-mail</label><input type="email" className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold outline-none" value={student.email} onChange={e => { 
                                                    const newList = [...(formData.students || [])]; 
                                                    if(newList[sIdx]) newList[sIdx] = { ...newList[sIdx], email: e.target.value };
                                                    setFormData(prev => ({...prev, students: newList})); 
                                                }} placeholder="email@exemple.com" /></div>
                                                <div><label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block mb-1">Téléphone</label><input type="tel" className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold outline-none" value={student.phone} onChange={e => { 
                                                    const newList = [...(formData.students || [])]; 
                                                    if(newList[sIdx]) newList[sIdx] = { ...newList[sIdx], phone: e.target.value };
                                                    setFormData(prev => ({...prev, students: newList})); 
                                                }} placeholder="06 00 00 00 00" /></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-10 pl-20">
                                        <div className="flex justify-between items-center mb-6">
                                            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em]">Sélection des cours</p>
                                            <select className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black dark:bg-slate-800" onChange={(e) => { 
                                                const course = courses.find(c => c.id === e.target.value);
                                                if (course) {
                                                    // Prevent duplicates
                                                    const alreadyExists = formData.enrollments?.some(enr => enr.studentId === student.id && enr.courseId === course.id);
                                                    if (!alreadyExists) {
                                                        const priceConfig = pricing.coursePrices[course.id] || { onSite: 250, remote: 220 };
                                                        const newItem: EnrollmentItem = { 
                                                            studentId: student.id, 
                                                            courseId: course.id, 
                                                            formula: CourseFormula.ON_SITE, 
                                                            basePrice: priceConfig.onSite, 
                                                            formulaSurcharge: 0, 
                                                            isVolunteerTeacher: false, 
                                                            status: RegistrationStatus.ACTIVE 
                                                        };
                                                        setFormData(prev => ({ ...prev, enrollments: [...(prev.enrollments || []), newItem] }));
                                                    } else {
                                                        alert("Ce cours est déjà ajouté pour cet élève.");
                                                    }
                                                }
                                                e.target.value = "";
                                            }}>
                                                <option value="">+ Ajouter un cours...</option>
                                                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            {(formData.enrollments || []).filter(e => e.studentId === student.id).map((enr) => {
                                                const c = courses.find(course => course.id === enr.courseId);
                                                const isCancelled = enr.status === RegistrationStatus.CANCELLED;
                                                
                                                // Determine if this is a persisted enrollment from the database or a newly added one
                                                // Check if it exists in the original 'editingDossier' and wasn't newly added during this session
                                                const isPersisted = editingDossier?.enrollments?.some(e => 
                                                    String(e.studentId) === String(enr.studentId) && 
                                                    String(e.courseId) === String(enr.courseId)
                                                );

                                                return (
                                                    <div key={`${enr.studentId}-${enr.courseId}`} className={`flex flex-col lg:flex-row items-center gap-6 p-5 border rounded-3xl group/enr shadow-sm transition-all ${isCancelled ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 opacity-90' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isCancelled ? 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/20 text-insan-blue dark:text-blue-400'}`}>
                                                            {isCancelled ? <Ban size={24}/> : <BookOpen size={24}/>}
                                                        </div>
                                                        <div className="flex-1 min-w-0 w-full">
                                                            <div className="flex items-center gap-3">
                                                                <p className={`font-black text-base ${isCancelled ? 'text-red-800 dark:text-red-400 line-through' : 'text-slate-800 dark:text-white'}`}>
                                                                    {c?.name}
                                                                </p>
                                                                {isCancelled && (
                                                                    <div className="flex items-center gap-1 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 px-2 py-1 rounded-lg">
                                                                        <AlertCircle size={12} className="text-red-600 dark:text-red-400"/>
                                                                        <span className="text-[10px] font-black text-red-700 dark:text-red-300 uppercase tracking-wide">COURS ANNULÉ (Inactif)</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">
                                                                {c?.pole} 
                                                                {isCancelled && <span className="ml-2 text-red-500 dark:text-red-400 font-bold">DÉSINSCRIT LE {new Date(enr.cancelledAt || Date.now()).toLocaleDateString()}</span>}
                                                            </p>
                                                        </div>
                                                        
                                                        {!isCancelled && (
                                                            <div className="flex bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl gap-2">
                                                                {Object.values(CourseFormula).map(formula => (
                                                                    <button
                                                                        type="button"
                                                                        key={formula}
                                                                        onClick={() => updateEnrollmentFormula(enr.studentId, enr.courseId, formula)}
                                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all ${enr.formula === formula ? 'bg-white dark:bg-slate-700 text-insan-blue dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                                                    >
                                                                        {formula}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-4">
                                                            <span className={`text-sm font-black ${isCancelled ? 'text-slate-400 line-through' : 'text-insan-blue dark:text-blue-400'}`}>{enr.basePrice + (enr.formulaSurcharge || 0)}€</span>
                                                            
                                                            {/* Logic for Cancel/Delete/Restore - FIXED: Big explicit buttons with high Z-index */}
                                                            <div className="relative z-50 flex items-center gap-2">
                                                                {isPersisted ? (
                                                                    // EXISTING RECORD FROM DB
                                                                    isCancelled ? (
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={(e) => { 
                                                                                e.preventDefault(); 
                                                                                e.stopPropagation(); 
                                                                                handleToggleEnrollmentStatus(enr.studentId, enr.courseId);
                                                                            }} 
                                                                            className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer"
                                                                        >
                                                                            <RotateCcw size={14}/> RÉACTIVER LE COURS
                                                                        </button>
                                                                    ) : (
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={(e) => { 
                                                                                e.preventDefault(); 
                                                                                e.stopPropagation(); 
                                                                                handleToggleEnrollmentStatus(enr.studentId, enr.courseId);
                                                                            }} 
                                                                            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer" 
                                                                            title="Désinscrire cet élève de ce cours"
                                                                        >
                                                                            <Ban size={14}/> ANNULER CE COURS
                                                                        </button>
                                                                    )
                                                                ) : (
                                                                    // NEW RECORD (DRAFT) - Always delete completely
                                                                    <button 
                                                                        type="button" 
                                                                        onClick={(e) => { 
                                                                            e.preventDefault(); 
                                                                            e.stopPropagation(); 
                                                                            handleDeleteEnrollment(enr.studentId, enr.courseId); 
                                                                        }} 
                                                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 transition-colors font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer z-50 relative"
                                                                        title="Supprimer la ligne (Erreur de saisie)"
                                                                    >
                                                                        <Trash2 size={14}/> RETIRER
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* RESPONSABLES */}
                        {showRLBlock && (
                            <Card className="p-10 border-l-8 border-purple-500 bg-purple-50/20 dark:bg-purple-900/10 rounded-[2.5rem]">
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-4"><ShieldAlert size={28} className="text-purple-600 dark:text-purple-400"/> 3. Responsables Légaux</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {[0, 1].map(i => (
                                        <div key={i} className="space-y-4">
                                            <p className="text-[11px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-widest">{i === 0 ? 'Responsable Principal' : 'Second Responsable'}</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold" value={formData.guardians?.[i]?.lastName || ''} onChange={e => updateGuardian(i, 'lastName', e.target.value.toUpperCase())} placeholder="NOM" />
                                                <input className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold" value={formData.guardians?.[i]?.firstName || ''} onChange={e => updateGuardian(i, 'firstName', e.target.value)} placeholder="Prénom" />
                                            </div>
                                            <input className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold" value={formData.guardians?.[i]?.phone || ''} onChange={e => updateGuardian(i, 'phone', e.target.value)} placeholder="Téléphone" />
                                            <input className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold" value={formData.guardians?.[i]?.email || ''} onChange={e => updateGuardian(i, 'email', e.target.value)} placeholder="Email" />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* PAIEMENTS */}
                        <Card className="p-10 border-l-8 border-green-500 bg-green-50/20 dark:bg-green-900/10 rounded-[2.5rem]">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-4"><Banknote size={28} className="text-green-600 dark:text-green-400"/> 4. Règlements</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Montant du versement</label>
                                        <input type="number" placeholder="0" className="w-full border-0 bg-slate-50 dark:bg-slate-900 dark:text-white p-6 rounded-2xl text-3xl font-black outline-none mb-6 shadow-inner text-center" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
                                        
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            {Object.values(PaymentMethod).map(m => (
                                                <button 
                                                    key={m} 
                                                    onClick={() => setPaymentMethod(m)} 
                                                    className={`p-4 rounded-xl border-2 text-[10px] font-black uppercase transition-all flex flex-col items-center gap-2 ${paymentMethod === m ? 'bg-insan-blue text-white border-insan-blue shadow-lg scale-105' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700 hover:border-insan-blue/20 dark:hover:border-blue-500/30'}`}
                                                >
                                                    {m === PaymentMethod.CASH && <Banknote size={20}/>}
                                                    {m === PaymentMethod.CARD && <CreditCard size={20}/>}
                                                    {m === PaymentMethod.TRANSFER && <ArrowLeftRight size={20}/>}
                                                    {m === PaymentMethod.CHECK && <ClipboardCheck size={20}/>}
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                        <Button className="w-full py-5 text-lg" onClick={handleAddPayment}>ENREGISTRER LE PAIEMENT</Button>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-3xl border border-white dark:border-slate-700">
                                        <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-4">Fractionnement souhaité</h4>
                                        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-4">
                                            {[1, 2, 3, 4, 5, 10].map(n => (
                                                <button 
                                                    key={n}
                                                    onClick={() => setFormData({...formData, isInstallmentPlan: n > 1, installmentCount: n})}
                                                    className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${formData.installmentCount === n ? 'bg-insan-blue text-white shadow-md' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                                                >
                                                    {n === 10 ? 'MENSUEL' : `${n}X`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Historique des paiements</h4>
                                        {(formData.payments || []).map((p, i) => (
                                            <div key={i} className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm animate-fade-in">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg"><Check size={16}/></div>
                                                    <div>
                                                        <p className="font-black text-slate-800 dark:text-white">{p.amount}€</p>
                                                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">{p.date} • {p.method}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => setFormData({...formData, payments: formData.payments?.filter((_, idx) => idx !== i)})} className="text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                            </div>
                                        ))}
                                        {formData.payments?.length === 0 && <p className="text-center py-6 text-slate-400 dark:text-slate-500 italic text-xs">Aucun versement enregistré.</p>}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        <div className="sticky top-28">
                            <Card className="p-10 bg-slate-900 text-white border-0 shadow-2xl rounded-[3rem] overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-insan-blue opacity-20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                <h3 className="font-black text-2xl mb-10 flex items-center gap-4 relative z-10"><StickyNote size={24} className="text-insan-orange"/> Facturation Global</h3>
                                
                                <div className="space-y-5 text-sm relative z-10">
                                    <div className="flex justify-between items-center opacity-60">
                                        <span className="font-bold">Total Enseignement</span>
                                        <span className="font-black font-mono">{totals.subtotal.toFixed(2)}€</span>
                                    </div>
                                    <div className="flex justify-between items-center opacity-60">
                                        <span className="font-bold">Frais de dossier fixe</span>
                                        <span className="font-black font-mono">+{formData.dossierFees?.toFixed(2)}€</span>
                                    </div>
                                    {(totals.autoDiscount > 0) && (
                                        <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                                            {totals.autoDiscount > 0 && <div className="flex justify-between items-center text-green-400 text-xs font-bold"><span>Remise Multi-cours</span><span>-{totals.autoDiscount.toFixed(2)}€</span></div>}
                                        </div>
                                    )}

                                    {/* Manual Discount Section */}
                                    <div className="pt-4 mt-4 border-t border-white/10 space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Settings2 size={12}/> Remise Manuelle (en €)</label>
                                            <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-black outline-none focus:bg-white/10" value={formData.manualDiscount} onChange={e => setFormData({...formData, manualDiscount: Number(e.target.value)})} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><MessageCircle size={12}/> Commentaires / Notes</label>
                                            <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-medium outline-none min-h-[80px]" value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})} placeholder="Détails sur l'inscription..." />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-8 mt-8 border-t border-white/10 flex flex-col items-center">
                                        <p className="text-[11px] uppercase font-black text-blue-300 mb-3 tracking-[0.3em]">MONTANT TOTAL DU DEVIS</p>
                                        <p className="text-7xl font-black tracking-tighter">{totals.totalToPay.toFixed(0)}<span className="text-2xl ml-1">€</span></p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-12">
                                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                                            <p className="text-[9px] uppercase font-black text-green-400 mb-2 tracking-widest">ENCAISSÉ</p>
                                            <p className="text-2xl font-black">{totals.totalPaid.toFixed(0)}€</p>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                                            <p className="text-[9px] uppercase font-black text-red-400 mb-2 tracking-widest">À RECOUVRER</p>
                                            <p className="text-2xl font-black">{totals.balance.toFixed(0)}€</p>
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full mt-12 py-6 bg-insan-orange hover:bg-orange-600 text-white border-0 font-black text-xl shadow-2xl relative z-10 flex items-center justify-center gap-4 group" onClick={handleSave}>
                                    VALIDER LE DOSSIER
                                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {/* STUDIO PHOTO */}
            {activeCameraIdx !== null && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4">
                    <Card className="w-full max-w-xl overflow-hidden border-0 shadow-2xl bg-slate-950 text-white rounded-[3rem]">
                        <div className="p-8 flex justify-between items-center border-b border-white/10"><h3 className="font-black text-2xl">Portrait de l'élève</h3><button onClick={() => setActiveCameraIdx(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-colors"><X/></button></div>
                        <div className="relative aspect-square bg-black overflow-hidden flex items-center justify-center shadow-inner">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center"><div className="w-72 h-72 border-2 border-dashed border-white/30 rounded-full bg-transparent shadow-[0_0_0_1000px_rgba(0,0,0,0.6)]"></div></div>
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="p-10"><button onClick={capturePhoto} className="w-full bg-white text-slate-900 py-6 rounded-[2rem] font-black text-xl hover:bg-insan-orange hover:text-white transition-all transform active:scale-95">DÉCLENCHER LA CAPTURE</button></div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default RegistrationManagement;