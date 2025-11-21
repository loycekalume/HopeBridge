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
const DonationItem: React.FC<{
  item: Donation;
  onImageClick: (url: string) => void;
  onContact: (donation: Donation) => void;     // <-- Added
}> = ({ item, onImageClick, onContact }) => {

  const imageUrl = item.photo_urls?.[0]
    ? item.photo_urls[0].startsWith("http")
      ? item.photo_urls[0]
      : `${API_BASE_URL}${item.photo_urls[0].startsWith("/") ? "" : "/"}${item.photo_urls[0]}`
    : "https://via.placeholder.com/120x120?text=Donation";

  const matchedText = item.matched_to || "Awaiting match";
  const statusClass = item.status.toLowerCase();
  const timeAgo = new Date(item.created_at).toLocaleDateString();

  return (
    <div className="donation-cardd">
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

        {item.matched_to ? (
          <button
            className="btn-details"
            onClick={() => onContact(item)}     // <-- Works now
          >
            Contact
          </button>
        ) : (
          <button className="btn-disabled" disabled>
            Awaiting Match
          </button>
        )}
      </div>
    </div>
  );
};

const DonorDashboard: React.FC = () => {
  const { user: authUser, token } = useAuth();
  const user = authUser as typeof authUser & { phone?: string; city?: string };

  const [dashboardData, setDashboardData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contact modal states
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Donation | null>(null);

  const openContactModal = (donation: Donation) => {
    setSelectedContact(donation);
    setContactModalOpen(true);
  };

  const closeContactModal = () => {
    setSelectedContact(null);
    setContactModalOpen(false);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const closePreview = () => setPreviewImage(null);

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const data: DashboardData = await apiCall(
        "/api/donations/dashboard",
        "GET",
        undefined,
        token ?? undefined
      );
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.user_id]);

  // Handle Donation Submission
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

      await apiCall("/api/donations", "POST", formDataToSend, token ?? undefined);

      alert("Donation posted successfully!");
      await fetchDashboardData();
      closeModal();
    } catch (err: any) {
      alert(err.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  const { stats, recentDonations } = dashboardData;

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <DashboardLayout title="Donor Dashboard">
      <div className="donor-dashboard-right-layout">
        <div className="dashboard-main-section">
          <div className="dashboard-header">
            <h3>Hello, {user?.full_name || "Donor"} 👋</h3>
            <p>Here’s an overview of your impact and donations.</p>
            <button className="btn-primary" onClick={openModal}>
              + Post Donation
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}

          {/* Stats */}
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
                    onContact={openContactModal}    // <-- FIXED
                  />
                ))}
              </div>
            ) : (
              <p className="no-data">No donations yet. Start by posting your first one!</p>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="profile-card-container">
          <div className="profile-cardd">
            <div className="profile-avatard">{getInitials(user.full_name)}</div>
            <h3 className="profile-named">{user.full_name}</h3>

            <div className="profile-detailsd">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || "Not set"}</p>
              <p><strong>City:</strong> {user.city || "Not set"}</p>
            </div>

            <button className="edit-profile-btnd">Edit Profile</button>
          </div>
        </div>
      </div>

      {/* Donation Form Modal */}
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
            <button className="close-preview" onClick={closePreview}>✖</button>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {contactModalOpen && selectedContact && (
        <div className="contact-modal-overlay" onClick={closeContactModal}>
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Beneficiary Contact</h3>

            <p><strong>Name:</strong> {selectedContact.matched_to}</p>
            <p><strong>Email:</strong> {selectedContact.beneficiary_email}</p>
            <p><strong>Phone:</strong> {selectedContact.beneficiary_phone}</p>

            <a
              className="whatsapp-btn"
              href={`https://wa.me/${selectedContact.beneficiary_phone}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat on WhatsApp
            </a>

            <button className="close-contact-btn" onClick={closeContactModal}>Close</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DonorDashboard;
