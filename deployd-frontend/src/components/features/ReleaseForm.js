import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';

function ReleaseForm({ app, env, onBack, setReleases }) {
    const [releaseName, setReleaseName] = useState(`${app.appName}-${env.toLowerCase()}-release-1`);

    const handleConfirmAndCreate = () => {
        const newRelease = {
            name: releaseName,
            gitUrl: app.gitUrl,
        };

        setReleases(prev => {
            const appReleases = prev[app.appName] || {};
            const envReleases = appReleases[env] || [];
            return {
                ...prev,
                [app.appName]: {
                    ...appReleases,
                    [env]: [...envReleases, newRelease]
                }
            };
        });

        onBack(); // Go back to the application detail page
    };

    return (
        <div className="animate-fade-in">
            <Button onClick={onBack} variant="secondary" className="mb-6"><ArrowLeft className="h-4 w-4" /><span>Back to Application</span></Button>
            <Card>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Release for {env}</h2>
                <p className="text-sm text-slate-500">Application: {app.appName}</p>
            </Card>

            <div className="mt-8 space-y-6">
                <Card>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Release Details</h3>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="release-name">Release Name</Label>
                            <Input 
                                id="release-name"
                                type="text" 
                                value={releaseName} 
                                onChange={(e) => setReleaseName(e.target.value)} 
                            />
                        </div>
                    </div>
                </Card>

                {/* Add other form fields from the wireframe here as needed */}

            </div>

            <div className="mt-8 flex justify-end">
                <Button size="lg" onClick={handleConfirmAndCreate}><Save className="h-5 w-5 mr-2" />Confirm and Create</Button>
            </div>
        </div>
    );
}

export default ReleaseForm;
