import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="hero" id="home">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <div className="hero-badge">
          <i className="fas fa-heart"></i>
          <span>Join 5,000+ donors making a difference</span>
        </div>
        <h1 className="hero-title">
          Bridging Resources.<br />
          <span className="gradient-text">Building Hope.</span>
        </h1>
        <p className="hero-subtitle">
          Connect with your community to share and receive essential resources like food,
          clothing, scholarships, and services.
        </p>
        <div className="hero-buttons">
          <button className="btn btn-cta btn-green">
            <span>Donate Now</span>
            <i className="fas fa-arrow-right"></i>
          </button>
          <button className="btn btn-cta btn-outline">
            <span>Request Help</span>
          </button>
        </div>
      </div>
      <div className="hero-wave">
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#ffffff"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
