import React, { useEffect, useState } from "react";
import "../../styles/beneficiaryDonations.css";
import { apiCall } from "../../utils/api";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Donation {
  donation_id: number;
  item_name: string;
  category: string;
  description: string;
  item_condition: string;
  quantity: number;
  location: string;
  availability: string;
  photo_urls: string[];
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

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const data = await apiCall(
        "/api/beneficiaryProfile/donations",
        "GET",
        undefined,
        token || ""
      );
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

  // ✅ Filtering & sorting logic
  useEffect(() => {
    let filtered = [...donations];

    // Search by name or location
    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.item_name.toLowerCase().includes(lowerSearch) ||
          d.location.toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by category
    if (categoryFilter !== "All") {
      filtered = filtered.filter((d) => d.category === categoryFilter);
    }

    // Sort
    if (sortOption === "recent") {
      filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortOption === "match") {
      filtered.sort(
        (a, b) => (b.match_percentage || 0) - (a.match_percentage || 0)
      );
    }

    setFilteredDonations(filtered);
  }, [searchTerm, categoryFilter, sortOption, donations]);

  const categories = ["All", ...new Set(donations.map((d) => d.category))];

  return (
    <div className="donations-container1">
      {/* Header */}
      <div className="donations-header1">
        <button className="back-btn" onClick={() => navigate("/beneficiary")}>
          ← Back to Dashboard
        </button>
        <h1 className="donations-title1">Available Donations</h1>
        <p className="donations-subtitle1">Browse items donated by kind supporters</p>
      </div>

      {/* 🔍 Filters Section */}
      <div className="donations-filters">
        <input
          type="text"
          placeholder="Search by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
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
          <option value="recent">Sort by: Most Recent</option>
          <option value="match">Sort by: Match %</option>
        </select>
      </div>

      {/* Donation Cards */}
      {loading ? (
        <p>Loading donations...</p>
      ) : filteredDonations.length === 0 ? (
        <p>No donations found.</p>
      ) : (
        <div className="donations-grid1">
          {filteredDonations.map((item) => (
            <div key={item.donation_id} className="donation-card1">
              <div
                className="donation-image-wrapper1"
                onClick={() => setPreviewImage(getImageUrl(item.photo_urls?.[0]))}
              >
                <img
                  src={getImageUrl(item.photo_urls?.[0])}
                  alt={item.item_name}
                  className="donation-image1"
                />
                {item.match_percentage && (
                  <div className="match-badge">{item.match_percentage}% Match</div>
                )}
              </div>

              <div className="donation-content1">
                <h3>{item.item_name}</h3>
                <p className="category">{item.category}</p>

                {item.donor_name && (
                  <div className="donor-info">
                    <div className="donor-avatar">
                      {item.donor_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{item.donor_name}</strong>
                      {item.donor_rating && (
                        <p className="rating">
                          <i className="fas fa-star"></i> {item.donor_rating}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <p>
                  <strong>Condition:</strong> {item.item_condition}
                </p>
                <p>
                  <strong>Quantity:</strong> {item.quantity}
                </p>
                <p>
                  <strong>Availability:</strong> {item.availability}
                </p>
                <p>
                  <i className="fas fa-map-marker-alt"></i> {item.location}
                </p>
                <p className="time">
                  Posted{" "}
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </p>

                <div className="donation-actions">
                  <button className="btn-request1">Request This</button>
                  <button className="btn-details1">Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="image-preview-modal" onClick={() => setPreviewImage(null)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Donation Preview" />
            <button className="close-preview" onClick={() => setPreviewImage(null)}>
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donations;
