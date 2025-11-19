import React, { useState } from "react";
import { apiCall } from "../../utils/api";

interface Props {
  onClose: () => void;
  donation?: any; // optional donation to prefill data
  onSubmitted?: () => void;
}

const RequestHelpModal: React.FC<Props> = ({ onClose, donation, onSubmitted }) => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    category: donation?.category || "",
    title: donation?.item_name || "",
    description: donation?.description || "",
    urgency_level: "",
    quantity: donation?.quantity || 1,
    location: donation?.location || "",
    household_size: "",
    can_pickup: false,
    needs_delivery: false,
    flexible_condition: false,
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await apiCall(
        "/api/beneficiaryProfile/requests",
        "POST",
        form,
        token || ""
      );

      if (onSubmitted) onSubmitted();
      onClose();
      alert("Request submitted successfully!");
    } catch (error: any) {
      console.error(error);
      alert("Failed to submit request.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box large" onClick={(e) => e.stopPropagation()}>

        <h2>Create Help Request</h2>

        <div className="modal-form">
          <label>Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="e.g. Food, Clothing, Education"
          />

          <label>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Short title"
          />

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Explain your need clearly"
          />

          <label>Urgency Level</label>
          <select name="urgency_level" value={form.urgency_level} onChange={handleChange}>
            <option value="">Select urgency</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
          </select>

          <label>Quantity Needed</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
          />

          <label>Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
          />

          <label>Household Size</label>
          <input
            type="number"
            name="household_size"
            value={form.household_size}
            onChange={handleChange}
          />

          <div className="checkbox-row">
            <label>
              <input
                type="checkbox"
                name="can_pickup"
                checked={form.can_pickup}
                onChange={handleChange}
              />
              I can pick up items
            </label>

            <label>
              <input
                type="checkbox"
                name="needs_delivery"
                checked={form.needs_delivery}
                onChange={handleChange}
              />
              I need delivery
            </label>

            <label>
              <input
                type="checkbox"
                name="flexible_condition"
                checked={form.flexible_condition}
                onChange={handleChange}
              />
              Flexible with item condition
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-confirm" onClick={handleSubmit}>
            Submit Request
          </button>

          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

export default RequestHelpModal;
