import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { apiCall } from "../../utils/api";
import DashboardLayout from "../../Layouts/organizerLayout";

const VolunteerDashboard: React.FC = () => {
  const { user, token, loading } = useAuth();

  const [stats, setStats] = useState({
    verifiedDonors: 0,
    verifiedBeneficiaries: 0,
    pendingVerifications: 0,
    matchedDonations: 0,
  });
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  // === Fetch Overview and Pending Verifications ===
  useEffect(() => {
    if (!token || loading) return;

    const fetchOverview = async () => {
      try {
        const res = await apiCall("/api/organizerProfile/overview", "GET", undefined, token ?? undefined);
        setStats(res.data || res);
      } catch (error) {
        console.error("Error fetching overview:", error);
      }
    };

    const fetchPending = async () => {
      try {
        const res = await apiCall("/api/organizerProfile/pending-verifications", "GET", undefined, token ?? undefined);
        setPendingVerifications(res.data || res);
      } catch (error) {
        console.error("Error fetching pending verifications:", error);
      }
    };

    const fetchDeliveryLogs = async () => {
      try {
        const res = await apiCall("/api/organizerProfile/delivery-logs", "GET", undefined, token ?? undefined);
        setDeliveryLogs(res.data || res);
      } catch (error) {
        console.error("Error fetching delivery logs:", error);
      }
    };

    fetchOverview();
    fetchPending();
    fetchDeliveryLogs();
  }, [token, loading]);

  // === Fetch Profile ===
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

  // === Actions ===
  const handleApprove = async (id: number) => {
    try {
      await apiCall(`/api/organizerProfile/verify/${id}`, "PUT", { action: "approve" }, token ?? undefined);
      alert("Approved successfully!");
      // Refresh pending verifications
      const res = await apiCall("/api/organizerProfile/pending-verifications", "GET", undefined, token ?? undefined);
      setPendingVerifications(res.data || res);
    } catch (error: any) {
      alert(error.message || "Failed to approve");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await apiCall(`/api/organizerProfile/verify/${id}`, "PUT", { action: "reject" }, token ?? undefined);
      alert("Rejected successfully!");
      // Refresh pending verifications
      const res = await apiCall("/api/organizerProfile/pending-verifications", "GET", undefined, token ?? undefined);
      setPendingVerifications(res.data || res);
    } catch (error: any) {
      alert(error.message || "Failed to reject");
    }
  };

  const handleDelivered = (donation: string) => {
    alert(`${donation} marked as delivered`);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <DashboardLayout profile={profile}>
      <h1>Volunteer Dashboard</h1>

      {/* ==== OVERVIEW ==== */}
      <section className="overview2">
        <div className="card2"><h3>Verified Donors</h3><p>{stats.verifiedDonors}</p></div>
        <div className="card2"><h3>Verified Beneficiaries</h3><p>{stats.verifiedBeneficiaries}</p></div>
        <div className="card2"><h3>Pending Verifications</h3><p>{stats.pendingVerifications}</p></div>
        <div className="card2"><h3>Matched Donations</h3><p>{stats.matchedDonations}</p></div>
      </section>

      {/* ==== PENDING VERIFICATIONS ==== */}
      <section className="table-section2">
        <h2>Pending Verifications</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>ID Proof</th>
              <th>Recommendation</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingVerifications.length > 0 ? (
              pendingVerifications.map((person) => (
                <tr key={person.user_id}>
                  <td>{person.full_name}</td>
                  <td>{person.role}</td>
                  <td><a href={person.id_proof_url}>View ID</a></td>
                  <td>{person.recommendation_url ? <a href={person.recommendation_url}>View</a> : "—"}</td>
                  <td><span className="status pending">Pending</span></td>
                  <td>
                    <button className="approve" onClick={() => handleApprove(person.user_id)}>Approve</button>
                    <button className="reject" onClick={() => handleReject(person.user_id)}>Reject</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6}>No pending verifications</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {/* ==== DELIVERY LOGS ==== */}
      <section className="table-section2">
        <h2>Delivery Logs</h2>
        <table>
          <thead>
            <tr>
              <th>Donation</th>
              <th>Beneficiary</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {deliveryLogs.length > 0 ? (
              deliveryLogs.map((log, index) => (
                <tr key={index}>
                  <td>{log.donation}</td>
                  <td>{log.beneficiary}</td>
                  <td><span className="status in-transit">{log.status}</span></td>
                  <td><button className="approve" onClick={() => handleDelivered(log.donation)}>Delivered</button></td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4}>No delivery logs found</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </DashboardLayout>
  );
};

export default VolunteerDashboard;