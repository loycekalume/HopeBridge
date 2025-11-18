// src/components/common/Sidebar.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/donorDashboard.css";

interface SidebarProps {
  userRole: string;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const location = useLocation();
  const menuItems = [
    { label: "Dashboard", path: "/beneficiary", icon: "fas fa-tachometer-alt" },
    { label: "Donations", path: "/beneficiary/donations", icon: "fas fa-gift" },
    { label: "Requests", path: "/beneficiary/requests", icon: "fas fa-list" },

  ];

  return (
    <aside className="sidebarb">
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
    </aside>
  );
};

export default Sidebar;
