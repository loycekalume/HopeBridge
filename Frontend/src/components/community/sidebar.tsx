import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../styles/communityGroups.css";
import { LayoutDashboard, CalendarCheck, BarChart2, Users, LogOut } from "lucide-react";
import { useAuth } from "../../context/authContext";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate(); // <-- Add this
  const { user, logout } = useAuth();

  const links = [
    { to: "/community", label: "Dashboard Overview", icon: <LayoutDashboard size={18} /> },
    { to: "/manage-events", label: "Manage Events", icon: <CalendarCheck size={18} /> },
    { to: "/impact-reports", label: "Impact Reports", icon: <BarChart2 size={18} /> },
    { to: "/members", label: "Community Members", icon: <Users size={18} /> },
  ];

  const handleLogout = () => {
    logout();           // clear user & token
    navigate("/login"); // redirect to login page
  };

  return (
    <aside className="sidebar3">
      {/* TOP: Logo */}
      <div className="logo">
        <h2>HopeBridge</h2>
      </div>

      {/* NAVIGATION */}
      <nav className="menu">
        {links.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={location.pathname === to ? "active" : ""}
          >
            {icon}
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer3">
        <div className="user-info">
          <small>{user?.full_name}</small>
        </div>
        <button className="logout-btn3" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
