// src/components/donor/contactModal.tsx
import React from "react";

export interface ContactModalProps {
  matchedDonation: {
    donor: string;
    email?: string;
    phone?: string;
    quantity?: number;
    location?: string;
    matchPercent?: string;
  };
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ matchedDonation, onClose }) => {
  const { donor, email, phone, quantity, location, matchPercent } = matchedDonation;

  const copyText = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Contact {donor}</h2>

        <div className="contact-info">
          {email && (
            <>
              <p><strong>Email:</strong> {email}</p>
              <button onClick={() => copyText(email)}>Copy Email</button>
            </>
          )}

          {phone && (
            <>
              <p><strong>Phone:</strong> {phone}</p>
              <button onClick={() => copyText(phone)}>Copy Phone</button>
            </>
          )}

          {/* Optional extras from matched donation */}
          {location && <p><strong>Location:</strong> {location}</p>}
          {quantity && <p><strong>Quantity:</strong> {quantity}</p>}
          {matchPercent && <p><strong>Match:</strong> {matchPercent}%</p>}
        </div>

        {phone && (
          <a
            className="whatsapp-btn"
            href={`https://wa.me/${phone}`}
            target="_blank"
            rel="noreferrer"
          >
            Chat via WhatsApp
          </a>
        )}

        <button className="close-modal-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ContactModal;
