import React from "react";

const CTA: React.FC = () => (
  <section className="cta" id="about">
    <div className="container">
      <div className="cta-content">
        <h2 className="cta-title">Ready to Make a Difference?</h2>
        <p className="cta-subtitle">
          Join thousands of donors and beneficiaries building stronger communities together.
        </p>
        <div className="cta-buttons">
          <button className="btn btn-white">
            <span>Start Donating</span>
            <i className="fas fa-arrow-right"></i>
          </button>
          <button className="btn btn-outline-white">
            <span>Learn About Our Impact</span>
          </button>
        </div>
      </div>
    </div>
  </section>
);

export default CTA;
