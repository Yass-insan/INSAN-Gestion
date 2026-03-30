
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
import CourseManagement from './features/academics/CourseManagement';
import StudentTracking from './features/academics/StudentTracking';
import PoleDashboard from './features/pole/PoleDashboard';
import PointagePage from './features/staff/PointagePage';
import RegistrationManagement from './features/admin/RegistrationManagement';
import TarificationSettings from './features/admin/TarificationSettings';
import Chat from './components/Chat';
import BlogManagement from './features/admin/BlogManagement';

// PAGES PUBLIQUES (SITE VITRINE)
import LandingPage from './features/public/LandingPage';
import CourseCatalog from './features/public/CourseCatalog';
import AboutPage from './features/public/AboutPage';
import NewsPage from './features/public/NewsPage';
import ContactPage from './features/public/ContactPage';
import PublicRegistration from './features/public/PublicRegistration';

// Fix: Add missing Homework to the imports from ./types
import { 
  User, UserRole, NewsItem, Course, AttendanceRecord, 
  InstituteSettings, WorkSchedule, Pole, LeaveRequest, 
  RegistrationDossier, PricingSettings, FollowUpRecord, GlobalHoliday,
  Homework
} from './types';
import { USERS, NEWS_LIST, COURSES, ATTENDANCE_HISTORY, HOMEWORK_LIST, WORK_SCHEDULES, POLES, LEAVE_REQUESTS } from './services/mockData';
import { DEFAULT_LAT, DEFAULT_LNG } from './services/utils';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ÉTAT PARTAGÉ CENTRALISÉ
  const [dossiers, setDossiers] = useState<RegistrationDossier[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>(COURSES);
  const [usersList, setUsersList] = useState<User[]>(USERS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(ATTENDANCE_HISTORY);
  const [news, setNews] = useState<NewsItem[]>(NEWS_LIST);
  const [schedules, setSchedules] = useState<WorkSchedule[]>(WORK_SCHEDULES);
  // Fix: Homework type is now imported correctly from ./types
  const [homeworkList, setHomeworkList] = useState<Homework[]>(HOMEWORK_LIST);
  const [polesList, setPolesList] = useState<Pole[]>(POLES);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(LEAVE_REQUESTS);
  const [globalHolidays, setGlobalHolidays] = useState<GlobalHoliday[]>([]);
  const [followUpRecords, setFollowUpRecords] = useState<FollowUpRecord[]>([]);

  const [pricingSettings, setPricingSettings] = useState<PricingSettings>({
      coursePrices: {},
      dossierFees: 40,
      montessoriFees: 80,
      discounts: { multiCourse: 10, multiChild: 15 }
  });

  const [instituteSettings, setInstituteSettings] = useState<InstituteSettings>({
    name: 'Institut Insan', address: '99 rue de Gerland, 69007 Lyon',
    lat: DEFAULT_LAT, lng: DEFAULT_LNG, radius: 100, rooms: [{name: 'Salle A', capacity: 25}], language: 'fr', currency: '€'
  });

  const handleSaveDossier = (dossier: RegistrationDossier) => {
    setDossiers(prev => {
        const exists = prev.find(d => d.id === dossier.id);
        if (exists) return prev.map(d => d.id === dossier.id ? dossier : d);
        return [dossier, ...prev];
    });
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

  const renderContent = () => {
    // --- ROUTES PUBLIQUES ---
    if (currentView === 'home') return <LandingPage onNavigate={setCurrentView} courses={coursesList} dossiers={dossiers} />;
    if (currentView === 'formations-online') return <CourseCatalog mode="remote" courses={coursesList} dossiers={dossiers} onRegister={() => setCurrentView('public-register')} />;
    if (currentView === 'formations-presence') return <CourseCatalog mode="on-site" courses={coursesList} dossiers={dossiers} onRegister={() => setCurrentView('public-register')} />;
    if (currentView === 'about') return <AboutPage />;
    if (currentView === 'news') return <NewsPage news={news} />;
    if (currentView === 'contact') return <ContactPage />;
    if (currentView === 'public-register') return <PublicRegistration courses={coursesList} dossiers={dossiers} pricing={pricingSettings} onComplete={handleSaveDossier} onBack={() => setCurrentView('home')} />;
    if (currentView === 'login') return <Login onLogin={handleLogin} />;

    // --- DASHBOARDS PRIVÉS (RESTRICTION AUTH) ---
    if (!user) return <Login onLogin={handleLogin} />;

    switch (currentView) {
      case 'dashboard':
        if (user.role === UserRole.STUDENT) return <StudentDashboard user={user} news={news} courses={coursesList} attendance={attendance} homework={homeworkList} onClockIn={() => {}} settings={instituteSettings} />;
        if (user.role === UserRole.ADMIN) return <AdminDashboard user={user} news={news} courses={coursesList} attendance={attendance} users={usersList} dossiers={dossiers} onAddNews={(n) => setNews([n, ...news])} settings={instituteSettings} schedules={schedules} poles={polesList} onNavigate={setCurrentView} />;
        if (user.role === UserRole.PROFESSOR) return <ProfessorDashboard user={user} news={news} courses={coursesList} attendance={attendance} homework={homeworkList} users={usersList} onClockIn={() => {}} onAddNews={(n) => setNews([n, ...news])} settings={instituteSettings} onAddAttendance={(r) => setAttendance([...attendance, r])} onManageHomework={(a, h) => setHomeworkList(a === 'add' ? [...homeworkList, h] : homeworkList.filter(x => x.id !== h.id))} />;
        if (user.role === UserRole.RESPONSIBLE) return <PoleDashboard user={user} news={news} courses={coursesList} attendance={attendance} users={usersList} onClockIn={() => {}} settings={instituteSettings} poles={polesList} />;
        if (user.role === UserRole.EMPLOYEE) return <EmployeeDashboard user={user} schedules={schedules} leaveRequests={leaveRequests} onClockIn={() => {}} settings={instituteSettings} onManageLeave={(a, l) => setLeaveRequests(a === 'add' ? [...leaveRequests, l] : leaveRequests.map(x => x.id === l.id ? l : x))} />;
        return <div className="p-10 text-center">Dashboard non configuré</div>;
      
      case 'inscriptions':
        return <RegistrationManagement dossiers={dossiers} users={usersList} courses={coursesList} poles={polesList} pricing={pricingSettings} currentUser={user} onSaveDossier={handleSaveDossier} onDeleteDossier={(id) => setDossiers(dossiers.filter(d => d.id !== id))} settings={instituteSettings} />;
      
      case 'students':
        return <StudentTracking users={usersList} courses={coursesList} attendance={attendance} dossiers={dossiers} followUpRecords={followUpRecords} onUpdateFollowUp={(r) => setFollowUpRecords(prev => prev.map(f => f.id === r.id ? r : f).concat(prev.some(f => f.id === r.id) ? [] : [r]))} onNavigateToStats={() => setCurrentView('stats')} onNavigateToDossier={() => setCurrentView('inscriptions')} homework={homeworkList} currentUser={user} onManageUsers={() => {}} />;

      case 'manage-courses':
        return <CourseManagement dossiers={dossiers} courses={coursesList} users={usersList} poles={polesList} settings={instituteSettings} onManage={(a, c) => setCoursesList(a === 'add' ? [...coursesList, c] : a === 'update' ? coursesList.map(x => x.id === c.id ? c : x) : coursesList.filter(x => x.id !== c.id))} onManagePoles={(a, p) => setPolesList(a === 'add' ? [...polesList, p] : a === 'update' ? polesList.map(x => x.id === p.id ? p : x) : polesList.filter(x => x.id !== p.id))} />;

      case 'manage-blog':
        return <BlogManagement news={news} onManage={(a, item) => setNews(a === 'add' ? [item, ...news] : a === 'update' ? news.map(x => x.id === item.id ? item : x) : news.filter(x => x.id !== item.id))} />;

      case 'employees':
        return <EmployeeManagement users={usersList} attendance={attendance} schedules={schedules} courses={coursesList} poles={polesList} leaveRequests={leaveRequests} globalHolidays={globalHolidays} onManageUsers={(a, u) => setUsersList(a === 'add' ? [...usersList, u] : a === 'update' ? usersList.map(x => x.id === u.id ? u : x) : usersList.filter(x => x.id !== u.id))} onManageSchedule={(a, s) => setSchedules(a === 'add' ? [...schedules, s] : schedules.filter(x => x.id !== s.id))} onManageLeave={(a, l) => setLeaveRequests(a === 'add' ? [...leaveRequests, l] : leaveRequests.map(x => x.id === l.id ? l : x))} onManageGlobalHoliday={(a, h) => setGlobalHolidays(a === 'add' ? [...globalHolidays, h] : globalHolidays.filter(x => x.id !== h.id))} />;

      case 'tarification':
        return <TarificationSettings pricing={pricingSettings} courses={coursesList} poles={polesList} onUpdate={setPricingSettings} settings={instituteSettings} />;

      case 'stats':
        return <StatisticsPage courses={coursesList} attendance={attendance} users={usersList} poles={polesList} dossiers={dossiers} settings={instituteSettings} />;

      case 'attendance':
        return <PointagePage user={user} schedules={schedules} attendance={attendance} settings={instituteSettings} onClockIn={(isExit) => {}} />;

      case 'chat':
        return <Chat currentUser={user} users={usersList} courses={coursesList} poles={polesList} attendance={attendance} />;

      case 'settings':
        return <SettingsPage settings={instituteSettings} onUpdateSettings={setInstituteSettings} />;

      default:
        return <div className="p-10 text-center">Module en cours de chargement...</div>;
    }
  };

  return (
    <Layout 
        user={user} 
        onLogout={() => { setUser(null); setCurrentView('home'); }} 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
        settings={instituteSettings}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
