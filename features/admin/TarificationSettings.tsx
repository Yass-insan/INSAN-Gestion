import React, { useState } from 'react';
import { PricingSettings, Course, Pole } from '../../types';
import { Card, Button, PageHeader } from '../../components/ui/DesignSystem';
import { Save, Euro, Percent, Package, Layers } from 'lucide-react';

interface TarificationSettingsProps {
    pricing: PricingSettings;
    courses: Course[];
    poles: Pole[];
    onUpdate: (pricing: PricingSettings) => void;
}

const TarificationSettings: React.FC<TarificationSettingsProps> = ({ pricing, courses, poles, onUpdate }) => {
    const [localPricing, setLocalPricing] = useState<PricingSettings>(pricing);

    const handleSave = () => {
        onUpdate(localPricing);
        alert("Configuration tarifaire mise à jour !");
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader 
                title="Tarification & Règles" 
                subtitle="Définissez les prix des cours et les remises automatiques."
                action={<Button onClick={handleSave} icon={<Save size={18}/>}>Enregistrer</Button>}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. COURS INDIVIDUELS */}
                <Card className="p-8">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Package className="text-insan-blue dark:text-blue-400" size={20}/> Prix par Cours
                    </h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {courses.map(c => {
                            const config = localPricing.coursePrices[c.id] || { onSite: 0, remote: 0 };
                            return (
                                <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl">
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{c.name}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">{poles.find(p => p.id === c.pole)?.name}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-end">
                                            <label className="text-[9px] font-black text-slate-400 uppercase">Présentiel</label>
                                            <div className="flex items-center gap-1">
                                                <input 
                                                    type="number" 
                                                    className="w-20 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-right font-bold outline-none focus:ring-2 focus:ring-insan-blue/20 bg-white dark:bg-slate-900 dark:text-white text-xs"
                                                    value={config.onSite}
                                                    onChange={e => {
                                                        const newPrices = { ...localPricing.coursePrices, [c.id]: { ...config, onSite: Number(e.target.value) } };
                                                        setLocalPricing({...localPricing, coursePrices: newPrices});
                                                    }}
                                                />
                                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">€</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <label className="text-[9px] font-black text-slate-400 uppercase">Distanciel</label>
                                            <div className="flex items-center gap-1">
                                                <input 
                                                    type="number" 
                                                    className="w-20 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-right font-bold outline-none focus:ring-2 focus:ring-insan-blue/20 bg-white dark:bg-slate-900 dark:text-white text-xs"
                                                    value={config.remote}
                                                    onChange={e => {
                                                        const newPrices = { ...localPricing.coursePrices, [c.id]: { ...config, remote: Number(e.target.value) } };
                                                        setLocalPricing({...localPricing, coursePrices: newPrices});
                                                    }}
                                                />
                                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">€</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <div className="space-y-8">
                    {/* 2. SUPPLEMENTS ET FRAIS */}
                    <Card className="p-8">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Euro className="text-insan-orange dark:text-orange-400" size={20}/> Suppléments & Frais Fixes
                        </h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Frais de dossier</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">Payés lors de la première inscription</p>
                                </div>
                                <input 
                                    type="number" 
                                    className="w-24 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-right font-bold bg-white dark:bg-slate-800 dark:text-white"
                                    value={localPricing.dossierFees}
                                    onChange={e => setLocalPricing({...localPricing, dossierFees: Number(e.target.value)})}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Supplément Hybride</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">Ajout automatique si formule Hybride</p>
                                </div>
                                <input 
                                    type="number" 
                                    className="w-24 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-right font-bold bg-white dark:bg-slate-800 dark:text-white"
                                    value={localPricing.hybridSurcharge}
                                    onChange={e => setLocalPricing({...localPricing, hybridSurcharge: Number(e.target.value)})}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Formation Montessori</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">Forfait nouveaux parents Enfance</p>
                                </div>
                                <input 
                                    type="number" 
                                    className="w-24 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-right font-bold bg-white dark:bg-slate-800 dark:text-white"
                                    value={localPricing.montessoriFees}
                                    onChange={e => setLocalPricing({...localPricing, montessoriFees: Number(e.target.value)})}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* 3. REMISES AUTOMATIQUES */}
                    <Card className="p-8">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Percent className="text-green-600 dark:text-green-400" size={20}/> Remises Automatiques
                        </h3>
                        <div className="space-y-6">
                             <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Réduction Multi-cours</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">Appliquée si 2 cours ou plus (%)</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        className="w-24 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-right font-bold bg-white dark:bg-slate-800 dark:text-white"
                                        value={localPricing.discounts.multiCourse}
                                        onChange={e => setLocalPricing({
                                            ...localPricing, 
                                            discounts: { ...localPricing.discounts, multiCourse: Number(e.target.value) }
                                        })}
                                    />
                                    <span className="font-bold text-slate-400 dark:text-slate-500">%</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center opacity-50">
                                <div>
                                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Réduction Multi-enfants</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">Bientôt disponible (gestion par Famille)</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input disabled type="number" className="w-24 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-right font-bold bg-white dark:bg-slate-800 dark:text-white" value={localPricing.discounts.multiChild} />
                                    <span className="font-bold text-slate-400 dark:text-slate-500">%</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TarificationSettings;