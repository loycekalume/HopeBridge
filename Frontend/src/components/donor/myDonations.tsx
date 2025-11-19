import React, { useEffect, useState } from "react";
import { apiCall, API_BASE_URL } from "../../utils/api";
import { useAuth } from "../../context/authContext";
import Sidebar from "../../components/donor/sidebar";
import DonationFormModal from "../../components/donor/donationForm";
import type { DonationFormData } from "../../types/donationForm";
import { formatDistanceToNow } from "date-fns";
import "../../styles/donorDashboard.css";

const MyDonations: React.FC = () => {
  const { token } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Fetch donations
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const data = await apiCall(
          `/api/donations/mydonations`,
          "GET",
          undefined,
          token ?? undefined
        );

        setDonations(data.donations || []);
      } catch (err: any) {
        setError(err.message || "Failed to load donations");
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [token]);

  // Handle posting a new donation
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
        closeModal();

        // Refresh list
        const refetch = await apiCall(
          `/api/donations/mydonations`,
          "GET",
          undefined,
          token ?? undefined
        );

        setDonations(refetch.donations || []);
      } else {
        alert(data.message || "Failed to post donation.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtering logic
  const filtered = donations.filter((d) => {
    const matchText = d.item_name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter ? d.category === categoryFilter : true;
    return matchText && matchCategory;
  });

  return (
    <div className="mydonations-container">
      <Sidebar />

      <main className="mydonations-main">
        {/* Header row */}
        <div className="page-header-row">
          <h1 className="page-title">My Donations</h1>
          <button className="btn-primary" onClick={openModal}>
            + Post Donation
          </button>
        </div>

        {/* Search + filters */}
        <div className="donation-filters">
          <input
            type="text"
            placeholder="Search by item name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="Food">Food</option>
            <option value="Clothes">Clothes</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
          </select>

          <button
            className="filter-btn"
            onClick={() => {
              setSearch("");
              setCategoryFilter("");
            }}
          >
            Reset
          </button>
        </div>

        {loading && <p>Loading donations...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && filtered.length === 0 && (
          <p className="nodata-text">No donations match your search.</p>
        )}

        <div className="donation-grid">
          {filtered.map((donation) => {
            const imageUrl = donation.photo_urls?.[0]
              ? donation.photo_urls[0].startsWith("http")
                ? donation.photo_urls[0]
                : `${API_BASE_URL}${donation.photo_urls[0].startsWith("/") ? "" : "/"
                }${donation.photo_urls[0]}`
              : "https://via.placeholder.com/150?text=Donation";

            return (
              <div key={donation.donation_id} className="donation-card">
                <img src={imageUrl} className="donation-img" alt="Donation" />

                <div className="donation-info">
                  <h3 className="donation-title">{donation.item_name}</h3>
                  <p className="donation-category">Category: {donation.category}</p>
                  <p className="donation-status">Status: {donation.status}</p>

                  {/* Match Info */}
                  {donation.matched_to ? (
                    <div className="donation-match">
                      <p className="match-text">
                        Matched with: <span className="match-name">{donation.matched_to}</span>
                      </p>
                      <p className="match-details">
                        City: {donation.matched_city} • Needs: {donation.matched_quantity} items
                        {donation.match_percentage !== null && (
                          <> • Match: {donation.match_percentage}%</>
                        )}
                      </p>
                      <button
                        className="match-details-btn"
                        onClick={() =>
                          alert(
                            `Beneficiary: ${donation.matched_to}\nCity: ${donation.matched_location}\nNeeds: ${donation.matched_quantity}\nMatch: ${donation.match_percentage}%`
                          )
                        }
                      >
                        View Details
                      </button>
                    </div>
                  ) : (
                    <p className="match-pending">Not matched yet</p>
                  )}

                  <p className="donation-date">
                    Donated{" "}
                    {formatDistanceToNow(new Date(donation.created_at), {
                      addSuffix: true,
                    })}
                  </p>

                </div>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        <DonationFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleDonationSubmit}
          isSubmitting={isSubmitting}
        />
      </main>
    </div>
  );
};

export default MyDonations;
