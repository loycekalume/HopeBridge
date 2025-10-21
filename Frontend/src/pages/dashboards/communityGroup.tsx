// CommunityDashboard.tsx
import React from 'react';
import type{ GroupMetric, ScheduledActivity } from '../../types/communityGroups';
import '../../styles/communityGroups.css'

// --- Mock Data ---

const groupMetrics: GroupMetric[] = [
  { id: 1, label: 'Completed Missions', value: 42, iconClass: 'fas fa-hands-helping', color: 'green' },
  { id: 2, label: 'Active Volunteers', value: 18, iconClass: 'fas fa-users', color: 'blue' },
  { id: 3, label: 'Hours Logged (Total)', value: 875, iconClass: 'fas fa-stopwatch', color: 'teal' },
  { id: 4, label: 'Next Mission In', value: '5 days', iconClass: 'fas fa-calendar-alt', color: 'warm-yellow' },
];

const scheduledActivities: ScheduledActivity[] = [
  {
    id: 'a001',
    name: 'Visit to Elderly Home: Storytelling',
    type: 'Visit',
    date: 'Oct 28, 2025',
    time: '2:00 PM',
    location: 'Sunrise Retirement Home',
    volunteers: 4,
    maxVolunteers: 8,
    status: 'Recruiting',
  },
  {
    id: 'a002',
    name: 'Basic Literacy Workshop',
    type: 'Teaching',
    date: 'Nov 02, 2025',
    time: '10:00 AM',
    location: 'Community Hall C',
    volunteers: 12,
    maxVolunteers: 12,
    status: 'Upcoming',
  },
  {
    id: 'a003',
    name: 'Park Cleanup & Greening Project',
    type: 'Service',
    date: 'Past Date',
    time: '9:00 AM',
    location: 'Central Park East',
    volunteers: 25,
    maxVolunteers: 25,
    status: 'Completed',
  },
];
// --- End Mock Data ---


// Reusable Metric Card (Adapting from Organizer/Admin styles)
const GroupMetricCard: React.FC<{ metric: GroupMetric }> = ({ metric }) => {
  const colorClass = `metric-color-${metric.color}`;
  
  // Custom logic for the Recruiting status bar
  const isRecruiting = metric.label === 'Next Mission In'; 

  return (
    <div className={`group-metric-card ${colorClass}`}>
      <div className="metric-icon-wrapper">
        <i className={metric.iconClass}></i>
      </div>
      <div className="metric-info">
        <span className="metric-value">{metric.value}</span>
        <span className="metric-label">{metric.label}</span>
      </div>
      {isRecruiting && (
        <div className="recruitment-bar">
          <div className="bar-progress" style={{ width: '40%' }}></div> {/* Example progress */}
        </div>
      )}
    </div>
  );
};

// Activity Row Component
const ActivityRow: React.FC<{ activity: ScheduledActivity }> = ({ activity }) => {
  const statusClass = activity.status.toLowerCase();
  
  const getRecruitmentStatus = () => {
    if (activity.status === 'Recruiting') {
      const needed = activity.maxVolunteers - activity.volunteers;
      return `${needed} volunteers needed`;
    }
    return null;
  };
  
  const progressPercent = (activity.volunteers / activity.maxVolunteers) * 100;

  return (
    <div className={`activity-row status-${statusClass}`}>
      <div className="activity-main-info">
        <span className={`activity-type type-${activity.type.toLowerCase()}`}>{activity.type}</span>
        <span className="activity-name">{activity.name}</span>
      </div>
      
      <div className="activity-schedule">
        <span className="schedule-date"><i className="fas fa-calendar-day"></i> {activity.date}</span>
        <span className="schedule-time"><i className="fas fa-clock"></i> {activity.time}</span>
      </div>
      
      <div className="activity-volunteers">
        <span className="volunteer-count">{activity.volunteers} / {activity.maxVolunteers}</span>
        {activity.status === 'Recruiting' && (
            <div className="recruiting-progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
        )}
        <span className="recruiting-needed">{getRecruitmentStatus()}</span>
      </div>
      
      <div className="activity-actions">
        <span className={`activity-status-tag tag-${statusClass}`}>{activity.status}</span>
        {activity.status === 'Recruiting' && (
            <button className="recruit-btn"><i className="fas fa-user-plus"></i> Recruit</button>
        )}
        {activity.status !== 'Recruiting' && (
            <button className="view-btn">View Details</button>
        )}
      </div>
    </div>
  );
};


const CommunityDashboard: React.FC = () => {
  return (
    <div className="community-page-container">
      <header className="page-header">
        <h1>"Community Name" Group Dashboard</h1>
        <p>Manage your volunteer missions, schedule activities, and track your group's impact.</p>
        <button className="new-activity-btn"><i className="fas fa-calendar-plus"></i> Schedule New Activity</button>
      </header>

      {/* Group Metrics/Impact */}
      <section className="group-metrics-section">
        {groupMetrics.map(metric => (
          <GroupMetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      {/* Scheduled Activities List */}
      <section className="scheduled-activities-section">
        <div className="section-header">
            <h2>Upcoming Missions</h2>
            <div className="activity-filters">
                <button className="filter-btn active">All</button>
                <button className="filter-btn">Recruiting</button>
                <button className="filter-btn">Completed</button>
            </div>
        </div>
        
        <div className="activity-list-header">
            <span className="col-name">Activity / Type</span>
            <span className="col-schedule">Schedule</span>
            <span className="col-volunteers">Volunteers</span>
            <span className="col-actions">Status / Action</span>
        </div>

        <div className="activity-list">
            {scheduledActivities.map(activity => (
                <ActivityRow key={activity.id} activity={activity} />
            ))}
        </div>
        
        <div className="activities-footer">
             <button className="load-more-btn">View All History</button>
        </div>
      </section>
    </div>
  );
};

export default CommunityDashboard;