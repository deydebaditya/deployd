import React, { useState, useEffect } from 'react';
import { GitBranch, CheckCircle } from 'lucide-react';

import { useAppContext } from '../../context/AppContext';
import { FRAMEWORK_CONFIG, initialFormData } from '../../config/frameworks';
import { GITHUB_CLIENT_ID } from '../../config/oauth';

import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import MockNotification from '../ui/MockNotification';
import ProgressBar from '../ui/ProgressBar';

const ReviewItem = ({ label, value }) => (
    <div className="flex justify-between py-3">
        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
        <dd className="text-sm font-semibold text-slate-900 dark:text-white text-right">{value}</dd>
    </div>
);

function OnboardingForm({ onFinish, initialData }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ ...initialFormData, appName: initialData?.appName || '' });
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const { addApplication, connections, checkAuthStatus, logout } = useAppContext();
    const [progress, setProgress] = useState(0);
    const [timedOut, setTimedOut] = useState(false);

    

    const handleGitConnect = () => {
        const oauthUrls = {
            GitHub: `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo,user,delete_repo`,
            GitLab: `https://gitlab.com/oauth/authorize?client_id=YOUR_GITLAB_CLIENT_ID&response_type=code&scope=api&redirect_uri=http://localhost:8080/auth/gitlab/callback`,
            Bitbucket: `https://bitbucket.org/site/oauth2/authorize?client_id=YOUR_BITBUCKET_CLIENT_ID&response_type=code`
        };
        const url = oauthUrls[formData.gitProvider];
        const authWindow = window.open(url, '_blank', 'width=600,height=700,popup');

        const handleAuthMessage = (event) => {
            if (event.origin !== 'http://localhost:8080') {
                return;
            }
            if (event.data && event.data.source === 'oauth-callback-success') {
                checkAuthStatus();
                if (authWindow) authWindow.close();
                window.removeEventListener('message', handleAuthMessage);
            }
        };
        window.addEventListener('message', handleAuthMessage);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const { language, appType, serviceType } = formData;
        let newValues = {};

        if (language === 'Java') {
            newValues.javaVersion = FRAMEWORK_CONFIG.Java.versions[0];
            newValues.buildSystem = FRAMEWORK_CONFIG.Java.buildSystems[0];
            if (appType === 'Service') {
                if (serviceType === 'HTTP REST') {
                    const framework = Object.keys(FRAMEWORK_CONFIG.Java.Service['HTTP REST'])[0];
                    newValues.framework = framework;
                    newValues.frameworkVersion = FRAMEWORK_CONFIG.Java.Service['HTTP REST'][framework][0];
                } else if (serviceType === 'gRPC') {
                    const grpcFramework = Object.keys(FRAMEWORK_CONFIG.Java.Service['gRPC'])[0];
                    newValues.grpcFramework = grpcFramework;
                    newValues.grpcVersion = FRAMEWORK_CONFIG.Java.Service['gRPC'][grpcFramework][0];
                }
            }
        } else if (language === 'Golang') {
            newValues.goVersion = FRAMEWORK_CONFIG.Golang.versions[0];
            if (appType === 'Service') {
                if (serviceType === 'HTTP REST') {
                    const framework = Object.keys(FRAMEWORK_CONFIG.Golang.Service['HTTP REST'])[0];
                    newValues.framework = framework;
                    newValues.frameworkVersion = FRAMEWORK_CONFIG.Golang.Service['HTTP REST'][framework][0];
                } else if (serviceType === 'gRPC') {
                    const grpcFramework = Object.keys(FRAMEWORK_CONFIG.Golang.Service['gRPC'])[0];
                    newValues.grpcFramework = grpcFramework;
                    newValues.grpcVersion = FRAMEWORK_CONFIG.Golang.Service['gRPC'][grpcFramework][0];
                }
            }
        }

        setFormData(prev => ({
            ...initialFormData,
            appName: prev.appName,
            language: prev.language,
            appType: prev.appType,
            serviceType: prev.serviceType,
            ...newValues,
            gitProvider: prev.gitProvider,
            repoName: prev.repoName
        }));

    }, [formData.language, formData.appType, formData.serviceType]);

    useEffect(() => {
        const { language, appType, serviceType, framework, grpcFramework } = formData;
        let newValues = {};

        if (appType === 'Service') {
            if (serviceType === 'HTTP REST' && framework) {
                const versions = FRAMEWORK_CONFIG[language]?.Service?.[serviceType]?.[framework] || [];
                if (versions.length > 0) {
                    newValues.frameworkVersion = versions[0];
                }
            } else if (serviceType === 'gRPC' && grpcFramework) {
                const versions = FRAMEWORK_CONFIG[language]?.Service?.[serviceType]?.[grpcFramework] || [];
                if (versions.length > 0) {
                    newValues.grpcVersion = versions[0];
                }
            }
        }

        if(Object.keys(newValues).length > 0) {
            setFormData(prev => ({ ...prev, ...newValues }));
        }
    }, [formData.framework, formData.grpcFramework]);


    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    



    const handleSubmit = async () => {
        const isConnected = connections.some(c => c.provider.toLowerCase() === formData.gitProvider.toLowerCase());
        if (!isConnected) {
            setNotification({ type: 'error', message: 'Please connect your Git provider.' });
            return;
        }
        setIsLoading(true);

        const repoToCreate = formData.repoName || formData.appName.toLowerCase().replace(/\s+/g, '-');

        try {
            const response = await fetch('http://localhost:8080/api/github/create-repo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ repoName: repoToCreate }),
                credentials: 'include',
            });

            const result = await response.json();

            if (response.status === 201) {
                const appData = {
                    name: formData.appName,
                    git_repo: result.html_url,
                    state: 'Active',
                    language: formData.language
                };
                addApplication(appData);
                setNotification({ type: 'success', message: `${formData.appName} onboarded and repository created!` });
                setTimeout(() => onFinish(), 1500);
            } else if (response.status === 409) {
                setNotification({ type: 'error', message: `Repository '${repoToCreate}' already exists. Please choose a different name.` });
            } else {
                console.error('Onboarding Error:', result);
                if (response.status === 422 && result.errors?.[0]?.message.includes('name already exists')) {
                    setNotification({ type: 'error', message: 'Repository name is already taken. Please choose another one.' });
                } else {
                    setNotification({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
                }
            }
        } catch (error) {
            console.error('Onboarding Error:', error);
            setNotification({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
        }

        // Don't set isLoading to false immediately, wait for progress bar or timeout
    };

    const renderTechStack = () => {
        const { language, appType, serviceType, framework, grpcFramework } = formData;
        const langConfig = FRAMEWORK_CONFIG[language];
        const serviceConfig = langConfig?.Service?.[serviceType];

        return (
            <div className="space-y-4">
                <Select name="language" label="Language" value={language} onChange={handleChange} required>
                    <option>Java</option>
                    <option>Golang</option>
                </Select>

                {language === 'Java' && (
                    <>
                        <Select name="javaVersion" label="Java Version" value={formData.javaVersion} onChange={handleChange} required>
                            {langConfig.versions.map(v => <option key={v}>{v}</option>)}
                        </Select>
                        <Select name="buildSystem" label="Build System" value={formData.buildSystem} onChange={handleChange} required>
                            {langConfig.buildSystems.map(bs => <option key={bs}>{bs}</option>)}
                        </Select>
                    </>
                )}

                {language === 'Golang' && (
                    <Select name="goVersion" label="Go Version" value={formData.goVersion} onChange={handleChange} required>
                        {langConfig.versions.map(v => <option key={v}>{v}</option>)}
                    </Select>
                )}

                <Select name="appType" label="Application Type" value={appType} onChange={handleChange} required>
                    <option>Service</option>
                    <option>Worker</option>
                </Select>

                {appType === 'Service' && (
                    <div className="space-y-4 p-4 border-l-4 border-primary/20">
                        <Select name="serviceType" label="Service Type" value={serviceType} onChange={handleChange} required>
                            <option>HTTP REST</option>
                            <option>gRPC</option>
                        </Select>

                        {serviceType === 'HTTP REST' && serviceConfig && (
                            <>
                                <Select name="framework" label="Framework" value={framework} onChange={handleChange} required>
                                    {Object.keys(serviceConfig).map(f => <option key={f}>{f}</option>)}
                                </Select>
                                <Select name="frameworkVersion" label="Framework Version" value={formData.frameworkVersion} onChange={handleChange} required>
                                    {serviceConfig[framework]?.map(v => <option key={v}>{v}</option>)}
                                </Select>
                            </>
                        )}

                        {serviceType === 'gRPC' && serviceConfig && (
                            <>
                                <Select name="grpcFramework" label="Framework" value={grpcFramework} onChange={handleChange} required>
                                    {Object.keys(serviceConfig).map(f => <option key={f}>{f}</option>)}
                                </Select>
                                <Select name="grpcVersion" label="gRPC Version" value={formData.grpcVersion} onChange={handleChange} required>
                                    {serviceConfig[grpcFramework]?.map(v => <option key={v}>{v}</option>)}
                                </Select>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    };

    useEffect(() => {
        if (!isLoading) {
            setProgress(0);
            setTimedOut(false);
            return;
        }

        setTimedOut(false);
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return prev + 10;
            });
        }, 1000);

        const timeout = setTimeout(() => {
            clearInterval(timer);
            if (isLoading) { // Check if still loading after 10s
                setTimedOut(true);
            }
        }, 10000);

        return () => {
            clearInterval(timer);
            clearTimeout(timeout);
        };
    }, [isLoading]);

    const handleTrackInBackground = () => {
        setNotification({ type: 'info', message: 'Onboarding is running in the background. We will notify you upon completion.' });
        onFinish();
    };

    const renderReview = () => {
        const {
            appName,
            repoName,
            language,
            javaVersion,
            goVersion,
            buildSystem,
            appType,
            serviceType,
            framework,
            frameworkVersion,
            grpcFramework,
            grpcVersion,
            gitProvider,
        } = formData;

        const reviewData = {
            'Application Name': appName,
            'Repository Name': repoName || appName.toLowerCase().replace(/\s+/g, '-'),
            'Git Provider': gitProvider,
            'Language': language,
            ...(language === 'Java' && { 'Java Version': javaVersion, 'Build System': buildSystem }),
            ...(language === 'Golang' && { 'Go Version': goVersion }),
            'Application Type': appType,
            ...(appType === 'Service' && { 'Service Type': serviceType }),
            ...(serviceType === 'HTTP REST' && framework && { 'Framework': `${framework} ${frameworkVersion}` }),
            ...(serviceType === 'gRPC' && grpcFramework && { 'gRPC Framework': `${grpcFramework} ${grpcVersion}` }),
        };

        return (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <dl className="divide-y divide-slate-200 dark:divide-slate-700">
                    {Object.entries(reviewData).map(([label, value]) =>
                        value ? <ReviewItem key={label} label={label} value={value} /> : null
                    )}
                </dl>
            </div>
        );
    };

    return (
        <Card>
            {notification && <MockNotification {...notification} onDismiss={() => setNotification(null)} />}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Onboard New Application</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Follow the steps to get your new application up and running.</p>
            
            <div>
                {step === 1 && <div className="space-y-4 animate-fade-in">
                    <Input name="appName" label="Application Name" value={formData.appName} onChange={handleChange} placeholder="e.g., User Authentication Service" required />
                    {renderTechStack()}
                </div>}
                {step === 2 && <div className="space-y-4 animate-fade-in">
                    <Select name="gitProvider" label="Git Provider" value={formData.gitProvider} onChange={handleChange} required>
                        <option>GitHub</option>
                        <option>GitLab</option>
                        <option>Bitbucket</option>
                    </Select>
                    <Input name="repoName" label="Repository Name" value={formData.repoName} onChange={handleChange} placeholder="Defaults to application name" />
                    <div className="pt-2">
                        {(() => {
                            const connection = connections.find(c => c.provider.toLowerCase() === formData.gitProvider.toLowerCase());
                            if (connection) {
                                return (
                                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/50 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="text-sm font-medium text-green-700 dark:text-green-300">Connected as {connection.username}</span>
                                        </div>
                                        <button onClick={() => logout(connection.provider)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white">Disconnect</button>
                                    </div>
                                );
                            } else {
                                return (
                                    <Button onClick={handleGitConnect} disabled={!formData.gitProvider} className="w-full">
                                        Connect to {formData.gitProvider || 'Git Provider'}
                                    </Button>
                                );
                            }
                        })()}
                    </div>
                </div>}
                {step === 3 && !isLoading && <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Review your configuration</h3>
                    {renderReview()}
                </div>}
                {isLoading && (
                    <div className="space-y-4 animate-fade-in text-center">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Onboarding in progress...</h3>
                        <ProgressBar progress={progress} />
                        <p className="text-sm text-slate-500 dark:text-slate-400">Creating repository and setting up your application.</p>
                        {timedOut && (
                            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg">
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">Onboarding is taking longer than expected.</p>
                                <Button onClick={handleTrackInBackground} variant="secondary" className="mt-2">Track in Background</Button>
                            </div>
                        )}
                    </div>
                )}
                <div className="mt-8 flex justify-between">
                    {step > 1 ? <Button onClick={handleBack} variant="secondary" type="button">Back</Button> : <div />}
                    {step < 3 && <Button onClick={handleNext} disabled={step === 2 && !connections.some(c => c.provider.toLowerCase() === formData.gitProvider.toLowerCase())} type="button">Next</Button>}
                    {step === 3 && (
                        <Button onClick={handleSubmit} disabled={isLoading} type="button">
                            {isLoading ? 'Onboarding...' : 'Confirm & Onboard'}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}

export default OnboardingForm;
