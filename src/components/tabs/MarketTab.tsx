import React, { useState, useEffect } from "react";
import { TrendingUp, Dice5 } from "lucide-react";
import { marketAPI } from "../../api";
import { formatLocalDateTime } from "../../utils/timeFormatter";

function MarketTab({ onUpdate }) {
    const [formData, setFormData] = useState({
        symbol: "",
        price: "",
        volume: "",
        timestamp: new Date().toISOString().slice(0, 16),
    });
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const response = await marketAPI.list({ page_size: 10 });
            setHistory(response.data.results || []);
        } catch (err) {
            console.error("Failed to load history:", err);
        }
    };

    const generateTestData = () => {
        const symbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "META"];
        const suspicious = Math.random() > 0.5;

        setFormData({
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            price: (Math.random() * 500 + 50).toFixed(2),
            volume: suspicious
                ? Math.floor(Math.random() * 10000000 + 5000000)
                : Math.floor(Math.random() * 1000000 + 100000),
            timestamp: new Date().toISOString().slice(0, 16),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await marketAPI.detect(formData);
            setResult(response.data);
            await loadHistory();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.response?.data?.detail || "Detection failed");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toUpperCase()) {
            case "CRITICAL":
                return "var(--danger)";
            case "HIGH":
                return "#ff8800";
            case "MEDIUM":
                return "var(--warning)";
            case "LOW":
                return "var(--info)";
            default:
                return "var(--success)";
        }
    };

    return (
        <div>
            <h2
                style={{
                    marginBottom: "1.5rem",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                }}
            >
                📈 Market Manipulation Detection
            </h2>

            <div className="grid grid-2">
                {/* Form */}
                <div className="card">
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "1.5rem",
                        }}
                    >
                        <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>
                            Trading Activity
                        </h3>
                        <button
                            type="button"
                            onClick={generateTestData}
                            className="btn btn-secondary"
                        >
                            <Dice5 size={18} />
                            Generate Test Data
                        </button>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Stock Symbol</label>
                            <input
                                type="text"
                                name="symbol"
                                className="input"
                                value={formData.symbol}
                                onChange={handleChange}
                                placeholder="e.g., AAPL"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Price</label>
                            <input
                                type="number"
                                name="price"
                                className="input"
                                value={formData.price}
                                onChange={handleChange}
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Volume</label>
                            <input
                                type="number"
                                name="volume"
                                className="input"
                                value={formData.volume}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Timestamp</label>
                            <input
                                type="datetime-local"
                                name="timestamp"
                                className="input"
                                value={formData.timestamp}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: "100%" }}
                            disabled={loading}
                        >
                            {loading ? "Analyzing..." : "Run Market Analysis"}
                        </button>
                    </form>
                </div>

                {/* Result */}
                <div className="card">
                    <h3
                        style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            marginBottom: "1.5rem",
                        }}
                    >
                        Detection Result
                    </h3>

                    {result ? (
                        <div>
                            <div
                                style={{
                                    padding: "1.5rem",
                                    borderRadius: "8px",
                                    background:
                                        result.alerts &&
                                        result.alerts.length > 0
                                            ? "var(--warning)"
                                            : "var(--success)",
                                    color: "white",
                                    textAlign: "center",
                                    marginBottom: "1rem",
                                }}
                            >
                                <TrendingUp size={48} />
                                <h4
                                    style={{
                                        marginTop: "1rem",
                                        fontSize: "1.5rem",
                                    }}
                                >
                                    {result.alerts && result.alerts.length > 0
                                        ? "SUSPICIOUS ACTIVITY"
                                        : "Normal Trading Activity"}
                                </h4>
                                <p
                                    style={{
                                        fontSize: "1.25rem",
                                        marginTop: "0.5rem",
                                    }}
                                >
                                    {result.alerts ? result.alerts.length : 0}{" "}
                                    Alert(s) Detected
                                </p>
                            </div>

                            {result.alerts && result.alerts.length > 0 && (
                                <div>
                                    <h4
                                        style={{
                                            fontWeight: "600",
                                            marginBottom: "1rem",
                                        }}
                                    >
                                        Alerts:
                                    </h4>
                                    {result.alerts.map((alert, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                padding: "1rem",
                                                borderRadius: "8px",
                                                background: getSeverityColor(
                                                    alert.severity,
                                                ),
                                                color: "white",
                                                marginBottom: "0.75rem",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    marginBottom: "0.5rem",
                                                }}
                                            >
                                                <strong>
                                                    {alert.alert_type}
                                                </strong>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        background:
                                                            "rgba(255, 255, 255, 0.3)",
                                                    }}
                                                >
                                                    {alert.severity}
                                                </span>
                                            </div>
                                            <p
                                                style={{
                                                    margin: 0,
                                                    fontSize: "0.9rem",
                                                }}
                                            >
                                                {alert.description}
                                            </p>
                                            {alert.confidence && (
                                                <p
                                                    style={{
                                                        margin: "0.5rem 0 0",
                                                        fontSize: "0.85rem",
                                                        opacity: 0.9,
                                                    }}
                                                >
                                                    Confidence:{" "}
                                                    {(
                                                        alert.confidence * 100
                                                    ).toFixed(1)}
                                                    %
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p
                            style={{
                                color: "var(--gray)",
                                textAlign: "center",
                                padding: "3rem",
                            }}
                        >
                            Submit trading data to see detection results
                        </p>
                    )}
                </div>
            </div>

            {/* History */}
            {history.length > 0 && (
                <div className="card" style={{ marginTop: "1.5rem" }}>
                    <h3
                        style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            marginBottom: "1rem",
                        }}
                    >
                        Recent Alerts
                    </h3>
                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Symbol</th>
                                    <th>Alert Type</th>
                                    <th>Severity</th>
                                    <th>Confidence</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item, idx) => {
                                    // Use the first alert if available, or default values
                                    const firstAlert =
                                        item.alerts && item.alerts.length > 0
                                            ? item.alerts[0]
                                            : null;
                                    const alertType = firstAlert
                                        ? firstAlert.alert_type
                                        : "No Alert";
                                    const severity = firstAlert
                                        ? firstAlert.severity
                                        : "LOW";
                                    const confidence = firstAlert
                                        ? firstAlert.confidence
                                        : 0;

                                    return (
                                        <tr key={idx}>
                                            <td>
                                                <strong>{item.symbol}</strong>
                                            </td>
                                            <td>{alertType}</td>
                                            <td>
                                                <span
                                                    className={`badge badge-${
                                                        severity === "CRITICAL"
                                                            ? "danger"
                                                            : severity ===
                                                                "HIGH"
                                                              ? "danger"
                                                              : severity ===
                                                                  "MEDIUM"
                                                                ? "warning"
                                                                : "success"
                                                    }`}
                                                >
                                                    {severity}
                                                </span>
                                            </td>
                                            <td>
                                                {confidence
                                                    ? (
                                                          confidence * 100
                                                      ).toFixed(1) + "%"
                                                    : "N/A"}
                                            </td>
                                            <td>
                                                {formatLocalDateTime(item.timestamp)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MarketTab;
