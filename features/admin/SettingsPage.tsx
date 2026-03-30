import React, { useState } from 'react';
import { InstituteSettings, Room } from '../../types';
import { Card, Button } from '../../components/ui/DesignSystem';
import { Settings, DoorOpen, Plus, X, Save, Users, Edit2, Check, Languages, Coins } from 'lucide-react';

export const SettingsPage: React.FC<{ settings?: InstituteSettings, onUpdateSettings?: (s: InstituteSettings) => void }> = ({ settings, onUpdateSettings }) => {
    const [editSettings, setEditSettings] = useState<InstituteSettings>(settings || { name: '', address: '', lat: 0, lng: 0, radius: 100, rooms: [], language: 'fr', currency: '€' });
    
    // States for adding a new room
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomCapacity, setNewRoomCapacity] = useState(25);

    // States for editing an existing room
    const [editingRoomName, setEditingRoomName] = useState<string | null>(null);
    const [tempRoom, setTempRoom] = useState<Room | null>(null);

    const handleSave = () => { 
        if (onUpdateSettings) { 
            onUpdateSettings(editSettings); 
            alert("Paramètres de l'établissement enregistrés !"); 
        } 
    };
    
    const handleAddRoom = () => { 
        if (newRoomName.trim()) { 
            const newRoom: Room = { name: newRoomName.trim(), capacity: newRoomCapacity };
            setEditSettings({ ...editSettings, rooms: [...(editSettings.rooms || []), newRoom] }); 
            setNewRoomName(''); 
            setNewRoomCapacity(25);
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
                {/* IDENTITÉ & LOCALISATION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Nom de l'Institut</label>
                        <input type="text" value={editSettings.name} onChange={e => setEditSettings({...editSettings, name: e.target.value})} className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-bold outline-none bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-insan-blue/20 transition-all shadow-inner" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Adresse Postale</label>
                        <input type="text" value={editSettings.address} onChange={e => setEditSettings({...editSettings, address: e.target.value})} className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-bold outline-none bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-insan-blue/20 transition-all shadow-inner" />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Latitude (GPS)</label>
                        <input type="number" step="any" value={editSettings.lat} onChange={e => setEditSettings({...editSettings, lat: parseFloat(e.target.value)})} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-4 font-mono outline-none bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Longitude (GPS)</label>
                        <input type="number" step="any" value={editSettings.lng} onChange={e => setEditSettings({...editSettings, lng: parseFloat(e.target.value)})} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-4 font-mono outline-none bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-all" />
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
                                value={editSettings.language} 
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
                                    value={editSettings.currency} 
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
                                <input type="text" placeholder="Ex: Salle de Conférence" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-3.5 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-insan-blue/20 font-bold" />
                            </div>
                            <div className="w-full md:w-40 flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 group focus-within:ring-2 focus-within:ring-insan-blue/20">
                                <Users size={16} className="text-slate-400 mr-2"/>
                                <input type="number" value={newRoomCapacity} onChange={e => setNewRoomCapacity(parseInt(e.target.value))} className="w-full py-3.5 bg-transparent dark:text-white outline-none font-bold" title="Capacité physique de la salle" />
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

                {/* BOUTON SAUVEGARDE GLOBALE */}
                <div className="pt-10">
                    <button onClick={handleSave} className="w-full bg-insan-orange text-white py-6 rounded-[2rem] font-black text-lg hover:bg-orange-600 flex items-center justify-center gap-4 transition-all shadow-xl shadow-orange-500/20 active:scale-95 group">
                        <Save size={24} className="group-hover:rotate-12 transition-transform"/> ENREGISTRER TOUS LES PARAMÈTRES
                    </button>
                </div>
            </div>
        </Card>
    );
};