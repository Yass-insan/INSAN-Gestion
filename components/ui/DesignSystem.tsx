import React from 'react';

// --- Card ---
export interface CardProps {
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
    style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, style }) => (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300 ${className}`} onClick={onClick} style={style}>
        {children}
    </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', icon, className = '', ...props }) => {
    const baseStyles = "rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "bg-insan-blue text-white hover:bg-blue-900 shadow-lg shadow-blue-900/20 dark:shadow-none dark:hover:bg-blue-800",
        secondary: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm",
        danger: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-100 dark:border-red-900/30",
        ghost: "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-insan-blue dark:hover:text-blue-400",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-6 py-3.5 text-base",
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {icon}
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
        blue: "bg-blue-50 dark:bg-blue-900/30 text-insan-blue dark:text-blue-300 border-blue-100 dark:border-blue-800/50",
        green: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800/50",
        red: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-100 dark:border-red-800/50",
        orange: "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-800/50",
        gray: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    };

    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold border inline-flex items-center gap-1 ${colors[color]} ${className}`}>
            {icon}
            {children}
        </span>
    );
};

// --- Page Header ---
export const PageHeader = ({ title, subtitle, action }: { title: string, subtitle?: string, action?: React.ReactNode }) => (
    <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6 animate-fade-in">
        <div>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight transition-colors duration-300">{title}</h2>
            {subtitle && <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors duration-300">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
    </div>
);