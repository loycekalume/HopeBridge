import React, { useState, useEffect } from "react";
import Sidebar from "../../components/community/sidebar";
import { Plus, Edit2, Trash2 } from "lucide-react";
import "../../styles/communityGroups.css";
import { useAuth } from "../../context/authContext";
import { apiCall } from "../../utils/api";

interface Event {
  event_id: number;       // backend field
  id?: number;            // local mapping for convenience
  title: string;
  date: string;
  category: string;
  description: string;
  created_by?: number;
}

const ManageEvents: React.FC = () => {
  const { user, token } = useAuth();
  const safeToken = token ?? undefined;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState({ title: "", date: "", category: "", description: "" });
  const [search, setSearch] = useState("");

  // Fetch events from backend
  const fetchEvents = async () => {
    if (!user || !safeToken) return;
    try {
      const data = await apiCall("/api/events", "GET", undefined, safeToken);
      // map event_id to id for frontend
      const normalized = data.map((e: Event) => ({ ...e, id: e.event_id }));
      setEvents(normalized);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!safeToken || !user) return;

    const payload = { ...form, created_by: user.user_id, community_id: user.user_id };
 // include logged-in user

    try {
      if (editingEvent) {
        await apiCall(`/api/events/${editingEvent.event_id}`, "PUT", payload, safeToken);
      } else {
        await apiCall("/api/events", "POST", payload, safeToken);
      }

      setIsModalOpen(false);
      setEditingEvent(null);
      setForm({ title: "", date: "", category: "", description: "" });
      fetchEvents();
    } catch (err) {
      console.error("Failed to save event:", err);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      date: event.date,
      category: event.category,
      description: event.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!safeToken || !confirm("Are you sure you want to delete this event?")) return;
    try {
      await apiCall(`/api/events/${id}`, "DELETE", undefined, safeToken);
      fetchEvents();
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading">Loading events...</div>;

  return (
    <div className="dashboard-container3">
      <Sidebar />
      <main className="main-content3">
        <div className="header flex justify-between items-center mb-4">
          <h1>Manage Events</h1>
          <button className="btn-add flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add Event
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by title or category..."
          className="search-input mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="events-grid">
          {filteredEvents.map((event) => (
            <div key={event.id} className="event-card">
              <h3>{event.title}</h3>
              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              <p><strong>Category:</strong> {event.category}</p>
              <p>{event.description}</p>
              <div className="event-actions flex gap-2 mt-2">
                <button className="edit-btn" onClick={() => handleEdit(event)}><Edit2 size={14} /></button>
                <button className="delete-btn" onClick={() => handleDelete(event.id!)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {filteredEvents.length === 0 && <p>No events found.</p>}
        </div>

        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h2>{editingEvent ? "Edit Event" : "Add Event"}</h2>
              <input name="title" value={form.title} onChange={handleChange} placeholder="Event Title" />
              <input type="date" name="date" value={form.date} onChange={handleChange} />
              <input name="category" value={form.category} onChange={handleChange} placeholder="Category" />
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" />
              <div className="modal-actions flex justify-end gap-2 mt-2">
                <button onClick={() => { setIsModalOpen(false); setEditingEvent(null); }}>Cancel</button>
                <button className="save-btn" onClick={handleSave}>{editingEvent ? "Update" : "Save"}</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageEvents;
