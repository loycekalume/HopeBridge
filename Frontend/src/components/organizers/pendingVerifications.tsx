import React, { useEffect, useState } from "react";
import "../../styles/organizer.css";
import { apiCall } from "../../utils/api";
import { useAuth } from "../../context/authContext";
import { CheckCircle, XCircle, IdCard, User } from "lucide-react";
import DashboardLayout from "../../Layouts/organizerLayout";

const PendingVerificationsPage: React.FC = () => {
  const { user, token, loading } = useAuth();
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [profile, setProfile] = useState<any>(null);

  // Fetch profile for the layout
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
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user, token]);

  useEffect(() => {
    if (!token || loading) return;

    const fetchPending = async () => {
      try {
        const res = await apiCall("/api/organizerprofile/pending-verifications", "GET", undefined, token ?? undefined);
        setPendingVerifications(res.data || res);
      } catch (err) {
        console.error("[PENDING FETCH ERROR]", err);
      }
    };

    fetchPending();
  }, [token, loading]);

  const handleApprove = async (id: number) => {
    try {
      await apiCall(`/api/organizerprofile/verify/${id}`, "PUT", { action: "approve" }, token ?? undefined);
      setPendingVerifications((prev) => prev.filter((p) => p.user_id !== id));
      alert("Approved");
    } catch (err: any) {
      console.error("[APPROVE ERROR]", err);
      alert(err.message || "Failed to approve");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await apiCall(`/api/organizerprofile/verify/${id}`, "PUT", { action: "reject" }, token ?? undefined);
      setPendingVerifications((prev) => prev.filter((p) => p.user_id !== id));
      alert("Rejected");
    } catch (err: any) {
      console.error("[REJECT ERROR]", err);
      alert(err.message || "Failed to reject");
    }
  };

  const filtered = pendingVerifications.filter((p) => {
    const matchesSearch = p.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || p.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) return <p>Loading pending verifications...</p>;

  return (
    <DashboardLayout profile={profile}>
      <h1>Pending Verifications</h1>

      <div className="filters" style={{ marginBottom: 12 }}>
        <input placeholder="Search by name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="donor">Donor</option>
          <option value="beneficiary">Beneficiary</option>
        </select>
      </div>

      <section className="table-section2">
        <table>
          <thead>
            <tr>
              <th><User size={14} /> Name</th>
              <th>Role</th>
              <th><IdCard size={14} /> ID Proof</th>
              <th>Recommendation</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((p) => (
                <tr key={p.user_id}>
                  <td>{p.full_name}</td>
                  <td>{p.role}</td>
                  <td><a href={p.id_proof_url} target="_blank" rel="noreferrer">View</a></td>
                  <td>{p.recommendation_url ? <a href={p.recommendation_url} target="_blank" rel="noreferrer">View</a> : "—"}</td>
                  <td><span className="status pending">Pending</span></td>
                  <td>
                    <button className="approve" onClick={() => handleApprove(p.user_id)}><CheckCircle size={14} /> Approve</button>
                    <button className="reject" onClick={() => handleReject(p.user_id)}><XCircle size={14} /> Reject</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6}>No pending verifications found.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </DashboardLayout>
  );
};

export default PendingVerificationsPage;