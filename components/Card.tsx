import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/50 shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: ReactNode; className?: string; }> = ({ children, className }) => (
    <div className={`p-6 border-b border-slate-200 dark:border-slate-700 ${className}`}>
        {children}
    </div>
)

export const CardContent: React.FC<{ children: ReactNode; className?: string; }> = ({ children, className }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
)

export const CardFooter: React.FC<{ children: ReactNode; className?: string; }> = ({ children, className }) => (
    <div className={`p-6 bg-slate-50/70 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 ${className}`}>
        {children}
    </div>
)


export default Card;