import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/communityGroups.css";

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="sidebar3">
      <div className="logo">
        <img src="/assets/logo.png" alt="HopeBridge Logo" />
        <h2>HopeBridge</h2>
      </div>

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
        <Link to="/logout" className="logout">
          Logout
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
