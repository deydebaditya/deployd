import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const MockNotification = ({ type, message, onDismiss }) => {
  const colors = {
    success: 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900/95 dark:border-green-600 dark:text-green-200',
    error: 'bg-red-100 border-red-400 text-red-700 dark:bg-red-900/95 dark:border-red-600 dark:text-red-200',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700 dark:bg-yellow-900/95 dark:border-yellow-600 dark:text-yellow-200',
  };
  const icons = {
    success: <CheckCircle className="h-6 w-6 text-green-500" />,
    error: <XCircle className="h-6 w-6 text-red-500" />,
    warning: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
  };

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(), 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`fixed bottom-5 right-5 max-w-sm w-full p-4 rounded-lg border shadow-lg ${colors[type]} z-50 animate-fade-in`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="ml-3 w-0 flex-1 pt-0.5"><p className="text-sm font-medium">{message}</p></div>
        <div className="ml-4 flex-shrink-0 flex"><button onClick={onDismiss} className="inline-flex text-slate-400 hover:text-slate-500"><span className="sr-only">Close</span><XCircle className="h-5 w-5" /></button></div>
      </div>
    </div>
  );
};

export default MockNotification;
