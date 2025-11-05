import React, { useState } from "react";
import { apiCall } from "../../utils/api";
import '../../styles/requestModal.css'

interface RequestHelpModalProps {
  onClose: () => void;
  onRequestSubmitted: () => void;
}

const RequestHelpModal: React.FC<RequestHelpModalProps> = ({
  onClose,
  onRequestSubmitted,
}) => {
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    urgency_level: "",
    quantity: 1,
    location: "",
    household_size: "",
    can_pickup: false,
    needs_delivery: false,
    flexible_condition: false,
  });

  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiCall("/api/beneficiaryProfile/requests", "POST", formData, token || "");
      onRequestSubmitted();
      onClose();
    } catch (error: any) {
      alert(error.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay1">
      <div className="modal-content1">
        <h2>Request Help</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Request title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <input
            name="category"
            placeholder="Category (e.g. Food)"
            value={formData.category}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Describe your need..."
            value={formData.description}
            onChange={handleChange}
            required
          />

          {/* Urgency level dropdown */}
          <label>
            Urgency Level:
            <select
              name="urgency_level"
              value={formData.urgency_level}
              onChange={handleChange}
              required
            >
              <option value="">Select urgency</option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
            </select>
          </label>

          <input
            type="number"
            name="quantity"
            min="1"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
          />
          <input
            type="number"
            name="household_size"
            min="1"
            placeholder="Household size"
            value={formData.household_size}
            onChange={handleChange}
          />
          <input
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            required
          />

          <label>
            <input
              type="checkbox"
              name="can_pickup"
              checked={formData.can_pickup}
              onChange={handleChange}
            />{" "}
            Can pick up
          </label>

          <label>
            <input
              type="checkbox"
              name="needs_delivery"
              checked={formData.needs_delivery}
              onChange={handleChange}
            />{" "}
            Needs delivery
          </label>

          <label>
            <input
              type="checkbox"
              name="flexible_condition"
              checked={formData.flexible_condition}
              onChange={handleChange}
            />{" "}
            Accept flexible condition (e.g., used items)
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>

        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default RequestHelpModal;
