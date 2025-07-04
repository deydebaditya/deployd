import React from 'react';
import { Github, Gitlab, Box } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { GITHUB_CLIENT_ID } from '../../config/oauth';
import Button from '../ui/Button';

const GitAccounts = () => {
    const { connections, logout, checkAuthStatus } = useAppContext();

    const supportedProviders = [
        { id: 'github', name: 'GitHub', icon: Github },
        { id: 'gitlab', name: 'GitLab', icon: Gitlab },
        { id: 'bitbucket', name: 'Bitbucket', icon: Box },
    ];

    const providers = supportedProviders.map(p => {
        const connection = connections.find(c => c.provider === p.id);
        return {
            ...p,
            connected: !!connection,
            username: connection ? connection.username : null,
        };
    });

    const handleConnect = (providerId) => {
        const oauthUrls = {
            github: `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo,user`,
            gitlab: `https://gitlab.com/oauth/authorize?client_id=YOUR_GITLAB_CLIENT_ID&response_type=code&scope=api&redirect_uri=http://localhost:8080/auth/gitlab/callback`,
            bitbucket: `https://bitbucket.org/site/oauth2/authorize?client_id=YOUR_BITBUCKET_CLIENT_ID&response_type=code`
        };

        const url = oauthUrls[providerId.toLowerCase()];
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

    const handleDisconnect = (providerId) => {
        logout(providerId);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">Git Accounts</h1>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                    {providers.map((provider) => (
                        <li key={provider.id} className="p-6 flex items-center justify-between">
                            <div className="flex items-center">
                                <provider.icon className="h-8 w-8 mr-4 text-slate-500" />
                                <span className="text-lg font-medium text-slate-700 dark:text-slate-300">{provider.name}</span>
                            </div>
                            <div>
                                {provider.connected ? (
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Connected as {provider.username}</span>
                                        <Button onClick={() => handleDisconnect(provider.id)} variant="outline">Disconnect</Button>
                                    </div>
                                ) : (
                                    <Button onClick={() => handleConnect(provider.id)}>Connect</Button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default GitAccounts;
