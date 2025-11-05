import React, { useState, useEffect } from "react";
import StatsCard from "../../components/beneficiary/statsCard";
import MatchRequestCard from "../../components/beneficiary/matchRequestCard";
import type { Stat,  Request } from "../../types/beneficiary";
import "../../styles/beneficiacyDashboard.css";
import Footer from "../../components/home/footer";
import RequestHelpModal from "../../components/beneficiary/requestModal";
import { apiCall } from "../../utils/api";

const statsData: Stat[] = [
  { label: "Active Requests", value: 0, iconClass: "fas fa-clock", iconType: "time" },
  { label: "Items Received", value: 8, iconClass: "fas fa-box", iconType: "box" },
  { label: "Matched Donations", value: 5, iconClass: "fas fa-check", iconType: "check" },
];

const Dashboard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeRequests, setActiveRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/api/beneficiaryProfile/requests", "GET", undefined, token || "");
      const formatted = data.requests.map((r: any) => ({
        id: r.request_id,
        name: r.title,
        tag: r.category,
        timeAgo: new Date(r.created_at).toLocaleDateString(),
        status: r.status,
        isMatch: r.status === "Matched",
      }));
      setActiveRequests(formatted);
    } catch (error: any) {
      console.error("Failed to load requests:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        <h1>Beneficiary Dashboard</h1>
        <p>Find resources and track your requests</p>
        <button className="request-help-btn" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus"></i> Request Help
        </button>
      </header>

      {/* Stats Cards Section */}
      <section className="stats-cards">
        {statsData.map((stat) => (
          <StatsCard key={stat.label} stat={stat} />
        ))}
      </section>

      {/* Active Requests */}
      <section className="active-requests">
        <h2>Your Active Requests</h2>
        <p className="section-subtitle">Track the status of your help requests</p>
        {loading ? (
          <p>Loading your requests...</p>
        ) : activeRequests.length > 0 ? (
          activeRequests.map((request) => <MatchRequestCard key={request.id} data={request} />)
        ) : (
          <p>No requests yet. Create one to get started.</p>
        )}
      </section>

      {showModal && (
        <RequestHelpModal
          onClose={() => setShowModal(false)}
          onRequestSubmitted={fetchRequests}
        />
      )}
      <Footer />
    </div>
  );
};

export default Dashboard;
