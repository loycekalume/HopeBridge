import React from "react";
import "../../styles/beneficiaryProfileCard.css";

interface Props {
  profile: {
    full_name: string;
    email: string;
    phone?: string;
    city?: string;
  };
  onEdit?: () => void;
}

const ProfileCard: React.FC<Props> = ({ profile, onEdit }) => {
  const initials = profile.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0].toUpperCase())
        .join("")
    : "?";

  return (
    <div className="profile-card">
      {/* Avatar */}
      <div className="profile-avatar">{initials}</div>

      {/* Name */}
      <h3 className="profile-name">{profile.full_name}</h3>

      {/* Info */}
      <div className="profile-info">
        <p><i className="fas fa-envelope"></i> {profile.email}</p>
        {profile.phone && <p><i className="fas fa-phone"></i> {profile.phone}</p>}
        {profile.city && <p><i className="fas fa-map-marker-alt"></i> {profile.city}</p>}
      </div>

      {/* Button */}
      <button className="profile-edit-btn" onClick={onEdit}>
        <i className="fas fa-edit"></i> Edit Profile
      </button>
    </div>
  );
};

export default ProfileCard;
