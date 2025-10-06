import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faBox,
  faBookOpen,
  faHandsHelping,
} from "@fortawesome/free-solid-svg-icons";

const WhatWeShare: React.FC = () => {
  const shares = [
    {
      icon: faHeart,
      color: "#f97316", 
      title: "Food & Essentials",
      description: "Share meals and daily necessities with those in need",
    },
    {
      icon: faBox,
      color: "#3b82f6", 
      title: "Clothing & Items",
      description: "Donate clothes, furniture, and household items",
    },
    {
      icon: faBookOpen,
      color: "#22c55e", 
      title: "Education & Scholarships",
      description: "Support learning and educational opportunities",
    },
    {
      icon: faHandsHelping,
      color: "#2563eb", 
      title: "Services & Support",
      description: "Offer skills, mentorship, and professional services",
    },
  ];

  return (
    <section className="what-we-share">
      <div className="container">
        <h2 className="section-title">What We Share</h2>
        <p className="section-subtitle">
          From essentials to opportunities, we connect resources that make a
          difference
        </p>

        <div className="share-grid">
          {shares.map((item, index) => (
            <div key={index} className="share-card">
              <div
                className="share-icon"
                style={{ backgroundColor: `${item.color}15` }} 
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  style={{ color: item.color, fontSize: "28px" }}
                />
              </div>
              <h3 className="share-title">{item.title}</h3>
              <p className="share-description">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeShare;
