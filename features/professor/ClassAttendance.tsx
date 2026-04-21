import React, { useState } from 'react';
import { User, Course, AttendanceRecord, UserRole, AttendanceStatus, InstituteSettings } from '../../types';
import { Card, Button, Badge, PageHeader, useToast } from '../../components/ui/DesignSystem';
import { Users, Clock, Check, X, ChevronRight, Save, UserCheck, BookOpen, Calendar, AlertCircle } from 'lucide-react';

interface ClassAttendanceProps {
    user: User;
    courses: Course[];
    users: User[];
    attendance: AttendanceRecord[];
    onAddAttendance: (record: AttendanceRecord) => void;
    settings?: InstituteSettings;
}

const ClassAttendance: React.FC<ClassAttendanceProps> = ({ 
    user, courses, users, attendance, onAddAttendance, settings 
}) => {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [tempAttendance, setTempAttendance] = useState<Record<string, AttendanceStatus>>({});
    const { showToast } = useToast();

    const myCourses = courses.filter(c => c.professorIds.includes(user.id));
    
    const getStudentsForCourse = (courseId: string) => users.filter(u => u.role === UserRole.STUDENT && u.classId === courseId);

    const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
        setTempAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const submitAttendance = () => {
        if (!selectedCourse) return;
        const entries = Object.entries(tempAttendance);
        
        if (entries.length === 0) {
            showToast("Veuillez marquer au moins un élève avant d'enregistrer.", "error");
            return;
        }

        entries.forEach(([studentId, status]) => {
            onAddAttendance({
                id: Date.now().toString() + Math.random(),
                studentId,
                courseId: selectedCourse.id,
                date: attendanceDate,
                recordedBy: user.name,
                entryTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: status
            });
        });

        showToast(`Appel enregistré pour ${entries.length} étudiants.`, "success");
        setTempAttendance({});
        setSelectedCourse(null);
    };

    const markAllPresent = () => {
        if (!selectedCourse) return;
        const students = getStudentsForCourse(selectedCourse.id);
        const newAttendance: Record<string, AttendanceStatus> = {};
        students.forEach(s => {
            newAttendance[s.id] = AttendanceStatus.PRESENT;
        });
        setTempAttendance(newAttendance);
    };

    if (selectedCourse) {
        return (
            <div className="animate-fade-in space-y-6">
                <PageHeader 
                    title="Faire l'appel" 
                    subtitle={`Classe : ${selectedCourse.name}`}
                    action={
                        <Button variant="secondary" onClick={() => setSelectedCourse(null)} icon={<ChevronRight size={18} className="rotate-180" />}>
                            Retour aux cours
                        </Button>
                    }
                />

                <Card className={`p-6 border-l-4 shadow-md ${selectedCourse.isManualAttendance ? 'border-insan-orange bg-orange-50/30 dark:bg-orange-900/10' : 'border-insan-blue bg-blue-50/50 dark:bg-blue-900/10'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${selectedCourse.isManualAttendance ? 'bg-insan-orange text-white' : 'bg-insan-blue text-white'}`}>
                                <UserCheck size={28} />
                            </div>
                            <div>
                                <h3 className={`font-bold text-xl ${selectedCourse.isManualAttendance ? 'text-insan-orange dark:text-orange-400' : 'text-insan-blue dark:text-blue-400'}`}>{selectedCourse.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedCourse.schedule} • {getStudentsForCourse(selectedCourse.id).length} Étudiants</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="flex-1 md:flex-none border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-white dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 shadow-sm outline-none" />
                            <Button variant="secondary" onClick={markAllPresent} size="sm">Tous présents</Button>
                            <Button onClick={submitAttendance} icon={<Save size={18}/>}>Enregistrer l'appel</Button>
                        </div>
                    </div>
                </Card>

                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {getStudentsForCourse(selectedCourse.id).map(student => (
                            <div key={student.id} className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${tempAttendance[student.id] ? 'border-insan-blue dark:border-blue-500 bg-blue-50/30 dark:bg-blue-900/10 shadow-inner' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600'}`}>
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="relative">
                                        <img src={student.avatar} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-600 shadow-sm" alt=""/>
                                        {tempAttendance[student.id] && (
                                            <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-sm ${
                                                tempAttendance[student.id] === AttendanceStatus.PRESENT ? 'bg-green-500' : 
                                                tempAttendance[student.id] === AttendanceStatus.LATE ? 'bg-orange-500' : 'bg-red-500'
                                            }`}>
                                                {tempAttendance[student.id] === AttendanceStatus.PRESENT ? <Check size={12}/> : 
                                                 tempAttendance[student.id] === AttendanceStatus.LATE ? <Clock size={12}/> : <X size={12}/>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{student.name}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Élève ID: {student.id}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <button 
                                        onClick={() => handleAttendanceChange(student.id, AttendanceStatus.PRESENT)}
                                        className={`py-2 rounded-lg text-[10px] font-bold transition-all ${tempAttendance[student.id] === AttendanceStatus.PRESENT ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                                    >PRÉSENT</button>
                                    <button 
                                        onClick={() => handleAttendanceChange(student.id, AttendanceStatus.LATE)}
                                        className={`py-2 rounded-lg text-[10px] font-bold transition-all ${tempAttendance[student.id] === AttendanceStatus.LATE ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                                    >RETARD</button>
                                    <button 
                                        onClick={() => handleAttendanceChange(student.id, AttendanceStatus.ABSENT)}
                                        className={`py-2 rounded-lg text-[10px] font-bold transition-all ${tempAttendance[student.id] === AttendanceStatus.ABSENT ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                                    >ABSENT</button>
                                </div>
                            </div>
                        ))}
                        {getStudentsForCourse(selectedCourse.id).length === 0 && (
                            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-3xl">
                                <AlertCircle size={32} className="text-slate-200 dark:text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400 dark:text-slate-500 font-medium">Aucun élève n'est inscrit à ce cours.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader 
                title="Appel des classes" 
                subtitle="Sélectionnez une classe pour marquer les présences."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCourses.map(c => {
                    const studentCount = getStudentsForCourse(c.id).length;
                    return (
                        <Card key={c.id} className={`p-6 hover:shadow-lg transition-all border-l-4 cursor-pointer group ${c.isManualAttendance ? 'border-insan-orange' : 'border-insan-blue'}`} onClick={() => setSelectedCourse(c)}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-insan-blue dark:group-hover:text-blue-400 transition-colors">{c.name}</h3>
                                <Badge color={c.isManualAttendance ? 'orange' : 'blue'}>{c.level || 'Général'}</Badge>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2"><Clock size={14}/> {c.schedule}</p>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-700">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1"><Users size={14}/> {studentCount} Élèves</span>
                                <span className="text-xs font-bold text-insan-blue dark:text-blue-400 flex items-center gap-1">Faire l'appel <ChevronRight size={14}/></span>
                            </div>
                        </Card>
                    );
                })}
                {myCourses.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-3xl">
                        <BookOpen size={32} className="text-slate-200 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 dark:text-slate-500 font-medium">Aucun cours ne vous est assigné.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassAttendance;
