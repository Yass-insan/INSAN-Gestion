import React, { useState } from 'react';
import { InstituteSettings } from '../../types';
import { Card } from '../../components/ui/DesignSystem';
import { Settings, DoorOpen, Plus, X, Save } from 'lucide-react';

export const SettingsPage: React.FC<{ settings?: InstituteSettings, onUpdateSettings?: (s: InstituteSettings) => void }> = ({ settings, onUpdateSettings }) => {
    const [editSettings, setEditSettings] = useState<InstituteSettings>(settings || { name: '', address: '', lat: 0, lng: 0, radius: 100, rooms: [] });
    const [newRoom, setNewRoom] = useState('');
    const handleSave = () => { if (onUpdateSettings) { onUpdateSettings(editSettings); alert("Paramètres enregistrés !"); } };
    const handleAddRoom = () => { if (newRoom) { setEditSettings({ ...editSettings, rooms: [...(editSettings.rooms || []), newRoom] }); setNewRoom(''); } };
    const handleDeleteRoom = (room: string) => { setEditSettings({ ...editSettings, rooms: editSettings.rooms?.filter(r => r !== room) }); };

    return (
        <Card className="p-10 max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-insan-blue dark:text-blue-400 rounded-2xl"><Settings size={32} /></div>
                <div><h2 className="text-2xl font-bold text-slate-800 dark:text-white">Paramètres de l'Institut</h2><p className="text-slate-500 dark:text-slate-400">Configuration générale, salles et géolocalisation.</p></div>
            </div>
            <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2"><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nom de l'établissement</label><input type="text" value={editSettings.name} onChange={e => setEditSettings({...editSettings, name: e.target.value})} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-insan-blue/20 outline-none bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-colors" /></div>
                    <div className="col-span-2"><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Adresse</label><input type="text" value={editSettings.address} onChange={e => setEditSettings({...editSettings, address: e.target.value})} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-insan-blue/20 outline-none bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-colors" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Latitude</label><input type="number" step="any" value={editSettings.lat} onChange={e => setEditSettings({...editSettings, lat: parseFloat(e.target.value)})} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-insan-blue/20 outline-none bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-colors" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Longitude</label><input type="number" step="any" value={editSettings.lng} onChange={e => setEditSettings({...editSettings, lng: parseFloat(e.target.value)})} className="w-full border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-insan-blue/20 outline-none bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-colors" /></div>
                </div>
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><DoorOpen size={20}/> Gestion des Salles</h3>
                    <div className="flex gap-4 mb-4"><input type="text" placeholder="Nom de la salle (ex: Salle B)" value={newRoom} onChange={e => setNewRoom(e.target.value)} className="flex-1 border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 border focus:ring-2 focus:ring-insan-blue/20 outline-none" /><button onClick={handleAddRoom} className="bg-insan-blue text-white px-6 rounded-xl font-bold hover:bg-blue-900 transition-colors flex items-center gap-2"><Plus size={18}/> Ajouter</button></div>
                    <div className="flex flex-wrap gap-3">{editSettings.rooms?.map(room => (<div key={room} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">{room}<button onClick={() => handleDeleteRoom(room)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={14}/></button></div>))}{(!editSettings.rooms || editSettings.rooms.length === 0) && <p className="text-slate-400 italic text-sm">Aucune salle configurée.</p>}</div>
                </div>
                <div className="pt-8"><button onClick={handleSave} className="w-full bg-insan-orange text-white py-4 rounded-xl font-bold hover:bg-orange-600 flex items-center justify-center gap-3 transition-all shadow-lg shadow-orange-500/20"><Save size={20} /> Enregistrer les modifications</button></div>
            </div>
        </Card>
    );
};