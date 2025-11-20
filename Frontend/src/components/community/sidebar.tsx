// src/components/community/Sidebar.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/communityGroups.css";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/authContext";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar3">
      {/* TOP: Logo */}
      <div className="logo">
        <h2>HopeBridge</h2>
      </div>

      {/* CENTER: Navigation */}
      <nav className="menu">
        <Link
          to="/community"
          className={location.pathname === "/community" ? "active" : ""}
        >
          Dashboard Overview
        </Link>

        <Link
          to="/manage-events"
          className={location.pathname === "/manage-events" ? "active" : ""}
        >
          Manage Events
        </Link>

        <Link
          to="/impact-reports"
          className={location.pathname === "/impact-reports" ? "active" : ""}
        >
          Impact Reports
        </Link>

        <Link
          to="/members"
          className={location.pathname === "/members" ? "active" : ""}
        >
          Community Members
        </Link>
      </nav>

      {/* BOTTOM FOOTER */}
      <div className="sidebar-footer3">
        <div className="user-info">
          <small>{user?.full_name}</small>
        </div>

        <button className="logout-btn3" onClick={logout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
