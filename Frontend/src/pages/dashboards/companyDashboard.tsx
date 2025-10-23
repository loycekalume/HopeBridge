// CompanyDashboard.tsx
import React from 'react';
import { useAuth } from '../../context/authContext';
import '../../styles/companyDashboard.css'



// --- Mock Data (Example Metrics) ---
const companyMetrics = [
  { id: 1, label: 'Resources Donated', value: '45,000 kg', iconClass: 'fas fa-box', bgColor: 'blue' },
  { id: 2, label: 'Employee Volunteers', value: 128, iconClass: 'fas fa-hands-helping', bgColor: 'green' },
  { id: 3, label: 'Total Value Given', value: '$35,000', iconClass: 'fas fa-dollar-sign', bgColor: 'teal' },
  { id: 4, label: 'Open Sponsorships', value: 3, iconClass: 'fas fa-star', bgColor: 'purple' },
];

// Placeholder for a reusable stat card component (similar to what we built for Admin/Organizer)
const CompanyStatCard: React.FC<any> = ({ stat }) => (
    <div className={`company-stat-card stat-${stat.bgColor}`}>
        <div className="card-icon"><i className={stat.iconClass}></i></div>
        <div className="card-info">
            <span className="value">{stat.value}</span>
            <span className="label">{stat.label}</span>
        </div>
    </div>
);


export default function CompanyDashboard() {
    const { user } = useAuth();
    
    // Fallback names for a cleaner greeting
    const companyName = user?.company_name || user?.full_name || 'Corporate Partner';

    // Basic access check (Optional, but good practice if AuthGuard isn't used)
    if (!user || user.role !== 'company') {
        // A more robust check should be done via a router guard
        return <div>Access Denied. Please log in as a Company.</div>; 
    }

    return (
        <div className="company-dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome, {companyName}!</h1>
                <p>Track your impact, manage employee engagement, and view sponsorship opportunities.</p>
                <button className="cta-button"><i className="fas fa-plus"></i> Initiate New Donation</button>
            </header>

            {/* Impact Metrics Section */}
            <section className="impact-metrics-section">
                <h2>Corporate Impact Snapshot</h2>
                <div className="metrics-grid">
                    {companyMetrics.map(stat => (
                        <CompanyStatCard key={stat.id} stat={stat} />
                    ))}
                </div>
            </section>

            {/* Donation History / Admin Tools (Placeholder) */}
            <section className="admin-tools-section">
                <h2>Recent Activity</h2>
                {/* Detailed table of recent major donations or active employee volunteer hours */}
                <div className="recent-activity-list">
                    <p>Recent donations and volunteer hours will appear here after your first submission.</p>
                </div>
            </section>

        </div>
    );
}