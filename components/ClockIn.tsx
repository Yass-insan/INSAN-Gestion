import React, { useState, useEffect } from 'react';
import { calculateDistance } from '../services/utils';
import { MapPin, CheckCircle, AlertTriangle, Loader2, Fingerprint, LogOut, LogIn } from 'lucide-react';
import { User, InstituteSettings, AttendanceRecord } from '../types';
import { Badge } from './ui/DesignSystem';

interface ClockInProps {
  user: User;
  onClockIn: (isExit: boolean) => void;
  settings?: InstituteSettings;
  todayRecord?: AttendanceRecord;
}

const ClockIn: React.FC<ClockInProps> = ({ user, onClockIn, settings, todayRecord }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState<number | null>(null);

  // État binaire Arrivée/Départ basé sur le record du jour
  const isExitAction = !!(todayRecord && todayRecord.entryTimestamp && !todayRecord.exitTimestamp);
  const isFullyPointed = !!(todayRecord && todayRecord.entryTimestamp && todayRecord.exitTimestamp);

  const handleClockIn = () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const dist = calculateDistance(latitude, longitude, settings?.lat, settings?.lng);
        setDistanceInfo(Math.round(dist));

        if (dist <= (settings?.radius || 100)) {
          setTimeout(() => {
            setSuccess(true);
            onClockIn(isExitAction); 
            setLoading(false);
          }, 1200);
        } else {
          setError(`Trop loin (${Math.round(dist)}m). Limite : ${settings?.radius}m.`);
          setLoading(false);
        }
      },
      () => {
        setError("Erreur GPS. Vérifiez vos autorisations.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  if (isFullyPointed) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-center shadow-sm">
        <div className="mx-auto w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={32} />
        </div>
        <h3 className="font-bold text-slate-800 dark:text-white">Journée Terminée</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Pointages Entrée & Sortie validés.</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-widest">
            <div className="bg-slate-50 dark:bg-slate-800 dark:text-slate-300 p-2 rounded-lg">Entrée: {todayRecord?.entryTimestamp}</div>
            <div className="bg-slate-50 dark:bg-slate-800 dark:text-slate-300 p-2 rounded-lg">Sortie: {todayRecord?.exitTimestamp}</div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 border border-green-200 dark:border-green-800 rounded-3xl p-10 text-center animate-fade-in shadow-lg">
        <div className="mx-auto w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-md animate-bounce">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-extrabold text-green-800 dark:text-green-300 mb-2 tracking-tight">Pointage {isExitAction ? 'Sortie' : 'Entrée'} Validé</h3>
        <p className="text-green-700 dark:text-green-400 font-medium">Enregistré à {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative transition-colors duration-300">
      <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
        <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
               {isExitAction ? <LogOut size={18} className="text-red-500"/> : <LogIn size={18} className="text-green-500"/>}
               {isExitAction ? 'Pointage Sortie' : 'Pointage Arrivée'}
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">{settings?.address}</p>
        </div>
        {isExitAction && <Badge color="green">Arrivée validée à {todayRecord?.entryTimestamp}</Badge>}
      </div>
      
      <div className="p-8 flex flex-col items-center justify-center">
        {error && (
          <div className="w-full mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl flex items-center gap-3 animate-shake">
            <AlertTriangle size={18} className="text-red-500 dark:text-red-400" />
            <div className="text-xs font-bold text-red-700 dark:text-red-300">{error}</div>
          </div>
        )}

        <div className="relative">
            {!loading && <div className={`absolute inset-0 rounded-full opacity-10 animate-ping ${isExitAction ? 'bg-red-500' : 'bg-insan-blue dark:bg-blue-500'}`}></div>}
            <button
              onClick={handleClockIn}
              disabled={loading}
              className={`
                  relative w-48 h-48 rounded-full border-4 transition-all duration-300
                  flex flex-col items-center justify-center shadow-xl z-10
                  ${loading 
                      ? 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-50' 
                      : isExitAction 
                        ? 'border-red-50 dark:border-red-900 bg-gradient-to-b from-red-500 to-red-700 dark:from-red-600 dark:to-red-900 hover:scale-105' 
                        : 'border-blue-50 dark:border-blue-900 bg-gradient-to-b from-insan-blue to-slate-900 dark:from-blue-600 dark:to-blue-900 hover:scale-105'}
              `}
            >
            {loading ? (
                <Loader2 className="w-10 h-10 text-insan-orange animate-spin" />
            ) : (
                <>
                <Fingerprint className="w-12 h-12 text-white/90 mb-2" strokeWidth={1.5} />
                <span className="font-extrabold text-white text-xl tracking-tight">{isExitAction ? 'S\'EN ALLER' : 'POINTER'}</span>
                <span className="text-[9px] text-white/60 font-bold uppercase mt-1">{isExitAction ? 'Départ' : 'Arrivée'}</span>
                </>
            )}
            </button>
        </div>
        
        {distanceInfo !== null && !success && !loading && (
           <div className="mt-6 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[10px] font-mono text-slate-400 dark:text-slate-500">
               Distance: <span className="font-bold text-slate-600 dark:text-slate-300">{distanceInfo}m</span>
           </div>
        )}
      </div>
    </div>
  );
};

export default ClockIn;