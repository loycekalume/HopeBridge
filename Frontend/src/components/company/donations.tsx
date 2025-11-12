import React, { useEffect, useState } from "react";
import CompanySidebar from "../../components/company/sidebar";
import { apiCall } from "../../utils/api";
import "../../styles/companyDashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const CompanyDonations: React.FC = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<any[]>([]);
  const [campaignStats, setCampaignStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterCampaign, setFilterCampaign] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  const [selectedDonation, setSelectedDonation] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchDonations = async () => {
    try {
      const res = await apiCall("/api/company/donations", "GET");
      setDonations(res.donations);
      setFilteredDonations(res.donations);
      setCampaignStats(res.campaignStats);
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // Filter donations whenever filters change
  useEffect(() => {
    let filtered = donations;

    if (filterCampaign)
      filtered = filtered.filter(
        (d) => d.campaign_name.toLowerCase() === filterCampaign.toLowerCase()
      );

    if (filterType)
      filtered = filtered.filter(
        (d) => d.type.toLowerCase() === filterType.toLowerCase()
      );

    if (filterFromDate)
      filtered = filtered.filter(
        (d) => new Date(d.created_at) >= new Date(filterFromDate)
      );

    if (filterToDate)
      filtered = filtered.filter(
        (d) => new Date(d.created_at) <= new Date(filterToDate)
      );

    setFilteredDonations(filtered);
  }, [filterCampaign, filterType, filterFromDate, filterToDate, donations]);

  const handleViewDetails = (donation: any) => {
    setSelectedDonation(donation);
    setShowModal(true);
  };

  if (loading) return <div className="loading">Loading donations...</div>;

  return (
    <div className="company-donations-page">
      <CompanySidebar />

      <main className="donations-main">
        <div className="donations-header">
          <h1>Donations Overview</h1>
          <p>Track and analyze donations made to your campaigns.</p>
        </div>

       

        {/* Filters Section */}
        <div className="donation-filters">
          <input
            type="text"
            placeholder="Filter by campaign"
            value={filterCampaign}
            onChange={(e) => setFilterCampaign(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          />
          <label>
            From:{" "}
            <input
              type="date"
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
            />
          </label>
          <label>
            To:{" "}
            <input
              type="date"
              value={filterToDate}
              onChange={(e) => setFilterToDate(e.target.value)}
            />
          </label>
          <button
            onClick={() => {
              setFilterCampaign("");
              setFilterType("");
              setFilterFromDate("");
              setFilterToDate("");
            }}
          >
            Clear Filters
          </button>
        </div>

        {/* Donations Table */}
        <div className="donations-list">
          <h2>Recent Donations</h2>
          <table className="donations-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Campaign</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.map((donation, index) => (
                <tr key={index}>
                  <td>{donation.donor_name}</td>
                  <td>{donation.campaign_name}</td>
                  <td>${donation.amount.toLocaleString()}</td>
                  <td>{donation.type}</td>
                  <td>{new Date(donation.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => handleViewDetails(donation)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
 {/* Charts Section */}
        <div className="donation-charts">
          <div className="chart-box">
            <h3>Donations by Campaign</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="campaign_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_amount" fill="#0078d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h3>Donations by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  nameKey="type"
                  data={[
                    { type: "Funds", value: 1200 },
                    { type: "Supplies", value: 800 },
                    { type: "Food", value: 500 },
                  ]}
                  outerRadius={100}
                  label
                >
                  {COLORS.map((color, i) => (
                    <Cell key={i} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Donation Details Modal */}
        {showModal && selectedDonation && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Donation Details</h2>
              <p><strong>Donor:</strong> {selectedDonation.donor_name}</p>
              <p><strong>Campaign:</strong> {selectedDonation.campaign_name}</p>
              <p><strong>Amount:</strong> ${selectedDonation.amount.toLocaleString()}</p>
              <p><strong>Type:</strong> {selectedDonation.type}</p>
              <p><strong>Date:</strong> {new Date(selectedDonation.created_at).toLocaleDateString()}</p>
              {selectedDonation.message && (
                <p><strong>Message:</strong> {selectedDonation.message}</p>
              )}
              <div className="modal-actions">
                <button onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyDonations;
