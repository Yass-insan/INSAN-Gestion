
import React, { useState, useMemo } from 'react';
import { Card, Button, Badge } from '../../components/ui/DesignSystem';
import { 
  FileText, Search, Filter, Download, 
  CheckCircle2, XCircle, Clock, AlertTriangle,
  ChevronRight, User, MoreHorizontal, Eye,
  Check, X, FileCheck, Send, Plus
} from 'lucide-react';
import { User as UserType, UserRole, EmployeeDoc, DocCategory, DocStatus } from '../../types';

interface DocumentManagementProps {
  users: UserType[];
  documents: EmployeeDoc[];
  categories: DocCategory[];
  onUpdateDocStatus: (docId: string, status: DocStatus, comments?: string) => void;
  onRequestDocs: (userIds: string[], categoryIds: string[], message?: string, file?: File) => void;
  onNavigateBack: () => void;
}

export const DocumentManagement: React.FC<DocumentManagementProps> = ({
  users,
  documents,
  categories,
  onUpdateDocStatus,
  onRequestDocs,
  onNavigateBack
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'docs' | 'followup'>('docs');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestUserIds, setRequestUserIds] = useState<string[]>([]);
  const [requestCatIds, setRequestCatIds] = useState<string[]>([]);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestFile, setRequestFile] = useState<File | null>(null);

  const staffUsers = users.filter(u => 
    [UserRole.PROFESSOR, UserRole.EMPLOYEE, UserRole.RESPONSIBLE, UserRole.ADMIN].includes(u.role)
  );

  const handleRequestDocs = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestUserIds.length === 0 || requestCatIds.length === 0) return;
    onRequestDocs(requestUserIds, requestCatIds, requestMessage, requestFile || undefined);
    setIsRequestModalOpen(false);
    setRequestUserIds([]);
    setRequestCatIds([]);
    setRequestMessage('');
    setRequestFile(null);
  };

  const stats = useMemo(() => {
    const total = documents.length;
    const pending = documents.filter(d => d.status === DocStatus.PENDING).length;
    const validated = documents.filter(d => d.status === DocStatus.VALIDATED).length;
    const expired = documents.filter(d => d.status === DocStatus.EXPIRED).length;
    
    // Compliance by employee
    const compliance = staffUsers.map(user => {
      const userDocs = documents.filter(d => d.employeeId === user.id);
      const mandatoryCats = categories.filter(c => c.isMandatory);
      const userMandatoryDocs = userDocs.filter(d => 
        mandatoryCats.some(c => c.id === d.categoryId) && d.status === DocStatus.VALIDATED
      );
      
      return {
        userId: user.id,
        percent: mandatoryCats.length > 0 ? (userMandatoryDocs.length / mandatoryCats.length) * 100 : 100,
        missingCount: mandatoryCats.length - userMandatoryDocs.length
      };
    });

    return { total, pending, validated, expired, compliance };
  }, [documents, categories, staffUsers]);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const user = users.find(u => u.id === doc.employeeId);
      const category = categories.find(c => c.id === doc.categoryId);
      
      const matchesSearch = user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || doc.categoryId === categoryFilter;
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [documents, users, categories, searchTerm, categoryFilter, statusFilter]);

  const getStatusBadge = (status: DocStatus) => {
    switch (status) {
      case DocStatus.VALIDATED:
        return <Badge variant="success" icon={<CheckCircle2 size={12}/>}>Validé</Badge>;
      case DocStatus.PENDING:
        return <Badge variant="warning" icon={<Clock size={12}/>}>En attente</Badge>;
      case DocStatus.EXPIRED:
        return <Badge variant="error" icon={<AlertTriangle size={12}/>}>Expiré</Badge>;
      case DocStatus.REJECTED:
        return <Badge variant="error" icon={<XCircle size={12}/>}>Refusé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Gestion documentaire RH</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Contrats, diplômes et pièces justificatives du personnel</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsRequestModalOpen(true)} 
          icon={<Send size={18} />}
          className="bg-insan-blue shadow-lg shadow-blue-500/20"
        >
          Demander un document
        </Button>
      </div>

      {/* STATS BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-insan-blue/10 text-insan-blue rounded-2xl">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{stats.total}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Documents total</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{stats.pending}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">À valider</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{stats.validated}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Validés</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{stats.expired}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expirés</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4 border-b-2 border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('docs')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'docs' ? 'text-insan-blue' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Documents Reçus
          {activeTab === 'docs' && <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-insan-blue rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('followup')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'followup' ? 'text-insan-blue' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Suivi Personnel & Demandes
          {activeTab === 'followup' && <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-insan-blue rounded-t-full"></div>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LISTE DOCS / SUIVI */}
        <Card className="lg:col-span-2 p-0 border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          {activeTab === 'docs' ? (
            <>
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Rechercher un employé ou un document..." 
                      className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-insan-blue transition-all font-bold text-slate-700 dark:text-slate-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <select 
                      className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 font-bold text-sm text-slate-600 dark:text-slate-300"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="all">Toutes catégories</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <select 
                      className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 font-bold text-sm text-slate-600 dark:text-slate-300"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value={DocStatus.PENDING}>En attente</option>
                      <option value={DocStatus.VALIDATED}>Validés</option>
                      <option value={DocStatus.EXPIRED}>Expirés</option>
                      <option value={DocStatus.REJECTED}>Refusés</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="px-6 py-5 text-left text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest whitespace-nowrap">Employé</th>
                      <th className="px-6 py-5 text-left text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest whitespace-nowrap">Document</th>
                      <th className="px-6 py-5 text-left text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest whitespace-nowrap">Statut</th>
                      <th className="px-6 py-5 text-left text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest whitespace-nowrap">Expiration</th>
                      <th className="px-6 py-5 text-right text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredDocs.length > 0 ? filteredDocs.map(doc => {
                      const user = users.find(u => u.id === doc.employeeId);
                      const category = categories.find(c => c.id === doc.categoryId);
                      
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden shrink-0 border-2 border-slate-200 dark:border-slate-700">
                                {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <User size={20} />}
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">{user?.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-[200px]">
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate" title={doc.name}>{doc.name}</p>
                              <p className="text-[10px] font-bold text-insan-blue uppercase tracking-widest">{category?.name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(doc.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className={`text-xs font-bold ${doc.expiryDate ? 'text-slate-600 dark:text-slate-400' : 'text-slate-300'}`}>
                              {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : '—'}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-insan-blue rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:scale-110"
                                onClick={() => setPreviewDocUrl(doc.fileUrl)}
                                title="Voir le document"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-md transition-all hover:scale-110 hover:bg-emerald-600 active:scale-95"
                                onClick={() => onUpdateDocStatus(doc.id, DocStatus.VALIDATED)}
                                title="Valider"
                              >
                                <Check size={16} />
                              </button>
                              <button 
                                className="p-2.5 bg-rose-500 text-white rounded-xl shadow-md transition-all hover:scale-110 hover:bg-rose-600 active:scale-95"
                                onClick={() => onUpdateDocStatus(doc.id, DocStatus.REJECTED)}
                                title="Refuser"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
                            <FileText size={40} />
                          </div>
                          <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Aucun document trouvé</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-0">
               <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <p className="text-sm font-bold text-slate-500">Suivi complet de la conformité par employé</p>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full border-collapse">
                   <thead>
                    <tr className="border-b-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="px-6 py-5 text-left text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Employé</th>
                      <th className="px-6 py-5 text-left text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Conformité</th>
                      <th className="px-6 py-5 text-left text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">État</th>
                      <th className="px-6 py-5 text-right text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Actions</th>
                    </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats.compliance.map(userStats => {
                      const user = users.find(u => u.id === userStats.userId);
                      return (
                        <tr key={userStats.userId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group">
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                                {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User size={24} />}
                              </div>
                              <div>
                                <p className="text-base font-black text-slate-800 dark:text-white leading-tight">{user?.name}</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user?.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 w-1/3">
                            <div className="space-y-2">
                              <div className="flex justify-between items-end">
                                <span className={`text-xs font-black uppercase tracking-wider ${userStats.percent === 100 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                  {Math.round(userStats.percent)}%
                                </span>
                              </div>
                              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                                <div 
                                  className={`h-full transition-all duration-1000 ${userStats.percent === 100 ? 'bg-emerald-500' : userStats.percent > 50 ? 'bg-orange-500' : 'bg-red-500'}`}
                                  style={{ width: `${userStats.percent}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            {userStats.missingCount > 0 ? (
                              <Badge variant="error" icon={<AlertTriangle size={12}/>}>{userStats.missingCount} manquant(s)</Badge>
                            ) : (
                              <Badge variant="success" icon={<CheckCircle2 size={12}/>}>Complet</Badge>
                            )}
                          </td>
                          <td className="px-6 py-6 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant={userStats.missingCount > 0 ? 'primary' : 'outline'}
                                icon={<Send size={14} />}
                                onClick={() => {
                                  const mandatoryCats = categories.filter(c => c.isMandatory);
                                  const userDocs = documents.filter(d => d.employeeId === userStats.userId);
                                  const missingCatIds = mandatoryCats
                                    .filter(c => !userDocs.some(d => d.categoryId === c.id && d.status === DocStatus.VALIDATED))
                                    .map(c => c.id);
                                  
                                  setRequestUserIds([userStats.userId]);
                                  setRequestCatIds(missingCatIds);
                                  setRequestMessage('');
                                  setRequestFile(null);
                                  setIsRequestModalOpen(true);
                                }}
                                className="text-[10px] font-black uppercase tracking-widest"
                              >
                                {userStats.missingCount > 0 ? 'Demander documents' : 'Nouvelle demande'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                   </tbody>
                 </table>
               </div>
            </div>
          )}
        </Card>

        {/* COMPLIANCE / RÉCAP STAFF */}
        <div className="space-y-6">
          <Card className="p-8 border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem]">
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Conformité Dossiers</h3>
            <div className="space-y-6">
              {stats.compliance.sort((a, b) => a.percent - b.percent).map(userStats => {
                const user = users.find(u => u.id === userStats.userId);
                return (
                  <div key={userStats.userId} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <img src={user?.avatar} className="w-full h-full object-cover" />
                         </div>
                         <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{user?.name}</p>
                      </div>
                      {userStats.missingCount > 0 ? (
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">{userStats.missingCount} manquant(s)</p>
                          <button 
                            onClick={() => {
                              const mandatoryCats = categories.filter(c => c.isMandatory);
                              const userDocs = documents.filter(d => d.employeeId === userStats.userId);
                              const missingCatIds = mandatoryCats
                                .filter(c => !userDocs.some(d => d.categoryId === c.id && d.status === DocStatus.VALIDATED))
                                .map(c => c.id);
                              
                              setRequestUserIds([userStats.userId]);
                              setRequestCatIds(missingCatIds);
                              setRequestMessage('');
                              setRequestFile(null);
                              setIsRequestModalOpen(true);
                            }}
                            className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-[9px] font-black text-insan-blue border border-insan-blue/20 rounded-md hover:bg-insan-blue hover:text-white transition-all uppercase tracking-tighter"
                          >
                            Relancer
                          </button>
                        </div>
                      ) : (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      )}
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${userStats.percent === 100 ? 'bg-emerald-500' : userStats.percent > 50 ? 'bg-orange-500' : 'bg-red-500'}`}
                        style={{ width: `${userStats.percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-8 bg-insan-blue text-white rounded-[2.5rem] shadow-xl shadow-blue-500/20">
             <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <FileCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black leading-tight text-white">Gestion SIRH Pro</h3>
                  <p className="text-white/70 text-sm font-medium">Automatisez le suivi des contrats</p>
                </div>
             </div>
             <p className="text-white/80 text-sm leading-relaxed mb-8">
               Configurez des alertes automatiques pour prévenir les employés 30 jours avant l'expiration de leur pièce d'identité ou de leur contrat.
             </p>
             <button className="w-full py-4 bg-white text-insan-blue rounded-2xl font-black hover:bg-slate-100 transition-all uppercase tracking-widest text-xs">
               Configurer Alertes
             </button>
          </Card>
        </div>
      </div>

      {/* MODAL DEMANDE DE DOCUMENT */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsRequestModalOpen(false)}>
          <Card className="w-full max-w-xl p-0 overflow-hidden border-0 shadow-2xl rounded-[2.5rem] bg-white dark:bg-slate-900" onClick={e => e.stopPropagation()}>
            <div className="p-8 bg-insan-blue text-white">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Send size={24} />
                </div>
                <button onClick={() => setIsRequestModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>
              <h3 className="text-2xl font-black">Demander des documents</h3>
              <p className="text-blue-100 font-medium">Envoyez une demande officielle ou un document à remplir</p>
            </div>

            <form onSubmit={handleRequestDocs} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <label className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest leading-none block">Choisir les employés</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 custom-scrollbar">
                  {staffUsers.map(u => (
                    <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl cursor-pointer transition-all">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-2 border-slate-200 text-insan-blue focus:ring-insan-blue"
                        checked={requestUserIds.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked) setRequestUserIds(prev => [...prev, u.id]);
                          else setRequestUserIds(prev => prev.filter(id => id !== u.id));
                        }}
                      />
                      <div className="flex items-center gap-2">
                         <img src={u.avatar} className="w-6 h-6 rounded-full" />
                         <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{u.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest leading-none block">Message (Optionnel)</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-insan-blue transition-all min-h-[100px]"
                  placeholder="Instructions pour les employés... (ex: Merci de signer ce contrat)"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest leading-none block">Document à remplir / signer (PDF)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={(e) => setRequestFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`p-6 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all ${requestFile ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'}`}>
                     <div className={`p-3 rounded-2xl ${requestFile ? 'bg-emerald-100 text-emerald-500' : 'bg-white dark:bg-slate-900 text-slate-400'}`}>
                        <FileText size={20} />
                     </div>
                     <p className={`text-xs font-bold ${requestFile ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500'}`}>
                        {requestFile ? requestFile.name : 'Cliquez ou déposez un PDF'}
                     </p>
                     {requestFile && <Badge variant="success">Fichier attaché</Badge>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest leading-none block">Type de document attendu</label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setRequestCatIds(prev => prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id])}
                      className={`p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between ${
                        requestCatIds.includes(cat.id) 
                        ? 'border-insan-blue bg-blue-50 dark:bg-blue-900/20 text-insan-blue' 
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <span className="font-bold text-sm">{cat.name}</span>
                      {requestCatIds.includes(cat.id) && <CheckCircle2 size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-xs hover:text-slate-600 transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={requestUserIds.length === 0 || requestCatIds.length === 0}
                  className="flex-[2] py-4 bg-insan-blue text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <Send size={18} />
                  Envoyer la demande
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
      {/* MODALE DE PREVIEW DU DOCUMENT */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4 animate-fade-in" onClick={() => setPreviewDocUrl(null)}>
          <Card className="w-full max-w-5xl h-[85vh] bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Prévisualisation du Document</h3>
              <button onClick={() => setPreviewDocUrl(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors bg-white dark:bg-slate-800 rounded-full shadow-sm"><X size={24}/></button>
            </div>
            <div className="flex-1 h-full overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
              {previewDocUrl.startsWith('data:image') || previewDocUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
                <img src={previewDocUrl} className="max-w-full max-h-full object-contain shadow-2xl" alt="Document preview" referrerPolicy="no-referrer" />
              ) : (
                <iframe src={previewDocUrl} className="w-full h-full border-none" title="PDF Preview" />
              )}
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-center bg-slate-50/50 dark:bg-slate-800/50">
               <Button onClick={() => setPreviewDocUrl(null)} className="px-12 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20">Fermer</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
