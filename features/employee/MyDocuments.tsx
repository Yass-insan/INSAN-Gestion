
import React, { useState } from 'react';
import { Card, Badge, Button } from '../../components/ui/DesignSystem';
import { 
  FileText, Upload, Download, Trash2, 
  CheckCircle2, Clock, AlertTriangle, XCircle,
  Plus, Eye, Info, ShieldCheck
} from 'lucide-react';
import { User, EmployeeDoc, DocCategory, DocStatus } from '../../types';

interface MyDocumentsProps {
  user: User;
  documents: EmployeeDoc[];
  categories: DocCategory[];
  onUpload: (categoryId: string, file: File) => void;
  onResolveRequest: (docId: string, file: File) => void;
  onDelete: (docId: string) => void;
}

export const MyDocuments: React.FC<MyDocumentsProps> = ({
  user,
  documents,
  categories,
  onUpload,
  onResolveRequest,
  onDelete
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const pendingRequests = documents.filter(d => d.status === DocStatus.PENDING);
  const validatedDocs = documents.filter(d => d.status !== DocStatus.PENDING);

  const getStatusBadge = (status: DocStatus) => {
    switch (status) {
      case DocStatus.VALIDATED:
        return <Badge variant="success" icon={<CheckCircle2 size={12}/>}>Validé</Badge>;
      case DocStatus.PENDING:
        return <Badge variant="warning" icon={<Clock size={12}/>}>En attente</Badge>;
      case DocStatus.REJECTED:
        return <Badge variant="error" icon={<XCircle size={12}/>}>Refusé</Badge>;
      case DocStatus.EXPIRED:
        return <Badge variant="error" icon={<AlertTriangle size={12}/>}>Expiré</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Mon Dossier RH</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Gérez vos documents administratifs et contrats</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COMPLIANCE STATUS */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-8 border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem]">
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">État de conformité</h3>
            <div className="space-y-6">
              {categories.filter(c => c.isMandatory).map(cat => {
                const doc = documents.find(d => d.categoryId === cat.id);
                const isValid = doc?.status === DocStatus.VALIDATED;

                return (
                  <div key={cat.id} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isValid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {isValid ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{cat.name}</span>
                    </div>
                    {isValid ? (
                      <Badge variant="success">OK</Badge>
                    ) : (
                      <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Requis</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-8 bg-slate-900 text-white rounded-[2.5rem] relative overflow-hidden">
             <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-white">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-xl font-black mb-4">Protection des données</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Vos documents sont stockés de manière sécurisée et ne sont accessibles que par vous et l'administration de l'Institut.
                </p>
             </div>
             <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-insan-blue/20 rounded-full blur-3xl"></div>
          </Card>
        </div>

        {/* DOCUMENTS LIST & UPLOAD */}
        <div className="lg:col-span-2 space-y-6">
          {/* PENDING REQUESTS */}
          {pendingRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <AlertTriangle className="text-orange-500" size={24} />
                Actions requises ({pendingRequests.length})
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {pendingRequests.map(req => {
                  const category = categories.find(c => c.id === req.categoryId);
                  return (
                    <Card key={req.id} className="p-6 border-2 border-orange-100 dark:border-orange-500/20 bg-orange-50/30 dark:bg-orange-950/10 rounded-3xl">
                      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                             <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/20">
                                <FileText size={20} />
                             </div>
                             <div>
                                <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight">{req.name}</h4>
                                <Badge variant="warning">{category?.name}</Badge>
                             </div>
                          </div>
                          {req.message && (
                            <div className="flex gap-2 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-orange-100 dark:border-orange-500/20">
                               <Info size={16} className="text-insan-blue shrink-0 mt-1" />
                               <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{req.message}"</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col w-full md:w-auto gap-3">
                           {req.adminAttachmentUrl && (
                             <Button 
                               variant="outline" 
                               className="bg-white dark:bg-slate-800 border-insan-blue text-insan-blue font-black uppercase tracking-widest text-[10px]"
                               onClick={() => window.open(req.adminAttachmentUrl, '_blank')}
                               icon={<Download size={14} />}
                             >
                               Télécharger & Signer
                             </Button>
                           )}
                           <div className="relative">
                              <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) onResolveRequest(req.id, file);
                                }}
                              />
                              <Button 
                                className="w-full bg-insan-blue text-white font-black uppercase tracking-widest text-[10px]"
                                icon={<Upload size={14} />}
                              >
                                Envoyer le fichier signé
                              </Button>
                           </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* UPLOAD BOX */}
          <Card className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm text-insan-blue">
                    <Upload size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">Ajouter un document</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PDF, JPG ou PNG (Max 5Mo)</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <select 
                    className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-700 dark:text-slate-200"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Sélectionner une catégorie...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all bg-white dark:bg-slate-900 group">
                    <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    {selectedFile ? (
                      <div className="flex flex-col items-center">
                        <p className="text-sm font-black text-insan-blue">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-400">Modifier le fichier</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-slate-400 group-hover:text-insan-blue transition-colors">
                        <Plus size={24} />
                        <span className="text-xs font-black uppercase tracking-widest mt-2">Choisir un fichier</span>
                      </div>
                    )}
                  </label>
                </div>
                <button 
                  disabled={!selectedFile || !selectedCategory}
                  onClick={() => {
                    if (selectedFile && selectedCategory) {
                      onUpload(selectedCategory, selectedFile);
                      setSelectedFile(null);
                      setSelectedCategory('');
                    }
                  }}
                  className={`w-full py-4 rounded-2xl font-black transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
                    selectedFile && selectedCategory 
                    ? 'bg-insan-blue text-white shadow-xl shadow-blue-500/20 hover:bg-blue-600' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Upload size={18} />
                  ENVOYER LE DOCUMENT
                </button>
              </div>
              <div className="hidden md:block bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                <h4 className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4">
                  <Info size={14} className="text-insan-blue"/> Aide & Consignes
                </h4>
                <ul className="space-y-4">
                  <li className="flex gap-3 items-start">
                    <div className="w-4 h-4 rounded-full bg-insan-blue/10 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Scannez vos documents au format <span className="font-black">PDF</span> pour une meilleure lisibilité.</p>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="w-4 h-4 rounded-full bg-insan-blue/10 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Assurez-vous que les 4 coins de la pièce d'identité sont visibles.</p>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="w-4 h-4 rounded-full bg-insan-blue/10 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Les documents avec expiration doivent être mis à jour dès réception du nouveau.</p>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* MY DOCS TABLE */}
          <Card className="p-0 border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
             <div className="p-8 border-b border-slate-100 dark:border-slate-800">
               <h3 className="text-xl font-black text-slate-800 dark:text-white">Mes documents transmis</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full">
                 <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Document</th>
                      <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Transmis le</th>
                      <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                      <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {validatedDocs.length > 0 ? validatedDocs.map(doc => {
                      const category = categories.find(c => c.id === doc.categoryId);
                      const isPending = doc.status === DocStatus.PENDING;
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg">
                                <FileText size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">{doc.name}</p>
                                <p className="text-[10px] font-bold text-insan-blue uppercase tracking-widest">{category?.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                             <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                               {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '—'}
                             </p>
                          </td>
                          <td className="px-8 py-5">
                             {getStatusBadge(doc.status)}
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex justify-end gap-2">
                               {doc.fileUrl && (
                                 <button 
                                   onClick={() => window.open(doc.fileUrl, '_blank')}
                                   className="p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-insan-blue rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 transition-all"
                                 >
                                   <Eye size={16} />
                                 </button>
                               )}
                               {doc.status !== DocStatus.VALIDATED && !isPending && (
                                 <button 
                                   onClick={() => onDelete(doc.id)}
                                   className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                                 >
                                   <Trash2 size={16} />
                                 </button>
                               )}
                             </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                          Aucun document envoyé pour le moment
                        </td>
                      </tr>
                    )}
                 </tbody>
               </table>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
