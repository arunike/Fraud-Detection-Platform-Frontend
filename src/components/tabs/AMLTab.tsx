import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Dice5 } from "lucide-react";
import { amlAPI } from "../../api";
import { formatLocalDateTime } from "../../utils/timeFormatter";

function AMLTab({ onUpdate }) {
    const [formData, setFormData] = useState({
        transaction_id: "",
        amount: "",
        sender_id: "",
        receiver_id: "",
        currency: "USD",
        country: "US",
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
            const response = await amlAPI.list({ page_size: 10 });
            setHistory(response.data.results || []);
        } catch (err) {
            console.error("Failed to load history:", err);
        }
    };

    const generateTestData = () => {
        const suspicious = Math.random() > 0.5;
        setFormData({
            transaction_id: `TXN${Date.now()}`,
            amount: suspicious
                ? (Math.random() * 40000 + 10000).toFixed(2)
                : (Math.random() * 5000 + 100).toFixed(2),
            sender_id: `ACCT${Math.floor(Math.random() * 10000)}`,
            receiver_id: `ACCT${Math.floor(Math.random() * 10000)}`,
            currency: "USD",
            country: suspicious
                ? ["CN", "RU", "IR"][Math.floor(Math.random() * 3)]
                : "US",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await amlAPI.detect(formData);
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

    return (
        <div>
            <h2
                style={{
                    marginBottom: "1.5rem",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                }}
            >
                💰 Anti-Money Laundering Detection
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
                            Transaction Details
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
                            <label className="form-label">Transaction ID</label>
                            <input
                                type="text"
                                name="transaction_id"
                                className="input"
                                value={formData.transaction_id}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Amount</label>
                            <input
                                type="number"
                                name="amount"
                                className="input"
                                value={formData.amount}
                                onChange={handleChange}
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Sender ID</label>
                            <input
                                type="text"
                                name="sender_id"
                                className="input"
                                value={formData.sender_id}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Receiver ID</label>
                            <input
                                type="text"
                                name="receiver_id"
                                className="input"
                                value={formData.receiver_id}
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
                            {loading ? "Analyzing..." : "Run AML Detection"}
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
                                    background: result.flagged
                                        ? "var(--danger)"
                                        : "var(--success)",
                                    color: "white",
                                    textAlign: "center",
                                    marginBottom: "1rem",
                                }}
                            >
                                {result.flagged ? (
                                    <AlertTriangle size={48} />
                                ) : (
                                    <CheckCircle size={48} />
                                )}
                                <h4
                                    style={{
                                        marginTop: "1rem",
                                        fontSize: "1.5rem",
                                    }}
                                >
                                    {result.flagged
                                        ? "SUSPICIOUS ACTIVITY DETECTED"
                                        : "Transaction Clear"}
                                </h4>
                                <p
                                    style={{
                                        fontSize: "1.25rem",
                                        marginTop: "0.5rem",
                                    }}
                                >
                                    Risk Score: {result.risk_score.toFixed(1)}%
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
                                            className="alert alert-warning"
                                            style={{ marginBottom: "0.5rem" }}
                                        >
                                            <strong>{alert.rule_type}:</strong>{" "}
                                            {alert.description}
                                            <br />
                                            <small>
                                                Risk Level: {alert.risk_level}
                                            </small>
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
                            Submit a transaction to see detection results
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
                        Recent Detections
                    </h3>
                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Amount</th>
                                    <th>Sender</th>
                                    <th>Receiver</th>
                                    <th>Risk Score</th>
                                    <th>Status</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.transaction_id}</td>
                                        <td>
                                            $
                                            {parseFloat(
                                                item.total_amount ||
                                                    item.amount,
                                            ).toFixed(2)}
                                        </td>
                                        <td>{item.sender_id || "-"}</td>
                                        <td>{item.receiver_id || "-"}</td>
                                        <td>
                                            {item.risk_score
                                                ? item.risk_score.toFixed(1)
                                                : "0.0"}
                                            %
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    (item.alerts &&
                                                        item.alerts.length >
                                                            0) ||
                                                    item.risk_score > 0
                                                        ? "badge-danger"
                                                        : "badge-success"
                                                }`}
                                            >
                                                {(item.alerts &&
                                                    item.alerts.length > 0) ||
                                                item.risk_score > 0
                                                    ? "FLAGGED"
                                                    : "CLEAR"}
                                            </span>
                                        </td>
                                        <td>
                                            {formatLocalDateTime(item.timestamp)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AMLTab;
