// AdminStatCard.tsx
import React from 'react';
import type{ AdminStat } from '../../types/admin';
import '../../styles/admin.css'

interface AdminStatCardProps {
  stat: AdminStat;
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({ stat }) => {
  // Map detail color to CSS class
  const detailClass = stat.primaryDetailColor === 'success' 
    ? 'sub-detail-primary' 
    : stat.primaryDetailColor === 'danger' ? 'sub-detail-primary needs-review' : 'sub-detail-primary success-rate';

  return (
    <div className={`metric-card ${stat.iconBgColor}`}>
      <div className="card-icon">
        <i className={stat.iconClass}></i>
      </div>
      <p className="main-value">{stat.mainValue}</p>
      <p className="main-label">{stat.mainLabel}</p>
      <p className={detailClass}>{stat.primaryDetail}</p>
      <p className="sub-detail-secondary">{stat.secondaryDetail}</p>
    </div>
  );
};

export default AdminStatCard;