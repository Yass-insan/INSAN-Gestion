
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../../components/ui/DesignSystem';
// Add missing ArrowRight import
import { Calendar, User, ArrowLeft, Clock, Share2, Bookmark, ArrowRight } from 'lucide-react';
import { NewsItem } from '../../types';

interface NewsPageProps {
    news: NewsItem[];
}

const NewsPage: React.FC<NewsPageProps> = ({ news }) => {
    const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

    // Scroll to top when opening an article
    useEffect(() => {
        if (selectedArticle) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [selectedArticle]);

    // Fonction pour transformer le contenu texte en HTML sécurisé supportant les balises img insérées
    const formatContent = (content: string) => {
        // Remplace les sauts de ligne par des <br/> pour conserver la structure
        const withLineBreaks = content.replace(/\n/g, '<br/>');
        return { __html: withLineBreaks };
    };

    if (selectedArticle) {
        return (
            <div className="animate-fade-in min-h-screen bg-white dark:bg-slate-950 pb-32">
                {/* HEADER DE L'ARTICLE EN PLEIN ÉCRAN */}
                <header className="relative h-[60vh] min-h-[400px] w-full overflow-hidden bg-slate-900">
                    {selectedArticle.mediaUrl ? (
                        <img 
                            src={selectedArticle.mediaUrl} 
                            className="w-full h-full object-cover opacity-60 scale-105" 
                            alt="" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-100 dark:bg-slate-900">
                            <Clock size={80} className="opacity-10" />
                        </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent to-black/20"></div>
                    
                    <div className="absolute top-8 left-6 md:left-12 flex gap-3">
                        <button 
                            onClick={() => setSelectedArticle(null)}
                            className="p-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-2xl transition-all border border-white/10 shadow-2xl flex items-center gap-2 group"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest">Retour aux actualités</span>
                        </button>
                    </div>

                    <div className="absolute bottom-12 left-6 md:left-12 right-6 md:right-12">
                        <div className="max-w-4xl mx-auto">
                            <Badge color="orange" className="mb-6 px-4 py-2 shadow-xl">{selectedArticle.category}</Badge>
                            <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.95] mb-6">
                                {selectedArticle.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-insan-blue text-white flex items-center justify-center font-black text-[10px]">
                                        {selectedArticle.author.charAt(0)}
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">{selectedArticle.author}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                    <Calendar size={14} className="text-insan-orange"/> {selectedArticle.date}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                    <Clock size={14} className="text-insan-blue"/> 5 min de lecture
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* CORPS DE L'ARTICLE */}
                <article className="max-w-4xl mx-auto px-6 mt-16">
                    <div className="flex flex-col md:flex-row gap-16">
                        <div className="flex-1">
                            {/* RENDU DU CONTENU RICHE */}
                            <div 
                                className="rich-content text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-[1.8] font-medium"
                                dangerouslySetInnerHTML={formatContent(selectedArticle.content)}
                            />

                            <div className="mt-20 pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-insan-blue dark:text-blue-400 text-xl shadow-inner">
                                        {selectedArticle.author.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rédigé par</p>
                                        <p className="text-lg font-black text-slate-800 dark:text-white">{selectedArticle.author}</p>
                                        <p className="text-xs text-slate-500 font-bold uppercase">Institut Insan • Lyon Gerland</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-insan-blue transition-all border border-slate-100 dark:border-slate-700"><Share2 size={20}/></button>
                                    <button className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-insan-orange transition-all border border-slate-100 dark:border-slate-700"><Bookmark size={20}/></button>
                                </div>
                            </div>
                            
                            <div className="mt-12 flex justify-center">
                                <button 
                                    onClick={() => setSelectedArticle(null)}
                                    className="px-12 py-5 bg-insan-blue text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-900 transition-all flex items-center gap-3 active:scale-95"
                                >
                                    <ArrowLeft size={18}/> Retour à la liste
                                </button>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Styles pour le contenu riche injecté */}
                <style>{`
                    .rich-content img {
                        display: block;
                        max-width: 100%;
                        height: auto;
                        margin: 4rem auto;
                        border-radius: 3rem;
                        box-shadow: 0 40px 100px -20px rgba(0,0,0,0.15);
                    }
                    .rich-content br {
                        display: block;
                        margin: 1.5rem 0;
                        content: " ";
                    }
                    .rich-content p {
                        margin-bottom: 2rem;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-32 pt-16 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <Badge color="blue" className="mb-6 px-4 py-2">ACTUALITÉS</Badge>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-8">
                        La vie de <br/> <span className="text-insan-orange">l'Institut.</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium text-lg">Suivez les événements et les annonces importantes de notre communauté.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        {news.map(article => (
                            <Card key={article.id} className="p-0 overflow-hidden border-0 shadow-xl bg-white dark:bg-slate-900 group cursor-pointer rounded-[2.5rem]" onClick={() => setSelectedArticle(article)}>
                                <div className="flex flex-col md:flex-row">
                                    <div className="md:w-2/5 relative h-64 md:h-auto overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                                        {article.mediaUrl ? (
                                            <img src={article.mediaUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Clock size={48}/></div>
                                        )}
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <Badge color="gray" className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white border-0 shadow-sm">{article.category}</Badge>
                                            {article.isUrgent && <Badge color="red" className="shadow-sm">URGENT</Badge>}
                                        </div>
                                    </div>
                                    <div className="p-10 flex-1 flex flex-col">
                                        <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                            <span className="flex items-center gap-1.5"><Calendar size={12}/> {article.date}</span>
                                            <span className="flex items-center gap-1.5"><User size={12}/> Par {article.author}</span>
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-4 group-hover:text-insan-blue transition-colors leading-tight">
                                            {article.title}
                                        </h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-3 mb-8 leading-relaxed">
                                            {article.excerpt}
                                        </p>
                                        <button className="mt-auto flex items-center gap-2 text-xs font-black uppercase tracking-widest text-insan-blue hover:text-insan-orange transition-all group/btn">
                                            Lire l'article <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}

                        {news.length === 0 && (
                            <div className="py-32 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
                                <p className="text-slate-400 italic font-medium uppercase tracking-widest text-xs">Aucune actualité publiée récemment.</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        <Card className="p-8 bg-insan-blue text-white border-0 shadow-2xl rounded-[2.5rem] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                            <h3 className="text-xl font-black mb-6 flex items-center gap-3 relative z-10"><Clock size={20} className="text-insan-orange"/> Archives</h3>
                            <p className="text-blue-100/70 text-sm mb-6 relative z-10 font-medium">Restez informé de l'évolution de l'institut à travers le temps.</p>
                            <Button variant="secondary" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 shadow-none">Voir les archives</Button>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsPage;
