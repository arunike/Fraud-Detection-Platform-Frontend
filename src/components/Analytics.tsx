import React, { useState, useEffect } from "react";
import { LogOut, BarChart3, Shield, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { amlAPI } from "../api";
import { fetchModules, ModuleConfig } from "../config/modules";
import StatisticsCard from "./StatisticsCard";
import DetectionTrendsChart from "./charts/DetectionTrendsChart";
import RiskDistributionChart from "./charts/RiskDistributionChart";
import ModuleActivityChart from "./charts/ModuleActivityChart";
import RecentAlertsTimeline from "./RecentAlertsTimeline";
import { getUserTimeZone, getTimeZoneOffset } from "../utils/timeFormatter";

interface AnalyticsProps {
    onLogout: () => void;
}

interface Statistics {
    totals: {
        total_detections: number;
        total_flagged: number;
        aml_count: number;
        credit_count: number;
        insurance_count: number;
        market_count: number;
    };
    trends: {
        daily: Array<{
            date: string;
            aml: number;
            credit: number;
            insurance: number;
            market: number;
            total: number;
        }>;
    };
    risk_distribution: {
        low: number;
        medium: number;
        high: number;
    };
    recent_alerts: Array<{
        id: number;
        module: string;
        timestamp: string;
        risk_level: string;
        description: string;
    }>;
}

const Analytics: React.FC<AnalyticsProps> = ({ onLogout }) => {
    const navigate = useNavigate();
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [modules, setModules] = useState<ModuleConfig[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStatistics();
        loadModules();
        // Auto-refresh every 30 seconds
        const interval = setInterval(loadStatistics, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadModules = async () => {
        const fetchedModules = await fetchModules();
        setModules(fetchedModules);
    };

    const loadStatistics = async () => {
        try {
            setLoading(true);
            const response = await amlAPI.getStatistics();
            setStatistics(response.data);
        } catch (error) {
            console.error("Failed to load statistics:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateDetectionRate = () => {
        if (!statistics) return 0;
        const total = statistics.totals.total_detections;
        const flagged = statistics.totals.total_flagged;
        return total > 0 ? ((flagged / total) * 100).toFixed(1) : 0;
    };

    const calculateAverageRisk = () => {
        if (!statistics) return 0;
        const dist = statistics.risk_distribution;
        const total = dist.low + dist.medium + dist.high;
        if (total === 0) return 0;
        // Weighted average: low=0.2, medium=0.5, high=0.8
        const weighted = (dist.low * 0.2 + dist.medium * 0.5 + dist.high * 0.8) / total;
        return (weighted * 100).toFixed(0);
    };

    const handleAlertClick = (module: string) => {
        navigate(`/detection?module=${module}`);
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--light)" }}>
            {/* Header */}
            <div
                style={{
                    background: "white",
                    borderBottom: "1px solid #e2e8f0",
                    padding: "1rem 2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h1
                    className="gradient-text"
                    style={{ fontSize: "1.75rem", fontWeight: "bold" }}
                >
                    🏦 Fraud Detection Platform
                </h1>
                <div
                    style={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                    }}
                >
                    <button
                        onClick={() => navigate("/detection")}
                        className="btn"
                        style={{
                            background: "var(--primary)",
                            color: "white",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        <Shield size={20} />
                        Detection Modules
                    </button>
                    <button
                        onClick={onLogout}
                        className="btn btn-secondary"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </div>

            <div className="container">
                {/* Page Header */}
                <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                        <BarChart3 size={32} style={{ color: "var(--primary)" }} />
                        <h2 style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--dark)" }}>
                            Analytics Dashboard
                        </h2>
                    </div>
                    <p style={{ color: "var(--gray)", fontSize: "1rem" }}>
                        Real-time fraud detection analytics and insights across all modules
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                        <div>Loading analytics...</div>
                    </div>
                )}

                {/* Analytics Content */}
                {!loading && statistics && statistics.totals && (
                    <div>
                        {/* Statistics Cards */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                gap: "1.5rem",
                                marginBottom: "2rem",
                            }}
                        >
                            <StatisticsCard
                                title="Total Detections"
                                value={statistics.totals.total_detections}
                                icon="activity"
                                color="#8b5cf6"
                            />
                            <StatisticsCard
                                title="Flagged Items"
                                value={statistics.totals.total_flagged}
                                icon="alert"
                                color="#ef4444"
                            />
                            <StatisticsCard
                                title="Detection Rate"
                                value={`${calculateDetectionRate()}%`}
                                icon="trending-up"
                                color="#3b82f6"
                            />
                            <StatisticsCard
                                title="Avg Risk Score"
                                value={`${calculateAverageRisk()}%`}
                                icon="trending-down"
                                color="#f59e0b"
                            />
                        </div>

                        {/* Charts Grid */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                                gap: "1.5rem",
                                marginBottom: "2rem",
                            }}
                        >
                            <DetectionTrendsChart data={statistics.trends.daily} modules={modules} />
                            <RiskDistributionChart data={statistics.risk_distribution} />
                            <ModuleActivityChart data={statistics.totals} modules={modules} />
                            <RecentAlertsTimeline
                                alerts={statistics.recent_alerts}
                                onAlertClick={handleAlertClick}
                            />
                        </div>

                        {/* Module Breakdown */}
                        <div
                            style={{
                                background: "white",
                                padding: "2rem",
                                borderRadius: "12px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                        >
                            <h3 style={{ fontSize: "1.3rem", fontWeight: "600", marginBottom: "1.5rem", color: "var(--dark)" }}>
                                📊 Module Detection Summary
                            </h3>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                    gap: "1.5rem",
                                }}
                            >
                                <div style={{ textAlign: "center", padding: "1rem" }}>
                                    <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>💰</div>
                                    <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#8b5cf6" }}>
                                        {statistics.totals.aml_count}
                                    </div>
                                    <div style={{ color: "var(--gray)", fontSize: "0.9rem" }}>AML Detections</div>
                                </div>
                                <div style={{ textAlign: "center", padding: "1rem" }}>
                                    <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📊</div>
                                    <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6" }}>
                                        {statistics.totals.credit_count}
                                    </div>
                                    <div style={{ color: "var(--gray)", fontSize: "0.9rem" }}>Credit Risk</div>
                                </div>
                                <div style={{ textAlign: "center", padding: "1rem" }}>
                                    <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🛡️</div>
                                    <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#10b981" }}>
                                        {statistics.totals.insurance_count}
                                    </div>
                                    <div style={{ color: "var(--gray)", fontSize: "0.9rem" }}>Insurance Fraud</div>
                                </div>
                                <div style={{ textAlign: "center", padding: "1rem" }}>
                                    <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📈</div>
                                    <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f59e0b" }}>
                                        {statistics.totals.market_count}
                                    </div>
                                    <div style={{ color: "var(--gray)", fontSize: "0.9rem" }}>Market Manipulation</div>
                                </div>
                            </div>
                        </div>

                        {/* Timezone Info */}
                        <div 
                            style={{ 
                                marginTop: "2rem",
                                padding: "1rem",
                                background: "#f8f9fa",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem",
                                color: "var(--gray)",
                                fontSize: "0.9rem"
                            }}
                        >
                            <Clock size={16} />
                            <span>All times are displayed in your local timezone: {getUserTimeZone()} ({getTimeZoneOffset()})</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
