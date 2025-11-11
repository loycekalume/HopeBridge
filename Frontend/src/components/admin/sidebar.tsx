import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Heart, Calendar, BarChart3, LogOut } from "lucide-react";
import "../../styles/admin.css";

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/admin" },
    { name: "Users", icon: <Users size={18} />, path: "/admin/users" },
    { name: "Communities", icon: <Heart size={18} />, path: "/admin/communities" },
    { name: "Events", icon: <Calendar size={18} />, path: "/admin/events" },
    { name: "Reports", icon: <BarChart3 size={18} />, path: "/admin/reports" },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="logo">
        <h2>Admin Panel</h2>
      </div>

      <nav>
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`menu-item ${location.pathname === item.path ? "active" : ""}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="logout-section">
        <button className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
