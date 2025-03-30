import React, { useState } from "react";

const Login = () => {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, password, role }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            setSuccess(data.message);
            console.log("User Data:", data.user);

            // ✅ Store user details in localStorage (for session management)
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("role", role);

            // ✅ Redirect based on role
            if (role === "student") {
                window.location.href = "/student-dashboard";
            } else if (role === "driver") {
                window.location.href = "/driver-dashboard";
            } else {
                window.location.href = "/coordinator-dashboard";
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Login</h2>
            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}
            <form onSubmit={handleLogin} style={styles.form}>
                <input
                    type="text"
                    placeholder="User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    style={styles.input}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                />
                <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.select}>
                    <option value="student">Student</option>
                    <option value="driver">Driver</option>
                    <option value="coordinator">Coordinator</option>
                </select>
                <button type="submit" style={styles.button}>Login</button>
            </form>
        </div>
    );
};

// ✅ CSS Styling (Inline)
const styles = {
    container: {
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        textAlign: "center",
        background: "#f4f4f4",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    input: {
        padding: "10px",
        fontSize: "16px",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    select: {
        padding: "10px",
        fontSize: "16px",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    button: {
        padding: "10px",
        fontSize: "16px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    error: {
        color: "red",
    },
    success: {
        color: "green",
    },
};

export default Login;