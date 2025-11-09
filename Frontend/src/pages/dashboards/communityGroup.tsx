import React, { useState, useEffect } from "react";
import Sidebar from "../../components/community/sidebar";
import ProfileCard from "../../components/community/profileCard";
import OverviewCards from "../../components/community/overview";
import "../../styles/communityGroups.css";
import { useAuth } from "../../context/authContext";
import { apiCall } from "../../utils/api";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);


interface CommunityProfile {
  user_id: number;
  full_name: string;
  phone: string;
   email: string;
  org_focus: string;
  city: string;
  state_region: string;
  about_organization: string;
  verification_status: string;
}

const CommunityDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [loading, setLoading] = useState(true);

 const fetchProfile = async () => {
  if (!user || !token) return;
  try {
    const data = await apiCall(`/api/communityProfile/${user.user_id}/profile/community`, "GET", undefined, token);
    setProfile(data);
  } catch (err) {
    console.error("Failed to fetch community profile:", err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchProfile();
}, [user, token]);


  useEffect(() => {
    const canvas = document.getElementById("impactChart") as HTMLCanvasElement | null;
    if (!canvas) return;

    const chartInstance = new Chart(canvas, {
      type: "line",
      data: {
        labels: ["June", "July", "Aug", "Sept", "Oct", "Nov"],
        datasets: [
          { label: "Donations", data: [50, 75, 100, 120, 130, 140], borderColor: "#4CAF50", fill: false },
          { label: "Volunteers", data: [10, 12, 14, 15, 17, 19], borderColor: "#2196F3", fill: false },
        ],
      },
      options: { responsive: true, plugins: { legend: { position: "bottom" } } },
    });

    return () => chartInstance.destroy();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-container3">
      <Sidebar />

      <main className="main-content3">
        <h1>Welcome, {profile?.full_name || "Community Member"}</h1>
        <OverviewCards />

        <section className="recent-activities3">
          <h2>Recent Activities</h2>
          <ul>
            <li>✅ Food packs distributed (Nov 2, 2025)</li>
            <li>🚧 Preparing Holiday Meal Program (Dec 20, 2025)</li>
            <li>📦 Donated school supplies (Oct 18, 2025)</li>
          </ul>
        </section>

        <section className="charts3">
          <h2>Impact Overview</h2>
          <canvas id="impactChart"></canvas>
        </section>
      </main>

      <ProfileCard
        name={profile?.full_name || "Unknown"}
        contact={profile?.phone || "N/A"}
         email={profile?.email || "N/A"}
         city = {profile?.city || "N/A"}
        region= {profile?.state_region || ""}
        category={profile?.org_focus || "N/A"}
         onProfileUpdated={fetchProfile}
      />
    </div>
  );
};

export default CommunityDashboard;