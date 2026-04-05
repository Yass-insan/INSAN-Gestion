import React, { useState, useMemo } from 'react';
import { User, UserRole, WorkSchedule, Course, Pole, LeaveRequest, LeaveType, LeaveStatus, AttendanceRecord, GlobalHoliday } from '../../types';
import { Card, Button, Badge, PageHeader } from '../../components/ui/DesignSystem';
import { getStatusColor } from '../../services/utils';
import { Briefcase, UserPlus, History, Clock, X, Calendar, Download, FileText, CheckCircle, AlertCircle, Euro, AlertTriangle, Filter, Plus, CalendarRange, ArrowLeft, ChevronRight, Edit2, Trash2, CheckSquare, Square, Globe, Palmtree, UserCheck, Clock4, Eye, ArrowLeftRight } from 'lucide-react';

interface EmployeeManagementProps { 
  users: User[];
  attendance?: AttendanceRecord[];
  schedules?: WorkSchedule[];
  courses?: Course[];
  poles?: Pole[];
  leaveRequests?: LeaveRequest[];
  globalHolidays?: GlobalHoliday[];
  onAddAttendance?: (record: AttendanceRecord) => void;
  onManageUsers?: (action: 'add' | 'update' | 'delete', user: User) => void;
  onManageSchedule?: (action: 'add' | 'delete', schedule: WorkSchedule) => void;
  onManageLeave?: (action: 'add' | 'update', leave: LeaveRequest) => void;
  onManageGlobalHoliday?: (action: 'add' | 'delete', holiday: GlobalHoliday) => void;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ 
    users, attendance = [], schedules = [], courses = [], poles = [], leaveRequests = [], globalHolidays = [],
    onManageUsers, onManageSchedule, onManageLeave, onManageGlobalHoliday 
}) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    
    // --- NEW: Leave History Modal State ---
    const [isLeaveHistoryModalOpen, setIsLeaveHistoryModalOpen] = useState(false);
    const [historyEmployee, setHistoryEmployee] = useState<User | null>(null);

    const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
    const [activeMainTab, setActiveMainTab] = useState<'staff'|'presence_finance'|'leaves'|'planning'>('staff');
    
    // Detailed Attendance View State
    const [viewingAttendanceUser, setViewingAttendanceUser] = useState<User | null>(null);

    // Leave Requests Tab State
    const [leaveRequestTab, setLeaveRequestTab] = useState<'PENDING' | 'HISTORY'>('PENDING');
    // Map to store selected replacements for pending requests { requestId: replacementUserId }
    const [selectedReplacements, setSelectedReplacements] = useState<Record<string, string>>({});

    // Filters
    const [staffSearch, setStaffSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');

    // Global Holiday Form
    const [globalHolidayName, setGlobalHolidayName] = useState('');
    const [globalStartDate, setGlobalStartDate] = useState('');
    const [globalEndDate, setGlobalEndDate] = useState('');

    // Manual Leave Form (Admin side)
    const [manualEmployeeId, setManualEmployeeId] = useState('');
    const [manualStartDate, setManualStartDate] = useState('');
    const [manualEndDate, setManualEndDate] = useState('');
    const [manualType, setManualType] = useState<LeaveType>(LeaveType.VACATION);
    const [manualReplacementId, setManualReplacementId] = useState('');

    // Form states (Unified for Add & Edit)
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formRole, setFormRole] = useState<UserRole>(UserRole.PROFESSOR);
    const [formFunction, setFormFunction] = useState('');
    const [formRate, setFormRate] = useState(15);
    const [formSecondaryRoles, setFormSecondaryRoles] = useState<UserRole[]>([]);

    // Error & Confirmation States
    const [formError, setFormError] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'employee' | 'schedule' | 'holiday' | null, item: any }>({ type: null, item: null });

    // Schedule Form
    const [schedType, setSchedType] = useState<'RECURRING' | 'EXCEPTION'>('RECURRING');
    const [schedDay, setSchedDay] = useState(1);
    const [schedDate, setSchedDate] = useState('');
    const [schedStart, setSchedStart] = useState('09:00');
    const [schedEnd, setSchedEnd] = useState('17:00');
    const [schedBreakStart, setSchedBreakStart] = useState('');
    const [schedBreakEnd, setSchedBreakEnd] = useState('');
    const [schedActivity, setSchedActivity] = useState('');

    const staff = users.filter(u => u.role !== UserRole.STUDENT && u.role !== UserRole.ADMIN);

    const calculateDuration = (start: string, end: string, breakStart?: string, breakEnd?: string) => {
        if (!start || !end) return 0;
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        let totalMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
        
        if (breakStart && breakEnd) {
            const [bh1, bm1] = breakStart.split(':').map(Number);
            const [bh2, bm2] = breakEnd.split(':').map(Number);
            const breakMinutes = (bh2 * 60 + bm2) - (bh1 * 60 + bm1);
            if (breakMinutes > 0) {
                totalMinutes -= breakMinutes;
            }
        }
        
        return Math.max(0, totalMinutes / 60);
    };

    const totalWeeklyHours = useMemo(() => {
        if (!selectedEmployee) return 0;
        
        let total = 0;
        
        // Regular schedules
        const empSchedules = schedules.filter(s => s.userId === selectedEmployee.id && s.type === 'RECURRING');
        empSchedules.forEach(s => {
            total += calculateDuration(s.startTime, s.endTime, s.breakStart, s.breakEnd);
        });
        
        // Courses
        const empCourses = courses.filter(c => c.professorIds.includes(selectedEmployee.id));
        empCourses.forEach(c => {
            total += calculateDuration(c.startTime, c.endTime);
            (c.schedules || []).forEach(s => {
                total += calculateDuration(s.startTime, s.endTime);
            });
        });
        
        return Math.round(total * 100) / 100;
    }, [selectedEmployee, schedules, courses]);

    const filteredStaff = staff.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(staffSearch.toLowerCase()) || u.email.toLowerCase().includes(staffSearch.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter || u.secondaryRoles?.includes(roleFilter);
        return matchesSearch && matchesRole;
    });

    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    // --- Helpers ---

    const getDurationInDays = (start: string, end: string) => {
        if (!start || !end) return 0;
        const d1 = new Date(start);
        const d2 = new Date(end);
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
        return diffDays;
    };

    // --- Actions ---

    const openModal = (user?: User) => {
        setFormError(null);
        if (user) {
            setEditingUser(user);
            setFormName(user.name);
            setFormEmail(user.email);
            setFormRole(user.role);
            setFormFunction(user.function || '');
            setFormRate(user.hourlyRate || 15);
            setFormSecondaryRoles(user.secondaryRoles || []);
        } else {
            setEditingUser(null);
            setFormName('');
            setFormEmail('');
            setFormRole(UserRole.PROFESSOR);
            setFormFunction('');
            setFormRate(15);
            setFormSecondaryRoles([]);
        }
        setIsAddModalOpen(true);
    };

    const handleOpenHistory = (user: User) => {
        setHistoryEmployee(user);
        setIsLeaveHistoryModalOpen(true);
    };

    const handleSaveUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName || !formEmail) {
            setFormError("Le nom et l'email sont obligatoires.");
            return;
        }
        setFormError(null);
        if (onManageUsers) {
             const userPayload: User = {
                id: editingUser ? editingUser.id : Date.now().toString(),
                name: formName,
                email: formEmail,
                role: formRole,
                function: formFunction,
                hourlyRate: formRate,
                secondaryRoles: formSecondaryRoles,
                avatar: editingUser?.avatar || `https://ui-avatars.com/api/?name=${formName}&background=random`
            };
            onManageUsers(editingUser ? 'update' : 'add', userPayload);
            setIsAddModalOpen(false);
        }
    };

    const handleDeleteUser = (user: User) => {
        setDeleteConfirm({ type: 'employee', item: user });
    };

    const toggleSecondaryRole = (role: UserRole) => {
        if (role === formRole) return; 
        if (formSecondaryRoles.includes(role)) {
            setFormSecondaryRoles(prev => prev.filter(r => r !== role));
        } else {
            setFormSecondaryRoles(prev => [...prev, role]);
        }
    };

    const getRoleLabel = (role: UserRole) => {
        switch (role) {
            case UserRole.PROFESSOR: return 'Professeur';
            case UserRole.RESPONSIBLE: return 'Responsable Pôle';
            case UserRole.EMPLOYEE: return 'Administratif';
            case UserRole.ADMIN: return 'Admin';
            default: return role;
        }
    };

    const handleAddSchedule = () => {
        if (onManageSchedule && selectedEmployee) {
            const newSched: WorkSchedule = {
                id: Date.now().toString(),
                userId: selectedEmployee.id,
                type: schedType,
                startTime: schedStart,
                endTime: schedEnd,
                breakStart: schedBreakStart || undefined,
                breakEnd: schedBreakEnd || undefined,
                activityTitle: schedActivity || 'Travail',
                dayOfWeek: schedType === 'RECURRING' ? schedDay : undefined,
                date: schedType === 'EXCEPTION' ? schedDate : undefined
            };
            onManageSchedule('add', newSched);
            setIsScheduleModalOpen(false);
            setSchedBreakStart('');
            setSchedBreakEnd('');
        }
    };

    const handleLeaveAction = (request: LeaveRequest, status: LeaveStatus) => {
        if (onManageLeave) {
            // Apply replacement if selected for approval
            const replacementId = status === LeaveStatus.APPROVED ? selectedReplacements[request.id] : undefined;
            onManageLeave('update', { ...request, status, replacementUserId: replacementId || request.replacementUserId });
            
            // Clean up selection
            const newSelections = { ...selectedReplacements };
            delete newSelections[request.id];
            setSelectedReplacements(newSelections);
        }
    };

    const handleAddGlobalHoliday = (e: React.FormEvent) => {
        e.preventDefault();
        if (onManageGlobalHoliday && globalHolidayName && globalStartDate && globalEndDate) {
            onManageGlobalHoliday('add', {
                id: Date.now().toString(),
                name: globalHolidayName,
                startDate: globalStartDate,
                endDate: globalEndDate,
                createdAt: new Date().toISOString()
            });
            setGlobalHolidayName('');
            setGlobalStartDate('');
            setGlobalEndDate('');
        }
    };

    const handleAddManualLeave = (e: React.FormEvent) => {
        e.preventDefault();
        if (onManageLeave && manualEmployeeId && manualStartDate && manualEndDate) {
            onManageLeave('add', {
                id: Date.now().toString(),
                userId: manualEmployeeId,
                type: manualType,
                startDate: manualStartDate,
                endDate: manualEndDate,
                status: LeaveStatus.APPROVED, // Direct approval
                reason: 'Saisie administrative manuelle',
                requestDate: new Date().toISOString(),
                replacementUserId: manualReplacementId || undefined
            });
            setManualStartDate('');
            setManualEndDate('');
            setManualReplacementId('');
            alert("Congé ajouté avec succès !");
        }
    };

    const calculateEstimatedPay = (user: User) => {
        if (!user.hourlyRate) return 0;
        const userRecords = attendance.filter(r => r.studentId === user.id && r.status === 'PRESENT');
        const totalHours = userRecords.length * 3; 
        return totalHours * user.hourlyRate;
    };

    const calculateAttendanceRate = (user: User) => {
        const userRecords = attendance.filter(r => r.studentId === user.id);
        if (userRecords.length === 0) return 100;
        const present = userRecords.filter(r => r.status === 'PRESENT' || r.status === 'JUSTIFIED').length;
        return Math.round((present / userRecords.length) * 100);
    }

    return (
        <div className="space-y-8 animate-fade-in">
             <PageHeader 
                title="Gestion RH & Finance" 
                subtitle="Pilotage des ressources humaines, plannings et paie."
                action={
                    <div className="flex gap-3">
                         <div className="bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 flex shadow-sm">
                            <button onClick={() => setActiveMainTab('staff')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeMainTab === 'staff' ? 'bg-insan-blue text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>Annuaire</button>
                            <button onClick={() => setActiveMainTab('planning')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeMainTab === 'planning' ? 'bg-insan-blue text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>Planning</button>
                            <button onClick={() => { setActiveMainTab('presence_finance'); setViewingAttendanceUser(null); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeMainTab === 'presence_finance' ? 'bg-insan-blue text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>Paie & Suivi</button>
                            <button onClick={() => setActiveMainTab('leaves')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeMainTab === 'leaves' ? 'bg-insan-blue text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>Congés {leaveRequests.filter(l => l.status === LeaveStatus.PENDING).length > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">{leaveRequests.filter(l => l.status === LeaveStatus.PENDING).length}</span>}</button>
                        </div>
                        <Button onClick={() => openModal()} icon={<UserPlus size={18} />}>Nouveau</Button>
                     </div>
                }
             />

            {/* --- TAB: PLANNING --- */}
            {activeMainTab === 'planning' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 space-y-4">
                        <Card className="p-4">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-4">Employés</h4>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {staff.map(u => (
                                    <div 
                                        key={u.id} 
                                        onClick={() => setSelectedEmployee(u)}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${selectedEmployee?.id === u.id ? 'bg-insan-blue text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
                                    >
                                        <img src={u.avatar} className="w-8 h-8 rounded-full border border-white/20"/>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-sm truncate">{u.name}</p>
                                            <p className={`text-[10px] ${selectedEmployee?.id === u.id ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>{u.function || u.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                    <div className="lg:col-span-3">
                        {selectedEmployee ? (
                            <Card className="p-8 h-full">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2"><CalendarRange className="text-insan-orange"/> Planning : {selectedEmployee.name}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Gérez les horaires récurrents et les exceptions.</p>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                                                <Clock size={14} className="text-insan-blue"/>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{totalWeeklyHours}h / semaine</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button onClick={() => setIsScheduleModalOpen(true)} icon={<Plus size={16}/>}>Ajouter un créneau</Button>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Vue Hebdomadaire</h4>
                                            <Badge color="blue">{courses.filter(c => c.professorIds.includes(selectedEmployee.id)).length} Cours assignés</Badge>
                                        </div>
                                        
                                        <div className="grid grid-cols-7 gap-2">
                                            {[1, 2, 3, 4, 5, 6, 0].map(dayIdx => {
                                                const daySchedules = schedules.filter(s => s.userId === selectedEmployee.id && s.type === 'RECURRING' && s.dayOfWeek === dayIdx);
                                                const dayCourses = courses.filter(c => c.professorIds.includes(selectedEmployee.id) && (c.dayOfWeek === dayIdx || (c.schedules || []).some(s => s.dayOfWeek === dayIdx)));
                                                
                                                return (
                                                    <div key={dayIdx} className="flex flex-col gap-2">
                                                        <div className="text-center py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                                            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">{days[dayIdx].substring(0, 3)}</span>
                                                        </div>
                                                        
                                                        <div className="space-y-2 min-h-[200px]">
                                                            {/* Regular Schedules */}
                                                            {daySchedules.map(s => (
                                                                <div key={s.id} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg relative group hover:border-insan-blue/40 transition-colors shadow-sm">
                                                                    <p className="text-[9px] font-bold text-insan-blue mb-1">{s.startTime} - {s.endTime}</p>
                                                                    <p className="font-bold text-slate-700 dark:text-slate-200 text-[10px] leading-tight truncate">{s.activityTitle}</p>
                                                                    {s.breakStart && s.breakEnd && (
                                                                        <div className="mt-1 text-[8px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50 p-1 rounded border border-slate-100 dark:border-slate-800">
                                                                            P: {s.breakStart}-{s.breakEnd}
                                                                        </div>
                                                                    )}
                                                                    <button onClick={() => setDeleteConfirm({ type: 'schedule', item: s })} className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 shadow-md rounded-full p-0.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity border border-slate-100 dark:border-slate-700"><X size={10}/></button>
                                                                </div>
                                                            ))}
                                                            
                                                            {/* Courses */}
                                                            {dayCourses.map(c => {
                                                                const relevantSchedules = [];
                                                                if (c.dayOfWeek === dayIdx) relevantSchedules.push({ start: c.startTime, end: c.endTime });
                                                                (c.schedules || []).forEach(s => {
                                                                    if (s.dayOfWeek === dayIdx) relevantSchedules.push({ start: s.startTime, end: s.endTime });
                                                                });
                                                                
                                                                return relevantSchedules.map((rs, idx) => (
                                                                    <div key={`${c.id}-${dayIdx}-${idx}`} className="p-2 bg-blue-50/50 dark:bg-blue-900/20 border border-insan-blue/30 dark:border-blue-800/50 rounded-lg relative group hover:border-insan-blue transition-colors shadow-sm">
                                                                        <p className="text-[9px] font-bold text-insan-blue mb-1">{rs.start} - {rs.end}</p>
                                                                        <div className="flex items-center gap-1">
                                                                            <div className="w-1 h-1 rounded-full bg-insan-blue shrink-0"></div>
                                                                            <p className="font-bold text-slate-800 dark:text-white text-[10px] leading-tight truncate">{c.name}</p>
                                                                        </div>
                                                                        <p className="text-[8px] text-slate-500 dark:text-slate-400 mt-1">Salle: {c.room}</p>
                                                                    </div>
                                                                ));
                                                            })}
                                                            
                                                            {daySchedules.length === 0 && dayCourses.length === 0 && (
                                                                <div className="h-full border-2 border-dashed border-slate-100 dark:border-slate-800/50 rounded-xl"></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <h4 className="text-xs font-bold text-insan-orange uppercase tracking-wider mb-3 flex items-center gap-2"><AlertTriangle size={12}/> Exceptions & Ajouts Ponctuels</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {schedules.filter(s => s.userId === selectedEmployee.id && s.type === 'EXCEPTION').map(s => (
                                                <div key={s.id} className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-xl relative group">
                                                     <div className="flex items-center gap-3 mb-2">
                                                        <span className="px-2 py-1 bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-md border border-orange-100 dark:border-orange-900/50">{s.date}</span>
                                                        <span className="text-orange-400 text-xs font-bold">{s.startTime} - {s.endTime}</span>
                                                    </div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{s.activityTitle}</p>
                                                    {s.breakStart && s.breakEnd && (
                                                        <div className="mt-2 text-[10px] text-orange-400 dark:text-orange-300 bg-white/50 dark:bg-slate-900/50 p-1.5 rounded-lg border border-orange-100 dark:border-orange-900/30 flex items-center gap-2">
                                                            <Clock4 size={10}/> Pause: {s.breakStart} - {s.breakEnd}
                                                        </div>
                                                    )}
                                                    <button onClick={() => setDeleteConfirm({ type: 'schedule', item: s })} className="absolute top-2 right-2 text-orange-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={16}/></button>
                                                </div>
                                            ))}
                                             {schedules.filter(s => s.userId === selectedEmployee.id && s.type === 'EXCEPTION').length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500 italic">Aucune exception programmée.</p>}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                Sélectionnez un employé pour gérer son planning.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- TAB: PRESENCE & FINANCE --- */}
            {activeMainTab === 'presence_finance' && (
                <div className="space-y-6">
                    {!viewingAttendanceUser ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="p-6 border-l-4 border-green-500">
                                    <h4 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase mb-1">Budget Paie Mensuel (Est.)</h4>
                                    <p className="text-3xl font-extrabold text-slate-800 dark:text-white">14 250 €</p>
                                </Card>
                                <Card className="p-6 border-l-4 border-insan-blue">
                                    <h4 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase mb-1">Heures Travaillées</h4>
                                    <p className="text-3xl font-extrabold text-slate-800 dark:text-white">842 h</p>
                                </Card>
                                <Card className="p-6 border-l-4 border-red-500">
                                    <h4 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase mb-1">Absences Non Justifiées</h4>
                                    <p className="text-3xl font-extrabold text-slate-800 dark:text-white">12</p>
                                </Card>
                            </div>

                            <Card className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2"><Euro size={20}/> Tableau de Bord Paie & Suivi</h3>
                                    <Button variant="secondary" icon={<Download size={16}/>} size="sm">Exporter Excel</Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">
                                            <tr>
                                                <th className="p-4">Employé</th>
                                                <th className="p-4">Contrat</th>
                                                <th className="p-4 text-center">Taux Assiduité</th>
                                                <th className="p-4 text-right">Taux Horaire</th>
                                                <th className="p-4 text-right">Paie Estimée</th>
                                                <th className="p-4 text-right">Détails</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {staff.map(emp => {
                                                const rate = calculateAttendanceRate(emp);
                                                const estimatedPay = calculateEstimatedPay(emp);
                                                return (
                                                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer" onClick={() => setViewingAttendanceUser(emp)}>
                                                        <td className="p-4 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                                                            <img src={emp.avatar} className="w-8 h-8 rounded-full" />
                                                            <div>
                                                                <p>{emp.name}</p>
                                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal uppercase">{emp.function}</p>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-slate-500 dark:text-slate-400">{emp.contractHours || '-'}h / sem</td>
                                                        <td className="p-4 text-center">
                                                            <span className={`px-2 py-1 rounded text-xs font-bold ${rate < 90 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'}`}>{rate}%</span>
                                                        </td>
                                                        <td className="p-4 text-right text-slate-500 dark:text-slate-400">{emp.hourlyRate} €/h</td>
                                                        <td className="p-4 text-right font-bold text-insan-blue dark:text-blue-400">{estimatedPay} €</td>
                                                        <td className="p-4 text-right"><ChevronRight size={16} className="text-slate-300 group-hover:text-insan-blue dark:group-hover:text-blue-400" /></td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <button 
                                onClick={() => setViewingAttendanceUser(null)} 
                                className="flex items-center gap-2 text-slate-500 hover:text-insan-blue dark:text-slate-400 dark:hover:text-blue-400 font-bold transition-colors mb-2"
                            >
                                <ArrowLeft size={18} /> Retour au tableau de bord
                            </button>
                            
                            <Card className="p-8 border-l-4 border-insan-blue">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <img src={viewingAttendanceUser.avatar} className="w-20 h-20 rounded-full border-4 border-slate-50 dark:border-slate-700 shadow-sm" />
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">{viewingAttendanceUser.name}</h3>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">{viewingAttendanceUser.function || viewingAttendanceUser.role}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge color="blue">{calculateAttendanceRate(viewingAttendanceUser)}% Présence</Badge>
                                                <Badge color="gray">{viewingAttendanceUser.email}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="secondary" icon={<Calendar size={16}/>}>Filtrer par date</Button>
                                        <Button icon={<Download size={16}/>}>Extraire PDF</Button>
                                    </div>
                                </div>

                                <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2"><History size={20}/> Historique de Pointage</h4>
                                <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">
                                            <tr>
                                                <th className="p-4">Date</th>
                                                <th className="p-4">Heure Pointage</th>
                                                <th className="p-4 text-center">Statut</th>
                                                <th className="p-4 text-right">Observation</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {attendance
                                                .filter(r => r.studentId === viewingAttendanceUser.id)
                                                .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                .map(record => (
                                                <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="p-4 font-bold text-slate-700 dark:text-slate-200">{new Date(record.date).toLocaleDateString()}</td>
                                                    <td className="p-4 font-mono text-slate-600 dark:text-slate-400">{record.entryTimestamp || '--:--'}</td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(record.status)}`}>{record.status}</span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {record.status === 'LATE' && <span className="text-orange-500 text-xs font-bold flex items-center justify-end gap-1"><AlertTriangle size={12}/> Retard</span>}
                                                        {record.status === 'ABSENT' && <span className="text-red-500 text-xs font-bold flex items-center justify-end gap-1"><X size={12}/> Absence</span>}
                                                        {record.status === 'PRESENT' && <span className="text-green-500 text-xs font-bold flex items-center justify-end gap-1"><CheckCircle size={12}/> OK</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                            {attendance.filter(r => r.studentId === viewingAttendanceUser.id).length === 0 && (
                                                <tr><td colSpan={4} className="p-8 text-center text-slate-400 dark:text-slate-500 italic">Aucun historique de pointage disponible.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* --- TAB: LEAVES (Congés - Refonte avec Remplacement) --- */}
            {activeMainTab === 'leaves' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* COLONNE 1 : VACANCES GLOBALES */}
                    <div className="space-y-6">
                        <Card className="p-6 border-l-4 border-purple-500 bg-purple-50/20 dark:bg-purple-900/10">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Globe size={20} className="text-purple-600 dark:text-purple-400"/> Vacances Globales
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Ces périodes sont imposées à l'ensemble du personnel (fermeture, jours fériés...).</p>
                            
                            <form onSubmit={handleAddGlobalHoliday} className="space-y-3 mb-6">
                                <input 
                                    className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm outline-none bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/20" 
                                    placeholder="Nom (ex: Vacances Hiver)" 
                                    value={globalHolidayName} 
                                    onChange={e => setGlobalHolidayName(e.target.value)} 
                                    required
                                />
                                <div className="flex gap-2">
                                    <input type="date" className="flex-1 border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm bg-white dark:bg-slate-800 dark:text-white" value={globalStartDate} onChange={e => setGlobalStartDate(e.target.value)} required />
                                    <input type="date" className="flex-1 border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm bg-white dark:bg-slate-800 dark:text-white" value={globalEndDate} onChange={e => setGlobalEndDate(e.target.value)} required />
                                </div>
                                <Button size="sm" type="submit" className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600">Ajouter Période</Button>
                            </form>

                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                {globalHolidays.map(h => (
                                    <div key={h.id} className="p-3 bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900/30 rounded-xl flex justify-between items-center shadow-sm">
                                        <div>
                                            <p className="font-bold text-slate-700 dark:text-slate-200 text-xs">{h.name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500">Du {new Date(h.startDate).toLocaleDateString()} au {new Date(h.endDate).toLocaleDateString()}</p>
                                                <Badge color="gray">{getDurationInDays(h.startDate, h.endDate)}j</Badge>
                                            </div>
                                        </div>
                                        <button onClick={() => setDeleteConfirm({ type: 'holiday', item: h })} className="text-slate-300 hover:text-red-500 transition-colors"><X size={14}/></button>
                                    </div>
                                ))}
                                {globalHolidays.length === 0 && <p className="text-slate-400 dark:text-slate-500 italic text-xs text-center py-2">Aucune période définie.</p>}
                            </div>
                        </Card>
                    </div>

                    {/* COLONNE 2 : GESTION INDIVIDUELLE */}
                    <div className="space-y-6">
                        <Card className="p-6 border-l-4 border-insan-blue">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <UserCheck size={20} className="text-insan-blue dark:text-blue-400"/> Saisie Manuelle
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Ajouter un congé pour un employé spécifique (Validation immédiate).</p>

                            <form onSubmit={handleAddManualLeave} className="space-y-3">
                                <select 
                                    className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-insan-blue/20"
                                    value={manualEmployeeId}
                                    onChange={e => setManualEmployeeId(e.target.value)}
                                    required
                                >
                                    <option value="">Sélectionner un employé...</option>
                                    {staff.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                                
                                <select 
                                    className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-insan-blue/20"
                                    value={manualType}
                                    onChange={e => setManualType(e.target.value as LeaveType)}
                                >
                                    {Object.values(LeaveType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>

                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Début</label>
                                        <input type="date" className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm bg-white dark:bg-slate-800 dark:text-white" value={manualStartDate} onChange={e => setManualStartDate(e.target.value)} required />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Fin</label>
                                        <input type="date" className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm bg-white dark:bg-slate-800 dark:text-white" value={manualEndDate} onChange={e => setManualEndDate(e.target.value)} required />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><ArrowLeftRight size={10}/> Remplacé par (Optionnel)</label>
                                    <select 
                                        className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-insan-blue/20 mt-1"
                                        value={manualReplacementId}
                                        onChange={e => setManualReplacementId(e.target.value)}
                                        disabled={!manualEmployeeId}
                                    >
                                        <option value="">Aucun remplacement</option>
                                        {staff.filter(u => u.id !== manualEmployeeId).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>

                                <Button size="sm" type="submit" className="w-full">Valider le congé</Button>
                            </form>
                        </Card>

                        {/* VUE COMBINÉE (Affichée si un employé est sélectionné dans le select ci-dessus) */}
                        {manualEmployeeId && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in">
                                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2 justify-between">
                                    <span className="flex items-center gap-2"><Palmtree size={12}/> {staff.find(u => u.id === manualEmployeeId)?.name}</span>
                                    <button 
                                        onClick={() => { const u = staff.find(us => us.id === manualEmployeeId); if(u) handleOpenHistory(u); }}
                                        className="text-[10px] text-insan-blue dark:text-blue-400 hover:underline font-bold"
                                    >
                                        Voir Tout
                                    </button>
                                </h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                    {/* Global Holidays impacting user */}
                                    {globalHolidays.map(h => (
                                        <div key={h.id} className="p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg flex justify-between items-center text-xs">
                                            <div>
                                                <span className="font-bold text-purple-700 dark:text-purple-300 block">{h.name}</span>
                                                <span className="text-purple-600 dark:text-purple-400 text-[10px]">{new Date(h.startDate).toLocaleDateString()} - {new Date(h.endDate).toLocaleDateString()}</span>
                                            </div>
                                            <Badge color="gray">{getDurationInDays(h.startDate, h.endDate)}j</Badge>
                                        </div>
                                    ))}
                                    {/* Individual Leaves (Accepted) */}
                                    {leaveRequests
                                        .filter(l => l.userId === manualEmployeeId && l.status === LeaveStatus.APPROVED)
                                        .sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                                        .map(l => (
                                        <div key={l.id} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col gap-1 text-xs">
                                            <div className="flex justify-between items-center w-full">
                                                <div>
                                                    <span className="font-bold text-slate-700 dark:text-slate-200 block">{l.type}</span>
                                                    <span className="text-slate-500 dark:text-slate-400 text-[10px]">{l.startDate} - {l.endDate}</span>
                                                </div>
                                                <Badge color="blue">{getDurationInDays(l.startDate, l.endDate)}j</Badge>
                                            </div>
                                            {l.replacementUserId && (
                                                <div className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-1 rounded flex items-center gap-1 mt-1">
                                                    <ArrowLeftRight size={10}/> Remplacé par {staff.find(s => s.id === l.replacementUserId)?.name || 'Inconnu'}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {leaveRequests.filter(l => l.userId === manualEmployeeId && l.status === LeaveStatus.APPROVED).length === 0 && globalHolidays.length === 0 && (
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center">Aucun congé prévu.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* COLONNE 3 : GESTION DES DEMANDES (Refonte) */}
                    <div className="space-y-6">
                        <Card className="p-6 border-l-4 border-insan-orange">
                             <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2"><AlertCircle size={20} className="text-insan-orange"/> Gestion des Demandes</h3>
                             
                             <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-4">
                                <button 
                                    onClick={() => setLeaveRequestTab('PENDING')} 
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${leaveRequestTab === 'PENDING' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    À Traiter ({leaveRequests.filter(l => l.status === LeaveStatus.PENDING).length})
                                </button>
                                <button 
                                    onClick={() => setLeaveRequestTab('HISTORY')} 
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${leaveRequestTab === 'HISTORY' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    Historique
                                </button>
                             </div>

                             <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                                 {leaveRequests
                                    .filter(l => leaveRequestTab === 'PENDING' ? l.status === LeaveStatus.PENDING : (l.status === LeaveStatus.APPROVED || l.status === LeaveStatus.REJECTED))
                                    .sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
                                    .map(req => {
                                     const u = staff.find(us => us.id === req.userId);
                                     return (
                                         <div key={req.id} className={`p-4 border rounded-xl ${req.status === LeaveStatus.APPROVED ? 'bg-green-50/50 dark:bg-green-900/10 border-slate-100 dark:border-green-900/30' : req.status === LeaveStatus.REJECTED ? 'bg-red-50/50 dark:bg-red-900/10 border-slate-100 dark:border-red-900/30' : 'bg-orange-50/50 dark:bg-orange-900/10 border-slate-100 dark:border-orange-900/30'}`}>
                                             <div className="flex items-center justify-between mb-2">
                                                 <div className="flex items-center gap-2">
                                                     <img src={u?.avatar} className="w-6 h-6 rounded-full"/>
                                                     <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{u?.name}</span>
                                                 </div>
                                                 <Badge color="gray">{getDurationInDays(req.startDate, req.endDate)}j</Badge>
                                             </div>
                                             
                                             <div className="flex justify-between items-center mb-1">
                                                 <Badge color="orange">{req.type}</Badge>
                                                 {req.status === LeaveStatus.APPROVED && <Badge color="green" icon={<CheckCircle size={10}/>}>Validé</Badge>}
                                                 {req.status === LeaveStatus.REJECTED && <Badge color="red" icon={<X size={10}/>}>Refusé</Badge>}
                                             </div>

                                             <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Du <strong>{req.startDate}</strong> au <strong>{req.endDate}</strong></p>
                                             {req.reason && <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-3">"{req.reason}"</p>}
                                             
                                             {/* Replacement Info (If approved) */}
                                             {req.status === LeaveStatus.APPROVED && req.replacementUserId && (
                                                 <div className="flex items-center gap-2 text-xs bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700 mt-2">
                                                     <ArrowLeftRight size={14} className="text-insan-blue dark:text-blue-400"/>
                                                     <span className="font-bold text-slate-600 dark:text-slate-300">Remplacé par : {staff.find(s => s.id === req.replacementUserId)?.name}</span>
                                                 </div>
                                             )}

                                             {leaveRequestTab === 'PENDING' && (
                                                 <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                                     <div className="mb-3">
                                                         <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Attribuer un remplaçant</label>
                                                         <select 
                                                            className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                                                            value={selectedReplacements[req.id] || ''}
                                                            onChange={(e) => setSelectedReplacements(prev => ({...prev, [req.id]: e.target.value}))}
                                                         >
                                                             <option value="">-- Sans remplacement --</option>
                                                             {staff.filter(st => st.id !== req.userId).map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                                                         </select>
                                                     </div>
                                                     <div className="flex gap-2">
                                                         <Button size="sm" onClick={() => handleLeaveAction(req, LeaveStatus.APPROVED)} className="flex-1">Accepter</Button>
                                                         <Button size="sm" variant="secondary" onClick={() => handleLeaveAction(req, LeaveStatus.REJECTED)} className="flex-1">Refuser</Button>
                                                     </div>
                                                 </div>
                                             )}
                                         </div>
                                     )
                                 })}
                                 {leaveRequests.filter(l => leaveRequestTab === 'PENDING' ? l.status === LeaveStatus.PENDING : (l.status === LeaveStatus.APPROVED || l.status === LeaveStatus.REJECTED)).length === 0 && (
                                     <p className="text-slate-400 dark:text-slate-500 italic text-sm text-center py-4">Aucune demande dans cette liste.</p>
                                 )}
                             </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* ... (Rest of the file remains unchanged: Tabs STAFF and PLANNING logic) ... */}
            
            {/* --- TAB: STAFF (Directory) --- */}
            {activeMainTab === 'staff' && (
                <div className="space-y-6">
                    {/* Filters Bar */}
                    <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm"><Filter size={18}/> Filtres:</div>
                        <input 
                            placeholder="Rechercher un employé..." 
                            value={staffSearch}
                            onChange={(e) => setStaffSearch(e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-insan-blue/20 dark:text-white"
                        />
                         <select 
                            value={roleFilter} 
                            onChange={(e) => setRoleFilter(e.target.value as any)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-insan-blue/20 font-medium dark:text-white"
                        >
                            <option value="ALL">Tous les rôles</option>
                            <option value={UserRole.PROFESSOR}>Professeurs</option>
                            <option value={UserRole.EMPLOYEE}>Administratif</option>
                            <option value={UserRole.RESPONSIBLE}>Responsables</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStaff.map(emp => (
                            <Card key={emp.id} className="p-6 relative group hover:border-insan-blue/50 dark:hover:border-blue-500/50 transition-colors cursor-pointer group">
                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button onClick={(e) => { e.stopPropagation(); openModal(emp); }} className="p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-insan-blue dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"><Edit2 size={14}/></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteUser(emp); }} className="p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"><Trash2 size={14}/></button>
                                </div>
                                <div onClick={() => { setSelectedEmployee(emp); setActiveMainTab('planning'); }}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <img src={emp.avatar} className="w-16 h-16 rounded-full object-cover border-4 border-slate-50 dark:border-slate-700 shadow-sm" alt={emp.name} />
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-white text-lg group-hover:text-insan-blue dark:group-hover:text-blue-400 transition-colors">{emp.name}</h3>
                                                <p className="text-xs font-bold text-insan-orange uppercase tracking-wider mb-1">{emp.function || getRoleLabel(emp.role)}</p>
                                                {/* Badges for multi-role */}
                                                <div className="flex flex-wrap gap-1">
                                                    {/* Primary Role Badge */}
                                                    <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-insan-blue dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800/50 font-bold">{getRoleLabel(emp.role)}</span>
                                                    {/* Secondary Roles Badges */}
                                                    {emp.secondaryRoles?.map(role => (
                                                        <span key={role} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{getRoleLabel(role)}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Briefcase size={16} /> {emp.email}</div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Clock size={16} /> {emp.contractHours}h / semaine</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="secondary" className="flex-1 text-xs" onClick={(e) => { e.stopPropagation(); setSelectedEmployee(emp); setActiveMainTab('planning'); }}>Voir Planning</Button>
                                        <Button className="flex-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-none" onClick={(e) => { e.stopPropagation(); handleOpenHistory(emp); }} icon={<Palmtree size={14}/>}>Congés</Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal - Add/Edit Staff (Unified) */}
            {isAddModalOpen && (
                 <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto py-10">
                     <Card className="w-full max-w-xl animate-fade-in bg-white dark:bg-slate-900">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{editingUser ? 'Modifier le profil' : 'Ajouter un collaborateur'}</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-full transition-colors text-slate-500 dark:text-slate-400"><X size={20} /></button>
                        </div>
            <form onSubmit={handleSaveUser} className="p-8 space-y-4">
                {formError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-bold animate-shake">
                        <AlertTriangle size={16}/> {formError}
                    </div>
                )}
                <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nom Complet</label><input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-insan-blue/20 bg-white dark:bg-slate-800 dark:text-white" /></div>
                            <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Professionnel</label><input required type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-insan-blue/20 bg-white dark:bg-slate-800 dark:text-white" /></div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Rôle Principal (Système)</label><select value={formRole} onChange={e => setFormRole(e.target.value as UserRole)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white outline-none"><option value={UserRole.PROFESSOR}>Professeur</option><option value={UserRole.EMPLOYEE}>Secrétariat / Staff</option><option value={UserRole.RESPONSIBLE}>Responsable Pôle</option></select></div>
                                <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Taux Horaire (€)</label><input type="number" value={formRate} onChange={e => setFormRate(Number(e.target.value))} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none bg-white dark:bg-slate-800 dark:text-white" /></div>
                            </div>

                            <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Intitulé du Poste</label><input type="text" placeholder="Ex: Responsable Pédagogique" value={formFunction} onChange={e => setFormFunction(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none bg-white dark:bg-slate-800 dark:text-white" /></div>

                            {/* Multi-role selection */}
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Fonctions Secondaires (Multi-casquettes)</label>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-3">Sélectionnez les rôles additionnels de cet employé.</p>
                                <div className="space-y-2">
                                    <div 
                                        onClick={() => toggleSecondaryRole(UserRole.PROFESSOR)} 
                                        className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer select-none transition-all ${formSecondaryRoles.includes(UserRole.PROFESSOR) ? 'bg-white dark:bg-slate-700 border-insan-blue dark:border-blue-500 shadow-sm' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'} ${formRole === UserRole.PROFESSOR ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className={`w-5 h-5 flex items-center justify-center rounded border ${formSecondaryRoles.includes(UserRole.PROFESSOR) ? 'bg-insan-blue border-insan-blue text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
                                            {formSecondaryRoles.includes(UserRole.PROFESSOR) && <CheckCircle size={14}/>}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Enseignant (Professeur)</span>
                                    </div>

                                    <div 
                                        onClick={() => toggleSecondaryRole(UserRole.RESPONSIBLE)} 
                                        className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer select-none transition-all ${formSecondaryRoles.includes(UserRole.RESPONSIBLE) ? 'bg-white dark:bg-slate-700 border-insan-blue dark:border-blue-500 shadow-sm' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'} ${formRole === UserRole.RESPONSIBLE ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className={`w-5 h-5 flex items-center justify-center rounded border ${formSecondaryRoles.includes(UserRole.RESPONSIBLE) ? 'bg-insan-blue border-insan-blue text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
                                            {formSecondaryRoles.includes(UserRole.RESPONSIBLE) && <CheckCircle size={14}/>}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Responsable de Pôle</span>
                                    </div>

                                    <div 
                                        onClick={() => toggleSecondaryRole(UserRole.EMPLOYEE)} 
                                        className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer select-none transition-all ${formSecondaryRoles.includes(UserRole.EMPLOYEE) ? 'bg-white dark:bg-slate-700 border-insan-blue dark:border-blue-500 shadow-sm' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'} ${formRole === UserRole.EMPLOYEE ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className={`w-5 h-5 flex items-center justify-center rounded border ${formSecondaryRoles.includes(UserRole.EMPLOYEE) ? 'bg-insan-blue border-insan-blue text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
                                            {formSecondaryRoles.includes(UserRole.EMPLOYEE) && <CheckCircle size={14}/>}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Administratif / Staff</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                {editingUser && (
                                    <Button variant="danger" className="flex-1" type="button" onClick={() => { setIsAddModalOpen(false); handleDeleteUser(editingUser); }} icon={<Trash2 size={18}/>}>Supprimer</Button>
                                )}
                                <Button type="submit" className="flex-1">{editingUser ? 'Mettre à jour' : 'Créer le profil'}</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Modal - Add Schedule */}
            {isScheduleModalOpen && (
                 <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto py-10">
                     <Card className="w-full max-w-md animate-fade-in bg-white dark:bg-slate-900">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Ajouter un créneau</h3>
                            <button onClick={() => setIsScheduleModalOpen(false)} className="hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-full transition-colors text-slate-500 dark:text-slate-400"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-4">
                            <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                <button onClick={() => setSchedType('RECURRING')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${schedType === 'RECURRING' ? 'bg-white dark:bg-slate-700 text-insan-blue dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Récurrent</button>
                                <button onClick={() => setSchedType('EXCEPTION')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${schedType === 'EXCEPTION' ? 'bg-white dark:bg-slate-700 text-insan-orange dark:text-orange-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Exception</button>
                            </div>

                            {schedType === 'RECURRING' ? (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Jour de la semaine</label>
                                    <select value={schedDay} onChange={e => setSchedDay(Number(e.target.value))} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white outline-none">
                                        {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Date spécifique</label>
                                    <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white outline-none" />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Début</label><input type="time" value={schedStart} onChange={e => setSchedStart(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white outline-none" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Fin</label><input type="time" value={schedEnd} onChange={e => setSchedEnd(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white outline-none" /></div>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pause (Optionnel)</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Début Pause</label><input type="time" value={schedBreakStart} onChange={e => setSchedBreakStart(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs bg-white dark:bg-slate-800 dark:text-white outline-none" /></div>
                                    <div><label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Fin Pause</label><input type="time" value={schedBreakEnd} onChange={e => setSchedBreakEnd(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs bg-white dark:bg-slate-800 dark:text-white outline-none" /></div>
                                </div>
                            </div>

                            <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Activité / Motif</label><input type="text" placeholder="Ex: Permanence, Réunion..." value={schedActivity} onChange={e => setSchedActivity(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white outline-none" /></div>
                            
                            <Button onClick={handleAddSchedule} className="w-full mt-4">Enregistrer</Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* --- NEW: COMPREHENSIVE LEAVE HISTORY MODAL --- */}
            {isLeaveHistoryModalOpen && historyEmployee && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/80 backdrop-blur-xl p-4 overflow-y-auto py-10">
                    <Card className="w-full max-w-4xl animate-fade-in bg-white dark:bg-slate-900">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                            <div className="flex items-center gap-4">
                                <img src={historyEmployee.avatar} className="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-slate-600 shadow-sm"/>
                                <div>
                                    <h3 className="font-black text-xl text-slate-800 dark:text-white">Calendrier des Absences</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{historyEmployee.name} • {getRoleLabel(historyEmployee.role)}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsLeaveHistoryModalOpen(false)} className="hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-full transition-colors text-slate-500 dark:text-slate-400"><X size={20} /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* STATS COLUMN */}
                                <div className="space-y-6">
                                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-center">
                                        <p className="text-xs font-black uppercase text-blue-400 tracking-widest mb-2">Total Jours Pris</p>
                                        <p className="text-4xl font-black text-blue-900 dark:text-blue-300">
                                            {
                                                leaveRequests.filter(l => l.userId === historyEmployee.id && l.status === LeaveStatus.APPROVED).reduce((acc, curr) => acc + getDurationInDays(curr.startDate, curr.endDate), 0) +
                                                globalHolidays.reduce((acc, curr) => acc + getDurationInDays(curr.startDate, curr.endDate), 0)
                                            }
                                        </p>
                                        <p className="text-[10px] font-bold text-blue-500 dark:text-blue-400 mt-1">Vacances & Congés cumulés</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2"><Globe size={14} className="text-purple-500"/> Vacances Globales</span>
                                            <Badge color="gray">{globalHolidays.reduce((acc, curr) => acc + getDurationInDays(curr.startDate, curr.endDate), 0)}j</Badge>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2"><UserCheck size={14} className="text-insan-blue dark:text-blue-400"/> Congés Individuels</span>
                                            <Badge color="blue">{leaveRequests.filter(l => l.userId === historyEmployee.id && l.status === LeaveStatus.APPROVED).reduce((acc, curr) => acc + getDurationInDays(curr.startDate, curr.endDate), 0)}j</Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* TIMELINE COLUMN */}
                                <div className="lg:col-span-2">
                                    <h4 className="font-black text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Calendar size={20}/> Chronologie Complète</h4>
                                    <div className="space-y-4">
                                        {[
                                            ...globalHolidays.map(h => ({ ...h, type: 'GLOBAL', status: 'APPROVED', userId: 'ALL' })),
                                            ...leaveRequests.filter(l => l.userId === historyEmployee.id)
                                        ]
                                        .sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()) // Sort by most recent
                                        .map((item: any, idx) => {
                                            const isGlobal = item.type === 'GLOBAL';
                                            const days = getDurationInDays(item.startDate, item.endDate);
                                            const isPast = new Date(item.endDate) < new Date();

                                            return (
                                                <div key={idx} className={`flex gap-4 p-4 rounded-2xl border ${isGlobal ? 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'} ${isPast ? 'opacity-60' : ''}`}>
                                                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${isGlobal ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300' : 'bg-blue-50 dark:bg-blue-900/40 text-insan-blue dark:text-blue-300'}`}>
                                                        <span className="text-xs font-black">{days}j</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <h5 className={`font-bold text-sm ${isGlobal ? 'text-purple-900 dark:text-purple-200' : 'text-slate-800 dark:text-white'}`}>
                                                                {isGlobal ? item.name : `Congé : ${item.type}`}
                                                            </h5>
                                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${isPast ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300' : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'}`}>
                                                                {isPast ? 'Passé' : 'À venir'}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 flex items-center gap-2">
                                                            <Calendar size={12}/> {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                                                        </p>
                                                        {!isGlobal && item.reason && <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-2">"{item.reason}"</p>}
                                                        {!isGlobal && item.replacementUserId && (
                                                            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded w-fit">
                                                                <ArrowLeftRight size={12}/> Remplacé par {staff.find(s => s.id === item.replacementUserId)?.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {[...globalHolidays, ...leaveRequests.filter(l => l.userId === historyEmployee.id)].length === 0 && (
                                            <div className="text-center py-10 text-slate-400 dark:text-slate-500 italic">Aucun historique de congé trouvé.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 text-right">
                            <Button onClick={() => setIsLeaveHistoryModalOpen(false)}>Fermer</Button>
                        </div>
                    </Card>
                </div>
            )}
            {/* MODAL CONFIRMATION SUPPRESSION */}
            {deleteConfirm.type && (
                <div className="fixed inset-0 z-[200] flex items-start justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto py-10">
                    <Card className="w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl rounded-[2.5rem] overflow-hidden">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <Trash2 size={40}/>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Confirmer la suppression</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
                                    {deleteConfirm.type === 'employee' && `Êtes-vous sûr de vouloir supprimer l'employé "${deleteConfirm.item?.name}" ? Cette action supprimera également ses accès.`}
                                    {deleteConfirm.type === 'schedule' && `Supprimer ce créneau de travail (${deleteConfirm.item?.startTime} - ${deleteConfirm.item?.endTime}) ?`}
                                    {deleteConfirm.type === 'holiday' && `Supprimer la période de vacances "${deleteConfirm.item?.name}" ?`}
                                    <br/>Cette action est irréversible.
                                </p>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm({ type: null, item: null })}>Annuler</Button>
                                <Button variant="danger" className="flex-1" onClick={() => {
                                    if (deleteConfirm.type === 'employee') {
                                        onManageUsers?.('delete', deleteConfirm.item);
                                        if (selectedEmployee?.id === deleteConfirm.item.id) setSelectedEmployee(null);
                                    } else if (deleteConfirm.type === 'schedule') {
                                        onManageSchedule?.('delete', deleteConfirm.item);
                                    } else if (deleteConfirm.type === 'holiday') {
                                        onManageGlobalHoliday?.('delete', deleteConfirm.item);
                                    }
                                    setDeleteConfirm({ type: null, item: null });
                                }}>Supprimer</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default EmployeeManagement;