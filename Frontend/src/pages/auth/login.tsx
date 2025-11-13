import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/signup.css";
import { useAuth } from "../../context/authContext";
import { apiCall } from "../../utils/api"; // ✅ Import reusable API helper

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // ✅ Use centralized API helper
      const data = await apiCall("/api/auth/login", "POST", formData);

      console.log("Login successful:", data.user);
      authLogin(data.accessToken, data.user);

      const user = data.user;
      const userRole = user.role;
      const profileComplete = user.is_profile_complete;

      // Role-based redirect logic
      const rolePaths: Record<string, string> = {
        donor: "/donor",
        beneficiary: "/beneficiary",
        admin: "/admin",
        organizer: "/organizer",
        community: "/community",
        company: "/company",
      };

      const basePath = rolePaths[userRole] || "/";
      const destination = profileComplete
        ? basePath
        : `/completeProfile/${userRole}`;

      navigate(destination, { replace: true });
    } catch (err: any) {
      console.error("Error logging in:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
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
            {isLoading ? "Logging In..." : "Login"}
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
