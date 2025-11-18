import React, { useState } from "react";
import "../../styles/beneficiacyDashboard.css";
import { apiCall } from "../../utils/api";

interface EditProfileModalProps {
  onClose: () => void;
  user: any;
  token: string;
  onUpdated: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  onClose,
  user,
  token,
  onUpdated,
}) => {
  const [fullName, setFullName] = useState(user.full_name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [city, setCity] = useState(user.city || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiCall(
        `/api/beneficiaryProfile/profile/`,
        "PUT",
        { full_name: fullName, phone, city },
        token
      );

      // update localStorage
      const updatedUser = { ...user, full_name: fullName, phone, city };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      onUpdated();
      onClose();
    } catch (error: any) {
      console.error("Update failed:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal">
        <h2>Edit Profile</h2>

        <form onSubmit={handleSubmit} className="profile-form">
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <label>Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label>City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
