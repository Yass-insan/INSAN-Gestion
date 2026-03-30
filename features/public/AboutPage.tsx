
import React from 'react';
import { Card, Badge } from '../../components/ui/DesignSystem';
import { Sparkles, Heart, Target, Users, BookOpen, ShieldCheck, Globe, CheckCircle2, Award } from 'lucide-react';

const AboutPage: React.FC = () => {
    return (
        <div className="animate-fade-in pb-32">
            {/* HERO SECTION - ABOUT */}
            <section className="bg-insan-blue py-32 relative overflow-hidden rounded-b-[4rem]">
                <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -mr-64 -mt-64"></div>
                <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                    <Badge color="orange" className="mb-8 px-6 py-2">QUI SOMMES-NOUS ?</Badge>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-8">
                        L'Institut Insan : <br/><span className="text-insan-orange">Excellence & Éveil</span>
                    </h1>
                    <p className="text-xl text-blue-100/70 font-medium max-w-3xl mx-auto leading-relaxed">
                        Un pôle d’enseignement, d’excellence et d’éveil, qui vise à l’épanouissement spirituel et intellectuel de l’étudiant musulman en France.
                    </p>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-20">
                <Card className="p-12 md:p-20 border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-[3rem]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        <div className="space-y-10">
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-4">
                                    <Target className="text-insan-orange" size={32}/> Notre Mission
                                </h2>
                                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    L’Institut s’adresse à tous les âges à travers ses quatre pôles d’enseignement complémentaires : le pôle enfance, le pôle jeunesse, le pôle adulte et le pôle coran. 
                                </p>
                                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    La pédagogie Insan repose sur l’alternance entre savoir et savoir-être, entre théorie et pratique. Nous formons des étudiants capables de porter fièrement leurs valeurs dans la société française.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { title: 'Pédagogie active', icon: BookOpen },
                                    { title: 'Enseignants diplômés', icon: Award },
                                    { title: 'Éthique musulmane', icon: ShieldCheck },
                                    { title: 'Épanouissement personnel', icon: Heart }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-insan-blue shadow-sm">
                                            <item.icon size={20}/>
                                        </div>
                                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">{item.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 relative">
                            <div className="absolute inset-0 bg-insan-blue/5 rounded-[3rem] -m-6 -rotate-1"></div>
                            {[
                                { title: 'Fraternité', icon: Users, color: 'blue', desc: 'Une communauté soudée.' },
                                { title: 'Excellence', icon: Target, color: 'orange', desc: 'Rigueur académique.' },
                                { title: 'Éveil', icon: Heart, color: 'green', desc: 'Ouverture du cœur.' },
                                { title: 'Éthique', icon: ShieldCheck, color: 'purple', desc: 'Respect & engagement.' }
                            ].map((val, i) => (
                                <div key={i} className={`relative p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 text-center space-y-4 ${i % 2 !== 0 ? 'translate-y-8' : ''}`}>
                                    <val.icon className={`mx-auto text-insan-${val.color}`} size={32}/>
                                    <h4 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest">{val.title}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 leading-tight">{val.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-40 border-t border-slate-100 dark:border-slate-800 pt-20">
                        <div className="text-center mb-16">
                            <Badge color="gray" className="mb-4">NOS 4 PÔLES D'ACTIVITÉ</Badge>
                            <h3 className="text-4xl font-black text-slate-800 dark:text-white">Une structure adaptée à chaque vie.</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { title: 'Pôle Enfance', age: '6-10 ans', desc: 'S\'éveiller à la foi par le jeu et la bienveillance.' },
                                { title: 'Pôle Jeunesse', age: '11-17 ans', desc: 'Accompagner l\'adolescent dans sa construction identitaire.' },
                                { title: 'Pôle Adultes', age: '18+ ans', desc: 'Sciences islamiques et langue arabe pour les frères et sœurs.' },
                                { title: 'Pôle Coran', age: 'Tous âges', desc: 'Mémorisation et perfectionnement des règles du Tajwid.' }
                            ].map((pole, i) => (
                                <div key={i} className="space-y-4 group">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-insan-blue rounded-2xl flex items-center justify-center group-hover:bg-insan-blue group-hover:text-white transition-all">
                                        <CheckCircle2 size={24}/>
                                    </div>
                                    <h4 className="text-xl font-black text-slate-800 dark:text-white">{pole.title}</h4>
                                    <Badge color="blue">{pole.age}</Badge>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{pole.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AboutPage;
