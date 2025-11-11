import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import "../../styles/communityGroups.css";
import { UserPlus, Trash2, Users } from "lucide-react";
import { useAuth } from "../../context/authContext";
import { apiCall } from "../../utils/api";

interface Member {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  user_role: string;
  community_role: string;
  joined_at: string;
}

const CommunityMembers: React.FC = () => {
  const { user, token } = useAuth();
  const safeToken = token ?? undefined;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ email: "", role: "volunteer" });

  // Fetch community members
  const fetchMembers = async () => {
    if (!user || !safeToken) return;
    try {
      setLoading(true);
      const data = await apiCall(
        `/api/communities/${user.user_id}/members`,
        "GET",
        undefined,
        safeToken
      );
      setMembers(Array.isArray(data.members) ? data.members : []);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && safeToken) fetchMembers();
  }, [user, safeToken]);

  // Handle adding a member
  const handleAdd = async () => {
    if (!user || !safeToken) return;
    if (!form.email.trim()) return alert("Please enter a valid email");

    try {
      await apiCall(
        `/api/communities/${user.user_id}/members`,
        "POST",
        form,
        safeToken
      );
      setIsModalOpen(false);
      setForm({ email: "", role: "volunteer" });
      fetchMembers();
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Failed to add member. Please check the email.");
    }
  };

  // Handle deleting a member
  const handleDelete = async (memberId: number) => {
    if (!user || !safeToken) return;
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await apiCall(
        `/api/communities/${user.user_id}/members/${memberId}`,
        "DELETE",
        undefined,
        safeToken
      );
      fetchMembers();
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  // Filter search results
  const filtered = members.filter(
    (m) =>
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.community_role.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) return <div className="loading">Please log in to view members.</div>;
  if (loading) return <div className="loading">Loading members...</div>;

  return (
    <div className="dashboard-container3">
      <Sidebar />
      <main className="main-content3">
        <div className="header flex justify-between items-center mb-4">
          <h1 className="flex items-center gap-2">
            <Users size={22} /> Community Members
          </h1>
          <button
            className="btn-add flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <UserPlus size={16} /> Add Member
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by name or role..."
          className="search-input mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* ✅ Table layout for members */}
        <table className="members-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((member) => (
                <tr key={member.id}>
                  <td>{member.full_name}</td>
                  <td>{member.email}</td>
                  <td>{member.community_role}</td>
                  <td>{new Date(member.joined_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="delete-btn flex items-center gap-1"
                      onClick={() => handleDelete(member.user_id)}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>No members found.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Modal for adding members */}
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h2>Add Community Member</h2>
              <input
                name="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value.trim() })
                }
                placeholder="Enter User Email"
              />
              <select
                name="role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="donor">Donor</option>
                <option value="volunteer">Volunteer</option>
                <option value="admin">Admin</option>
              </select>
              <div className="modal-actions flex justify-end gap-2 mt-3">
                <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className="save-btn" onClick={handleAdd}>
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CommunityMembers;
