import React, { useState, useMemo } from "react";
import { Phone, MapPin, Tag, Users, Edit2, Mail } from "lucide-react";
import "../../styles/communityGroups.css"; 
import { apiCall } from "../../utils/api";
import { useAuth } from "../../context/authContext";

interface ProfileProps {
  name: string;
  email: string;
  city:string;
  contact: string;
  region: string;
  category: string;
   onProfileUpdated?: () => void;
}

const ProfileCard: React.FC<ProfileProps> = ({ name, email, contact,city, region, category ,  onProfileUpdated}) => {
  const { user, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name, email, contact,city, region, category });

  // Avatar background color
  const avatarColor = useMemo(() => {
    const colors = ["#E57373", "#64B5F6", "#81C784", "#FFD54F", "#BA68C8", "#4DB6AC"];
    return colors[name.charCodeAt(0) % colors.length];
  }, [name]);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user || !token) return;
    try {
      await apiCall(`/api/communityProfile/${user.user_id}/profile`, "PUT", {
        org_focus: form.category,
         email: form.email,
        phone: form.contact,
        city: form.city,
        state_region: form.region,
        about_organization: form.name,
        gov_id_url: "dummy_id_url",
        group_reg_cert_url: "dummy_cert_url",
      }, token);

      setIsEditing(false);
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  return (
    <aside className="profile-card3">
      <div className="profile-header3">
        <div className="avatar3" style={{ backgroundColor: avatarColor }}>
          {initials}
        </div>
        <h2>{name}</h2>
      </div>

      <div className="profile-details3">
        <p><Mail size={16} /> <strong>Email:</strong> {email}</p>
        <p><Phone size={16} /> <strong>Contact:</strong> {contact}</p>
        <p><MapPin size={16} /> <strong>Region:</strong> {region}</p>
        <p><MapPin size={16} /> <strong>City:</strong> {city}</p>
        <p><Tag size={16} /> <strong>Category:</strong> {category}</p>
        <p><Users size={16} /> <strong>Members:</strong> 24</p>
      </div>

      <button className="edit-btn3" onClick={() => setIsEditing(true)}>
        <Edit2 size={16} /> Edit Profile
      </button>

      {isEditing && (
        <div className="edit-modal3">
          <div className="modal-content3">
            <h3>Edit Profile</h3>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Community Name" />
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
            <input name="contact" value={form.contact} onChange={handleChange} placeholder="Contact" />
            <input name="region" value={form.region} onChange={handleChange} placeholder="Region" />
              <input name="city" value={form.city} onChange={handleChange} placeholder="City" />
            <input name="category" value={form.category} onChange={handleChange} placeholder="Category" />

            <div className="modal-actions3">
              <button onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="save-btn3" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default ProfileCard;
