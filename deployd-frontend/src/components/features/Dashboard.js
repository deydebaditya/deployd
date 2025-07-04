import React, { useState } from 'react';
import { Code, GitBranch, Layers, Plus, Search } from 'lucide-react';

import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

function ApplicationListItem({ app, onViewDetails }) {
    const languageColors = { Java: 'bg-grape/20 text-grape', Golang: 'bg-sky/20 text-sky' };
    return (
        <li className="bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 rounded-lg border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg"><Code className="h-6 w-6 text-slate-600 dark:text-slate-300" /></div>
                <div>
                    <p className="font-semibold text-lg text-slate-900 dark:text-white">{app.appName}</p>
                    <a href={app.gitUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center space-x-1"><GitBranch className="h-4 w-4" /><span>{app.gitUrl.replace('https://', '')}</span></a>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${languageColors[app.language]}`}>{app.language}</span>
                <Button onClick={() => onViewDetails(app)}>View Details</Button>
            </div>
        </li>
    );
}

function Dashboard({ onViewDetails, onOnboardRequest }) {
    const { applications, isLoading } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredApps = applications.filter(app => app.appName.toLowerCase().includes(searchTerm.toLowerCase()));

    const renderEmptyState = () => {
        if (isLoading) return null;
        if (searchTerm && filteredApps.length === 0) {
            return (
                <Card className="text-center py-12 sm:py-16">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
                        <Search className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold text-slate-900 dark:text-white">No Results Found</h3>
                    <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
                        We couldn't find any applications matching "<span className="font-semibold text-slate-800 dark:text-slate-200">{searchTerm}</span>".
                    </p>
                    <div className="mt-6">
                        <Button onClick={() => onOnboardRequest(searchTerm)}>
                            <Plus className="h-5 w-5 -ml-1 mr-2" />
                            Onboard a new application named "{searchTerm}"
                        </Button>
                    </div>
                </Card>
            );
        }
        if (!searchTerm && filteredApps.length === 0) {
            return (
                <Card className="text-center py-12 sm:py-16">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
                        <Layers className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold text-slate-900 dark:text-white">Welcome to Deployd!</h3>
                    <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
                        It looks like you haven't onboarded any applications yet. Let's get started.
                    </p>
                    <div className="mt-6">
                        <Button onClick={() => onOnboardRequest(null)}>
                            <Plus className="h-5 w-5 -ml-1 mr-2" />
                            Onboard Your First Application
                        </Button>
                    </div>
                </Card>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Applications Dashboard</h1>
            <Input name="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search for an application..." icon={<Search className="h-5 w-5 text-slate-400" />} />
            {isLoading && <p>Loading applications...</p>}
            {!isLoading && filteredApps.length > 0 && (
                <ul className="space-y-4">{filteredApps.map(app => <ApplicationListItem key={app.id} app={app} onViewDetails={onViewDetails} />)}</ul>
            )}
            {renderEmptyState()}
        </div>
    );
}

export default Dashboard;
