import React, { useState, useEffect } from "react";
import "../../styles/donorDashboard.css";
import Footer from "../../components/home/footer";
import DonationFormModal from "../../components/donor/donationForm";
import { useAuth } from "../../context/authContext";
import type { DonationFormData } from "../../types/donationForm";
import type { DashboardData, Donation } from "../../types/donor";

const initialData: DashboardData = {
  stats: { totalDonations: 0, beneficiariesHelped: 0, impactScore: "0%" },
  recentDonations: [],
};

// --- Reusable Donation Item Component ---
const DonationItem: React.FC<{ item: Donation; onImageClick: (url: string) => void }> = ({ item, onImageClick }) => {
  const statusClass = item.status.toLowerCase();
  const matchedText = item.matched_to ? item.matched_to : "Awaiting match";
  const timeAgo = new Date(item.created_at).toLocaleDateString();

  //  Use backend image URL
  const imageUrl = item.photo_urls?.[0]
  ? item.photo_urls[0].startsWith("http")
    ? item.photo_urls[0]
    : `http://localhost:3000${item.photo_urls[0].startsWith("/") ? "" : "/"}${item.photo_urls[0]}`
  : "https://via.placeholder.com/120x120?text=Donation";

  return (
    <div className="donation-card">
      <div className="donation-image" onClick={() => onImageClick(imageUrl)}>
        <img src={imageUrl} alt={item.item_name} />
      </div>

      <div className="donation-info">
        <h4>{item.item_name}</h4>
        <p>
          <i className="fas fa-tag"></i> {item.category} • {timeAgo} • {matchedText}
        </p>
      </div>

      <div className="donation-actions">
        <span className={`status ${statusClass}`}>{item.status}</span>
        <button className="btn-details">View Details</button>
      </div>
    </div>
  );
};

const DonorDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const closePreview = () => setPreviewImage(null);

  // --- Fetch Dashboard Data ---
  const fetchDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/api/donations/dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        credentials: "include",
      });

      if (response.status === 401) throw new Error("Unauthorized: Please log in again.");
      if (!response.ok) throw new Error("Failed to load dashboard data.");

      const data: DashboardData = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard. Check your backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.user_id]);

  // --- ✅ Handle Donation Submission (With Real Images) ---
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

      // ✅ Attach each image file
      formData.photos.forEach((file) => formDataToSend.append("photos", file));

      const response = await fetch("http://localhost:3000/api/donations", {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formDataToSend, 
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        alert("Donation posted successfully! Awaiting match.");
        await fetchDashboardData();
        closeModal();
      } else {
        alert(`Submission Failed: ${data.message || "Server Error"}`);
      }
    } catch (err) {
      console.error("Donation submission error:", err);
      alert("A network error occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading dashboard data...</div>;

  const { stats, recentDonations } = dashboardData;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Welcome, {user?.full_name || "Donor"}!</h2>
          <p>Track your donations and impact</p>
          <button className="btn-donation" onClick={openModal}>
            <i className="fas fa-plus"></i> Post New Donation
          </button>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
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
        <div className="recent-donations">
          <h3>Recent Donations</h3>
          <p>Track your donation history and status</p>
          {recentDonations.length > 0 ? (
            recentDonations.map((item) => (
              <DonationItem key={item.donation_id} item={item} onImageClick={(url) => setPreviewImage(url)} />
            ))
          ) : error ? (
            <p className="error-message">Error loading history: {error}</p>
          ) : (
            <p className="no-data">No recent donations yet. Post your first donation!</p>
          )}
        </div>
      </div>

      <Footer />

      <DonationFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleDonationSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Image Preview Modal */}
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
    </div>
  );
};

export default DonorDashboard;
