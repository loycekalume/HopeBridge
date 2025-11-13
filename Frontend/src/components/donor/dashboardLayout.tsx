import React from "react";
import Sidebar from "./sidebar";
import "../../styles/donorDashboard.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {title && <h2 className="dashboard-title">{title}</h2>}
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
