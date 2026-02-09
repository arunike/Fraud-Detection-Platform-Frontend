import React, { useState } from "react";
import { auth } from "../api";
import { UserPlus } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);

        try {
            await auth.register(username, password, email);
            // After successful registration, redirect to login
            navigate("/login", {
                state: { message: "Registration successful! Please login." },
            });
        } catch (err) {
            setError(
                err.response?.data?.username ||
                    err.response?.data?.detail ||
                    "Registration failed.",
            );
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
                    📝 Sign Up
                </h1>

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
                        <label className="form-label">Email (Optional)</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className="input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "1rem" }}
                        disabled={loading}
                    >
                        <UserPlus size={20} />
                        {loading ? "Registering..." : "Register"}
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
                    Already have an account?{" "}
                    <Link to="/login" style={{ color: "var(--primary)" }}>
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
