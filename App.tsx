
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
import Chat from './components/Chat';

// Fix: Add missing Homework to the imports from ./types
import { 
  User, UserRole, NewsItem, Course, AttendanceRecord, 
  InstituteSettings, WorkSchedule, Pole, LeaveRequest, 
  RegistrationDossier, PricingSettings, FollowUpRecord, GlobalHoliday,
  Homework, RegistrationStatus, FollowUpStatus, TestCourse, WaitingListEntry
} from './types';
import { USERS, NEWS_LIST, COURSES, ATTENDANCE_HISTORY, HOMEWORK_LIST, WORK_SCHEDULES, POLES, LEAVE_REQUESTS } from './services/mockData';
import { DEFAULT_LAT, DEFAULT_LNG } from './services/utils';

import { ToastProvider, useToast } from './components/ui/DesignSystem';

function AppContent() {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('login');
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

  const [pricingSettings, setPricingSettings] = useState<PricingSettings>({
      coursePrices: {},
      dossierFees: 40,
      montessoriFees: 80,
      discounts: { multiCourse: 10, multiChild: 15 },
      paymentMethods: ['ESPÈCES', 'CARTE', 'VIREMENT', 'CHÈQUE']
  });

  const [instituteSettings, setInstituteSettings] = useState<InstituteSettings>({
    name: 'Institut Insan', address: '99 rue de Gerland, 69007 Lyon',
    lat: DEFAULT_LAT, lng: DEFAULT_LNG, radius: 100, rooms: [{name: 'Salle A', capacity: 25}], language: 'fr', currency: '€',
    cgvExcerpt: "En validant ce dossier, vous reconnaissez avoir pris connaissance et accepter sans réserve les Conditions Générales de Vente de l'Institut Insan.",
    cgv: `Institut Insan — institutinsan.com

En vigueur au 28 mars 2026

Les présentes Conditions Générales de Vente (CGV) régissent les relations entre l'association Institut Insan et toute personne (ci-après « le bénéficiaire ») souscrivant à une formation ou un service proposé par l'association, en présentiel ou à distance.

1. Identification de l'association

DénominationINSTITUT INSANForme juridiqueAssociation loi 1901SIRET903 045 243 00024Adresse99 rue de Gerland, Allée 4 — 69007 LyonTéléphone09 70 70 70 88E-mailcontact@institut-insan.com

2. Champ d'application

Les présentes CGV s'appliquent à toutes les formations, cours, stages et activités proposés par l'Institut Insan, qu'ils soient dispensés en présentiel ou à distance via la plateforme insan-enligne.com.

Toute inscription implique l'acceptation sans réserve des présentes CGV. L'association se réserve le droit de les modifier à tout moment ; les conditions applicables sont celles en vigueur au jour de l'inscription.

3. Inscription

3.1 Inscription en présentiel

L'inscription en présentiel s'effectue directement à l'Institut Insan pendant les horaires d'ouverture, sans rendez-vous préalable. Un formulaire d'inscription devra être complété.

3.2 Inscription en ligne

L'inscription aux formations à distance s'effectue en autonomie sur la plateforme insan-enligne.com. Le bénéficiaire s'engage à fournir des informations exactes et à jour.

3.3 Mineurs

L'inscription d'un mineur (personne âgée de moins de 18 ans) requiert impérativement la présence du responsable légal lors de l'inscription. L'Institut Insan se réserve le droit de refuser toute inscription incomplète.

4. Tarifs et modalités de paiement

4.1 Tarifs

Les tarifs des formations sont communiqués sur demande auprès de l'Institut Insan et peuvent varier selon la formation, la durée et la formule choisie. Ils peuvent être révisés à tout moment ; le tarif applicable est celui en vigueur au moment de l'inscription.

4.2 Modalités de paiement

Les modes de paiement acceptés sont les suivants :

Espèces (en présentiel)

Chèque à l'ordre de « Institut Insan »

Par carte bancaire via TPE

Par carte bancaire via stripe

Virement bancaire (coordonnées communiquées sur demande)

Le paiement est exigible à l'inscription, sauf accord écrit spécifique avec l'association.

5. Droit de rétractation

Conformément aux articles L.221-18 et suivants du Code de la consommation, le bénéficiaire disposant de la qualité de consommateur bénéficie d'un délai de rétractation de 14 jours calendaires à compter de la date d'inscription, pour les contrats conclus à distance ou hors établissement.

Pour exercer ce droit, le bénéficiaire doit notifier sa décision de rétractation par e-mail à contact@institut-insan.com ou par courrier recommandé avec accusé de réception avant l'expiration du délai.

Exception : le droit de rétractation ne s'applique pas aux formations dont l'exécution a commencé avec l'accord exprès du bénéficiaire avant l'expiration du délai de rétractation (art. L.221-28 du Code de la consommation).

6. Remboursements

En dehors du droit de rétractation légal, les remboursements sont accordés dans les conditions suivantes :

Demande effectuée avant la 3e séance : remboursement intégral de la part non consommée

Demande effectuée après la 2e séance : aucun remboursement ne sera accordé

Pour toute demande de remboursement, le bénéficiaire doit contacter l'association à l'adresse : contact@institut-insan.com. Les remboursements sont effectués par le même moyen de paiement que celui utilisé lors de l'inscription, dans un délai de 14 jours.

7. Cours d'essai

L'Institut Insan propose la possibilité de tester un cours à titre gratuit avant tout engagement. Cette session d'essai est soumise à disponibilité et doit être convenue à l'avance avec l'équipe de l'association.

8. Obligations de l'association

L'association Institut Insan s'engage à :

Dispenser les formations décrites avec sérieux et compétence

Mettre à disposition les ressources pédagogiques nécessaires

Informer les bénéficiaires de toute modification du programme

Assurer la confidentialité des données personnelles conformément à sa politique de confidentialité

9. Obligations du bénéficiaire

Le bénéficiaire s'engage à :

Respecter les règles de vie en communauté et le règlement intérieur de l'association

Régler les frais d'inscription dans les délais convenus

Signaler toute absence à l'avance dans la mesure du possible

Ne pas perturber le bon déroulement des cours

10. Annulation par l'association

L'Institut Insan se réserve le droit d'annuler ou de reporter une formation en cas de force majeure, d'absence imprévue de l'enseignant ou de nombre insuffisant de participants. Dans ce cas, le bénéficiaire sera informé dans les meilleurs délais et se verra proposer un report ou un remboursement intégral.

11. Responsabilité

L'Institut Insan décline toute responsabilité en cas de perte ou de vol d'effets personnels au sein de ses locaux. La responsabilité de l'association ne pourra être engagée qu'en cas de faute prouvée de sa part ou de ses membres.

12. Propriété intellectuelle

Les contenus pédagogiques (cours, supports, enregistrements) mis à disposition dans le cadre des formations sont la propriété exclusive de l'Institut Insan ou de ses intervenants. Toute reproduction, diffusion ou utilisation sans autorisation écrite préalable est interdite.

13. Médiation et règlement des litiges

En cas de litige, le bénéficiaire est invité à contacter en priorité l'association à l'adresse contact@institut-insan.com afin de rechercher une solution amiable.

À défaut de résolution amiable, le bénéficiaire consommateur peut recourir à un médiateur de la consommation. La Commission Européenne met également à disposition une plateforme de Règlement en Ligne des Litiges : https://ec.europa.eu/consumers/odr

À défaut, les tribunaux français seront seuls compétents, sous réserve des règles d'ordre public applicables.

14. Droit applicable

Les présentes CGV sont soumises au droit français. Tout litige sera soumis aux juridictions françaises compétentes.

En cas de question sur les présentes conditions, contactez-nous : contact@institut-insan.com`
  });

  const handleSaveDossier = (dossier: RegistrationDossier) => {
    setDossiers(prev => {
        const exists = prev.find(d => d.id === dossier.id);
        if (exists) return prev.map(d => d.id === dossier.id ? dossier : d);
        return [dossier, ...prev];
    });

    // Automatically add/update students in usersList
    if (dossier.status === RegistrationStatus.ACTIVE) {
      setUsersList(prevUsers => {
        let updatedUsers = [...prevUsers];
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
            // Update existing user if classId is missing or changed
            const existingUser = updatedUsers[existingUserIndex];
            if (classId && existingUser.classId !== classId) {
              updatedUsers[existingUserIndex] = {
                ...existingUser,
                classId: classId,
                avatar: studentInfo.avatar || existingUser.avatar
              };
            }
          }
        });
        return updatedUsers;
      });
    }
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

  const handleUpdateNews = (updatedNews: NewsItem) => {
    setNews(prev => prev.map(n => n.id === updatedNews.id ? updatedNews : n));
  };

  const renderContent = () => {
    // --- AUTHENTICATION ---
    if (!user || currentView === 'login') return <Login onLogin={handleLogin} />;

    switch (currentView) {
      case 'dashboard':
        const filteredNews = news.filter(n => n.visibleTo?.includes(user.role));
        if (user.role === UserRole.STUDENT) return <StudentDashboard user={user} news={filteredNews} courses={coursesList} attendance={attendance} homework={homeworkList} onClockIn={() => {}} settings={instituteSettings} />;
        if (user.role === UserRole.ADMIN) return <AdminDashboard user={user} news={news} courses={coursesList} attendance={attendance} users={usersList} dossiers={dossiers} onAddNews={(n) => setNews([n, ...news])} onUpdateNews={handleUpdateNews} onDeleteNews={(id) => setNews(news.filter(n => n.id !== id))} settings={instituteSettings} schedules={schedules} poles={polesList} onNavigate={setCurrentView} />;
        if (user.role === UserRole.PROFESSOR) return <ProfessorDashboard user={user} news={filteredNews} courses={coursesList} attendance={attendance} homework={homeworkList} users={usersList} onClockIn={() => {}} onAddNews={(n) => setNews([n, ...news])} settings={instituteSettings} onAddAttendance={(r) => setAttendance([...attendance, r])} onManageHomework={(a, h) => setHomeworkList(a === 'add' ? [...homeworkList, h] : homeworkList.filter(x => x.id !== h.id))} />;
        if (user.role === UserRole.RESPONSIBLE) return <PoleDashboard user={user} news={filteredNews} courses={coursesList} attendance={attendance} users={usersList} onClockIn={() => {}} settings={instituteSettings} poles={polesList} />;
        if (user.role === UserRole.EMPLOYEE) return <EmployeeDashboard user={user} news={filteredNews} schedules={schedules} leaveRequests={leaveRequests} onClockIn={() => {}} settings={instituteSettings} onManageLeave={(a, l) => setLeaveRequests(a === 'add' ? [...leaveRequests, l] : leaveRequests.map(x => x.id === l.id ? l : x))} />;
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
          settings={instituteSettings} 
          testCourses={testCourses} 
          onSaveTestCourse={(tc) => setTestCourses([tc, ...testCourses])} 
          waitingList={waitingList}
          onSaveWaitingList={(entry) => setWaitingList([entry, ...waitingList])}
        />;
      
      case 'students':
        return <StudentTracking users={usersList} courses={coursesList} attendance={attendance} dossiers={dossiers} followUpRecords={followUpRecords} onUpdateFollowUp={(r) => setFollowUpRecords(prev => prev.map(f => f.id === r.id ? r : f).concat(prev.some(f => f.id === r.id) ? [] : [r]))} onNavigateToStats={() => setCurrentView('stats')} onNavigateToDossier={() => setCurrentView('inscriptions')} homework={homeworkList} currentUser={user} onManageUsers={() => {}} />;

      case 'manage-courses':
        return <CourseManagement dossiers={dossiers} courses={coursesList} users={usersList} poles={polesList} settings={instituteSettings} onManage={(a, c) => setCoursesList(prev => a === 'add' ? [c, ...prev] : a === 'update' ? prev.map(x => x.id === c.id ? c : x) : prev.filter(x => x.id !== c.id))} onManagePoles={(a, p) => setPolesList(prev => a === 'add' ? [p, ...prev] : a === 'update' ? prev.map(x => x.id === p.id ? p : x) : prev.filter(x => x.id !== p.id))} />;

      case 'employees':
        return <EmployeeManagement users={usersList} attendance={attendance} schedules={schedules} courses={coursesList} poles={polesList} leaveRequests={leaveRequests} globalHolidays={globalHolidays} onManageUsers={(a, u) => setUsersList(a === 'add' ? [...usersList, u] : a === 'update' ? usersList.map(x => x.id === u.id ? u : x) : usersList.filter(x => x.id !== u.id))} onManageSchedule={(a, s) => setSchedules(a === 'add' ? [...schedules, s] : schedules.filter(x => x.id !== s.id))} onManageLeave={(a, l) => setLeaveRequests(a === 'add' ? [...leaveRequests, l] : leaveRequests.map(x => x.id === l.id ? l : x))} onManageGlobalHoliday={(a, h) => setGlobalHolidays(a === 'add' ? [...globalHolidays, h] : globalHolidays.filter(x => x.id !== h.id))} />;

      case 'tarification':
        return <TarificationSettings pricing={pricingSettings} courses={coursesList} poles={polesList} onUpdate={setPricingSettings} settings={instituteSettings} />;

      case 'stats':
        return <StatisticsPage courses={coursesList} attendance={attendance} users={usersList} poles={polesList} dossiers={dossiers} settings={instituteSettings} />;

      case 'class-attendance':
        if (!user) return null;
        return <ClassAttendance user={user} courses={coursesList} users={usersList} attendance={attendance} onAddAttendance={(r) => setAttendance([...attendance, r])} settings={instituteSettings} />;

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
        onLogout={() => { setUser(null); setCurrentView('login'); }} 
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

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
