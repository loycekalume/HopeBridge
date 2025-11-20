// src/components/common/Sidebar.tsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/authContext";
import "../../styles/donorDashboard.css";

interface SidebarProps {
  userRole: string;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { label: "Dashboard", path: "/beneficiary", icon: "fas fa-tachometer-alt" },
    { label: "Donations", path: "/beneficiary/donations", icon: "fas fa-gift" },
    { label: "Requests", path: "/beneficiary/requests", icon: "fas fa-list" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
   <aside className="sidebarb">
  <div className="sidebar-top">
    <div className="sidebar-headerb">
      <h2>HopeBridge</h2>
      <p>{userRole}</p>
    </div>

    <nav className="sidebar-navb">
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={location.pathname === item.path ? "active" : ""}
        >
          <i className={item.icon}></i>
          {item.label}
        </Link>
      ))}
    </nav>
  </div>

  <div className="sidebar-footer">
    <div className="user-info">
      <small>{user?.full_name || "User"}</small>
    </div>

    <button className="logout-btn" onClick={handleLogout}>
      <LogOut size={16} /> Logout
    </button>
  </div>
</aside>

  );
};

export default Sidebar;
