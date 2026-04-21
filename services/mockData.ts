
import { User, UserRole, Course, AttendanceStatus, AttendanceRecord, Homework, NewsItem, Notification, WorkSchedule, Grade, Pole, LeaveRequest, LeaveType, LeaveStatus } from '../types';

export const POLES: Pole[] = [
    { id: 'ADULTE', name: 'Adultes', color: 'blue' },
    { id: 'ENFANCE', name: 'Enfance', color: 'yellow' },
    { id: 'JEUNESSE_FRERE', name: 'Jeunesse Frère', color: 'green' },
    { id: 'JEUNESSE_SOEUR', name: 'Jeunesse Sœur', color: 'pink' },
    { id: 'CORAN_FRERE', name: 'Coran Frère', color: 'indigo' },
    { id: 'CORAN_SOEUR', name: 'Coran Sœur', color: 'purple' },
];

export const COURSES: Course[] = [
  { 
    id: 'c1', 
    name: 'HÉRITIÈRES DE LA LUMIÈRE', 
    level: 'PROGRAMME FEMME', 
    professorIds: ['2'], 
    schedule: 'Samedi 09:00 - 12:00', 
    dayOfWeek: 6, 
    startTime: '09:00', 
    endTime: '12:00', 
    room: 'Salle A', 
    pole: 'ADULTE', 
    capacity: 25,
    imageUrl: 'https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=800&auto=format&fit=crop',
    description: 'Un cursus de sciences islamiques complet et modulaire dédié aux femmes, visant à construire une pratique religieuse éclairée et sereine.',
    audience: 'Femmes (à partir de 18 ans)',
    duration: '1 an (Module renouvelable)',
    prerequisites: 'Motivation et assiduité',
    objectives: [
      'Acquérir les bases fondamentales de la foi (Aqida)',
      'Maîtriser le droit du culte au quotidien (Fiqh)',
      'Découvrir la vie des femmes exemplaires de l\'histoire islamique',
      'Initier une réforme spirituelle personnelle (Tazkiya)'
    ],
    curriculum: [
      { title: 'Module 1 : Spiritualité & Éveil', description: 'Étude des cœurs et des stations de la foi.' },
      { title: 'Module 2 : Jurisprudence (Fiqh)', description: 'Règles de la purification et de la prière.' },
      { title: 'Module 3 : Sira & Modèles', description: 'Le Prophète (saw) et ses compagnes.' },
      { title: 'Module 4 : Sciences du Coran', description: 'Introduction à l\'exégèse (Tafsir).' }
    ]
  },
  { 
    id: 'c2', 
    name: 'LANGUE ARABE LITTÉRAIRE', 
    level: 'DÉBUTANT / INTERMÉDIAIRE', 
    professorIds: ['2'], 
    schedule: 'Dimanche 14:00 - 17:00', 
    dayOfWeek: 0, 
    startTime: '14:00', 
    endTime: '17:00', 
    room: 'Salle B', 
    pole: 'ADULTE', 
    capacity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1528659103986-905141e17d23?q=80&w=800&auto=format&fit=crop',
    description: 'Apprendre à lire, écrire et comprendre la langue du Coran avec une méthode moderne privilégiant l\'interaction.',
    audience: 'Tout public adulte',
    duration: 'Cursus annuel',
    prerequisites: 'Connaître l\'alphabet pour le niveau intermédiaire',
    objectives: [
      'Acquérir une fluidité de lecture',
      'Comprendre les structures grammaticales de base',
      'Développer un vocabulaire usuel et religieux',
      'Pratiquer l\'expression orale'
    ],
    curriculum: [
      { title: 'Phonétique & Écriture', description: 'Maîtrise des sons et de la graphie.' },
      { title: 'Grammaire (Nahw)', description: 'Étude de la structure de la phrase.' },
      { title: 'Vocabulaire thématique', description: 'Vie quotidienne et lexique spirituel.' }
    ]
  },
  { 
    id: 'c3', 
    name: 'PÔLE ENFANCE : ÉVEIL ET VALEURS', 
    level: 'DÈS 6 ANS', 
    professorIds: ['5'], 
    schedule: 'Mercredi 14:00 - 16:30', 
    dayOfWeek: 3, 
    startTime: '14:00', 
    endTime: '16:30', 
    room: 'Salle C', 
    pole: 'ENFANCE', 
    capacity: 15,
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop',
    description: 'Une pédagogie bienveillante et ludique pour transmettre les bases de la foi et les valeurs universelles de l\'Islam aux plus jeunes.',
    audience: 'Enfants de 6 à 10 ans',
    prerequisites: 'Aucun',
    objectives: [
      'Découvrir les piliers de l\'Islam par le jeu',
      'Apprendre les dou\'as du quotidien',
      'Développer l\'amour pour Dieu et Son Messager',
      'Pratiquer la fraternité en groupe'
    ],
    curriculum: [
      { title: 'Contes Coraniques', description: 'L\'histoire des Prophètes racontée aux enfants.' },
      { title: 'Ateliers Créatifs', description: 'Exprimer sa foi par le dessin et le bricolage.' },
      { title: 'Bases du Comportement', description: 'La politesse et l\'éthique musulmane (Adab).' }
    ]
  }
];

export const NEWS_LIST: NewsItem[] = [
  { 
    id: 'n1', 
    title: 'Journée Portes Ouvertes 2024', 
    content: 'Venez découvrir nos locaux et rencontrer l\'équipe pédagogique le 15 Juin prochain. Ateliers gratuits pour les enfants.', 
    excerpt: 'Une occasion unique de découvrir l\'excellence éducative de l\'Institut Insan.',
    date: '2024-05-01', 
    author: 'Direction',
    category: 'Événement',
    mediaUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop',
    mediaType: 'image',
    visibleTo: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT, UserRole.EMPLOYEE, UserRole.RESPONSIBLE],
    coverUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop',
    galleryUrls: [
      'https://images.unsplash.com/photo-1523050853064-8521a3998afb?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=400&auto=format&fit=crop'
    ]
  },
  { 
    id: 'n2', 
    title: 'Lancement du Pôle Jeunesse 2.0', 
    content: 'Découvrez nos nouveaux modules de leadership et d\'épanouissement personnel pour les 12-17 ans.', 
    excerpt: 'Accompagner la jeunesse vers un avenir serein et engagé.',
    date: '2024-04-20', 
    author: 'Direction',
    category: 'Nouveauté',
    mediaUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=800&auto=format&fit=crop',
    isUrgent: true,
    visibleTo: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT, UserRole.EMPLOYEE, UserRole.RESPONSIBLE],
    coverUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=800&auto=format&fit=crop'
  }
];

export const USERS: User[] = [
  { id: '1', name: 'Admin Insan', email: 'admin@insan.com', role: UserRole.ADMIN, function: 'Directeur', avatar: 'https://ui-avatars.com/api/?name=Admin+Insan&background=262262&color=fff', hourlyRate: 35 },
  { id: '2', name: 'Prof. Ahmed', email: 'prof@insan.com', role: UserRole.PROFESSOR, function: 'Enseignant', avatar: 'https://ui-avatars.com/api/?name=Prof+Ahmed&background=f7941d&color=fff', hourlyRate: 25, contractHours: 10 },
  { id: '3', name: 'Étudiant Ali', email: 'etudiant@insan.com', role: UserRole.STUDENT, classId: 'c1', avatar: 'https://ui-avatars.com/api/?name=Ali+Ben&background=random' },
  { id: '4', name: 'Secrétaire Sarah', email: 'secretaire@insan.com', role: UserRole.EMPLOYEE, function: 'Secrétaire Administrative', avatar: 'https://ui-avatars.com/api/?name=Sarah+Sec&background=random', hourlyRate: 15, contractHours: 35 },
  { id: '5', name: 'Resp. Jeunesse', email: 'resp@insan.com', role: UserRole.RESPONSIBLE, secondaryRoles: [UserRole.PROFESSOR], function: 'Responsable Pôle & Prof', managedPoleIds: ['JEUNESSE_FRERE'], avatar: 'https://ui-avatars.com/api/?name=Resp+J&background=random', hourlyRate: 20, contractHours: 20 },
  { id: 's1', name: 'Yassine Belkacem', email: 'yassine@example.com', role: UserRole.STUDENT, classId: 'c1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yassine' },
  { id: 's2', name: 'Amine Kadi', email: 'amine@example.com', role: UserRole.STUDENT, classId: 'c1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amine' },
  { id: 's3', name: 'Sofia Lalami', email: 'sofia@example.com', role: UserRole.STUDENT, classId: 'c2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia' },
  { id: 's4', name: 'Zineb Mansouri', email: 'zineb@example.com', role: UserRole.STUDENT, classId: 'c2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zineb' },
  { id: 's5', name: 'Omar Dridi', email: 'omar@example.com', role: UserRole.STUDENT, classId: 'c3', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar' },
  { id: 's6', name: 'Leila Slimani', email: 'leila@example.com', role: UserRole.STUDENT, classId: 'c3', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leila' },
  { id: 's7', name: 'Karim Tazi', email: 'karim@example.com', role: UserRole.STUDENT, classId: 'c1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karim' },
  { id: 's8', name: 'Nadia Rahmani', email: 'nadia@example.com', role: UserRole.STUDENT, classId: 'c2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nadia' },
  { id: 's9', name: 'Hassan Fathi', email: 'hassan@example.com', role: UserRole.STUDENT, classId: 'c3', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hassan' },
  { id: 's10', name: 'Myriam Vallet', email: 'myriam@example.com', role: UserRole.STUDENT, classId: 'c1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Myriam' },
];

export const WORK_SCHEDULES: WorkSchedule[] = [
  { id: 'ws1', userId: '4', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', type: 'RECURRING', activityTitle: 'Secrétariat' },
  { id: 'ws2', userId: '4', dayOfWeek: 2, startTime: '09:00', endTime: '17:00', type: 'RECURRING', activityTitle: 'Secrétariat' },
  { id: 'ws4', userId: '2', dayOfWeek: 6, startTime: '09:00', endTime: '12:00', courseId: 'c1', type: 'RECURRING', activityTitle: 'Cours: HÉRITIÈRES DE LA LUMIÈRE' },
];

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'l1', userId: '4', type: LeaveType.VACATION, startDate: '2023-11-20', endDate: '2023-11-25', status: LeaveStatus.APPROVED, requestDate: '2023-10-15' },
];

export const ATTENDANCE_HISTORY: AttendanceRecord[] = [
  { id: 'a1', studentId: '3', courseId: 'c1', date: '2023-10-01', status: AttendanceStatus.PRESENT, entryTimestamp: '08:55' },
  // Yassine Belkacem (s1) - 4 absences
  { id: 'att_s1_1', studentId: 's1', courseId: 'c1', date: '2026-03-28', status: AttendanceStatus.ABSENT },
  { id: 'att_s1_2', studentId: 's1', courseId: 'c1', date: '2026-03-21', status: AttendanceStatus.ABSENT },
  { id: 'att_s1_3', studentId: 's1', courseId: 'c1', date: '2026-03-14', status: AttendanceStatus.ABSENT },
  { id: 'att_s1_4', studentId: 's1', courseId: 'c1', date: '2026-03-07', status: AttendanceStatus.ABSENT },
  // Amine Kadi (s2) - 3 absences
  { id: 'att_s2_1', studentId: 's2', courseId: 'c1', date: '2026-03-28', status: AttendanceStatus.ABSENT },
  { id: 'att_s2_2', studentId: 's2', courseId: 'c1', date: '2026-03-21', status: AttendanceStatus.ABSENT },
  { id: 'att_s2_3', studentId: 's2', courseId: 'c1', date: '2026-03-14', status: AttendanceStatus.ABSENT },
  // Sofia Lalami (s3) - 5 absences
  { id: 'att_s3_1', studentId: 's3', courseId: 'c2', date: '2026-03-29', status: AttendanceStatus.ABSENT },
  { id: 'att_s3_2', studentId: 's3', courseId: 'c2', date: '2026-03-22', status: AttendanceStatus.ABSENT },
  { id: 'att_s3_3', studentId: 's3', courseId: 'c2', date: '2026-03-15', status: AttendanceStatus.ABSENT },
  { id: 'att_s3_4', studentId: 's3', courseId: 'c2', date: '2026-03-08', status: AttendanceStatus.ABSENT },
  { id: 'att_s3_5', studentId: 's3', courseId: 'c2', date: '2026-03-01', status: AttendanceStatus.ABSENT },
  // Zineb Mansouri (s4) - 3 absences
  { id: 'att_s4_1', studentId: 's4', courseId: 'c2', date: '2026-03-29', status: AttendanceStatus.ABSENT },
  { id: 'att_s4_2', studentId: 's4', courseId: 'c2', date: '2026-03-22', status: AttendanceStatus.ABSENT },
  { id: 'att_s4_3', studentId: 's4', courseId: 'c2', date: '2026-03-15', status: AttendanceStatus.ABSENT },
  // Omar Dridi (s5) - 4 absences
  { id: 'att_s5_1', studentId: 's5', courseId: 'c3', date: '2026-03-25', status: AttendanceStatus.ABSENT },
  { id: 'att_s5_2', studentId: 's5', courseId: 'c3', date: '2026-03-18', status: AttendanceStatus.ABSENT },
  { id: 'att_s5_3', studentId: 's5', courseId: 'c3', date: '2026-03-11', status: AttendanceStatus.ABSENT },
  { id: 'att_s5_4', studentId: 's5', courseId: 'c3', date: '2026-03-04', status: AttendanceStatus.ABSENT },
  // Leila Slimani (s6) - 3 absences
  { id: 'att_s6_1', studentId: 's6', courseId: 'c3', date: '2026-03-25', status: AttendanceStatus.ABSENT },
  { id: 'att_s6_2', studentId: 's6', courseId: 'c3', date: '2026-03-18', status: AttendanceStatus.ABSENT },
  { id: 'att_s6_3', studentId: 's6', courseId: 'c3', date: '2026-03-11', status: AttendanceStatus.ABSENT },
  // Karim Tazi (s7) - 3 absences
  { id: 'att_s7_1', studentId: 's7', courseId: 'c1', date: '2026-03-28', status: AttendanceStatus.ABSENT },
  { id: 'att_s7_2', studentId: 's7', courseId: 'c1', date: '2026-03-21', status: AttendanceStatus.ABSENT },
  { id: 'att_s7_3', studentId: 's7', courseId: 'c1', date: '2026-03-14', status: AttendanceStatus.ABSENT },
  // Nadia Rahmani (s8) - 4 absences
  { id: 'att_s8_1', studentId: 's8', courseId: 'c2', date: '2026-03-29', status: AttendanceStatus.ABSENT },
  { id: 'att_s8_2', studentId: 's8', courseId: 'c2', date: '2026-03-22', status: AttendanceStatus.ABSENT },
  { id: 'att_s8_3', studentId: 's8', courseId: 'c2', date: '2026-03-15', status: AttendanceStatus.ABSENT },
  { id: 'att_s8_4', studentId: 's8', courseId: 'c2', date: '2026-03-08', status: AttendanceStatus.ABSENT },
  // Hassan Fathi (s9) - 3 absences
  { id: 'att_s9_1', studentId: 's9', courseId: 'c3', date: '2026-03-25', status: AttendanceStatus.ABSENT },
  { id: 'att_s9_2', studentId: 's9', courseId: 'c3', date: '2026-03-18', status: AttendanceStatus.ABSENT },
  { id: 'att_s9_3', studentId: 's9', courseId: 'c3', date: '2026-03-11', status: AttendanceStatus.ABSENT },
  // Myriam Vallet (s10) - 3 absences
  { id: 'att_s10_1', studentId: 's10', courseId: 'c1', date: '2026-03-28', status: AttendanceStatus.ABSENT },
  { id: 'att_s10_2', studentId: 's10', courseId: 'c1', date: '2026-03-21', status: AttendanceStatus.ABSENT },
  { id: 'att_s10_3', studentId: 's10', courseId: 'c1', date: '2026-03-14', status: AttendanceStatus.ABSENT },
];

export const HOMEWORK_LIST: Homework[] = [
  { id: 'h1', courseId: 'c1', title: 'Résumé du Chapitre 3', description: 'Faire un résumé de 200 mots sur les conditions de la prière.', dueDate: '2023-11-01', assignedBy: 'Prof. Ahmed' },
];

export const NOTIFICATIONS: Notification[] = [
  { id: '1', userId: '3', title: 'Retard Détecté', message: 'Vous avez été marqué en retard au cours de Tafsir.', type: 'warning', read: false, time: 'Il y a 10 min' },
];
