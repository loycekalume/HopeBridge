import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import CompanySidebar from "../../components/company/sidebar";
import { apiCall } from "../../utils/api";
import { useAuth } from "../../context/authContext"; // <-- import hook
import "../../styles/companyDashboard.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD"];



interface MonthlyImpact {
  month: string;
  donations: number;
}

interface ChartData {
  [key: string]: any;
  campaign_name: string;
  total_donations: number;
}

const CompanyImpacts: React.FC = () => {
  const { user, loading: authLoading } = useAuth(); // <-- get user from auth
  const [campaignImpacts, setCampaignImpacts] = useState<ChartData[]>([]);
  const [monthlyImpact, setMonthlyImpact] = useState<MonthlyImpact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImpacts = async () => {
    if (!user) return;
    try {
      const res = await apiCall(`/api/campaigns/impacts?companyId=${user.user_id}`, "GET");
      setCampaignImpacts(res.campaignImpacts || []);
      setMonthlyImpact(res.monthlyImpact || []);
    } catch (err) {
      console.error("Error fetching impacts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) fetchImpacts();
  }, [authLoading, user]);

  if (loading || authLoading) return <div className="loading">Loading impact data...</div>;

  return (
    <div className="company-impacts">
      <CompanySidebar />
      <main className="company-main">
        <h1>Donation Impact Dashboard</h1>

        {/* Campaign summary */}
        <div className="impact-summary-cards">
          {campaignImpacts.map((c, idx) => (
            <div key={idx} className="summary-card">
              <h3>{c.campaign_name}</h3>
              <p>Total Donations: ${c.total_donations}</p>
              <p>Beneficiaries Reached: {c.total_beneficiaries}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="charts-container">
          {/* Pie chart - donations per campaign */}
          <div className="chart-box">
            <h3>Donations by Campaign</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={campaignImpacts}
                  dataKey="total_donations"
                  nameKey="campaign_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {campaignImpacts.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Line chart - monthly donations trend */}
          <div className="chart-box">
            <h3>Monthly Donations Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyImpact}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="donations" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart - beneficiaries per campaign */}
          <div className="chart-box">
            <h3>Beneficiaries Reached per Campaign</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignImpacts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="campaign_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_beneficiaries" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyImpacts;
