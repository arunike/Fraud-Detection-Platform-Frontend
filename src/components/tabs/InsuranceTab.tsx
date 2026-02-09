import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Dice5 } from "lucide-react";
import { insuranceAPI } from "../../api";
import { formatLocalDateTime } from "../../utils/timeFormatter";

function InsuranceTab({ onUpdate }) {
    const [formData, setFormData] = useState({
        claim_id: "",
        policy_id: "",
        claim_amount: "",
        incident_date: "",
        claim_type: "AUTO",
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
            const response = await insuranceAPI.list({ page_size: 10 });
            setHistory(response.data.results || []);
        } catch (err) {
            console.error("Failed to load history:", err);
        }
    };

    const generateTestData = () => {
        const suspicious = Math.random() > 0.5;
        const daysAgo = Math.floor(Math.random() * 30);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);

        setFormData({
            claim_id: `CLM${Date.now()}`,
            policy_id: `POL${Math.floor(Math.random() * 100000)}`,
            claim_amount: suspicious
                ? (Math.random() * 50000 + 20000).toFixed(2)
                : (Math.random() * 10000 + 1000).toFixed(2),
            incident_date: date.toISOString().split("T")[0],
            claim_type: ["AUTO", "HOME", "HEALTH", "LIFE"][
                Math.floor(Math.random() * 4)
            ],
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await insuranceAPI.detect(formData);
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
                🛡️ Insurance Fraud Detection
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
                            Claim Information
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
                            <label className="form-label">Claim ID</label>
                            <input
                                type="text"
                                name="claim_id"
                                className="input"
                                value={formData.claim_id}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Policy ID</label>
                            <input
                                type="text"
                                name="policy_id"
                                className="input"
                                value={formData.policy_id}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Claim Amount</label>
                            <input
                                type="number"
                                name="claim_amount"
                                className="input"
                                value={formData.claim_amount}
                                onChange={handleChange}
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Incident Date</label>
                            <input
                                type="date"
                                name="incident_date"
                                className="input"
                                value={formData.incident_date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Claim Type</label>
                            <select
                                name="claim_type"
                                className="input"
                                value={formData.claim_type}
                                onChange={handleChange}
                                required
                            >
                                <option value="AUTO">Auto</option>
                                <option value="HOME">Home</option>
                                <option value="HEALTH">Health</option>
                                <option value="LIFE">Life</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: "100%" }}
                            disabled={loading}
                        >
                            {loading ? "Analyzing..." : "Run Fraud Detection"}
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
                                        ? "POTENTIAL FRAUD DETECTED"
                                        : "Claim Appears Legitimate"}
                                </h4>
                                <p
                                    style={{
                                        fontSize: "1.25rem",
                                        marginTop: "0.5rem",
                                    }}
                                >
                                    Fraud Probability:{" "}
                                    {(result.fraud_probability * 100).toFixed(
                                        1,
                                    )}
                                    %
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
                                            <strong>{alert.alert_type}:</strong>{" "}
                                            {alert.description}
                                            <br />
                                            <small>
                                                Severity: {alert.severity}
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
                            Submit a claim to see detection results
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
                        Recent Claims
                    </h3>
                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Claim ID</th>
                                    <th>Policy ID</th>
                                    <th>Amount</th>
                                    <th>Fraud Probability</th>
                                    <th>Status</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.claim_id}</td>
                                        <td>{item.policy_id || "-"}</td>
                                        <td>
                                            $
                                            {parseFloat(
                                                item.claim_amount,
                                            ).toFixed(2)}
                                        </td>
                                        <td>
                                            {item.fraud_risk != null
                                                ? item.fraud_risk.toFixed(1)
                                                : "0.0"}
                                            %
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    (item.alerts &&
                                                        item.alerts.length >
                                                            0) ||
                                                    item.fraud_risk > 0
                                                        ? "badge-danger"
                                                        : "badge-success"
                                                }`}
                                            >
                                                {(item.alerts &&
                                                    item.alerts.length > 0) ||
                                                item.fraud_risk > 0
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

export default InsuranceTab;
