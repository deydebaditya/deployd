import React, { useState, useEffect, useCallback } from 'react';
import './HealthCheck.css';

const HealthStatusBar = ({ history }) => (
    <div className="health-status-bar">
        {history.map((status, index) => (
            <div
                key={index}
                className={`health-strip ${status === 'ok' ? 'health-strip--ok' : status === 'error' ? 'health-strip--error' : ''}`}
                title={`Check ${index + 1}: ${status}`}
            />
        ))}
    </div>
);

const HealthCheck = () => {
    const [currentStatus, setCurrentStatus] = useState('checking...');
    const [healthHistory, setHealthHistory] = useState(Array(6).fill('checking'));

    const checkHealth = useCallback(async () => {
        let status = 'error';
        try {
            const response = await fetch('http://localhost:8080/ping');
            if (response.ok) {
                status = 'ok';
            }
        } catch (error) {
            // Status remains 'error'
        } finally {
            setCurrentStatus(status);
            setHealthHistory(prevHistory => {
                const newHistory = [status, ...prevHistory];
                return newHistory.slice(0, 6);
            });
        }
    }, []);

    useEffect(() => {
        // Initial check
        checkHealth();

        // Check every 5 seconds for demonstration (originally 5 minutes)
        const intervalId = setInterval(checkHealth, 5000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, [checkHealth]);

    return (
        <div className="health-check-container">
            <div className="health-check-info">
                <h2 className="health-check-title">Deployd Server Health</h2>
                <p className="health-check-status">
                    Current Status: <span className={currentStatus === 'ok' ? 'status-ok' : 'status-error'}>{currentStatus}</span>
                </p>
            </div>
            <HealthStatusBar history={healthHistory} />
        </div>
    );
};

export default HealthCheck;
