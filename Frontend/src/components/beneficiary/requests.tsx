import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/beneficiary/sidebar";
import RequestCard from "../../components/beneficiary/matchRequestCard";
import RequestHelpModal from "../../components/beneficiary/requestModal";
import { apiCall } from "../../utils/api";
import type { Request } from "../../types/beneficiary";
import "../../styles/beneficiacyDashboard.css";

const Requests: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiCall(
        "/api/beneficiary/requests",
        "GET",
        undefined,
        token || ""
      );

      // Map backend response
      const formatted: Request[] = data.requests.map((r: any) => ({
        id: r.request_id,
        name: r.title,
        category: r.category, // ✅ use category
        timeAgo: new Date(r.created_at).toLocaleDateString(),
        status: r.status,
        isMatch: !!r.matched_donation_id,
        matchedDonation: r.matched_donation_id
          ? {
            donor: r.donor_name,
            quantity: r.donation_quantity,
            location: r.donor_location,
            matchPercent: Math.min((r.donation_quantity / r.quantity) * 100, 100).toFixed(0),
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
                <RequestCard key={request.id} data={request} />
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
