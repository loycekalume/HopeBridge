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
import { useAuth } from "../../context/authContext"; // <-- import context

const CompanySidebar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // <-- get logout from context

  const handleLogout = () => {
    logout();          // clear user & token in context
    navigate("/login"); // redirect to login page
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
            isActive ? "sidebar-linkc active" : "sidebar-linkc"
          }
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/company/campaigns"
          className={({ isActive }) =>
            isActive ? "sidebar-linkc active" : "sidebar-linkc"
          }
        >
          <Gift size={20} />
          <span>Campaigns</span>
        </NavLink>

        <NavLink
          to="/company/donations"
          className={({ isActive }) =>
            isActive ? "sidebar-linkc active" : "sidebar-linkc"
          }
        >
          <HandCoins size={20} />
          <span>Donations</span>
        </NavLink>

        <NavLink
          to="/company/impacts"
          className={({ isActive }) =>
            isActive ? "sidebar-linkc active" : "sidebar-linkc"
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
