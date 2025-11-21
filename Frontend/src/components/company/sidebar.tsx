import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Gift,
  FileText,
  HandCoins,
  LogOut,
} from "lucide-react";
import "../../styles/companyDashboard.css";

const CompanySidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="company-sidebar">
      <div className="sidebar-headerc">
        <h2 className="logoc">HopeBridge</h2>
        <p className="role">Company Panel</p>
      </div>

      <nav className="sidebar-navc">
        <NavLink
          to="/company"
          className={({ isActive }) =>
            isActive ? "sidebar-linkc active" : "sidebar-link"
          }
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/company/campaigns"
          className={({ isActive }) =>
            isActive ? "sidebar-linkc active" : "sidebar-link"
          }
        >
          <Gift size={20} />
          <span>Campaigns</span>
        </NavLink>

        <NavLink
          to="/company/donations"
          className={({ isActive }) =>
            isActive ? "sidebar-linkc active" : "sidebar-link"
          }
        >
          <HandCoins size={20} />
          <span>Donations</span>
        </NavLink>

        <NavLink
          to="/company/impacts"
          className={({ isActive }) =>
            isActive ? "sidebar-linkc active" : "sidebar-link"
          }
        >
          <FileText size={20} />
          <span>Impact</span>
        </NavLink>

     
      </nav>

      <button onClick={handleLogout} className="logout-btnc">
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default CompanySidebar;
