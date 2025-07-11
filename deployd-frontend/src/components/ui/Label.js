import React from 'react';

function Label({ children, ...props }) {
    return (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300" {...props}>
            {children}
        </label>
    );
}

export default Label;
