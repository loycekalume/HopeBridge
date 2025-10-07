import React from "react";
import "../../styles/donorDashboard.css";
import Footer from "../../components/home/footer";


const DonorDashboard: React.FC = () => {
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <h2>Donor Dashboard</h2>
          <p>Track your donations and impact</p>
          <button className="btn-donation">
            <i className="fas fa-plus"></i> Post New Donation
          </button>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-card">
            <i className="fas fa-box"></i>
            <h3>12</h3>
            <p>Total Donations</p>
          </div>
          <div className="stat-card">
            <i className="fas fa-users"></i>
            <h3>28</h3>
            <p>Beneficiaries Helped</p>
          </div>
          <div className="stat-card">
            <i className="fas fa-chart-line"></i>
            <h3>98%</h3>
            <p>Impact Score</p>
          </div>
        </div>

        {/* Recent Donations */}
        <div className="recent-donations">
          <h3>Recent Donations</h3>
          <p>Track your donation history and status</p>

          <div className="donation-card">
            <div className="donation-info">
              <h4>Winter Clothing Bundle</h4>
              <p>
                <i className="fas fa-tshirt"></i> Clothes • 2 days ago • Sarah M.
              </p>
            </div>
            <div className="donation-actions">
              <span className="status matched">Matched</span>
              <button className="btn-details">View Details</button>
            </div>
          </div>

          <div className="donation-card">
            <div className="donation-info">
              <h4>Educational Books</h4>
              <p>
                <i className="fas fa-book"></i> Education • 3 days ago • Awaiting match
              </p>
            </div>
            <div className="donation-actions">
              <span className="status pending">Pending</span>
              <button className="btn-details">View Details</button>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="action-section">
          <div className="action-card">
            <i className="fas fa-plus-circle"></i>
            <h4>Post a Donation</h4>
            <p>Share resources with those in need</p>
            <button className="btn-secondary">Get Started</button>
          </div>
          <div className="action-card">
            <i className="fas fa-chart-bar"></i>
            <h4>View Impact Report</h4>
            <p>See how your donations are making a difference</p>
            <button className="btn-secondary">View Report</button>
          </div>
        </div>
      </div>

      
      <Footer />
    </div>
  );
};

export default DonorDashboard;
