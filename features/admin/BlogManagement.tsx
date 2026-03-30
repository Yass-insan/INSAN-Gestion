
import React, { useState, useRef } from 'react';
import { NewsItem } from '../../types';
import { Card, Button, Badge, PageHeader } from '../../components/ui/DesignSystem';
import { 
    Plus, 
    X, 
    Edit2, 
    Trash2, 
    Image as ImageIcon, 
    Calendar, 
    AlertCircle, 
    Save, 
    FileText,
    Upload,
    Type,
    ImageIcon as InsertImgIcon
} from 'lucide-react';

interface BlogManagementProps {
  news: NewsItem[];
  onManage: (action: 'add' | 'update' | 'delete', item: NewsItem) => void;
}

const BlogManagement: React.FC<BlogManagementProps> = ({ news, onManage }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);
    
    const [formData, setFormData] = useState<Partial<NewsItem>>({
        title: '',
        content: '',
        excerpt: '',
        category: 'Vie Scolaire',
        author: 'Direction',
        isUrgent: false,
        mediaUrl: ''
    });

    const categories = ['Vie Scolaire', 'Événement', 'Pédagogie', 'Information', 'Conférence'];

    const handleOpenModal = (item?: NewsItem) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({
                title: '',
                content: '',
                excerpt: '',
                category: 'Vie Scolaire',
                author: 'Direction',
                isUrgent: false,
                date: new Date().toLocaleDateString('fr-FR'),
                mediaUrl: ''
            });
        }
        setIsModalOpen(true);
    };

    // Conversion d'image en Base64
    const processFile = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64 = await processFile(file);
                setFormData({ ...formData, mediaUrl: base64 });
            } catch (err) {
                alert("Erreur lors de l'upload de l'image");
            }
        }
    };

    const handleInsertImageInContent = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && contentRef.current) {
            try {
                const base64 = await processFile(file);
                const textArea = contentRef.current;
                const startPos = textArea.selectionStart;
                const endPos = textArea.selectionEnd;
                const imgTag = `\n<img src="${base64}" alt="Image" style="max-width:100%; border-radius:1rem; margin:1rem 0;" />\n`;
                
                const newContent = 
                    formData.content!.substring(0, startPos) + 
                    imgTag + 
                    formData.content!.substring(endPos);
                
                setFormData({ ...formData, content: newContent });
            } catch (err) {
                alert("Erreur lors de l'insertion de l'image");
            }
        }
    };

    const handleSave = () => {
        if (!formData.title || !formData.content) {
            alert("Le titre et le contenu sont obligatoires.");
            return;
        }

        const payload: NewsItem = {
            id: editingItem?.id || Date.now().toString(),
            title: formData.title!,
            content: formData.content!,
            excerpt: formData.excerpt || (formData.content!.replace(/<[^>]*>/g, '').substring(0, 150) + '...'),
            category: formData.category || 'Information',
            author: formData.author || 'Direction',
            date: formData.date || new Date().toLocaleDateString('fr-FR'),
            isUrgent: formData.isUrgent || false,
            mediaUrl: formData.mediaUrl || '',
            mediaType: 'image'
        };

        onManage(editingItem ? 'update' : 'add', payload);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <PageHeader 
                title="Gestion du Blog" 
                subtitle="Publiez des articles et des annonces directement depuis votre espace."
                action={<Button onClick={() => handleOpenModal()} icon={<Plus size={18}/>}>Nouvel Article</Button>}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.map(item => (
                    <Card key={item.id} className="p-0 overflow-hidden flex flex-col group border-2 border-transparent hover:border-insan-blue/10 transition-all shadow-lg">
                        <div className="h-48 overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                            {item.mediaUrl ? (
                                <img src={item.mediaUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={48}/></div>
                            )}
                            <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                                <Badge color="gray" className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white border-0 shadow-sm">{item.category}</Badge>
                                {item.isUrgent && <Badge color="red" className="animate-pulse shadow-sm">URGENT</Badge>}
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3"><Calendar size={12}/> {item.date}</span>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2 leading-tight group-hover:text-insan-blue transition-colors truncate">{item.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium line-clamp-2 mb-6 flex-1">{item.excerpt}</p>
                            
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleOpenModal(item)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-insan-blue rounded-lg transition-colors"><Edit2 size={14}/></button>
                                    <button onClick={() => onManage('delete', item)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={14}/></button>
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase">Par {item.author}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-fade-in">
                    <Card className="w-full max-w-5xl bg-white dark:bg-slate-900 shadow-2xl rounded-[3rem] overflow-hidden flex flex-col max-h-[95vh]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-insan-blue text-white rounded-2xl shadow-lg"><FileText size={20}/></div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white">{editingItem ? 'Modifier l\'article' : 'Rédiger un nouvel article'}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Éditeur de contenu riche</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-red-500 transition-colors"><X size={20}/></button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {/* COLONNE GAUCHE : COUVERTURE & RÉGLAGES */}
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">Image de couverture</label>
                                        <div className="relative group/cover aspect-video rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-insan-blue/50 transition-all">
                                            {formData.mediaUrl ? (
                                                <>
                                                    <img src={formData.mediaUrl} className="w-full h-full object-cover" alt="" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Button size="sm" variant="secondary" onClick={() => setFormData({...formData, mediaUrl: ''})} icon={<Trash2 size={14}/>}>Retirer</Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={32} className="text-slate-300 mb-2"/>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Cliquez pour uploader</p>
                                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleCoverUpload} />
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Catégorie</label>
                                            <select className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-3 bg-slate-50 dark:bg-slate-800 font-black text-xs outline-none dark:text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Auteur affiché</label>
                                            <input className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-3 bg-slate-50 dark:bg-slate-800 font-bold text-xs outline-none dark:text-white" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                                        </div>
                                        <div className="pt-4">
                                            <div className="flex items-center gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition-all group" onClick={() => setFormData({...formData, isUrgent: !formData.isUrgent})}>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.isUrgent ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-300'}`}>
                                                    {formData.isUrgent && <AlertCircle size={12}/>}
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${formData.isUrgent ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>Urgente / Alerte</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* COLONNE DROITE : RÉDACTION */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Titre de l'article</label>
                                        <input className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-black text-lg outline-none dark:text-white focus:ring-2 focus:ring-insan-blue/20" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Saisissez un titre percutant..." />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Contenu de l'article</label>
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <button type="button" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-insan-blue hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                        <InsertImgIcon size={14}/> Insérer Image
                                                    </button>
                                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleInsertImageInContent} />
                                                </div>
                                            </div>
                                        </div>
                                        <textarea 
                                            ref={contentRef}
                                            className="w-full border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 bg-slate-50 dark:bg-slate-800 font-medium text-sm outline-none dark:text-white min-h-[400px] focus:ring-2 focus:ring-insan-blue/20 leading-relaxed custom-scrollbar" 
                                            value={formData.content} 
                                            onChange={e => setFormData({...formData, content: e.target.value})} 
                                            placeholder="Rédigez votre texte ici. Vous pouvez insérer des images où vous le souhaitez." 
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Extrait (Preview)</label>
                                        <textarea className="w-full border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-medium text-xs outline-none dark:text-white min-h-[80px]" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} placeholder="Résumé court pour la liste des actualités (laissé vide, il sera généré automatiquement)..." />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 shrink-0">
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                            <Button onClick={handleSave} icon={<Save size={18}/>}>Mettre en ligne</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default BlogManagement;
