// Dashboard.tsx
import React from 'react';
import StatsCard from '../../components/beneficiary/statsCard';
import MatchRequestCard from '../../components/beneficiary/matchRequestCard';
import type { Stat, Match, Request } from '../../types/beneficiary';
import '../../styles/beneficiacyDashboard.css'
import Footer from "../../components/home/footer";

const statsData: Stat[] = [
  { label: 'Active Requests', value: 3, iconClass: 'fas fa-clock', iconType: 'time' },
  { label: 'Items Received', value: 8, iconClass: 'fas fa-box', iconType: 'box' },
  { label: 'Matched Donations', value: 5, iconClass: 'fas fa-check', iconType: 'check' },
];

const aiMatchesData: Match[] = [
  {
    id: 'm1',
    name: 'Family Food Package',
    donor: 'John D.',
    initials: 'J',
    initialsColor: 'j',
    tag: 'Food',
    matchPercent: 95,
    distanceKm: 2.3,
    timePosted: 'Today',
    isMatch: true,
  },
  {
    id: 'm2',
    name: 'Educational Books & Supplies',
    donor: 'Community Center',
    initials: 'C',
    initialsColor: 'c',
    tag: 'Education',
    matchPercent: 92,
    distanceKm: 1.5,
    timePosted: 'This week',
    isMatch: true,
  },
];

const activeRequestsData: Request[] = [
  {
    id: 'r1',
    name: 'Groceries for Family',
    tag: 'Food',
    timeAgo: '2 days ago',
    status: 'Matched',
    isMatch: false,
  },
  {
    id: 'r2',
    name: 'School Supplies',
    tag: 'Education',
    timeAgo: '5 days ago',
    status: 'Pending',
    isMatch: false,
  },
];


const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        <h1>Beneficiary Dashboard</h1>
        <p>Find resources and track your requests</p>
        <button className="request-help-btn">
          <i className="fas fa-plus"></i> Request Help
        </button>
      </header>

      {/* Stats Cards Section */}
      <section className="stats-cards">
        {statsData.map(stat => (
          <StatsCard key={stat.label} stat={stat} />
        ))}
      </section>

      {/* AI-Powered Matches Section */}
      <section className="ai-matches">
        <h2>AI-Powered Matches</h2>
        <p className="section-subtitle">Donations matched to your needs</p>
        {aiMatchesData.map(match => (
          <MatchRequestCard key={match.id} data={match} />
        ))}
      </section>

      {/* Your Active Requests Section */}
      <section className="active-requests">
        <h2>Your Active Requests</h2>
        <p className="section-subtitle">Track the status of your help requests</p>
        {activeRequestsData.map(request => (
          <MatchRequestCard key={request.id} data={request} />
        ))}
      </section>
           <Footer />
    </div>
  );
};

export default Dashboard;