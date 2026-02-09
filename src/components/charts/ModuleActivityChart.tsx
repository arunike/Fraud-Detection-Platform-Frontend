import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ModuleConfig, modulesToRecord } from '../../config/modules';

interface ModuleTotals {
    aml_count: number;
    credit_count: number;
    insurance_count: number;
    market_count: number;
}

interface ModuleActivityChartProps {
    data: ModuleTotals;
    modules?: ModuleConfig[]; // Optional, will use fallback if not provided
}

const ModuleActivityChart: React.FC<ModuleActivityChartProps> = ({ data, modules = [] }) => {
    if (!data) {
        return (
            <div className="chart-container" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', color: 'var(--gray)' }}>
                Loading chart...
            </div>
        );
    }

    // Convert modules array to record for lookup
    const moduleConfig = modulesToRecord(modules);

    // Dynamically build chart data from available data and module config
    const chartData = Object.keys(data)
        .filter(key => key.endsWith('_count')) // Get all count fields
        .map(countKey => {
            const moduleKey = countKey.replace('_count', ''); // e.g., 'aml_count' -> 'aml'
            const config = moduleConfig[moduleKey];
            if (!config) return null;
            
            return {
                name: `${config.icon} ${config.name}`,
                detections: data[countKey],
                color: config.color
            };
        })
        .filter(item => item !== null && item.detections > 0); // Only show modules with data

    // If no data, show message
    if (chartData.length === 0) {
        return (
            <div className="chart-container" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', color: 'var(--gray)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--dark)' }}>
                    📊 Module Activity
                </h3>
                <div style={{ padding: '3rem 0' }}>No detection data available</div>
            </div>
        );
    }

    return (
        <div className="chart-container" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--dark)' }}>
                📊 Module Activity
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                        dataKey="name" 
                        stroke="#64748b"
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip 
                        contentStyle={{ 
                            background: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    />
                    <Bar 
                        dataKey="detections" 
                        fill="#8b5cf6"
                        radius={[8, 8, 0, 0]}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ModuleActivityChart;
