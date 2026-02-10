import React, { useState, useEffect } from "react";
import { LogOut, Trash2, BarChart3 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { amlAPI } from "../api";
import { fetchModules, getAllModules, ModuleConfig } from "../config/modules";
import AMLTab from "./tabs/AMLTab";
import CreditTab from "./tabs/CreditTab";
import InsuranceTab from "./tabs/InsuranceTab";
import MarketTab from "./tabs/MarketTab";

interface DashboardProps {
    onLogout: () => void;
}

// Dynamic module counts - supports any module with pattern: ${moduleKey}_count
interface ModuleCounts {
    [key: string]: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const moduleParam = searchParams.get("module");
    const highlightParam = searchParams.get("highlight");
    
    // Component mapping for each module
    const componentMap: Record<string, React.ComponentType<any>> = {
        aml: AMLTab,
        credit: CreditTab,
        insurance: InsuranceTab,
        market: MarketTab
    };
    
    const [modules, setModules] = useState<ModuleConfig[]>(getAllModules());
    const validModuleKeys = modules.map(m => m.key);
    const defaultModule = validModuleKeys[0] || 'aml';
    
    const [activeTab, setActiveTab] = useState(moduleParam || defaultModule);
    const [moduleCounts, setModuleCounts] = useState<ModuleCounts | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Fetch modules from backend on mount
    useEffect(() => {
        const loadModules = async () => {
            const fetchedModules = await fetchModules();
            setModules(fetchedModules);
        };
        loadModules();
    }, []);

    useEffect(() => {
        if (moduleParam && validModuleKeys.includes(moduleParam)) {
            setActiveTab(moduleParam);
        }
    }, [moduleParam, validModuleKeys]);

    useEffect(() => {
        loadModuleCounts();
    }, [refreshKey]);

    const loadModuleCounts = async () => {
        try {
            const response = await amlAPI.getStatistics();
            if (response.data.totals) {
                setModuleCounts({
                    aml_count: response.data.totals.aml_count,
                    credit_count: response.data.totals.credit_count,
                    insurance_count: response.data.totals.insurance_count,
                    market_count: response.data.totals.market_count,
                });
            }
        } catch (error) {
            console.error("Failed to load module counts:", error);
        }
    };

    const handleClearHistory = async () => {
        try {
            await amlAPI.clearHistory();
            setRefreshKey((prev) => prev + 1);
            setShowConfirmModal(false);
        } catch (error) {
            console.error("Failed to clear history:", error);
            alert("Failed to clear history");
        }
    };

    const handleUpdate = () => {
        loadModuleCounts();
    };

    // Build tabs dynamically from module config
    const tabs = modules.map(module => ({
        id: module.key,
        label: `${module.icon} ${module.displayName}`,
        component: componentMap[module.key]
    })).filter(tab => tab.component !== undefined); // Only include tabs with components

    const ActiveComponent = tabs.find((t) => t.id === activeTab)?.component;

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
                        onClick={() => navigate("/analytics")}
                        className="btn"
                        style={{
                            background: "var(--secondary)",
                            color: "white",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        <BarChart3 size={20} />
                        Analytics
                    </button>
                    <button
                        onClick={() => setShowConfirmModal(true)}
                        className="btn"
                        style={{
                            background: "var(--danger)",
                            color: "white",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        <Trash2 size={20} />
                        Clear History
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

            <div className={"container"}>
                {/* Fraud Detection Modules */}
                <div className="module-section" style={{ marginTop: "2rem" }}>
                    {/* Section Header - Separated */}
                    <div className="section-header">
                        <h2 style={{ 
                            fontSize: '1.75rem', 
                            fontWeight: '700', 
                            color: 'var(--dark)',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            🔍 Fraud Detection Modules
                        </h2>
                        <p style={{ color: 'var(--gray)', fontSize: '1rem', margin: 0 }}>
                            Select a module to analyze transactions and submit data for fraud detection
                        </p>
                    </div>

                    {/* Tab Navigation - Separated */}
                    <div className="tab-navigation">
                        <div className="tab-list">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`tab ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                    {moduleCounts && (
                                        <span
                                            style={{
                                                marginLeft: "0.5rem",
                                                fontSize: "0.8em",
                                                background:
                                                    activeTab === tab.id
                                                        ? "rgba(255,255,255,0.3)"
                                                        : "rgba(102, 126, 234, 0.1)",
                                                color:
                                                    activeTab === tab.id
                                                        ? "white"
                                                        : "var(--primary)",
                                                padding: "0.2rem 0.6rem",
                                                borderRadius: "999px",
                                                fontWeight: "bold",
                                                minWidth: "24px",
                                                textAlign: "center",
                                                display: "inline-block",
                                            }}
                                        >
                                            {moduleCounts?.[`${tab.id}_count`] ?? 0}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content - Separated */}
                    <div className="tab-body">
                        {ActiveComponent && (
                            <ActiveComponent
                                key={`${activeTab}-${refreshKey}`}
                                onUpdate={handleUpdate}
                                highlightId={highlightParam ? parseInt(highlightParam) : undefined}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        className="card"
                        style={{
                            maxWidth: "400px",
                            width: "100%",
                            padding: "2rem",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: "1.25rem",
                                fontWeight: "bold",
                                marginBottom: "1rem",
                            }}
                        >
                            Confirm Action
                        </h3>
                        <p
                            style={{
                                color: "var(--gray)",
                                marginBottom: "2rem",
                            }}
                        >
                            Are you sure you want to clear all detection
                            history? This action cannot be undone.
                        </p>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: "1rem",
                                justifyContent: "flex-end",
                            }}
                        >
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="btn btn-secondary"
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    textAlign: "center",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearHistory}
                                className="btn"
                                style={{
                                    flex: 1,
                                    background: "var(--danger)",
                                    color: "white",
                                    border: "none",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    textAlign: "center",
                                }}
                            >
                                Yes, Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
