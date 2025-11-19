import React, { useEffect, useState } from "react";
import Sidebar from "../../components/beneficiary/sidebar";
import "../../styles/beneficiacyDashboard.css";
import { apiCall } from "../../utils/api";
import { formatDistanceToNow } from "date-fns";
import RequestHelpModal from "./request";

interface Donation {
  donation_id: number;
  item_name: string;
  category: string;
  description: string;
  item_condition: string;
  quantity: number;
  location: string;
  availability: string;
  photo_urls?: string[];
  status: string;
  created_at: string;
  match_percentage?: number;
  donor_name?: string;
  donor_rating?: number;
}

const Donations: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOption, setSortOption] = useState("recent");
  const [searchTerm, setSearchTerm] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [detailsDonation, setDetailsDonation] = useState<Donation | null>(null);

  const token = localStorage.getItem("token");

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/api/beneficiaryProfile/donations", "GET", undefined, token || "");
      setDonations(data.donations || []);
      setFilteredDonations(data.donations || []);
    } catch (error: any) {
      console.error("Error fetching donations:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const getImageUrl = (photoUrl?: string) => {
    if (!photoUrl) return "https://via.placeholder.com/120x120?text=Donation";
    if (photoUrl.startsWith("http")) return photoUrl;
    return `http://localhost:3000${photoUrl.startsWith("/") ? "" : "/"}${photoUrl}`;
  };

  // Filtering + Sorting logic
  useEffect(() => {
    let filtered = [...donations];

    if (searchTerm.trim() !== "") {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.item_name.toLowerCase().includes(s) ||
          d.location.toLowerCase().includes(s)
      );
    }

    if (categoryFilter !== "All") {
      filtered = filtered.filter((d) => d.category === categoryFilter);
    }

    if (sortOption === "recent") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOption === "match") {
      filtered.sort((a, b) => (b.match_percentage || 0) - (a.match_percentage || 0));
    }

    setFilteredDonations(filtered);
  }, [searchTerm, categoryFilter, sortOption, donations]);

  const categories = ["All", ...Array.from(new Set(donations.map((d) => d.category)))];

  return (
    <div className="donations-wrapper">
      <Sidebar userRole="Beneficiary" />

      <div className="donations-main">
        {/* Header */}
        <div className="donations-header">
          <h1>Available Donations</h1>
          <p>Browse items donated by kind supporters</p>
        </div>

        {/* Filters */}
        <div className="filters-container">
          <input
            type="text"
            placeholder="Search by item or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="filter-select"
          >
            <option value="recent">Most Recent</option>
            <option value="match">Best Match</option>
          </select>
        </div>

        {/* Donation Cards */}
        {loading ? (
          <p>Loading donations...</p>
        ) : filteredDonations.length === 0 ? (
          <p>No donations found.</p>
        ) : (
          <div className="donations-grid">
            {filteredDonations.map((item) => (
              <div key={item.donation_id} className="donation-card">
                <div
                  className="card-image"
                  onClick={() => setPreviewImage(getImageUrl(item.photo_urls?.[0]))}
                >
                  <img src={getImageUrl(item.photo_urls?.[0])} alt={item.item_name} />
                  {item.match_percentage && (
                    <div className="match-badge">{item.match_percentage}% Match</div>
                  )}
                </div>

                <div className="card-body">
                  <h3>{item.item_name}</h3>
                  <p className="donation-category">{item.category}</p>

                  {item.donor_name && (
                    <div className="donor-info">
                      <div className="donor-avatar">{item.donor_name.charAt(0).toUpperCase()}</div>
                      <div>
                        <strong>{item.donor_name}</strong>
                        {item.donor_rating && (
                          <p className="rating"><i className="fas fa-star"></i> {item.donor_rating}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <p><strong>Condition:</strong> {item.item_condition}</p>
                  <p><strong>Qty:</strong> {item.quantity}</p>
                  <p><strong>Availability:</strong> {item.availability}</p>
                  <p className="location"><i className="fas fa-map-marker-alt"></i> {item.location}</p>
                  <p className="time">
                    Posted {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </p>

                  <div className="card-actions">
                    <button
                      className="btn-request"
                      onClick={() => {
                        setSelectedDonation(item);
                        setShowRequestModal(true);
                      }}
                    >
                      Request This
                    </button>

                    <button
                      className="btn-details"
                      onClick={() => setDetailsDonation(item)}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Preview Modal */}
        {previewImage && (
          <div className="preview-modal" onClick={() => setPreviewImage(null)}>
            <div className="preview-box" onClick={(e) => e.stopPropagation()}>
              <img src={previewImage} alt="Donation preview" />
              <button className="close-btn" onClick={() => setPreviewImage(null)}>✖</button>
            </div>
          </div>
        )}

        {showRequestModal && selectedDonation && (
          <RequestHelpModal
            donation={selectedDonation}
            onClose={() => setShowRequestModal(false)}
            onSubmitted={() => fetchDonations()}
          />
        )}

        {detailsDonation && (
          <div className="modal-overlay" onClick={() => setDetailsDonation(null)}>
            <div className="details-box" onClick={(e) => e.stopPropagation()}>
              <button className="details-close" onClick={() => setDetailsDonation(null)}>✖</button>
              <h2 className="details-title">{detailsDonation.item_name}</h2>
              <img
                src={getImageUrl(detailsDonation.photo_urls?.[0])}
                alt={detailsDonation.item_name}
                className="details-image"
              />
              <p className="details-desc">{detailsDonation.description}</p>
              <div className="details-info">
                <p><strong>Category:</strong> {detailsDonation.category}</p>
                <p><strong>Condition:</strong> {detailsDonation.item_condition}</p>
                <p><strong>Quantity:</strong> {detailsDonation.quantity}</p>
                <p><strong>Availability:</strong> {detailsDonation.availability}</p>
                <p><strong>Location:</strong> {detailsDonation.location}</p>
              </div>
              <button
                className="btn-request"
                onClick={() => {
                  setSelectedDonation(detailsDonation);
                  setShowRequestModal(true);
                  setDetailsDonation(null);
                }}
              >
                Request This
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Donations;
