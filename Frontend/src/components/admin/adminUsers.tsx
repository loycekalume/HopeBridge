import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/sidebar";
import { apiCall } from "../../utils/api";
import "../../styles/admin.css";

interface User {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiCall("/api/users", "GET");
      setUsers(res.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = async (user_id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await apiCall(`/api/users/${user_id}`, "DELETE");
      setUsers(users.filter((u) => u.user_id !== user_id));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleFlag = async (user_id: string) => {
    alert(`User ${user_id} has been flagged for review.`);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    try {
      await apiCall(`/api/users/${selectedUser.user_id}`, "PUT", selectedUser);
      setUsers(
        users.map((u) =>
          u.user_id === selectedUser.user_id ? selectedUser : u
        )
      );
      setShowModal(false);
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  // Search filter
  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIdx = (currentPage - 1) * usersPerPage;
  const currentUsers = filteredUsers.slice(startIdx, startIdx + usersPerPage);

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="admin-users">
      <AdminSidebar />
      <main className="admin-users-main">
        <h1>Manage Users</h1>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => {
              const joinedDate = new Date(user.created_at);
              const formattedDate = isNaN(joinedDate.getTime())
                ? "N/A"
                : joinedDate.toLocaleDateString();

              return (
                <tr key={user.user_id}>
                  <td>{user.full_name || "N/A"}</td>
                  <td>{user.email || "N/A"}</td>
                  <td>{user.role || "N/A"}</td>
                  <td>{formattedDate}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-flag"
                      onClick={() => handleFlag(user.user_id)}
                    >
                      🚩 Flag
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(user.user_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </main>

      {/* Edit Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay4">
          <div className="modal4">
            <h2>Edit User</h2>
            <label>
              Full Name
              <input
                type="text"
                value={selectedUser.full_name}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, full_name: e.target.value })
                }
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={selectedUser.email}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, email: e.target.value })
                }
              />
            </label>
            <label>
              Role
              <select
                value={selectedUser.role}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, role: e.target.value })
                }
              >
                <option value="admin">Admin</option>
                <option value="community">Community</option>
                <option value="volunteer">Volunteer</option>
                <option value="donor">Donor</option>
                <option value="beneficiary">Beneficiary</option>
              </select>
            </label>

            <div className="modal-actions4">
              <button onClick={handleSave} className="btn-save">
                Save
              </button>
              <button onClick={() => setShowModal(false)} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
