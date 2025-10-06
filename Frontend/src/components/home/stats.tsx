import React from "react";

const stats = [
  { icon: "fa-gift", value: "5,000+", label: "Donations Made", color: "primary" },
  { icon: "fa-users", value: "3,200+", label: "Beneficiaries Supported", color: "secondary" },
  { icon: "fa-check-circle", value: "150+", label: "Verified Partners", color: "accent" },
  { icon: "fa-chart-line", value: "98%", label: "Success Rate", color: "success" },
];

const Stats: React.FC = () => (
  <section className="stats">
    <div className="container">
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon stat-icon-${s.color}`}>
              <i className={`fas ${s.icon}`}></i>
            </div>
            <h3 className="stat-value">{s.value}</h3>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Stats;
