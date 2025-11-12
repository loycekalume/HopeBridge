import React, { useEffect, useState } from "react";
import CompanySidebar from "../../components/company/sidebar";
import { apiCall } from "../../utils/api";
import "../../styles/companyDashboard.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const CompanyDashboard: React.FC = () => {
  const [summary, setSummary] = useState({
    totalCampaigns: 0,
    totalDonations: 0,
    totalReports: 0,
  });
  const [company, setCompany] = useState<any>(null);
  const [donationTrend, setDonationTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const companyData = await apiCall("/api/company/profile", "GET");
        const statsData = await apiCall("/api/company/stats", "GET");
        const trendData = await apiCall("/api/company/donation-trend", "GET");

        setCompany(companyData);
        setSummary(statsData);
        setDonationTrend(trendData);
      } catch (error) {
        console.error("Error fetching company dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="loading">Loading company dashboard...</div>;

  return (
    <div className="company-dashboard">
      <CompanySidebar />

      <main className="company-dashboard-main">
        <h1 className="dashboard-title">Welcome, {company?.name || "Your Company"}</h1>

        {/* Summary Cards */}
        <div className="dashboard-summary">
          <div className="summary-card campaigns">
            <h3>Active Campaigns</h3>
            <p>{summary.totalCampaigns}</p>
          </div>
          <div className="summary-card donations">
            <h3>Total Donations</h3>
            <p>{summary.totalDonations}</p>
          </div>
          <div className="summary-card reports">
            <h3>Reports</h3>
            <p>{summary.totalReports}</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="chart-section">
          <h3>Donation Trend (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={donationTrend}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="donations" fill="#4f9efc" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>

      {/* Profile Card (Right Side) */}
      <aside className="company-profile-card">
        <div className="profile-header">
          <img
            src={company?.logo || "/default-logo.png"}
            alt="Company Logo"
            className="company-logo"
          />
          <h3>{company?.name || "HopeBridge Partner"}</h3>
          <p className="industry">{company?.industry || "Non-Profit Organization"}</p>
        </div>

        <div className="profile-details">
          <p>
            <strong>Email:</strong> {company?.email || "example@company.com"}
          </p>
          <p>
            <strong>Joined:</strong>{" "}
            {company?.joined
              ? new Date(company.joined).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Location:</strong> {company?.location || "Not specified"}
          </p>
        </div>

        <div className="profile-actions">
          <button className="edit-btn">Edit Profile</button>
          <button className="campaign-btn">Start Campaign</button>
        </div>
      </aside>
    </div>
  );
};

export default CompanyDashboard;
