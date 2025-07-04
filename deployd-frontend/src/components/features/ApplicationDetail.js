import React from 'react';
import { ArrowLeft, GitBranch } from 'lucide-react';

import Card from '../ui/Card';
import Button from '../ui/Button';

function ApplicationDetail({ app, onBack }) {
    return (
        <div className="animate-fade-in">
            <Button onClick={onBack} variant="secondary" className="mb-6"><ArrowLeft className="h-4 w-4" /><span>Back to Dashboard</span></Button>
            <Card>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{app.appName}</h2>
                <a href={app.gitUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center space-x-1 mt-1"><GitBranch className="h-4 w-4" /><span>{app.gitUrl}</span></a>
            </Card>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {['Development', 'UAT', 'Staging', 'Production'].map(env => (
                    <Card key={env}>
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{env}</h3>
                        <div className="mt-4 text-center text-slate-500">
                            <p>No releases yet for this environment.</p>
                            <Button className="mt-4">Create New Release</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default ApplicationDetail;
