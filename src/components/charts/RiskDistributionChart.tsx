import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface RiskDistribution {
    low: number;
    medium: number;
    high: number;
}

interface RiskDistributionChartProps {
    data: RiskDistribution;
}

const COLORS = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444'
};

const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ data }) => {
    if (!data) {
        return (
            <div className="chart-container" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', color: 'var(--gray)' }}>
                Loading chart...
            </div>
        );
    }

    const chartData = [
        { name: 'Low Risk', value: data.low, color: COLORS.low },
        { name: 'Medium Risk', value: data.medium, color: COLORS.medium },
        { name: 'High Risk', value: data.high, color: COLORS.high }
    ].filter(item => item.value > 0); // Only show risk levels with data

    const total = data.low + data.medium + data.high;

    // If no data, show message
    if (total === 0 || chartData.length === 0) {
        return (
            <div className="chart-container" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', color: 'var(--gray)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--dark)' }}>
                    🎯 Risk Distribution
                </h3>
                <div style={{ padding: '3rem 0' }}>No detection data available</div>
            </div>
        );
    }

    return (
        <div className="chart-container" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--dark)' }}>
                🎯 Risk Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ 
                            background: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: number) => [
                            `${value} (${((value / total) * 100).toFixed(1)}%)`,
                            ''
                        ]}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value, entry: any) => {
                            const percentage = ((entry.payload.value / total) * 100).toFixed(1);
                            return `${value}: ${entry.payload.value} (${percentage}%)`;
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--gray)' }}>
                Total Detections: <strong>{total}</strong>
            </div>
        </div>
    );
};

export default RiskDistributionChart;
