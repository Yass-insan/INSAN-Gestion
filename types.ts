
export enum UserRole {
  ADMIN = 'ADMIN',
  PROFESSOR = 'PROFESSOR',
  STUDENT = 'STUDENT',
  EMPLOYEE = 'EMPLOYEE',
  RESPONSIBLE = 'RESPONSIBLE'
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  JUSTIFIED = 'JUSTIFIED'
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum LeaveType {
  SICK = 'MALADIE',
  VACATION = 'CONGÉS PAYÉS',
  UNPAID = 'SANS SOLDE',
  OTHER = 'AUTRE'
}

export enum RegistrationStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED'
}

export interface Pole {
  id: string;
  name: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  secondaryRoles?: UserRole[];
  function?: string;
  avatar?: string;
  classId?: string;
  managedPole?: string;
  hourlyRate?: number;
  contractHours?: number;
  phone?: string;
}

export enum PaymentMethod {
  CASH = 'ESPÈCES',
  CARD = 'CARTE',
  TRANSFER = 'VIREMENT',
  CHECK = 'CHÈQUE'
}

export enum CourseFormula {
  ON_SITE = 'PRÉSENTIEL',
  REMOTE = 'DISTANCIEL',
  HYBRID = 'HYBRIDE'
}

export interface LegalGuardian {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface PaymentEntry {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  recordedBy: string;
  isConfirmed: boolean;
}

export interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  genre: 'M' | 'F';
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface EnrollmentItem {
  studentId: string;
  courseId: string;
  formula?: CourseFormula;
  basePrice: number;
  formulaSurcharge?: number;
  isVolunteerTeacher: boolean;
  status?: RegistrationStatus;
  cancelledAt?: string;
}

export interface RegistrationDossier {
  id: string;
  status?: RegistrationStatus;
  createdAt?: string;
  updatedAt: string;
  cancelledAt?: string;
  updatedBy: string;
  
  address: string;
  zipCode: string;
  city: string;

  firstName: string; 
  lastName: string;
  email: string;
  phone: string;

  students: StudentInfo[];
  enrollments: EnrollmentItem[];
  
  guardians: LegalGuardian[];
  isMontessoriMandatory: boolean;

  dossierFees: number;
  montessoriFees: number;
  autoDiscount: number;
  multiChildDiscount: number;
  manualDiscount?: number;
  
  payments: PaymentEntry[];
  installmentCount: number;
  isInstallmentPlan: boolean;
  
  comments?: string;
}

export interface PricingSettings {
  coursePrices: Record<string, { onSite: number; remote: number }>;
  hybridSurcharge?: number;
  dossierFees: number;
  montessoriFees: number;
  discounts: {
    multiCourse: number;
    multiChild: number;
  }
}

export interface WorkSchedule {
  id: string;
  userId: string;
  dayOfWeek?: number;
  date?: string;
  startTime: string;
  endTime: string;
  courseId?: string;
  activityTitle?: string;
  type: 'RECURRING' | 'EXCEPTION';
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
  status: LeaveStatus;
  requestDate: string;
  replacementUserId?: string;
}

export interface GlobalHoliday {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  level?: string;
  professorIds: string[];
  schedule: string; 
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  pole: string;
  recurrenceType?: 'WEEKLY' | 'MONTHLY' | 'ROTATION';
  isManualAttendance?: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: AttendanceStatus;
  entryTimestamp: string; 
  exitTimestamp?: string;
  justification?: string;
  justificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  examName: string;
  grade: number;
  coefficient: number;
  date: string;
}

export interface Homework {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  assignedBy: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  isUrgent?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  time: string;
}

export interface InstituteSettings {
  name: string;
  address: string;
  lat: number;
  lng: number;
  radius: number;
  rooms: string[];
}

// --- CHAT TYPES ---
export enum ChatRoomType {
  CLASS = 'CLASS',
  GROUP = 'GROUP',
  PRIVATE = 'PRIVATE'
}

export interface ChatRoom {
  id: string;
  name: string;
  type: ChatRoomType;
  memberIds: string[];
  adminIds: string[];
  courseId?: string;
  communityId?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
  attachmentUrl?: string;
  attachmentType?: 'image';
}

// --- FOLLOW UP TYPES ---
export enum FollowUpStatus {
  TO_CONTACT = 'TO_CONTACT',
  CONTACTED = 'CONTACTED',
  NO_ANSWER = 'NO_ANSWER'
}

export interface FollowUpAction {
    id: string;
    date: string;
    status: FollowUpStatus;
    comment: string;
    performedBy: string;
}

export interface FollowUpRecord {
  id: string;
  studentId: string;
  courseId: string;
  status: FollowUpStatus;
  lastActionDate: string;
  history: FollowUpAction[];
}