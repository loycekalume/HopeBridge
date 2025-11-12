import React, { useEffect, useState } from "react";
import CompanySidebar from "../../components/company/sidebar";
import { apiCall } from "../../utils/api";
import "../../styles/companyDashboard.css";

interface Campaign {
  campaign_id: number;
  title: string;
  description: string;
  goal_amount: number;
  total_raised: number;
  start_date: string;
  end_date: string;
  status: string;
}

const CompanyCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    description: "",
    goal_amount: "",
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(true);

  // ✅ Fetch campaigns
  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await apiCall("/api/campaigns", "GET");
      if (res && Array.isArray(res.campaigns)) {
        setCampaigns(res.campaigns);
      } else {
        setCampaigns([]);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create new campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newCampaign,
        goal_amount: Number(newCampaign.goal_amount),
      };
      const res = await apiCall("/api/campaigns", "POST", payload);
      if (res.campaign) {
        setShowModal(false);
        setNewCampaign({
          title: "",
          description: "",
          goal_amount: "",
          start_date: "",
          end_date: "",
        });
        fetchCampaigns();
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  // ✅ Update campaign (PUT)
  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    try {
      const payload = {
        title: editingCampaign.title,
        description: editingCampaign.description,
        goal_amount: editingCampaign.goal_amount,
        total_raised: editingCampaign.total_raised,
        start_date: editingCampaign.start_date,
        end_date: editingCampaign.end_date,
        status: editingCampaign.status,
      };

      await apiCall(`/api/campaigns/${editingCampaign.campaign_id}`, "PUT", payload);
      setShowEditModal(false);
      setEditingCampaign(null);
      fetchCampaigns();
    } catch (error) {
      console.error("Error updating campaign:", error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="company-campaigns">
      <CompanySidebar />
      <main className="company-campaigns-main">
        <div className="campaigns-header">
          <h1>Company Campaigns</h1>
          <button className="create-btn" onClick={() => setShowModal(true)}>
            + New Campaign
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <p className="no-campaigns">No campaigns found.</p>
        ) : (
          <div className="campaigns-grid">
            {campaigns.map((c) => {
              const progress = Math.min((c.total_raised / c.goal_amount) * 100, 100);
              return (
                <div key={c.campaign_id} className="campaign-card">
                  <h3>{c.title}</h3>
                  <p className="desc">
                    {c.description.length > 120
                      ? `${c.description.slice(0, 120)}...`
                      : c.description}
                  </p>

                  <div className="campaign-stats">
                    <p>
                      <strong>Goal:</strong> ${c.goal_amount.toLocaleString()}
                    </p>
                    <p>
                      <strong>Raised:</strong> ${c.total_raised.toLocaleString()}
                    </p>
                  </div>

                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>

                  <div className="campaign-footer">
                    <span
                      className={`status ${
                        c.status.toLowerCase() === "active"
                          ? "active"
                          : c.status.toLowerCase() === "completed"
                          ? "completed"
                          : "pending"
                      }`}
                    >
                      {c.status}
                    </span>
                    <button
                      className="view-btn"
                      onClick={() => {
                        setEditingCampaign(c);
                        setShowEditModal(true);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal — Create Campaign */}
      {showModal && (
        <div className="modal-overlay4">
          <div className="modal4">
            <h2>Create New Campaign</h2>
            <form onSubmit={handleCreateCampaign}>
              <input
                type="text"
                placeholder="Title"
                value={newCampaign.title}
                onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={newCampaign.description}
                onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Goal Amount"
                value={newCampaign.goal_amount}
                onChange={(e) => setNewCampaign({ ...newCampaign, goal_amount: e.target.value })}
                required
              />
              <div className="date-inputs">
                <input
                  type="date"
                  value={newCampaign.start_date}
                  onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                  required
                />
                <input
                  type="date"
                  value={newCampaign.end_date}
                  onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions4">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal — Edit Campaign */}
      {showEditModal && editingCampaign && (
        <div className="modal-overlay4">
          <div className="modal4">
            <h2>Edit Campaign</h2>
            <form onSubmit={handleUpdateCampaign}>
              <input
                type="text"
                value={editingCampaign.title}
                onChange={(e) =>
                  setEditingCampaign({ ...editingCampaign, title: e.target.value })
                }
              />
              <textarea
                value={editingCampaign.description}
                onChange={(e) =>
                  setEditingCampaign({ ...editingCampaign, description: e.target.value })
                }
              />
              <input
                type="number"
                value={editingCampaign.goal_amount}
                onChange={(e) =>
                  setEditingCampaign({
                    ...editingCampaign,
                    goal_amount: Number(e.target.value),
                  })
                }
              />
              <input
                type="number"
                value={editingCampaign.total_raised}
                onChange={(e) =>
                  setEditingCampaign({
                    ...editingCampaign,
                    total_raised: Number(e.target.value),
                  })
                }
              />
              <select
                value={editingCampaign.status}
                onChange={(e) =>
                  setEditingCampaign({
                    ...editingCampaign,
                    status: e.target.value,
                  })
                }
              >
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
              <div className="modal-actions4">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyCampaigns;
