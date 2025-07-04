import React, { useState, useContext } from 'react';
import { Rocket, PlusCircle, Sliders, FileText, Key, User, MoreVertical, ShieldCheck, Github } from 'lucide-react';

import { AppProvider, useAppContext } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';

import OnboardingForm from './components/features/OnboardingForm';
import Dashboard from './components/features/Dashboard';
import ApplicationDetail from './components/features/ApplicationDetail';
import AdminDashboard from './components/features/AdminDashboard';
import HealthCheck from './components/features/HealthCheck';
import GitAccounts from './components/features/GitAccounts';
import ThemeToggle from './components/ui/ThemeToggle';
import Button from './components/ui/Button';
import DropdownMenu from './components/ui/DropdownMenu';

// --- Layout Components ---

const Header = ({ onNavigate }) => {
    return (
        <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center sticky top-0 z-40">
            <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary rounded-lg flex items-center justify-center">
                    <Rocket className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">Deployd</h1>
            </div>
            <div className="flex items-center space-x-4">
                <Button onClick={() => onNavigate('onboarding')}>
                    <PlusCircle className="h-5 w-5 mr-2" />
                    New Application
                </Button>
                <DropdownMenu
                    trigger={
                        <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                            <MoreVertical className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </button>
                    }
                >
                    <ThemeToggle />
                    <button
                        onClick={() => onNavigate('healthCheck')}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                    >
                        <ShieldCheck className="h-5 w-5" />
                        <span>Health Check</span>
                    </button>
                </DropdownMenu>
            </div>
        </header>
    );
};

const Sidebar = ({ currentView, onNavigate }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Sliders },
        { id: 'onboarding', label: 'Onboard App', icon: PlusCircle },
        { id: 'git-accounts', label: 'Git Accounts', icon: Github },
        { id: 'docs', label: 'Documentation', icon: FileText },
        { id: 'secrets', label: 'Secrets', icon: Key },
        { id: 'admin', label: 'Admin', icon: User },
    ];

    const NavLink = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                currentView === id
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            }`}
        >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
        </button>
    );

    return (
        <aside className="w-64 bg-white/50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between">
            <nav className="space-y-2">
                {navItems.map(item => <NavLink key={item.id} {...item} />)}
            </nav>
            <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                <p>&copy; {new Date().getFullYear()} Deployd</p>
                <p>Alpha v0.1.0</p>
            </div>
        </aside>
    );
};

const PageContent = ({ view, selectedApp, onNavigate, setOnboardingData, onboardingData }) => {
    switch (view) {
        case 'onboarding':
            return <OnboardingForm onFinish={() => onNavigate('dashboard')} initialData={onboardingData} />;
        case 'appDetail':
            return <ApplicationDetail app={selectedApp} onBack={() => onNavigate('dashboard')} />;
        case 'git-accounts':
            return <GitAccounts />;
        case 'admin':
            return <AdminDashboard />;
        case 'healthCheck':
            return <HealthCheck />;
        case 'dashboard':
        default:
            return <Dashboard
                onViewDetails={(app) => onNavigate('appDetail', app)}
                onOnboardRequest={(appName) => {
                    setOnboardingData(appName ? { appName } : null);
                    onNavigate('onboarding');
                }}
            />;
    }
};

// --- App Shell ---

function App() {
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedApp, setSelectedApp] = useState(null);
    const [onboardingData, setOnboardingData] = useState(null);

    const handleNavigate = (view, data = null) => {
        setCurrentView(view);
        setSelectedApp(data);
        if (view !== 'onboarding') {
            setOnboardingData(null);
        }
    };

    return (
        <ThemeProvider>
            <AppProvider>
                <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
                    <Header onNavigate={handleNavigate} />
                    <div className="flex" style={{ height: 'calc(100vh - 65px)' }}>
                        <Sidebar currentView={currentView} onNavigate={handleNavigate} />
                        <main className="flex-1 p-8 overflow-y-auto">
                            <PageContent
                                view={currentView}
                                selectedApp={selectedApp}
                                onNavigate={handleNavigate}
                                onboardingData={onboardingData}
                                setOnboardingData={setOnboardingData}
                            />
                        </main>
                    </div>
                </div>
            </AppProvider>
        </ThemeProvider>
    );
}

export default App;
