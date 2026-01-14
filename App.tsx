import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';

// --- FEATURE IMPORTS ---
import AdminDashboard from './features/admin/AdminDashboard';
import { StatisticsPage } from './features/admin/StatisticsPage';
import { SettingsPage } from './features/admin/SettingsPage';
import StudentDashboard from './features/student/StudentDashboard';
import EmployeeManagement from './features/rh/EmployeeManagement';
import { EmployeeDashboard } from './features/employee/EmployeeDashboard';
import ProfessorDashboard from './features/professor/ProfessorDashboard';
import CourseManagement from './features/academics/CourseManagement';
import StudentTracking from './features/academics/StudentTracking';
import PoleDashboard from './features/pole/PoleDashboard';
import PointagePage from './features/staff/PointagePage';
import RegistrationManagement from './features/admin/RegistrationManagement';
import TarificationSettings from './features/admin/TarificationSettings';

// Shared Components
import Chat from './components/Chat';

import { 
  User, 
  UserRole, 
  NewsItem, 
  Course, 
  AttendanceRecord, 
  AttendanceStatus, 
  Homework, 
  InstituteSettings, 
  WorkSchedule, 
  Pole, 
  LeaveRequest, 
  LeaveStatus,
  RegistrationDossier,
  PricingSettings,
  FollowUpRecord,
  GlobalHoliday
} from './types';
import { USERS, NEWS_LIST, COURSES, ATTENDANCE_HISTORY, HOMEWORK_LIST, WORK_SCHEDULES, POLES, LEAVE_REQUESTS } from './services/mockData';
import { DEFAULT_LAT, DEFAULT_LNG } from './services/utils';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Theme Management
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // App State
  const [news, setNews] = useState<NewsItem[]>(NEWS_LIST);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(ATTENDANCE_HISTORY);
  const [coursesList, setCoursesList] = useState<Course[]>(COURSES);
  const [usersList, setUsersList] = useState<User[]>(USERS);
  const [schedules, setSchedules] = useState<WorkSchedule[]>(WORK_SCHEDULES);
  const [homeworkList, setHomeworkList] = useState<Homework[]>(HOMEWORK_LIST);
  const [polesList, setPolesList] = useState<Pole[]>(POLES);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(LEAVE_REQUESTS);
  
  const [globalHolidays, setGlobalHolidays] = useState<GlobalHoliday[]>([]);
  const [followUpRecords, setFollowUpRecords] = useState<FollowUpRecord[]>([]);

  // Statistics Deep-linking State
  const [statsFilters, setStatsFilters] = useState<{ poleId: string; classId: string }>({ poleId: 'ALL', classId: 'ALL' });

  // Registration State
  const [dossiers, setDossiers] = useState<RegistrationDossier[]>([]);
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>({
      coursePrices: {
          'c1': { onSite: 350, remote: 300 },
          'c2': { onSite: 280, remote: 250 },
          'c3': { onSite: 300, remote: 270 },
          'c4': { onSite: 450, remote: 400 }
      },
      hybridSurcharge: 50,
      dossierFees: 40,
      montessoriFees: 80,
      discounts: {
          multiCourse: 10,
          multiChild: 15
      }
  });

  // Institute Settings State
  const [instituteSettings, setInstituteSettings] = useState<InstituteSettings>({
    name: 'Institut Insan',
    address: '99 rue de Gerland, 69007 Lyon',
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    radius: 100,
    rooms: ['Salle A', 'Salle B', 'Salle C', 'Bibliothèque', 'Salle de Conférence']
  });

  const handleSaveDossier = (dossier: RegistrationDossier) => {
      setDossiers(prev => {
          const exists = prev.find(d => d.id === dossier.id);
          if (exists) {
              return prev.map(d => d.id === dossier.id ? dossier : d);
          }
          return [dossier, ...prev];
      });

      dossier.students.forEach(student => {
          const existingUser = usersList.find(u => u.id === student.id || u.email === student.email);
          if (!existingUser) {
              const newUser: User = {
                  id: student.id,
                  name: `${student.firstName} ${student.lastName}`,
                  email: student.email || `eleve.${student.id}@insan.com`,
                  role: UserRole.STUDENT,
                  classId: dossier.enrollments.find(e => e.studentId === student.id)?.courseId,
                  avatar: student.avatar || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random`
              };
              setUsersList(prev => [...prev, newUser]);
          } else {
              setUsersList(prev => prev.map(u => 
                  (u.id === student.id || u.email === student.email)
                  ? { ...u, avatar: student.avatar || u.avatar, name: `${student.firstName} ${student.lastName}` }
                  : u
              ));
          }
      });
  };

  const handleDeleteDossier = (id: string) => {
      if (window.confirm("Supprimer définitivement ce dossier d'inscription ?")) {
          setDossiers(prev => prev.filter(d => d.id !== id));
      }
  };

  const handleUpdateFollowUp = (record: FollowUpRecord) => {
      setFollowUpRecords(prev => {
          const exists = prev.find(f => f.studentId === record.studentId && f.courseId === record.courseId);
          if (exists) {
              return prev.map(f => (f.studentId === record.studentId && f.courseId === record.courseId) ? record : f);
          }
          return [...prev, record];
      });
  };

  const hasRole = (targetRole: UserRole) => {
      if (!user) return false;
      return user.role === targetRole || user.secondaryRoles?.includes(targetRole);
  };

  const handleLogin = (email: string) => {
    const foundUser = usersList.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      setCurrentView('dashboard');
    } else {
      alert("Identifiants incorrects");
    }
  };

  const handleClockIn = (isExit: boolean) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isExit) {
        setAttendance(prev => prev.map(r => 
            (r.studentId === user.id && r.date === today && !r.exitTimestamp) 
            ? { ...r, exitTimestamp: time } 
            : r
        ));
    } else {
        const newRecord: AttendanceRecord = {
          id: Date.now().toString(),
          studentId: user.id,
          courseId: user.classId || 'ADMIN', 
          date: today,
          entryTimestamp: time,
          status: AttendanceStatus.PRESENT 
        };
        setAttendance([newRecord, ...attendance]);
    }
  };

  const handleJustifyAttendance = (recordId: string, text: string) => {
      setAttendance(prev => prev.map(r => r.id === recordId ? { ...r, justification: text, justificationStatus: 'PENDING' } : r));
  };

  const handleAddAttendance = (record: AttendanceRecord) => {
    setAttendance([record, ...attendance]);
  };

  const handleAddNews = (item: NewsItem) => {
    setNews([item, ...news]);
  };

  const handleManageCourses = (action: 'add' | 'update' | 'delete', course: Course) => {
      if (action === 'add') setCoursesList(prev => [...prev, course]);
      else if (action === 'update') setCoursesList(prev => prev.map(c => c.id === course.id ? course : c));
      else if (action === 'delete') setCoursesList(prev => prev.filter(c => c.id !== course.id));
  };

  const handleManageUsers = (action: 'add' | 'update' | 'delete', updatedUser: User) => {
      if (action === 'add') setUsersList([...usersList, updatedUser]);
      else if (action === 'delete') setUsersList(usersList.filter(u => u.id !== updatedUser.id));
      else setUsersList(usersList.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleUpdateSettings = (settings: InstituteSettings) => setInstituteSettings(settings);

  const handleManageSchedule = (action: 'add' | 'delete', schedule: WorkSchedule) => {
      if (action === 'add') setSchedules([...schedules, schedule]);
      else setSchedules(schedules.filter(s => s.id !== schedule.id));
  };

  const handleManageHomework = (action: 'add' | 'delete', homework: Homework) => {
    if (action === 'add') setHomeworkList([...homeworkList, homework]);
    else setHomeworkList(homeworkList.filter(h => h.id !== homework.id));
  };

  const handleManagePoles = (action: 'add' | 'delete', pole: Pole) => {
      if (action === 'add') setPolesList([...polesList, pole]);
      else setPolesList(polesList.filter(p => p.id !== pole.id));
  };

  const handleManageLeave = (action: 'add' | 'update', leave: LeaveRequest) => {
      if (action === 'add') setLeaveRequests([leave, ...leaveRequests]);
      else setLeaveRequests(leaveRequests.map(l => l.id === leave.id ? leave : l));
  };

  const handleManageGlobalHolidays = (action: 'add' | 'delete', holiday: GlobalHoliday) => {
      if (action === 'add') setGlobalHolidays(prev => [...prev, holiday]);
      else setGlobalHolidays(prev => prev.filter(h => h.id !== holiday.id));
  };

  const handleNavigateToStats = (poleId: string, classId: string) => {
      setStatsFilters({ poleId, classId });
      setCurrentView('stats');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        if (hasRole(UserRole.STUDENT) && !hasRole(UserRole.ADMIN)) return <StudentDashboard user={user} news={news} courses={coursesList} attendance={attendance} homework={homeworkList} onClockIn={handleClockIn} settings={instituteSettings} onJustify={handleJustifyAttendance} leaveRequests={leaveRequests} onManageLeave={handleManageLeave} />;
        if (hasRole(UserRole.ADMIN)) return <AdminDashboard user={user} news={news} courses={coursesList} attendance={attendance} users={usersList} dossiers={dossiers} onAddNews={handleAddNews} settings={instituteSettings} schedules={schedules} poles={polesList} onNavigate={setCurrentView} />;
        if (hasRole(UserRole.PROFESSOR)) return <ProfessorDashboard user={user} news={news} courses={coursesList} attendance={attendance} homework={homeworkList} users={usersList} onClockIn={handleClockIn} onAddNews={handleAddNews} settings={instituteSettings} onAddAttendance={handleAddAttendance} onManageHomework={handleManageHomework} />;
        if (hasRole(UserRole.RESPONSIBLE)) return <PoleDashboard user={user} news={news} courses={coursesList} attendance={attendance} users={usersList} onClockIn={handleClockIn} settings={instituteSettings} poles={polesList} />;
        if (hasRole(UserRole.EMPLOYEE)) return <EmployeeDashboard user={user} schedules={schedules} leaveRequests={leaveRequests} onClockIn={handleClockIn} settings={instituteSettings} onManageLeave={handleManageLeave} />;
        return <div className="p-10 text-center text-gray-500">Rôle non reconnu.</div>;
      
      case 'inscriptions':
        return <RegistrationManagement dossiers={dossiers} courses={coursesList} poles={polesList} pricing={pricingSettings} currentUser={user} onSaveDossier={handleSaveDossier} onDeleteDossier={handleDeleteDossier} />;

      case 'tarification':
        return <TarificationSettings pricing={pricingSettings} courses={coursesList} poles={polesList} onUpdate={setPricingSettings} />;

      case 'attendance':
        if (hasRole(UserRole.PROFESSOR) || hasRole(UserRole.EMPLOYEE) || hasRole(UserRole.RESPONSIBLE)) {
            return <PointagePage user={user} schedules={schedules} attendance={attendance} settings={instituteSettings} onClockIn={handleClockIn} />;
        }
        return <StudentDashboard user={user} news={news} courses={coursesList} attendance={attendance} homework={homeworkList} onClockIn={handleClockIn} settings={instituteSettings} />;

      case 'my-rh':
        return <EmployeeDashboard user={user} schedules={schedules} leaveRequests={leaveRequests} onClockIn={handleClockIn} settings={instituteSettings} onManageLeave={handleManageLeave} />;

      case 'employees':
        return <EmployeeManagement users={usersList} attendance={attendance} schedules={schedules} courses={coursesList} poles={polesList} leaveRequests={leaveRequests} globalHolidays={globalHolidays} onAddAttendance={handleAddAttendance} onManageUsers={handleManageUsers} onManageSchedule={handleManageSchedule} onManageLeave={handleManageLeave} onManageGlobalHoliday={handleManageGlobalHolidays} />;

      case 'manage-courses':
        return <CourseManagement courses={coursesList} users={usersList} poles={polesList} settings={instituteSettings} onManage={handleManageCourses} onManagePoles={handleManagePoles} />;

      case 'settings':
        return <SettingsPage settings={instituteSettings} onUpdateSettings={handleUpdateSettings} />;

      case 'stats':
        return <StatisticsPage courses={coursesList} attendance={attendance} users={usersList} poles={polesList} dossiers={dossiers} initialFilters={statsFilters} />;

      case 'chat':
        return <Chat currentUser={user} users={usersList} courses={coursesList} poles={polesList} attendance={attendance} />;
        
      case 'students':
        const restrictedUsers = hasRole(UserRole.ADMIN) ? usersList : usersList.filter(u => u.role === UserRole.STUDENT && coursesList.filter(c => c.professorIds.includes(user.id)).some(c => c.id === u.classId));
        return <StudentTracking 
            users={restrictedUsers} 
            courses={coursesList} 
            attendance={attendance} 
            followUpRecords={followUpRecords} 
            onUpdateFollowUp={handleUpdateFollowUp} 
            onNavigateToStats={handleNavigateToStats}
            homework={homeworkList} 
            currentUser={user} 
            onManageUsers={handleManageUsers} 
        />;

      default:
        return <div className="p-10 text-center text-gray-500">Page en construction</div>;
    }
  };

  return (
    <Layout user={user} onLogout={() => setUser(null)} currentView={currentView} setCurrentView={setCurrentView} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
      {renderContent()}
    </Layout>
  );
}

export default App;