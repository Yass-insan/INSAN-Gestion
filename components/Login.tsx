import React, { useState } from 'react';
import { UserRole } from '../types';
import { ChevronRight, ShieldCheck, GraduationCap } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'demo'>('login');
  const [logoError, setLogoError] = useState(false);

  // URL Proxy avec encodage correct
  const encodedLogoUrl = encodeURIComponent("https://institut-insan.com/wp-content/uploads/2023/07/Logo-Institut-Insan-1.png");
  const LOGO_URL = `https://wsrv.nl/?url=${encodedLogoUrl}&w=400&output=png`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email);
  };

  const demoAccounts = [
    { role: 'Admin', email: 'admin@insan.com', pass: 'admin1234', label: 'Administrateur' },
    { role: 'Professeur', email: 'prof@insan.com', pass: 'prof1234', label: 'Corps Enseignant' },
    { role: 'Étudiant', email: 'etudiant@insan.com', pass: 'étudiant1234', label: 'Espace Étudiant' },
  ];

  const fillCredentials = (email: string, pass: string) => {
    setEmail(email);
    setPassword(pass);
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-insan-blue rounded-b-[3rem] z-0 shadow-2xl"></div>
      <div className="absolute top-10 right-10 w-64 h-64 bg-insan-orange opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-insan-blue opacity-5 rounded-full blur-3xl"></div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-5xl z-10 overflow-hidden flex flex-col md:flex-row min-h-[600px] transition-colors duration-300">
        
        {/* Left Side - Visual */}
        <div className="md:w-1/2 bg-gray-50 dark:bg-slate-800 p-12 flex flex-col justify-between relative overflow-hidden transition-colors duration-300">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#262262 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <div className="relative z-10">
                {logoError ? (
                  <div className="mb-8 inline-flex items-center gap-3">
                     <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-2xl shadow-lg backdrop-blur-sm">
                        <div className="flex flex-col items-center justify-center">
                            <span className="font-extrabold text-insan-blue dark:text-blue-400 tracking-tighter text-3xl leading-none">INSTITUT</span>
                            <span className="font-bold text-insan-orange tracking-[0.2em] text-sm leading-none mt-1">INSAN</span>
                        </div>
                     </div>
                  </div>
                ) : (
                  <img 
                      src={LOGO_URL} 
                      alt="Institut Insan" 
                      className="h-24 object-contain mb-8"
                      onError={() => setLogoError(true)}
                  />
                )}
                
                <h1 className="text-3xl font-bold text-insan-blue dark:text-blue-400 mb-2 tracking-tight">Portail Numérique</h1>
                <p className="text-gray-500 dark:text-slate-400 text-lg leading-relaxed">
                    Plateforme de gestion centralisée pour le suivi académique, l'assiduité et la vie scolaire.
                </p>
            </div>

            <div className="relative z-10 mt-12 space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-300 font-medium">
                    <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center"><ShieldCheck size={16}/></span>
                    Accès sécurisé
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-300 font-medium">
                     <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center"><ChevronRight size={16}/></span>
                    Suivi temps réel
                </div>
            </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center bg-white dark:bg-slate-900 transition-colors duration-300">
            <div className="flex space-x-6 mb-8 border-b border-gray-100 dark:border-slate-800">
                <button 
                    onClick={() => setActiveTab('login')}
                    className={`pb-3 text-sm font-semibold transition-all ${activeTab === 'login' ? 'text-insan-blue dark:text-blue-400 border-b-2 border-insan-blue dark:border-blue-400' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}
                >
                    Connexion
                </button>
                <button 
                    onClick={() => setActiveTab('demo')}
                    className={`pb-3 text-sm font-semibold transition-all ${activeTab === 'demo' ? 'text-insan-orange border-b-2 border-insan-orange' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}
                >
                    Comptes Démo
                </button>
            </div>

            {activeTab === 'login' ? (
                <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                    <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-800 rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-insan-blue dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-700 dark:text-slate-100"
                        placeholder="nom@exemple.com"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Mot de passe</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-800 rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-insan-blue dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-700 dark:text-slate-100"
                        placeholder="••••••••"
                        required
                    />
                    </div>
                    <button
                    type="submit"
                    className="w-full bg-insan-blue text-white font-bold py-4 rounded-xl hover:bg-blue-900 transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-900/20"
                    >
                    ACCÉDER AU PORTAIL
                    </button>
                </form>
            ) : (
                <div className="space-y-3 animate-fade-in">
                    <p className="text-sm text-gray-400 mb-4">Sélectionnez un profil pour tester l'interface :</p>
                    {demoAccounts.map((acc) => (
                        <button
                        key={acc.role}
                        onClick={() => fillCredentials(acc.email, acc.pass)}
                        className="w-full text-left px-5 py-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:border-insan-orange/30 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl flex justify-between items-center transition-all group shadow-sm hover:shadow-md"
                        >
                        <div>
                            <span className="block font-bold text-gray-800 dark:text-slate-200 group-hover:text-insan-blue dark:group-hover:text-blue-400 transition-colors">{acc.label}</span>
                            <span className="text-xs text-gray-400 font-mono group-hover:text-insan-orange/70">{acc.role}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-700 group-hover:bg-white dark:group-hover:bg-slate-600 flex items-center justify-center text-gray-300 dark:text-slate-500 group-hover:text-insan-orange transition-colors">
                            <ChevronRight size={18} />
                        </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
      </div>
      
      <p className="absolute bottom-6 text-center text-gray-400 dark:text-slate-500 text-xs font-medium">
        © 2024 Institut Insan • Tous droits réservés
      </p>
    </div>
  );
};

export default Login;