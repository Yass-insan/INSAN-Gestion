
import React, { useState } from 'react';
import { Card, Button, Badge } from '../../components/ui/DesignSystem';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

const ContactPage: React.FC = () => {
    const [sent, setSent] = useState(false);

    return (
        <div className="animate-fade-in pb-32 pt-16 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <Badge color="orange" className="mb-6">NOUS CONTACTER</Badge>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-8 leading-none">
                        Une question ? <br/> <span className="text-insan-blue dark:text-blue-400">Échangeons.</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="space-y-8">
                        <Card className="p-8 border-0 shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem]">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 text-center uppercase tracking-widest text-xs">Nos Coordonnées</h3>
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-insan-blue rounded-2xl flex items-center justify-center shrink-0"><MapPin size={24}/></div>
                                    <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Adresse</p><p className="text-sm font-bold text-slate-700 dark:text-slate-200">99 rue de Gerland, 69007 Lyon</p></div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 text-insan-orange rounded-2xl flex items-center justify-center shrink-0"><Phone size={24}/></div>
                                    <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Téléphone</p><p className="text-sm font-bold text-slate-700 dark:text-slate-200">04 XX XX XX XX</p></div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-500 rounded-2xl flex items-center justify-center shrink-0"><Mail size={24}/></div>
                                    <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">E-mail</p><p className="text-sm font-bold text-slate-700 dark:text-slate-200">contact@institutinsan.com</p></div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="p-10 md:p-16 border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-[3rem]">
                            {sent ? (
                                <div className="text-center py-20 animate-fade-in">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl"><CheckCircle size={40}/></div>
                                    <h3 className="text-3xl font-black mb-4">Message envoyé !</h3>
                                    <p className="text-slate-500 font-medium mb-12">Nous vous répondrons dans les meilleurs délais.</p>
                                    <Button onClick={() => setSent(false)}>Envoyer un autre message</Button>
                                </div>
                            ) : (
                                <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-widest">Votre Nom</label><input required className="w-full bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 focus:ring-insan-blue/5 dark:text-white" placeholder="Nom complet" /></div>
                                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-widest">E-mail</label><input required type="email" className="w-full bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 focus:ring-insan-blue/5 dark:text-white" placeholder="votre@email.com" /></div>
                                    </div>
                                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-widest">Sujet</label><input required className="w-full bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 focus:ring-insan-blue/5 dark:text-white" placeholder="Objet de votre message" /></div>
                                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-widest">Message</label><textarea required className="w-full bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 focus:ring-insan-blue/5 min-h-[200px] dark:text-white" placeholder="Dites-nous tout..." /></div>
                                    <button type="submit" className="w-full md:w-auto px-12 py-5 bg-insan-blue text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4">ENVOYER LE MESSAGE <Send size={24}/></button>
                                </form>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
