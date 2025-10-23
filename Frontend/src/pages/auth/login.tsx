import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/signup.css";
// NOTE: Ensure this path is correct for your AuthContext file
import { useAuth } from '../../context/authContext'; 

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const { login: authLogin } = useAuth(); // Access the global login method

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("http://localhost:3000/api/auth/login", {
               
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: "include",
            });

            const data = await res.json();

            if (res.ok) {
                console.log("Login successful:", data.user);

                // 1. Store token and user data globally
                authLogin(data.accessToken, data.user); 

                // 2. Determine Redirection based on profile completion status
                const user = data.user;
                const userRole = user.role;
                const profileComplete = user.is_profile_complete;

                // Map role to correct route path
                let basePath = '';
                switch (userRole) {
                    case 'donor':
                    case 'beneficiary':
                    case 'admin':
                    case 'organizer':
                    case 'community':
                        basePath = `/${userRole}`;
                        break;
                    case 'company':
                        basePath = '/donor'; // Assuming company redirects to donor dashboard
                        break;
                    default:
                        basePath = '/';
                }

                const destination = profileComplete
                    ? basePath // e.g., /donor
                    : `/completeProfile/${userRole}`; 

                // 3. Navigate
                navigate(destination, { replace: true });

            } else {
                // Handle authentication errors (e.g., Invalid credentials)
                setError(data.message || "Login failed. Please try again.");
            }
        } catch (err) {
            console.error("Error logging in:", err);
            setError("Network error. Could not connect to the server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                {/* Logo */}
                <div className="logo">
                    <img src="https://img.icons8.com/ios-filled/50/2b6cb0/like--v1.png" alt="logo" />
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
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Logging In...' : 'Login'}
                    </button>
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