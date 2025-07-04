import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 inline-flex items-center justify-center space-x-2';
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-accent focus:ring-primary disabled:bg-lilac/50',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 focus:ring-slate-500 disabled:bg-slate-100',
    danger: 'bg-grape text-white hover:bg-grape/80 focus:ring-grape disabled:bg-grape/50',
  };
  return <button type={type} onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`} disabled={disabled}>{children}</button>;
};

export default Button;
