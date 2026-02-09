import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ModuleConfig, modulesToRecord } from '../../config/modules';

interface TrendData {
    date: string;
    aml: number;
    credit: number;
    insurance: number;
    market: number;
    total: number;
}

interface DetectionTrendsChartProps {
    data: TrendData[];
    modules?: ModuleConfig[]; // Optional, will use fallback if not provided
}

const DetectionTrendsChart: React.FC<DetectionTrendsChartProps> = ({ data, modules = [] }) => {
    if (!data || data.length === 0) {
        return (
            <div className="chart-container" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', color: 'var(--gray)' }}>
                Loading chart...
            </div>
        );
    }

    // Format date to local date string (avoid timezone conversion issues)
    const formatDate = (dateStr: string) => {
        // Parse YYYY-MM-DD as local date, not UTC
        const parts = dateStr.split('-');
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const day = parseInt(parts[2]);
        const date = new Date(year, month, day);
        return `${month + 1}/${day}`;
    };

    // Transform data with formatted dates
    const formattedData = data.map(item => ({
        ...item,
        displayDate: formatDate(item.date),
        originalDate: item.date
    }));

    // Convert modules array to record for lookup
    const moduleConfig = modulesToRecord(modules);

    // Dynamically determine which modules have data
    // Get all keys from data except 'date', 'total', 'displayDate', 'originalDate'
    const dataKeys = Object.keys(data[0] || {}).filter(
        key => !['date', 'total', 'displayDate', 'originalDate'].includes(key)
    );

    // Get modules that have data and are configured
    const activeModules = dataKeys
        .filter(key => {
            const config = moduleConfig[key];
            const hasData = data.some(item => item[key] > 0);
            return config && hasData;
        })
        .map(key => moduleConfig[key]);

    return (
        <div className="chart-container" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--dark)' }}>
                📈 Detection Trends (7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                        dataKey="displayDate" 
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
                        labelFormatter={(value) => {
                            const item = formattedData.find(d => d.displayDate === value);
                            if (item) {
                                const parts = item.originalDate.split('-');
                                const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                                return date.toLocaleDateString(undefined, { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                });
                            }
                            return value;
                        }}
                    />
                    <Legend />
                    {activeModules.map(module => (
                        <Line 
                            key={module.key}
                            type="monotone" 
                            dataKey={module.key} 
                            stroke={module.color} 
                            strokeWidth={2} 
                            name={module.name} 
                            dot={{ r: 4 }} 
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DetectionTrendsChart;
