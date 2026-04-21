
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
  managerIds?: string[];
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
  managedPoleIds?: string[];
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
  method: string;
  recordedBy: string;
  isConfirmed: boolean;
  encashmentDate?: '5' | '15';
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
  createdBy?: string;
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
  signature?: string;
  signedAt?: string;
  cgvAccepted?: boolean;
  submittedForms?: StudentFormRequest[];
}

export interface PricingSettings {
  coursePrices: Record<string, { onSite: number; remote: number }>;
  hybridSurcharge?: number;
  dossierFees: number;
  montessoriFees: number;
  discounts: {
    multiCourse: number;
    multiChild: number;
  };
  paymentMethods?: string[];
}

export interface AvailabilitySlot {
  id: string;
  userId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface WorkSchedule {
  id: string;
  userId: string;
  dayOfWeek?: number;
  date?: string;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
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

export interface ReplacementSlot {
  id: string;
  leaveRequestId: string;
  date: string;
  startTime: string;
  endTime: string;
  originalUserId: string;
  replacementUserId?: string;
  activityTitle: string;
  type: 'COURSE' | 'SCHEDULE';
  courseId?: string;
}

export interface GlobalHoliday {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface CourseModule {
  title: string;
  description?: string;
}

export interface CourseSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
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
  capacity?: number;
  schedules?: CourseSchedule[];
  
  // Champs marketing & pédagogiques pour la vitrine
  imageUrl?: string;
  description?: string;
  objectives?: string[];
  curriculum?: CourseModule[];
  audience?: string;
  duration?: string;
  prerequisites?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: AttendanceStatus;
  recordedBy?: string;
  entryTimestamp?: string; 
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
  dueDate?: string;
  assignedBy: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'pdf';
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
  category?: string;
  excerpt?: string;
  visibleTo: UserRole[];
  coverUrl?: string;
  galleryUrls?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  time: string;
  link?: string;
  metadata?: {
    newsId?: string;
    roomId?: string;
    courseId?: string;
    type?: 'news' | 'chat' | 'course' | 'attendance_alert';
    key?: string;
  };
}

export interface Room {
  name: string;
  capacity: number;
}

export interface InstituteSettings {
  name: string;
  address: string;
  lat: number;
  lng: number;
  radius: number;
  rooms: Room[];
  language?: string;
  currency?: string;
  cgv?: string;
  cgvExcerpt?: string;
  logo?: string;
  logoDark?: string;
  lateThresholdMinutes: number;
  emailTemplate?: {
    subject: string;
    body: string;
    attachments?: { filename: string; path?: string; content?: string }[];
  };
}

export enum ChatRoomType {
  CLASS = 'CLASS',
  GROUP = 'GROUP',
  PRIVATE = 'PRIVATE'
}

export interface ChatRoomSettings {
  canMembersAddOthers: boolean;
  canMembersSendMessages: boolean;
  canMembersCreateGroups?: boolean;
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
  settings?: ChatRoomSettings;
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

export interface TestCourse {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  poleId: string;
  courseId: string;
  createdAt: string;
}

export enum WaitingListStatus {
  WAITING = 'En attente',
  TO_CONTACT = 'À contacter',
  REFUSED = 'Refusé',
  REGISTERED = 'Inscrit',
  MUST_REGISTER = 'Doit venir s\'inscrire',
  NO_RESPONSE = 'Sans réponse'
}

export interface WaitingListEntry {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  email: string;
  poleId: string;
  courseId: string;
  createdAt: string;
  status: WaitingListStatus;
}

export enum DocStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED'
}

export interface DocCategory {
  id: string;
  name: string;
  isMandatory: boolean;
}

export interface EmployeeDoc {
  id: string;
  employeeId: string;
  categoryId: string;
  name: string;
  fileUrl?: string; // The URL of the file uploaded by employee
  adminAttachmentUrl?: string; // The URL of the file sent by admin (e.g. contract to sign)
  status: DocStatus;
  expiryDate?: string;
  message?: string; // Message from admin or employee
  comments?: string;
  uploadedAt?: string;
  updatedAt: string;
}

export interface KeyLog {
  id: string;
  userId: string;
  roomName: string;
  borrowedAt: string;
  returnedAt?: string;
  isReturned: boolean;
  notes?: string;
}

// --- STUDENT DOCUMENTATION & FORMS ---
export enum FormFieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  CHECKBOX = 'CHECKBOX',
  LONG_TEXT = 'LONG_TEXT'
}

export interface FormFieldDefinition {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
}

export interface StudentFormTemplate {
  id: string;
  title: string;
  description: string;
  fields: FormFieldDefinition[];
  createdAt: string;
  createdBy: string;
}

export interface StudentFormRequest {
  id: string;
  templateId: string;
  studentId: string;
  status: 'PENDING' | 'COMPLETED';
  requestedAt: string;
  submittedAt?: string;
  submittedData?: Record<string, any>;
}
