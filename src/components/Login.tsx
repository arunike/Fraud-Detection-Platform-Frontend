import React, { useState, useEffect } from "react";
import { auth } from "../api";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";

function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionExpiredMsg, setSessionExpiredMsg] = useState("");

    useEffect(() => {
        // Check if session expired
        const expired = sessionStorage.getItem('sessionExpired');
        if (expired === 'true') {
            setSessionExpiredMsg("Your session has expired. Please log in again.");
            sessionStorage.removeItem('sessionExpired');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await auth.login(username, password);
            onLogin();
        } catch (err) {
            console.error('Login error:', err);
            
            if (!err.response) {
                // Network error - service might be down
                setError("Cannot connect to server. Please make sure the service is running.");
            } else if (err.response.status === 401) {
                setError("Invalid username or password. Please try again.");
            } else if (err.response.status === 500) {
                setError("Server error. The service may have restarted. Please try again.");
            } else {
                setError(
                    err.response?.data?.detail ||
                    err.response?.data?.message ||
                    "Login failed. Please check your credentials."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
        >
            <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
                <h1
                    className="gradient-text"
                    style={{
                        textAlign: "center",
                        marginBottom: "2rem",
                        fontSize: "2rem",
                    }}
                >
                    🏦 Fraud Detection Platform
                </h1>

                {sessionExpiredMsg && (
                    <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
                        {sessionExpiredMsg}
                    </div>
                )}

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "1rem" }}
                        disabled={loading}
                    >
                        <LogIn size={20} />
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p
                    style={{
                        marginTop: "1rem",
                        textAlign: "center",
                        color: "var(--gray)",
                        fontSize: "0.875rem",
                    }}
                >
                    Don't have an account?{" "}
                    <Link to="/register" style={{ color: "var(--primary)" }}>
                        Sign up here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
