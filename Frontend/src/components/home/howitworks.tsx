import React from "react";

const steps = [
  {
    num: "1",
    icon: "fa-user-plus",
    title: "Sign Up",
    desc: "Create your account as a donor or beneficiary in minutes",
  },
  {
    num: "2",
    icon: "fa-box-open",
    title: "Offer or Request",
    desc: "Post donations or request help for specific needs",
  },
  {
    num: "3",
    icon: "fa-magic",
    title: "Get Matched",
    desc: "Our AI connects donors with beneficiaries automatically",
  },
];

const HowItWorks: React.FC = () => (
  <section className="how-it-works" id="how-it-works">
    <div className="container">
      <div className="section-header">
        <h2 className="section-title">
          How <span className="gradient-text">HopeBridge</span> Works
        </h2>
        <p className="section-subtitle">
          Getting started is simple. Connect with your community in three easy steps.
        </p>
      </div>

      <div className="steps-grid">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <div className="step-card">
              <div className="step-number">{step.num}</div>
              <div className="step-icon-wrapper">
                <i className={`fas ${step.icon}`}></i>
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="step-connector">
                <i className="fas fa-arrow-right"></i>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
