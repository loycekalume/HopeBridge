import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import "../styles/organizer.css";
import { useAuth } from "../context/authContext";
import { apiCall } from "../utils/api";

interface DashboardLayoutProps {
  children: React.ReactNode;
  profile?: any;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, profile }) => {
  const [showModal, setShowModal] = useState(false);
  const [editProfile, setEditProfile] = useState<any>({});
  const [profileState, setProfileState] = useState<any>(profile);

  // Sync local state with prop
  useEffect(() => {
    if (profile) {
      setProfileState(profile);
      setEditProfile(profile);
    }
  }, [profile]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      const updated = await apiCall(`/api/organizerProfile/${profileState.user_id}/profile`, "PUT", {
        phone: editProfile.phone,
        city: editProfile.city,
        state_region: editProfile.state_region,
      });

      alert("Profile updated successfully!");

      // Update local state to reflect changes immediately
      setProfileState({ ...profileState, ...updated.profile });
      setEditProfile({ ...editProfile, ...updated.profile });

      setShowModal(false);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to update profile.");
    }
  };

  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";

  const getRandomColor = (name: string) => {
    const colors = ["#007bff", "#28a745", "#17a2b8", "#ffc107", "#6f42c1", "#fd7e14"];
    let hash = 0;
    for (let i = 0; i < (name?.length || 0); i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
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
          <div className="avatar2" style={{ backgroundColor: getRandomColor(profileState?.full_name || "User") }}>
            {getInitials(profileState?.full_name)}
          </div>
          <h2>{profileState?.full_name || "Loading..."}</h2>
          <p className="role2">{profileState?.organizer_type || "Organizer"}</p>
        </div>

        <div className="profile-info2">
          <p><i className="fas fa-phone"></i> {profileState?.phone || "N/A"}</p>
          <p><i className="fas fa-city"></i> {profileState?.city || "N/A"}</p>
          <p><i className="fas fa-map-marker-alt"></i> {profileState?.state_region || "N/A"}</p>
          <p><i className="fas fa-envelope"></i> {profileState?.email || "N/A"}</p>
          <p><i className="fas fa-shield-alt"></i> {profileState?.verification_status || "Pending Review"}</p>

          <button className="edit-btn2" onClick={() => setShowModal(true)}>
            <i className="fas fa-edit"></i> Edit Profile
          </button>
        </div>
      </aside>

      {/* ==== EDIT PROFILE MODAL ==== */}
      {showModal && editProfile && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Profile</h3>

            <div className="form-group">
              <label>Full Name</label>
              <input value={editProfile.full_name || ""} readOnly />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input value={editProfile.email || ""} readOnly />
            </div>

            <div className="form-group">
              <label>Organizer Type</label>
              <input value={editProfile.organizer_type || ""} readOnly />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={editProfile.phone || ""} onChange={handleEditChange} />
            </div>

            <div className="form-group">
              <label>City</label>
              <input name="city" value={editProfile.city || ""} onChange={handleEditChange} />
            </div>

            <div className="form-group">
              <label>State / Region</label>
              <input name="state_region" value={editProfile.state_region || ""} onChange={handleEditChange} />
            </div>

            <div className="modal-actions">
              <button className="save-btn2" onClick={handleSaveProfile}>Save</button>
              <button className="cancel-btn2" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
