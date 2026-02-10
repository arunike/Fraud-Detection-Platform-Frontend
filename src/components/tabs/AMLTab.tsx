import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle, Dice5 } from "lucide-react";
import { amlAPI } from "../../api";
import { formatLocalDateTime } from "../../utils/timeFormatter";

function AMLTab({ onUpdate, highlightId }) {
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
    const highlightRef = useRef<HTMLTableRowElement>(null);

    useEffect(() => {
        loadHistory();
    }, []);
    
    useEffect(() => {
        if (highlightId && highlightRef.current) {
            highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Flash animation
            highlightRef.current.style.animation = 'highlight-flash 2s ease-in-out';
        }
    }, [highlightId, history]);

    const loadHistory = async () => {
        try {
            const response = await amlAPI.list({ page_size: 10 });
            // Handle both array and object with results property
            const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
            setHistory(data);
            console.log('AML History loaded:', data.length, 'items');
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
            <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
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
                            💰 Transaction Details
                        </h3>
                        <button
                            type="button"
                            onClick={generateTestData}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
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
            <div className="card" style={{ marginTop: "1.5rem" }}>
                <h3
                    style={{
                        fontSize: "1.25rem",
                        fontWeight: "600",
                        marginBottom: "1rem",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    📅 Recent Detections
                    <span style={{
                        fontSize: '0.9rem',
                        color: 'var(--gray)',
                        fontWeight: 'normal'
                    }}>({history.length})</span>
                </h3>
                {history.length > 0 ? (
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
                                {history.map((item, idx) => {
                                    const isHighlighted = highlightId && item.id === highlightId;
                                    return (
                                        <tr 
                                            key={idx}
                                            ref={isHighlighted ? highlightRef : null}
                                            style={{
                                                background: isHighlighted ? 'rgba(102, 126, 234, 0.1)' : undefined,
                                                transition: 'background 0.3s ease'
                                            }}
                                        >
                                            <td>{item.transaction_id}</td>
                                            <td>
                                                {item.amount ? (
                                                    <strong style={{color: 'var(--primary)'}}>
                                                        ${parseFloat(item.amount).toFixed(2)}
                                                    </strong>
                                                ) : (
                                                    <span style={{color: 'var(--gray)'}}>-</span>
                                                )}
                                            </td>
                                            <td>{item.sender_id || <span style={{color: 'var(--gray)'}}>-</span>}</td>
                                            <td>{item.receiver_id || <span style={{color: 'var(--gray)'}}>-</span>}</td>
                                            <td>
                                                <strong style={{
                                                    color: item.risk_score > 50 ? 'var(--danger)' : 
                                                           item.risk_score > 20 ? 'var(--warning)' : 'var(--success)'
                                                }}>
                                                    {item.risk_score ? item.risk_score.toFixed(1) : "0.0"}%
                                                </strong>
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge ${
                                                        (item.alerts &&
                                                            item.alerts.length >
                                                                0) ||
                                                        item.risk_score > 50
                                                            ? "badge-danger"
                                                            : "badge-success"
                                                    }`}
                                                >
                                                    {(item.alerts &&
                                                        item.alerts.length > 0) ||
                                                    item.risk_score > 50
                                                        ? "FLAGGED"
                                                        : "CLEAR"}
                                                </span>
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
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: 'var(--gray)',
                        background: 'rgba(102, 126, 234, 0.03)',
                        borderRadius: '8px'
                    }}>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>
                            No detections yet. Submit a transaction above to get started.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AMLTab;
