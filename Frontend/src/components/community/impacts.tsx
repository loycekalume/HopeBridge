import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import "../../styles/communityGroups.css";
import { useAuth } from "../../context/authContext";
import { apiCall } from "../../utils/api";
import { Users, CalendarDays, HandHeart } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ImpactData {
  totalEvents: number;
  totalMembers: number;
  totalVolunteers: number;
}

const COLORS = ["#4F46E5", "#10B981", "#F59E0B"];

const CommunityImpact: React.FC = () => {
  const { user, token } = useAuth();
  const safeToken = token ?? undefined;

  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchImpact = async () => {
    if (!user || !safeToken) return;

    try {
      setLoading(true);
      const data = await apiCall(
        `/api/communities/${user.user_id}/impact`,
        "GET",
        undefined,
        safeToken
      );
      setImpact(data);
    } catch (error) {
      console.error("Failed to fetch impact:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && safeToken) fetchImpact();
  }, [user, safeToken]);

  if (!user) return <div className="loading">Please log in to view impact.</div>;
  if (loading) return <div className="loading">Loading impact...</div>;
  if (!impact) return <div>No impact data available.</div>;

  const chartData = [
    { name: "Total Members", value: impact.totalMembers },
    { name: "Total Volunteers", value: impact.totalVolunteers },
    { name: "Events Organized", value: impact.totalEvents },
  ];

  return (
    <div className="dashboard-container3">
      <Sidebar />
      <main className="main-content3">
        <h1 className="impact-title">Community Impact</h1>

        {/* Top summary cards */}
        <div className="impact-summary-grid">
          <div className="impact-card purple">
            <div className="icon-box"><CalendarDays size={24} /></div>
            <div>
              <h2>{impact.totalEvents}</h2>
              <p>Events Organized</p>
            </div>
          </div>

          <div className="impact-card green">
            <div className="icon-box"><Users size={24} /></div>
            <div>
              <h2>{impact.totalMembers}</h2>
              <p>Active Members</p>
            </div>
          </div>

          <div className="impact-card yellow">
            <div className="icon-box"><HandHeart size={24} /></div>
            <div>
              <h2>{impact.totalVolunteers}</h2>
              <p>Volunteer Involvement</p>
            </div>
          </div>
        </div>

        {/* Chart section */}
        <div className="impact-chart-container">
          <h3>Community Composition Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent impact activities (placeholder section for now) */}
        <div className="recent-impact">
          <h3>Recent Community Highlights</h3>
          <ul>
            <li>✅ Organized 1 community event this month.</li>
            <li>💪 Welcomed {impact.totalVolunteers} active volunteers.</li>
            <li>🌱 Expanded membership to {impact.totalMembers} members.</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default CommunityImpact;
