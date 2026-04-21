import React, { useState, useMemo } from 'react';
import { 
    User, 
    Course, 
    Pole, 
    UserRole, 
    StudentFormTemplate, 
    StudentFormRequest, 
    FormFieldDefinition, 
    FormFieldType,
    RegistrationDossier
} from '../../types';
import { Card, Badge, Button } from '../../components/ui/DesignSystem';
import { 
    Plus, 
    FileText, 
    Send, 
    Users as UsersIcon, 
    Trash2, 
    CheckCircle, 
    Clock, 
    ArrowRight,
    Settings,
    Layout,
    Check,
    X,
    ClipboardCheck,
    Filter,
    Search,
    Save,
    Bell,
    ChevronUp,
    ChevronDown,
    Copy,
    List,
    Type,
    Hash,
    Calendar as CalendarIcon,
    CheckSquare,
    Phone,
    Eye
} from 'lucide-react';
import { useToast } from '../../components/ui/DesignSystem';

interface DocumentManagerProps {
    users: User[];
    courses: Course[];
    poles: Pole[];
    dossiers: RegistrationDossier[];
    templates: StudentFormTemplate[];
    requests: StudentFormRequest[];
    onSaveTemplate: (template: StudentFormTemplate) => void;
    onDeleteTemplate: (id: string) => void;
    onSendRequests: (templateId: string, targets: string[]) => void;
    onRemindStudent?: (requestId: string) => void;
    onUpdateStatus: (requestId: string, status: 'PENDING' | 'COMPLETED', data?: any) => void;
    currentUser: User;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ 
    users, 
    courses, 
    poles, 
    dossiers, 
    templates, 
    requests, 
    onSaveTemplate, 
    onDeleteTemplate, 
    onSendRequests,
    onRemindStudent,
    onUpdateStatus,
    currentUser 
}) => {
    const { showToast } = useToast();
    const [view, setView] = useState<'list' | 'create' | 'tracking'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- TRACKING FILTERS ---
    const [filterTemplateId, setFilterTemplateId] = useState<string>('ALL');
    const [filterPoleId, setFilterPoleId] = useState<string>('ALL');
    
    // --- TEMPLATE CREATION STATE ---
    const [editingTemplate, setEditingTemplate] = useState<Partial<StudentFormTemplate> | null>(null);
    const [newFields, setNewFields] = useState<FormFieldDefinition[]>([]);

    // --- REQUEST SENDING STATE ---
    const [isSendingModalOpen, setIsSendingModalOpen] = useState(false);
    const [selectedTemplateForSend, setSelectedTemplateForSend] = useState<StudentFormTemplate | null>(null);
    const [targetType, setTargetType] = useState<'POLE' | 'COURSE' | 'INDIVIDUAL'>('POLE');
    const [selectedTargets, setSelectedTargets] = useState<string[]>([]);

    // --- VIEW RESULT STATE ---
    const [selectedRequestForView, setSelectedRequestForView] = useState<StudentFormRequest | null>(null);

    const students = useMemo(() => users.filter(u => u.role === UserRole.STUDENT), [users]);

    const handleAddField = () => {
        const field: FormFieldDefinition = {
            id: Date.now().toString(),
            label: '',
            type: FormFieldType.TEXT,
            required: true,
            placeholder: ''
        };
        setNewFields([...newFields, field]);
    };

    const handleUpdateField = (id: string, updates: Partial<FormFieldDefinition>) => {
        setNewFields(newFields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const handleRemoveField = (id: string) => {
        setNewFields(newFields.filter(f => f.id !== id));
    };

    const handleMoveField = (id: string, direction: 'up' | 'down') => {
        const index = newFields.findIndex(f => f.id === id);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === newFields.length - 1) return;

        const newArr = [...newFields];
        const offset = direction === 'up' ? -1 : 1;
        [newArr[index], newArr[index + offset]] = [newArr[index + offset], newArr[index]];
        setNewFields(newArr);
    };

    const handleDuplicateField = (field: FormFieldDefinition) => {
        const duplicatedField: FormFieldDefinition = {
            ...field,
            id: Date.now().toString(),
            label: `${field.label} (copie)`
        };
        const index = newFields.findIndex(f => f.id === field.id);
        const newArr = [...newFields];
        newArr.splice(index + 1, 0, duplicatedField);
        setNewFields(newArr);
    };

    const handleApplyPreset = (type: 'contact' | 'emergency' | 'health') => {
        let presetFields: FormFieldDefinition[] = [];
        const now = Date.now();

        if (type === 'contact') {
            presetFields = [
                { id: `c1_${now}`, label: 'Adresse Complète', type: FormFieldType.TEXT, required: true, placeholder: '123 Avenue Mohamed V...' },
                { id: `c2_${now}`, label: 'Numéro de Téléphone', type: FormFieldType.NUMBER, required: true, placeholder: '06 12 34 56 78' },
                { id: `c3_${now}`, label: 'Ville de résidence', type: FormFieldType.TEXT, required: true, placeholder: 'Lyon, Casablanca...' }
            ];
        } else if (type === 'emergency') {
            presetFields = [
                { id: `e1_${now}`, label: 'Personne à prévenir (Nom)', type: FormFieldType.TEXT, required: true, placeholder: 'M. Ahmed Ali' },
                { id: `e2_${now}`, label: 'Téléphone d\'urgence', type: FormFieldType.NUMBER, required: true, placeholder: '06 ...' },
                { id: `e3_${now}`, label: 'Lien de parenté', type: FormFieldType.TEXT, required: true, placeholder: 'Père, Mère, Tuteur...' }
            ];
        } else if (type === 'health') {
            presetFields = [
                { id: `h1_${now}`, label: 'Allergies connues', type: FormFieldType.TEXT, required: false, placeholder: 'Aucune, Pollen...' },
                { id: `h2_${now}`, label: 'Antécédents médicaux particuliers', type: FormFieldType.LONG_TEXT, required: false, placeholder: 'Veuillez préciser si nécessaire...' },
                { id: `h3_${now}`, label: 'Autorisation d\'intervention chirurgicale en cas d\'urgence', type: FormFieldType.CHECKBOX, required: true }
            ];
        }

        setNewFields([...newFields, ...presetFields]);
        showToast('Champs de pré-remplissage ajoutés !', 'success');
    };

    const handleSaveTemplate = () => {
        if (!editingTemplate?.title || newFields.length === 0) {
            alert("Veuillez donner un titre et ajouter au moins un champ.");
            return;
        }

        const template: StudentFormTemplate = {
            id: editingTemplate.id || Date.now().toString(),
            title: editingTemplate.title,
            description: editingTemplate.description || '',
            fields: newFields,
            createdAt: editingTemplate.createdAt || new Date().toISOString(),
            createdBy: currentUser.id
        };

        onSaveTemplate(template);
        setView('list');
        setEditingTemplate(null);
        setNewFields([]);
    };

    const handleOpenSendModal = (template: StudentFormTemplate) => {
        setSelectedTemplateForSend(template);
        setIsSendingModalOpen(true);
        setSelectedTargets([]);
    };

    const executeSendRequests = () => {
        if (!selectedTemplateForSend || selectedTargets.length === 0) return;
        
        // Find actual user IDs based on targets
        let targetUserIds: string[] = [];
        if (targetType === 'POLE') {
            const courseIds = courses.filter(c => selectedTargets.includes(c.pole)).map(c => c.id);
            targetUserIds = students.filter(s => s.classId && courseIds.includes(s.classId)).map(s => s.id);
        } else if (targetType === 'COURSE') {
            targetUserIds = students.filter(s => s.classId && selectedTargets.includes(s.classId)).map(s => s.id);
        } else {
            targetUserIds = selectedTargets;
        }

        if (targetUserIds.length === 0) {
            alert("Aucun élève trouvé pour ces critères.");
            return;
        }

        onSendRequests(selectedTemplateForSend.id, targetUserIds);
        setIsSendingModalOpen(false);
        setSelectedTemplateForSend(null);
        setSelectedTargets([]);
    };

    const toggleTarget = (id: string) => {
        if (selectedTargets.includes(id)) {
            setSelectedTargets(selectedTargets.filter(t => t !== id));
        } else {
            setSelectedTargets([...selectedTargets, id]);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm w-full md:w-auto">
                    <button 
                        onClick={() => setView('list')} 
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'list' || view === 'create' ? 'bg-insan-blue text-white shadow-lg shadow-blue-900/10' : 'text-slate-400'}`}
                    >
                        <Layout size={16}/> Modèles
                    </button>
                    <button 
                        onClick={() => setView('tracking')} 
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'tracking' ? 'bg-insan-blue text-white shadow-lg shadow-blue-900/10' : 'text-slate-400'}`}
                    >
                        <ClipboardCheck size={16}/> Suivi Envois
                    </button>
                </div>

                {view === 'list' && (
                    <button 
                        onClick={() => { setView('create'); setEditingTemplate({ title: '' }); setNewFields([]); }}
                        className="w-full md:w-auto bg-insan-blue text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 hover:bg-blue-900 transition-all active:scale-95"
                    >
                        <Plus size={18}/> Créer un Formulaire
                    </button>
                )}
            </div>

            {/* List View */}
            {(view === 'list') && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-slate-700">
                                <FileText size={32} className="text-slate-300"/>
                            </div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest">Aucun modèle créé</p>
                            <p className="text-xs text-slate-500 mt-1">Commencez par créer votre premier formulaire à envoyer aux élèves.</p>
                        </div>
                    ) : (
                        templates.map(tpl => {
                            const tplRequests = requests.filter(r => r.templateId === tpl.id);
                            const total = tplRequests.length;
                            const completed = tplRequests.filter(r => r.status === 'COMPLETED').length;
                            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                            
                            return (
                                <Card key={tpl.id} className="p-6 hover:shadow-2xl transition-all duration-300 group border-2 border-transparent hover:border-insan-blue/20 flex flex-col justify-between h-full bg-white dark:bg-slate-900 rounded-[2rem]">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-insan-blue group-hover:bg-insan-blue group-hover:text-white transition-colors">
                                                <FileText size={24}/>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge color="blue">{tpl.fields.length} champs</Badge>
                                                {total > 0 && (
                                                    <Badge color={percent === 100 ? 'green' : 'orange'}>{completed} / {total} reçus</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">{tpl.title}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4 line-clamp-2">{tpl.description}</p>
                                        
                                        {/* Completion Stats Progress Bar */}
                                        {total > 0 && (
                                            <div className="mb-6 bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progression globale</span>
                                                    <span className="text-[10px] font-black text-insan-blue">{percent}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 ${percent === 100 ? 'bg-green-500' : 'bg-insan-blue'}`}
                                                        style={{ width: `${percent}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                
                                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button 
                                        onClick={() => handleOpenSendModal(tpl)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-insan-blue hover:text-white dark:hover:bg-insan-blue py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-slate-100 dark:border-slate-700"
                                    >
                                        <Send size={14}/> Envoyer aux élèves
                                    </button>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => { setEditingTemplate(tpl); setNewFields(tpl.fields); setView('create'); }}
                                            className="flex-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all flex items-center justify-center gap-2 border border-slate-100 dark:border-slate-700"
                                        >
                                            <Settings size={14}/> Éditer
                                        </button>
                                        <button 
                                            onClick={() => onDeleteTemplate(tpl.id)}
                                            className="p-2.5 bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-100 dark:border-red-900/20"
                                        >
                                            <Trash2 size={14}/>
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
            )}

            {/* Create / Edit Form */}
            {view === 'create' && editingTemplate && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-8 rounded-[2.5rem]">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-6">Conception du Formulaire</h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Titre du document</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-insan-blue/20 dark:text-white"
                                        placeholder="Ex: Formulaire d'urgence, Fiche sanitaire..."
                                        value={editingTemplate.title}
                                        onChange={e => setEditingTemplate({...editingTemplate, title: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Instructions pour l'élève</label>
                                    <textarea 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-insan-blue/20 dark:text-white min-h-[100px]"
                                        placeholder="Décrivez ce que l'élève doit remplir..."
                                        value={editingTemplate.description}
                                        onChange={e => setEditingTemplate({...editingTemplate, description: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">Champs du formulaire</h4>
                                    <button 
                                        onClick={handleAddField}
                                        className="flex items-center gap-2 text-insan-blue font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-lg transition-all"
                                    >
                                        <Plus size={16}/> Ajouter un champ
                                    </button>
                                </div>

                                 <div className="space-y-4">
                                     {newFields.map((field, index) => (
                                         <div key={field.id} className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 relative group animate-slide-in hover:border-insan-blue/20 transition-all">
                                             <div className="flex justify-between items-start mb-4">
                                                 <div className="flex items-center gap-3">
                                                     <div className="w-8 h-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm">
                                                         {index + 1}
                                                     </div>
                                                     <div className="flex flex-col">
                                                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Type: {field.type}</span>
                                                         {field.required && <Badge color="orange" className="text-[8px] py-0">REQUIS</Badge>}
                                                     </div>
                                                 </div>
                                                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                     <button onClick={() => handleMoveField(field.id, 'up')} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-insan-blue disabled:opacity-20"><ChevronUp size={16}/></button>
                                                     <button onClick={() => handleMoveField(field.id, 'down')} disabled={index === newFields.length - 1} className="p-1.5 text-slate-400 hover:text-insan-blue disabled:opacity-20"><ChevronDown size={16}/></button>
                                                     <button onClick={() => handleDuplicateField(field)} className="p-1.5 text-slate-400 hover:text-insan-blue"><Copy size={16}/></button>
                                                     <button onClick={() => handleRemoveField(field.id)} className="p-1.5 text-red-300 hover:text-red-500"><X size={18}/></button>
                                                 </div>
                                             </div>

                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                 <div>
                                                     <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Libellé du champ</label>
                                                     <input 
                                                         type="text" 
                                                         className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-black outline-none focus:ring-2 focus:ring-insan-blue/20 dark:text-white"
                                                         value={field.label}
                                                         onChange={e => handleUpdateField(field.id, { label: e.target.value })}
                                                         placeholder="Ex: Nom complet"
                                                     />
                                                 </div>
                                                 <div>
                                                     <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Type de donnée</label>
                                                     <div className="relative">
                                                         <select 
                                                             className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-black outline-none focus:ring-2 focus:ring-insan-blue/20 dark:text-white appearance-none"
                                                             value={field.type}
                                                             onChange={e => handleUpdateField(field.id, { type: e.target.value as FormFieldType })}
                                                         >
                                                             <option value={FormFieldType.TEXT}>Texte court</option>
                                                             <option value={FormFieldType.LONG_TEXT}>Texte long</option>
                                                             <option value={FormFieldType.NUMBER}>Nombre</option>
                                                             <option value={FormFieldType.DATE}>Date</option>
                                                             <option value={FormFieldType.CHECKBOX}>Case à cocher</option>
                                                         </select>
                                                         <Settings size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                                     </div>
                                                 </div>
                                             </div>
                                             <div className="mt-4 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100/50 dark:border-slate-800/50">
                                                 <label className="flex items-center gap-2 cursor-pointer">
                                                     <input 
                                                         type="checkbox" 
                                                         checked={field.required}
                                                         onChange={e => handleUpdateField(field.id, { required: e.target.checked })}
                                                         className="w-4 h-4 rounded text-insan-blue focus:ring-insan-blue"
                                                     />
                                                     <span className="text-[10px] font-black text-slate-500 uppercase">Champ Obligatoire</span>
                                                 </label>
                                                 <div className="flex gap-4">
                                                     <input 
                                                        type="text"
                                                        placeholder="Suggérer un exemple..."
                                                        className="bg-transparent border-none text-[9px] font-bold text-slate-400 focus:ring-0 w-32"
                                                        value={field.placeholder || ''}
                                                        onChange={e => handleUpdateField(field.id, { placeholder: e.target.value })}
                                                     />
                                                 </div>
                                             </div>
                                         </div>
                                     ))}
                                    {newFields.length === 0 && (
                                        <p className="text-center py-8 text-slate-400 font-bold text-xs italic">Cliquez sur "+" pour ajouter des champs à ce formulaire.</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6 lg:sticky lg:top-6">
                        {/* PRESETS */}
                        <Card className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-xl">
                            <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                                <Plus size={20} className="text-insan-blue"/> Modèles de sections
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Ajoutez rapidement des blocs standards</p>
                            
                            <div className="space-y-4">
                                <button 
                                    onClick={() => handleApplyPreset('contact')}
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-insan-blue transition-all flex items-center gap-4 group"
                                >
                                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-insan-blue shadow-sm group-hover:scale-110 transition-transform">
                                        <Phone size={16}/>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">Bloc Contact</p>
                                        <p className="text-[9px] text-slate-400 font-medium">Adresse, Ville, Tel</p>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => handleApplyPreset('emergency')}
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-insan-blue transition-all flex items-center gap-4 group"
                                >
                                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-orange-500 shadow-sm group-hover:scale-110 transition-transform">
                                        <Bell size={16}/>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">Urgence</p>
                                        <p className="text-[9px] text-slate-400 font-medium">Tuteur, Proche, Urgence</p>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => handleApplyPreset('health')}
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-insan-blue transition-all flex items-center gap-4 group"
                                >
                                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-green-500 shadow-sm group-hover:scale-110 transition-transform">
                                        <CheckCircle size={16}/>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">Santé & Médical</p>
                                        <p className="text-[9px] text-slate-400 font-medium">Allergies, Autorisation</p>
                                    </div>
                                </button>
                            </div>
                        </Card>

                        <Card className="p-8 rounded-[2.5rem] bg-slate-900 text-white border-none shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-black uppercase tracking-tight">Résumé & Aperçu</h4>
                                <Badge color="blue">{newFields.length} CHAMPS</Badge>
                            </div>
                            
                            <div className="space-y-4 mb-10 min-h-[100px] border-2 border-dashed border-white/10 rounded-2xl p-4">
                                {newFields.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-4 text-white/20">
                                        <Layout size={24}/>
                                        <span className="text-[9px] mt-2 font-black uppercase tracking-widest">Aperçu en direct</span>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {newFields.map(f => (
                                            <div key={f.id} className="flex gap-3">
                                                <div className="shrink-0 text-white/40 pt-1">
                                                    {f.type === FormFieldType.TEXT && <Type size={12}/>}
                                                    {f.type === FormFieldType.NUMBER && <Hash size={12}/>}
                                                    {f.type === FormFieldType.DATE && <CalendarIcon size={12}/>}
                                                    {f.type === FormFieldType.CHECKBOX && <CheckSquare size={12}/>}
                                                    {f.type === FormFieldType.LONG_TEXT && <List size={12}/>}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-[10px] font-black uppercase tracking-tight truncate opacity-80">{f.label || 'Sans libellé'}</p>
                                                    <div className="mt-1 h-3 bg-white/10 rounded w-full"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-3">
                                <button 
                                    onClick={handleSaveTemplate}
                                    className="w-full bg-insan-blue text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-900/40 hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={16}/> Enregistrer le Modèle
                                </button>
                                <button 
                                    onClick={() => setView('list')}
                                    className="w-full bg-white/5 text-white/60 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                                >
                                    Annuler
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Tracking View */}
            {view === 'tracking' && (
                <div className="space-y-6 animate-fade-in">
                    {(() => {
                        const filtered = requests.filter(req => {
                            const student = users.find(u => u.id === req.studentId);
                            const tpl = templates.find(t => t.id === req.templateId);
                            const matchesSearch = student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                                   tpl?.title.toLowerCase().includes(searchTerm.toLowerCase());
                            const matchesTpl = filterTemplateId === 'ALL' || req.templateId === filterTemplateId;
                            
                            // Determine student's pole for filtering
                            const studentCourse = courses.find(c => c.id === student?.classId);
                            const matchesPole = filterPoleId === 'ALL' || studentCourse?.pole === filterPoleId;
                            
                            return matchesSearch && matchesTpl && matchesPole;
                        });

                        const total = filtered.length;
                        const completed = filtered.filter(r => r.status === 'COMPLETED').length;
                        const pending = total - completed;

                        return (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="p-6 border-l-4 border-insan-blue bg-blue-50/20 dark:bg-blue-900/20">
                                        <p className="text-[10px] font-black text-insan-blue uppercase tracking-widest mb-1">Envois (Filtre)</p>
                                        <p className="text-3xl font-black text-slate-800 dark:text-white">{total}</p>
                                    </Card>
                                    <Card className="p-6 border-l-4 border-green-500 bg-green-50/20 dark:bg-green-900/20">
                                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Complétés</p>
                                        <p className="text-3xl font-black text-slate-800 dark:text-white">{completed}</p>
                                    </Card>
                                    <Card className="p-6 border-l-4 border-amber-500 bg-amber-50/20 dark:bg-amber-900/20">
                                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">En attente / Fraction</p>
                                        <p className="text-3xl font-black text-slate-800 dark:text-white">{completed} / {total}</p>
                                    </Card>
                                </div>

                                <Card className="p-4 border-slate-100 dark:border-slate-800">
                                    <div className="flex flex-col md:flex-row gap-4 items-center">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                            <input 
                                                type="text" 
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-insan-blue/10 dark:text-white"
                                                placeholder="Rechercher par élève ou formulaire..."
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                                            <select 
                                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-insan-blue/20"
                                                value={filterTemplateId}
                                                onChange={e => setFilterTemplateId(e.target.value)}
                                            >
                                                <option value="ALL">Tous les formulaires</option>
                                                {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                            </select>
                                            <select 
                                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-insan-blue/20"
                                                value={filterPoleId}
                                                onChange={e => setFilterPoleId(e.target.value)}
                                            >
                                                <option value="ALL">Tous les pôles</option>
                                                {poles.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </Card>

                                <div className="space-y-3">
                                    {filtered.length === 0 ? (
                                        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                                            <p className="text-slate-400 font-bold italic">Aucun envoi trouvé correspondant à vos critères.</p>
                                        </div>
                                    ) : (
                                        filtered.map(req => {
                                            const student = users.find(u => u.id === req.studentId);
                                            const tpl = templates.find(t => t.id === req.templateId);
                                            const isCompleted = req.status === 'COMPLETED';
                                            
                                            return (
                                                <div key={req.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative shrink-0">
                                                            <img src={student?.avatar} className="w-12 h-12 rounded-xl object-cover" alt=""/>
                                                            {isCompleted ? (
                                                                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-900">
                                                                    <Check size={10}/>
                                                                </div>
                                                            ) : (
                                                                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-900">
                                                                    <Clock size={10}/>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-slate-800 dark:text-white text-sm">{student?.name}</h4>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1">
                                                                <FileText size={10}/> {tpl?.title}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-6">
                                                        <div className="hidden md:flex flex-col items-end">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date d'envoi</p>
                                                            <p className="text-xs font-bold dark:text-white">{new Date(req.requestedAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <Badge color={isCompleted ? 'green' : 'orange'}>
                                                            {isCompleted ? 'Complété' : 'En attente'}
                                                        </Badge>
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {isCompleted ? (
                                                                <Button 
                                                                    variant="secondary" 
                                                                    size="sm" 
                                                                    className="rounded-xl flex items-center gap-2"
                                                                    onClick={() => setSelectedRequestForView(req)}
                                                                >
                                                                    <Eye size={14}/> Voir
                                                                </Button>
                                                            ) : (
                                                                <Button 
                                                                    variant="secondary" 
                                                                    size="sm" 
                                                                    className="rounded-xl flex items-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 transition-all font-black text-[10px] uppercase tracking-widest"
                                                                    onClick={() => {
                                                                        onRemindStudent?.(req.id);
                                                                        showToast(`Relance envoyée à ${student?.name}`, 'info');
                                                                    }}
                                                                >
                                                                    <Bell size={14}/> Relancer
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}

            {/* MODALE D'ENVOI */}
            {isSendingModalOpen && selectedTemplateForSend && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setIsSendingModalOpen(false)}>
                    <Card className="w-full max-w-xl p-8 rounded-[2.5rem] relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsSendingModalOpen(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors"><X size={24}/></button>
                        
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-3xl text-insan-blue mb-4">
                                <Send size={32}/>
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Expédier le Formulaire</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase mt-1">"{selectedTemplateForSend.title}"</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Ciblage Académique</label>
                                <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                                    <button 
                                        onClick={() => { setTargetType('POLE'); setSelectedTargets([]); }}
                                        className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${targetType === 'POLE' ? 'bg-white dark:bg-slate-700 text-insan-blue shadow-sm' : 'text-slate-400'}`}
                                    >
                                        Par Pôle
                                    </button>
                                    <button 
                                        onClick={() => { setTargetType('COURSE'); setSelectedTargets([]); }}
                                        className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${targetType === 'COURSE' ? 'bg-white dark:bg-slate-700 text-insan-blue shadow-sm' : 'text-slate-400'}`}
                                    >
                                        Par Classe
                                    </button>
                                    <button 
                                        onClick={() => { setTargetType('INDIVIDUAL'); setSelectedTargets([]); }}
                                        className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${targetType === 'INDIVIDUAL' ? 'bg-white dark:bg-slate-700 text-insan-blue shadow-sm' : 'text-slate-400'}`}
                                    >
                                        Individuel
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-[250px] overflow-y-auto custom-scrollbar pr-2 space-y-2">
                                {targetType === 'POLE' && poles.map(p => (
                                    <div 
                                        key={p.id} 
                                        onClick={() => toggleTarget(p.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${selectedTargets.includes(p.id) ? 'border-insan-blue bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
                                    >
                                        <span className="text-[10px] font-black dark:text-white uppercase">{p.name}</span>
                                        {selectedTargets.includes(p.id) && <CheckCircle size={14} className="text-insan-blue"/>}
                                    </div>
                                ))}
                                {targetType === 'COURSE' && courses.map(c => (
                                    <div 
                                        key={c.id} 
                                        onClick={() => toggleTarget(c.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${selectedTargets.includes(c.id) ? 'border-insan-blue bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
                                    >
                                        <div>
                                            <p className="text-[10px] font-black dark:text-white uppercase">{c.name}</p>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase">{c.pole}</p>
                                        </div>
                                        {selectedTargets.includes(c.id) && <CheckCircle size={14} className="text-insan-blue"/>}
                                    </div>
                                ))}
                                {targetType === 'INDIVIDUAL' && students.map(s => {
                                    const course = courses.find(c => c.id === s.classId);
                                    return (
                                        <div 
                                            key={s.id} 
                                            onClick={() => toggleTarget(s.id)}
                                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${selectedTargets.includes(s.id) ? 'border-insan-blue bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img src={s.avatar} className="w-8 h-8 rounded-lg object-cover" alt=""/>
                                                <div>
                                                    <p className="text-[10px] font-black dark:text-white uppercase">{s.name}</p>
                                                    <p className="text-[8px] text-slate-400 font-bold uppercase">{course?.name || 'Sans classe'}</p>
                                                </div>
                                            </div>
                                            {selectedTargets.includes(s.id) && <CheckCircle size={14} className="text-insan-blue"/>}
                                        </div>
                                    );
                                })}
                            </div>

                            <button 
                                onClick={executeSendRequests}
                                disabled={selectedTargets.length === 0}
                                className="w-full bg-insan-blue text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 hover:bg-blue-900 transition-all flex items-center justify-center gap-3 disabled:opacity-20 disabled:cursor-not-allowed mt-4"
                            >
                                <Send size={16}/> Lancer l'expédition ({selectedTargets.length} cibles)
                            </button>
                        </div>
                    </Card>
                </div>
            )}

            {/* MODALE DE VUE DU RÉSULTAT */}
            {selectedRequestForView && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setSelectedRequestForView(null)}>
                    <Card className="w-full max-w-2xl p-0 rounded-[2.5rem] relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500 text-white rounded-2xl shadow-lg shadow-green-900/20">
                                    <ClipboardCheck size={24}/>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Réponse au Formulaire</h3>
                                    <p className="text-[10px] text-slate-450 font-bold uppercase tracking-widest">Élève : {users.find(u => u.id === selectedRequestForView.studentId)?.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRequestForView(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24}/></button>
                        </div>

                        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-6">
                                {(() => {
                                    const tpl = templates.find(t => t.id === selectedRequestForView.templateId);
                                    if (!tpl) return <p className="text-slate-400 italic">Modèle introuvable.</p>;
                                    
                                    return tpl.fields.map(field => (
                                        <div key={field.id} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                                {field.label}
                                            </label>
                                            <div className="text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                                                {field.type === FormFieldType.CHECKBOX ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-4 h-4 rounded flex items-center justify-center ${selectedRequestForView.submittedData?.[field.id] ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                                            {selectedRequestForView.submittedData?.[field.id] && <Check size={10}/>}
                                                        </div>
                                                        <span>{selectedRequestForView.submittedData?.[field.id] ? 'Accepté / Validé' : 'Non coché'}</span>
                                                    </div>
                                                ) : (
                                                    selectedRequestForView.submittedData?.[field.id] || <span className="text-slate-400 italic font-medium">Non renseigné</span>
                                                )}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <Button onClick={() => setSelectedRequestForView(null)} className="px-8 rounded-xl font-black uppercase tracking-widest text-xs">Fermer</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default DocumentManager;
