import React, { useState } from 'react';
import { 
    StudentFormRequest, 
    StudentFormTemplate, 
    FormFieldType 
} from '../../types';
import { Card, Button } from '../../components/ui/DesignSystem';
import { X, Send, ClipboardCheck, Info, CheckCircle } from 'lucide-react';

interface StudentFormFillerProps {
    request: StudentFormRequest;
    template: StudentFormTemplate;
    onSubmit: (requestId: string, data: any) => void;
    onClose: () => void;
}

const StudentFormFiller: React.FC<StudentFormFillerProps> = ({ request, template, onSubmit, onClose }) => {
    const [formData, setFormData] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);

    const handleInputChange = (fieldId: string, value: any) => {
        setFormData({ ...formData, [fieldId]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        const missingFields = template.fields.filter(f => f.required && !formData[f.id]);
        if (missingFields.length > 0) {
            alert(`Veuillez remplir les champs obligatoires: ${missingFields.map(f => f.label).join(', ')}`);
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            onSubmit(request.id, formData);
            setCompleted(true);
            setIsSubmitting(false);
        }, 1500);
    };

    if (completed) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4 animate-fade-in">
                <Card className="w-full max-w-md p-10 text-center rounded-[3rem]">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">Formulaire Envoyé !</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Merci d'avoir complété ce document. L'administration a été notifiée.</p>
                    <Button onClick={onClose} className="w-full py-4 rounded-2xl font-black uppercase tracking-widest">Retour au tableau de bord</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-900/80 backdrop-blur-xl animate-fade-in">
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden my-8">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-insan-blue text-white rounded-2xl shadow-lg shadow-blue-900/20">
                            <ClipboardCheck size={28}/>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{template.title}</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Document Administratif Requis</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-500 transition-colors"><X size={24}/></button>
                </div>

                <div className="p-8">
                    {/* Instructions */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex gap-4 mb-8">
                        <Info className="shrink-0 text-insan-blue" size={24}/>
                        <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed uppercase tracking-tight mb-1">Instructions de l'administration</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium italic">{template.description}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {template.fields.map(field => (
                                <div key={field.id} className={`${field.type === FormFieldType.LONG_TEXT ? 'md:col-span-2' : ''}`}>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    
                                    {field.type === FormFieldType.TEXT && (
                                        <input 
                                            type="text"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 outline-none focus:border-insan-blue/40 transition-all font-bold dark:text-white"
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            value={formData[field.id] || ''}
                                            onChange={e => handleInputChange(field.id, e.target.value)}
                                        />
                                    )}

                                    {field.type === FormFieldType.LONG_TEXT && (
                                        <textarea 
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 outline-none focus:border-insan-blue/40 transition-all font-bold dark:text-white min-h-[120px]"
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            value={formData[field.id] || ''}
                                            onChange={e => handleInputChange(field.id, e.target.value)}
                                        />
                                    )}

                                    {field.type === FormFieldType.NUMBER && (
                                        <input 
                                            type="number"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 outline-none focus:border-insan-blue/40 transition-all font-bold dark:text-white"
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            value={formData[field.id] || ''}
                                            onChange={e => handleInputChange(field.id, e.target.value)}
                                        />
                                    )}

                                    {field.type === FormFieldType.DATE && (
                                        <input 
                                            type="date"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 outline-none focus:border-insan-blue/40 transition-all font-bold dark:text-white"
                                            required={field.required}
                                            value={formData[field.id] || ''}
                                            onChange={e => handleInputChange(field.id, e.target.value)}
                                        />
                                    )}

                                    {field.type === FormFieldType.CHECKBOX && (
                                        <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl cursor-pointer">
                                            <input 
                                                type="checkbox"
                                                className="w-5 h-5 rounded text-insan-blue focus:ring-insan-blue"
                                                required={field.required}
                                                checked={formData[field.id] || false}
                                                onChange={e => handleInputChange(field.id, e.target.checked)}
                                            />
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Confirmer / Accepter</span>
                                        </label>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 flex gap-4">
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="flex-1 bg-insan-blue text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? 'Envoi en cours...' : (
                                    <>
                                        Envoyer le document <Send size={20}/>
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
            </div>
        </div>
    );
};

export default StudentFormFiller;
