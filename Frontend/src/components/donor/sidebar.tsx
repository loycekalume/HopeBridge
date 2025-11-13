import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Heart, Users, LogOut } from "lucide-react";
import "../../styles/donorDashboard.css";
import { useAuth } from "../../context/authContext";

const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const links = [
    { to: "/donor", icon: <Home size={18} />, label: "Dashboard" },
    { to: "/donor/donations", icon: <Heart size={18} />, label: "My Donations" },
    { to: "/donor/beneficiaries", icon: <Users size={18} />, label: "Beneficiaries" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">🌍 HopeBridge</div>

      <div className="sidebar-links">
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

      <div className="sidebar-footer">
        <div className="user-info">
          <small>{user?.full_name}</small>
        </div>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
