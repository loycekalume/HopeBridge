import React, { useState, useEffect } from "react";
import "../../styles/donorDashboard.css";
import { useAuth } from "../../context/authContext";
import DonationFormModal from "../../components/donor/donationForm";
import DashboardLayout from "../../components/donor/dashboardLayout";
import { apiCall, API_BASE_URL } from "../../utils/api"; 
import type { DonationFormData } from "../../types/donationForm";
import type { DashboardData, Donation } from "../../types/donor";

const initialData: DashboardData = {
  stats: { totalDonations: 0, beneficiariesHelped: 0, impactScore: "0%" },
  recentDonations: [],
};

// --- Single Donation Card ---
const DonationItem: React.FC<{ item: Donation; onImageClick: (url: string) => void }> = ({
  item,
  onImageClick,
}) => {
  const imageUrl = item.photo_urls?.[0]
    ? item.photo_urls[0].startsWith("http")
      ? item.photo_urls[0]
      : `${API_BASE_URL}${item.photo_urls[0].startsWith("/") ? "" : "/"}${item.photo_urls[0]}`
    : "https://via.placeholder.com/120x120?text=Donation";

  const matchedText = item.matched_to || "Awaiting match";
  const statusClass = item.status.toLowerCase();
  const timeAgo = new Date(item.created_at).toLocaleDateString();

  return (
    <div className="donation-card">
      <div className="donation-image" onClick={() => onImageClick(imageUrl)}>
        <img src={imageUrl} alt={item.item_name} />
      </div>

      <div className="donation-info">
        <h4>{item.item_name}</h4>
        <p className="meta">
          <i className="fas fa-tag"></i> {item.category} • {timeAgo} •{" "}
          <span className="matched">{matchedText}</span>
        </p>
      </div>

      <div className="donation-actions">
        <span className={`status ${statusClass}`}>{item.status}</span>
        <button className="btn-details">View</button>
      </div>
    </div>
  );
};

const DonorDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // now used
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const closePreview = () => setPreviewImage(null);

  // --- Fetch Dashboard Data ---
  const fetchDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null); // reset error
    try {
      const data: DashboardData = await apiCall(
        "/api/donations/dashboard",
        "GET",
        undefined,
        token ?? undefined
      );

      setDashboardData(data);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard. Please check your backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.user_id]);

  // --- Handle Donation Submission ---
  const handleDonationSubmit = async (formData: DonationFormData) => {
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("category", formData.category);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("condition", formData.condition);
      formDataToSend.append("quantity", formData.quantity.toString());
      formDataToSend.append("location", formData.location);
      formDataToSend.append("availability", formData.availability);
      formData.photos.forEach((file) => formDataToSend.append("photos", file));

      const res = await fetch(`${API_BASE_URL}/api/donations`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: formDataToSend,
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        alert("Donation posted successfully!");
        await fetchDashboardData();
        closeModal();
      } else {
        alert(`Failed: ${data.message || "Server error"}`);
      }
    } catch (err) {
      console.error("Donation submission error:", err);
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  const { stats, recentDonations } = dashboardData;

  return (
    <DashboardLayout title="Donor Dashboard">
      <div className="donor-dashboard">
        <div className="dashboard-header">
          <h3>Hello, {user?.full_name || "Donor"} 👋</h3>
          <p>Here’s an overview of your impact and donations.</p>
          <button className="btn-primary" onClick={openModal}>
            + Post Donation
          </button>
        </div>

        {/* Show error if it exists */}
        {error && <p className="error-message">{error}</p>}

        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <i className="fas fa-box"></i>
            <h3>{stats.totalDonations}</h3>
            <p>Total Donations</p>
          </div>
          <div className="stat-card">
            <i className="fas fa-users"></i>
            <h3>{stats.beneficiariesHelped}</h3>
            <p>Beneficiaries Helped</p>
          </div>
          <div className="stat-card">
            <i className="fas fa-chart-line"></i>
            <h3>{stats.impactScore}</h3>
            <p>Impact Score</p>
          </div>
        </div>

        {/* Recent Donations */}
        <div className="recent-section">
          <h3>Recent Donations</h3>
          {recentDonations.length > 0 ? (
            <div className="donation-list">
              {recentDonations.map((item) => (
                <DonationItem
                  key={item.donation_id}
                  item={item}
                  onImageClick={(url) => setPreviewImage(url)}
                />
              ))}
            </div>
          ) : (
            <p className="no-data">No donations yet. Start by posting your first one!</p>
          )}
        </div>
      </div>

      <DonationFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleDonationSubmit}
        isSubmitting={isSubmitting}
      />

      {previewImage && (
        <div className="image-preview-modal" onClick={closePreview}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Donation Preview" />
            <button className="close-preview" onClick={closePreview}>
              ✖
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DonorDashboard;
