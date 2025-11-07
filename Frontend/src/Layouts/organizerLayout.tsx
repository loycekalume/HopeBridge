import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import "../styles/organizer.css";
import { useAuth } from "../context/authContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  profile?: any;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, profile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const getRandomColor = (name: string) => {
    const colors = ["#007bff", "#28a745", "#17a2b8", "#ffc107", "#6f42c1", "#fd7e14"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="dashboard-container2">
      {/* ==== SIDEBAR ==== */}
      <aside className="sidebar2">
        <div className="logo2">
          <Heart color="#00b4d8" size={35} />
          <h2>HopeBridge</h2>
        </div>

        <nav className="menu2">
          <Link to="/organizer" className={isActive("/organizerDashboard") ? "active" : ""}>
            Dashboard Overview
          </Link>
          <Link to="/pending-verifications" className={isActive("/pending-verifications") ? "active" : ""}>
            Pending Verifications
          </Link>
          <Link to="/approvedRequests" className={isActive("/approvedRequests") ? "active" : ""}>
            Approved Requests
          </Link>
          <Link to="/matched-donations" className={isActive("/matched-donations") ? "active" : ""}>
            Matched Donations
          </Link>
          <Link to="/community-events" className={isActive("/community-events") ? "active" : ""}>
            Community Events
          </Link>
          <Link to="/profile-settings" className={isActive("/profile-settings") ? "active" : ""}>
            Profile Settings
          </Link>
          <a href="#" className="logout" onClick={handleLogout}>
            Logout
          </a>
        </nav>
      </aside>

      {/* ==== MAIN CONTENT ==== */}
      <main className="main-content2">{children}</main>

      {/* ==== PROFILE CARD ==== */}
      <aside className="profile-card2">
        <div className="profile-top2">
          <div
            className="avatar2"
            style={{ backgroundColor: getRandomColor(profile?.full_name || "User") }}
          >
            {getInitials(profile?.full_name || "User")}
          </div>
          <h2>{profile?.full_name || "Loading..."}</h2>
          <p className="role2">{profile?.organizer_type || "Organizer"}</p>
        </div>

        <div className="profile-info2">
          <p><i className="fas fa-phone"></i> {profile?.phone || "N/A"}</p>
          <p><i className="fas fa-city"></i> {profile?.city || "N/A"}</p>
          <p><i className="fas fa-map-marker-alt"></i> {profile?.state_region || "N/A"}</p>
          <p><i className="fas fa-envelope"></i> {profile?.email || "N/A"}</p>
          <p><i className="fas fa-shield-alt"></i> {profile?.verification_status || "Pending Review"}</p>

          <Link to="/profile-settings" className="edit-btn2">
            <i className="fas fa-edit"></i> Edit Profile
          </Link>
        </div>
      </aside>
    </div>
  );
};

export default DashboardLayout;