import React from "react";
import "../../styles/donorDashboard.css";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  email: string;
  phone: string;
}

const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  name,
  email,
  phone,
}) => {
  if (!isOpen) return null;

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  return (
    <div className="contact-modal-overlay">
      <div className="contact-modal">
        <h2>Contact {name}</h2>

        <div className="contact-info">
          <p><strong>Email:</strong> {email}</p>
          <button onClick={() => copyText(email)}>Copy Email</button>

          <p><strong>Phone:</strong> {phone}</p>
          <button onClick={() => copyText(phone)}>Copy Phone</button>
        </div>

        <a
          className="whatsapp-btn"
          href={`https://wa.me/${phone}`}
          target="_blank"
          rel="noreferrer"
        >
          Chat via WhatsApp
        </a>

        <button className="close-modal-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ContactModal;
