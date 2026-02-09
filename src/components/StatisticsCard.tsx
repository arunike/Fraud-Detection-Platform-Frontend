import React from 'react';
import { AlertCircle, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface StatisticsCardProps {
    title: string;
    value: string | number;
    icon: 'alert' | 'trending-up' | 'trending-down' | 'activity';
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ title, value, icon, trend, color }) => {
    const getIcon = () => {
        const iconProps = { size: 24, color };
        switch (icon) {
            case 'alert':
                return <AlertCircle {...iconProps} />;
            case 'trending-up':
                return <TrendingUp {...iconProps} />;
            case 'trending-down':
                return <TrendingDown {...iconProps} />;
            case 'activity':
                return <Activity {...iconProps} />;
            default:
                return <Activity {...iconProps} />;
        }
    };

    return (
        <div 
            className="stat-card" 
            style={{ 
                background: 'white', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--gray)', fontWeight: '500' }}>
                    {title}
                </span>
                <div style={{ 
                    background: `${color}15`, 
                    padding: '0.5rem', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {getIcon()}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--dark)' }}>
                    {value}
                </span>
                {trend && (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        fontSize: '0.875rem',
                        color: trend.isPositive ? '#10b981' : '#ef4444',
                        fontWeight: '600'
                    }}>
                        {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatisticsCard;
