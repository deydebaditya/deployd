import React from 'react';
import { ArrowLeft, Edit, GitBranch, Save } from 'lucide-react';

import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';

function ReleaseDetail({ release, onBack }) {
    return (
        <div className="animate-fade-in">
            <Button onClick={onBack} variant="secondary" className="mb-6"><ArrowLeft className="h-4 w-4" /><span>Back to Application</span></Button>
            <Card>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{release.name}</h2>
                        <a href={release.gitUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center space-x-1 mt-1"><GitBranch className="h-4 w-4" /><span>Go to repo</span></a>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">Update Config Map</Button>
                        <Button>ArgoCD</Button>
                    </div>
                </div>
            </Card>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Health Checks</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Liveness Check</Label>
                            <div className="flex items-center space-x-2">
                                <Input type="text" defaultValue="/livez" className="w-48" />
                                <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Readiness Check</Label>
                            <div className="flex items-center space-x-2">
                                <Input type="text" defaultValue="/readyz" className="w-48" />
                                <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Resources</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>CPU</Label>
                            <div className="flex space-x-2">
                                <Input type="text" defaultValue="1" placeholder="Requests" />
                                <Input type="text" defaultValue="2" placeholder="Limits" />
                            </div>
                        </div>
                        <div>
                            <Label>Memory</Label>
                            <div className="flex space-x-2">
                                <Input type="text" defaultValue="1Gi" placeholder="Requests" />
                                <Input type="text" defaultValue="2Gi" placeholder="Limits" />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Scaling</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Replication Factor</Label>
                            <Input type="number" defaultValue="4" className="w-24" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Autoscaling</Label>
                            <div className="flex items-center space-x-2">
                                <Input type="number" defaultValue="2" placeholder="Min Replicas" />
                                <Input type="number" defaultValue="5" placeholder="Max Replicas" />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Networking</h3>
                    <div className="flex items-center justify-between">
                        <Label>K8s FQDN</Label>
                        <div className="flex items-center space-x-2">
                            <Input type="text" defaultValue={`${release.name}.service.cluster.local`} readOnly />
                            <Input type="number" defaultValue="5433" className="w-24" />
                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mt-8 flex justify-end">
                <Button size="lg"><Save className="h-5 w-5 mr-2" />Save Changes</Button>
            </div>
        </div>
    );
}

export default ReleaseDetail;
