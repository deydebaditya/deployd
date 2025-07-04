import React, { useState, useEffect, createContext, useContext } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const [applications, setApplications] = useState([]);
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(false);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('http://localhost:8080/auth/status', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                if (data.loggedIn && data.provider && data.username) {
                    setConnections([{ provider: data.provider, username: data.username, connected: true }]);
                } else {
                    setConnections([]);
                }
            } else {
                setConnections([]);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setConnections([]);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const addApplication = (appData) => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setApplications(prev => [...prev, { ...appData, id: prev.length + 1, status: 'Provisioning' }]);
            setLoading(false);
        }, 1500);
    };

    const logout = async (providerId) => {
        try {
            await fetch(`http://localhost:8080/auth/${providerId}/logout`, { method: 'POST', credentials: 'include' });
            setConnections(prev => prev.filter(conn => conn.provider !== providerId));
        } catch (error) {
            console.error(`Logout from ${providerId} failed`, error);
        }
    };

    const value = {
        applications,
        addApplication,
        loading,
        connections,
        checkAuthStatus,
        logout,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
