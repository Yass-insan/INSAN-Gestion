import React, { useState } from 'react';
import { PricingSettings, Course, Pole, InstituteSettings } from '../../types';
import { Card, Button, PageHeader, useToast } from '../../components/ui/DesignSystem';
import { Save, Euro, Percent, Package, Layers, X } from 'lucide-react';
import { getTranslation } from '../../services/i18n';

interface TarificationSettingsProps {
    pricing: PricingSettings;
    courses: Course[];
    poles: Pole[];
    onUpdate: (pricing: PricingSettings) => void;
    settings?: InstituteSettings;
}

const TarificationSettings: React.FC<TarificationSettingsProps> = ({ pricing, courses, poles, onUpdate, settings }) => {
    const [localPricing, setLocalPricing] = useState<PricingSettings>(pricing);
    const { showToast } = useToast();

    const lang = settings?.language || 'fr';
    const currency = settings?.currency || '€';
    const t = (key: string) => getTranslation(key, lang);

    const handleSave = () => {
        onUpdate(localPricing);
        showToast("Configuration tarifaire mise à jour !", "success");
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader 
                title={t('tarification')} 
                subtitle="Définissez les prix des cours et les remises automatiques."
                action={<Button onClick={handleSave} icon={<Save size={18}/>}>{t('save')}</Button>}
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
                                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{currency}</span>
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
                                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{currency}</span>
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
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        className="w-24 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-right font-bold bg-white dark:bg-slate-800 dark:text-white"
                                        value={localPricing.dossierFees}
                                        onChange={e => setLocalPricing({...localPricing, dossierFees: Number(e.target.value)})}
                                    />
                                    <span className="font-bold text-slate-400 dark:text-slate-500">{currency}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Supplément Hybride</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">Ajout automatique si formule Hybride</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        className="w-24 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-right font-bold bg-white dark:bg-slate-800 dark:text-white"
                                        value={localPricing.hybridSurcharge}
                                        onChange={e => setLocalPricing({...localPricing, hybridSurcharge: Number(e.target.value)})}
                                    />
                                    <span className="font-bold text-slate-400 dark:text-slate-500">{currency}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Formation Montessori</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">Forfait nouveaux parents Enfance</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        className="w-24 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-right font-bold bg-white dark:bg-slate-800 dark:text-white"
                                        value={localPricing.montessoriFees}
                                        onChange={e => setLocalPricing({...localPricing, montessoriFees: Number(e.target.value)})}
                                    />
                                    <span className="font-bold text-slate-400 dark:text-slate-500">{currency}</span>
                                </div>
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
                        </div>
                    </Card>

                    {/* 4. MODES DE RÈGLEMENT */}
                    <Card className="p-8">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Layers className="text-purple-600 dark:text-purple-400" size={20}/> Modes de Règlement
                        </h3>
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {(localPricing.paymentMethods || []).map((method, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 group">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{method}</span>
                                        <button 
                                            onClick={() => {
                                                const newMethods = (localPricing.paymentMethods || []).filter((_, i) => i !== idx);
                                                setLocalPricing({...localPricing, paymentMethods: newMethods});
                                            }}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <X size={14}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    id="new-payment-method"
                                    type="text" 
                                    placeholder="Nouveau mode (ex: Chèque Vacances)" 
                                    className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm font-bold bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-insan-blue/20"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const input = e.currentTarget;
                                            const val = input.value.trim();
                                            if (val && !(localPricing.paymentMethods || []).includes(val)) {
                                                setLocalPricing({
                                                    ...localPricing, 
                                                    paymentMethods: [...(localPricing.paymentMethods || []), val]
                                                });
                                                input.value = '';
                                            }
                                        }
                                    }}
                                />
                                <Button 
                                    onClick={() => {
                                        const input = document.getElementById('new-payment-method') as HTMLInputElement;
                                        const val = input.value.trim();
                                        if (val && !(localPricing.paymentMethods || []).includes(val)) {
                                            setLocalPricing({
                                                ...localPricing, 
                                                paymentMethods: [...(localPricing.paymentMethods || []), val]
                                            });
                                            input.value = '';
                                        }
                                    }}
                                    variant="secondary"
                                >
                                    Ajouter
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TarificationSettings;