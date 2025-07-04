import React from 'react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

export default Card;
