import React, { useEffect, useState } from "react";
import OrganizerLayout from "../../Layouts/organizerLayout";
import { apiCall } from "../../utils/api";
import { useAuth } from "../../context/authContext";
import "../../styles/organizer.css";

type Event = {
  event_id: number;
  event_name: string;
  community_name: string;
  date: string;
  location: string;
  status: "Upcoming" | "Completed";
  volunteers: number;
  beneficiaries_served?: string;
  report_url?: string;
};

const CommunityEvents: React.FC = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch organizer profile for sidebar
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

  // Fetch events (upcoming + completed)
  useEffect(() => {
    if (!token) return;

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await apiCall("/api/organizerProfile/events", "GET", undefined, token ?? undefined);
        const data = res.data || res;
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [token]);

  // Join event handler
  const handleJoin = async (eventId: number) => {
    try {
      await apiCall(`/api/organizerProfile/events/${eventId}/join`, "POST", undefined, token ?? undefined);
      setEvents((prev) =>
        prev.map((e) =>
          e.event_id === eventId ? { ...e, volunteers: e.volunteers + 1 } : e
        )
      );
      alert("You have successfully joined this community event!");
    } catch (err: any) {
      console.error("Error joining event:", err);
      alert(err?.message || "Failed to join event");
    }
  };

  // Filter events
  const upcomingEvents = events.filter((e) => e.status === "Upcoming");
  const completedEvents = events.filter((e) => e.status === "Completed");

  return (
    <OrganizerLayout profile={profile}>
      <main className="main-content2">
        <h2>Community Events</h2>

        {/* Overview Section */}
        <section className="overview2">
          <div className="card2">
            <h3>Upcoming Events</h3>
            <p>{upcomingEvents.length}</p>
          </div>
          <div className="card2">
            <h3>Completed Events</h3>
            <p>{completedEvents.length}</p>
          </div>
          <div className="card2">
            <h3>Communities Involved</h3>
            <p>{new Set(events.map((e) => e.community_name)).size}</p>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="table-section2">
          <h2>Upcoming Community Events</h2>
          <table>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Community</th>
                <th>Date</th>
                <th>Location</th>
                <th>Status</th>
                <th>Volunteers</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}>Loading events...</td></tr>
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.map((e) => (
                  <tr key={e.event_id}>
                    <td>{e.event_name}</td>
                    <td>{e.community_name}</td>
                    <td>{new Date(e.date).toLocaleDateString()}</td>
                    <td>{e.location}</td>
                    <td><span className="status upcoming">Upcoming</span></td>
                    <td>{e.volunteers}</td>
                    <td>
                      <button
                        className="approve"
                        onClick={() => handleJoin(e.event_id)}
                      >
                        Join
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7}>No upcoming events</td></tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Completed Events */}
        <section className="table-section2">
          <h2>Completed Events</h2>
          <table>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Community</th>
                <th>Date</th>
                <th>Beneficiaries Served</th>
                <th>Volunteers</th>
                <th>Report</th>
              </tr>
            </thead>
            <tbody>
              {completedEvents.length > 0 ? (
                completedEvents.map((e) => (
                  <tr key={e.event_id}>
                    <td>{e.event_name}</td>
                    <td>{e.community_name}</td>
                    <td>{new Date(e.date).toLocaleDateString()}</td>
                    <td>{e.beneficiaries_served || "N/A"}</td>
                    <td>{e.volunteers}</td>
                    <td>
                      {e.report_url ? (
                        <a href={e.report_url} target="_blank" rel="noreferrer">
                          View Report
                        </a>
                      ) : (
                        "No report"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6}>No completed events</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </OrganizerLayout>
  );
};

export default CommunityEvents;
