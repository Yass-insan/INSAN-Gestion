
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';

// DASHBOARDS EXISTANTS (INTÉGRÉS TELS QUELS)
import AdminDashboard from './features/admin/AdminDashboard';
import { StatisticsPage } from './features/admin/StatisticsPage';
import { SettingsPage } from './features/admin/SettingsPage';
import StudentDashboard from './features/student/StudentDashboard';
import EmployeeManagement from './features/rh/EmployeeManagement';
import { EmployeeDashboard } from './features/employee/EmployeeDashboard';
import ProfessorDashboard from './features/professor/ProfessorDashboard';
import ClassAttendance from './features/professor/ClassAttendance';
import CourseManagement from './features/academics/CourseManagement';
import StudentTracking from './features/academics/StudentTracking';
import PoleDashboard from './features/pole/PoleDashboard';
import PointagePage from './features/staff/PointagePage';
import RegistrationManagement from './features/admin/RegistrationManagement';
import TarificationSettings from './features/admin/TarificationSettings';
import { DocumentManagement } from './features/admin/DocumentManagement';
import { KeyManagement } from './features/admin/KeyManagement';
import { MyDocuments } from './features/employee/MyDocuments';
import Chat from './components/Chat';

// Fix: Add missing Homework to the imports from ./types
import { 
  User, UserRole, NewsItem, Course, AttendanceRecord, 
  InstituteSettings, WorkSchedule, Pole, LeaveRequest, 
  RegistrationDossier, PricingSettings, FollowUpRecord, GlobalHoliday,
  Homework, RegistrationStatus, FollowUpStatus, TestCourse, WaitingListEntry,
  AttendanceStatus, Notification, AvailabilitySlot, ReplacementSlot,
  DocCategory, EmployeeDoc, DocStatus, KeyLog,
  StudentFormTemplate, StudentFormRequest
} from './types';
import { USERS, NEWS_LIST, COURSES, ATTENDANCE_HISTORY, HOMEWORK_LIST, WORK_SCHEDULES, POLES, LEAVE_REQUESTS } from './services/mockData';
import { DEFAULT_LAT, DEFAULT_LNG } from './services/utils';

import { ToastProvider, useToast } from './components/ui/DesignSystem';
import { X, FileText, Download, AlertCircle } from 'lucide-react';

function AppContent() {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('login');
  const [targetDossierId, setTargetDossierId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // ÉTAT PARTAGÉ CENTRALISÉ
  const [dossiers, setDossiers] = useState<RegistrationDossier[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>(COURSES);
  const [usersList, setUsersList] = useState<User[]>(USERS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(ATTENDANCE_HISTORY);
  const [testCourses, setTestCourses] = useState<TestCourse[]>([]);
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
  const [news, setNews] = useState<NewsItem[]>(NEWS_LIST);
  const [schedules, setSchedules] = useState<WorkSchedule[]>(WORK_SCHEDULES);
  // Fix: Homework type is now imported correctly from ./types
  const [homeworkList, setHomeworkList] = useState<Homework[]>(HOMEWORK_LIST);
  const [polesList, setPolesList] = useState<Pole[]>(POLES);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(LEAVE_REQUESTS);
  const [globalHolidays, setGlobalHolidays] = useState<GlobalHoliday[]>([]);
  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([]);
  const [replacementSlots, setReplacementSlots] = useState<ReplacementSlot[]>([]);
  const [followUpRecords, setFollowUpRecords] = useState<FollowUpRecord[]>([
    {
      id: 'f1',
      studentId: 's1',
      courseId: 'c1',
      status: FollowUpStatus.NO_ANSWER,
      lastActionDate: '2026-03-29',
      history: [
        { id: 'h1', date: '2026-03-29', status: FollowUpStatus.NO_ANSWER, comment: 'Appelé le 29/03, pas de réponse.', performedBy: 'Admin' }
      ]
    },
    {
      id: 'f2',
      studentId: 's3',
      courseId: 'c2',
      status: FollowUpStatus.CONTACTED,
      lastActionDate: '2026-03-15',
      history: [
        { id: 'h2', date: '2026-03-15', status: FollowUpStatus.CONTACTED, comment: 'A arrêté pour raisons personnelles.', performedBy: 'Admin' }
      ]
    },
    {
      id: 'f3',
      studentId: 's5',
      courseId: 'c3',
      status: FollowUpStatus.NO_ANSWER,
      lastActionDate: '2026-03-26',
      history: [
        { id: 'h3', date: '2026-03-26', status: FollowUpStatus.NO_ANSWER, comment: 'Message laissé sur répondeur.', performedBy: 'Admin' }
      ]
    }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; title: string; blobUrl?: string } | null>(null);
  const [activeChatRoomId, setActiveChatRoomId] = useState<string | null>(null);

  const [pricingSettings, setPricingSettings] = useState<PricingSettings>({
      coursePrices: {},
      dossierFees: 40,
      montessoriFees: 80,
      discounts: { multiCourse: 10, multiChild: 15 },
      paymentMethods: ['ESPÈCES', 'CARTE', 'VIREMENT', 'CHÈQUE', 'STRIPE']
  });

  const [docCategories, setDocCategories] = useState<DocCategory[]>([
    { id: 'cat1', name: 'Contrat de Travail', isMandatory: true },
    { id: 'cat2', name: 'Pièce d\'Identité', isMandatory: true },
    { id: 'cat3', name: 'Diplôme / CV', isMandatory: false },
    { id: 'cat4', name: 'RIB', isMandatory: true },
    { id: 'cat5', name: 'Casier Judiciaire', isMandatory: true },
    { id: 'cat_others', name: 'Autres', isMandatory: false }
  ]);

  const [employeeDocs, setEmployeeDocs] = useState<EmployeeDoc[]>([
    {
      id: 'doc1',
      employeeId: 'u1', // Admin
      categoryId: 'cat1',
      name: 'Contrat_2026.pdf',
      fileUrl: '#',
      status: DocStatus.VALIDATED,
      uploadedAt: '2026-01-01',
      updatedAt: '2026-01-01'
    },
    {
      id: 'doc2',
      employeeId: 'u2', // Prof
      categoryId: 'cat2',
      name: 'CNI_Recto.jpg',
      fileUrl: '#',
      status: DocStatus.PENDING,
      uploadedAt: '2026-03-25',
      updatedAt: '2026-03-25'
    }
  ]);

  const [keyLogs, setKeyLogs] = useState<KeyLog[]>([]);

  // --- STUDENT FORMS ---
  const [formTemplates, setFormTemplates] = useState<StudentFormTemplate[]>([]);
  const [formRequests, setFormRequests] = useState<StudentFormRequest[]>([]);

  const handleSaveFormTemplate = (tpl: StudentFormTemplate) => {
    setFormTemplates(prev => {
      const exists = prev.find(t => t.id === tpl.id);
      if (exists) return prev.map(t => t.id === tpl.id ? tpl : t);
      return [tpl, ...prev];
    });
    showToast("Modèle de formulaire enregistré", "success");
  };

  const handleDeleteFormTemplate = (id: string) => {
    setFormTemplates(prev => prev.filter(t => t.id !== id));
    showToast("Modèle supprimé", "info");
  };

  const handleSendFormRequests = (templateId: string, studentIds: string[]) => {
    const template = formTemplates.find(t => t.id === templateId);
    if (!template) return;

    const newRequests: StudentFormRequest[] = studentIds.map(sid => ({
      id: `req_${Date.now()}_${sid}_${templateId}`,
      templateId,
      studentId: sid,
      status: 'PENDING',
      requestedAt: new Date().toISOString()
    }));

    setFormRequests(prev => [...newRequests, ...prev]);

    // Notify students
    studentIds.forEach(sid => {
      addNotification({
        userId: sid,
        title: "Nouveau document à compléter",
        message: `L'administration vous demande de remplir : ${template.title}`,
        type: 'info',
        metadata: { type: 'chat', key: `form_request_${sid}_${Date.now()}` } // Reuse chat for linking to dashboard
      });
    });

    showToast(`Demande envoyée à ${studentIds.length} élève(s)`, "success");
  };
  
  const handleRemindFormRequest = (requestId: string) => {
    const request = formRequests.find(r => r.id === requestId);
    if (!request) return;
    
    const template = formTemplates.find(t => t.id === request.templateId);
    if (!template) return;
    
    addNotification({
      userId: request.studentId,
      title: "Rappel : Document à compléter",
      message: `N'oubliez pas de remplir le document : ${template.title}`,
      type: 'warning',
      metadata: { type: 'chat', key: `form_remind_${request.id}_${Date.now()}` }
    });
  };

  const handleUpdateFormStatus = (requestId: string, status: 'PENDING' | 'COMPLETED', data?: any) => {
    setFormRequests(prev => {
      const updated = prev.map(req => {
        if (req.id === requestId) {
          const newReq = { 
            ...req, 
            status, 
            submittedData: data, 
            submittedAt: status === 'COMPLETED' ? new Date().toISOString() : undefined 
          };
          
          // If COMPLETED, also update the student's dossier
          if (status === 'COMPLETED') {
            const student = usersList.find(u => u.id === req.studentId);
            // We find the dossier for this student
            const dossier = dossiers.find(d => d.students.some(s => s.id === req.studentId));
            if (dossier) {
                const updatedDossier = {
                    ...dossier,
                    submittedForms: [...(dossier.submittedForms || []), newReq]
                };
                handleSaveDossier(updatedDossier);
            }
          }
          
          return newReq;
        }
        return req;
      });
      return updated;
    });
  };

  const [instituteSettings, setInstituteSettings] = useState<InstituteSettings>({
    name: 'Institut Insan', address: '99 rue de Gerland, 69007 Lyon',
    lat: DEFAULT_LAT, lng: DEFAULT_LNG, radius: 100, rooms: [{name: 'Salle A', capacity: 25}], language: 'fr', currency: '€',
    logo: '',
    logoDark: '',
    lateThresholdMinutes: 15,
    emailTemplate: {
      subject: "Confirmation d'inscription - {{instituteName}}",
      body: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">Confirmation d'inscription</h2>
          <p>Bonjour <strong>{{studentName}}</strong>,</p>
          <p>Nous avons le plaisir de vous confirmer votre inscription à l'<strong>{{instituteName}}</strong>.</p>
          <p>Votre numéro de dossier est : <strong>{{dossierId}}</strong></p>
          <p>Vous pouvez désormais accéder à votre espace étudiant pour consulter votre emploi du temps et vos devoirs.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">Ceci est un message automatique, merci de ne pas y répondre.</p>
        </div>
      `,
      attachments: []
    },
    cgvExcerpt: "En validant ce dossier, vous reconnaissez avoir pris connaissance et accepter sans réserve les Conditions Générales de Vente de l'Institut Insan.",
    cgv: `Institut Insan — institutinsan.com

En vigueur au 28 mars 2026

Les présentes Conditions Générales de Vente (CGV) régissent les relations entre l'association Institut Insan et toute personne (ci-après « le bénéficiaire ») souscrivant à une formation ou un service proposé par l'association, en présentiel ou à distance.

1. Identification de l'association

DénominationINSTITUT INSANForme juridiqueAssociation loi 1901SIRET903 045 243 00024Adresse99 rue de Gerland, Allée 4 — 69007 LyonTéléphone09 70 70 70 88E-mailcontact@institut-insan.com

2. Champ d'application

Les présentes CGV s'appliquent à toutes les formations, cours, stages et activités proposés par l'Institut Insan, qu'ils soient dispensés en présentiel ou à distance via la plateforme insan-enligne.com.

Toute inscription implique l'acceptation sans réserve des présentes CGV. L'association se réserve le droit de les modifier à tout moment ; les conditions applicables sont celles en vigueur au jour de l'inscription.

3. Inscription`
  });

  // Attendance monitoring for Admins and Students
  useEffect(() => {
    if (!user) return;

    const checkAttendance = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0-6
      const currentTimeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      const todayDateStr = now.toISOString().split('T')[0];

      // ADMIN MONITORING
      if (user.role === UserRole.ADMIN) {
        coursesList.forEach(course => {
          const isTargetPole = course.pole === 'ENFANCE' || course.pole.startsWith('JEUNESSE');
          if (course.dayOfWeek === currentDay && isTargetPole) {
            if (currentTimeStr > course.endTime) {
              const attendanceTaken = attendance.some(record => 
                record.courseId === course.id && record.date === todayDateStr
              );

              if (!attendanceTaken) {
                const notifKey = `missing_attendance_${course.id}_${todayDateStr}`;
                const alreadyNotified = notifications.some(n => n.metadata?.key === notifKey);

                if (!alreadyNotified) {
                  addNotification({
                    userId: user.id,
                    title: 'Appel Manquant',
                    message: `L'appel n'a pas été fait pour le cours "${course.name}" (Pôle ${course.pole}) qui s'est terminé à ${course.endTime}.`,
                    type: 'warning',
                    metadata: { type: 'attendance_alert', courseId: course.id, key: notifKey }
                  });
                }
              }
            }
          }
        });
      }

      // STUDENT MONITORING
      if (user.role === UserRole.STUDENT && user.classId) {
        const myCourse = coursesList.find(c => c.id === user.classId);
        if (myCourse && myCourse.dayOfWeek === currentDay) {
          const record = attendance.find(a => a.studentId === user.id && a.courseId === myCourse.id && a.date === todayDateStr);
          
          // 1. Check for Absence (at the end of course)
          if (currentTimeStr > myCourse.endTime && !record) {
            const absenceKey = `absence_notif_${myCourse.id}_${todayDateStr}`;
            if (!notifications.some(n => n.metadata?.key === absenceKey)) {
              addNotification({
                userId: user.id,
                title: 'Absence Détectée',
                message: `Vous avez été marqué absent au cours "${myCourse.name}" aujourd'hui car aucun pointage n'a été enregistré.`,
                type: 'error',
                metadata: { type: 'attendance_alert', courseId: myCourse.id, key: absenceKey }
              });
            }
          }

          // 2. Check for Late (during course, if not already recorded)
          if (currentTimeStr > myCourse.startTime && currentTimeStr <= myCourse.endTime && !record) {
            // Calculate minutes since start
            const [startH, startM] = myCourse.startTime.split(':').map(Number);
            const [nowH, nowM] = currentTimeStr.split(':').map(Number);
            const diffMinutes = (nowH * 60 + nowM) - (startH * 60 + startM);
            
            const threshold = instituteSettings.lateThresholdMinutes || 15;
            
            if (diffMinutes >= threshold) {
              const lateKey = `late_notif_${myCourse.id}_${todayDateStr}`;
              if (!notifications.some(n => n.metadata?.key === lateKey)) {
                addNotification({
                  userId: user.id,
                  title: 'Retard Détecté',
                  message: `Vous êtes en retard de ${diffMinutes} minutes pour le cours "${myCourse.name}". N'oubliez pas de pointer !`,
                  type: 'warning',
                  metadata: { type: 'attendance_alert', courseId: myCourse.id, key: lateKey }
                });
              }
            }
          }
        }
      }
    };

    // Check immediately and then every minute
    checkAttendance();
    const interval = setInterval(checkAttendance, 60000);
    return () => clearInterval(interval);
  }, [user, coursesList, attendance, notifications, instituteSettings.lateThresholdMinutes]);

  useEffect(() => {
    if (selectedPdf?.url && selectedPdf.url.startsWith('data:application/pdf')) {
      // Convert data URL to Blob URL for better iframe compatibility
      const base64 = selectedPdf.url.split(',')[1];
      const binary = atob(base64);
      const array = [];
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      const blob = new Blob([new Uint8Array(array)], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      setSelectedPdf(prev => prev ? { ...prev, blobUrl } : null);
      
      return () => {
        URL.revokeObjectURL(blobUrl);
      };
    }
  }, [selectedPdf?.url]);

  const handleNotificationClick = (notif: Notification) => {
    // Mark as read
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    
    // Navigation logic
    if (notif.metadata?.type === 'news' && notif.metadata.newsId) {
      const foundNews = news.find(n => n.id === notif.metadata?.newsId);
      if (foundNews) {
        setSelectedNews(foundNews);
      }
    } else if (notif.metadata?.type === 'chat') {
      if (notif.metadata.roomId) {
        setActiveChatRoomId(notif.metadata.roomId);
      }
      setCurrentView('chat');
    } else if (notif.metadata?.type === 'course') {
      setCurrentView('dashboard');
    } else if (notif.link) {
      setCurrentView(notif.link);
    }
  };

  const addNotification = (notif: Omit<Notification, 'id' | 'read' | 'time'>) => {
    const newNotif: Notification = {
      ...notif,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      read: false,
      time: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleSaveDossier = async (dossier: RegistrationDossier) => {
    const isNew = !dossiers.find(d => d.id === dossier.id);
    
    setDossiers(prev => {
        const exists = prev.find(d => d.id === dossier.id);
        if (exists) return prev.map(d => d.id === dossier.id ? dossier : d);
        return [dossier, ...prev];
    });

    // Send confirmation email if it's a new dossier
    if (isNew && dossier.email) {
      try {
        // Prepare variables for the email
        const activeEnrs = dossier.enrollments.filter(e => e.status !== RegistrationStatus.CANCELLED);
        const enrolledCourses = activeEnrs.map(e => {
          const course = coursesList.find(c => c.id === e.courseId);
          return course ? course.name : 'Cours inconnu';
        }).join(', ');

        const subtotal = activeEnrs.reduce((acc, curr) => acc + (curr.isVolunteerTeacher ? 0 : curr.basePrice + (curr.formulaSurcharge || 0)), 0);
        const autoDiscount = activeEnrs.length >= 2 ? subtotal * (pricingSettings.discounts.multiCourse / 100) : 0;
        const totalToPay = subtotal + dossier.dossierFees + (dossier.isMontessoriMandatory ? pricingSettings.montessoriFees : 0) - autoDiscount - (dossier.manualDiscount || 0);
        const totalPaid = (dossier.payments || []).reduce((acc, curr) => acc + curr.amount, 0);
        const balance = totalToPay - totalPaid;

        const response = await fetch('/api/send-confirmation-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: dossier.email,
            studentName: `${dossier.firstName} ${dossier.lastName}`,
            studentFirstName: dossier.firstName,
            studentLastName: dossier.lastName,
            studentPhone: dossier.phone,
            guardianName: dossier.guardians?.[0] ? `${dossier.guardians[0].firstName} ${dossier.guardians[0].lastName}` : 'N/A',
            dossierId: dossier.id,
            instituteName: instituteSettings.name,
            totalAmount: `${totalToPay} ${instituteSettings.currency || '€'}`,
            amountPaid: `${totalPaid} ${instituteSettings.currency || '€'}`,
            balance: `${balance} ${instituteSettings.currency || '€'}`,
            coursesList: enrolledCourses,
            template: instituteSettings.emailTemplate
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server error response:", errorText);
          showToast("Erreur lors de l'envoi de l'email (Serveur)", "error");
          return;
        }

        const result = await response.json();
        if (result.success) {
          showToast("Email de confirmation envoyé !", "success");
        } else {
          showToast("Erreur lors de l'envoi de l'email", "error");
        }
      } catch (error) {
        console.error("Failed to send confirmation email:", error);
        showToast("Impossible de contacter le serveur d'email", "error");
      }
    }

    // Automatically add/update students in usersList
    setUsersList(prevUsers => {
      let updatedUsers = [...prevUsers];
      
      if (dossier.status === RegistrationStatus.CANCELLED) {
        // If dossier is cancelled, remove classId for all students in this dossier
        dossier.students.forEach(studentInfo => {
          const idx = updatedUsers.findIndex(u => u.id === studentInfo.id);
          if (idx !== -1) {
            updatedUsers[idx] = { ...updatedUsers[idx], classId: undefined };
          }
        });
      } else if (dossier.status === RegistrationStatus.ACTIVE) {
        dossier.students.forEach(studentInfo => {
          const existingUserIndex = updatedUsers.findIndex(u => u.id === studentInfo.id);
          
          // Find the first active courseId for this student in the enrollments
          const studentEnrollment = dossier.enrollments.find(e => e.studentId === studentInfo.id && e.status !== RegistrationStatus.CANCELLED);
          const classId = studentEnrollment?.courseId;

          if (existingUserIndex === -1) {
            // Create new user
            const newUser: User = {
              id: studentInfo.id,
              name: `${studentInfo.firstName} ${studentInfo.lastName}`,
              email: studentInfo.email || `${studentInfo.id}@institut-insan.com`,
              role: UserRole.STUDENT,
              avatar: studentInfo.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentInfo.firstName}${studentInfo.lastName}`,
              classId: classId,
              phone: studentInfo.phone
            };
            updatedUsers.push(newUser);
          } else {
            // Update existing user if classId changed
            const existingUser = updatedUsers[existingUserIndex];
            if (existingUser.classId !== classId) {
              updatedUsers[existingUserIndex] = {
                ...existingUser,
                classId: classId,
                avatar: studentInfo.avatar || existingUser.avatar
              };
            }
          }
        });
      }
      return updatedUsers;
    });
  };

  const handleLogin = (email: string) => {
    const foundUser = usersList.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      setCurrentView('dashboard');
    } else {
      showToast("Identifiants incorrects", "error");
    }
  };

  const handleAddNews = (n: NewsItem) => {
    setNews([n, ...news]);
    // Notify users based on visibility
    const targetRoles = n.visibleTo || [];
    usersList.forEach(u => {
      if (targetRoles.includes(u.role)) {
        addNotification({
          userId: u.id,
          title: "Nouvelle Actualité",
          message: n.title,
          type: 'info',
          metadata: { type: 'news', newsId: n.id }
        });
      }
    });
  };

  const handleUpdateNews = (updatedNews: NewsItem) => {
    setNews(prev => prev.map(n => n.id === updatedNews.id ? updatedNews : n));
  };

  const handleManageHomework = (action: 'add' | 'delete', hw: Homework) => {
    if (action === 'add') {
      setHomeworkList(prev => [...prev, hw]);
      
      // Notify students in the course
      const course = coursesList.find(c => c.id === hw.courseId);
      const targetStudents = usersList.filter(u => u.role === UserRole.STUDENT && u.classId === hw.courseId);
      
      targetStudents.forEach(s => {
        addNotification({
          userId: s.id,
          title: "Nouveau Devoir",
          message: `${course?.name || 'Cours'} : ${hw.title}`,
          type: 'info',
          metadata: { type: 'course', courseId: hw.courseId }
        });
      });
    } else {
      setHomeworkList(prev => prev.filter(h => h.id !== hw.id));
    }
  };

  const handleClockIn = (isExit: boolean) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isExit) {
      setAttendance(prev => prev.map(r => 
        (r.studentId === user.id && r.date === today) 
          ? { ...r, exitTimestamp: timeStr } 
          : r
      ));
      showToast("Départ enregistré !", "success");
    } else {
      // Find today's schedule to determine if late
      const todayDayOfWeek = now.getDay();
      const currentSchedule = schedules.find(s => 
        s.userId === user.id && 
        (s.type === 'EXCEPTION' ? s.date === today : s.dayOfWeek === todayDayOfWeek)
      );

      let status = AttendanceStatus.PRESENT;
      if (currentSchedule) {
        const [startH, startM] = currentSchedule.startTime.split(':').map(Number);
        const startTimeDate = new Date(now);
        startTimeDate.setHours(startH, startM, 0, 0);
        
        const diffMs = now.getTime() - startTimeDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        // Threshold logic: 1 minute for staff/professors, custom threshold for students
        const threshold = user.role === UserRole.STUDENT 
          ? (instituteSettings.lateThresholdMinutes || 15) 
          : 1;

        if (diffMins > threshold) {
          status = AttendanceStatus.LATE;
        }
      }

      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        studentId: user.id,
        courseId: currentSchedule?.courseId || 'general',
        date: today,
        status: status,
        entryTimestamp: timeStr,
        recordedBy: 'Self'
      };
      setAttendance(prev => [...prev, newRecord]);
      showToast(status === AttendanceStatus.LATE ? "Arrivée enregistrée (En retard)" : "Arrivée enregistrée !", status === AttendanceStatus.LATE ? "warning" : "success");
    }
  };

  const renderContent = () => {
    // --- AUTHENTICATION ---
    if (!user || currentView === 'login') return <Login onLogin={handleLogin} settings={instituteSettings} isDarkMode={isDarkMode} />;

    switch (currentView) {
      case 'dashboard':
        const filteredNews = news.filter(n => n.visibleTo?.includes(user.role));
        if (user.role === UserRole.STUDENT) return (
          <StudentDashboard 
            user={user} 
            users={usersList}
            poles={polesList}
            news={filteredNews} 
            courses={coursesList} 
            attendance={attendance} 
            homework={homeworkList} 
            onClockIn={handleClockIn} 
            settings={instituteSettings} 
            onReadMore={setSelectedNews} 
            onViewPdf={(url, title) => setSelectedPdf({ url, title })} 
            formTemplates={formTemplates}
            formRequests={formRequests}
            onUpdateFormStatus={handleUpdateFormStatus}
            dossiers={dossiers}
            onNavigate={setCurrentView}
            onAddNotification={addNotification}
            notifications={notifications.filter(n => n.userId === user.id)}
            onMarkNotifAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
            globalHolidays={globalHolidays}
          />
        );
        if (user.role === UserRole.ADMIN) return <AdminDashboard user={user} news={news} courses={coursesList} attendance={attendance} users={usersList} dossiers={dossiers} onAddNews={handleAddNews} onUpdateNews={handleUpdateNews} onDeleteNews={(id) => setNews(news.filter(n => n.id !== id))} settings={instituteSettings} schedules={schedules} poles={polesList} onNavigate={setCurrentView} onReadMore={setSelectedNews} />;
        if (user.role === UserRole.PROFESSOR) return <ProfessorDashboard user={user} news={filteredNews} courses={coursesList} attendance={attendance} homework={homeworkList} users={usersList} onClockIn={handleClockIn} onAddNews={handleAddNews} settings={instituteSettings} onAddAttendance={(r) => setAttendance([...attendance, r])} onManageHomework={handleManageHomework} onReadMore={setSelectedNews} onViewPdf={(url, title) => setSelectedPdf({ url, title })} />;
        if (user.role === UserRole.RESPONSIBLE) return <PoleDashboard user={user} news={filteredNews} courses={coursesList} attendance={attendance} users={usersList} onClockIn={handleClockIn} settings={instituteSettings} poles={polesList} onReadMore={setSelectedNews} />;
        if (user.role === UserRole.EMPLOYEE) return <EmployeeDashboard user={user} news={filteredNews} schedules={schedules} leaveRequests={leaveRequests} onClockIn={handleClockIn} settings={instituteSettings} onManageLeave={(a, l) => setLeaveRequests(a === 'add' ? [...leaveRequests, l] : leaveRequests.map(x => x.id === l.id ? l : x))} onReadMore={setSelectedNews} />;
        return <div className="p-10 text-center">Dashboard non configuré</div>;
      
      case 'inscriptions':
        return <RegistrationManagement 
          dossiers={dossiers} 
          users={usersList} 
          courses={coursesList} 
          poles={polesList} 
          pricing={pricingSettings} 
          currentUser={user} 
          onSaveDossier={handleSaveDossier} 
          onDeleteDossier={(id) => setDossiers(dossiers.filter(d => d.id !== id))} 
          initialDossierId={targetDossierId}
          onClearTargetId={() => setTargetDossierId(null)}
          settings={instituteSettings} 
          testCourses={testCourses} 
          onSaveTestCourse={(tc) => setTestCourses([tc, ...testCourses])} 
          waitingList={waitingList}
          onSaveWaitingList={(entry) => setWaitingList(prev => prev.some(x => x.id === entry.id) ? prev.map(x => x.id === entry.id ? entry : x) : [entry, ...prev])}
          onDeleteWaitingList={(id) => setWaitingList(prev => prev.filter(x => x.id !== id))}
        />;
      
      case 'students':
        return <StudentTracking 
          users={usersList} 
          courses={coursesList} 
          poles={polesList} 
          attendance={attendance} 
          dossiers={dossiers} 
          followUpRecords={followUpRecords} 
          onUpdateFollowUp={(r) => setFollowUpRecords(prev => prev.map(f => f.id === r.id ? r : f).concat(prev.some(f => f.id === r.id) ? [] : [r]))} 
          onNavigateToStats={() => setCurrentView('stats')} 
          onNavigateToDossier={() => setCurrentView('inscriptions')} 
          homework={homeworkList} 
          currentUser={user} 
          onManageUsers={() => {}} 
          formTemplates={formTemplates}
          formRequests={formRequests}
          onSaveTemplate={handleSaveFormTemplate}
          onDeleteTemplate={handleDeleteFormTemplate}
          onSendRequests={handleSendFormRequests}
          onRemindRequests={handleRemindFormRequest}
          onUpdateFormStatus={handleUpdateFormStatus}
        />;

      case 'manage-courses':
        return <CourseManagement 
          dossiers={dossiers} 
          courses={coursesList} 
          users={usersList} 
          poles={polesList} 
          settings={instituteSettings} 
          currentUser={user!}
          onManage={(a, c) => {
            if (a === 'update' || a === 'delete') {
              // Notify students enrolled in this course
              const enrolledStudents = usersList.filter(u => u.role === UserRole.STUDENT && u.classId === c.id);
              enrolledStudents.forEach(s => {
                addNotification({
                  userId: s.id,
                  title: a === 'update' ? "Cours modifié" : "Cours annulé",
                  message: `Le cours "${c.name}" a été ${a === 'update' ? 'modifié' : 'supprimé'}.`,
                  type: a === 'update' ? 'info' : 'warning',
                  metadata: { type: 'course', courseId: c.id }
                });
              });
            }
            setCoursesList(prev => a === 'add' ? [c, ...prev] : a === 'update' ? prev.map(x => x.id === c.id ? c : x) : prev.filter(x => x.id !== c.id));
          }} 
          onManagePoles={(a, p) => {
            setPolesList(prev => a === 'add' ? [p, ...prev] : a === 'update' ? prev.map(x => x.id === p.id ? p : x) : prev.filter(x => x.id !== p.id));
            
            // Sync user managedPoleIds
            setUsersList(prevUsers => prevUsers.map(u => {
              const isManager = p.managerIds?.includes(u.id);
              const managedPoles = u.managedPoleIds || [];
              
              if (a === 'delete') {
                return { ...u, managedPoleIds: managedPoles.filter(id => id !== p.id) };
              }
              
              if (isManager) {
                if (!managedPoles.includes(p.id)) {
                  return { ...u, managedPoleIds: [...managedPoles, p.id] };
                }
              } else {
                if (managedPoles.includes(p.id)) {
                  return { ...u, managedPoleIds: managedPoles.filter(id => id !== p.id) };
                }
              }
              return u;
            }));
          }} 
        />;

      case 'employees':
        return <EmployeeManagement 
          users={usersList} 
          attendance={attendance} 
          schedules={schedules} 
          courses={coursesList} 
          poles={polesList} 
          leaveRequests={leaveRequests} 
          globalHolidays={globalHolidays} 
          availabilities={availabilities}
          replacementSlots={replacementSlots}
          onManageUsers={(a, u) => {
            setUsersList(prev => a === 'add' ? [...prev, u] : a === 'update' ? prev.map(x => x.id === u.id ? u : x) : prev.filter(x => x.id !== u.id));
            
            // Sync pole managerIds
            setPolesList(prevPoles => prevPoles.map(p => {
              const managers = p.managerIds || [];
              if (a === 'delete') return { ...p, managerIds: managers.filter(id => id !== u.id) };
              const isManaged = u.managedPoleIds?.includes(p.id);
              if (isManaged && !managers.includes(u.id)) return { ...p, managerIds: [...managers, u.id] };
              if (!isManaged && managers.includes(u.id)) return { ...p, managerIds: managers.filter(id => id !== u.id) };
              return p;
            }));
          }} 
          onManageSchedule={(a, s) => setSchedules(a === 'add' ? [...schedules, s] : schedules.filter(x => x.id !== s.id))} 
          onManageLeave={(a, l) => setLeaveRequests(a === 'add' ? [...leaveRequests, l] : leaveRequests.map(x => x.id === l.id ? l : x))} 
          onManageGlobalHoliday={(a, h) => setGlobalHolidays(a === 'add' ? [...globalHolidays, h] : globalHolidays.filter(x => x.id !== h.id))} 
          onManageAvailability={(a, av) => setAvailabilities(prev => a === 'add' ? [...prev, av] : prev.filter(x => x.id !== av.id))}
          onManageReplacement={(a, s) => setReplacementSlots(prev => a === 'add' ? [...prev, s] : a === 'delete' ? prev.filter(x => x.id !== s.id) : prev.map(x => x.id === s.id ? s : x))}
          onNavigate={setCurrentView}
          docCategories={docCategories}
          onRequestDocs={(userIds, catIds, message, adminFile) => {
            const usersToNotify = usersList.filter(u => userIds.includes(u.id));
            const categoryNames = docCategories.filter(c => catIds.includes(c.id)).map(c => c.name);
            
            const newDocs: EmployeeDoc[] = [];
            
            usersToNotify.forEach(userToNotify => {
              catIds.forEach(catId => {
                const category = docCategories.find(c => c.id === catId);
                newDocs.push({
                  id: `req_${Date.now()}_${userToNotify.id}_${catId}`,
                  employeeId: userToNotify.id,
                  categoryId: catId,
                  name: category?.name || 'Document requis',
                  status: DocStatus.PENDING,
                  message: message,
                  adminAttachmentUrl: adminFile ? URL.createObjectURL(adminFile) : undefined,
                  updatedAt: new Date().toISOString()
                });
              });

              setNotifications(prev => [{
                id: Date.now().toString(),
                userId: userToNotify.id,
                title: 'Demande de documents',
                message: message || `L'administration vous demande les documents suivants : ${categoryNames.join(', ')}`,
                type: 'info',
                read: false,
                createdAt: new Date().toISOString()
              }, ...prev]);
            });

            setEmployeeDocs(prev => [...prev, ...newDocs]);
            alert(`Demande envoyée à ${usersToNotify.length} employé(s) !`);
          }}
        />;

      case 'tarification':
        return <TarificationSettings pricing={pricingSettings} courses={coursesList} poles={polesList} onUpdate={setPricingSettings} settings={instituteSettings} />;

      case 'documents-admin':
        return <DocumentManagement 
          users={usersList} 
          documents={employeeDocs} 
          categories={docCategories} 
          onUpdateDocStatus={(id, status) => setEmployeeDocs(prev => prev.map(d => d.id === id ? { ...d, status, updatedAt: new Date().toISOString() } : d))}
          onRequestDocs={(userIds, catIds, message, adminFile) => {
            const usersToNotify = usersList.filter(u => userIds.includes(u.id));
            const categoryNames = docCategories.filter(c => catIds.includes(c.id)).map(c => c.name);
            
            const newDocs: EmployeeDoc[] = [];
            
            usersToNotify.forEach(userToNotify => {
              // Create pending doc records for each category
              catIds.forEach(catId => {
                const category = docCategories.find(c => c.id === catId);
                newDocs.push({
                  id: `req_${Date.now()}_${userToNotify.id}_${catId}`,
                  employeeId: userToNotify.id,
                  categoryId: catId,
                  name: category?.name || 'Document requis',
                  status: DocStatus.PENDING,
                  message: message,
                  adminAttachmentUrl: adminFile ? URL.createObjectURL(adminFile) : undefined,
                  updatedAt: new Date().toISOString()
                });
              });

              addNotification({
                userId: userToNotify.id,
                title: "Documents administratifs requis",
                message: message || `L'administration demande les documents suivants : ${categoryNames.join(', ')}. Merci de les compléter dans votre espace 'Mes Documents RH'.`,
                type: 'warning',
                metadata: { type: 'chat', key: `doc_request_${userToNotify.id}_${Date.now()}` }
              });
            });

            setEmployeeDocs(prev => [...prev, ...newDocs]);
            showToast(`Demande envoyée à ${usersToNotify.length} employé(s)`, "success");
          }}
          onNavigateBack={() => setCurrentView('employees')}
        />;

      case 'my-documents':
        if (!user) return null;
        return <MyDocuments 
          user={user} 
          documents={employeeDocs.filter(d => d.employeeId === user.id)} 
          categories={docCategories}
          onResolveRequest={(docId, file) => {
            setEmployeeDocs(prev => prev.map(d => 
              d.id === docId 
                ? { 
                    ...d, 
                    status: DocStatus.PENDING, 
                    fileUrl: URL.createObjectURL(file),
                    uploadedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    name: file.name
                  } 
                : d
            ));
            showToast("Document signé et envoyé !", "success");
          }}
          onUpload={(catId, file) => {
            const newDoc: EmployeeDoc = {
              id: Date.now().toString(),
              employeeId: user.id,
              categoryId: catId,
              name: file.name,
              fileUrl: URL.createObjectURL(file),
              status: DocStatus.PENDING,
              uploadedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setEmployeeDocs(prev => [...prev, newDoc]);
            showToast("Document envoyé pour validation !", "success");
          }}
          onDelete={(id) => setEmployeeDocs(prev => prev.filter(d => d.id !== id))}
        />;

      case 'keys':
        return <KeyManagement 
          users={usersList} 
          rooms={instituteSettings.rooms} 
          keyLogs={keyLogs}
          onAddKeyLog={(log) => setKeyLogs(prev => [log, ...prev])}
          onUpdateKeyLog={(log) => setKeyLogs(prev => prev.map(l => l.id === log.id ? log : l))}
          onDeleteKeyLog={(id) => setKeyLogs(prev => prev.filter(l => l.id !== id))}
          onNavigateBack={() => setCurrentView('dashboard')}
        />;

      case 'stats':
        return <StatisticsPage courses={coursesList} attendance={attendance} users={usersList} poles={polesList} dossiers={dossiers} settings={instituteSettings} currentUser={user!} />;

      case 'class-attendance':
        if (!user) return null;
        return <ClassAttendance user={user} courses={coursesList} users={usersList} attendance={attendance} onAddAttendance={(r) => setAttendance([...attendance, r])} settings={instituteSettings} />;

      case 'attendance':
        return <PointagePage user={user} schedules={schedules} attendance={attendance} settings={instituteSettings} onClockIn={handleClockIn} />;

      case 'chat':
        return <Chat 
          currentUser={user} 
          users={usersList} 
          courses={coursesList} 
          poles={polesList} 
          attendance={attendance} 
          dossiers={dossiers}
          onAddNotification={addNotification} 
          onNavigate={(view, targetId) => {
            if (view === 'inscriptions' && targetId) {
              setTargetDossierId(targetId);
            }
            setCurrentView(view);
          }}
          initialRoomId={activeChatRoomId}
        />;

      case 'settings':
        return <SettingsPage settings={instituteSettings} onUpdateSettings={setInstituteSettings} />;

      default:
        return <div className="p-10 text-center">Module en cours de chargement...</div>;
    }
  };

  return (
    <Layout 
        user={user} 
        onLogout={() => { setUser(null); setCurrentView('login'); }} 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
        settings={instituteSettings}
        notifications={notifications.filter(n => n.userId === user?.id)}
        onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
        onNotificationClick={handleNotificationClick}
        onClearNotifications={() => setNotifications(prev => prev.filter(n => n.userId !== user?.id))}
    >
      {renderContent()}

      {/* GLOBAL NEWS MODAL */}
      {selectedNews && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="relative h-48 sm:h-64">
              <img src={selectedNews.image} className="w-full h-full object-cover" alt={selectedNews.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/40 rounded-full transition-colors text-white backdrop-blur-md"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-6 left-8 right-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-insan-orange text-white text-[10px] font-black rounded-full uppercase tracking-widest">Actualité</span>
                  <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{new Date(selectedNews.date).toLocaleDateString()}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">{selectedNews.title}</h2>
              </div>
            </div>
            <div className="p-8 sm:p-10">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                  {selectedNews.content}
                </p>
              </div>
              <div className="mt-10 flex justify-end">
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF VIEWER MODAL */}
      {selectedPdf && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-5xl h-[90vh] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-insan-blue text-white rounded-2xl">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-800 dark:text-white truncate max-w-md">{selectedPdf.title}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visualiseur de document</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a 
                  href={selectedPdf.url} 
                  download={`${selectedPdf.title}.pdf`}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <Download size={16} /> Télécharger
                </a>
                <button 
                  onClick={() => setSelectedPdf(null)} 
                  className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-colors text-slate-500"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 relative">
              <object 
                data={selectedPdf.blobUrl || selectedPdf.url} 
                type="application/pdf"
                className="w-full h-full rounded-xl shadow-inner"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-3xl flex items-center justify-center mb-6">
                    <AlertCircle size={40} />
                  </div>
                  <h4 className="text-xl font-black text-slate-800 dark:text-white mb-2">Aperçu bloqué par le navigateur</h4>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
                    Votre navigateur bloque l'affichage direct du PDF pour des raisons de sécurité. 
                    Veuillez télécharger le document pour le consulter.
                  </p>
                  <a 
                    href={selectedPdf.url} 
                    download={`${selectedPdf.title}.pdf`}
                    className="px-8 py-4 bg-insan-blue text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:scale-105 transition-all active:scale-95 flex items-center gap-3"
                  >
                    <Download size={20} /> Télécharger le PDF
                  </a>
                </div>
              </object>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
