import React, { useState, useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import "./index.css";
import Dashboard from "./components/Dashboard";
import Analytics from "./components/Analytics";
import Login from "./components/Login";
import Register from "./components/Register";
import { auth } from "./api";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(
        auth.isAuthenticated(),
    );

    // Check for server restart on app initialization
    useEffect(() => {
        const checkServerRestart = async () => {
            if (auth.isAuthenticated()) {
                const serverRestarted = await auth.checkServerRestart();
                if (serverRestarted) {
                    // Server restarted after login, force logout
                    auth.logout();
                    setIsAuthenticated(false);
                    sessionStorage.setItem('sessionExpired', 'true');
                    window.location.href = '/login';
                }
            }
        };
        
        checkServerRestart();
    }, []);

    // Listen for storage changes (e.g., logout in another tab)
    useEffect(() => {
        const handleStorageChange = () => {
            setIsAuthenticated(auth.isAuthenticated());
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        // Also periodically check auth status
        const interval = setInterval(() => {
            setIsAuthenticated(auth.isAuthenticated());
        }, 1000);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        auth.logout();
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/login"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/" />
                        ) : (
                            <Login onLogin={handleLogin} />
                        )
                    }
                />
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/detection" />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/analytics"
                    element={
                        isAuthenticated ? (
                            <Analytics onLogout={handleLogout} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/detection"
                    element={
                        isAuthenticated ? (
                            <Dashboard onLogout={handleLogout} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/register"
                    element={
                        isAuthenticated ? <Navigate to="/detection" /> : <Register />
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
