
import { User, AttendanceRecord, AttendanceStatus, UserRole } from '../types';

// Institut Insan Coordinates
// 45.73573062211056, 4.841091638787199
export const DEFAULT_LAT = 45.73573062211056; 
export const DEFAULT_LNG = 4.841091638787199;

export const calculateDistance = (lat: number, lng: number, targetLat: number = DEFAULT_LAT, targetLng: number = DEFAULT_LNG): number => {
  const R = 6371e3; // metres
  const φ1 = lat * Math.PI/180; // φ, λ in radians
  const φ2 = targetLat * Math.PI/180;
  const Δφ = (targetLat-lat) * Math.PI/180;
  const Δλ = (targetLng-lng) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const d = R * c; // in metres
  return d;
};

export const isLate = (classTime: string): boolean => {
    return false; // Toggle for testing
};

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'PRESENT': return 'text-green-600 bg-green-100';
        case 'ABSENT': return 'text-red-600 bg-red-100';
        case 'LATE': return 'text-orange-600 bg-orange-100';
        case 'JUSTIFIED': return 'text-blue-600 bg-blue-100';
        default: return 'text-gray-600 bg-gray-100';
    }
};

// --- Statistics Helpers ---

export interface StudentStats {
    present: number;
    late: number;
    absent: number;
    total: number;
    rate: number; // Percentage of assiduity (Present + Late)
}

export interface ClassStats {
    totalStudents: number;
    avgPresence: number;
    avgLate: number;
    avgAbsence: number;
}

export const getStudentStats = (studentId: string, courseId: string, attendance: AttendanceRecord[]): StudentStats => {
    // Filter records for this student AND this course
    const records = attendance.filter(r => r.studentId === studentId && r.courseId === courseId);
    
    const present = records.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.JUSTIFIED).length;
    const late = records.filter(r => r.status === AttendanceStatus.LATE).length;
    const absent = records.filter(r => r.status === AttendanceStatus.ABSENT).length;
    
    const total = records.length;
    // Calculation: Assiduity = (Present + Late + Justified) / Total sessions recorded * 100
    // Note: If total is 0, we return 100% by default for new students
    const rate = total === 0 ? 100 : Math.round(((present + late) / total) * 100);

    return { present, late, absent, total, rate };
};

export const getClassStats = (courseId: string, allUsers: User[], allAttendance: AttendanceRecord[]): ClassStats => {
    const students = allUsers.filter(u => u.role === UserRole.STUDENT && u.classId === courseId);
    const totalStudents = students.length;

    if (totalStudents === 0) {
        return { totalStudents: 0, avgPresence: 0, avgLate: 0, avgAbsence: 0 };
    }

    let totalPresencePct = 0;
    let totalLatePct = 0;
    let totalAbsencePct = 0;

    // We calculate the average based on the records existing for the class
    const classRecords = allAttendance.filter(r => r.courseId === courseId);
    const totalRecords = classRecords.length;

    if (totalRecords === 0) {
         return { totalStudents, avgPresence: 0, avgLate: 0, avgAbsence: 0 };
    }

    const presentCount = classRecords.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.JUSTIFIED).length;
    const lateCount = classRecords.filter(r => r.status === AttendanceStatus.LATE).length;
    const absentCount = classRecords.filter(r => r.status === AttendanceStatus.ABSENT).length;

    totalPresencePct = Math.round((presentCount / totalRecords) * 100);
    totalLatePct = Math.round((lateCount / totalRecords) * 100);
    totalAbsencePct = Math.round((absentCount / totalRecords) * 100);

    return {
        totalStudents,
        avgPresence: totalPresencePct,
        avgLate: totalLatePct,
        avgAbsence: totalAbsencePct
    };
};
