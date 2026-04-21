import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

// --- Card ---
export interface CardProps {
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
    style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, style }) => (
    <div 
        className={`bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)] border border-slate-100/50 dark:border-slate-800/50 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)] ${className}`} 
        onClick={onClick} 
        style={style}
    >
        {children}
    </div>
);

// --- Toast ---
export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <div 
                        key={toast.id}
                        className={`
                            pointer-events-auto
                            flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md
                            animate-slide-up transition-all duration-500
                            ${toast.type === 'success' ? 'bg-emerald-50/90 dark:bg-emerald-950/80 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-200' : 
                              toast.type === 'error' ? 'bg-rose-50/90 dark:bg-rose-950/80 border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-200' : 
                              'bg-blue-50/90 dark:bg-blue-950/80 border-blue-100 dark:border-blue-900/30 text-blue-800 dark:text-blue-200'}
                        `}
                    >
                        {toast.type === 'success' && <CheckCircle size={20} className="text-emerald-500" />}
                        {toast.type === 'error' && <AlertCircle size={20} className="text-rose-500" />}
                        {toast.type === 'info' && <Info size={20} className="text-blue-500" />}
                        <span className="font-bold text-sm uppercase tracking-wider">{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', icon, className = '', ...props }) => {
    const baseStyles = "rounded-2xl font-extrabold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider";
    
    const variants = {
        primary: "bg-insan-blue text-white hover:bg-blue-900 shadow-xl shadow-blue-900/10 hover:shadow-blue-900/20",
        secondary: "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 shadow-sm",
        danger: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white border border-red-100 dark:border-red-900/30",
        ghost: "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-insan-blue dark:hover:text-blue-400",
    };

    const sizes = {
        sm: "px-4 py-2 text-[10px]",
        md: "px-6 py-3 text-xs",
        lg: "px-8 py-4 text-sm",
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {icon && <span className="opacity-80">{icon}</span>}
            {children}
        </button>
    );
};

// --- Badge ---
interface BadgeProps {
    children: React.ReactNode;
    color?: 'blue' | 'green' | 'red' | 'orange' | 'gray';
    className?: string;
    icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'blue', className = '', icon }) => {
    const colors = {
        blue: "bg-blue-50/80 dark:bg-blue-900/20 text-insan-blue dark:text-blue-300 border-blue-100/50 dark:border-blue-800/30",
        green: "bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100/50 dark:border-emerald-800/30",
        red: "bg-rose-50/80 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-100/50 dark:border-rose-800/30",
        orange: "bg-orange-50/80 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-100/50 dark:border-orange-800/30",
        gray: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    };

    return (
        <span className={`px-3 py-1.5 rounded-xl text-[9px] uppercase font-black tracking-[0.15em] border backdrop-blur-sm inline-flex items-center gap-1.5 ${colors[color]} ${className}`}>
            {icon}
            {children}
        </span>
    );
};

// --- Page Header ---
export const PageHeader = ({ title, subtitle, action }: { title: string, subtitle?: string, action?: React.ReactNode }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 animate-fade-in">
        <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter leading-none mb-4">{title}</h2>
            {subtitle && <p className="text-lg text-slate-400 dark:text-slate-500 font-medium leading-relaxed">{subtitle}</p>}
        </div>
        {action && <div className="flex flex-wrap shrink-0 gap-3">{action}</div>}
    </div>
);