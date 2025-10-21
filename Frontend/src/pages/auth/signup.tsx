import { useState } from "react";
import "../../styles/signup.css";
import { Link, useNavigate } from "react-router-dom"; // <-- Keep necessary imports

// The useAuth hook import is REMOVED here, as it's not needed for signup.

interface Role {
  key: string;
  label: string;
  desc: string;
  icon: string;
}

const roles: Role[] = [
  { key: "donor", label: "Individual Donor", desc: "Donate resources to those in need", icon: "https://img.icons8.com/fluency/48/like.png" },
  { key: "company", label: "Company", desc: "Corporate donations & sponsorships", icon: "https://img.icons8.com/fluency/48/company.png" },
  { key: "beneficiary", label: "Beneficiary", desc: "Request assistance & resources", icon: "https://img.icons8.com/fluency/48/helping-hand.png" },
  { key: "organizer", label: "Organizer", desc: "Verify & coordinate distributions", icon: "https://img.icons8.com/fluency/48/management.png" },
  { key: "community", label: "Community Group", desc: "Volunteer & provide services", icon: "https://img.icons8.com/fluency/48/group.png" },
];

export default function Signup() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setError("Please select a role before proceeding.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, password_hash: formData.password, role: selectedRole }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        alert("Account successfully created! Please log in.");
        // Redirect immediately to Login, letting the Login page handle the profile check.
        navigate("/login", { replace: true });

      } else {
        // Handle backend errors (e.g., "User already exists")
        setError(data.message || "Signup failed. Please check your details.");
      }
    } catch (err) {
      console.error("Error signing up:", err);
      setError("Network error. Could not connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentRole = roles.find(r => r.key === selectedRole);

  return (
    <div className="signup-container">
      <div className="signup-box">
        {/* Logo */}
        <div className="logo">
          <img src="https://img.icons8.com/ios-filled/50/2b6cb0/like--v1.png" alt="logo" />
          HopeBridge
        </div>

        {!selectedRole ? (
          <>
            <div className="signup-title">Join Our Community</div>
            <div className="signup-subtitle">Choose your role to continue</div>

            <div className="options">
              {roles.map((role) => (
                <div key={role.key} className="option" onClick={() => setSelectedRole(role.key)}>
                  <h3>
                    <img src={role.icon} alt={role.label} style={{ width: "20px", height: "20px" }} />{" "}
                    {role.label}
                  </h3>
                  <p>{role.desc}</p>
                </div>
              ))}
            </div>
            {error && <p className="error-message">{error}</p>}
          </>
        ) : (
          <>
            <div className="signup-title">Create Account</div>
            <div className="signup-subtitle">
              Role: {currentRole?.label || selectedRole} <span className="back-link" onClick={() => setSelectedRole(null)}>(Change)</span>
            </div>

            <form className="signup-form" onSubmit={handleSubmit}>
              <input type="text" name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleChange} required />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
              <input type="tel" name="phone" placeholder="Phone (Optional)" value={formData.phone} onChange={handleChange} />
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />

              {error && <p className="error-message">{error}</p>}
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Sign Up'}
              </button>
              <p className="terms-note">By signing up, you agree to the HopeBridge <Link to="/terms">Terms of Service</Link>.</p>
            </form>
          </>
        )}
        <div className="signup-subtitle">
          Already have an account? <Link to="/login">Login</Link>
        </div>
        <div className="footer-icon">🤲</div>
      </div>
    </div>
  );
}