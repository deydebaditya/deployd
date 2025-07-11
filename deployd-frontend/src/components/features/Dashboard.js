import React, { useState } from 'react';
import { Search, Plus, ExternalLink, Trash2, GitBranch, Code, Layers } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import Input from '../ui/Input';
import ConfirmationModal from '../ui/ConfirmationModal';
import ProgressBar from '../ui/ProgressBar';

const Dashboard = ({ onOnboardRequest, onViewDetails }) => {
    const { applications, setApplications, isLoading } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [deleteStep, setDeleteStep] = useState(1);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteProgress, setDeleteProgress] = useState(0);

    const filteredApplications = (applications || []).filter(app =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (app) => {
        setSelectedApp(app);
        setShowDeleteModal(true);
        setDeleteStep(1);
    };

    const handleConfirmDelete = async () => {
        if (deleteStep === 1) {
            setDeleteStep(2);
        } else {
            setShowDeleteModal(false);
            setIsDeleting(true);

            const timer = setInterval(() => {
                setDeleteProgress(prev => (prev >= 90 ? 90 : prev + 10));
            }, 500);

            try {
                const response = await fetch(`http://localhost:8080/api/applications/${selectedApp.ID}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });

                clearInterval(timer);
                setDeleteProgress(100);

                if (response.ok) {
                    setApplications(prevApps => prevApps.filter(app => app.ID !== selectedApp.ID));
                } else {
                    console.error('Failed to delete application');
                    // TODO: Show an error notification to the user
                }
            } catch (error) {
                console.error('Error deleting application:', error);
                clearInterval(timer);
                // TODO: Show an error notification to the user
            }

            setTimeout(() => {
                setIsDeleting(false);
                setDeleteProgress(0);
                setSelectedApp(null);
            }, 1000);
        }
    };

    const handleCloseModal = () => {
        setShowDeleteModal(false);
        setSelectedApp(null);
        setDeleteStep(1);
    };

    const renderEmptyState = () => {
        if (isLoading) return null;
        if (searchTerm && filteredApplications.length === 0) {
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
        if (!searchTerm && filteredApplications.length === 0) {
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
        <>
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
                title={deleteStep === 1 ? "Confirm Deletion" : "Final Confirmation"}
            >
                {deleteStep === 1 ? (
                    <p>Are you sure you want to delete the application "{selectedApp?.name}"? This will permanently delete the Git repository and all its code. This action cannot be undone.</p>
                ) : (
                    <p>This is your final confirmation. Deleting "{selectedApp?.name}" is irreversible. Are you absolutely sure?</p>
                )}
            </ConfirmationModal>

            {isDeleting && selectedApp && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Deleting {selectedApp.name}...</h3>
                        <ProgressBar progress={deleteProgress} />
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Applications Dashboard</h1>
                <Input name="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search for an application..." icon={<Search className="h-5 w-5 text-slate-400" />} />
                {isLoading && <p>Loading applications...</p>}
                {!isLoading && filteredApplications.length > 0 && (
                    <ul className="space-y-4">
                        {filteredApplications.map(app => <ApplicationListItem key={app.ID} app={app} onViewDetails={onViewDetails} onDelete={handleDelete} />)}
                    </ul>
                )}
                {renderEmptyState()}
            </div>
        </>
    );
}

function ApplicationListItem({ app, onViewDetails, onDelete }) {
    const { name, git_repo, language = 'Go' } = app;
    const languageColors = { Java: 'bg-red-100 text-red-800', Golang: 'bg-sky-100 text-sky-800', JavaScript: 'bg-yellow-100 text-yellow-800', Python: 'bg-blue-100 text-blue-800' };
    return (
        <li className="bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 rounded-lg border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg"><Code className="h-6 w-6 text-slate-600 dark:text-slate-300" /></div>
                <div>
                    <p className="font-semibold text-lg text-slate-900 dark:text-white">{name}</p>
                    <a href={git_repo} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center space-x-1"><GitBranch className="h-4 w-4" /><span>{git_repo.replace('https://', '')}</span></a>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${languageColors[language] || 'bg-slate-100 text-slate-800'}`}>{language}</span>
                <Button onClick={() => onViewDetails(app)}>View Details</Button>
                <Button variant="destructive" size="icon" onClick={() => onDelete(app)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </li>
    );
}

export default Dashboard;
