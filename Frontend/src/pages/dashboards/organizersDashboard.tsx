import React from 'react';
import type{ OrganizerStat, VerificationTask } from '../../types/organizer';
import '../../styles/organizer.css'


// --- Mock Data ---

const organizerStats: OrganizerStat[] = [
  { id: 1, label: 'Tasks Pending', value: 24, iconClass: 'fas fa-clipboard-list', bgColor: 'blue' },
  { id: 2, label: 'Today\'s Deliveries', value: 7, iconClass: 'fas fa-shipping-fast', bgColor: 'green' },
  { id: 3, label: 'Items Flagged', value: 3, iconClass: 'fas fa-exclamation-triangle', bgColor: 'yellow' },
  { id: 4, label: 'Avg. Verification Time', value: '4.2 hrs', iconClass: 'fas fa-clock', bgColor: 'purple' },
];

const verificationTasks: VerificationTask[] = [
  {
    id: 't001',
    type: 'Donation',
    title: 'Food Baskets (20kg)',
    priority: 'High',
    location: '1.2 km away',
    timeRemaining: '2 hours',
    status: 'Pending Verification',
    donorName: 'Sarah K.',
  },
  {
    id: 't002',
    type: 'Distribution',
    title: 'School Supplies to City Shelter',
    priority: 'Medium',
    location: '3.5 km away',
    timeRemaining: '4 hours',
    status: 'Ready for Pickup',
    beneficiaryName: 'City Youth Center',
  },
  {
    id: 't003',
    type: 'User',
    title: 'New Beneficiary Registration',
    priority: 'Low',
    location: 'Remote',
    timeRemaining: '1 day',
    status: 'New',
  },
];
// --- End Mock Data ---


// Reusable Stat Card Component (Inline for simplicity, separate to a file in production)
const OrganizerStatCard: React.FC<{ stat: OrganizerStat }> = ({ stat }) => {
  const bgColorClass = `stat-${stat.bgColor}`;
  return (
    <div className={`organizer-stat-card ${bgColorClass}`}>
      <div className="stat-icon-wrapper">
        <i className={stat.iconClass}></i>
      </div>
      <div className="stat-info">
        <span className="stat-value">{stat.value}</span>
        <span className="stat-label">{stat.label}</span>
      </div>
    </div>
  );
};

// Verification Task Row (Inline for simplicity)
const VerificationTaskRow: React.FC<{ task: VerificationTask }> = ({ task }) => {
  const statusClass = task.status.toLowerCase().replace(/\s/g, '-');
  const priorityClass = `priority-${task.priority.toLowerCase()}`;
  
  const getDetails = () => {
    if (task.type === 'Donation') {
      return `Donor: ${task.donorName || 'N/A'}`;
    }
    if (task.type === 'Distribution') {
      return `To: ${task.beneficiaryName || 'N/A'}`;
    }
    return `Type: ${task.type}`;
  };
  
  return (
    <div className="task-row">
      <div className={`task-priority ${priorityClass}`}></div>
      <div className="task-main-info">
        <span className="task-title">{task.title}</span>
        <span className="task-details">{getDetails()}</span>
      </div>
      <div className="task-metadata">
        <span className="metadata-item location-item"><i className="fas fa-location-dot"></i> {task.location}</span>
        <span className="metadata-item time-item"><i className="fas fa-hourglass-half"></i> {task.timeRemaining}</span>
      </div>
      <span className={`task-status ${statusClass}`}>{task.status}</span>
      <button className="view-task-btn">Review <i className="fas fa-arrow-right"></i></button>
    </div>
  );
};


const OrganizerDashboard: React.FC = () => {
  return (
    <div className="organizer-page-container">
      <header className="page-header">
        <h1>Organizer Verification Dashboard</h1>
        <p>Your hub for ensuring trust and efficient resource movement in the community.</p>
        <button className="new-report-btn"><i className="fas fa-plus"></i> Submit New Report</button>
      </header>

      {/* Organizer Stats/KPIs */}
      <section className="organizer-stats-section">
        {organizerStats.map(stat => (
          <OrganizerStatCard key={stat.id} stat={stat} />
        ))}
      </section>

      {/* Verification Tasks Table */}
      <section className="verification-tasks-section">
        <div className="section-header">
            <h2>Verification Queue <span className="task-count">({verificationTasks.length})</span></h2>
            <div className="task-filters">
                <button className="filter-btn active">All Tasks</button>
                <button className="filter-btn">High Priority</button>
                <button className="filter-btn">Distribution</button>
            </div>
        </div>
        
        <div className="task-list-header task-row">
            <span>Task Title</span>
            <span>Location / Time</span>
            <span>Status</span>
            <span>Action</span>
        </div>

        <div className="task-list">
            {verificationTasks.map(task => (
                <VerificationTaskRow key={task.id} task={task} />
            ))}
        </div>

        <div className="tasks-footer">
            <button className="load-more-btn">Load More Tasks</button>
        </div>
      </section>
    </div>
  );
};

export default OrganizerDashboard;