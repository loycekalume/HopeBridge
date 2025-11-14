import React, { useEffect, useState } from "react";
import { apiCall, API_BASE_URL } from "../../utils/api";
import { useAuth } from "../../context/authContext";
import Sidebar from "../../components/donor/sidebar";
import { formatDistanceToNow } from "date-fns";
import "../../styles/donorDashboard.css";

const MyDonations: React.FC = () => {
  const { token } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const data = await apiCall(
          `/api/donations/dashboard`,
          "GET",
          undefined,
          token ?? undefined
        );
        setDonations(data);
      } catch (err: any) {
        setError(err.message || "Failed to load donations");
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [token]);

  const filtered = donations.filter((d) => {
    const matchText = d.item_name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter ? d.category === categoryFilter : true;
    return matchText && matchCategory;
  });

  return (
    <div className="mydonations-container">
      <Sidebar />

      <main className="mydonations-main">
        <h1 className="page-title">My Donations</h1>

        {/* Search + Filter */}
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
                : `${API_BASE_URL}${donation.photo_urls[0].startsWith("/") ? "" : "/"}${donation.photo_urls[0]}`
              : "https://via.placeholder.com/150?text=Donation";

            return (
              <div key={donation.donation_id} className="donation-card">
                <img src={imageUrl} className="donation-img" alt="Donation" />

                <div className="donation-info">
                  <h3 className="donation-title">{donation.item_name}</h3>
                  <p className="donation-category">Category: {donation.category}</p>
                  <p className="donation-status">Status: {donation.status}</p>
                  <p className="donation-date">
                    Donated {formatDistanceToNow(new Date(donation.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default MyDonations;
