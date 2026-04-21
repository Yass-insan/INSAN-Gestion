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
    RegistrationStatus,
    User,
    UserRole,
    InstituteSettings,
    TestCourse,
    WaitingListEntry,
    WaitingListStatus
} from '../../types';
import { Card, Button, Badge, PageHeader, useToast } from '../../components/ui/DesignSystem';
import Papa from 'papaparse';
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
    AlertCircle,
    Globe,
    ClipboardList,
    DoorOpen,
    FileSignature,
    FileText,
    CheckCircle2,
    Clock,
    Upload,
    FileUp,
    Download
} from 'lucide-react';

const SignaturePad: React.FC<{ onSave: (dataUrl: string) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSigned, setHasSigned] = useState(false);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        setHasSigned(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSigned(false);
    };

    const handleSave = () => {
        if (!hasSigned) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        onSave(canvas.toDataURL());
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
    }, []);

    return (
        <div className="space-y-4">
            <div className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={200}
                    className="w-full h-48 cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>
            <div className="flex justify-between items-center">
                <Button variant="secondary" size="sm" onClick={clear}>Effacer</Button>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={onCancel}>Annuler</Button>
                    <Button size="sm" onClick={handleSave} disabled={!hasSigned}>Valider la signature</Button>
                </div>
            </div>
        </div>
    );
};

interface RegistrationManagementProps {
    dossiers: RegistrationDossier[];
    users: User[];
    courses: Course[];
    poles: Pole[];
    pricing: PricingSettings;
    currentUser: { name: string };
    onSaveDossier: (dossier: RegistrationDossier) => void;
    onDeleteDossier: (id: string) => void;
    initialDossierId?: string | null;
    onClearTargetId?: () => void;
    settings?: InstituteSettings;
    testCourses: TestCourse[];
    onSaveTestCourse: (tc: TestCourse) => void;
    waitingList: WaitingListEntry[];
    onSaveWaitingList: (entry: WaitingListEntry) => void;
    onDeleteWaitingList: (id: string) => void;
}

const RegistrationManagement: React.FC<RegistrationManagementProps> = ({ 
    dossiers, users, courses, poles, pricing, currentUser, onSaveDossier, onDeleteDossier, initialDossierId, onClearTargetId, settings, testCourses, onSaveTestCourse, waitingList, onSaveWaitingList, onDeleteWaitingList 
}) => {
    const { showToast } = useToast();
    const [view, setView] = useState<'list' | 'form' | 'test-courses' | 'waiting-list' | 'pre-registration'>('list');
    
    useEffect(() => {
        console.log('RegistrationManagement view changed to:', view);
    }, [view]);

    const [searchTerm, setSearchTerm] = useState('');
    const [editingDossier, setEditingDossier] = useState<RegistrationDossier | null>(null);
    const [previewDossier, setPreviewDossier] = useState<RegistrationDossier | null>(null);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [showFullCGVModal, setShowFullCGVModal] = useState(false);
    const [cgvAccepted, setCgvAccepted] = useState(false);
    const [showTestCourseModal, setShowTestCourseModal] = useState(false);
    const [showWaitingListModal, setShowWaitingListModal] = useState(false);
    const [selectedPoleIdForEnrollment, setSelectedPoleIdForEnrollment] = useState<string>('');
    const [waitingListEntryIdToConsume, setWaitingListEntryIdToConsume] = useState<string | null>(null);
    const [waitingListPoleFilter, setWaitingListPoleFilter] = useState<string>('all');
    const [waitingListCourseFilter, setWaitingListCourseFilter] = useState<string>('all');
    const [testCourseSearchTerm, setTestCourseSearchTerm] = useState('');
    const [testCoursePoleFilter, setTestCoursePoleFilter] = useState<string>('all');
    const [testCourseCourseFilter, setTestCourseCourseFilter] = useState<string>('all');
    const [confirmFullCourse, setConfirmFullCourse] = useState<{ studentId: string, course: Course } | null>(null);
    
    const [testCourseForm, setTestCourseForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        poleId: '',
        courseId: ''
    });

    const [waitingListForm, setWaitingListForm] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        phone: '',
        email: '',
        poleId: '',
        courseIds: [] as string[]
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as any[];
                let importedCount = 0;
                let errorCount = 0;

                data.forEach(row => {
                    // Mapping logic for Google Forms (common column names)
                    const firstName = row['Prénom'] || row['First Name'] || row['firstName'];
                    const lastName = row['Nom'] || row['Last Name'] || row['lastName'];
                    const email = row['Email'] || row['Adresse e-mail'] || row['email'];
                    const phone = row['Téléphone'] || row['Numéro de téléphone'] || row['phone'];
                    const birthDate = row['Date de naissance'] || row['Birth Date'] || row['birthDate'];
                    const poleName = row['Pôle'] || row['Pole'] || row['pole'];
                    const courseName = row['Cours'] || row['Course'] || row['course'];

                    if (firstName && lastName && phone) {
                        // Find pole and course by name if possible
                        const pole = poles.find(p => p.name.toLowerCase().includes(poleName?.toLowerCase() || ''));
                        const course = courses.find(c => c.name.toLowerCase().includes(courseName?.toLowerCase() || ''));

                        const newEntry: WaitingListEntry = {
                            id: (Date.now() + Math.random()).toString(),
                            firstName,
                            lastName,
                            birthDate: birthDate || '',
                            phone,
                            email: email || '',
                            poleId: pole?.id || (poles[0]?.id || ''),
                            courseId: course?.id || (courses.find(c => c.pole === (pole?.id || poles[0]?.id))?.id || ''),
                            createdAt: new Date().toISOString(),
                            status: WaitingListStatus.WAITING
                        };
                        onSaveWaitingList(newEntry);
                        importedCount++;
                    } else {
                        errorCount++;
                    }
                });

                if (importedCount > 0) {
                    showToast(`${importedCount} pré-inscriptions importées avec succès !`, "success");
                }
                if (errorCount > 0) {
                    showToast(`${errorCount} lignes n'ont pas pu être importées (données manquantes).`, "warning");
                }
                
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            error: (error) => {
                showToast(`Erreur lors de l'import : ${error.message}`, "error");
            }
        });
    };

    const handleSaveTestCourseLocal = () => {
        if (!testCourseForm.firstName || !testCourseForm.lastName || !testCourseForm.phone || !testCourseForm.email || !testCourseForm.poleId || !testCourseForm.courseId) {
            showToast("Veuillez remplir tous les champs.", "error");
            return;
        }
        const newTC: TestCourse = {
            id: Date.now().toString(),
            ...testCourseForm,
            createdAt: new Date().toISOString()
        };
        onSaveTestCourse(newTC);
        showToast("Cours de test enregistré !", "success");
        setTestCourseForm({ firstName: '', lastName: '', phone: '', email: '', poleId: '', courseId: '' });
        setShowTestCourseModal(false);
    };

    const handleSaveWaitingListLocal = () => {
        if (!waitingListForm.firstName || !waitingListForm.lastName || !waitingListForm.birthDate || !waitingListForm.phone || !waitingListForm.email || !waitingListForm.poleId || waitingListForm.courseIds.length === 0) {
            showToast("Veuillez remplir tous les champs.", "error");
            return;
        }
        
        waitingListForm.courseIds.forEach(courseId => {
            const newEntry: WaitingListEntry = {
                id: (Date.now() + Math.random()).toString(),
                firstName: waitingListForm.firstName,
                lastName: waitingListForm.lastName,
                birthDate: waitingListForm.birthDate,
                phone: waitingListForm.phone,
                email: waitingListForm.email,
                poleId: waitingListForm.poleId,
                courseId: courseId,
                createdAt: new Date().toISOString(),
                status: WaitingListStatus.WAITING
            };
            onSaveWaitingList(newEntry);
        });

        showToast("Élève ajouté à la liste d'attente !", "success");
        setWaitingListForm({ firstName: '', lastName: '', birthDate: '', phone: '', email: '', poleId: '', courseIds: [] });
        setShowWaitingListModal(false);
    };
    
    // Handle automatic preview from initialDossierId
    useEffect(() => {
        if (initialDossierId) {
            const dossier = dossiers.find(d => d.id === initialDossierId);
            if (dossier) {
                setPreviewDossier(dossier);
            }
            if (onClearTargetId) onClearTargetId();
        }
    }, [initialDossierId, dossiers, onClearTargetId]);

    // Form State
    const initialFormData: Partial<RegistrationDossier> = {
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
    };

    const [formData, setFormData] = useState<Partial<RegistrationDossier>>(initialFormData);

    const [paymentAmount, setPaymentAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>(pricing.paymentMethods?.[0] || 'ESPÈCES');
    const [paymentEncashmentDate, setPaymentEncashmentDate] = useState<'5' | '15' | ''>('');

    // --- AVAILABILITY HELPERS (PHYSICAL SEATS ONLY) ---
    // NO MODIFICATION to existing getCourseOccupancy name, but update logic to be strict physical
    const getCourseOccupancy = (courseId: string) => {
        // 1. Occupation via dossiers déjà validés (Exclure le distanciel)
        const storedOccupancy = dossiers
            .filter(d => d.id !== formData.id && d.status !== RegistrationStatus.CANCELLED)
            .reduce((total, d) => {
                const physicalCount = d.enrollments.filter(e => 
                    e.courseId === courseId && 
                    e.status !== RegistrationStatus.CANCELLED &&
                    (e.formula === CourseFormula.ON_SITE || e.formula === CourseFormula.HYBRID)
                ).length;
                return total + physicalCount;
            }, 0);

        // 2. Occupation via le dossier en cours d'édition (Exclure le distanciel)
        const draftOccupancy = (formData.enrollments || [])
            .filter(e => 
                e.courseId === courseId && 
                e.status !== RegistrationStatus.CANCELLED &&
                (e.formula === CourseFormula.ON_SITE || e.formula === CourseFormula.HYBRID)
            ).length;
            
        return storedOccupancy + draftOccupancy;
    };

    const getRoomOccupancy = (roomName: string) => {
        const room = settings?.rooms.find(r => r.name === roomName);
        if (!room) return { current: 0, total: 0 };
        
        const coursesInRoom = courses.filter(c => c.room === roomName);
        const total = coursesInRoom.reduce((acc, c) => acc + getCourseOccupancy(c.id), 0);
        
        return { current: total, total: room.capacity };
    };

    const filteredTestCourses = useMemo(() => {
        return testCourses.filter(tc => {
            const poleMatch = testCoursePoleFilter === 'all' || tc.poleId === testCoursePoleFilter;
            const courseMatch = testCourseCourseFilter === 'all' || tc.courseId === testCourseCourseFilter;
            const searchMatch = tc.firstName.toLowerCase().includes(testCourseSearchTerm.toLowerCase()) || 
                               tc.lastName.toLowerCase().includes(testCourseSearchTerm.toLowerCase()) ||
                               tc.email.toLowerCase().includes(testCourseSearchTerm.toLowerCase()) ||
                               tc.phone.includes(testCourseSearchTerm);
            return poleMatch && courseMatch && searchMatch;
        });
    }, [testCourses, testCoursePoleFilter, testCourseCourseFilter, testCourseSearchTerm]);

    const waitingListWithPositions = useMemo(() => {
        // Calculate opportunities per course
        const courseOpportunities: Record<string, number> = {};
        courses.forEach(course => {
            const occupancy = getCourseOccupancy(course.id);
            const capacity = course.capacity || 0;
            // People already in these statuses are "consuming" a spot
            const consumingSpots = waitingList.filter(e => 
                e.courseId === course.id && 
                (e.status === WaitingListStatus.MUST_REGISTER || 
                 e.status === WaitingListStatus.TO_CONTACT || 
                 e.status === WaitingListStatus.NO_RESPONSE)
            ).length;
            courseOpportunities[course.id] = Math.max(0, capacity - occupancy - consumingSpots);
        });

        // Sort full waiting list by creation date
        const fullSortedList = [...waitingList].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        const entriesWithOpportunity = new Set<string>();
        const courseCounters: Record<string, number> = {};
        
        fullSortedList.forEach(entry => {
            // If they already have a status that implies an opportunity was taken, they "have" it
            if (entry.status !== WaitingListStatus.WAITING && entry.status !== WaitingListStatus.REFUSED && entry.status !== WaitingListStatus.REGISTERED) {
                entriesWithOpportunity.add(entry.id);
            } else if (entry.status === WaitingListStatus.WAITING) {
                const available = courseOpportunities[entry.courseId] || 0;
                const currentCount = courseCounters[entry.courseId] || 0;
                
                if (currentCount < available) {
                    entriesWithOpportunity.add(entry.id);
                    courseCounters[entry.courseId] = currentCount + 1;
                }
            }
        });

        const filteredList = waitingList.filter(entry => {
            const poleMatch = waitingListPoleFilter === 'all' || entry.poleId === waitingListPoleFilter;
            const courseMatch = waitingListCourseFilter === 'all' || entry.courseId === waitingListCourseFilter;
            const searchMatch = entry.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                               entry.lastName.toLowerCase().includes(searchTerm.toLowerCase());
            return poleMatch && courseMatch && searchMatch;
        });

        const sortedFilteredList = [...filteredList].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        // Calculate positions based on the FULL list for consistency
        const fullCoursePositions: Record<string, number> = {};
        const positionMap: Record<string, number> = {};
        
        fullSortedList.forEach(entry => {
            if (!fullCoursePositions[entry.courseId]) {
                fullCoursePositions[entry.courseId] = 1;
            } else {
                fullCoursePositions[entry.courseId]++;
            }
            positionMap[entry.id] = fullCoursePositions[entry.courseId];
        });
        
        return sortedFilteredList.map(entry => ({
            ...entry,
            position: positionMap[entry.id],
            hasOpportunity: entriesWithOpportunity.has(entry.id)
        }));
    }, [waitingList, waitingListPoleFilter, waitingListCourseFilter, searchTerm, courses, dossiers]);

    // Automate status change from WAITING to TO_CONTACT when an opportunity is available
    useEffect(() => {
        const entriesToUpdate = waitingListWithPositions.filter(entry => 
            entry.hasOpportunity && entry.status === WaitingListStatus.WAITING
        );

        if (entriesToUpdate.length > 0) {
            entriesToUpdate.forEach(entry => {
                onSaveWaitingList({
                    ...entry,
                    status: WaitingListStatus.TO_CONTACT
                });
            });
        }
    }, [waitingListWithPositions, onSaveWaitingList]);

    const toContactCount = useMemo(() => {
        return waitingList.filter(entry => entry.status === WaitingListStatus.TO_CONTACT).length;
    }, [waitingList]);

    const availableSpotsAlerts = useMemo(() => {
        const alerts: { courseId: string; courseName: string; poleId: string; availableCount: number; waitingCount: number }[] = [];
        
        courses.forEach(course => {
            const occupancy = getCourseOccupancy(course.id);
            const capacity = course.capacity || 0;
            const available = capacity - occupancy;
            
            if (available > 0) {
                // Only count people who are still "waiting" (not registered, not refused, etc.)
                const waitingCount = waitingList.filter(entry => 
                    entry.courseId === course.id && 
                    (entry.status === WaitingListStatus.TO_CONTACT || 
                     entry.status === WaitingListStatus.NO_RESPONSE)
                ).length;
                
                if (waitingCount > 0) {
                    alerts.push({
                        courseId: course.id,
                        courseName: course.name,
                        poleId: course.pole,
                        availableCount: available,
                        waitingCount: waitingCount
                    });
                }
            }
        });
        
        return alerts;
    }, [courses, waitingList, dossiers]);

    // Camera States
    const [activeCameraIdx, setActiveCameraIdx] = useState<number | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
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

    useEffect(() => {
        if (stream && videoRef.current && activeCameraIdx !== null) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, activeCameraIdx]);

    const startCamera = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showToast("Navigation non sécurisée ou navigateur incompatible avec la caméra.", "error");
            setActiveCameraIdx(null);
            return;
        }

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } } 
            });
            streamRef.current = mediaStream;
            setStream(mediaStream);
        } catch (err: any) {
            console.error("Erreur caméra:", err);
            let msg = "Impossible d'accéder à la caméra.";
            
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                msg = "Accès refusé. Veuillez autoriser la caméra dans votre navigateur ou tentez d'ouvrir l'application dans un nouvel onglet.";
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                msg = "Aucune caméra détectée sur cet appareil.";
            } else {
                msg += " " + (err.message || "");
            }

            showToast(msg, "error");
            setActiveCameraIdx(null);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current && activeCameraIdx !== null) {
            // S'assurer que la vidéo est prête
            if (videoRef.current.videoWidth === 0) {
                showToast("Attente de la caméra...", "warning");
                return;
            }

            const context = canvasRef.current.getContext('2d');
            if (context) {
                const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
                canvasRef.current.width = 300;
                canvasRef.current.height = 300;
                context.drawImage(videoRef.current, (videoRef.current.videoWidth - size) / 2, (videoRef.current.videoHeight - size) / 2, size, size, 0, 0, 300, 300);
                const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
                
                setFormData(prev => {
                    const students = prev.students || [];
                    const newStudents = [...students];
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
        setSelectedPoleIdForEnrollment('');
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
            showToast("Un dossier doit contenir au moins un élève.", "error");
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

        if (paymentMethod === 'CHÈQUE' && !paymentEncashmentDate) {
            showToast("Veuillez sélectionner une date d'encaissement (5 ou 15).", "error");
            return;
        }

        const newPayment: PaymentEntry = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('fr-FR'),
            amount,
            method: paymentMethod,
            recordedBy: currentUser.name,
            isConfirmed: true,
            encashmentDate: paymentMethod === 'CHÈQUE' ? paymentEncashmentDate as '5' | '15' : undefined
        };
        setFormData(prev => ({ ...prev, payments: [...(prev.payments || []), newPayment] }));
        setPaymentAmount('');
        setPaymentEncashmentDate('');
    };

    const handleSave = () => {
        if (!formData.signature && !showSignatureModal) {
            setShowSignatureModal(true);
            return;
        }
        handleFinalSave();
    };

    const handleFinalSave = (signatureData?: string) => {
        if ((formData.students?.length || 0) === 0) {
            showToast("Veuillez ajouter au moins une inscription.", "error");
            return;
        }
        
        // Also check if any other waiting list entries match this student and the courses they just registered for
        // This is a safety measure if they didn't use the "Register" button but just filled the form
        formData.students?.forEach(student => {
            const studentWaitingEntries = waitingList.filter(entry => 
                entry.firstName.toLowerCase() === student.firstName.toLowerCase() && 
                entry.lastName.toLowerCase() === student.lastName.toLowerCase()
            );
            
            studentWaitingEntries.forEach(entry => {
                const isEnrolledInThisCourse = formData.enrollments?.some(enr => 
                    enr.studentId === student.id && enr.courseId === entry.courseId
                );
                if (isEnrolledInThisCourse) {
                    onDeleteWaitingList(entry.id);
                }
            });
        });

        const firstStudent = formData.students![0];
        const dossier = {
            ...formData,
            firstName: firstStudent.firstName,
            lastName: firstStudent.lastName,
            email: firstStudent.email || '',
            phone: firstStudent.phone || '',
            createdAt: formData.createdAt || new Date().toISOString(),
            createdBy: formData.createdBy || currentUser.name,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser.name,
            autoDiscount: totals.autoDiscount,
            multiChildDiscount: 0,
            montessoriFees: formData.isMontessoriMandatory ? pricing.montessoriFees : 0,
            signature: signatureData || formData.signature,
            signedAt: signatureData ? new Date().toISOString() : formData.signedAt,
            cgvAccepted: cgvAccepted || formData.cgvAccepted
        } as RegistrationDossier;
        onSaveDossier(dossier);
        
        // Consume waiting list entry if applicable
        if (waitingListEntryIdToConsume) {
            onDeleteWaitingList(waitingListEntryIdToConsume);
            setWaitingListEntryIdToConsume(null);
        }

        showToast("Dossier enregistré avec succès !", "success");
        setView('list');
        setShowSignatureModal(false);
        setCgvAccepted(false);
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
            <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto py-10">
                <Card className="w-full max-w-4xl animate-fade-in relative bg-white dark:bg-slate-900 shadow-2xl rounded-[3rem] overflow-hidden">
                    <button onClick={() => setPreviewDossier(null)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"><X size={20}/></button>
                    
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                            <div>
                                <Badge color={previewDossier.status === RegistrationStatus.CANCELLED ? 'red' : 'blue'}>{previewDossier.status === RegistrationStatus.CANCELLED ? 'DOSSIER ANNULÉ' : 'DOSSIER ACTIF'}</Badge>
                                <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-3">{previewDossier.lastName} {previewDossier.firstName}</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2 mt-1">
                                    <CalendarClock size={16}/> Créé le {new Date(previewDossier.createdAt || '').toLocaleString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})} par {previewDossier.createdBy}
                                </p>
                            </div>
                            <Button onClick={() => { 
                                setEditingDossier(previewDossier); 
                                setFormData(previewDossier); 
                                setSelectedPoleIdForEnrollment('');
                                setView('form'); 
                                setPreviewDossier(null); 
                            }} icon={<Edit3 size={16}/>}>Modifier le dossier</Button>
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

                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                            <h4 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest mb-4">Historique des Paiements</h4>
                            <div className="space-y-3">
                                {(previewDossier.payments || []).length > 0 ? (
                                    (previewDossier.payments || []).map((p, i) => (
                                        <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg"><Check size={16}/></div>
                                                <div>
                                                    <p className="font-black text-slate-800 dark:text-white">{p.amount}€</p>
                                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                                                        {p.date} • {p.method} {p.encashmentDate ? `(Encaissement le ${p.encashmentDate})` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enregistré par</p>
                                                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">{p.recordedBy}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-400 italic text-sm py-4">Aucun paiement enregistré pour ce dossier.</p>
                                )}
                            </div>
                        </div>

                        {previewDossier.signature && (
                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col items-end">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Signature du responsable</p>
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <img src={previewDossier.signature} alt="Signature" className="h-20 object-contain dark:invert" />
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 mt-2 italic">Signé le {new Date(previewDossier.signedAt!).toLocaleString('fr-FR')}</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {renderPreview()}

            {showWaitingListModal && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto py-10">
                    <Card className="w-full max-w-md animate-fade-in p-8 relative bg-white dark:bg-slate-900">
                        <button onClick={() => setShowWaitingListModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"><X size={20}/></button>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3"><ClipboardList size={24} className="text-insan-blue"/> Liste d'attente</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Nom</label>
                                    <input className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-insan-blue/20" value={waitingListForm.lastName || ''} onChange={e => setWaitingListForm({...waitingListForm, lastName: e.target.value})} placeholder="Nom" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Prénom</label>
                                    <input className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-insan-blue/20" value={waitingListForm.firstName || ''} onChange={e => setWaitingListForm({...waitingListForm, firstName: e.target.value})} placeholder="Prénom" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Date de naissance</label>
                                <input type="date" className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-insan-blue/20" value={waitingListForm.birthDate || ''} onChange={e => setWaitingListForm({...waitingListForm, birthDate: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Téléphone</label>
                                <input className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-insan-blue/20" value={waitingListForm.phone || ''} onChange={e => setWaitingListForm({...waitingListForm, phone: e.target.value})} placeholder="06 XX XX XX XX" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Email</label>
                                <input className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-insan-blue/20" value={waitingListForm.email || ''} onChange={e => setWaitingListForm({...waitingListForm, email: e.target.value})} placeholder="email@exemple.com" />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Pôle</label>
                                    <select 
                                        className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-insan-blue/20" 
                                        value={waitingListForm.poleId || ''} 
                                        onChange={e => setWaitingListForm({...waitingListForm, poleId: e.target.value, courseIds: []})}
                                    >
                                        <option value="">Choisir un pôle</option>
                                        {poles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                
                                {waitingListForm.poleId && (
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Cours souhaités (plusieurs possibles)</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 shadow-inner">
                                            {courses
                                                .filter(c => c.pole === waitingListForm.poleId)
                                                .map(c => (
                                                    <label key={c.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${waitingListForm.courseIds.includes(c.id) ? 'bg-insan-blue/10 border-insan-blue text-insan-blue' : 'bg-white dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}>
                                                        <input 
                                                            type="checkbox" 
                                                            className="w-5 h-5 rounded border-slate-300 text-insan-blue focus:ring-insan-blue"
                                                            checked={waitingListForm.courseIds.includes(c.id)}
                                                            onChange={(e) => {
                                                                const ids = e.target.checked 
                                                                    ? [...waitingListForm.courseIds, c.id]
                                                                    : waitingListForm.courseIds.filter(id => id !== c.id);
                                                                setWaitingListForm({...waitingListForm, courseIds: ids});
                                                            }}
                                                        />
                                                        <span className="text-xs font-black uppercase tracking-wider">{c.name}</span>
                                                    </label>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="pt-4">
                                <Button className="w-full bg-insan-blue hover:bg-insan-blue/90" onClick={handleSaveWaitingListLocal}>Ajouter à la liste d'attente</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {showTestCourseModal && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto py-10">
                    <Card className="w-full max-w-md animate-fade-in p-8 relative bg-white dark:bg-slate-900">
                        <button onClick={() => setShowTestCourseModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"><X size={20}/></button>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3"><CalendarClock size={24} className="text-green-500"/> Cours de TEST</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Nom</label>
                                <input className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-green-500/20" value={testCourseForm.lastName || ''} onChange={e => setTestCourseForm({...testCourseForm, lastName: e.target.value})} placeholder="Nom de famille" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Prénom</label>
                                <input className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-green-500/20" value={testCourseForm.firstName || ''} onChange={e => setTestCourseForm({...testCourseForm, firstName: e.target.value})} placeholder="Prénom" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Téléphone</label>
                                <input className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-green-500/20" value={testCourseForm.phone || ''} onChange={e => setTestCourseForm({...testCourseForm, phone: e.target.value})} placeholder="06 XX XX XX XX" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Email</label>
                                <input className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-green-500/20" value={testCourseForm.email || ''} onChange={e => setTestCourseForm({...testCourseForm, email: e.target.value})} placeholder="email@exemple.com" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Pôle</label>
                                    <select 
                                        className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-green-500/20" 
                                        value={testCourseForm.poleId || ''} 
                                        onChange={e => setTestCourseForm({...testCourseForm, poleId: e.target.value, courseId: ''})}
                                    >
                                        <option value="">Choisir un pôle</option>
                                        {poles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Cours</label>
                                    <select 
                                        className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-green-500/20" 
                                        value={testCourseForm.courseId || ''} 
                                        onChange={e => setTestCourseForm({...testCourseForm, courseId: e.target.value})}
                                        disabled={!testCourseForm.poleId}
                                    >
                                        <option value="">Choisir un cours</option>
                                        {courses
                                            .filter(c => c.pole === testCourseForm.poleId)
                                            .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                        }
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4">
                                <Button className="w-full bg-green-500 hover:bg-green-600" onClick={handleSaveTestCourseLocal}>Enregistrer le cours de test</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {view === 'list' && (
                <>
                    <PageHeader 
                        title="Scolarité" 
                        subtitle="Gestion administrative et financière des familles."
                        action={
                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={() => setView('pre-registration')} icon={<FileUp size={18}/>}>Pré-inscription</Button>
                                <Button variant="secondary" onClick={() => setShowWaitingListModal(true)} icon={<ClipboardList size={18}/>}>Liste d'attente</Button>
                                <Button variant="secondary" onClick={() => setShowTestCourseModal(true)} icon={<CalendarClock size={18}/>}>Cours de TEST</Button>
                                <Button onClick={handleStartNew} icon={<UserPlus size={18}/>}>Nouveau Dossier</Button>
                            </div>
                        }
                    />
                    <div className="space-y-6">
                        {/* ALERTES LISTE D'ATTENTE */}
                        {availableSpotsAlerts.length > 0 && (
                            <div className="space-y-3">
                                {availableSpotsAlerts.map(alert => {
                                    const pole = poles.find(p => p.id === alert.poleId);
                                    return (
                                        <Card key={alert.courseId} className="p-4 border-l-4 flex items-center justify-between shadow-md" style={{ borderLeftColor: pole?.color || '#3b82f6' }}>
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-full" style={{ backgroundColor: `${pole?.color}20`, color: pole?.color }}>
                                                    <AlertCircle size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                                        Opportunité : <span style={{ color: pole?.color }}>{alert.courseName}</span>
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                                                        {alert.availableCount} {alert.availableCount > 1 ? 'places libres' : 'place libre'} et {alert.waitingCount} {alert.waitingCount > 1 ? 'personnes' : 'personne'} sur liste d'attente.
                                                    </p>
                                                </div>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                variant="secondary" 
                                                className="bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest"
                                                onClick={() => setView('waiting-list')}
                                            >
                                                Voir la liste
                                            </Button>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                        {/* STATS RAPIDES */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="p-6 border-l-4 border-insan-orange shadow-lg">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Élèves</p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">{totalStudentsEnrolled}</p>
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase"><Fingerprint size={12}/> Identités scolaires</div>
                        </Card>
                        <Card className="p-6 border-l-4 border-green-500 shadow-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => setView('test-courses')}>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Cours de TEST</p>
                            <p className="text-3xl font-black text-green-500 dark:text-green-400">{testCourses.length}</p>
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase"><CalendarClock size={12}/> Voir la liste</div>
                        </Card>
                        <Card className="p-6 border-l-4 border-insan-blue shadow-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => setView('waiting-list')}>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Liste d'attente</p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">{waitingList.length}</p>
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase"><ClipboardList size={12}/> Voir la liste</div>
                        </Card>
                        <Card className="p-6 border-l-4 border-purple-500 shadow-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => setView('pre-registration')}>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Pré-inscriptions</p>
                            <p className="text-3xl font-black text-purple-500 dark:text-purple-400">{waitingList.length}</p>
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase"><FileUp size={12}/> Gérer l'import</div>
                        </Card>
                    </div>

                    <Card className="p-5 shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                            <input type="text" placeholder="Rechercher par nom d'élève ou famille..." className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold focus:ring-2 focus:ring-insan-blue/10 dark:text-white" value={searchTerm || ''} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </Card>

                    <Card className="overflow-hidden shadow-2xl border-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-[800px] lg:min-w-0">
                                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] border-b border-slate-200 dark:border-slate-800">
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
                                                        <button onClick={() => { 
                                                            setEditingDossier(d); 
                                                            setFormData(d); 
                                                            setSelectedPoleIdForEnrollment('');
                                                            setView('form'); 
                                                        }} className="p-2.5 text-slate-400 hover:text-insan-blue dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl shadow-sm transition-all" title="Modifier"><Edit3 size={16}/></button>
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
                    </div>
                </Card>
            </div>
            </>
        )}

            {view === 'pre-registration' && (
                <>
                    <PageHeader 
                        title="Pré-inscriptions" 
                        subtitle="Importez et gérez les demandes d'inscription issues de Google Forms."
                        action={
                            <div className="flex gap-3">
                                <input 
                                    type="file" 
                                    accept=".csv" 
                                    className="hidden" 
                                    ref={fileInputRef}
                                    onChange={handleImportCSV}
                                />
                                <Button onClick={() => fileInputRef.current?.click()} icon={<Upload size={18}/>}>Importer CSV</Button>
                                <Button variant="secondary" onClick={() => setView('list')} icon={<ArrowLeftRight size={18} className="rotate-180"/>}>Retour</Button>
                            </div>
                        }
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="p-8 bg-gradient-to-br from-insan-blue to-blue-700 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Total Pré-inscrits</p>
                                <p className="text-5xl font-black mb-4">{waitingList.length}</p>
                                <p className="text-xs font-bold opacity-70">Données synchronisées avec la liste d'attente</p>
                            </div>
                        </Card>

                        <Card className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Format CSV attendu</h4>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2"><Check size={12} className="text-green-500"/> Colonnes : Nom, Prénom, Email, Téléphone</p>
                                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2"><Check size={12} className="text-green-500"/> Optionnel : Date de naissance, Pôle, Cours</p>
                                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2"><Check size={12} className="text-green-500"/> En-têtes requis (Français ou Anglais)</p>
                            </div>
                        </Card>

                        <Card className="p-8 bg-purple-50 dark:bg-purple-900/10 rounded-[2.5rem] border border-purple-100 dark:border-purple-900/30 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                                <Download size={24}/>
                            </div>
                            <p className="text-xs font-black text-purple-800 dark:text-purple-300 uppercase mb-1">Besoin d'aide ?</p>
                            <p className="text-[10px] font-bold text-purple-600/70 dark:text-purple-400/70">Téléchargez le modèle CSV pour Google Forms</p>
                        </Card>
                    </div>

                    <Card className="overflow-hidden shadow-2xl border-0">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm flex items-center gap-3">
                                <Users size={18} className="text-insan-blue"/> Liste des pré-inscrits
                            </h3>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                                    <input 
                                        type="text" 
                                        placeholder="Filtrer..." 
                                        className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-insan-blue/20 dark:text-white"
                                        value={searchTerm || ''}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-5">Élève</th>
                                    <th className="p-5">Contact</th>
                                    <th className="p-5">Pôle / Cours</th>
                                    <th className="p-5">Date Import</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {waitingList
                                    .filter(entry => 
                                        entry.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        entry.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        entry.email.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .map(entry => (
                                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-insan-blue">
                                                    {entry.lastName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 dark:text-white">{entry.lastName} {entry.firstName}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{entry.birthDate || 'Date inconnue'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2"><Phone size={12}/> {entry.phone}</span>
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2"><Mail size={12}/> {entry.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-insan-blue uppercase tracking-widest">{poles.find(p => p.id === entry.poleId)?.name || 'N/A'}</span>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{courses.find(c => c.id === entry.courseId)?.name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-slate-500 font-bold text-xs">
                                            {new Date(entry.createdAt).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="secondary"
                                                    className="h-8 text-[10px] font-black uppercase tracking-wider"
                                                    onClick={() => {
                                                        const studentId = `s-${Date.now()}`;
                                                        const course = courses.find(c => c.id === entry.courseId);
                                                        setFormData({
                                                            ...initialFormData,
                                                            id: `d-${Date.now()}`,
                                                            lastName: entry.lastName,
                                                            firstName: entry.firstName,
                                                            email: entry.email,
                                                            phone: entry.phone,
                                                            students: [{
                                                                id: studentId,
                                                                firstName: entry.firstName,
                                                                lastName: entry.lastName,
                                                                birthDate: entry.birthDate,
                                                                phone: entry.phone,
                                                                email: entry.email,
                                                                genre: 'M'
                                                            }],
                                                            enrollments: course ? [{
                                                                id: `e-${Date.now()}`,
                                                                studentId: studentId,
                                                                courseId: entry.courseId,
                                                                courseName: course.name,
                                                                basePrice: pricing.coursePrices[entry.courseId]?.onSite || 0,
                                                                status: RegistrationStatus.ACTIVE
                                                            }] : []
                                                        });
                                                        setWaitingListEntryIdToConsume(entry.id);
                                                        setView('form');
                                                    }}
                                                >
                                                    Inscrire
                                                </Button>
                                                <button 
                                                    onClick={() => onDeleteWaitingList(entry.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {waitingList.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center text-slate-400 italic font-medium">Aucune pré-inscription importée.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </Card>
                </>
            )}

            {view === 'waiting-list' && (
                <>
                    <PageHeader 
                        title="Liste d'attente" 
                        subtitle={`Il y a actuellement ${waitingList.length} élèves en attente d'une place.`}
                        action={<Button variant="secondary" onClick={() => setView('list')} icon={<ArrowLeftRight size={18} className="rotate-180"/>}>Retour</Button>}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="p-6 flex items-center gap-4 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                            <div className="p-3 rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                                <Phone size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">À contacter</p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white">{toContactCount}</p>
                            </div>
                        </Card>
                        
                        <Card className="p-6 flex items-center gap-4 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                            <div className="p-3 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total en attente</p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white">{waitingList.length}</p>
                            </div>
                        </Card>

                        <Card className="p-6 flex items-center gap-4 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Opportunités</p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white">{availableSpotsAlerts.length}</p>
                            </div>
                        </Card>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Rechercher un élève..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-0 bg-white dark:bg-slate-900 shadow-lg focus:ring-2 focus:ring-insan-blue transition-all font-bold text-slate-700 dark:text-slate-200"
                                value={searchTerm || ''}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4">
                            <select 
                                className="px-4 py-3 rounded-xl border-0 bg-white dark:bg-slate-900 shadow-lg focus:ring-2 focus:ring-insan-blue transition-all font-bold text-slate-700 dark:text-slate-200 text-sm"
                                value={waitingListPoleFilter || ''}
                                onChange={(e) => {
                                    setWaitingListPoleFilter(e.target.value);
                                    setWaitingListCourseFilter('all');
                                }}
                            >
                                <option value="all">Tous les pôles</option>
                                {poles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <select 
                                className="px-4 py-3 rounded-xl border-0 bg-white dark:bg-slate-900 shadow-lg focus:ring-2 focus:ring-insan-blue transition-all font-bold text-slate-700 dark:text-slate-200 text-sm"
                                value={waitingListCourseFilter || ''}
                                onChange={(e) => setWaitingListCourseFilter(e.target.value)}
                            >
                                <option value="all">Tous les cours</option>
                                {courses
                                    .filter(c => waitingListPoleFilter === 'all' || c.pole === waitingListPoleFilter)
                                    .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                }
                            </select>
                        </div>
                    </div>

                    <div className="space-y-6 mb-8">
                        {/* ALERTES OPPORTUNITÉ */}
                        {availableSpotsAlerts.length > 0 && (
                            <div className="space-y-3">
                                {availableSpotsAlerts.map(alert => {
                                    const pole = poles.find(p => p.id === alert.poleId);
                                    return (
                                        <Card key={alert.courseId} className="p-4 border-l-4 flex items-center justify-between shadow-md" style={{ borderLeftColor: pole?.color || '#3b82f6' }}>
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-full" style={{ backgroundColor: `${pole?.color}20`, color: pole?.color }}>
                                                    <AlertCircle size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                                        Opportunité : <span style={{ color: pole?.color }}>{alert.courseName}</span>
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                                                        {alert.availableCount} {alert.availableCount > 1 ? 'places libres' : 'place libre'} et {alert.waitingCount} {alert.waitingCount > 1 ? 'personnes' : 'personne'} sur liste d'attente.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                    {pole?.name}
                                                </span>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <Card className="overflow-hidden shadow-2xl border-0">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-5">Position</th>
                                    <th className="p-5">Nom / Prénom</th>
                                    <th className="p-5">Contact</th>
                                    <th className="p-5">Pôle / Cours</th>
                                    <th className="p-5">Statut</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {waitingListWithPositions.map(entry => (
                                    <tr key={entry.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${entry.status === WaitingListStatus.TO_CONTACT ? 'bg-orange-50/30 dark:bg-orange-900/5' : ''}`}>
                                        <td className="p-5">
                                            <div 
                                                className="flex items-center justify-center w-8 h-8 rounded-full font-black text-xs"
                                                style={{ 
                                                    backgroundColor: `${poles.find(p => p.id === entry.poleId)?.color}20`, 
                                                    color: poles.find(p => p.id === entry.poleId)?.color 
                                                }}
                                            >
                                                #{entry.position}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-slate-800 dark:text-white">{entry.lastName} {entry.firstName}</span>
                                                    {(entry as any).hasOpportunity && entry.status === WaitingListStatus.WAITING && (
                                                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[8px] font-black uppercase tracking-tighter animate-pulse">
                                                            <CheckCircle2 size={8} /> Opportunité
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-bold">{new Date(entry.birthDate).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs font-bold"><Phone size={12}/> {entry.phone}</span>
                                                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs font-bold"><Mail size={12}/> {entry.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black text-insan-blue dark:text-blue-400 uppercase tracking-widest">
                                                    {poles.find(p => p.id === entry.poleId)?.name || 'N/A'}
                                                </span>
                                                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                                                    {courses.find(c => c.id === entry.courseId)?.name || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <select 
                                                className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border-0 focus:ring-2 focus:ring-insan-blue transition-all cursor-pointer
                                                    ${entry.status === WaitingListStatus.TO_CONTACT ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 
                                                      entry.status === WaitingListStatus.REGISTERED ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                      entry.status === WaitingListStatus.REFUSED ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                                      entry.status === WaitingListStatus.MUST_REGISTER ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                      entry.status === WaitingListStatus.WAITING ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500' :
                                                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}
                                                value={entry.status || ''}
                                                onChange={(e) => {
                                                    onSaveWaitingList({
                                                        ...entry,
                                                        status: e.target.value as WaitingListStatus
                                                    });
                                                }}
                                            >
                                                {Object.values(WaitingListStatus).map(status => {
                                                    // If no opportunity and current status is WAITING, only allow WAITING and REFUSED
                                                    const isRestricted = !(entry as any).hasOpportunity && 
                                                                       entry.status === WaitingListStatus.WAITING && 
                                                                       status !== WaitingListStatus.WAITING && 
                                                                       status !== WaitingListStatus.REFUSED;
                                                    
                                                    if (isRestricted) return null;
                                                    return <option key={status} value={status}>{status}</option>;
                                                })}
                                            </select>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                {entry.status !== WaitingListStatus.REGISTERED && (
                                                    <Button 
                                                        size="sm" 
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider h-8"
                                                        onClick={() => {
                                                            const studentId = `s-${Date.now()}`;
                                                            const course = courses.find(c => c.id === entry.courseId);
                                                            setFormData({
                                                                ...initialFormData,
                                                                id: `d-${Date.now()}`,
                                                                lastName: entry.lastName,
                                                                firstName: entry.firstName,
                                                                email: entry.email,
                                                                phone: entry.phone,
                                                                students: [{
                                                                    id: studentId,
                                                                    firstName: entry.firstName,
                                                                    lastName: entry.lastName,
                                                                    birthDate: entry.birthDate,
                                                                    phone: entry.phone,
                                                                    email: entry.email,
                                                                    genre: 'M'
                                                                }],
                                                                enrollments: course ? [{
                                                                    id: `e-${Date.now()}`,
                                                                    studentId: studentId,
                                                                    courseId: entry.courseId,
                                                                    courseName: course.name,
                                                                    basePrice: pricing.coursePrices[entry.courseId] || 0,
                                                                    status: RegistrationStatus.ACTIVE
                                                                }] : []
                                                            });
                                                            setWaitingListEntryIdToConsume(entry.id);
                                                            setView('form');
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                    >
                                                        Inscrire
                                                    </Button>
                                                )}
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost"
                                                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0"
                                                    onClick={() => {
                                                        if (window.confirm("Supprimer cet élève de la liste d'attente ?")) {
                                                            onDeleteWaitingList(entry.id);
                                                        }
                                                    }}
                                                >
                                                    <X size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {waitingListWithPositions.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-20 text-center text-slate-400 italic font-medium">Aucun élève trouvé avec ces filtres.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </Card>
                </>
            )}

            {view === 'test-courses' && (
                <>
                    <PageHeader 
                        title="Cours de TEST" 
                        subtitle="Liste des personnes ayant demandé un cours d'essai gratuit."
                        action={
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end mr-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taux de conversion</span>
                                    <span className="text-xl font-black text-insan-blue dark:text-blue-400">
                                        {filteredTestCourses.length > 0 
                                            ? Math.round((filteredTestCourses.filter(tc => 
                                                dossiers.some(d => 
                                                    d.students.some(s => s.email.toLowerCase() === tc.email.toLowerCase() || s.phone.replace(/\s/g, '') === tc.phone.replace(/\s/g, '')) ||
                                                    d.guardians.some(g => g.email.toLowerCase() === tc.email.toLowerCase() || g.phone.replace(/\s/g, '') === tc.phone.replace(/\s/g, ''))
                                                )
                                            ).length / filteredTestCourses.length) * 100)
                                            : 0}%
                                    </span>
                                </div>
                                <Button variant="secondary" onClick={() => setView('list')} icon={<ArrowLeftRight size={18} className="rotate-180"/>}>Retour</Button>
                            </div>
                        }
                    />

                    {/* FILTRES COURS DE TEST */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="p-4 flex items-center gap-4 bg-white dark:bg-slate-900 shadow-sm border-0">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 shrink-0">
                                <Search size={20}/>
                            </div>
                            <div className="flex-1">
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rechercher</label>
                                <input 
                                    type="text" 
                                    placeholder="Nom, email, téléphone..." 
                                    className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-700 dark:text-white placeholder:text-slate-300"
                                    value={testCourseSearchTerm || ''}
                                    onChange={(e) => setTestCourseSearchTerm(e.target.value)}
                                />
                            </div>
                        </Card>

                        <Card className="p-4 flex items-center gap-4 bg-white dark:bg-slate-900 shadow-sm border-0">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500 shrink-0">
                                <MapPin size={20}/>
                            </div>
                            <div className="flex-1">
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Filtrer par Pôle</label>
                                <select 
                                    className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-700 dark:text-white"
                                    value={testCoursePoleFilter || ''}
                                    onChange={(e) => {
                                        setTestCoursePoleFilter(e.target.value);
                                        setTestCourseCourseFilter('all');
                                    }}
                                >
                                    <option value="all">Tous les pôles</option>
                                    {poles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </Card>

                        <Card className="p-4 flex items-center gap-4 bg-white dark:bg-slate-900 shadow-sm border-0">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 shrink-0">
                                <BookOpen size={20}/>
                            </div>
                            <div className="flex-1">
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Filtrer par Cours</label>
                                <select 
                                    className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-700 dark:text-white"
                                    value={testCourseCourseFilter || ''}
                                    onChange={(e) => setTestCourseCourseFilter(e.target.value)}
                                >
                                    <option value="all">Tous les cours</option>
                                    {courses
                                        .filter(c => testCoursePoleFilter === 'all' || c.pole === testCoursePoleFilter)
                                        .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                    }
                                </select>
                            </div>
                        </Card>
                    </div>

                    <Card className="overflow-hidden shadow-2xl border-0">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-5">Nom / Prénom</th>
                                    <th className="p-5">Contact</th>
                                    <th className="p-5">Pôle / Cours</th>
                                    <th className="p-5">Date / Heure</th>
                                    <th className="p-5">Statut Inscription</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredTestCourses.map(tc => {
                                    const isRegistered = dossiers.some(d => 
                                        d.students.some(s => 
                                            s.email.toLowerCase() === tc.email.toLowerCase() || 
                                            s.phone.replace(/\s/g, '') === tc.phone.replace(/\s/g, '')
                                        ) ||
                                        d.guardians.some(g => 
                                            g.email.toLowerCase() === tc.email.toLowerCase() || 
                                            g.phone.replace(/\s/g, '') === tc.phone.replace(/\s/g, '')
                                        )
                                    );

                                    return (
                                        <tr key={tc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-5 font-black text-slate-800 dark:text-white">{tc.lastName} {tc.firstName}</td>
                                            <td className="p-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Phone size={14}/> {tc.phone}</span>
                                                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Mail size={14}/> {tc.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black text-insan-blue dark:text-blue-400 uppercase tracking-widest">
                                                        {poles.find(p => p.id === tc.poleId)?.name || 'N/A'}
                                                    </span>
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">
                                                        {courses.find(c => c.id === tc.courseId)?.name || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-slate-500 dark:text-slate-400 font-bold">
                                                {new Date(tc.createdAt).toLocaleString('fr-FR')}
                                            </td>
                                            <td className="p-5">
                                                {isRegistered ? (
                                                    <Badge color="green" icon={<CheckCircle2 size={12}/>}>Inscrit</Badge>
                                                ) : (
                                                    <Badge color="orange" icon={<Clock size={12}/>}>En attente</Badge>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredTestCourses.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center text-slate-400 italic font-medium">Aucun cours de test trouvé avec ces filtres.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </Card>
                </>
            )}

            {view === 'form' && (
                <>
                    <PageHeader 
                        title="Scolarité" 
                        subtitle="Gestion administrative et financière des familles."
                        action={
                            <Button 
                                variant="secondary" 
                                onClick={(e) => { 
                                    console.log('Quitter button clicked');
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setView('list'); 
                                }} 
                                icon={<X size={18}/>}
                                className="relative z-50"
                            >
                                Quitter
                            </Button>
                        }
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-12">
                        {/* ÉTUDIANTS */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center px-4">
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-4"><Users size={28} className="text-insan-orange"/> 1. Étudiants à inscrire</h3>
                                <Button onClick={handleAddPerson} variant="primary" className="shadow-lg" icon={<Plus size={18}/>}>Ajouter un élève</Button>
                            </div>

                            {(formData.students || []).map((student, sIdx) => (
                                <Card key={student.id} className="p-0 border-2 border-slate-100 dark:border-slate-700 relative group isolate animate-fade-in rounded-[2.5rem] overflow-hidden">
                                    <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-insan-orange text-white flex flex-col items-center justify-center shadow-lg shrink-0">
                                                <span className="text-[10px] font-black uppercase">Élève</span>
                                                <span className="text-2xl font-black">{sIdx + 1}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-800 dark:text-white">Fiche Inscription</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informations personnelles & pédagogiques</p>
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemovePerson(student.id); }} 
                                            className="w-full sm:w-auto px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/30 group/btn shadow-sm" 
                                            title="Retirer cet élève"
                                        >
                                            <Trash2 size={16}/>
                                            <span className="text-xs font-black uppercase tracking-wider">Supprimer Fiche</span>
                                        </button>
                                    </div>
                                    <div className="p-6 md:p-10 border-b border-slate-50 dark:border-slate-700">
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
                                                <div><label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block mb-1">Prénom</label><input className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold outline-none" value={student.firstName || ''} onChange={e => { 
                                                    const newList = [...(formData.students || [])]; 
                                                    // Ensure update uses index correctly
                                                    if(newList[sIdx]) newList[sIdx] = { ...newList[sIdx], firstName: e.target.value };
                                                    setFormData(prev => ({...prev, students: newList})); 
                                                }} placeholder="Prénom" /></div>
                                                <div><label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block mb-1">Nom</label><input className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold outline-none" value={student.lastName || ''} onChange={e => { 
                                                    const newList = [...(formData.students || [])]; 
                                                    if(newList[sIdx]) newList[sIdx] = { ...newList[sIdx], lastName: e.target.value.toUpperCase() };
                                                    setFormData(prev => ({...prev, students: newList})); 
                                                }} placeholder="NOM" /></div>
                                                <div><label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block mb-1">Date de Naissance</label><input type="date" className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold text-sm" value={student.birthDate || ''} onChange={e => { 
                                                    const newList = [...(formData.students || [])]; 
                                                    if(newList[sIdx]) newList[sIdx] = { ...newList[sIdx], birthDate: e.target.value };
                                                    setFormData(prev => ({...prev, students: newList})); 
                                                }} /></div>
                                                <div><label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block mb-1">Genre</label><select className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold" value={student.genre || ''} onChange={e => { 
                                                    const newList = [...(formData.students || [])]; 
                                                    if(newList[sIdx]) newList[sIdx] = { ...newList[sIdx], genre: e.target.value as any };
                                                    setFormData(prev => ({...prev, students: newList})); 
                                                }}><option value="M">Homme</option><option value="F">Femme</option></select></div>
                                                
                                                <div><label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block mb-1">E-mail</label><input type="email" className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold outline-none" value={student.email || ''} onChange={e => { 
                                                    const newList = [...(formData.students || [])]; 
                                                    if(newList[sIdx]) newList[sIdx] = { ...newList[sIdx], email: e.target.value };
                                                    setFormData(prev => ({...prev, students: newList})); 
                                                }} placeholder="email@exemple.com" /></div>
                                                <div><label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block mb-1">Téléphone</label><input type="tel" className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold outline-none" value={student.phone || ''} onChange={e => { 
                                                    const newList = [...(formData.students || [])]; 
                                                    if(newList[sIdx]) newList[sIdx] = { ...newList[sIdx], phone: e.target.value };
                                                    setFormData(prev => ({...prev, students: newList})); 
                                                }} placeholder="06 00 00 00 00" /></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 md:p-10">
                                        <div className="flex justify-between items-center mb-6">
                                            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em]">Sélection des cours & Disponibilités</p>
                                        <div className="flex gap-3">
                                            <select 
                                                className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white px-4 py-3 rounded-2xl text-xs font-black border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-insan-orange"
                                                value={selectedPoleIdForEnrollment || ''}
                                                onChange={(e) => setSelectedPoleIdForEnrollment(e.target.value)}
                                            >
                                                <option value="">Choisir un pôle...</option>
                                                {poles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>

                                            <select 
                                                className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white px-6 py-3 rounded-2xl text-xs font-black border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-insan-orange disabled:opacity-50" 
                                                disabled={!selectedPoleIdForEnrollment}
                                                onChange={(e) => { 
                                                    const course = courses.find(c => c.id === e.target.value);
                                                    if (course) {
                                                        const alreadyExists = formData.enrollments?.some(enr => enr.studentId === student.id && enr.courseId === course.id);
                                                        if (!alreadyExists) {
                                                            const occ = getCourseOccupancy(course.id);
                                                            const cap = course.capacity || 20;
                                                            if (occ >= cap) {
                                                                setConfirmFullCourse({ studentId: student.id, course });
                                                            } else {
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
                                                                setSelectedPoleIdForEnrollment('');
                                                            }
                                                        } else {
                                                            showToast("Ce cours est déjà ajouté pour cet élève.", "error");
                                                        }
                                                    }
                                                    e.target.value = "";
                                                }}
                                            >
                                                <option value="">+ Ajouter un cours...</option>
                                                {courses
                                                    .filter(c => c.pole === selectedPoleIdForEnrollment)
                                                    .map(c => {
                                                        const occ = getCourseOccupancy(c.id);
                                                        const cap = c.capacity || 20;
                                                        const remaining = cap - occ;
                                                        const isFull = remaining <= 0;
                                                        return (
                                                            <option key={c.id} value={c.id}>
                                                                {c.name} {isFull ? '(COMPLET)' : `(${remaining} places restantes)`}
                                                            </option>
                                                        );
                                                    })
                                                }
                                            </select>
                                        </div>
                                        </div>
                                        <div className="space-y-3">
                                            {(formData.enrollments || []).filter(e => e.studentId === student.id).map((enr) => {
                                                const c = courses.find(course => course.id === enr.courseId);
                                                const isCancelled = enr.status === RegistrationStatus.CANCELLED;
                                                const isPersisted = editingDossier?.enrollments?.some(e => 
                                                    String(e.studentId) === String(enr.studentId) && 
                                                    String(e.courseId) === String(enr.courseId)
                                                );

                                                // Availability logic for the UI item
                                                const occ = getCourseOccupancy(enr.courseId);
                                                const cap = c?.capacity || 20;
                                                const remaining = cap - occ;
                                                const isOverCapacity = remaining < 0; 
                                                const roomStatus = getRoomOccupancy(c?.room || '');
                                                const roomRemaining = roomStatus.total - roomStatus.current;

                                                return (
                                                    <div key={`${enr.studentId}-${enr.courseId}`} className={`flex flex-col md:flex-row items-start md:items-center gap-4 p-6 border rounded-[2rem] group/enr shadow-sm transition-all ${isCancelled ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 opacity-90' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isCancelled ? 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/20 text-insan-blue dark:text-blue-400'}`}>
                                                            {isCancelled ? <Ban size={28}/> : <BookOpen size={28}/>}
                                                        </div>
                                                        
                                                        <div className="flex-1 min-w-0 w-full space-y-1">
                                                            <div className="flex flex-wrap items-center gap-3">
                                                                <p className={`font-black text-lg leading-tight ${isCancelled ? 'text-red-800 dark:text-red-400 line-through' : 'text-slate-800 dark:text-white'}`}>
                                                                    {c?.name}
                                                                </p>
                                                                {!isCancelled && (
                                                                    <Badge color={remaining < 0 ? 'red' : remaining === 0 ? 'orange' : remaining <= 2 ? 'orange' : 'green'}>
                                                                    {remaining < 0 ? `SURCHARGE (${Math.abs(remaining)})` : remaining === 0 ? 'COMPLET' : `${remaining} PLACES`}
                                                                </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">
                                                                    {c?.pole} 
                                                                </span>
                                                                {!isCancelled && (
                                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                                                        <DoorOpen size={12} className="text-slate-400"/> 
                                                                        <span>{c?.room}</span>
                                                                        <span className={`px-1.5 py-0.5 rounded-full ${roomRemaining <= 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}>
                                                                            {Math.max(0, roomRemaining)} restants
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                                            {!isCancelled && (
                                                                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1 shrink-0">
                                                                    {Object.values(CourseFormula).map(formula => (
                                                                        <button
                                                                            type="button"
                                                                            key={formula}
                                                                            onClick={() => updateEnrollmentFormula(enr.studentId, enr.courseId, formula)}
                                                                            className={`px-3 py-2 rounded-lg text-[10px] font-black transition-all ${enr.formula === formula ? 'bg-white dark:bg-slate-700 text-insan-blue dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                                                        >
                                                                            {formula}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <div className="flex items-center gap-4 ml-auto md:ml-0">
                                                                <span className={`text-lg font-black shrink-0 ${isCancelled ? 'text-slate-400 line-through' : 'text-insan-blue dark:text-blue-400'}`}>{enr.basePrice + (enr.formulaSurcharge || 0)}€</span>
                                                                
                                                                <div className="flex items-center gap-2">
                                                                    {isPersisted ? (
                                                                        isCancelled ? (
                                                                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleEnrollmentStatus(enr.studentId, enr.courseId); }} className="px-4 py-2.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors font-black text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-sm"><RotateCcw size={14}/> RÉACTIVER</button>
                                                                        ) : (
                                                                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleEnrollmentStatus(enr.studentId, enr.courseId); }} className="px-4 py-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-black text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-sm"><Ban size={14}/> ANNULER</button>
                                                                        )
                                                                    ) : (
                                                                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteEnrollment(enr.studentId, enr.courseId); }} className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 transition-colors font-black text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-sm"><Trash2 size={14}/> RETIRER</button>
                                                                    )}
                                                                </div>
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
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-4"><ShieldAlert size={28} className="text-purple-600 dark:text-purple-400"/> 2. Responsables Légaux</h3>
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

                        {/* ADRESSE */}
                        <Card className="p-10 border-l-8 border-insan-blue bg-blue-50/20 dark:bg-blue-900/10 shadow-sm rounded-[2.5rem]">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-4"><MapPin size={28} className="text-insan-blue dark:text-blue-400"/> 3. Adresse du Foyer</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-3"><label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Adresse Postale</label><input className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-insan-blue/20" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Rue, n°, bâtiment..." /></div>
                                <div><label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Code Postal</label><input className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-insan-blue/20" value={formData.zipCode || ''} onChange={e => setFormData({...formData, zipCode: e.target.value})} placeholder="69XXX" /></div>
                                <div className="md:col-span-2"><label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Ville</label><input className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-insan-blue/20" value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Lyon..." /></div>
                            </div>
                        </Card>

                        {/* PAIEMENTS */}
                        <Card className="p-10 border-l-8 border-green-500 bg-green-50/20 dark:bg-green-900/10 rounded-[2.5rem]">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-4"><Banknote size={28} className="text-green-600 dark:text-green-400"/> 4. Règlements</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Montant du versement</label>
                                        <input type="number" placeholder="0" className="w-full border-0 bg-slate-50 dark:bg-slate-900 dark:text-white p-6 rounded-2xl text-3xl font-black outline-none mb-6 shadow-inner text-center" value={paymentAmount || ''} onChange={e => setPaymentAmount(e.target.value)} />
                                        
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            {(pricing.paymentMethods || ['ESPÈCES', 'CARTE', 'VIREMENT', 'CHÈQUE']).map(m => (
                                                <button 
                                                    key={m} 
                                                    onClick={() => setPaymentMethod(m)} 
                                                    className={`p-4 rounded-xl border-2 text-[10px] font-black uppercase transition-all flex flex-col items-center gap-2 ${paymentMethod === m ? 'bg-insan-blue text-white border-insan-blue shadow-lg scale-105' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700 hover:border-insan-blue/20 dark:hover:border-blue-500/30'}`}
                                                >
                                                    {m === 'ESPÈCES' && <Banknote size={20}/>}
                                                    {m === 'CARTE' && <CreditCard size={20}/>}
                                                    {m === 'VIREMENT' && <ArrowLeftRight size={20}/>}
                                                    {m === 'CHÈQUE' && <ClipboardCheck size={20}/>}
                                                    {m === 'STRIPE' && <Globe size={20}/>}
                                                    {m}
                                                </button>
                                            ))}
                                        </div>

                                        {paymentMethod === 'CHÈQUE' && (
                                            <div className="mb-6 animate-fade-in">
                                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Date d'encaissement souhaitée</label>
                                                <div className="flex gap-3">
                                                    {['5', '15'].map(day => (
                                                        <button
                                                            key={day}
                                                            type="button"
                                                            onClick={() => setPaymentEncashmentDate(day as '5' | '15')}
                                                            className={`flex-1 py-3 rounded-xl border-2 font-black transition-all ${paymentEncashmentDate === day ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:border-emerald-500/20'}`}
                                                        >
                                                            Le {day} du mois
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {paymentMethod === 'STRIPE' && (
                                            <div className="mb-6 animate-fade-in">
                                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Lien de paiement</label>
                                                <a 
                                                    href="https://dashboard.stripe.com/acct_1Q06doKDgSbGojg4/subscriptions?status=active&create=subscription" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="w-full flex items-center justify-center gap-3 py-4 bg-[#635bff] hover:bg-[#5851e0] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                                                >
                                                    <Globe size={18}/> Créer l'abonnement Stripe
                                                </a>
                                            </div>
                                        )}

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
                                                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                                                            {p.date} • {p.method} {p.encashmentDate ? `(Encaissement le ${p.encashmentDate})` : ''}
                                                        </p>
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
                            <Card className="p-10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[3rem] overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-insan-blue opacity-10 dark:opacity-20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                <h3 className="font-black text-2xl mb-10 flex items-center gap-4 relative z-10"><StickyNote size={24} className="text-insan-orange"/> Facturation Global</h3>
                                
                                <div className="space-y-5 text-sm relative z-10">
                                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                        <span className="font-bold">Total Enseignement</span>
                                        <span className="font-black font-mono text-slate-800 dark:text-white">{totals.subtotal.toFixed(2)}€</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                        <span className="font-bold">Frais de dossier fixe</span>
                                        <span className="font-black font-mono text-slate-800 dark:text-white">+{formData.dossierFees?.toFixed(2)}€</span>
                                    </div>
                                    {(totals.autoDiscount > 0) && (
                                        <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                                            {totals.autoDiscount > 0 && <div className="flex justify-between items-center text-green-600 dark:text-green-400 text-xs font-bold"><span>Remise Multi-cours</span><span>-{totals.autoDiscount.toFixed(2)}€</span></div>}
                                        </div>
                                    )}

                                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/10 space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Settings2 size={12}/> Remise Manuelle (en €)</label>
                                            <input type="number" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-black outline-none focus:ring-2 focus:ring-insan-blue/20 dark:text-white" value={formData.manualDiscount || 0} onChange={e => setFormData({...formData, manualDiscount: Number(e.target.value)})} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><MessageCircle size={12}/> Commentaires / Notes</label>
                                            <textarea className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs font-medium outline-none min-h-[80px] focus:ring-2 focus:ring-insan-blue/20 dark:text-white" value={formData.comments || ''} onChange={e => setFormData({...formData, comments: e.target.value})} placeholder="Détails sur l'inscription..." />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-8 mt-8 border-t border-slate-100 dark:border-white/10 flex flex-col items-center">
                                        <p className="text-[11px] uppercase font-black text-insan-blue dark:text-blue-300 mb-3 tracking-[0.3em]">MONTANT TOTAL DU DEVIS</p>
                                        <p className="text-7xl font-black tracking-tighter text-slate-900 dark:text-white">{totals.totalToPay.toFixed(0)}<span className="text-2xl ml-1">€</span></p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-12">
                                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-center">
                                            <p className="text-[9px] uppercase font-black text-green-600 dark:text-green-400 mb-2 tracking-widest">ENCAISSÉ</p>
                                            <p className="text-2xl font-black text-slate-800 dark:text-white">{totals.totalPaid.toFixed(0)}€</p>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-center">
                                            <p className="text-[9px] uppercase font-black text-red-600 dark:text-red-400 mb-2 tracking-widest">À RECOUVRER</p>
                                            <p className="text-2xl font-black text-slate-800 dark:text-white">{totals.balance.toFixed(0)}€</p>
                                        </div>
                                    </div>
                                </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
                                        <Button 
                                            variant="secondary" 
                                            className="py-6 font-black text-lg rounded-3xl border-2 border-slate-200 dark:border-white/10"
                                            onClick={() => {
                                                console.log('Form footer Quitter clicked');
                                                setView('list');
                                            }}
                                        >
                                            QUITTER SANS ENREGISTRER
                                        </Button>
                                        <Button className="py-6 bg-insan-orange hover:bg-orange-600 text-white border-0 font-black text-lg shadow-2xl relative z-10 flex items-center justify-center gap-4 group rounded-3xl" onClick={handleSave}>
                                            VALIDER LE DOSSIER
                                            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                        </Button>
                                    </div>
                            </Card>
                        </div>
                    </div>
                </div>
                </>
            )}

            {/* STUDIO PHOTO */}
            {activeCameraIdx !== null && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/90 backdrop-blur-xl p-4 overflow-y-auto py-10">
                    <Card className="w-full max-w-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-[3rem]">
                        <div className="p-8 flex justify-between items-center border-b border-slate-100 dark:border-white/10">
                            <h3 className="font-black text-2xl">Portrait de l'élève</h3>
                            <button onClick={() => setActiveCameraIdx(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition-colors text-slate-400 dark:text-white"><X/></button>
                        </div>
                        <div className="relative aspect-square bg-black overflow-hidden flex items-center justify-center shadow-inner">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center"><div className="w-72 h-72 border-2 border-dashed border-white/30 rounded-full bg-transparent shadow-[0_0_0_1000px_rgba(0,0,0,0.6)]"></div></div>
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="p-10 space-y-4">
                            <button onClick={capturePhoto} className="w-full bg-insan-blue dark:bg-slate-800 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-insan-orange transition-all transform active:scale-95">DÉCLENCHER LA CAPTURE</button>
                            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-4">
                                Si l'image n'apparaît pas, assurez-vous d'avoir autorisé la caméra ou tentez d'ouvrir l'application dans un <a href={window.location.href} target="_blank" rel="noopener noreferrer" className="text-insan-blue underline">nouvel onglet</a>.
                            </p>
                        </div>
                    </Card>
                </div>
            )}

            {/* MODAL DE SIGNATURE ET CGV */}
            {showSignatureModal && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto py-10">
                    <Card className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-insan-blue/10 rounded-2xl text-insan-blue">
                                    <FileSignature size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white">Signature du Dossier</h3>
                            </div>
                            <button onClick={() => setShowSignatureModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                <h4 className="font-black text-slate-800 dark:text-white mb-2 uppercase text-xs tracking-widest">Conditions Générales de Vente (Extrait)</h4>
                                <div className="mb-4 whitespace-pre-wrap">
                                    {settings.cgvExcerpt || "En validant ce dossier, vous reconnaissez avoir pris connaissance et accepter sans réserve les Conditions Générales de Vente de l'Institut Insan."}
                                </div>
                                <button 
                                    onClick={() => setShowFullCGVModal(true)}
                                    className="text-insan-blue dark:text-blue-400 font-black text-xs uppercase tracking-widest hover:underline mb-6 flex items-center gap-2"
                                >
                                    <FileText size={14}/> Voir les CGV complètes
                                </button>
                                <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <input 
                                        type="checkbox" 
                                        id="cgv-accept" 
                                        className="mt-1 w-5 h-5 rounded border-slate-300 text-insan-blue focus:ring-insan-blue"
                                        checked={cgvAccepted}
                                        onChange={(e) => setCgvAccepted(e.target.checked)}
                                    />
                                    <label htmlFor="cgv-accept" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                        Je certifie avoir lu et j'accepte les conditions générales de vente ainsi que la politique de confidentialité.
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest">Signature électronique</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Signez à l'aide de votre souris ou de votre doigt</p>
                                </div>
                                
                                <div className={!cgvAccepted ? 'opacity-50 pointer-events-none' : ''}>
                                    <SignaturePad 
                                        onSave={(data) => handleFinalSave(data)} 
                                        onCancel={() => setShowSignatureModal(false)}
                                    />
                                </div>
                                
                                <div className="flex items-center gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                    <ShieldAlert size={20} className="text-insan-blue shrink-0" />
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                                        Conformément au RGPD, votre signature et votre consentement sont enregistrés avec un horodatage précis ({new Date().toLocaleString('fr-FR')}). 
                                        Ces informations sont utilisées exclusivement pour la validité juridique de votre contrat d'enseignement.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* MODAL CGV COMPLÈTES */}
            {showFullCGVModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4 animate-fade-in">
                    <Card className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-insan-blue/10 rounded-2xl text-insan-blue">
                                    <FileText size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white">Conditions Générales de Vente</h3>
                            </div>
                            <button onClick={() => setShowFullCGVModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-10 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-800/30">
                            <div className="prose dark:prose-invert max-w-none">
                                <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                    {settings.cgv || "Les conditions générales de vente n'ont pas encore été configurées."}
                                </div>
                            </div>
                        </div>
                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-center shrink-0">
                            <Button onClick={() => setShowFullCGVModal(false)} className="px-12 py-4">FERMER LA LECTURE</Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* MODAL CONFIRMATION COURS COMPLET */}
            {confirmFullCourse && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
                    <Card className="w-full max-w-md animate-scale-in border-2 border-rose-100 dark:border-rose-900/30 overflow-hidden">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-[2.5rem] flex items-center justify-center mx-auto text-rose-500 shadow-inner">
                                <AlertCircle size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Cours Complet !</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                    Le cours <span className="text-rose-500 font-black">"{confirmFullCourse.course.name}"</span> a atteint sa capacité maximale ({confirmFullCourse.course.capacity} places).
                                </p>
                                <div className="p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/30 mt-4">
                                    <p className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                                        Voulez-vous forcer l'inscription en surcharge ?
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                                <Button 
                                    className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"
                                    onClick={() => {
                                        const { studentId, course } = confirmFullCourse;
                                        const priceConfig = pricing.coursePrices[course.id] || { onSite: 250, remote: 220 };
                                        const newItem: EnrollmentItem = { 
                                            studentId, 
                                            courseId: course.id, 
                                            formula: CourseFormula.ON_SITE, 
                                            basePrice: priceConfig.onSite, 
                                            formulaSurcharge: 0, 
                                            isVolunteerTeacher: false, 
                                            status: RegistrationStatus.ACTIVE 
                                        };
                                        setFormData(prev => ({ ...prev, enrollments: [...(prev.enrollments || []), newItem] }));
                                        setSelectedPoleIdForEnrollment('');
                                        setConfirmFullCourse(null);
                                        showToast(`Inscription en surcharge effectuée pour ${course.name}`, "info");
                                    }}
                                >
                                    OUI, FORCER L'INSCRIPTION
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    className="w-full py-4"
                                    onClick={() => setConfirmFullCourse(null)}
                                >
                                    NON, ANNULER
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default RegistrationManagement;