import React, { useEffect, useState, useCallback } from "react";
import { apiCall } from "../../utils/api";
import Sidebar from "../../components/beneficiary/sidebar";
import MatchRequestCard from "../../components/beneficiary/matchRequestCard";
import RequestHelpModal from "../../components/beneficiary/requestModal";
import type { Request } from "../../types/beneficiary";
import "../../styles/beneficiacyDashboard.css";

const Requests: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Fetch requests
 const fetchRequests = useCallback(async () => {
  try {
    setLoading(true);
    const data = await apiCall(
      "/api/beneficiaryProfile/requests",
      "GET",
      undefined,
      token || ""
    );

    const formatted: Request[] = data.requests.map((r: any) => ({
      id: r.request_id,
      name: r.title,
      tag: r.category,
      timeAgo: new Date(r.created_at).toLocaleDateString(),
      status: r.status,
      isMatch: r.status === "Matched",
      matchedDonation: r.matchedDonation
        ? {
            donor: r.matchedDonation.donor_name, // donor who posted donation
            quantity: r.matchedDonation.quantity,
            location: r.matchedDonation.location,
            matchPercent: Math.min(
              (r.matchedDonation.quantity / r.quantity) * 100,
              100
            ).toFixed(0),
          }
        : null,
    }));

    setRequests(formatted);
  } catch (error: any) {
    console.error("Failed to fetch requests:", error.message);
  } finally {
    setLoading(false);
  }
}, [token]);


  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return (
    <div className="requests-wrapper">
      <Sidebar userRole="Beneficiary" />

      <div className="requests-main">
        <header className="requests-header">
          <h1>Your Requests</h1>
          <button className="request-help-btn" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus"></i> Request Help
          </button>
        </header>

        <section className="recent-requests">
          <h2>Recent Requests</h2>

          {loading ? (
            <p>Loading requests...</p>
          ) : requests.length > 0 ? (
            <div className="recent-requests-grid">
              {requests.map((request) => (
                <MatchRequestCard key={request.id} data={request} />
              ))}
            </div>
          ) : (
            <p>No requests yet. Click "Request Help" to create one.</p>
          )}
        </section>

        {showModal && (
          <RequestHelpModal
            onClose={() => setShowModal(false)}
            onRequestSubmitted={() => {
              fetchRequests();
              setShowModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Requests;
