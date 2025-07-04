import React from 'react';
import { Cloud, Server } from 'lucide-react';
import Card from '../ui/Card';

function AdminDashboard() {
    return (
        <Card>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Admin Configuration</h2>
            <div className="space-y-8">
                <div><h3 className="text-lg font-semibold flex items-center space-x-2"><Cloud className="text-sky"/><span>Kubernetes Clusters</span></h3><div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 mt-2"><p className="font-mono text-sm">aws-prod-cluster-1 (EKS)</p></div></div>
                <div><h3 className="text-lg font-semibold flex items-center space-x-2"><Server className="text-mint"/><span>Image Artifactories</span></h3><div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 mt-2"><p className="font-mono text-sm">your-org.dkr.ecr.us-east-1.amazonaws.com</p></div></div>
            </div>
        </Card>
    );
}

export default AdminDashboard;
