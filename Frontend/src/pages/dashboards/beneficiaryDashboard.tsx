import React, { useState, useEffect, useCallback } from "react";
import StatsCard from "../../components/beneficiary/statsCard";
import MatchRequestCard from "../../components/beneficiary/matchRequestCard";
import type { Stat, Request } from "../../types/beneficiary";
import "../../styles/beneficiacyDashboard.css";
import RequestHelpModal from "../../components/beneficiary/requestModal";
import { apiCall } from "../../utils/api";
import Sidebar from "../../components/beneficiary/sidebar";
import EditProfileModal from "../../components/beneficiary/editModal";

const Dashboard: React.FC = () => {

  const [showModal, setShowModal] = useState(false);
  const [activeRequests, setActiveRequests] = useState<Request[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);


  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchRequests = useCallback(async () => {
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
  }, [token]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiCall(`/api/beneficiaryProfile/stats/${user.user_id}`, "GET", undefined, token || "");
      setStats([
        { label: "Active Requests", value: data.active_requests, iconClass: "fas fa-clock", iconType: "time" },
        { label: "Items Received", value: data.items_received, iconClass: "fas fa-box", iconType: "box" },
        { label: "Matched Donations", value: data.matched_donations, iconClass: "fas fa-check", iconType: "check" },
      ]);
    } catch (error: any) {
      console.error("Failed to fetch stats:", error.message);
    }
  }, [token, user.user_id]);

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [fetchRequests, fetchStats]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
      fetchRequests();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchRequests]);

  // Function to generate initials
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="dashboard-wrapperb">
      <Sidebar userRole="Beneficiaryb" />

      <div className="dashboard-mainb">
        {/* MAIN CONTENT LEFT SIDE */}
        <div className="dashboard-content-left">
          <header className="dashboard-headerb">
            <h1>Welcome back, {user.full_name?.split(" ")[0]} 👋</h1>
            <p>Here is your activity overview</p>


            <div className="dashboard-actionsb">
              <button className="request-help-btn" onClick={() => setShowModal(true)}>
                <i className="fas fa-plus"></i> Request Help
              </button>


            </div>
          </header>

          <section className="stats-cardsb">
            {stats.length === 0 ? (
              <p>Loading stats...</p>
            ) : (
              stats.map((stat) => <StatsCard key={stat.label} stat={stat} />)
            )}
          </section>

          <section className="active-requestsb">
            <h2>Your Active Requests</h2>
            <p className="section-subtitleb">Track the status of your help requests</p>

            {loading ? (
              <p>Loading your requests...</p>
            ) : activeRequests.length > 0 ? (
              <div className="active-requests-grid">
                {activeRequests.map((request) => (
                  <MatchRequestCard key={request.id} data={request} />
                ))}
              </div>
            ) : (
              <p>No requests yet. Create one to get started.</p>
            )}
          </section>


          {showModal && (
            <RequestHelpModal
              onClose={() => setShowModal(false)}
              onRequestSubmitted={() => {
                fetchRequests();
                fetchStats();
              }}
            />
          )}
        </div>

        {/* PROFILE CARD ON RIGHT */}
        <div className="profile-card-container">
          <div className="profile-cardb">
            <div className="profile-avatarb">{getInitials(user.full_name)}</div>

            <h3 className="profile-nameb">{user.full_name}</h3>

            <div className="profile-detailsb">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || "Not set"}</p>
              <p><strong>City:</strong> {user.city || "Not set"}</p>
            </div>

            <button
              className="edit-profile-btnb"
              onClick={() => setShowProfileModal(true)}
            >
              Edit Profile
            </button>
            {showProfileModal && (
              <EditProfileModal
                onClose={() => setShowProfileModal(false)}
                user={user}
                token={token || ""}
                onUpdated={() => window.location.reload()}
              />
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
