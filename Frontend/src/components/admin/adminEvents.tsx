import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/sidebar";
import { apiCall } from "../../utils/api";
import "../../styles/admin.css";

interface Event {
  event_id: string | number;
  created_by: string | number;
  title: string;
  date: string;
  category: string;
  description: string;
  created_at: string;
  updated_at: string;
  community_id: string | number | null;
}

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 10;

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      const res = await apiCall("/api/events", "GET");
      setEvents(res || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Safe filtering
  const filteredEvents = events.filter(
    (e) =>
      (e.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleDelete = async (event_id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await apiCall(`/api/events/${event_id}`, "DELETE");
      setEvents(events.filter((e) => e.event_id !== event_id));
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const handleFlag = async (event_id: string | number) => {
    alert(`Event ${event_id} has been flagged for review.`);
  };

  const handleSave = async () => {
    if (!selectedEvent) return;

    try {
      await apiCall(`/api/events/${selectedEvent.event_id}`, "PUT", selectedEvent);
      setEvents(
        events.map((e) =>
          e.event_id === selectedEvent.event_id ? selectedEvent : e
        )
      );
      setShowModal(false);
    } catch (err) {
      console.error("Error updating event:", err);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIdx = (currentPage - 1) * eventsPerPage;
  const currentEvents = filteredEvents.slice(startIdx, startIdx + eventsPerPage);

  if (loading) return <div className="loading">Loading events...</div>;

  return (
    <div className="admin-events">
      <AdminSidebar />
      <main className="admin-users-main">
        <h1>Manage Events</h1>

        <input
          type="text"
          placeholder="Search by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <table className="users-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEvents.map((event) => (
              <tr key={event.event_id}>
                <td>{event.title}</td>
                <td>{new Date(event.date).toLocaleDateString()}</td>
                <td>{event.category}</td>
                <td  className="description">{event.description}</td>
                <td>{new Date(event.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(event)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-flag"
                    onClick={() => handleFlag(event.event_id)}
                  >
                    🚩 Flag
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(event.event_id)}
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
      {showModal && selectedEvent && (
        <div className="modal-overlay4">
          <div className="modal4">
            <h2>Edit Event</h2>
            <label>
              Title
              <input
                type="text"
                value={selectedEvent.title}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, title: e.target.value })
                }
              />
            </label>
            <label>
              Date
              <input
                type="date"
                value={selectedEvent.date.split("T")[0]} // format for date input
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, date: e.target.value })
                }
              />
            </label>
            <label>
              Category
              <input
                type="text"
                value={selectedEvent.category}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, category: e.target.value })
                }
              />
            </label>
            <label>
              Description
              <textarea
                value={selectedEvent.description}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, description: e.target.value })
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

export default AdminEvents;
