
import React from 'react';
import { Card, Badge } from '../../components/ui/DesignSystem';
import { Course, RegistrationDossier, RegistrationStatus } from '../../types';
import { ArrowRight, GraduationCap, Users, BookOpen, Star, Sparkles, Heart } from 'lucide-react';

interface LandingPageProps {
    onNavigate: (view: string) => void;
    courses: Course[];
    dossiers: RegistrationDossier[];
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, courses, dossiers }) => {
    const activeStudents = dossiers
        .filter(d => d.status !== RegistrationStatus.CANCELLED)
        .reduce((acc, d) => acc + d.students.length, 0) + 750;

    return (
        <div className="animate-fade-in pb-24">
            {/* HERO SECTION */}
            <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden bg-slate-900 rounded-b-[4rem]">
                <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-30" alt="Institut Insan" />
                    <div className="absolute inset-0 bg-gradient-to-r from-insan-blue via-insan-blue/80 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <Badge color="orange" className="px-4 py-2" icon={<Sparkles size={14}/>}>INSCRIPTIONS 2024/2025 OUVERTES</Badge>
                        <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter">
                            L'Excellence <br/> <span className="text-insan-orange">Éducative</span> à Lyon.
                        </h1>
                        <p className="text-xl text-slate-300 font-medium max-w-lg leading-relaxed">
                            Pôle d'enseignement et d'éveil, l'Institut Insan accompagne chaque étudiant vers son épanouissement spirituel et intellectuel.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button 
                                onClick={() => onNavigate('formations-presence')}
                                className="px-10 py-5 bg-insan-orange text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                            >
                                S'inscrire <ArrowRight size={24}/>
                            </button>
                            <button 
                                onClick={() => onNavigate('about')}
                                className="px-10 py-5 bg-white/10 backdrop-blur-xl text-white rounded-[2rem] font-black text-lg border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-4"
                            >
                                Qui sommes-nous ?
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* PÔLES D'EXCELLENCE */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="mb-20">
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Nos Pôles d'Enseignement</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg">Une structure adaptée à chaque étape de l'apprentissage.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: 'Enfance', icon: Heart, color: 'orange', desc: 'S\'éveiller et apprendre par le jeu et la bienveillance.' },
                            { title: 'Jeunesse', icon: GraduationCap, color: 'blue', desc: 'Accompagner l\'adolescent vers sa maturité spirituelle.' },
                            { title: 'Adultes', icon: Users, color: 'indigo', desc: 'Sciences islamiques et langue arabe pour tous.' },
                            { title: 'Coran', icon: Star, color: 'green', desc: 'Mémorisation et perfectionnement avec nos maîtres.' }
                        ].map((pole, i) => (
                            <Card key={i} className="p-10 border-0 shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                                <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-insan-${pole.color}`}>
                                    <pole.icon size={32}/>
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3">{pole.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{pole.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION CHIFFRES */}
            <section className="max-w-7xl mx-auto px-6 mb-32">
                <Card className="bg-insan-blue p-12 md:p-20 text-white border-0 shadow-2xl relative overflow-hidden rounded-[4rem]">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="max-w-xl text-center lg:text-left">
                            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">Étudiez <span className="text-insan-orange">partout</span>.</h2>
                            <p className="text-blue-100/70 text-lg font-medium">Nos formations sont disponibles en présentiel à Lyon ou via notre plateforme interactive en ligne.</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-8">
                            <div className="text-center">
                                <p className="text-5xl font-black mb-1">{activeStudents}+</p>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Élèves formés</p>
                            </div>
                            <div className="text-center">
                                <p className="text-5xl font-black mb-1">15+</p>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Enseignants</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>
        </div>
    );
};

export default LandingPage;
