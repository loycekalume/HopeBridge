import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/sidebar";
import { apiCall } from "../../utils/api";
import "../../styles/admin.css";
import { Users, Heart, Calendar, HandHeart } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalCommunities: number;
  totalEvents: number;
  totalDonations: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCommunities: 0,
    totalEvents: 0,
    totalDonations: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await apiCall("/api/admin/stats", "GET");
      setStats(data);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <main className="admin-main">
        <header className="admin-header">
          <h1>Welcome, Admin</h1>
          <p>Monitor your platform activity and manage users, communities, and events.</p>
        </header>

        {/* Overview Section */}
        <section className="admin-overview">
          <div className="overview-card users">
            <Users size={26} />
            <div>
              <h3>Total Users</h3>
              <p>{stats.totalUsers}</p>
            </div>
          </div>

          <div className="overview-card communities">
            <Heart size={26} />
            <div>
              <h3>Total Communities</h3>
              <p>{stats.totalCommunities}</p>
            </div>
          </div>

          <div className="overview-card events">
            <Calendar size={26} />
            <div>
              <h3>Total Events</h3>
              <p>{stats.totalEvents}</p>
            </div>
          </div>

          <div className="overview-card donations">
            <HandHeart size={26} />
            <div>
              <h3>Total Donations</h3>
              <p>{stats.totalDonations}</p>
            </div>
          </div>
        </section>

        {/* Activity Summary (Optional for future charts/logs) */}
        <section className="admin-activity">
          <h2>Recent Activity Summary</h2>
          <ul>
            <li>✅ New community registered on Nov 10, 2025</li>
            <li>🎯 Volunteer event added: “Tree Planting Drive”</li>
            <li>💰 Donation milestone reached by “GreenEarth Org”</li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
