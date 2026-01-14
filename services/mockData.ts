
import { User, UserRole, Course, AttendanceStatus, AttendanceRecord, Homework, NewsItem, Notification, WorkSchedule, Grade, Pole, LeaveRequest, LeaveType, LeaveStatus } from '../types';

export const POLES: Pole[] = [
    { id: 'ADULTE', name: 'Adultes', color: 'blue' },
    { id: 'ENFANCE', name: 'Enfance', color: 'yellow' },
    { id: 'JEUNESSE_FRERE', name: 'Jeunesse Frère', color: 'green' },
    { id: 'JEUNESSE_SOEUR', name: 'Jeunesse Sœur', color: 'pink' },
    { id: 'CORAN_FRERE', name: 'Coran Frère', color: 'indigo' },
    { id: 'CORAN_SOEUR', name: 'Coran Sœur', color: 'purple' },
];

export const USERS: User[] = [
  { id: '1', name: 'Admin Insan', email: 'admin@insan.com', role: UserRole.ADMIN, function: 'Directeur', avatar: 'https://ui-avatars.com/api/?name=Admin+Insan&background=262262&color=fff', hourlyRate: 35 },
  { id: '2', name: 'Prof. Ahmed', email: 'prof@insan.com', role: UserRole.PROFESSOR, function: 'Enseignant', avatar: 'https://ui-avatars.com/api/?name=Prof+Ahmed&background=f7941d&color=fff', hourlyRate: 25, contractHours: 10 },
  { id: '3', name: 'Étudiant Ali', email: 'etudiant@insan.com', role: UserRole.STUDENT, classId: 'c1', avatar: 'https://ui-avatars.com/api/?name=Ali+Ben&background=random' },
  { id: '4', name: 'Secrétaire Sarah', email: 'secretaire@insan.com', role: UserRole.EMPLOYEE, function: 'Secrétaire Administrative', avatar: 'https://ui-avatars.com/api/?name=Sarah+Sec&background=random', hourlyRate: 15, contractHours: 35 },
  { id: '5', name: 'Resp. Jeunesse', email: 'resp@insan.com', role: UserRole.RESPONSIBLE, secondaryRoles: [UserRole.PROFESSOR], function: 'Responsable Pôle & Prof', managedPole: 'JEUNESSE_FRERE', avatar: 'https://ui-avatars.com/api/?name=Resp+J&background=random', hourlyRate: 20, contractHours: 20 },
  { id: '6', name: 'Étudiant Bilal', email: 'bilal@insan.com', role: UserRole.STUDENT, classId: 'c1', avatar: 'https://ui-avatars.com/api/?name=Bilal+X&background=random' },
  { id: '7', name: 'Étudiant Karim', email: 'karim@insan.com', role: UserRole.STUDENT, classId: 'c1', avatar: 'https://ui-avatars.com/api/?name=Karim+Y&background=random' },
  { id: '8', name: 'Cheikh Ibrahim', email: 'cheikh@insan.com', role: UserRole.PROFESSOR, function: 'Intervenant Mensuel', avatar: 'https://ui-avatars.com/api/?name=Cheikh+I&background=random', hourlyRate: 50, contractHours: 5 },
  
  // --- NOUVEAUX ÉLÈVES POUR LE SUIVI ABSENCES (MOCK) ---
  { id: '10', name: 'Yassine Benali', email: 'yassine@insan.com', role: UserRole.STUDENT, classId: 'c1', avatar: 'https://ui-avatars.com/api/?name=Yassine+B&background=ef4444&color=fff' },
  { id: '11', name: 'Fatima Zahra', email: 'fatima@insan.com', role: UserRole.STUDENT, classId: 'c2', avatar: 'https://ui-avatars.com/api/?name=Fatima+Z&background=f97316&color=fff' },
  { id: '12', name: 'Omar Sylla', email: 'omar@insan.com', role: UserRole.STUDENT, classId: 'c3', avatar: 'https://ui-avatars.com/api/?name=Omar+S&background=random' },
  { id: '13', name: 'Zineb El Amrani', email: 'zineb@insan.com', role: UserRole.STUDENT, classId: 'c4', avatar: 'https://ui-avatars.com/api/?name=Zineb+E&background=random' },
  { id: '14', name: 'Ibrahim K.', email: 'ibrahimk@insan.com', role: UserRole.STUDENT, classId: 'c1', avatar: 'https://ui-avatars.com/api/?name=Ibrahim+K&background=random' },
  { id: '15', name: 'Layla M.', email: 'layla@insan.com', role: UserRole.STUDENT, classId: 'c2', avatar: 'https://ui-avatars.com/api/?name=Layla+M&background=random' },
  { id: '16', name: 'Khadija O.', email: 'khadija@insan.com', role: UserRole.STUDENT, classId: 'c3', avatar: 'https://ui-avatars.com/api/?name=Khadija+O&background=random' },
  { id: '17', name: 'Mohamed Ali', email: 'mali@insan.com', role: UserRole.STUDENT, classId: 'c1', avatar: 'https://ui-avatars.com/api/?name=Mohamed+A&background=random' },
  { id: '18', name: 'Sofiane B.', email: 'sofiane@insan.com', role: UserRole.STUDENT, classId: 'c4', avatar: 'https://ui-avatars.com/api/?name=Sofiane+B&background=random' },
  { id: '19', name: 'Noura T.', email: 'noura@insan.com', role: UserRole.STUDENT, classId: 'c2', avatar: 'https://ui-avatars.com/api/?name=Noura+T&background=random' },
];

export const WORK_SCHEDULES: WorkSchedule[] = [
  { id: 'ws1', userId: '4', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', type: 'RECURRING', activityTitle: 'Secrétariat' },
  { id: 'ws2', userId: '4', dayOfWeek: 2, startTime: '09:00', endTime: '17:00', type: 'RECURRING', activityTitle: 'Secrétariat' },
  { id: 'ws3', userId: '4', dayOfWeek: 4, startTime: '09:00', endTime: '12:00', type: 'RECURRING', activityTitle: 'Permanence' },
  { id: 'ws4', userId: '2', dayOfWeek: 6, startTime: '09:00', endTime: '12:00', courseId: 'c1', type: 'RECURRING', activityTitle: 'Cours: SCIENCES ISLAMIQUES' },
  { id: 'ws5', userId: '2', dayOfWeek: 0, startTime: '14:00', endTime: '16:00', courseId: 'c2', type: 'RECURRING', activityTitle: 'Cours: TAFSIR' },
  { id: 'ws6', userId: '4', date: '2023-11-15', startTime: '18:00', endTime: '20:00', type: 'EXCEPTION', activityTitle: 'Réunion Parents' },
];

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'l1', userId: '4', type: LeaveType.VACATION, startDate: '2023-11-20', endDate: '2023-11-25', status: LeaveStatus.APPROVED, requestDate: '2023-10-15' },
  { id: 'l2', userId: '2', type: LeaveType.SICK, startDate: '2023-10-30', endDate: '2023-10-31', reason: 'Grippe', status: LeaveStatus.PENDING, requestDate: '2023-10-28' },
];

export const COURSES: Course[] = [
  { id: 'c1', name: 'SCIENCES ISLAMIQUES', level: 'NIVEAU 1', professorIds: ['2', '8', '5'], schedule: 'Samedi 09:00 - 12:00', dayOfWeek: 6, startTime: '09:00', endTime: '12:00', room: 'Salle A', pole: 'ADULTE', recurrenceType: 'ROTATION', isManualAttendance: false },
  { id: 'c2', name: 'TAFSIR', level: 'TOUS NIVEAUX', professorIds: ['2'], schedule: 'Dimanche 14:00 - 16:00', dayOfWeek: 0, startTime: '14:00', endTime: '16:00', room: 'Salle B', pole: 'ADULTE', recurrenceType: 'WEEKLY', isManualAttendance: false },
  { id: 'c3', name: 'VIE DU PROPHÈTE (SAW)', level: 'NIVEAU 2', professorIds: ['2'], schedule: 'Samedi 14:00 - 16:00', dayOfWeek: 6, startTime: '14:00', endTime: '16:00', room: 'Salle A', pole: 'JEUNESSE_FRERE', recurrenceType: 'WEEKLY', isManualAttendance: true },
  { id: 'c4', name: 'CORAN ENFANCE', level: 'HIFZ', professorIds: ['2'], schedule: 'Dimanche 09:00 - 12:00', dayOfWeek: 0, startTime: '09:00', endTime: '12:00', room: 'Salle C', pole: 'CORAN_FRERE', recurrenceType: 'WEEKLY', isManualAttendance: true },
];

// Helper pour générer des IDs uniques
const uid = () => Math.random().toString(36).substr(2, 9);

export const ATTENDANCE_HISTORY: AttendanceRecord[] = [
  { id: 'a1', studentId: '3', courseId: 'c1', date: '2023-10-01', status: AttendanceStatus.PRESENT, entryTimestamp: '08:55' },
  { id: 'a2', studentId: '3', courseId: 'c1', date: '2023-10-08', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: 'a3', studentId: '3', courseId: 'c1', date: '2023-10-15', status: AttendanceStatus.LATE, entryTimestamp: '09:20' },
  { id: 'a4', studentId: '6', courseId: 'c1', date: '2023-10-01', status: AttendanceStatus.PRESENT, entryTimestamp: '08:50' },
  { id: 'a5', studentId: '7', courseId: 'c1', date: '2023-10-01', status: AttendanceStatus.PRESENT, entryTimestamp: '09:00' },
  
  // --- MOCK DATA POUR SUIVI ABSENCES (DATES RÉCENTES: NOVEMBRE 2023) ---
  
  // ID 10: Yassine (5 Absences consécutives - CAS CRITIQUE)
  { id: uid(), studentId: '10', courseId: 'c1', date: '2023-11-25', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '10', courseId: 'c1', date: '2023-11-18', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '10', courseId: 'c1', date: '2023-11-11', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '10', courseId: 'c1', date: '2023-11-04', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '10', courseId: 'c1', date: '2023-10-28', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '10', courseId: 'c1', date: '2023-10-21', status: AttendanceStatus.PRESENT, entryTimestamp: '09:00' }, // Stop here

  // ID 11: Fatima (3 Absences, dont 1 justifiée)
  { id: uid(), studentId: '11', courseId: 'c2', date: '2023-11-26', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '11', courseId: 'c2', date: '2023-11-19', status: AttendanceStatus.JUSTIFIED, entryTimestamp: '', justification: 'Maladie' },
  { id: uid(), studentId: '11', courseId: 'c2', date: '2023-11-12', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '11', courseId: 'c2', date: '2023-11-05', status: AttendanceStatus.PRESENT, entryTimestamp: '14:00' },

  // ID 12: Omar (4 Absences)
  { id: uid(), studentId: '12', courseId: 'c3', date: '2023-11-25', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '12', courseId: 'c3', date: '2023-11-18', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '12', courseId: 'c3', date: '2023-11-11', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '12', courseId: 'c3', date: '2023-11-04', status: AttendanceStatus.ABSENT, entryTimestamp: '' },

  // ID 13: Zineb (3 Absences consécutives)
  { id: uid(), studentId: '13', courseId: 'c4', date: '2023-11-26', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '13', courseId: 'c4', date: '2023-11-19', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '13', courseId: 'c4', date: '2023-11-12', status: AttendanceStatus.ABSENT, entryTimestamp: '' },

  // ID 14: Ibrahim (6 Absences - Décrochage total)
  { id: uid(), studentId: '14', courseId: 'c1', date: '2023-11-25', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '14', courseId: 'c1', date: '2023-11-18', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '14', courseId: 'c1', date: '2023-11-11', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '14', courseId: 'c1', date: '2023-11-04', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '14', courseId: 'c1', date: '2023-10-28', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '14', courseId: 'c1', date: '2023-10-21', status: AttendanceStatus.ABSENT, entryTimestamp: '' },

  // ID 15: Layla (3 Justifiées consécutives - Hospitalisation ?)
  { id: uid(), studentId: '15', courseId: 'c2', date: '2023-11-26', status: AttendanceStatus.JUSTIFIED, entryTimestamp: '', justification: 'Hospitalisation' },
  { id: uid(), studentId: '15', courseId: 'c2', date: '2023-11-19', status: AttendanceStatus.JUSTIFIED, entryTimestamp: '', justification: 'Hospitalisation' },
  { id: uid(), studentId: '15', courseId: 'c2', date: '2023-11-12', status: AttendanceStatus.JUSTIFIED, entryTimestamp: '', justification: 'Hospitalisation' },

  // ID 16: Khadija (4 Absences)
  { id: uid(), studentId: '16', courseId: 'c3', date: '2023-11-25', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '16', courseId: 'c3', date: '2023-11-18', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '16', courseId: 'c3', date: '2023-11-11', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '16', courseId: 'c3', date: '2023-11-04', status: AttendanceStatus.ABSENT, entryTimestamp: '' },

  // ID 17: Mohamed (3 Absences)
  { id: uid(), studentId: '17', courseId: 'c1', date: '2023-11-25', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '17', courseId: 'c1', date: '2023-11-18', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '17', courseId: 'c1', date: '2023-11-11', status: AttendanceStatus.ABSENT, entryTimestamp: '' },

  // ID 18: Sofiane (3 Absences)
  { id: uid(), studentId: '18', courseId: 'c4', date: '2023-11-26', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '18', courseId: 'c4', date: '2023-11-19', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '18', courseId: 'c4', date: '2023-11-12', status: AttendanceStatus.ABSENT, entryTimestamp: '' },

  // ID 19: Noura (5 Absences)
  { id: uid(), studentId: '19', courseId: 'c2', date: '2023-11-26', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '19', courseId: 'c2', date: '2023-11-19', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '19', courseId: 'c2', date: '2023-11-12', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '19', courseId: 'c2', date: '2023-11-05', status: AttendanceStatus.ABSENT, entryTimestamp: '' },
  { id: uid(), studentId: '19', courseId: 'c2', date: '2023-10-29', status: AttendanceStatus.ABSENT, entryTimestamp: '' },

  // Pointages Staff
  { id: 's1', studentId: '4', courseId: 'ADMIN', date: new Date().toISOString().split('T')[0], status: AttendanceStatus.PRESENT, entryTimestamp: '08:58' },
  { id: 's2', studentId: '2', courseId: 'c1', date: new Date().toISOString().split('T')[0], status: AttendanceStatus.LATE, entryTimestamp: '09:15' },
];

export const HOMEWORK_LIST: Homework[] = [
  { id: 'h1', courseId: 'c1', title: 'Résumé du Chapitre 3', description: 'Faire un résumé de 200 mots sur les conditions de la prière.', dueDate: '2023-11-01', assignedBy: 'Prof. Ahmed' },
];

export const GRADES: Grade[] = [
  { id: 'g1', studentId: '3', courseId: 'c1', examName: 'Partiel Trimestre 1', grade: 14.5, coefficient: 2, date: '2023-10-25' },
  { id: 'g2', studentId: '6', courseId: 'c1', examName: 'Partiel Trimestre 1', grade: 16, coefficient: 2, date: '2023-10-25' },
  { id: 'g3', studentId: '7', courseId: 'c1', examName: 'Partiel Trimestre 1', grade: 12, coefficient: 2, date: '2023-10-25' },
];

export const NEWS_LIST: NewsItem[] = [
  { 
    id: 'n1', 
    title: 'Rentrée 2023', 
    content: 'Bienvenue à tous les étudiants pour cette nouvelle année.', 
    date: '2023-09-01', 
    author: 'Direction',
    mediaUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop',
    mediaType: 'image'
  },
  { 
    id: 'n2', 
    title: 'Conférence Exceptionnelle', 
    content: 'Ce dimanche, conférence sur l\'histoire de Lyon.', 
    date: '2023-10-20', 
    author: 'Direction',
    isUrgent: true
  },
];

export const NOTIFICATIONS: Notification[] = [
  { id: '1', userId: '3', title: 'Retard Détecté', message: 'Vous avez été marqué en retard au cours de Tafsir.', type: 'warning', read: false, time: 'Il y a 10 min' },
  { id: '2', userId: '3', title: 'Nouveau Devoir', message: 'Prof. Ahmed a ajouté un devoir pour Samedi.', type: 'info', read: false, time: 'Il y a 1h' },
  { id: '3', userId: '2', title: 'Justification Reçue', message: 'L\'étudiant Ali a envoyé un justificatif médical.', type: 'success', read: false, time: 'Il y a 30 min' },
  { id: '4', userId: '1', title: 'Rapport Hebdo', message: 'Les statistiques de présence sont disponibles.', type: 'info', read: true, time: 'Hier' },
];