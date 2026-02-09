import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Dice5 } from "lucide-react";
import { creditAPI } from "../../api";
import { formatLocalDateTime } from "../../utils/timeFormatter";

function CreditTab({ onUpdate }) {
    const [formData, setFormData] = useState({
        applicant_id: "",
        age: "",
        income: "",
        credit_history: "good",
        debt_ratio: "",
        requested_amount: "",
        employment_length: "",
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
            const response = await creditAPI.list({ page_size: 10 });
            setHistory(response.data.results || []);
        } catch (err) {
            console.error("Failed to load history:", err);
        }
    };

    const generateTestData = () => {
        const riskProfile = Math.random();
        setFormData({
            applicant_id: `APP${Date.now()}`,
            age: Math.floor(Math.random() * 40 + 25).toString(),
            income: (Math.random() * 100000 + 30000).toFixed(0),
            credit_history:
                riskProfile > 0.7
                    ? "excellent"
                    : riskProfile > 0.4
                      ? "good"
                      : "fair",
            debt_ratio: (Math.random() * 0.5).toFixed(2),
            requested_amount: (Math.random() * 50000 + 5000).toFixed(0),
            employment_length: Math.floor(Math.random() * 15 + 1).toString(),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await creditAPI.assess(formData);
            setResult(response.data);
            await loadHistory();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.response?.data?.detail || "Assessment failed");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getDecisionIcon = (decision) => {
        switch (decision) {
            case "APPROVE":
                return <CheckCircle size={48} />;
            case "REJECT":
                return <XCircle size={48} />;
            default:
                return <AlertCircle size={48} />;
        }
    };

    const getDecisionColor = (decision) => {
        switch (decision) {
            case "APPROVE":
                return "var(--success)";
            case "REJECT":
                return "var(--danger)";
            default:
                return "var(--warning)";
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
                📊 Credit Risk Assessment
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
                            Applicant Information
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
                            <label className="form-label">Applicant ID</label>
                            <input
                                type="text"
                                name="applicant_id"
                                className="input"
                                value={formData.applicant_id}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    className="input"
                                    value={formData.age}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Annual Income
                                </label>
                                <input
                                    type="number"
                                    name="income"
                                    className="input"
                                    value={formData.income}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Credit History</label>
                            <select
                                name="credit_history"
                                className="input"
                                value={formData.credit_history}
                                onChange={handleChange}
                                required
                            >
                                <option value="excellent">Excellent</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                                <option value="poor">Poor</option>
                            </select>
                        </div>

                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">Debt Ratio</label>
                                <input
                                    type="number"
                                    name="debt_ratio"
                                    className="input"
                                    value={formData.debt_ratio}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Requested Amount
                                </label>
                                <input
                                    type="number"
                                    name="requested_amount"
                                    className="input"
                                    value={formData.requested_amount}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Employment Length (years)
                            </label>
                            <input
                                type="number"
                                name="employment_length"
                                className="input"
                                value={formData.employment_length}
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
                            {loading ? "Assessing..." : "Run Credit Assessment"}
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
                        Assessment Result
                    </h3>

                    {result ? (
                        <div>
                            <div
                                style={{
                                    padding: "1.5rem",
                                    borderRadius: "8px",
                                    background: getDecisionColor(
                                        result.decision,
                                    ),
                                    color: "white",
                                    textAlign: "center",
                                    marginBottom: "1rem",
                                }}
                            >
                                {getDecisionIcon(result.decision)}
                                <h4
                                    style={{
                                        marginTop: "1rem",
                                        fontSize: "1.5rem",
                                    }}
                                >
                                    {result.decision?.replace("_", " ")}
                                </h4>
                                <p
                                    style={{
                                        fontSize: "1.25rem",
                                        marginTop: "0.5rem",
                                    }}
                                >
                                    Credit Score: {result.credit_score}/850
                                </p>
                                <p
                                    style={{
                                        fontSize: "1rem",
                                        marginTop: "0.5rem",
                                    }}
                                >
                                    Risk Tier: {result.risk_tier}
                                </p>
                            </div>

                            {result.factors &&
                                Object.keys(result.factors).length > 0 && (
                                    <div>
                                        <h4
                                            style={{
                                                fontWeight: "600",
                                                marginBottom: "1rem",
                                            }}
                                        >
                                            Risk Factors:
                                        </h4>
                                        {Object.entries(result.factors).map(
                                            ([key, value]) => (
                                                <div
                                                    key={key}
                                                    style={{
                                                        padding: "0.75rem",
                                                        background: "#f7fafc",
                                                        borderRadius: "6px",
                                                        marginBottom: "0.5rem",
                                                    }}
                                                >
                                                    <strong>
                                                        {key
                                                            .replace(/_/g, " ")
                                                            .toUpperCase()}
                                                        :
                                                    </strong>{" "}
                                                    {JSON.stringify(value)}
                                                </div>
                                            ),
                                        )}
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
                            Submit an application to see assessment results
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
                        Recent Assessments
                    </h3>
                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Applicant ID</th>
                                    <th>Credit Score</th>
                                    <th>Risk Tier</th>
                                    <th>Decision</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.applicant_id}</td>
                                        <td>{item.credit_score}/850</td>
                                        <td>
                                            <span
                                                className={`badge badge-${item.risk_tier === "LOW" ? "success" : item.risk_tier === "MEDIUM" ? "warning" : "danger"}`}
                                            >
                                                {item.risk_tier}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge badge-${item.decision === "APPROVE" ? "success" : item.decision === "REJECT" ? "danger" : "warning"}`}
                                            >
                                                {item.decision}
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

export default CreditTab;
