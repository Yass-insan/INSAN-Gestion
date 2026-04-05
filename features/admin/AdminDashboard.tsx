
import React, { useState, useMemo } from 'react';
import { User, NewsItem, Course, AttendanceRecord, InstituteSettings, UserRole, WorkSchedule, Pole, RegistrationDossier } from '../../types';
import { Card, Button, Badge, PageHeader } from '../../components/ui/DesignSystem';
import { Users, Check, Euro, Activity, UserCheck, BarChart3, PieChart as PieChartIcon, MessageSquare, Image as ImageIcon, ChevronRight, Settings, FileText, Globe, Plus, Bell, Eye, Trash2, Megaphone, X, Edit2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getTranslation } from '../../services/i18n';

interface AdminDashboardProps {
    user: User;
    news: NewsItem[];
    courses: Course[];
    attendance: AttendanceRecord[];
    users: User[];
    settings: InstituteSettings;
    schedules: WorkSchedule[];
    poles: Pole[];
    dossiers: RegistrationDossier[];
    onAddNews: (news: NewsItem) => void;
    onUpdateNews: (news: NewsItem) => void;
    onDeleteNews?: (id: string) => void;
    onNavigate: (view: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    user, news, courses, attendance, users, settings, poles, dossiers, onAddNews, onUpdateNews, onDeleteNews, onNavigate 
}) => {
    const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
    const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
    const [newNews, setNewNews] = useState<Partial<NewsItem>>({
        title: '',
        content: '',
        isUrgent: false,
        visibleTo: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT, UserRole.EMPLOYEE, UserRole.RESPONSIBLE],
        coverUrl: '',
        galleryUrls: []
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'gallery') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const processFile = (file: File): Promise<string> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        };

        if (type === 'cover') {
            processFile(files[0]).then(base64 => {
                setNewNews(prev => ({ ...prev, coverUrl: base64 }));
            });
        } else {
            const promises = Array.from(files).map(processFile);
            Promise.all(promises).then(base64s => {
                setNewNews(prev => ({ ...prev, galleryUrls: [...(prev.galleryUrls || []), ...base64s] }));
            });
        }
    };

    const removeGalleryImage = (index: number) => {
        setNewNews(prev => ({
            ...prev,
            galleryUrls: prev.galleryUrls?.filter((_, i) => i !== index)
        }));
    };

    const handleAddNews = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNews.title || !newNews.content) return;
        
        const newsData: NewsItem = {
            id: editingNewsId || Date.now().toString(),
            title: newNews.title,
            content: newNews.content,
            date: new Date().toISOString().split('T')[0],
            author: user.name,
            isUrgent: newNews.isUrgent,
            visibleTo: newNews.visibleTo || [],
            category: 'Général',
            coverUrl: newNews.coverUrl,
            galleryUrls: newNews.galleryUrls
        };

        if (editingNewsId) {
            onUpdateNews(newsData);
        } else {
            onAddNews(newsData);
        }
        
        closeModal();
    };

    const closeModal = () => {
        setIsNewsModalOpen(false);
        setEditingNewsId(null);
        setNewNews({
            title: '',
            content: '',
            isUrgent: false,
            visibleTo: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT, UserRole.EMPLOYEE, UserRole.RESPONSIBLE],
            coverUrl: '',
            galleryUrls: []
        });
    };

    const handleEditClick = (n: NewsItem) => {
        setEditingNewsId(n.id);
        setNewNews({
            title: n.title,
            content: n.content,
            isUrgent: n.isUrgent,
            visibleTo: n.visibleTo,
            coverUrl: n.coverUrl || '',
            galleryUrls: n.galleryUrls || []
        });
        setIsNewsModalOpen(true);
    };

    const toggleVisibility = (role: UserRole) => {
        setNewNews(prev => {
            const current = prev.visibleTo || [];
            if (current.includes(role)) {
                return { ...prev, visibleTo: current.filter(r => r !== role) };
            } else {
                return { ...prev, visibleTo: [...current, role] };
            }
        });
    };

    const lang = settings.language || 'fr';
    const currency = settings.currency || '€';
    const t = (key: string) => getTranslation(key, lang);

    const financialStats = useMemo(() => {
        const stats = {
            totalCA: 0,
            totalPaid: 0,
            caByPole: {} as Record<string, number>,
            totalInscriptions: dossiers.length
        };

        dossiers.forEach(d => {
            const dossierTotal = d.enrollments.reduce((acc, e) => acc + (e.isVolunteerTeacher ? 0 : e.basePrice + (e.formulaSurcharge || 0)), 0) + 
                               d.dossierFees + (d.montessoriFees || 0) - (d.autoDiscount || 0) - (d.manualDiscount || 0);
            const paid = d.payments.reduce((acc, p) => acc + p.amount, 0);
            stats.totalCA += dossierTotal;
            stats.totalPaid += paid;

            d.enrollments.forEach(e => {
                const course = courses.find(c => c.id === e.courseId);
                if (course) {
                    const price = e.isVolunteerTeacher ? 0 : e.basePrice + (e.formulaSurcharge || 0);
                    stats.caByPole[course.pole] = (stats.caByPole[course.pole] || 0) + price;
                }
            });
        });
        return stats;
    }, [dossiers, courses]);

    const poleChartData = useMemo(() => {
        return Object.entries(financialStats.caByPole).map(([id, value]) => ({
            name: poles.find(p => p.id === id)?.name || id,
            value: value as number
        })).sort((a: any, b: any) => b.value - a.value);
    }, [financialStats.caByPole, poles]);

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <PageHeader 
                title="Pilotage" 
                subtitle="Tableau de bord stratégique de l'Institut." 
                action={
                    <Button onClick={() => onNavigate('stats')} variant="secondary" icon={<BarChart3 size={18}/>}>Analyses détaillées</Button>
                }
            />

            {/* QUICK KPIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Dossiers</p>
                    <Card className="p-8 border-0 shadow-lg hover:translate-y-[-4px] transition-all cursor-pointer group" onClick={() => onNavigate('inscriptions')}>
                        <div className="flex justify-between items-center">
                            <p className="text-4xl font-black text-slate-800 dark:text-white group-hover:text-insan-blue transition-colors">{financialStats.totalInscriptions}</p>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-insan-blue dark:text-blue-400 rounded-2xl"><UserCheck size={24}/></div>
                        </div>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-4 uppercase">Familles actives</p>
                    </Card>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Chiffre d'Affaires</p>
                    <Card className="p-8 border-0 shadow-lg">
                        <div className="flex justify-between items-center">
                            <p className="text-4xl font-black text-slate-800 dark:text-white">{financialStats.totalCA.toLocaleString()}<span className="text-xl ml-1 opacity-20">{currency}</span></p>
                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-insan-orange dark:text-orange-400 rounded-2xl"><Euro size={24}/></div>
                        </div>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-4 uppercase">Volume total estimé</p>
                    </Card>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Trésorerie</p>
                    <Card className="p-8 border-0 shadow-lg">
                        <div className="flex justify-between items-center">
                            <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{financialStats.totalPaid.toLocaleString()}<span className="text-xl ml-1 opacity-20">{currency}</span></p>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl"><Check size={24}/></div>
                        </div>
                        <p className="text-xs font-bold text-emerald-700/50 dark:text-emerald-500/50 mt-4 uppercase">Montant encaissé</p>
                    </Card>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Taux d'Assiduité</p>
                    <Card className="p-8 border-0 shadow-lg">
                        <div className="flex justify-between items-center">
                            <p className="text-4xl font-black text-slate-800 dark:text-white">84%</p>
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl"><Activity size={24}/></div>
                        </div>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-4 uppercase">Moyenne établissement</p>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Analytics Section */}
                <div className="lg:col-span-2 space-y-10">
                    <Card className="p-10 shadow-xl border-0">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Actualités de l'Institut</h3>
                                <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">Gérez les communications internes et externes.</p>
                            </div>
                            <Button onClick={() => setIsNewsModalOpen(true)} icon={<Plus size={18}/>}>Publier une annonce</Button>
                        </div>
                        
                        <div className="space-y-4">
                            {news.slice(0, 5).map(n => (
                                <div key={n.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-insan-blue transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${n.isUrgent ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-insan-blue'}`}>
                                                <Megaphone size={18}/>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-800 dark:text-white">{n.title}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Publié le {n.date} par {n.author}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditClick(n)} className="p-2 text-slate-300 hover:text-insan-blue transition-colors">
                                                <Edit2 size={16}/>
                                            </button>
                                            {onDeleteNews && (
                                                <button onClick={() => onDeleteNews(n.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16}/>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">{n.content}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1"><Eye size={10}/> Visible pour :</span>
                                        {n.visibleTo.map(role => (
                                            <Badge key={role} color="gray" className="text-[8px]">{role}</Badge>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {news.length === 0 && <p className="text-center py-10 text-slate-400 italic">Aucune actualité publiée.</p>}
                        </div>
                    </Card>

                    <Card className="p-10 shadow-xl border-0">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Répartition par Pôle</h3>
                                <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">Volume de CA par département d'enseignement.</p>
                            </div>
                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300"><BarChart3 size={24}/></div>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={poleChartData} layout="vertical" margin={{ left: 0 }}>
                                    <CartesianGrid strokeDasharray="5 5" horizontal={false} stroke="#e2e8f0" opacity={0.3} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} width={100} />
                                    <Tooltip 
                                        cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}
                                    />
                                    <Bar dataKey="value" name="C.A" radius={[0, 10, 10, 0]} barSize={24}>
                                        {poleChartData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#262262' : '#f7941d'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Quick Stats or other relevant info could go here */}
                </div>

                {/* Sidebar Info Section */}
                <div className="space-y-10">
                    <Card className="p-0 border-0 shadow-2xl bg-insan-blue text-white overflow-hidden group">
                        <div className="p-8 pb-4">
                            <h3 className="text-xl font-black flex items-center gap-3"><Activity size={24} className="text-insan-orange"/> Inscriptions</h3>
                            <p className="text-xs text-blue-200/60 uppercase font-black mt-2 tracking-widest">Activités Récentes</p>
                        </div>
                        <div className="p-8 pt-4 space-y-8">
                            {dossiers.slice(0, 4).map(d => (
                                <div key={d.id} className="flex items-center gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0 hover:translate-x-2 transition-transform cursor-pointer" onClick={() => onNavigate('inscriptions')}>
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-insan-orange text-lg">
                                        {d.lastName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black truncate">{d.firstName} {d.lastName}</p>
                                        <p className="text-[10px] text-blue-200/40 font-bold uppercase tracking-tighter">le {new Date(d.createdAt || '').toLocaleDateString()}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-white/20"/>
                                </div>
                            ))}
                            {dossiers.length === 0 && <p className="text-center py-10 text-white/40 italic text-xs">Aucune donnée.</p>}
                        </div>
                        <div className="p-6 bg-black/20 text-center">
                             <button onClick={() => onNavigate('inscriptions')} className="text-[10px] font-black text-insan-orange hover:underline tracking-widest uppercase">Gérer tous les dossiers</button>
                        </div>
                    </Card>

                    <Card className="p-8 bg-slate-50 dark:bg-slate-800/50 border-0 shadow-inner">
                        <h4 className="font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3 uppercase text-xs tracking-widest">
                            <Settings size={18} className="text-slate-400"/> Pilotage Rapide
                        </h4>
                        <div className="space-y-3">
                            {[
                                { id: 'tarification', label: 'Tarifs & Règles', icon: Euro },
                                { id: 'manage-courses', label: 'Catalogue Cours', icon: BarChart3 },
                                { id: 'employees', label: 'Ressources Humaines', icon: Users }
                            ].map(link => (
                                <button key={link.id} onClick={() => onNavigate(link.id)} className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-insan-blue transition-all group shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-insan-blue transition-colors"><link.icon size={18}/></div>
                                        <span className="text-sm font-black text-slate-600 dark:text-slate-300 group-hover:text-insan-blue transition-colors">{link.label}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-all"/>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
            {/* MODAL AJOUT ACTUALITÉ */}
            {isNewsModalOpen && (
                <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 flex justify-center items-start">
                    <Card className="w-full max-w-2xl my-8 animate-fade-in bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="sticky top-0 z-10 p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-insan-blue text-white rounded-2xl shadow-lg shadow-insan-blue/20">
                                    <Megaphone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-slate-800 dark:text-white">{editingNewsId ? 'Modifier l\'annonce' : 'Nouvelle annonce'}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Communication institutionnelle</p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="hover:bg-slate-200 dark:hover:bg-slate-700 p-3 rounded-2xl transition-colors text-slate-500 dark:text-slate-400"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleAddNews} className="p-10 space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Titre de l'annonce</label>
                                    <input 
                                        required 
                                        type="text" 
                                        placeholder="Ex: Fermeture exceptionnelle..." 
                                        value={newNews.title} 
                                        onChange={e => setNewNews({...newNews, title: e.target.value})} 
                                        className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 dark:text-white font-bold outline-none focus:ring-2 focus:ring-insan-blue/20 transition-all" 
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Contenu du message</label>
                                    <textarea 
                                        required 
                                        placeholder="Détails de votre annonce..." 
                                        value={newNews.content} 
                                        onChange={e => setNewNews({...newNews, content: e.target.value})} 
                                        className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 dark:text-white font-bold outline-none min-h-[150px] focus:ring-2 focus:ring-insan-blue/20 transition-all"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Photo de couverture</label>
                                        <div className="relative group">
                                            {newNews.coverUrl ? (
                                                <div className="relative h-40 rounded-3xl overflow-hidden border-2 border-insan-blue">
                                                    <img src={newNews.coverUrl} className="w-full h-full object-cover" alt="Cover preview" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setNewNews({...newNews, coverUrl: ''})}
                                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl cursor-pointer hover:border-insan-blue hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all">
                                                    <ImageIcon className="text-slate-300 mb-2" size={32} />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ajouter une photo</span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'cover')} />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Galerie photos</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {newNews.galleryUrls?.map((url, idx) => (
                                                <div key={idx} className="relative h-20 rounded-2xl overflow-hidden group">
                                                    <img src={url} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeGalleryImage(idx)}
                                                        className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-insan-blue hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all">
                                                <Plus className="text-slate-300" size={20} />
                                                <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFileChange(e, 'gallery')} />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">Cibles de visibilité</label>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { role: UserRole.STUDENT, label: 'Étudiants' },
                                            { role: UserRole.PROFESSOR, label: 'Professeurs' },
                                            { role: UserRole.EMPLOYEE, label: 'Employés' },
                                            { role: UserRole.RESPONSIBLE, label: 'Responsables' },
                                            { role: UserRole.ADMIN, label: 'Administrateurs' }
                                        ].map(target => (
                                            <button
                                                key={target.role}
                                                type="button"
                                                onClick={() => toggleVisibility(target.role)}
                                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${
                                                    newNews.visibleTo?.includes(target.role)
                                                    ? 'bg-insan-blue border-insan-blue text-white shadow-md'
                                                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-insan-blue/30'
                                                }`}
                                            >
                                                {target.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                                    <input 
                                        type="checkbox" 
                                        id="urgent" 
                                        checked={newNews.isUrgent} 
                                        onChange={e => setNewNews({...newNews, isUrgent: e.target.checked})}
                                        className="w-5 h-5 rounded border-red-300 text-red-600 focus:ring-red-500"
                                    />
                                    <label htmlFor="urgent" className="text-sm font-black text-red-700 dark:text-red-400 cursor-pointer">Marquer comme URGENT (Notification prioritaire)</label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="secondary" className="flex-1 py-4" onClick={closeModal}>Annuler</Button>
                                <Button type="submit" className="flex-[2] py-4 shadow-xl shadow-insan-blue/20">{editingNewsId ? 'Enregistrer les modifications' : 'Publier l\'annonce'}</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
