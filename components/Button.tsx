import React from 'react';

// Fix: Add `as` prop to support polymorphism.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  as?: React.ElementType;
}

// Fix: Allow arbitrary props like `to` from react-router-dom's Link by intersecting with a general-purpose type.
const Button: React.FC<ButtonProps & { [key: string]: any }> = ({ children, className = '', isLoading = false, variant = 'primary', size = 'md', as: Component = 'button', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center border font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 dark:focus:ring-offset-slate-900";
  
  const variantClasses = {
    primary: 'text-white bg-indigo-600 hover:bg-indigo-700 border-transparent focus:ring-indigo-500',
    secondary: 'text-indigo-700 bg-transparent border-indigo-200 hover:bg-indigo-50 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900/40 focus:ring-indigo-500',
    danger: 'text-white bg-red-600 hover:bg-red-700 border-transparent focus:ring-red-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const componentProps: { [key: string]: any } = {
    className: `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`,
    ...props,
  };

  // Fix: Handle `disabled` state correctly for buttons and other elements like Links.
  if (isLoading) {
    if (Component === 'button') {
      componentProps.disabled = true;
    } else {
      componentProps['aria-disabled'] = true;
      componentProps.onClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
      };
    }
  }

  // The `disabled` attribute is not valid on non-button elements (e.g., `<a>` tag rendered by Link).
  // Remove it to avoid React warnings.
  if (Component !== 'button') {
    delete componentProps.disabled;
  }

  return (
    <Component {...componentProps}>
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </Component>
  );
};

export default Button;