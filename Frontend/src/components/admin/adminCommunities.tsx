import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/sidebar";
import { apiCall } from "../../utils/api";
import "../../styles/admin.css";

interface Community {
    user_id: string;
    full_name: string;
    email: string;
    org_focus: string;
    city: string;
    state_region: string;
    created_at: string;
}

const AdminCommunities: React.FC = () => {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const communitiesPerPage = 10;

    // Fetch communities
    const fetchCommunities = async () => {
        try {
            const res = await apiCall("/api/communityProfile/community", "GET");
            setCommunities(res.communities || []);
        } catch (err) {
            console.error("Error fetching communities:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommunities();
    }, []);

    // Filter by search
    const filteredCommunities = communities.filter(
        (c) =>
            c.full_name.toLowerCase().includes(search.toLowerCase()) ||
            c.org_focus.toLowerCase().includes(search.toLowerCase()) ||
            c.city.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (community: Community) => {
        setSelectedCommunity(community);
        setShowModal(true);
    };

    const handleDelete = async (user_id: string) => {
        if (!window.confirm("Are you sure you want to delete this community?")) return;
        try {
            await apiCall(`/api/users/${user_id}`, "DELETE");
            setCommunities(communities.filter((c) => c.user_id !== user_id));
        } catch (err) {
            console.error("Error deleting community:", err);
        }
    };

    const handleFlag = async (user_id: string) => {
        alert(`Community ${user_id} has been flagged for review.`);
    };

    const handleSave = async () => {
        if (!selectedCommunity) return;

        try {
            await apiCall(`/api/users/${selectedCommunity.user_id}`, "PUT", selectedCommunity);
            setCommunities(
                communities.map((c) =>
                    c.user_id === selectedCommunity.user_id ? selectedCommunity : c
                )
            );
            setShowModal(false);
        } catch (err) {
            console.error("Error updating community:", err);
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredCommunities.length / communitiesPerPage);
    const startIdx = (currentPage - 1) * communitiesPerPage;
    const currentCommunities = filteredCommunities.slice(startIdx, startIdx + communitiesPerPage);

    if (loading) return <div className="loading">Loading communities...</div>;

    return (
        <div className="admin-communities">
            <AdminSidebar />
            <main className="admin-users-main">
                <h1>Manage Communities</h1>

                <input
                    type="text"
                    placeholder="Search by name, focus, or city..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />

                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Focus</th>
                            <th>City</th>
                            <th>Region</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCommunities.map((community) => (
                            <tr key={community.user_id}>
                                <td>{community.full_name}</td>
                                <td>{community.email}</td>
                                <td>{community.org_focus}</td>
                                <td>{community.city}</td>
                                <td>{community.state_region}</td>
                                <td>{community.created_at ? new Date(community.created_at).toLocaleDateString() : "N/A"}</td>

                                <td>
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEdit(community)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-flag"
                                        onClick={() => handleFlag(community.user_id)}
                                    >
                                        🚩 Flag
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(community.user_id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Controls */}
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
            {showModal && selectedCommunity && (
                <div className="modal-overlay4">
                    <div className="modal4">
                        <h2>Edit Community</h2>
                        <label>
                            Name
                            <input
                                type="text"
                                value={selectedCommunity.full_name}
                                onChange={(e) =>
                                    setSelectedCommunity({
                                        ...selectedCommunity,
                                        full_name: e.target.value,
                                    })
                                }
                            />
                        </label>
                        <label>
                            Email
                            <input
                                type="email"
                                value={selectedCommunity.email}
                                onChange={(e) =>
                                    setSelectedCommunity({
                                        ...selectedCommunity,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </label>
                        <label>
                            Focus
                            <input
                                type="text"
                                value={selectedCommunity.org_focus}
                                onChange={(e) =>
                                    setSelectedCommunity({
                                        ...selectedCommunity,
                                        org_focus: e.target.value,
                                    })
                                }
                            />
                        </label>
                        <label>
                            City
                            <input
                                type="text"
                                value={selectedCommunity.city}
                                onChange={(e) =>
                                    setSelectedCommunity({
                                        ...selectedCommunity,
                                        city: e.target.value,
                                    })
                                }
                            />
                        </label>
                        <label>
                            Region
                            <input
                                type="text"
                                value={selectedCommunity.state_region}
                                onChange={(e) =>
                                    setSelectedCommunity({
                                        ...selectedCommunity,
                                        state_region: e.target.value,
                                    })
                                }
                            />
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

export default AdminCommunities;
