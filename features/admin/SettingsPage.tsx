import React, { useState, useRef } from 'react';
import { InstituteSettings, Room } from '../../types';
import { Card, Button, useToast } from '../../components/ui/DesignSystem';
import { Settings, DoorOpen, Plus, X, Save, Users, Edit2, Check, Languages, Coins, FileSignature, FileText, Image as ImageIcon, Upload, Trash2, AlertCircle, Mail, Paperclip } from 'lucide-react';

export const SettingsPage: React.FC<{ settings?: InstituteSettings, onUpdateSettings?: (s: InstituteSettings) => void }> = ({ settings, onUpdateSettings }) => {
    const [editSettings, setEditSettings] = useState<InstituteSettings>(settings || { name: '', address: '', lat: 0, lng: 0, radius: 100, rooms: [], language: 'fr', currency: '€', cgv: '', cgvExcerpt: '', logo: '', logoDark: '', lateThresholdMinutes: 15 });
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const darkFileInputRef = useRef<HTMLInputElement>(null);
    
    // States for adding a new room
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomCapacity, setNewRoomCapacity] = useState(25);

    // States for email attachments
    const [newAttachmentName, setNewAttachmentName] = useState('');
    const attachmentInputRef = useRef<HTMLInputElement>(null);

    // States for editing an existing room
    const [editingRoomName, setEditingRoomName] = useState<string | null>(null);
    const [tempRoom, setTempRoom] = useState<Room | null>(null);

    // Double confirmation state
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSave = () => { 
        setShowConfirm(true);
    };

    const handleFinalConfirm = () => {
        if (onUpdateSettings) { 
            onUpdateSettings(editSettings); 
            showToast("Paramètres de l'établissement enregistrés !", "success"); 
        } 
        setShowConfirm(false);
    };
    
    const handleAddRoom = () => { 
        if (newRoomName.trim()) { 
            const newRoom: Room = { name: newRoomName.trim(), capacity: newRoomCapacity };
            setEditSettings({ ...editSettings, rooms: [...(editSettings.rooms || []), newRoom] }); 
            setNewRoomName(''); 
            setNewRoomCapacity(25);
        } 
    };

    const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast("Le fichier est trop lourd (max 5Mo)", "error");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const currentTemplate = editSettings.emailTemplate || { subject: '', body: '', attachments: [] };
                const newAttachments = [...(currentTemplate.attachments || []), { 
                    filename: file.name, 
                    content: reader.result as string 
                }];
                setEditSettings({
                    ...editSettings,
                    emailTemplate: { ...currentTemplate, attachments: newAttachments }
                });
                showToast(`Fichier "${file.name}" ajouté !`, "success");
                if (attachmentInputRef.current) attachmentInputRef.current.value = '';
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAttachment = (index: number) => {
        const currentTemplate = editSettings.emailTemplate;
        if (currentTemplate && currentTemplate.attachments) {
            const newAttachments = currentTemplate.attachments.filter((_, i) => i !== index);
            setEditSettings({
                ...editSettings,
                emailTemplate: { ...currentTemplate, attachments: newAttachments }
            });
        }
    };

    const handleDeleteRoom = (roomName: string) => { 
        if (window.confirm(`Supprimer la salle "${roomName}" ?`)) {
            setEditSettings({ ...editSettings, rooms: editSettings.rooms?.filter(r => r.name !== roomName) }); 
        }
    };

    const handleStartEdit = (room: Room) => {
        setEditingRoomName(room.name);
        setTempRoom({ ...room });
    };

    const handleCancelEdit = () => {
        setEditingRoomName(null);
        setTempRoom(null);
    };

    const handleSaveEdit = (oldName: string) => {
        if (tempRoom && tempRoom.name.trim()) {
            setEditSettings({
                ...editSettings,
                rooms: editSettings.rooms.map(r => r.name === oldName ? tempRoom : r)
            });
            setEditingRoomName(null);
            setTempRoom(null);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast("L'image est trop lourde (max 2Mo)", "error");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditSettings({ ...editSettings, logo: reader.result as string });
                showToast("Logo chargé avec succès !", "success");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setEditSettings({ ...editSettings, logo: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDarkLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast("L'image est trop lourde (max 2Mo)", "error");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditSettings({ ...editSettings, logoDark: reader.result as string });
                showToast("Logo mode sombre chargé !", "success");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveDarkLogo = () => {
        setEditSettings({ ...editSettings, logoDark: '' });
        if (darkFileInputRef.current) darkFileInputRef.current.value = '';
    };

    return (
        <Card className="p-10 max-w-4xl mx-auto animate-fade-in mb-20">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-insan-blue dark:text-blue-400 rounded-2xl">
                    <Settings size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Paramètres de l'établissement</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Configuration générale, salles et géolocalisation pour le pointage.</p>
                </div>
            </div>

            <div className="space-y-10">
                {/* LOGO DE L'APP */}
                <div className="pt-4">
                    <h3 className="font-black text-xl text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                        <ImageIcon size={24} className="text-insan-orange"/> Identité Visuelle
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* LOGO CLAIR */}
                        <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-inner">
                                    {editSettings.logo ? (
                                        <img src={editSettings.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <ImageIcon size={32} className="text-slate-300" />
                                    )}
                                </div>
                                {editSettings.logo && (
                                    <button 
                                        onClick={handleRemoveLogo}
                                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all active:scale-90"
                                        title="Supprimer le logo"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 space-y-3 text-center md:text-left">
                                <div>
                                    <h4 className="font-black text-sm text-slate-800 dark:text-white">Logo Mode Clair</h4>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Affiché sur fond blanc ou clair.</p>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleLogoUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <Button 
                                        onClick={() => fileInputRef.current?.click()}
                                        variant="primary"
                                        size="sm"
                                        icon={<Upload size={14} />}
                                    >
                                        {editSettings.logo ? 'Changer' : 'Télécharger'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* LOGO SOMBRE */}
                        <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-900/10 dark:bg-slate-950/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden shadow-inner">
                                    {editSettings.logoDark ? (
                                        <img src={editSettings.logoDark} alt="Logo Sombre" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <ImageIcon size={32} className="text-slate-700" />
                                    )}
                                </div>
                                {editSettings.logoDark && (
                                    <button 
                                        onClick={handleRemoveDarkLogo}
                                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all active:scale-90"
                                        title="Supprimer le logo"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 space-y-3 text-center md:text-left">
                                <div>
                                    <h4 className="font-black text-sm text-slate-800 dark:text-white">Logo Mode Sombre</h4>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Affiché sur fond sombre ou noir.</p>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                    <input 
                                        type="file" 
                                        ref={darkFileInputRef}
                                        onChange={handleDarkLogoUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <Button 
                                        onClick={() => darkFileInputRef.current?.click()}
                                        variant="primary"
                                        size="sm"
                                        icon={<Upload size={14} />}
                                    >
                                        {editSettings.logoDark ? 'Changer' : 'Télécharger'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center lg:text-left">Format recommandé: PNG ou SVG, max 2Mo</p>
                </div>

                {/* IDENTITÉ & LOCALISATION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Nom de l'Institut</label>
                        <input type="text" value={editSettings.name || ''} onChange={e => setEditSettings({...editSettings, name: e.target.value})} className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-bold outline-none bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-insan-blue/20 transition-all shadow-inner" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Adresse Postale</label>
                        <input type="text" value={editSettings.address || ''} onChange={e => setEditSettings({...editSettings, address: e.target.value})} className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-bold outline-none bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-insan-blue/20 transition-all shadow-inner" />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Latitude (GPS)</label>
                        <input type="number" step="any" value={editSettings.lat ?? 0} onChange={e => setEditSettings({...editSettings, lat: parseFloat(e.target.value)})} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-4 font-mono outline-none bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Longitude (GPS)</label>
                        <input type="number" step="any" value={editSettings.lng ?? 0} onChange={e => setEditSettings({...editSettings, lng: parseFloat(e.target.value)})} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-4 font-mono outline-none bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-all" />
                    </div>
                </div>

                {/* PRÉFÉRENCES RÉGIONALES */}
                <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="font-black text-xl text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                        <Languages size={24} className="text-insan-blue dark:text-blue-400"/> Localisation & Devise
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <div>
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Languages size={14}/> Langue de l'interface
                            </label>
                            <select 
                                value={editSettings.language || 'fr'} 
                                onChange={e => setEditSettings({...editSettings, language: e.target.value})}
                                className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold outline-none focus:ring-2 focus:ring-insan-blue/20 shadow-sm"
                            >
                                <option value="fr">Français (France)</option>
                                <option value="en">English (US)</option>
                                <option value="ar">العربية (Arabic)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Coins size={14}/> Devise de l'Institut
                            </label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    value={editSettings.currency || '€'} 
                                    onChange={e => setEditSettings({...editSettings, currency: e.target.value})}
                                    placeholder="Ex: €, $, MAD..."
                                    className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold outline-none focus:ring-2 focus:ring-insan-blue/20 shadow-sm"
                                />
                                <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black text-insan-blue dark:text-blue-400">
                                    {editSettings.currency || '€'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PARAMÈTRES DE POINTAGE */}
                <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="font-black text-xl text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                        <AlertCircle size={24} className="text-insan-orange"/> Paramètres de Pointage
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <div className="max-w-md">
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <AlertCircle size={14}/> Seuil de retard (minutes)
                            </label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="number" 
                                    min="0"
                                    max="60"
                                    value={editSettings.lateThresholdMinutes ?? 15} 
                                    onChange={e => setEditSettings({...editSettings, lateThresholdMinutes: parseInt(e.target.value) || 0})}
                                    className="w-32 border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 dark:text-white font-bold outline-none focus:ring-2 focus:ring-insan-blue/20 shadow-sm"
                                />
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    Seuil spécifique pour les <strong>étudiants</strong>. Le personnel (profs, employés) est considéré en retard après 1 minute.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* GESTION DES SALLES */}
                <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="font-black text-xl text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                        <DoorOpen size={24} className="text-insan-orange"/> Inventaire des Salles
                    </h3>
                    
                    {/* FORMULAIRE NOUVELLE SALLE */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 mb-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Créer une nouvelle salle</p>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <input type="text" placeholder="Ex: Salle de Conférence" value={newRoomName || ''} onChange={e => setNewRoomName(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3.5 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-insan-blue/20 font-bold" />
                            </div>
                            <div className="w-full md:w-40 flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 group focus-within:ring-2 focus-within:ring-insan-blue/20">
                                <Users size={16} className="text-slate-400 mr-2"/>
                                <input type="number" value={newRoomCapacity ?? 20} onChange={e => setNewRoomCapacity(parseInt(e.target.value))} className="w-full py-3.5 bg-transparent dark:text-white outline-none font-bold" title="Capacité physique de la salle" />
                            </div>
                            <button onClick={handleAddRoom} className="bg-insan-blue text-white px-8 rounded-xl font-black hover:bg-blue-900 transition-all flex items-center justify-center gap-2 h-[54px] shadow-lg shadow-blue-900/10 active:scale-95">
                                <Plus size={20}/> AJOUTER
                            </button>
                        </div>
                    </div>

                    {/* LISTE DES SALLES EXISTANTES */}
                    <div className="grid grid-cols-1 gap-3">
                        {editSettings.rooms?.map(room => {
                            const isEditing = editingRoomName === room.name;
                            
                            return (
                                <div key={room.name} className={`px-5 py-4 rounded-[1.5rem] border transition-all flex items-center justify-between ${isEditing ? 'bg-blue-50/50 dark:bg-blue-900/10 border-insan-blue dark:border-blue-500 shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}>
                                    
                                    {isEditing ? (
                                        /* VUE ÉDITION */
                                        <div className="flex-1 flex flex-col md:flex-row gap-4 mr-4 animate-fade-in">
                                            <div className="flex-1">
                                                <input 
                                                    type="text" 
                                                    value={tempRoom?.name || ''} 
                                                    onChange={e => setTempRoom(prev => prev ? {...prev, name: e.target.value} : null)} 
                                                    className="w-full bg-white dark:bg-slate-900 border border-insan-blue/30 dark:border-blue-500/30 rounded-xl px-3 py-2 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-insan-blue/20"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="w-32 flex items-center bg-white dark:bg-slate-900 border border-insan-blue/30 dark:border-blue-500/30 rounded-xl px-3 py-2">
                                                <Users size={14} className="text-insan-blue mr-2 shrink-0"/>
                                                <input 
                                                    type="number" 
                                                    value={tempRoom?.capacity || 0} 
                                                    onChange={e => setTempRoom(prev => prev ? {...prev, capacity: parseInt(e.target.value)} : null)} 
                                                    className="w-full bg-transparent text-sm font-black dark:text-white outline-none"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        /* VUE LECTURE */
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-2xl text-slate-400 shrink-0">
                                                <DoorOpen size={20}/>
                                            </div>
                                            <div>
                                                <p className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight">{room.name}</p>
                                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1 mt-1 tracking-widest">
                                                    <Users size={12} className="text-insan-blue dark:text-blue-400"/> {room.capacity} places physiques
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1 shrink-0">
                                        {isEditing ? (
                                            <>
                                                <button 
                                                    onClick={() => handleSaveEdit(room.name)} 
                                                    className="p-2.5 bg-insan-blue text-white rounded-xl shadow-md hover:bg-blue-900 transition-all active:scale-90"
                                                    title="Valider les modifications"
                                                >
                                                    <Check size={18}/>
                                                </button>
                                                <button 
                                                    onClick={handleCancelEdit} 
                                                    className="p-2.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-300 transition-all active:scale-90"
                                                    title="Annuler"
                                                >
                                                    <X size={18}/>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={() => handleStartEdit(room)} 
                                                    className="p-2.5 text-slate-400 hover:text-insan-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                                    title="Modifier cette salle"
                                                >
                                                    <Edit2 size={18}/>
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteRoom(room.name)} 
                                                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                    title="Supprimer cette salle"
                                                >
                                                    <X size={18}/>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {(!editSettings.rooms || editSettings.rooms.length === 0) && (
                            <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]">
                                <p className="text-slate-400 italic font-medium">Aucune salle n'est encore configurée dans l'établissement.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* GESTION DES CGV */}
                <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="font-black text-xl text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                        <FileSignature size={24} className="text-insan-blue dark:text-blue-400"/> Conditions Générales de Vente
                    </h3>
                    
                    <div className="space-y-8">
                        <div>
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <FileText size={14}/> Extrait des CGV (Affiché dans la modale de signature)
                            </label>
                            <textarea 
                                value={editSettings.cgvExcerpt || ''} 
                                onChange={e => setEditSettings({...editSettings, cgvExcerpt: e.target.value})}
                                placeholder="Un court résumé des points clés..."
                                className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-medium outline-none bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-insan-blue/20 transition-all shadow-inner min-h-[120px]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <FileSignature size={14}/> Texte complet des CGV
                            </label>
                            <textarea 
                                value={editSettings.cgv || ''} 
                                onChange={e => setEditSettings({...editSettings, cgv: e.target.value})}
                                placeholder="Le texte complet des CGV..."
                                className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-medium outline-none bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-insan-blue/20 transition-all shadow-inner min-h-[300px]"
                            />
                        </div>
                    </div>
                </div>

                {/* MODÈLE D'EMAIL DE CONFIRMATION */}
                <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="font-black text-xl text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                        <Mail size={24} className="text-insan-blue dark:text-blue-400"/> E-mail de Confirmation
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                            <p className="text-xs font-bold text-insan-blue dark:text-blue-400 flex items-center gap-2">
                                <AlertCircle size={14}/> Variables disponibles :
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <code className="px-2 py-1 bg-white dark:bg-slate-900 rounded text-[10px] font-mono border border-blue-100 dark:border-blue-800">{"{{studentName}}"}</code>
                                <code className="px-2 py-1 bg-white dark:bg-slate-900 rounded text-[10px] font-mono border border-blue-100 dark:border-blue-800">{"{{studentFirstName}}"}</code>
                                <code className="px-2 py-1 bg-white dark:bg-slate-900 rounded text-[10px] font-mono border border-blue-100 dark:border-blue-800">{"{{studentLastName}}"}</code>
                                <code className="px-2 py-1 bg-white dark:bg-slate-900 rounded text-[10px] font-mono border border-blue-100 dark:border-blue-800">{"{{studentPhone}}"}</code>
                                <code className="px-2 py-1 bg-white dark:bg-slate-900 rounded text-[10px] font-mono border border-blue-100 dark:border-blue-800">{"{{guardianName}}"}</code>
                                <code className="px-2 py-1 bg-white dark:bg-slate-900 rounded text-[10px] font-mono border border-blue-100 dark:border-blue-800">{"{{instituteName}}"}</code>
                                <code className="px-2 py-1 bg-white dark:bg-slate-900 rounded text-[10px] font-mono border border-blue-100 dark:border-blue-800">{"{{dossierId}}"}</code>
                                <code className="px-2 py-1 bg-white dark:bg-slate-900 rounded text-[10px] font-mono border border-blue-100 dark:border-blue-800">{"{{totalAmount}}"}</code>
                                <code className="px-2 py-1 bg-white dark:bg-slate-900 rounded text-[10px] font-mono border border-blue-100 dark:border-blue-800">{"{{amountPaid}}"}</code>
                                <code className="px-2 py-1 bg-white dark:bg-slate-900 rounded text-[10px] font-mono border border-blue-100 dark:border-blue-800">{"{{balance}}"}</code>
                                <code className="px-2 py-1 bg-white dark:bg-slate-900 rounded text-[10px] font-mono border border-blue-100 dark:border-blue-800">{"{{coursesList}}"}</code>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Sujet de l'e-mail</label>
                            <input 
                                type="text" 
                                value={editSettings.emailTemplate?.subject || ''} 
                                onChange={e => setEditSettings({
                                    ...editSettings, 
                                    emailTemplate: { ...(editSettings.emailTemplate || { subject: '', body: '', attachments: [] }), subject: e.target.value }
                                })}
                                className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-bold outline-none bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-insan-blue/20 transition-all shadow-inner"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Corps du message (HTML autorisé)</label>
                            <textarea 
                                value={editSettings.emailTemplate?.body || ''} 
                                onChange={e => setEditSettings({
                                    ...editSettings, 
                                    emailTemplate: { ...(editSettings.emailTemplate || { subject: '', body: '', attachments: [] }), body: e.target.value }
                                })}
                                className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-medium outline-none bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-insan-blue/20 transition-all shadow-inner min-h-[250px] font-mono text-sm"
                            />
                        </div>

                        {/* PIÈCES JOINTES */}
                        <div className="pt-4">
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Pièces Jointes (Fichiers Locaux)</label>
                            
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 mb-4">
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group" onClick={() => attachmentInputRef.current?.click()}>
                                    <input 
                                        type="file" 
                                        ref={attachmentInputRef}
                                        onChange={handleAddAttachment}
                                        className="hidden"
                                    />
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-insan-blue dark:text-blue-400 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                        <Upload size={24} />
                                    </div>
                                    <p className="font-black text-slate-800 dark:text-white">Cliquez pour ajouter un fichier</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PDF, Image, etc. (Max 5Mo)</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {editSettings.emailTemplate?.attachments?.map((att, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Paperclip size={16} className="text-insan-blue"/>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white">{att.filename}</p>
                                                <p className="text-[10px] text-slate-400">Fichier chargé localement</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveAttachment(idx)}
                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOUTON SAUVEGARDE GLOBALE */}
                <div className="pt-10 flex justify-center">
                    <button 
                        onClick={handleSave} 
                        className="w-full md:w-auto md:px-12 bg-insan-orange text-white py-4 rounded-2xl font-black text-base hover:bg-orange-600 flex items-center justify-center gap-3 transition-all shadow-xl shadow-orange-500/20 active:scale-95 group"
                    >
                        <Save size={20} className="group-hover:rotate-12 transition-transform"/> ENREGISTRER TOUS LES PARAMÈTRES
                    </button>
                </div>
            </div>

            {/* MODAL DE DOUBLE CONFIRMATION */}
            {showConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <Card className="max-w-md w-full p-8 shadow-2xl border-slate-200 dark:border-slate-700">
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-insan-orange rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Confirmation requise</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                Êtes-vous sûr de vouloir enregistrer ces modifications ? Cette action mettra à jour les paramètres globaux de l'institut.
                            </p>
                            <div className="flex flex-col gap-3 pt-4">
                                <Button 
                                    onClick={handleFinalConfirm}
                                    className="w-full py-4 bg-insan-orange hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                                >
                                    OUI, ENREGISTRER
                                </Button>
                                <Button 
                                    onClick={() => setShowConfirm(false)}
                                    variant="secondary"
                                    className="w-full py-4"
                                >
                                    ANNULER
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </Card>
    );
};