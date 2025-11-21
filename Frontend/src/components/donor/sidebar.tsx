import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Heart, Users, LogOut } from "lucide-react";
import "../../styles/donorDashboard.css";
import { useAuth } from "../../context/authContext";

const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // <-- Add this

  const links = [
    { to: "/donor", icon: <Home size={18} />, label: "Dashboard" },
    { to: "/donor/donations", icon: <Heart size={18} />, label: "My Donations" },
    { to: "/donor/beneficiaries", icon: <Users size={18} />, label: "Beneficiaries" },
  ];

  const handleLogout = () => {
    logout();          
    navigate("/login"); 
  };

  return (
    <aside className="sidebard">
      <div className="sidebar-top">
        <div className="sidebar-logod">HopeBridge</div>

        <div className="sidebar-linksd">
          {links.map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`sidebar-link ${location.pathname === to ? "active" : ""}`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <small>{user?.full_name}</small>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
