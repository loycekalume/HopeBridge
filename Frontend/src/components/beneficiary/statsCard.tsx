// StatsCard.tsx
import React from 'react';
import type { Stat } from '../../types/beneficiary';
import '../../styles/beneficiacyDashboard.css';

interface StatProps {
  stat: Stat;
}

const StatsCard: React.FC<StatProps> = ({ stat }) => {
  return (
    <div className="stat-card">
      <div className="card-content">
        <p>{stat.label}</p>
        <span className="value">{stat.value}</span>
      </div>
      <div className={`icon-circle ${stat.iconType}-icon`}>
        <i className={stat.iconClass}></i>
      </div>
    </div>
  );
};

export default StatsCard;