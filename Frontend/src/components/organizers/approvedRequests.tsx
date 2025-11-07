import React, { useEffect, useState } from "react";
import "../../styles/organizer.css";
import { apiCall } from "../../utils/api";
import { useAuth } from "../../context/authContext";
import OrganizerLayout from "../../Layouts/organizerLayout";

const ApprovedRequests: React.FC = () => {
  const { user, token, loading } = useAuth();
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");

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
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user, token]);

  // ✅ Fetch approved users
  useEffect(() => {
    if (!token || loading) return;

    const fetchApprovedUsers = async () => {
      try {
        const res = await apiCall("/api/organizerProfile/approved", "GET", undefined, token ?? undefined);
        setApprovedUsers(res.data || res);
        setFilteredUsers(res.data || res);
      } catch (error) {
        console.error("Error fetching approved users:", error);
      }
    };

    fetchApprovedUsers();
  }, [token, loading]);

  // ✅ Handle search and filter
  const handleSearch = () => {
    const filtered = approvedUsers.filter((user) => {
      const matchesSearch =
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole ? user.role === filterRole : true;
      return matchesSearch && matchesRole;
    });
    setFilteredUsers(filtered);
  };

  // ✅ Handle view & revoke actions
  const handleView = (user: any) => {
    alert(`Viewing details for ${user.full_name}`);
  };

  const handleRevoke = async (id: number) => {
    if (!window.confirm("Are you sure you want to revoke approval?")) return;

    try {
      await apiCall(`/api/organizerProfile/revoke/${id}`, "PUT", {}, token ?? undefined);
      alert("Approval revoked successfully");
      setFilteredUsers((prev) => prev.filter((user) => user.user_id !== id));
    } catch (error: any) {
      alert(error.message || "Failed to revoke approval");
    }
  };

  if (loading) return <p>Loading approved requests...</p>;

  return (
    <OrganizerLayout profile={profile}>
      <main className="main-content2">
        <h2>Approved Requests</h2>
        <p className="description">
          Below is a list of verified and approved users. You can view details or revoke their approval if necessary.
        </p>

        {/* ✅ Search & Filter Controls */}
        <div className="search-filter-bar">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="">All Roles</option>
            <option value="volunteer">Volunteer</option>
            <option value="donor">Donor</option>
            <option value="beneficiary">Beneficiary</option>
          </select>

          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>

        {/* ✅ Approved Users Table */}
        <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Location</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.full_name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.city || user.location || "N/A"}</td>
                  <td>
                    <span className="approve">Approved</span>
                  </td>
                  <td>
                    <button className="status pending" onClick={() => handleView(user)}>
                      View
                    </button>
                    <button className="reject" onClick={() => handleRevoke(user.user_id)}>
                      Revoke
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>No approved users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </OrganizerLayout>
  );
};

export default ApprovedRequests;
