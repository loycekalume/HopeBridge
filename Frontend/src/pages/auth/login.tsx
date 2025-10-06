import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/signup.css";

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Logging in:", formData);

        try {
            const res = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: "include", // important for cookies
            });

            const data = await res.json();
            console.log("Login response:", data);

            if (res.ok) {
                alert("Login successful 🎉");
                // TODO: redirect to dashboard
            } else {
                alert(data.message || "Login failed");
            }
        } catch (err) {
            console.error("Error logging in:", err);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                {/* Logo */}
                <div className="logo">
                    <img
                        src="https://img.icons8.com/ios-filled/50/2b6cb0/like--v1.png"
                        alt="logo"
                    />
                    HopeBridge
                </div>

                <div className="signup-title">Welcome Back</div>
                <div className="signup-subtitle">Login to your account</div>

                <form className="signup-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <button type="submit">Login</button>
                </form>
                <div className="signup-subtitle">
                    Don’t have an account? <Link to="/signup">Sign Up</Link>
                </div>
                <div className="footer-icon">
                    <img
                        src="https://img.icons8.com/fluency/48/login-rounded-right.png"
                        alt="login"
                        style={{ width: "26px", height: "26px" }}
                    />
                </div>
            </div>
        </div>
    );
}
