// UserTableRow.tsx
import React, { useState } from 'react';
import type{ User } from '../../types/admin';
import ActionMenu from './actionMenu';
import '../../styles/admin.css'

interface UserTableRowProps {
  user: User;
  onViewProfile: (id: number) => void;
  onSuspendUser: (id: number) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ user, onViewProfile, onSuspendUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const ellipsisRef = React.useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const roleTagClass = user.role === 'Donor' ? 'donor-tag' : 'beneficiary-tag';
  const statusTagClass = user.status === 'Active' ? 'active-tag' : 'suspended-tag';

  return (
    <tr>
      <td className="user-info">
        <span className="user-name">
          {user.name} 
          {user.isVerified && <i className="fas fa-check-circle verified-icon"></i>}
        </span>
        <span className="user-email">{user.email}</span>
      </td>
      <td>
        <span className={`role-tag ${roleTagClass}`}>{user.role}</span>
      </td>
      <td>
        <span className={`status-tag ${statusTagClass}`}>{user.status}</span>
      </td>
      <td className="activity-details">
        <span className="main-activity">{user.activityMain}</span>
        <span className="sub-activity">{user.activitySub}</span>
      </td>
      <td>{user.joinedDate}</td>
      <td className="actions-cell">
        <div ref={ellipsisRef} onClick={toggleMenu} className="action-menu-trigger">
            <i className="fas fa-ellipsis-v action-menu"></i>
        </div>
        {isMenuOpen && (
          <ActionMenu
            userId={user.id}
            onClose={() => setIsMenuOpen(false)}
            onViewProfile={onViewProfile}
            onSuspendUser={onSuspendUser}
          />
        )}
      </td>
    </tr>
  );
};

export default UserTableRow;