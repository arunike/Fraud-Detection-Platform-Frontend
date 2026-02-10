import React from 'react';
import { formatRelativeTime } from '../utils/timeFormatter';

interface RecentAlert {
    id: string;
    record_id: number;
    module: string;
    type: string;
    message: string;
    description: string;
    risk_level: string;
    severity: string;
    timestamp: string;
    status: string;
}

interface RecentAlertsTimelineProps {
    alerts: RecentAlert[];
    onAlertClick?: (alert: RecentAlert) => void;
}

const RecentAlertsTimeline: React.FC<RecentAlertsTimelineProps> = ({ alerts, onAlertClick }) => {
    if (!alerts || alerts.length === 0) {
        return (
            <div className="chart-container" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', color: 'var(--gray)' }}>
                No recent alerts
            </div>
        );
    }

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'high':
                return '#ef4444';
            case 'medium':
                return '#f59e0b';
            case 'low':
                return '#10b981';
            default:
                return '#64748b';
        }
    };

    const getModuleIcon = (module: string) => {
        switch (module) {
            case 'aml':
                return '💰';
            case 'credit':
                return '📊';
            case 'insurance':
                return '🛡️';
            case 'market':
                return '📈';
            default:
                return '🔔';
        }
    };

    return (
        <div className="chart-container" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--dark)' }}>
                🚨 Recent Alerts
            </h3>
            <div>
                {alerts.map((alert, index) => (
                    <div
                        key={index}
                        onClick={() => onAlertClick && onAlertClick(alert)}
                        style={{
                            padding: '0.75rem',
                            marginBottom: '0.5rem',
                            borderLeft: `4px solid ${getRiskColor(alert.risk_level)}`,
                            background: '#f8fafc',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.transform = 'translateX(0)';
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>{getModuleIcon(alert.module)}</span>
                                <span style={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: '600', 
                                    textTransform: 'uppercase',
                                    color: getRiskColor(alert.risk_level)
                                }}>
                                    {alert.risk_level} RISK
                                </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {formatRelativeTime(alert.timestamp)}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#334155', paddingLeft: '1.7rem' }}>
                            {alert.description}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', paddingLeft: '1.7rem', marginTop: '0.25rem' }}>
                            Click to view details →
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentAlertsTimeline;
