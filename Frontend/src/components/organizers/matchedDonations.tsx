// src/pages/dashboards/MatchedDonations.tsx
import React, { useEffect, useState } from "react";
import OrganizerLayout from "../../Layouts/organizerLayout";
import { apiCall } from "../../utils/api";
import { useAuth } from "../../context/authContext";
import "../../styles/organizer.css";

type MatchedDonation = {
  donation_id: number;
  item_name: string;
  donor_name: string;
  beneficiary_name: string;
  location: string | null;
  status: "Pending" | "Matched" | "In Transit" | "Delivered" | "Cancelled" | string;
  updated_at?: string;
};

const MatchedDonations: React.FC = () => {
  const { user, token, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [matched, setMatched] = useState<MatchedDonation[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ✅ Fetch organizer profile for sidebar
  useEffect(() => {
    if (!user?.user_id || !token) return;

    const fetchProfile = async () => {
      try {
        const res = await apiCall(
          `/api/organizerProfile/${user.user_id}/profile`,
          "GET",
          undefined,
          token ?? undefined
        );
        setProfile(res);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [user, token]);

  // ✅ Fetch matched donations
  useEffect(() => {
    if (!token || loading) return;

    const fetchMatched = async () => {
      setLoadingData(true);
      try {
        const res = await apiCall(
          "/api/organizerProfile/matched-donations",
          "GET",
          undefined,
          token ?? undefined
        );
        const data = res.data || res;
        setMatched(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching matched donations:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchMatched();
  }, [token, loading]);

  // ✅ Optimistic status update helper
  const updateStatusLocally = (donationId: number, status: string) => {
    setMatched((prev) =>
      prev.map((d) => (d.donation_id === donationId ? { ...d, status, updated_at: new Date().toISOString() } : d))
    );
  };

  // ✅ Mark donation as delivered
  const handleMarkDelivered = async (donationId: number) => {
    if (!window.confirm("Mark this donation as Delivered?")) return;
    try {
      await apiCall(
        `/api/organizerProfile/matched-donations/${donationId}`,
        "PUT",
        { status: "Delivered" },
        token ?? undefined
      );
      updateStatusLocally(donationId, "Delivered");
      alert("Donation marked as Delivered");
    } catch (err: any) {
      console.error("Error marking delivered:", err);
      alert(err?.message || "Failed to update status");
    }
  };

  // ✅ Handle manual status update
  const handleUpdate = async (donationId: number) => {
    const next = window.prompt("Set status (In Transit / Delivered / Cancelled):", "In Transit");
    if (!next) return;
    try {
      await apiCall(
        `/api/organizerProfile/matched-donations/${donationId}`,
        "PUT",
        { status: next },
        token ?? undefined
      );
      updateStatusLocally(donationId, next);
      alert("Status updated");
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert(err?.message || "Failed to update status");
    }
  };

  // ✅ Handle deletion of a matched donation
  const handleDelete = async (donationId: number) => {
    if (!window.confirm("Are you sure you want to delete this matched donation?")) return;
    try {
      await apiCall(
        `/api/organizerProfile/matched-donations/${donationId}`,
        "DELETE",
        undefined,
        token ?? undefined
      );
      setMatched((prev) => prev.filter((d) => d.donation_id !== donationId));
      alert("Donation deleted successfully");
    } catch (err: any) {
      console.error("Error deleting donation:", err);
      alert(err?.message || "Failed to delete donation");
    }
  };

  // ✅ Local filtering
  const filtered = matched.filter((m) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      (m.item_name && m.item_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.donor_name && m.donor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.beneficiary_name && m.beneficiary_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus ? m.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <p>Loading layout...</p>;

  return (
    <OrganizerLayout profile={profile}>
      <main className="main-content2">
        <h2>Matched Donations</h2>
        <p className="description">Here you can view, manage, or delete donations matched to beneficiaries.</p>

        <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
          <input
            placeholder="Search by item, donor or beneficiary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", flex: 1 }}
          />

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
            <option value="">All Statuses</option>
            <option value="Matched">Matched</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <section className="table-section2">
          <table>
            <thead>
              <tr>
                <th>Donation Item</th>
                <th>Donor</th>
                <th>Beneficiary</th>
                <th>Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loadingData ? (
                <tr>
                  <td colSpan={6}>Loading matched donations...</td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((d) => (
                  <tr key={d.donation_id}>
                    <td>{d.item_name}</td>
                    <td>{d.donor_name}</td>
                    <td>{d.beneficiary_name}</td>
                    <td>{d.location || "N/A"}</td>
                    <td>
                      <span
                        className={
                          d.status === "Delivered"
                            ? "status verified"
                            : d.status === "In Transit"
                            ? "status in-transit"
                            : d.status === "Matched"
                            ? "status pending"
                            : "status pending"
                        }
                      >
                        {d.status}
                      </span>
                    </td>
                    <td>
                      {d.status !== "Delivered" ? (
                        <>
                          <button className="approve" onClick={() => handleMarkDelivered(d.donation_id)}>
                            Delivered
                          </button>{" "}
                          <button className="approve" onClick={() => handleUpdate(d.donation_id)}>
                            Update
                          </button>{" "}
                          <button className="reject" onClick={() => handleDelete(d.donation_id)}>
                            Delete
                          </button>
                        </>
                      ) : (
                        <button className="reject" disabled>
                          Completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>No matched donations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </OrganizerLayout>
  );
};

export default MatchedDonations;
