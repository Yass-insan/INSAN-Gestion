
import React, { useState, useMemo } from 'react';
import { Card, Button, Badge } from '../../components/ui/DesignSystem';
import { 
  Key, Search, Filter, Clock, 
  CheckCircle2, XCircle, ChevronRight, 
  User, Send, Plus, Trash2, Edit2, 
  Check, X, FileText, Bookmark, AlertCircle
} from 'lucide-react';
import { User as UserType, UserRole, KeyLog, Room } from '../../types';

interface KeyManagementProps {
  users: UserType[];
  rooms: Room[];
  keyLogs: KeyLog[];
  onAddKeyLog: (log: KeyLog) => void;
  onUpdateKeyLog: (log: KeyLog) => void;
  onDeleteKeyLog: (logId: string) => void;
  onNavigateBack: () => void;
}

export const KeyManagement: React.FC<KeyManagementProps> = ({
  users,
  rooms,
  keyLogs,
  onAddKeyLog,
  onUpdateKeyLog,
  onDeleteKeyLog,
  onNavigateBack
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [note, setNote] = useState('');

  // Only show staff (Profs, Employees, etc)
  const staffUsers = users.filter(u => 
    [UserRole.PROFESSOR, UserRole.EMPLOYEE, UserRole.RESPONSIBLE, UserRole.ADMIN].includes(u.role)
  );

  const filteredLogs = useMemo(() => {
    return [...keyLogs].sort((a, b) => new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime())
      .filter(log => {
        const user = users.find(u => u.id === log.userId);
        const matchesSearch = user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             log.roomName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRoom = roomFilter === 'all' || log.roomName === roomFilter;
        const matchesStatus = statusFilter === 'all' || 
                             (statusFilter === 'returned' ? log.isReturned : !log.isReturned);
        
        return matchesSearch && matchesRoom && matchesStatus;
      });
  }, [keyLogs, users, searchTerm, roomFilter, statusFilter]);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || selectedRooms.length === 0) return;

    selectedRooms.forEach(room => {
      const newLog: KeyLog = {
        id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        userId: selectedUserId,
        roomName: room,
        borrowedAt: new Date().toISOString(),
        isReturned: false,
        notes: note
      };
      onAddKeyLog(newLog);
    });

    setIsModalOpen(false);
    setSelectedUserId('');
    setSelectedRooms([]);
    setNote('');
  };

  const toggleRoomSelection = (roomName: string) => {
    setSelectedRooms(prev => 
      prev.includes(roomName) 
        ? prev.filter(r => r !== roomName) 
        : [...prev, roomName]
    );
  };

  const toggleReturn = (log: KeyLog) => {
    const updatedLog: KeyLog = {
      ...log,
      isReturned: !log.isReturned,
      returnedAt: !log.isReturned ? new Date().toISOString() : undefined
    };
    onUpdateKeyLog(updatedLog);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'Admin';
      case UserRole.PROFESSOR: return 'Professeur';
      case UserRole.EMPLOYEE: return 'Employé';
      case UserRole.RESPONSIBLE: return 'Responsable';
      default: return role;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onNavigateBack}
            className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-400 hover:text-insan-blue shadow-sm"
          >
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <div>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Registre des Clés</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Suivi des emprunts et retours des clés de l'institut</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          icon={<Plus size={18} />}
          className="bg-insan-blue shadow-lg shadow-blue-500/20"
        >
          Nouvel Emprunt
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={`p-6 bg-white dark:bg-slate-900 border-2 rounded-[2.5rem] cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${statusFilter === 'pending' ? 'border-insan-blue shadow-lg shadow-blue-500/10' : 'border-slate-100 dark:border-slate-800'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${statusFilter === 'pending' ? 'bg-insan-blue text-white' : 'bg-insan-blue/10 text-insan-blue'}`}>
              <Key size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{keyLogs.filter(l => !l.isReturned).length}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">En circulation</p>
            </div>
          </div>
        </Card>
        <Card 
          onClick={() => setStatusFilter(statusFilter === 'returned' ? 'all' : 'returned')}
          className={`p-6 bg-white dark:bg-slate-900 border-2 rounded-[2.5rem] cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${statusFilter === 'returned' ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-slate-100 dark:border-slate-800'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${statusFilter === 'returned' ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{keyLogs.filter(l => l.isReturned).length}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rendus aujourd'hui</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-0 border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher un employé ou une salle..." 
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-insan-blue transition-all font-bold text-slate-700 dark:text-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 font-bold text-sm text-slate-600 dark:text-slate-300"
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
              >
                <option value="all">Toutes les salles</option>
                {rooms.map(r => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
              <select 
                className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 font-bold text-sm text-slate-600 dark:text-slate-300"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous les états</option>
                <option value="pending">En attente</option>
                <option value="returned">Rendu</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-5 text-left text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Employé</th>
                <th className="px-6 py-5 text-left text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest whitespace-nowrap">Rôle</th>
                <th className="px-6 py-5 text-left text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest whitespace-nowrap">Clé / Salle</th>
                <th className="px-6 py-5 text-left text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest whitespace-nowrap">Emprunté le</th>
                <th className="px-6 py-5 text-center text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest whitespace-nowrap">Rendu</th>
                <th className="px-6 py-5 text-left text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Notes</th>
                <th className="px-6 py-5 text-right text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length > 0 ? filteredLogs.map(log => {
                const user = users.find(u => u.id === log.userId);
                return (
                  <tr 
                    key={log.id} 
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group ${
                      log.isReturned 
                        ? 'opacity-60' 
                        : 'bg-red-50/40 dark:bg-red-900/10 border-l-4 border-l-red-500 shadow-[inset_4px_0_0_0_#ef4444]'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {!log.isReturned && (
                          <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </div>
                        )}
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden shrink-0 border-2 border-slate-200 dark:border-slate-700">
                          {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">{user?.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">{log.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary" className="text-[10px] uppercase font-black tracking-widest">
                        {user ? getRoleLabel(user.role) : ''}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${log.isReturned ? 'bg-slate-100 text-slate-400' : 'bg-red-500/10 text-red-500 animate-pulse'}`}>
                          <Key size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700 dark:text-slate-200">{log.roomName}</span>
                          {!log.isReturned && (
                            <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter animate-pulse flex items-center gap-1">
                              <AlertCircle size={8} /> En circulation
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {new Date(log.borrowedAt).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {new Date(log.borrowedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => toggleReturn(log)}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all mx-auto border-2 ${
                          log.isReturned 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 hover:border-insan-blue hover:text-insan-blue'
                        }`}
                      >
                        <Check size={20} className={log.isReturned ? 'scale-110' : 'scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all'} />
                      </button>
                      {log.returnedAt && (
                        <p className="text-[9px] font-black text-emerald-500 mt-1 uppercase tracking-tighter">
                          Le {new Date(log.returnedAt).toLocaleDateString('fr-FR')} à {new Date(log.returnedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.notes ? (
                        <div className="flex items-start gap-2 max-w-[200px]">
                          <Bookmark size={12} className="text-slate-400 shrink-0 mt-1" />
                          <p className="text-xs font-bold text-slate-500 italic line-clamp-2" title={log.notes}>
                            {log.notes}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all"
                          onClick={() => onDeleteKeyLog(log.id)}
                          title="Supprimer l'entrée"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
                      <Key size={40} />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Aucun emprunt enregistré</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL NOUVEL EMPRUNT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
          <Card className="w-full max-w-xl p-0 overflow-hidden border-0 shadow-2xl rounded-[2.5rem] bg-white dark:bg-slate-900" onClick={e => e.stopPropagation()}>
            <div className="p-8 bg-insan-blue text-white">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Key size={24} />
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>
              <h3 className="text-2xl font-black">Sortie de Clé</h3>
              <p className="text-blue-100 font-medium">Enregistrez un nouvel emprunt de clé au secrétariat</p>
            </div>

            <form onSubmit={handleAddLog} className="p-8 space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest block">Employé / Bénévole</label>
                <div className="grid grid-cols-1 gap-4">
                  <select 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-insan-blue transition-all"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    required
                  >
                    <option value="">Sélectionnez une personne...</option>
                    {staffUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({getRoleLabel(u.role)})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest block">Salles concernées ({selectedRooms.length})</label>
                  {selectedRooms.length > 0 && (
                    <button type="button" onClick={() => setSelectedRooms([])} className="text-[10px] font-black text-red-500 uppercase tracking-widest">Réinitialiser</button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {rooms.map(room => (
                    <button
                      key={room.name}
                      type="button"
                      onClick={() => toggleRoomSelection(room.name)}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group relative ${
                        selectedRooms.includes(room.name) 
                        ? 'border-insan-blue bg-blue-50 dark:bg-blue-900/20 text-insan-blue' 
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      <Bookmark size={18} className={selectedRooms.includes(room.name) ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                      <span className="font-bold text-xs text-center">{room.name}</span>
                      {selectedRooms.includes(room.name) && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-insan-blue text-white rounded-full flex items-center justify-center">
                          <Check size={10} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest block">Observations / Notes</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-insan-blue transition-all min-h-[80px]"
                  placeholder="Note facultative (ex: Double de clé, clé casier...)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-4">
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="flex-1" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedRooms([]);
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-insan-blue shadow-lg shadow-blue-500/20"
                  disabled={!selectedUserId || selectedRooms.length === 0}
                >
                  Valider {selectedRooms.length > 1 ? `les ${selectedRooms.length} Emprunts` : "l'Emprunt"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
